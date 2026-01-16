// app/(dashboard)/(subscriptions)/subscription/page.tsx
import { auth } from "@/auth";
import { SubscriptionManagement } from "@/components/settings/subscription-management";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Subscription & Billing | Propely",
  description: "Manage your subscription and billing settings",
};

export default async function SubscriptionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "LANDLORD") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Choose your plan, manage billing, and view invoices
        </p>
      </div>

      <SubscriptionManagement />
    </div>
  );
}