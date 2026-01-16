// components/applications/applications-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { Typography } from "../ui/typography";

export function ApplicationsHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const isTenant = session?.user?.role === "TENANT";

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Applications
            </Typography>
            <Typography variant="muted">
              Manage rental applications and approvals
            </Typography>
          </div>
        </div>

      {isTenant && (
        <Button onClick={() => router.push("/dashboard/applications/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      )}
    </div>
  );
}