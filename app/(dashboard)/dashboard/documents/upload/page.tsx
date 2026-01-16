// app/(dashboard)/dashboard/documents/upload/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FileUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { DocumentUpload } from "@/components/document/document-upload";

export const metadata = {
  title: "Upload Document | Property Management",
};

export default async function UploadDocumentPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  // Get user's properties
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
          <FileUp className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
          <p className="text-muted-foreground">
            Add a new document to your library
          </p>
        </div>
      </div>
      
      <DocumentUpload properties={properties} />
    </div>
  );
}