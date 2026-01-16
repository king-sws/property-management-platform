/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/actions/expenses.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, ExpenseCategory } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";

// -------------------------
// Validation Schemas
// -------------------------
const createExpenseSchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum([
    "MORTGAGE",
    "PROPERTY_TAX",
    "INSURANCE",
    "HOA_FEES",
    "UTILITIES",
    "MAINTENANCE",
    "REPAIRS",
    "LANDSCAPING",
    "CLEANING",
    "PROPERTY_MANAGEMENT",
    "LEGAL",
    "ACCOUNTING",
    "MARKETING",
    "SUPPLIES",
    "CAPITAL_IMPROVEMENT",
    "OTHER",
  ]),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  vendor: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  paidDate: z.string().optional(),
  isTaxDeductible: z.boolean().default(true),
  taxCategory: z.string().optional(),
  notes: z.string().optional(),
});

const updateExpenseSchema = z.object({
  propertyId: z.string().optional(),
  category: z.enum([
    "MORTGAGE",
    "PROPERTY_TAX",
    "INSURANCE",
    "HOA_FEES",
    "UTILITIES",
    "MAINTENANCE",
    "REPAIRS",
    "LANDSCAPING",
    "CLEANING",
    "PROPERTY_MANAGEMENT",
    "LEGAL",
    "ACCOUNTING",
    "MARKETING",
    "SUPPLIES",
    "CAPITAL_IMPROVEMENT",
    "OTHER",
  ]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(3).optional(),
  vendor: z.string().optional(),
  date: z.string().optional(),
  paidDate: z.string().optional(),
  isTaxDeductible: z.boolean().optional(),
  taxCategory: z.string().optional(),
  notes: z.string().optional(),
});

// -------------------------
// Types
// -------------------------
type ExpenseResult = {
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
    },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user;
}

function serializeExpense(expense: any) {
  return {
    ...expense,
    amount: expense.amount ? Number(expense.amount) : null,
    date: expense.date?.toISOString() || null,
    paidDate: expense.paidDate?.toISOString() || null,
    createdAt: expense.createdAt?.toISOString() || null,
    updatedAt: expense.updatedAt?.toISOString() || null,
    deletedAt: expense.deletedAt?.toISOString() || null,
    property: expense.property ? {
      ...expense.property,
      latitude: expense.property.latitude ? Number(expense.property.latitude) : null,
      longitude: expense.property.longitude ? Number(expense.property.longitude) : null,
      purchasePrice: expense.property.purchasePrice ? Number(expense.property.purchasePrice) : null,
      currentValue: expense.property.currentValue ? Number(expense.property.currentValue) : null,
      propertyTax: expense.property.propertyTax ? Number(expense.property.propertyTax) : null,
      insurance: expense.property.insurance ? Number(expense.property.insurance) : null,
      hoaFees: expense.property.hoaFees ? Number(expense.property.hoaFees) : null,
      squareFeet: expense.property.squareFeet ? Number(expense.property.squareFeet) : null,
      lotSize: expense.property.lotSize ? Number(expense.property.lotSize) : null,
      createdAt: expense.property.createdAt?.toISOString() || null,
      updatedAt: expense.property.updatedAt?.toISOString() || null,
      deletedAt: expense.property.deletedAt?.toISOString() || null,
    } : null,
  };
}

// -------------------------
// Create Expense
// -------------------------
export async function createExpense(
  data: z.infer<typeof createExpenseSchema>
): Promise<ExpenseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can create expenses",
      };
    }
    
    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }
    
    const validated = createExpenseSchema.parse(data);
    
    // If property specified, verify ownership
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
      
      if (
        currentUser.role === "LANDLORD" &&
        property.landlordId !== currentUser.landlordProfile.id
      ) {
        return {
          success: false,
          error: "You don't have permission to add expenses for this property",
        };
      }
    }
    
    const expenseDate = new Date(validated.date);
    const taxYear = expenseDate.getFullYear();
    
    // Create expense
    const expense = await prisma.$transaction(async (tx) => {
      const newExpense = await tx.expense.create({
        data: {
          landlordId: currentUser.landlordProfile!.id,
          propertyId: validated.propertyId,
          category: validated.category as ExpenseCategory,
          amount: validated.amount,
          description: validated.description,
          vendor: validated.vendor,
          date: expenseDate,
          paidDate: validated.paidDate ? new Date(validated.paidDate) : null,
          isTaxDeductible: validated.isTaxDeductible,
          taxYear,
          taxCategory: validated.taxCategory,
          notes: validated.notes,
        },
      });
      
      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "EXPENSE_ADDED" as ActivityType,
          action: `Added expense: ${validated.description}`,
          metadata: {
            expenseId: newExpense.id,
            amount: validated.amount,
            category: validated.category,
          },
        },
      });
      
      return newExpense;
    });
    
    const serializedExpense = serializeExpense(expense);
    
    revalidatePath("/dashboard/expenses");
    if (validated.propertyId) {
      revalidatePath(`/dashboard/properties/${validated.propertyId}`);
    }
    
    return {
      success: true,
      data: serializedExpense,
      message: "Expense created successfully",
    };
  } catch (error) {
    console.error("Create expense error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to create expense. Please try again.",
    };
  }
}

