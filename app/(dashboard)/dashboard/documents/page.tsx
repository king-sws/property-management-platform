// app/(dashboard)/dashboard/documents/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDocuments } from "@/actions/documents";
import { DocumentsList } from "@/components/document/documents-list";
import { DocumentsHeader } from "@/components/document/documents-header";
import { Container, Stack } from "@/components/ui/container";

import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Documents | Property Management",
  description: "Manage your documents and files",
};

interface DocumentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // FIXED: Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const type = typeof params.type === "string" ? params.type : "all";
  const propertyId = typeof params.propertyId === "string" ? params.propertyId : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <DocumentsHeader />



        {/* Documents List */}
        <Suspense fallback={<DocumentsLoading />}>
          <DocumentsListWrapper
            search={search}
            type={type}
            propertyId={propertyId}
            page={page}
          />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function DocumentsListWrapper({
  search,
  type,
  propertyId,
  page,
}: {
  search: string;
  type: string;
  propertyId?: string;
  page: number;
}) {
  const result = await getDocuments({
    search,
    type: type !== "all" ? type : undefined,
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

  return <DocumentsList initialData={result.data} />;
}

function DocumentsLoading() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}