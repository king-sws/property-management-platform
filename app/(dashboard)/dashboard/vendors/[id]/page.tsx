/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/vendors/[id]/page.tsx
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getVendorById, getVendorStatistics } from "@/actions/vendors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail, Phone, MapPin, Star, Calendar,
  CheckCircle, Shield, ArrowLeft, Edit,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { VendorStatCards } from "@/components/vendors/vendor-stat-cards";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getVendorById(id);
  return {
    title: result.success
      ? `${result.data.businessName} | Vendor Details`
      : "Vendor Not Found",
  };
}

const statusVariant: Record<string, { label: string; className: string }> = {
  OPEN:           { label: "Open",           className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  IN_PROGRESS:    { label: "In Progress",    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  WAITING_VENDOR: { label: "Waiting Vendor", className: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300" },
  WAITING_PARTS:  { label: "Waiting Parts",  className: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" },
  SCHEDULED:      { label: "Scheduled",      className: "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300" },
  COMPLETED:      { label: "Completed",      className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  CANCELLED:      { label: "Cancelled",      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

const priorityVariant: Record<string, { label: string; className: string }> = {
  LOW:    { label: "Low",    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  MEDIUM: { label: "Medium", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
  HIGH:   { label: "High",   className: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300" },
  URGENT: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) redirect("/sign-in");

  const result = await getVendorById(id);
  if (!result.success) notFound();

  const vendor = result.data;

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/dashboard/vendors">
              <ArrowLeft className="h-4 w-4" />
              Back to Vendors
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/vendors/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Vendor
            </Link>
          </Button>
        </div>

        {/* ── Stat cards ── */}
        <Suspense fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
          </div>
        }>
          <VendorStatsWrapper vendorId={id} />
        </Suspense>

        {/* ── Main layout ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left: profile card */}
          <div className="lg:col-span-1">
            <Card>
              {/* Avatar + name */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={vendor.user.avatar || vendor.user.image} />
                    <AvatarFallback className="text-xl">
                      {vendor.businessName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="truncate">{vendor.businessName}</CardTitle>
                    <CardDescription className="truncate">{vendor.user.name}</CardDescription>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant={vendor.isActive ? "default" : "secondary"}>
                        {vendor.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {vendor.category.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Rating */}
                {vendor.rating && (
                  <div className="px-6 py-4 border-b flex items-center gap-2">
                    <StarRating rating={vendor.rating} />
                    <span className="text-sm font-medium">{Number(vendor.rating).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Contact */}
                <div className="px-6 py-4 border-b space-y-2.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Contact
                  </p>
                  <a
                    href={`mailto:${vendor.user.email}`}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{vendor.user.email}</span>
                  </a>
                  {vendor.user.phone && (
                    <a
                      href={`tel:${vendor.user.phone}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {vendor.user.phone}
                    </a>
                  )}
                  {vendor.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <div>
                        <p>{vendor.address}</p>
                        {vendor.city && vendor.state && (
                          <p>{vendor.city}, {vendor.state} {vendor.zipCode}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Services */}
                {vendor.services?.length > 0 && (
                  <div className="px-6 py-4 border-b">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Services
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {vendor.services.map((service: string) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credentials */}
                {(vendor.licenseNumber || vendor.isInsured) && (
                  <div className="px-6 py-4 space-y-2.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Credentials
                    </p>
                    {vendor.licenseNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span className="text-muted-foreground">License:</span>
                        <span className="font-mono text-xs">{vendor.licenseNumber}</span>
                      </div>
                    )}
                    {vendor.isInsured && (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          <span className="font-medium">Insured</span>
                        </div>
                        {vendor.insuranceExp && (
                          <p className="text-xs text-muted-foreground pl-5">
                            Expires {format(new Date(vendor.insuranceExp), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tickets" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tickets">
                  Tickets
                  {vendor.tickets?.length > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({vendor.tickets.length})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews
                  {vendor.reviews?.length > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({vendor.reviews.length})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  Appointments
                  {vendor.appointments?.length > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({vendor.appointments.length})
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tickets tab */}
              <TabsContent value="tickets">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Assigned Tickets</CardTitle>
                    <CardDescription>
                      Maintenance requests assigned to this vendor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {vendor.tickets?.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        No tickets assigned yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {vendor.tickets.map((ticket: any) => (
                          <Link
                            key={ticket.id}
                            href={`/dashboard/maintenance/${ticket.id}`}
                            className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{ticket.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {ticket.property.name} · {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                              </p>
                              <div className="mt-1.5">
                                <Badge className={statusVariant[ticket.status]?.className ?? ""}>
                                  {statusVariant[ticket.status]?.label ?? ticket.status.replace(/_/g, " ")}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`${priorityVariant[ticket.priority]?.className ?? ""} shrink-0`}>
                              {priorityVariant[ticket.priority]?.label ?? ticket.priority}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Reviews & Ratings</CardTitle>
                    <CardDescription>
                      Feedback from landlords and property managers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {vendor.reviews?.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        No reviews yet
                      </div>
                    ) : (
                      <div className="divide-y">
                        {vendor.reviews.map((review: any) => (
                          <div key={review.id} className="px-6 py-4 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-medium">{review.author.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(review.createdAt), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <StarRating rating={review.rating} />
                                <span className="text-xs text-muted-foreground">
                                  {review.rating}.0
                                </span>
                              </div>
                            </div>
                            {review.title && (
                              <p className="text-sm font-medium">{review.title}</p>
                            )}
                            {review.comment && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments tab */}
              <TabsContent value="appointments">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>Service Appointments</CardTitle>
                    <CardDescription>
                      Scheduled maintenance appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {vendor.appointments?.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        No appointments scheduled
                      </div>
                    ) : (
                      <div className="divide-y">
                        {vendor.appointments.map((appt: any) => (
                          <div key={appt.id} className="px-6 py-4 flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-medium truncate">
                                {appt.ticket?.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {appt.ticket?.property.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {format(new Date(appt.scheduledStart), "MMM dd, yyyy 'at' h:mm a")}
                              </div>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {appt.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Stack>
    </Container>
  );
}

async function VendorStatsWrapper({ vendorId }: { vendorId: string }) {
  const result = await getVendorStatistics(vendorId);
  if (!result.success) return null;
  return <VendorStatCards stats={result.data} />;
}