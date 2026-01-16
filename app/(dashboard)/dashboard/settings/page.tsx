// app/(dashboard)/dashboard/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Settings } from "lucide-react";
import { getUserSettings } from "@/actions/settings";

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
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
      
      <SettingsTabs settings={result.data} userRole={session.user.role} />
    </div>
  );
}