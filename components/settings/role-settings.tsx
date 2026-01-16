/* eslint-disable @typescript-eslint/no-explicit-any */
// components/settings/role-settings.tsx
"use client";

import { LandlordSettings } from "./landlord-settings";
import { TenantSettings } from "./tenant-settings";
import { VendorSettings } from "./vendor-settings";

interface RoleSettingsProps {
  userRole: string | undefined;
  landlordSettings: any;
  tenantSettings: any;
  vendorSettings: any;
}

export function RoleSettings({
  userRole,
  landlordSettings,
  tenantSettings,
  vendorSettings,
}: RoleSettingsProps) {
  if (userRole === "LANDLORD") {
    return <LandlordSettings settings={landlordSettings} />;
  }

  if (userRole === "TENANT") {
    return <TenantSettings settings={tenantSettings} />;
  }

  if (userRole === "VENDOR") {
    return <VendorSettings settings={vendorSettings} />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No role-specific settings available</p>
    </div>
  );
}