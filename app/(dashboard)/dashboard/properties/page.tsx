/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/(landlord)/properties/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Container, Grid, Stack } from "@/components/ui/container";
import { PropertyCard } from "@/components/properties/property-card";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";

interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({
  searchParams,
}: PropertiesPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  // FIXED: Await searchParams
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const type = typeof params.type === "string" ? params.type : "all";

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Properties
            </Typography>
            <Typography variant="muted">
              Manage all your rental properties
            </Typography>
          </div>
          <Link href="/dashboard/properties/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-10"
              defaultValue={search}
            />
          </div>
          <Select defaultValue={type}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="SINGLE_FAMILY">Single Family</SelectItem>
              <SelectItem value="MULTI_FAMILY">Multi Family</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="CONDO">Condo</SelectItem>
              <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Properties Grid */}
        <Suspense fallback={<PropertiesLoading />}>
          <PropertiesList userId={session.user.id!} search={search} type={type} />
        </Suspense>
      </Stack>
    </Container>
  );
}

async function PropertiesList({
  userId,
  search,
  type,
}: {
  userId: string;
  search: string;
  type: string;
}) {
  const landlord = await prisma.landlord.findUnique({
    where: { userId },
  });

  if (!landlord) {
    redirect("/sign-in");
  }

  const whereClause: any = {
    landlordId: landlord.id,
    deletedAt: null,
    isActive: true,
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type && type !== "all") {
    whereClause.type = type;
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      units: {
        where: { deletedAt: null, isActive: true },
        include: {
          leases: {
            where: { status: "ACTIVE" },
            take: 1,
          },
        },
      },
      _count: {
        select: {
          maintenanceTickets: {
            where: {
              status: { in: ["OPEN", "IN_PROGRESS"] },
              deletedAt: null,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (properties.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-12 w-12" />}
        title={search ? "No properties found" : "No properties yet"}
        description={
          search
            ? "Try adjusting your search or filters"
            : "Get started by adding your first property"
        }
        action={
          !search && (
            <Link href="/dashboard/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          )
        }
      />
    );
  }

  return (
    <Grid cols={3} gap="lg">
      {properties.map((property) => {
        const totalUnits = property.units.length;
        const occupiedUnits = property.units.filter(
          (u) => u.status === "OCCUPIED"
        ).length;
        const occupancyRate =
          totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        return (
          <PropertyCard
            key={property.id}
            property={{
              id: property.id,
              name: property.name,
              address: `${property.address}, ${property.city}, ${property.state}`,
              type: property.type,
              imageUrl: property.images[0]?.url,
              totalUnits,
              occupiedUnits,
              occupancyRate,
              monthlyRevenue: property.units.reduce((acc, unit) => {
                const activeLeases = unit.leases.filter(
                  (l) => l.status === "ACTIVE"
                );
                return (
                  acc +
                  (activeLeases[0] ? Number(activeLeases[0].rentAmount) : 0)
                );
              }, 0),
              openTickets: property._count.maintenanceTickets,
            }}
          />
        );
      })}
    </Grid>
  );
}

function PropertiesLoading() {
  return (
    <Grid cols={3} gap="lg">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </Grid>
  );
}