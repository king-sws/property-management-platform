// app/dashboard/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/actions/profile";
import { ProfileClient } from "@/components/profile/profile-client";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getUserProfile();

  if (!result.success || !result.data) {
    return (
      <Container padding="none" size="full">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Typography variant="h2" className="mb-2">
              Failed to load profile
            </Typography>
            <Typography variant="muted">
              {result.error || "An error occurred"}
            </Typography>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Profile
          </Typography>
          <Typography variant="muted">
            Manage your profile information and view your activity
          </Typography>
        </div>

        <ProfileClient profile={result.data} />
      </Stack>
    </Container>
  );
}