// -------------------------
// Get Expenses
// -------------------------
export async function getExpenses(params?: {
  search?: string;
  category?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  isTaxDeductible?: boolean;
  page?: number;
  limit?: number;
}): Promise<ExpenseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can view expenses",
      };
    }
    
    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;
    
    const where: Prisma.ExpenseWhereInput = {
      landlordId: currentUser.landlordProfile.id,
      deletedAt: null,
    };
    
    // Filter by property
    if (params?.propertyId) {
      where.propertyId = params.propertyId;
    }
    
    // Filter by category
    if (params?.category && params.category !== "ALL") {
      where.category = params.category as ExpenseCategory;
    }
    
    // Filter by date range
    if (params?.startDate || params?.endDate) {
      where.date = {};
      if (params.startDate) {
        where.date.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.date.lte = new Date(params.endDate);
      }
    }
    
    // Filter by tax deductible
    if (params?.isTaxDeductible !== undefined) {
      where.isTaxDeductible = params.isTaxDeductible;
    }
    
    // Search filter
    if (params?.search) {
      where.OR = [
        {
          description: {
            contains: params.search,
            mode: "insensitive",
          },
        },
        {
          vendor: {
            contains: params.search,
            mode: "insensitive",
          },
        },
      ];
    }
    
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
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
        },
        skip,
        take: limit,
        orderBy: {
          date: "desc",
        },
      }),
      prisma.expense.count({ where }),
    ]);
    
    const serializedExpenses = expenses.map(serializeExpense);
    
    return {
      success: true,
      data: {
        expenses: serializedExpenses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get expenses error:", error);
    return {
      success: false,
      error: "Failed to fetch expenses",
    };
  }
}

// -------------------------
// Get Expense by ID
// -------------------------
export async function getExpenseById(expenseId: string): Promise<ExpenseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        property: true,
      },
    });
    
    if (!expense || expense.deletedAt) {
      return {
        success: false,
        error: "Expense not found",
      };
    }
    
    // Check authorization
    if (
      currentUser.role === "LANDLORD" &&
      expense.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const serializedExpense = serializeExpense(expense);
    
    return {
      success: true,
      data: serializedExpense,
    };
  } catch (error) {
    console.error("Get expense error:", error);
    return {
      success: false,
      error: "Failed to fetch expense details",
    };
  }
}

// -------------------------
// Update Expense
// -------------------------
export async function updateExpense(
  expenseId: string,
  data: z.infer<typeof updateExpenseSchema>
): Promise<ExpenseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can update expenses",
      };
    }
    
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    
    if (!expense || expense.deletedAt) {
      return {
        success: false,
        error: "Expense not found",
      };
    }
    
    if (
      currentUser.role === "LANDLORD" &&
      expense.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    const validated = updateExpenseSchema.parse(data);
    
    // Update tax year if date changes
    let taxYear = expense.taxYear;
    if (validated.date) {
      taxYear = new Date(validated.date).getFullYear();
    }
    
    const updatedExpense = await prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id: expenseId },
        data: {
          ...(validated.propertyId !== undefined && { propertyId: validated.propertyId }),
          ...(validated.category && { category: validated.category as ExpenseCategory }),
          ...(validated.amount !== undefined && { amount: validated.amount }),
          ...(validated.description && { description: validated.description }),
          ...(validated.vendor !== undefined && { vendor: validated.vendor }),
          ...(validated.date && { date: new Date(validated.date), taxYear }),
          ...(validated.paidDate !== undefined && {
            paidDate: validated.paidDate ? new Date(validated.paidDate) : null,
          }),
          ...(validated.isTaxDeductible !== undefined && { isTaxDeductible: validated.isTaxDeductible }),
          ...(validated.taxCategory !== undefined && { taxCategory: validated.taxCategory }),
          ...(validated.notes !== undefined && { notes: validated.notes }),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "EXPENSE_ADDED" as ActivityType,
          action: `Updated expense: ${expense.description}`,
          metadata: {
            expenseId: expenseId,
            updatedFields: Object.keys(validated),
          },
        },
      });
      
      return updated;
    });
    
    const serializedExpense = serializeExpense(updatedExpense);
    
    revalidatePath("/dashboard/expenses");
    revalidatePath(`/dashboard/expenses/${expenseId}`);
    
    return {
      success: true,
      data: serializedExpense,
      message: "Expense updated successfully",
    };
  } catch (error) {
    console.error("Update expense error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: "Failed to update expense. Please try again.",
    };
  }
}

