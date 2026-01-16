// app/(dashboard)/dashboard/expenses/[id]/page.tsx
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getExpenseById } from "@/actions/expenses";
import { ExpenseDetail } from "@/components/expenses/expense-detail";
import { ExpenseDetailSkeleton } from "@/components/expenses/expense-detail-skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }
  
  const { id } = await params;
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <Suspense fallback={<ExpenseDetailSkeleton />}>
        <ExpenseDetailWrapper expenseId={id} />
      </Suspense>
    </div>
  );
}

async function ExpenseDetailWrapper({ expenseId }: { expenseId: string }) {
  const result = await getExpenseById(expenseId);
  
  if (!result.success) {
    if (result.error === "Expense not found" || result.error === "Unauthorized") {
      notFound();
    }
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }
  
  return <ExpenseDetail expense={result.data} />;
}