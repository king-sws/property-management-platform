// components/documents/documents-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Typography } from "@/components/ui/typography";

export function DocumentsHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Typography variant="h2" className="mb-1">
          Documents
        </Typography>
        <Typography variant="muted">
          Manage and organize your documents
        </Typography>
      </div>
      <Button 
        onClick={() => router.push("/dashboard/documents/upload")}
        className="w-full sm:w-auto"
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Document
      </Button>
    </div>
  );
}