// app/(dashboard)/dashboard/(landlord)/tenants/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getTenantById, getTenantStatistics } from "@/actions/tenants";
import { auth } from "@/auth";
import { TenantDetails } from "@/components/tenants/tenant-details";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Tenant Details | Property Management",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TenantDetailsPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  // ✅ Await params to get the actual values
  const { id } = await params;
  
  const [tenantResult, statsResult] = await Promise.all([
    getTenantById(id),
    getTenantStatistics(id),
  ]);
  
  if (!tenantResult.success) {
    notFound();
  }
  
  return (
    <Container padding="none" size="full">
      <TenantDetails 
        tenant={tenantResult.data} 
        statistics={statsResult.success ? statsResult.data : null}
      />
    </Container>
  );
}