// app/(dashboard)/dashboard/expenses/[id]/edit/page.tsx
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getExpenseById } from "@/actions/expenses";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseFormSkeleton } from "@/components/expenses/expense-form-skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }
  
  const { id } = await params;
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/expenses/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <Typography variant="h2" className="mb-1">
              Edit Expense
            </Typography>
            <Typography variant="muted">
              Update expense information
            </Typography>
          </div>
        </div>

        <Suspense fallback={<ExpenseFormSkeleton />}>
          <ExpenseFormWrapper expenseId={id} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function ExpenseFormWrapper({ expenseId }: { expenseId: string }) {
  const result = await getExpenseById(expenseId);
  
  if (!result.success) {
    if (result.error === "Expense not found" || result.error === "Unauthorized") {
      notFound();
    }
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <Typography variant="muted" className="text-sm text-red-800">
          {result.error}
        </Typography>
      </div>
    );
  }
  
  return <ExpenseForm expense={result.data} isEdit={true} />;
}