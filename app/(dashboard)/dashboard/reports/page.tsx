// app/dashboard/reports/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/generated/prisma/enums";
import { ReportsClient } from "@/components/reports/reports-client";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Reports & Analytics | Property Management",
  description: "Generate comprehensive reports for your properties",
};

export default async function ReportsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== UserRole.LANDLORD) {
    redirect("/dashboard");
  }
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Reports & Analytics
            </Typography>
            <Typography variant="muted">
              Generate comprehensive reports for your properties
            </Typography>
          </div>
        </div>

        {/* Reports Content */}
        <ReportsClient />
      </Stack>
    </Container>
  );
}