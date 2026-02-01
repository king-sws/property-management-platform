/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(dashboard)/dashboard/expenses/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getExpenses } from "@/actions/expenses";
import { ExpensesList } from "@/components/expenses/expenses-list";
import { ExpensesHeader } from "@/components/expenses/expenses-header";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Expenses | Property Management",
  description: "Track and manage property expenses",
};

interface ExpensesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "LANDLORD") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }

  // FIXED: Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const category = typeof params.category === "string" ? params.category : "all";
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <ExpensesHeader />

        {/* Expenses List */}
        <Suspense fallback={<ExpensesLoading />}>
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
  search,
  category,
  propertyId,
  page,
}: {
  search: string;
  category: string;
  propertyId?: string;
  page: number;
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
        <Typography variant="muted" className="text-sm text-red-800">
          {result.error}
        </Typography>
      </div>
    );
  }

  return <ExpensesList initialData={result.data} />;
}

function ExpensesLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}