/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/documents.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, DocumentType } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// -------------------------
// Validation Schemas
// -------------------------
const uploadDocumentSchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().min(1, "Document name is required"),
  type: z.enum([
    "LEASE",
    "AMENDMENT",
    "NOTICE",
    "INSPECTION_REPORT",
    "RECEIPT",
    "TAX_DOCUMENT",
    "INSURANCE",
    "WARRANTY",
    "W9",
    "BANK_STATEMENT",
    "OTHER",
  ]),
  description: z.string().optional(),
  file: z.object({
    base64: z.string(),
    filename: z.string(),
    mimetype: z.string(),
    size: z.number(),
  }),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

const updateDocumentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

const createDocumentSchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().min(1, "Document name is required"),
  type: z.enum([
    "LEASE",
    "AMENDMENT",
    "NOTICE",
    "INSPECTION_REPORT",
    "RECEIPT",
    "TAX_DOCUMENT",
    "INSURANCE",
    "WARRANTY",
    "W9",
    "BANK_STATEMENT",
    "OTHER",
  ]),
  description: z.string().optional(),
  fileUrl: z.string().min(1, "File URL is required"),
  storageProvider: z.string().default("local"),
  storageKey: z.string().min(1, "Storage key is required"),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1, "MIME type is required"),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().default(false),
  expiresAt: z.string().optional(),
});
// -------------------------
// Types
// -------------------------
type DocumentResult = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// -------------------------
// Helper Functions
// -------------------------
async function getCurrentUserWithRole() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      landlordProfile: true,
      tenantProfile: true,
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

function serializeDocument(document: any) {
  return {
    ...document,
    expiresAt: document.expiresAt?.toISOString() || null,
    createdAt: document.createdAt?.toISOString() || null,
    updatedAt: document.updatedAt?.toISOString() || null,
    deletedAt: document.deletedAt?.toISOString() || null,
    property: document.property ? {
      ...document.property,
      latitude: document.property.latitude ? Number(document.property.latitude) : null,
      longitude: document.property.longitude ? Number(document.property.longitude) : null,
      purchasePrice: document.property.purchasePrice ? Number(document.property.purchasePrice) : null,
      currentValue: document.property.currentValue ? Number(document.property.currentValue) : null,
      propertyTax: document.property.propertyTax ? Number(document.property.propertyTax) : null,
      insurance: document.property.insurance ? Number(document.property.insurance) : null,
      hoaFees: document.property.hoaFees ? Number(document.property.hoaFees) : null,
      squareFeet: document.property.squareFeet ? Number(document.property.squareFeet) : null,
      lotSize: document.property.lotSize ? Number(document.property.lotSize) : null,
      createdAt: document.property.createdAt?.toISOString() || null,
      updatedAt: document.property.updatedAt?.toISOString() || null,
      deletedAt: document.property.deletedAt?.toISOString() || null,
    } : null,
    uploadedBy: document.uploadedBy ? {
      ...document.uploadedBy,
      createdAt: document.uploadedBy.createdAt?.toISOString() || null,
      updatedAt: document.uploadedBy.updatedAt?.toISOString() || null,
    } : null,
  };
}

// -------------------------
// Upload Document
// -------------------------
export async function uploadDocument(
  data: z.infer<typeof uploadDocumentSchema>
): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const validated = uploadDocumentSchema.parse(data);
    
    // If property specified, verify access
    if (validated.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validated.propertyId },
      });
      
      if (!property || property.deletedAt) {
        return {
          success: false,
          error: "Property not found",
        };
      }
      
      // Check authorization
      const isLandlord =
        currentUser.role === "LANDLORD" &&
        property.landlordId === currentUser.landlordProfile?.id;
      
      const isAdmin = currentUser.role === "ADMIN";
      
      if (!isLandlord && !isAdmin) {
        return {
          success: false,
          error: "You don't have permission to upload documents for this property",
        };
      }
    }
    
    // ✅ SAVE FILE TO DISK
    const { fileUrl, storageKey } = await saveFileToUploads(
      validated.file.base64,
      validated.file.filename
    );
    
    // Create document record
    const document = await prisma.$transaction(async (tx) => {
      const newDocument = await tx.document.create({
        data: {
          propertyId: validated.propertyId,
          uploadedById: currentUser.id,
          name: validated.name,
          type: validated.type as DocumentType,
          description: validated.description,
          fileUrl: fileUrl, // ✅ Real file URL
          storageProvider: "local", // ✅ Using local storage
          storageKey: storageKey,
          fileSize: validated.file.size,
          mimeType: validated.file.mimetype,
          tags: validated.tags,
          isPublic: validated.isPublic,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "DOCUMENT_UPLOADED" as ActivityType,
          action: `Uploaded document: ${validated.name}`,
          metadata: {
            documentId: newDocument.id,
            propertyId: validated.propertyId,
            type: validated.type,
          },
        },
      });
      
      return newDocument;
    });
    
    // Serialize dates for Next.js
    const serializedDocument = {
      ...document,
      expiresAt: document.expiresAt?.toISOString() || null,
      createdAt: document.createdAt?.toISOString() || null,
      updatedAt: document.updatedAt?.toISOString() || null,
    };
    
    revalidatePath("/dashboard/documents");
    if (validated.propertyId) {
      revalidatePath(`/dashboard/properties/${validated.propertyId}`);
    }
    
    return {
      success: true,
      data: serializedDocument,
      message: "Document uploaded successfully",
    };
  } catch (error) {
    console.error("Upload document error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document. Please try again.",
    };
  }
}

