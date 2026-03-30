// app/(dashboard)/dashboard/expenses/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getExpenseById } from "@/actions/expenses";
import { ExpenseDetail } from "@/components/expenses/expense-detail";
import { Container, Stack } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpenseDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }

  const { id } = await params;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
          <ExpenseDetailWrapper expenseId={id} />
        </Suspense>
      </Stack>
    </Container>
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