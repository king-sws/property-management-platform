// components/tenants/view-toggle.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";

interface ViewToggleProps {
  currentView: string;
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (newView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      <Button
        variant={currentView === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("table")}
        className="gap-2"
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </Button>
      <Button
        variant={currentView === "card" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("card")}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Cards</span>
      </Button>
    </div>
  );
}