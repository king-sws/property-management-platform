// app/api/cron/check-leases/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // Protect with a secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();

  // 1. Mark leases as EXPIRED if endDate has passed
  const expiredResult = await prisma.lease.updateMany({
    where: {
      status: { in: ["ACTIVE", "EXPIRING_SOON"] },
      endDate: { lt: today },
      deletedAt: null,
    },
    data: { status: "EXPIRED" },
  });

  // 2. Mark units as VACANT for newly expired leases
  const expiredLeases = await prisma.lease.findMany({
    where: {
      status: "EXPIRED",
      endDate: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired in last 24h
        lt: today,
      },
    },
    select: { unitId: true },
  });

  if (expiredLeases.length > 0) {
    await prisma.unit.updateMany({
      where: { id: { in: expiredLeases.map(l => l.unitId) } },
      data: { status: "VACANT" },
    });
  }

  // 3. Mark leases as EXPIRING_SOON if ending within 60 days
  const sixtyDaysFromNow = new Date();
  sixtyDaysFromNow.setDate(today.getDate() + 60);

  const expiringSoonResult = await prisma.lease.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { gte: today, lte: sixtyDaysFromNow },
      deletedAt: null,
    },
    data: { status: "EXPIRING_SOON" },
  });

  // 4. Create notifications for landlords with expiring leases
  const expiringSoonLeases = await prisma.lease.findMany({
    where: {
      status: "EXPIRING_SOON",
      endDate: { gte: today, lte: sixtyDaysFromNow },
    },
    include: {
      unit: {
        include: {
          property: {
            include: { landlord: true },
          },
        },
      },
      tenants: {
        where: { isPrimaryTenant: true },
        include: { tenant: { include: { user: true } } },
      },
    },
  });

  for (const lease of expiringSoonLeases) {
    const daysLeft = Math.ceil(
      (new Date(lease.endDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Only notify at 60, 30, 14, 7 days
    if ([60, 30, 14, 7].includes(daysLeft)) {
      // Check if notification already exists for this lease + daysLeft combination
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: lease.unit.property.landlord.userId,
          type: "LEASE_RENEWAL_OFFER",
          metadata: { path: ["leaseId"], equals: lease.id },
        },
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: lease.unit.property.landlord.userId,
            type: "LEASE_RENEWAL_OFFER",
            title: `Lease Expiring in ${daysLeft} Days`,
            message: `Lease for ${lease.unit.property.name} Unit ${lease.unit.unitNumber} expires in ${daysLeft} days.`,
            actionUrl: `/dashboard/leases/${lease.id}`,
            metadata: { leaseId: lease.id, daysLeft },
          },
        });
      }
    }
  }

  return NextResponse.json({
    expired: expiredResult.count,
    expiringSoon: expiringSoonResult.count,
    unitsVacated: expiredLeases.length,
  });
}