// -------------------------
// Get Documents
// -------------------------
export async function getDocuments(params?: {
  search?: string;
  type?: string;
  propertyId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;
    
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
    };
    
    // Filter by user role
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.OR = [
        { uploadedById: currentUser.id },
        {
          property: {
            landlordId: currentUser.landlordProfile.id,
          },
        },
      ];
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.OR = [
        { uploadedById: currentUser.id },
        { isPublic: true },
      ];
    }
    
    // Filter by property
    if (params?.propertyId) {
      where.propertyId = params.propertyId;
    }
    
    // Filter by type
    if (params?.type && params.type !== "ALL") {
      where.type = params.type as DocumentType;
    }
    
    // Filter by tags
    if (params?.tags && params.tags.length > 0) {
      where.tags = {
        hasSome: params.tags,
      };
    }
    
    // Search filter
    if (params?.search) {
      where.OR = [
        {
          name: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      ];
    }
    
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.document.count({ where }),
    ]);
    
    const serializedDocuments = documents.map(serializeDocument);
    
    return {
      success: true,
      data: {
        documents: serializedDocuments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get documents error:", error);
    return {
      success: false,
      error: "Failed to fetch documents",
    };
  }
}

// -------------------------
// Get Document by ID
// -------------------------
export async function getDocumentById(documentId: string): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        property: {
          include: {
            landlord: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    
    if (!document || document.deletedAt) {
      return {
        success: false,
        error: "Document not found",
      };
    }
    
    // Check authorization
    const isOwner = document.uploadedById === currentUser.id;
    
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      document.property?.landlordId === currentUser.landlordProfile?.id;
    
    const isPublic = document.isPublic;
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isOwner && !isLandlord && !isPublic && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const serializedDocument = serializeDocument(document);
    
    return {
      success: true,
      data: serializedDocument,
    };
  } catch (error) {
    console.error("Get document error:", error);
    return {
      success: false,
      error: "Failed to fetch document details",
    };
  }
}

// -------------------------
// Update Document
// -------------------------
export async function updateDocument(
  documentId: string,
  data: z.infer<typeof updateDocumentSchema>
): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        property: true,
      },
    });
    
    if (!document || document.deletedAt) {
      return {
        success: false,
        error: "Document not found",
      };
    }
    
    // Check authorization
    const isOwner = document.uploadedById === currentUser.id;
    
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      document.property?.landlordId === currentUser.landlordProfile?.id;
    
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isOwner && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = updateDocumentSchema.parse(data);
    
    const updatedDocument = await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          ...(validated.name && { name: validated.name }),
          ...(validated.description !== undefined && { description: validated.description }),
          ...(validated.tags !== undefined && { tags: validated.tags }),
          ...(validated.isPublic !== undefined && { isPublic: validated.isPublic }),
          ...(validated.expiresAt !== undefined && {
            expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          }),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "DOCUMENT_UPLOADED" as ActivityType,
          action: `Updated document: ${document.name}`,
          metadata: {
            documentId: documentId,
            updatedFields: Object.keys(validated),
          },
        },
      });
      
      return updated;
    });
    
    const serializedDocument = serializeDocument(updatedDocument);
    
    revalidatePath("/dashboard/documents");
    revalidatePath(`/dashboard/documents/${documentId}`);
    
    return {
      success: true,
      data: serializedDocument,
      message: "Document updated successfully",
    };
  } catch (error) {
    console.error("Update document error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update document. Please try again.",
    };
  }
}

// -------------------------
// Delete Document
// -------------------------
export async function deleteDocument(documentId: string): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        property: true,
      },
    });
    
    if (!document || document.deletedAt) {
      return {
        success: false,
        error: "Document not found",
      };
    }
    
    // Check authorization
    const isOwner = document.uploadedById === currentUser.id;
    
    const isLandlord =
      currentUser.role === "LANDLORD" &&
      document.property?.landlordId === currentUser.landlordProfile?.id;
    
    const isAdmin = currentUser.role === "ADMIN";
    
    if (!isOwner && !isLandlord && !isAdmin) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Soft delete
    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: documentId },
        data: {
          deletedAt: new Date(),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "DOCUMENT_DELETED" as ActivityType,
          action: `Deleted document: ${document.name}`,
          metadata: {
            documentId: documentId,
          },
        },
      });
    });
    
    revalidatePath("/dashboard/documents");
    
    // TODO: Delete from storage (S3/Cloudinary)
    // if (document.storageKey) {
    //   await deleteFromStorage(document.storageProvider, document.storageKey);
    // }
    
    return {
      success: true,
      message: "Document deleted successfully",
    };
  } catch (error) {
    console.error("Delete document error:", error);
    return {
      success: false,
      error: "Failed to delete document. Please try again.",
    };
  }
}

