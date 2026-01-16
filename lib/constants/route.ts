import { UserRole } from "../generated/prisma/enums";

// lib/constants/routes.ts
export const ROUTES = {
  // Auth
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Landlord
  PROPERTIES: "/dashboard/properties",
  PROPERTY_NEW: "/dashboard/properties/new",
  PROPERTY_DETAIL: (id: string) => `/dashboard/properties/${id}`,
  PROPERTY_EDIT: (id: string) => `/dashboard/properties/${id}/edit`,
  
  TENANTS: "/dashboard/tenants",
  TENANT_DETAIL: (id: string) => `/dashboard/tenants/${id}`,
  
  LEASES: "/dashboard/leases",
  LEASE_NEW: "/dashboard/leases/new",
  LEASE_DETAIL: (id: string) => `/dashboard/leases/${id}`,
  
  APPLICATIONS: "/dashboard/applications",
  APPLICATION_DETAIL: (id: string) => `/dashboard/applications/${id}`,
  
  EXPENSES: "/dashboard/expenses",
  EXPENSE_NEW: "/dashboard/expenses/new",
  
  REPORTS: "/dashboard/reports",
  
  // Tenant
  MY_LEASE: "/dashboard/my-lease",
  PAY_RENT: "/dashboard/payments/pay",
  
  // Vendor
  TICKETS: "/dashboard/tickets",
  SCHEDULE: "/dashboard/schedule",
  
  // Shared
  PAYMENTS: "/dashboard/payments",
  MAINTENANCE: "/dashboard/maintenance",
  DOCUMENTS: "/dashboard/documents",
  MESSAGES: "/dashboard/messages",
  SETTINGS: "/dashboard/settings",
} as const;

export const ROLE_REDIRECT: Record<UserRole, string> = {
  [UserRole.ADMIN]: ROUTES.DASHBOARD,
  [UserRole.LANDLORD]: ROUTES.DASHBOARD,
  [UserRole.TENANT]: ROUTES.MY_LEASE,
  [UserRole.VENDOR]: ROUTES.TICKETS,
};
