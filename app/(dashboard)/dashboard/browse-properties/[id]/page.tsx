/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/browse-properties/[id]/page.tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Home,
  Mail,
  Phone,
  Shield,
  Car,
  Zap,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPropertyForTenant } from "@/actions/browse-properties";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { ContactLandlordButton } from "@/components/properties/contact-landlord-button";


export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "TENANT") {
    redirect("/sign-in");
  }

  const { id } = await params;
  const result = await getPropertyForTenant(id);

  if (!result.success || !result.property) {
    notFound();
  }

  const property = result.property;

  const propertyTypeLabels: Record<string, string> = {
    SINGLE_FAMILY: "Single Family",
    MULTI_FAMILY: "Multi Family",
    APARTMENT: "Apartment",
    CONDO: "Condo",
    TOWNHOUSE: "Townhouse",
    COMMERCIAL: "Commercial",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/browse-properties">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>
      </Link>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {property.images.length > 0 ? (
          <>
            <div className="relative aspect-4/3 md:col-span-2 overflow-hidden rounded-lg">
              <Image
                src={property.images[0].url}
                alt={property.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {property.images.slice(1, 5).map((img: { id: Key | null | undefined; url: string | StaticImport; caption: any; }, idx: number) => (
              <div key={img.id} className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={img.url}
                  alt={img.caption || `${property.name} - Image ${idx + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </>
        ) : (
          <div className="md:col-span-2 aspect-4/3 bg-muted rounded-lg flex items-center justify-center">
            <Home className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
      </div>

{/* Header Info */}
<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
  <div className="space-y-1.5">
    <div className="flex items-center gap-2.5 flex-wrap">
      <h1 className="text-2xl font-semibold">{property.name}</h1>
      <Badge>{propertyTypeLabels[property.type] || property.type}</Badge>
    </div>
    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
      <span>
        {property.address}, {property.city}, {property.state} {property.zipCode}
      </span>
    </div>
  </div>
  <div className="flex gap-2 shrink-0">
    <Link href={`/dashboard/applications/new?property=${property.id}`}>
      <Button>Apply Now</Button>
    </Link>
    <ContactLandlordButton
      landlordId={property.landlord?.id}
      propertyName={property.name}
      propertyId={property.id}
      variant="outline"
    />
  </div>
</div>

{/* Main Content */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* Left Column */}
  <div className="lg:col-span-2">
    <Tabs defaultValue="units" className="space-y-4">
      <TabsList>
        <TabsTrigger value="units">Available Units</TabsTrigger>
        <TabsTrigger value="amenities">Amenities</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
      </TabsList>

      {/* ── Units Tab ── */}
      <TabsContent value="units" className="space-y-4">
        {property.units.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No units currently available
            </CardContent>
          </Card>
        ) : (
          property.units.map((unit: any) => (
            <Card key={unit.id}>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Unit {unit.unitNumber}</CardTitle>
                    {unit.floor && (
                      <p className="text-sm text-muted-foreground mt-0.5">Floor {unit.floor}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-green-600">
                      ${unit.rentAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x border-b">
                  <div className="flex items-center gap-2 px-5 py-3">
                    <Bed className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{unit.bedrooms}</p>
                      <p className="text-xs text-muted-foreground">Beds</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3">
                    <Bath className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{unit.bathrooms}</p>
                      <p className="text-xs text-muted-foreground">Baths</p>
                    </div>
                  </div>
                  {unit.squareFeet && (
                    <div className="flex items-center gap-2 px-5 py-3">
                      <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{unit.squareFeet}</p>
                        <p className="text-xs text-muted-foreground">sq ft</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {unit.description && (
                  <div className="px-6 py-3 border-b">
                    <p className="text-sm text-muted-foreground">{unit.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {unit.amenities.length > 0 && (
                  <div className="px-6 py-3 border-b">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Unit Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {unit.amenities.map((amenity: any) => (
                        <Badge key={amenity.id} variant="secondary" className="text-xs">
                          {amenity.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deposit + CTA */}
                <div className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Security Deposit</p>
                    <p className="text-sm font-semibold">${unit.deposit.toLocaleString()}</p>
                  </div>
                  <Link href={`/dashboard/applications/new?unit=${unit.id}`}>
                    <Button size="sm">Apply for This Unit</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* ── Amenities Tab ── */}
      <TabsContent value="amenities">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Property Amenities</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Parking */}
            {property.parkingSpaces.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-600 shrink-0" />
                  <p className="text-sm font-medium">Parking Available</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {property.parkingSpaces.length} space{property.parkingSpaces.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Utilities included */}
            {property.utilities.length > 0 && (
              <div className="px-6 py-4 border-b">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
                  Included Utilities
                </p>
                {property.utilities.filter((u: any) => u.isPaidByLandlord).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {property.utilities
                      .filter((u: any) => u.isPaidByLandlord)
                      .map((u: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {u.type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No utilities included</p>
                )}
              </div>
            )}

            {/* Unit amenities grouped */}
            {(() => {
              const allAmenities = property.units.flatMap((unit: any) => unit.amenities);
              const uniqueAmenities = Array.from(
                new Map(allAmenities.map((a: any) => [a.id, a])).values()
              ) as any[];
              const grouped = uniqueAmenities.reduce((acc: any, amenity: any) => {
                const cat = amenity.category || "Other";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(amenity);
                return acc;
              }, {});

              if (uniqueAmenities.length === 0) return null;

              return (
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Unit Amenities
                  </p>
                  <div className="space-y-3">
                    {Object.entries(grouped).map(([category, amenities]) => (
                      <div key={category}>
                        <p className="text-xs text-muted-foreground mb-1.5">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(amenities as any[]).map((a) => (
                            <Badge key={a.id} variant="secondary" className="text-xs">{a.name}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {property.parkingSpaces.length === 0 &&
              property.utilities.length === 0 &&
              property.units.every((u: any) => u.amenities.length === 0) && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No amenities information available
                </div>
              )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ── Policies Tab ── */}
      <TabsContent value="policies" className="space-y-4">
        {property.policies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-medium">No Policies Listed</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact the property manager for policy information.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Property Policies</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {property.policies.map((policy: any, index: number) => (
                  <div key={policy.id || index} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <p className="text-sm font-semibold">{policy.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{policy.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  </div>

  {/* ── Right Sidebar ── */}
  <div className="space-y-4">

    {/* Property Overview */}
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Property Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {property.yearBuilt && (
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Year Built</span>
              </div>
              <span className="text-sm font-semibold">{property.yearBuilt}</span>
            </div>
          )}
          {property.squareFeet && (
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Square className="h-3.5 w-3.5" />
                <span>Property Size</span>
              </div>
              <span className="text-sm font-semibold">
                {property.squareFeet.toLocaleString()} sq ft
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="h-3.5 w-3.5" />
              <span>Available Units</span>
            </div>
            <span className="text-sm font-semibold">{property.units.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Utilities */}
    {property.utilities.length > 0 && (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Utilities
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {property.utilities.map((utility: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-muted-foreground">
                  {utility.type.replace(/_/g, " ")}
                </span>
                <Badge
                  variant={utility.isPaidByLandlord ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {utility.isPaidByLandlord ? "Included" : "Tenant Pays"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Contact */}
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Contact Property Manager</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div className="px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <a href={`mailto:${property.landlord.email}`} className="text-primary hover:underline truncate">
                {property.landlord.email}
              </a>
            </div>
          </div>
          {property.landlord.phone && (
            <div className="px-6 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a href={`tel:${property.landlord.phone}`} className="text-primary hover:underline">
                  {property.landlord.phone}
                </a>
              </div>
            </div>
          )}
          <div className="px-6 py-3">
            <ContactLandlordButton
              landlordId={property.landlord.id}
              propertyName={property.name}
              propertyId={property.id}
              variant="outline"
              size="sm"
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
    </div>
  );
}