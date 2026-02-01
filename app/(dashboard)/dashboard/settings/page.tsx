// app/(dashboard)/dashboard/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { getUserSettings } from "@/actions/settings";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Settings | Property Management",
};

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  const result = await getUserSettings();
  
  if (!result.success || !result.data) {
    return (
      <Container padding="none" size="full">
        <div className="flex items-center justify-center h-96">
          <Typography variant="muted">
            Failed to load settings
          </Typography>
        </div>
      </Container>
    );
  }
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Settings
          </Typography>
          <Typography variant="muted">
            Manage your account settings and preferences
          </Typography>
        </div>
        
        <SettingsTabs settings={result.data} userRole={session.user.role} />
      </Stack>
    </Container>
  );
}