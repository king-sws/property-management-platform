
// lib/utils/permissions.ts
import { UserRole } from "@/lib/generated/prisma/enums";

export type Permission = 
  | "property:create"
  | "property:read"
  | "property:update"
  | "property:delete"
  | "tenant:create"
  | "tenant:read"
  | "tenant:update"
  | "tenant:delete"
  | "lease:create"
  | "lease:read"
  | "lease:update"
  | "lease:delete"
  | "payment:create"
  | "payment:read"
  | "payment:update"
  | "maintenance:create"
  | "maintenance:read"
  | "maintenance:update"
  | "expense:create"
  | "expense:read"
  | "expense:update"
  | "report:read"
  | "document:create"
  | "document:read"
  | "document:delete"
  | "admin:all";

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: ["admin:all"],
  [UserRole.LANDLORD]: [
    "property:create",
    "property:read",
    "property:update",
    "property:delete",
    "tenant:create",
    "tenant:read",
    "tenant:update",
    "tenant:delete",
    "lease:create",
    "lease:read",
    "lease:update",
    "lease:delete",
    "payment:create",
    "payment:read",
    "payment:update",
    "maintenance:create",
    "maintenance:read",
    "maintenance:update",
    "expense:create",
    "expense:read",
    "expense:update",
    "report:read",
    "document:create",
    "document:read",
    "document:delete",
  ],
  [UserRole.TENANT]: [
    "lease:read",
    "payment:create",
    "payment:read",
    "maintenance:create",
    "maintenance:read",
    "document:read",
  ],
  [UserRole.VENDOR]: [
    "maintenance:read",
    "maintenance:update",
    "document:create",
    "document:read",
  ],
};

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  const permissions = rolePermissions[role];
  return (
    permissions.includes("admin:all") ||
    permissions.includes(permission)
  );
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  // Landlord routes
  if (path.startsWith("/dashboard/properties")) {
    return hasPermission(role, "property:read");
  }
  if (path.startsWith("/dashboard/tenants")) {
    return hasPermission(role, "tenant:read");
  }
  if (path.startsWith("/dashboard/leases")) {
    return hasPermission(role, "lease:read");
  }
  if (path.startsWith("/dashboard/expenses")) {
    return hasPermission(role, "expense:read");
  }
  if (path.startsWith("/dashboard/reports")) {
    return hasPermission(role, "report:read");
  }

  // Tenant routes
  if (path.startsWith("/dashboard/my-lease")) {
    return role === UserRole.TENANT;
  }

  // Vendor routes
  if (path.startsWith("/dashboard/tickets")) {
    return role === UserRole.VENDOR;
  }

  // Shared routes
  if (
    path.startsWith("/dashboard/payments") ||
    path.startsWith("/dashboard/maintenance") ||
    path.startsWith("/dashboard/documents")
  ) {
    return true;
  }

  return false;
}
