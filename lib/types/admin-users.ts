// lib/types/admin-users.ts

import { Prisma } from "../generated/prisma/client";

// Define the user query with all includes
export const userWithProfilesQuery = {
  include: {
    landlordProfile: {
      include: {
        _count: {
          select: {
            properties: {
              where: { deletedAt: null, isActive: true },
            },
          },
        },
      },
    },
    tenantProfile: {
      include: {
        leaseMembers: {
          where: {
            lease: {
              status: "ACTIVE",
            },
          },
          include: {
            lease: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
    },
    vendorProfile: {
      include: {
        _count: {
          select: {
            tickets: true,
            reviews: true,
          },
        },
      },
    },
    _count: {
      select: {
        activityLogs: true,
        notifications: true,
      },
    },
  },
} satisfies Prisma.UserFindManyArgs;

// Type for user with all profiles
export type UserWithProfiles = Prisma.UserGetPayload<typeof userWithProfilesQuery>;

