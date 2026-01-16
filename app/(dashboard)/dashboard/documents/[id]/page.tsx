// app/(dashboard)/dashboard/documents/[id]/page.tsx
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getDocumentById } from "@/actions/documents";
import { DocumentDetails } from "@/components/document/document-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Container, Stack } from "@/components/ui/container";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDocumentById(id);
  
  if (!result.success || !result.data) {
    return {
      title: "Document Not Found",
    };
  }

  return {
    title: `${result.data.name} | Documents`,
    description: result.data.description || "View document details",
  };
}

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <Suspense fallback={<DocumentDetailsLoading />}>
          <DocumentDetailsWrapper documentId={id} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function DocumentDetailsWrapper({ documentId }: { documentId: string }) {
  const result = await getDocumentById(documentId);

  if (!result.success) {
    if (result.error === "Document not found" || result.error === "Unauthorized") {
      notFound();
    }
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return <DocumentDetails document={result.data} />;
}

function DocumentDetailsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}