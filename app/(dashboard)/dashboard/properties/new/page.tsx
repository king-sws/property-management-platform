// ============================================================================
// FILE: src/app/(dashboard)/dashboard/properties/new/page.tsx
// Add New Property Page
// ============================================================================

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PropertyForm from "@/components/properties/property-form";

export default async function NewPropertyPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-500 mt-1">
          Enter the details of your property below
        </p>
      </div>
      {/* Pass undefined instead of empty string */}
      <PropertyForm />
    </div>
  );
}