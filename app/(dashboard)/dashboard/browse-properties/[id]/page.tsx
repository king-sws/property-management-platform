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
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPropertyForTenant } from "@/actions/browse-properties";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";


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
        <Button variant="ghost">
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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <Badge>{propertyTypeLabels[property.type] || property.type}</Badge>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
            <span>
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/dashboard/applications/new?property=${property.id}`}>
            <Button size="lg">
              Apply Now
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="units" className="space-y-4">
            <TabsList>
              <TabsTrigger value="units">Available Units</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            {/* Units Tab */}
            <TabsContent value="units" className="space-y-4">
              {property.units.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No units currently available</p>
                  </CardContent>
                </Card>
              ) : (
                property.units.map((unit: { id: Key | null | undefined; unitNumber: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; floor: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; rentAmount: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; bedrooms: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; bathrooms: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; squareFeet: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; amenities: any[]; deposit: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; }) => (
                  <Card key={unit.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Unit {unit.unitNumber}</CardTitle>
                          {unit.floor && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Floor {unit.floor}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${unit.rentAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">/month</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Unit Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Bed className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{unit.bedrooms}</p>
                            <p className="text-xs text-muted-foreground">Bedrooms</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bath className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{unit.bathrooms}</p>
                            <p className="text-xs text-muted-foreground">Bathrooms</p>
                          </div>
                        </div>
                        {unit.squareFeet && (
                          <div className="flex items-center gap-2">
                            <Square className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold">{unit.squareFeet}</p>
                              <p className="text-xs text-muted-foreground">sq ft</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {unit.description && (
                        <p className="text-sm text-muted-foreground">{unit.description}</p>
                      )}

                      {/* Amenities */}
                      {unit.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2">Unit Amenities:</p>
                          <div className="flex flex-wrap gap-2">
                            {unit.amenities.map((amenity: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
                              <Badge key={amenity.id} variant="secondary">
                                {amenity.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deposit Info */}
                      <div className="pt-4 border-t flex items-center justify-between">
                        <div className="text-sm">
                          <p className="text-muted-foreground">Security Deposit</p>
                          <p className="font-semibold">${unit.deposit.toLocaleString()}</p>
                        </div>
                        <Link href={`/dashboard/applications/new?unit=${unit.id}`}>
                          <Button>Apply for This Unit</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* You can add property-level amenities here */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.parkingSpaces.length > 0 && (
                      <div className="flex items-start gap-3">
                        <Car className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold">Parking Available</p>
                          <p className="text-sm text-muted-foreground">
                            {property.parkingSpaces.length} spaces
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-4">
              {property.policies.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No policies listed</p>
                  </CardContent>
                </Card>
              ) : (
                property.policies.map((policy: { name: boolean | Key | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {policy.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{policy.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Property Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.yearBuilt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Built</span>
                  </div>
                  <span className="font-semibold">{property.yearBuilt}</span>
                </div>
              )}
              {property.squareFeet && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Square className="h-4 w-4" />
                    <span className="text-sm">Property Size</span>
                  </div>
                  <span className="font-semibold">{property.squareFeet.toLocaleString()} sq ft</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Available Units</span>
                </div>
                <span className="font-semibold">{property.units.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Utilities */}
          {property.utilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Utilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {property.utilities.map((utility: { type: string; isPaidByLandlord: any; }, idx: Key | null | undefined) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{utility.type.replace("_", " ")}</span>
                    <Badge variant={utility.isPaidByLandlord ? "secondary" : "outline"}>
                      {utility.isPaidByLandlord ? "Included" : "Tenant Pays"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Contact Landlord */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Property Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${property.landlord.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {property.landlord.email}
                </a>
              </div>
              {property.landlord.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${property.landlord.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {property.landlord.phone}
                  </a>
                </div>
              )}
              <Button className="w-full mt-4" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}