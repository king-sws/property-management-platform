
// app/(dashboard)/dashboard/(landlord)/tenants/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getTenantById } from "@/actions/tenants";
import { auth } from "@/auth";
import { TenantForm } from "@/components/tenants/tenant-form";
import { Users } from "lucide-react";

export const metadata = {
  title: "Edit Tenant | Property Management",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditTenantPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  
  const result = await getTenantById(params.id);
  
  if (!result.success) {
    notFound();
  }
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Tenant: {result.data.user.name}
          </h1>
          <p className="text-muted-foreground">
            Update tenant information and contact details
          </p>
        </div>
      </div>
      
      <TenantForm tenant={result.data} isEdit />
    </div>
  );
}