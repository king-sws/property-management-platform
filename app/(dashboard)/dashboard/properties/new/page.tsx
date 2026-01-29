// ============================================================================
// FILE: src/app/(dashboard)/dashboard/properties/new/page.tsx
// Add New Property Page
// ============================================================================

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PropertyForm from "@/components/properties/property-form";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";

export default async function NewPropertyPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Add New Property
          </Typography>
          <Typography variant="muted">
            Enter the details of your property below
          </Typography>
        </div>
        <PropertyForm />
      </Stack>
    </Container>
  );
}