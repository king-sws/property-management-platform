// app/(dashboard)/dashboard/documents/upload/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DocumentUpload } from "@/components/document/document-upload";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

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
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Upload Document
          </Typography>
          <Typography variant="muted">
            Add a new document to your library
          </Typography>
        </div>
        
        <DocumentUpload properties={properties} />
      </Stack>
    </Container>
  );
}