// -------------------------
// Get Document Statistics
// -------------------------
export async function getDocumentStatistics(): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
    };
    
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.OR = [
        { uploadedById: currentUser.id },
        {
          property: {
            landlordId: currentUser.landlordProfile.id,
          },
        },
      ];
    } else if (currentUser.role === "TENANT" && currentUser.tenantProfile) {
      where.uploadedById = currentUser.id;
    }
    
    const [total, byType, totalSize, expiringSoon] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      prisma.document.aggregate({
        where,
        _sum: {
          fileSize: true,
        },
      }),
      prisma.document.count({
        where: {
          ...where,
          expiresAt: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            gte: new Date(),
          },
        },
      }),
    ]);
    
    return {
      success: true,
      data: {
        total,
        byType,
        totalSize: totalSize._sum.fileSize || 0,
        expiringSoon,
      },
    };
  } catch (error) {
    console.error("Get document statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}

// -------------------------
// Get All Tags
// -------------------------
export async function getAllTags(): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
    };
    
    if (currentUser.role === "LANDLORD" && currentUser.landlordProfile) {
      where.OR = [
        { uploadedById: currentUser.id },
        {
          property: {
            landlordId: currentUser.landlordProfile.id,
          },
        },
      ];
    } else if (currentUser.role === "TENANT") {
      where.uploadedById = currentUser.id;
    }
    
    const documents = await prisma.document.findMany({
      where,
      select: {
        tags: true,
      },
    });
    
    // Extract unique tags
    const tagsSet = new Set<string>();
    documents.forEach((doc) => {
      doc.tags.forEach((tag) => tagsSet.add(tag));
    });
    
    const tags = Array.from(tagsSet).sort();
    
    return {
      success: true,
      data: tags,
    };
  } catch (error) {
    console.error("Get tags error:", error);
    return {
      success: false,
      error: "Failed to fetch tags",
    };
  }
}

async function saveFileToUploads(base64: string, filename: string): Promise<{ fileUrl: string; storageKey: string }> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
    const filePath = join(uploadsDir, uniqueFilename);

    // Convert base64 to buffer and save
    const buffer = Buffer.from(base64, 'base64');
    await writeFile(filePath, buffer);

    // Return public URL and storage key
    return {
      fileUrl: `/uploads/${uniqueFilename}`,
      storageKey: `uploads/${uniqueFilename}`,
    };
  } catch (error) {
    console.error('File save error:', error);
    throw new Error('Failed to save file');
  }
}



export async function createDocument(
  data: z.infer<typeof createDocumentSchema>
): Promise<DocumentResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    const validated = createDocumentSchema.parse(data);
    
    // If property specified, verify access
    if (validated.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: validated.propertyId },
      });
      
      if (!property || property.deletedAt) {
        return {
          success: false,
          error: "Property not found",
        };
      }
      
      // Check authorization
      const isLandlord =
        currentUser.role === "LANDLORD" &&
        property.landlordId === currentUser.landlordProfile?.id;
      
      const isAdmin = currentUser.role === "ADMIN";
      
      if (!isLandlord && !isAdmin) {
        return {
          success: false,
          error: "You don't have permission to upload documents for this property",
        };
      }
    }
    
    // Create document record
    const document = await prisma.$transaction(async (tx) => {
      const newDocument = await tx.document.create({
        data: {
          propertyId: validated.propertyId,
          uploadedById: currentUser.id,
          name: validated.name,
          type: validated.type as DocumentType,
          description: validated.description,
          fileUrl: validated.fileUrl,
          storageProvider: validated.storageProvider,
          storageKey: validated.storageKey,
          fileSize: validated.fileSize,
          mimeType: validated.mimeType,
          tags: validated.tags,
          isPublic: validated.isPublic,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        },
        include: {
          property: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "DOCUMENT_UPLOADED" as ActivityType,
          action: `Uploaded document: ${validated.name}`,
          metadata: {
            documentId: newDocument.id,
            propertyId: validated.propertyId,
            type: validated.type,
          },
        },
      });
      
      return newDocument;
    });
    
    // Serialize dates
    const serializedDocument = {
      ...document,
      expiresAt: document.expiresAt?.toISOString() || null,
      createdAt: document.createdAt?.toISOString() || null,
      updatedAt: document.updatedAt?.toISOString() || null,
    };
    
    revalidatePath("/dashboard/documents");
    if (validated.propertyId) {
      revalidatePath(`/dashboard/properties/${validated.propertyId}`);
    }
    
    return {
      success: true,
      data: serializedDocument,
      message: "Document uploaded successfully",
    };
  } catch (error) {
    console.error("Create document error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create document. Please try again.",
    };
  }
}