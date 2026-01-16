"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvoiceHeader({ role }: { role: "vendor" | "landlord" }) {
  const router = useRouter();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          {role === "vendor" ? "My Invoices" : "Vendor Invoices"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {role === "vendor" 
            ? "Create and manage your invoices" 
            : "Review and approve vendor invoices"}
        </p>
      </div>
      
      {role === "vendor" && (
        <Button onClick={() => router.push("/dashboard/vendor/invoices/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      )}
    </div>
  );
}