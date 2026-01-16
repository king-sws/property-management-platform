// app/(dashboard)/dashboard/vendor/invoices/new/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateInvoiceForm } from "@/components/invoices/create-invoice-form";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Create Invoice | Vendor Dashboard",
  description: "Create a new invoice for completed work",
};

export default async function CreateInvoicePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "VENDOR") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">
            Submit an invoice for completed work
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <Suspense fallback={<div className="animate-pulse h-96" />}>
          <CreateInvoiceForm />
        </Suspense>
      </Card>
    </div>
  );
}