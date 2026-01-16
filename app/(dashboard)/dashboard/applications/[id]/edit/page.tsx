// app/(dashboard)/dashboard/applications/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApplicationById } from "@/actions/applications";
import { ApplicationForm } from "@/components/applications/application-form";
import { FileText } from "lucide-react";

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Application</h1>
          <p className="text-muted-foreground">
            Update your rental application
          </p>
        </div>
      </div>
      
      <ApplicationForm application={application} isEdit />
    </div>
  );
}