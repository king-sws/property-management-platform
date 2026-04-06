// app/(dashboard)/dashboard/(landlord)/tenants/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TenantForm } from "@/components/tenants/tenant-form";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Add Tenant",
};

export default async function NewTenantPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Add New Tenant
          </Typography>
          <Typography variant="muted">
            Create a new tenant profile in your system
          </Typography>
        </div>

        <TenantForm />
      </Stack>
    </Container>
  );
}