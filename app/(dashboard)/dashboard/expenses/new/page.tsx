
// app/(dashboard)/dashboard/expenses/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Receipt } from "lucide-react";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Add Expense | Property Management",
};

export default async function NewExpensePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }
  
  // Get landlord's properties
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      landlordProfile: {
        include: {
          properties: {
            where: {
              isActive: true,
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      },
    },
  });
  
  const properties = user?.landlordProfile?.properties || [];
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-muted-foreground">
            Record a new property expense
          </p>
        </div>
      </div>
      
      <ExpenseForm properties={properties} />
    </div>
  );
}