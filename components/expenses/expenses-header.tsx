// components/expenses/expenses-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Typography } from "@/components/ui/typography";

export function ExpensesHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Typography variant="h2" className="mb-1">
          Expenses
        </Typography>
        <Typography variant="muted">
          Track and manage property expenses
        </Typography>
      </div>
      <Button 
        onClick={() => router.push("/dashboard/expenses/new")}
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
    </div>
  );
}