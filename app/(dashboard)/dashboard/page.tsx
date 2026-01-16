// app/(dashboard)/dashboard/page.tsx
// Main dashboard router - redirects to role-specific dashboard
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Redirect based on role
  switch (session.user.role) {
    case "LANDLORD":
      redirect("/dashboard/landlord");
    case "TENANT":
      redirect("/dashboard/tenant");
    case "VENDOR":
      redirect("/dashboard/vendor");
    case "ADMIN":
      redirect("/dashboard/admin");
    default:
      redirect("/sign-in");
  }
}
