// app/(dashboard)/dashboard/(landlord)/tenants/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { getTenantById } from "@/actions/tenants";
import { auth } from "@/auth";
import { TenantForm } from "@/components/tenants/tenant-form";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Edit Tenant | Property Management",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTenantPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") redirect("/dashboard");
  
  const { id } = await params;
  
  const result = await getTenantById(id);
  
  if (!result.success) notFound();
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Edit Tenant: {result.data.user.name}
          </Typography>
          <Typography variant="muted">
            Update tenant information and contact details
          </Typography>
        </div>
        <TenantForm tenant={result.data} isEdit />
      </Stack>
    </Container>
  );
}