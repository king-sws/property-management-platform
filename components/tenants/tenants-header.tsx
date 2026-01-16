// components/tenants/tenants-header.tsx
import { Users } from "lucide-react";

export function TenantsHeader() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Users className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <p className="text-muted-foreground">
          Manage tenant information, leases, and payments
        </p>
      </div>
    </div>
  );
}
