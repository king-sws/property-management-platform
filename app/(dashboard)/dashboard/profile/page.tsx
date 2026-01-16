// app/dashboard/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/actions/profile";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getUserProfile();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Failed to load profile
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {result.error || "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and view your activity
        </p>
      </div>

      <ProfileClient profile={result.data} />
    </div>
  );
}