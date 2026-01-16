// app/(dashboard)/dashboard/documents/[id]/edit/page.tsx
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getDocumentById } from "@/actions/documents";
import { DocumentEdit } from "@/components/document/document-edit";
import { Skeleton } from "@/components/ui/skeleton";
import { Container, Stack } from "@/components/ui/container";
import { Edit } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDocumentById(id);
  
  if (!result.success || !result.data) {
    return {
      title: "Edit Document",
    };
  }

  return {
    title: `Edit ${result.data.name} | Documents`,
  };
}

interface EditDocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Edit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Document</h1>
            <p className="text-muted-foreground">
              Update document information and settings
            </p>
          </div>
        </div>

        <Suspense fallback={<EditDocumentLoading />}>
          <EditDocumentWrapper documentId={id} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function EditDocumentWrapper({ documentId }: { documentId: string }) {
  const result = await getDocumentById(documentId);

  if (!result.success) {
    if (result.error === "Document not found" || result.error === "Unauthorized") {
      notFound();
    }
    
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 m-6">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return <DocumentEdit document={result.data} />;
}

function EditDocumentLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}