// -------------------------
// Delete Expense
// -------------------------
export async function deleteExpense(expenseId: string): Promise<ExpenseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Only landlords can delete expenses",
      };
    }
    
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    
    if (!expense || expense.deletedAt) {
      return {
        success: false,
        error: "Expense not found",
      };
    }
    
    if (
      currentUser.role === "LANDLORD" &&
      expense.landlordId !== currentUser.landlordProfile?.id
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    // Soft delete
    await prisma.$transaction(async (tx) => {
      await tx.expense.update({
        where: { id: expenseId },
        data: {
          deletedAt: new Date(),
        },
      });
      
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          type: "EXPENSE_ADDED" as ActivityType,
          action: `Deleted expense: ${expense.description}`,
          metadata: {
            expenseId: expenseId,
          },
        },
      });
    });
    
    revalidatePath("/dashboard/expenses");
    
    return {
      success: true,
      message: "Expense deleted successfully",
    };
  } catch (error) {
    console.error("Delete expense error:", error);
    return {
      success: false,
      error: "Failed to delete expense. Please try again.",
    };
  }
}

// -------------------------
// Get Expense Statistics
// -------------------------
export async function getExpenseStatistics(params?: {
  year?: number;
  propertyId?: string;
}): Promise<ExpenseResult> {
  try {
    const currentUser = await getCurrentUserWithRole();
    
    if (currentUser.role !== "LANDLORD" && currentUser.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    
    if (!currentUser.landlordProfile) {
      return {
        success: false,
        error: "Landlord profile not found",
      };
    }
    
    const year = params?.year || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    
    const where: Prisma.ExpenseWhereInput = {
      landlordId: currentUser.landlordProfile.id,
      deletedAt: null,
      date: {
        gte: startOfYear,
        lte: endOfYear,
      },
    };
    
    if (params?.propertyId) {
      where.propertyId = params.propertyId;
    }
    
    const [totalExpenses, byCategory, taxDeductible, monthlyExpenses] = await Promise.all([
      prisma.expense.aggregate({
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: {
          amount: true,
        },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: {
          ...where,
          isTaxDeductible: true,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          SUM(amount) as total
        FROM "Expense"
        WHERE 
          "landlordId" = ${currentUser.landlordProfile.id}
          AND "deletedAt" IS NULL
          AND date >= ${startOfYear}
          AND date <= ${endOfYear}
          ${params?.propertyId ? Prisma.sql`AND "propertyId" = ${params.propertyId}` : Prisma.empty}
        GROUP BY EXTRACT(MONTH FROM date)
        ORDER BY month
      `,
    ]);
    
    return {
      success: true,
      data: {
        total: Number(totalExpenses._sum.amount || 0),
        count: totalExpenses._count,
        byCategory: byCategory.map(cat => ({
          category: cat.category,
          total: Number(cat._sum.amount || 0),
          count: cat._count,
        })),
        taxDeductible: Number(taxDeductible._sum.amount || 0),
        monthlyExpenses: (monthlyExpenses as any[]).map(m => ({
          month: Number(m.month),
          total: Number(m.total),
        })),
        year,
      },
    };
  } catch (error) {
    console.error("Get expense statistics error:", error);
    return {
      success: false,
      error: "Failed to fetch statistics",
    };
  }
}