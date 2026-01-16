/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { unitId, desiredMoveInDate, numberOfOccupants, hasPets, petDetails } = body;

    // Validate required fields
    if (!unitId || !desiredMoveInDate || !numberOfOccupants) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get tenant profile
    const tenant = await prisma.tenant.findUnique({
      where: { userId: session.user.id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tenant profile not found. Please complete your profile first." },
        { status: 400 }
      );
    }

    // Get unit and verify it's available
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        status: "VACANT",
        deletedAt: null,
        isActive: true,
      },
      include: {
        property: {
          include: {
            landlord: true,
          },
        },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found or not available" },
        { status: 404 }
      );
    }

    // Check if tenant already has a pending application for this unit
    const existingApplication = await prisma.rentalApplication.findFirst({
      where: {
        unitId,
        tenantId: tenant.id,
        status: {
          in: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SCREENING_IN_PROGRESS"],
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have a pending application for this unit" },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.rentalApplication.create({
      data: {
        unitId,
        tenantId: tenant.id,
        landlordId: unit.property.landlordId,
        status: "SUBMITTED",
        desiredMoveInDate: new Date(desiredMoveInDate),
        numberOfOccupants: parseInt(numberOfOccupants),
        hasPets: hasPets || false,
        petDetails: petDetails || null,
        submittedAt: new Date(),
      },
    });

    // Create notification for landlord
    await prisma.notification.create({
      data: {
        userId: unit.property.landlord.userId,
        type: "APPLICATION_RECEIVED",
        title: "New Rental Application",
        message: `You have received a new application for ${unit.property.name} - Unit ${unit.unitNumber}`,
        actionUrl: `/dashboard/applications/${application.id}`,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "APPLICATION_SUBMITTED",
        action: `Submitted application for ${unit.property.name} - Unit ${unit.unitNumber}`,
        entityType: "RentalApplication",
        entityId: application.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("id");

    if (applicationId) {
      // Get specific application
      const application = await prisma.rentalApplication.findFirst({
        where: {
          id: applicationId,
          OR: [
            { tenant: { userId: session.user.id } },
            { landlord: { userId: session.user.id } },
          ],
        },
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          landlord: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          screening: true,
        },
      });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ application });
    } else {
      // Get all applications for user
      const tenant = await prisma.tenant.findUnique({
        where: { userId: session.user.id },
      });

      const landlord = await prisma.landlord.findUnique({
        where: { userId: session.user.id },
      });

      const whereClause: any = {
        OR: [],
      };

      if (tenant) {
        whereClause.OR.push({ tenantId: tenant.id });
      }

      if (landlord) {
        whereClause.OR.push({ landlordId: landlord.id });
      }

      if (whereClause.OR.length === 0) {
        return NextResponse.json({ applications: [] });
      }

      const applications = await prisma.rentalApplication.findMany({
        where: whereClause,
        include: {
          unit: {
            include: {
              property: true,
            },
          },
          tenant: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ applications });
    }
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}