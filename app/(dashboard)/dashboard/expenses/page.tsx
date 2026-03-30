/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(dashboard)/dashboard/expenses/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getExpenses } from "@/actions/expenses";
import { ExpensesList } from "@/components/expenses/expenses-list";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Expenses | Property Management",
  description: "Track and manage property expenses",
};

interface ExpensesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "LANDLORD") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }

  const params = await searchParams;
  const search     = typeof params.search     === "string" ? params.search     : "";
  const category   = typeof params.category   === "string" ? params.category   : "all";
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : undefined;
  const page       = typeof params.page       === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">Expenses</Typography>
            <Typography variant="muted">Track and manage property expenses</Typography>
          </div>
          <Button asChild>
            <Link href="/dashboard/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>

        {/* List */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
          <ExpensesListWrapper
            search={search}
            category={category}
            propertyId={propertyId}
            page={page}
          />
        </Suspense>

      </Stack>
    </Container>
  );
}

async function ExpensesListWrapper({
  search, category, propertyId, page,
}: {
  search: string; category: string; propertyId?: string; page: number;
}) {
  const result = await getExpenses({
    search,
    category: category !== "all" ? category : undefined,
    propertyId,
    page,
    limit: 20,
  });

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return <ExpensesList initialData={result.data} />;
}