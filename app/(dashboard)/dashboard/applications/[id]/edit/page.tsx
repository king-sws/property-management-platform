// app/(dashboard)/dashboard/applications/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApplicationById } from "@/actions/applications";
import { ApplicationForm } from "@/components/applications/application-form";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Edit Application | Property Management",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApplicationPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "TENANT") {
    redirect("/dashboard");
  }
  
  const { id } = await params;
  
  const result = await getApplicationById(id);
  
  if (!result.success) {
    notFound();
  }
  
  const application = result.data;
  
  // Only allow editing draft applications
  if (application.status !== "DRAFT") {
    redirect(`/dashboard/applications/${id}`);
  }
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Edit Application
          </Typography>
          <Typography variant="muted">
            Update your rental application
          </Typography>
        </div>
        
        <ApplicationForm application={application} isEdit />
      </Stack>
    </Container>
  );
}