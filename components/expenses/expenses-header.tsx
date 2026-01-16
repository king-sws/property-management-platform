// components/expenses/expenses-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Receipt, Plus } from "lucide-react";

export function ExpensesHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage property expenses
          </p>
        </div>
      </div>

      <Button onClick={() => router.push("/dashboard/expenses/new")}>
        <Plus className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
    </div>
  );
}