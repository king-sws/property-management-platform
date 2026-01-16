// components/leases/leases-header.tsx
import { FileText } from "lucide-react";

export function LeasesHeader() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leases</h1>
        <p className="text-muted-foreground">
          Manage rental agreements and tenant contracts
        </p>
      </div>
    </div>
  );
}

