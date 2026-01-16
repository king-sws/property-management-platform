// components/admin/view-toggle.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ViewToggleProps {
  currentView: string;
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (view: "card" | "table") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={currentView === "card" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("card")}
        className="h-8"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === "table" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => handleViewChange("table")}
        className="h-8"
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}