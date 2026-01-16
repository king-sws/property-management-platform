// ============================================================================
// FILE: src/app/api/properties/[id]/images/route.ts
// Property Image Upload API - Multiple images support
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ActivityType } from "@/lib/generated/prisma/enums";
import sharp from "sharp";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import fs from "fs";

const IMAGE_SIZES = {
  large: { width: 1920, height: 1080 },
  medium: { width: 800, height: 600 },
  thumbnail: { width: 400, height: 300 },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES_PER_PROPERTY = 20;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // 🔐 Auth & Authorization
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: propertyId } = await params;

    // Verify landlord owns this property
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return NextResponse.json(
        { success: false, error: "Landlord profile not found" },
        { status: 403 }
      );
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordId: landlord.id,
        deletedAt: null,
      },
      include: {
        images: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    // Check image limit
    if (property.images.length >= MAX_IMAGES_PER_PROPERTY) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Maximum ${MAX_IMAGES_PER_PROPERTY} images allowed per property` 
        },
        { status: 400 }
      );
    }

    // 📦 Read form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 🖼️ Validate type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // 📏 Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image must be less than 10MB" },
        { status: 400 }
      );
    }

    // 🔄 Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 📁 Create directory structure
    const propertyImagesDir = path.join(
      process.cwd(),
      "public",
      "properties",
      propertyId
    );
    if (!fs.existsSync(propertyImagesDir)) {
      await mkdir(propertyImagesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}.jpg`;
    const storageKey = `properties/${propertyId}/${fileName}`;

    // 🧠 Process and save images in different sizes
    const largeBuffer = await sharp(buffer)
      .resize(IMAGE_SIZES.large.width, IMAGE_SIZES.large.height, { 
        fit: "inside",
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filePath = path.join(propertyImagesDir, fileName);
    await writeFile(filePath, largeBuffer);

    // 🌐 Public URL
    const imageUrl = `/properties/${propertyId}/${fileName}`;

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: propertyId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Get next order number
    const maxOrder = property.images.reduce(
      (max, img) => Math.max(max, img.order),
      -1
    );

    // 🗄️ Save to database
    const propertyImage = await prisma.propertyImage.create({
      data: {
        propertyId: propertyId,
        url: imageUrl,
        storageProvider: "local",
        storageKey: storageKey,
        caption: caption || null,
        isPrimary: isPrimary || property.images.length === 0,
        order: maxOrder + 1,
      },
    });

    // 🧾 Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: ActivityType.PROPERTY_UPDATED,
        action: `Added image to property: ${property.name}`,
        entityType: "Property",
        entityId: propertyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      data: propertyImage,
    });
  } catch (error) {
    console.error("Property image upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: propertyId } = await params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: "Image ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordId: landlord.id,
        deletedAt: null,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        propertyId: propertyId,
      },
    });

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    // Delete file from disk
    if (image.storageKey) {
      const filePath = path.join(process.cwd(), "public", image.storageKey);
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
    }

    // Delete from database
    await prisma.propertyImage.delete({
      where: { id: imageId },
    });

    // If deleted image was primary, set first remaining image as primary
    if (image.isPrimary) {
      const firstImage = await prisma.propertyImage.findFirst({
        where: { propertyId: propertyId },
        orderBy: { order: "asc" },
      });

      if (firstImage) {
        await prisma.propertyImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true },
        });
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: ActivityType.PROPERTY_UPDATED,
        action: `Removed image from property: ${property.name}`,
        entityType: "Property",
        entityId: propertyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Property image delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: propertyId } = await params;
    const body = await request.json();
    const { imageId, isPrimary, caption, order } = body;

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: "Image ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const landlord = await prisma.landlord.findUnique({
      where: { userId: session.user.id },
    });

    if (!landlord) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordId: landlord.id,
        deletedAt: null,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: propertyId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update image
    const updatedImage = await prisma.propertyImage.update({
      where: { id: imageId },
      data: {
        isPrimary: isPrimary !== undefined ? isPrimary : undefined,
        caption: caption !== undefined ? caption : undefined,
        order: order !== undefined ? order : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage,
    });
  } catch (error) {
    console.error("Property image update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update image" },
      { status: 500 }
    );
  }
}