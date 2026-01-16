/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/vendors/[id]/page.tsx
import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getVendorById, getVendorStatistics } from "@/actions/vendors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  CheckCircle,
  Shield,
  ArrowLeft,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { VendorStatCards } from "@/components/vendors/vendor-stat-cards";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getVendorById(id);
  
  return {
    title: result.success 
      ? `${result.data.businessName} | Vendor Details`
      : "Vendor Not Found",
  };
}

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  const result = await getVendorById(id);
  
  if (!result.success) {
    notFound();
  }
  
  const vendor = result.data;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendors">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {vendor.businessName}
            </h1>
            <p className="text-muted-foreground">{vendor.user.name}</p>
          </div>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Vendor
        </Button>
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-4"><Card className="p-6 h-32 animate-pulse" /></div>}>
        <VendorStatsWrapper vendorId={id} />
      </Suspense>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Vendor Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={vendor.user.avatar || vendor.user.image} />
                  <AvatarFallback className="text-2xl">
                    {vendor.businessName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{vendor.businessName}</CardTitle>
                  <CardDescription>{vendor.user.name}</CardDescription>
                  <div className="flex items-center gap-2 mt-2">
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
            <CardContent className="space-y-4">
              {/* Rating */}
              {vendor.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(vendor.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({vendor.reviewCount} reviews)
                  </span>
                </div>
              )}

              <Separator />

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Contact Information</h4>
                
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${vendor.user.email}`} className="hover:underline">
                    {vendor.user.email}
                  </a>
                </div>

                {vendor.user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${vendor.user.phone}`} className="hover:underline">
                      {vendor.user.phone}
                    </a>
                  </div>
                )}

                {vendor.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      {vendor.address}
                      {vendor.city && vendor.state && (
                        <>
                          <br />
                          {vendor.city}, {vendor.state} {vendor.zipCode}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Services */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Services Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {vendor.services.map((service: string) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* License & Insurance */}
              {(vendor.licenseNumber || vendor.isInsured) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Credentials</h4>
                    
                    {vendor.licenseNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">License:</span>
                        <span className="font-mono">{vendor.licenseNumber}</span>
                      </div>
                    )}

                    {vendor.isInsured && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Insured</span>
                        </div>
                        {vendor.insuranceExp && (
                          <p className="text-xs text-muted-foreground ml-6">
                            Expires: {format(new Date(vendor.insuranceExp), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tickets" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Tickets</CardTitle>
                  <CardDescription>
                    Maintenance requests assigned to this vendor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vendor.tickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tickets assigned yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vendor.tickets.map((ticket: any) => (
                        <Link
                          key={ticket.id}
                          href={`/dashboard/maintenance/${ticket.id}`}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium">{ticket.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {ticket.property.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {ticket.status.replace(/_/g, " ")}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(ticket.createdAt), "MMM dd")}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    ticket.priority === "URGENT"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {ticket.priority}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews & Ratings</CardTitle>
                  <CardDescription>
                    Feedback from landlords and property managers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vendor.reviews.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No reviews yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vendor.reviews.map((review: any) => (
                        <div
                          key={review.id}
                          className="border-b pb-4 last:border-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{review.author.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(review.createdAt), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.title && (
                            <h4 className="font-medium mb-1">{review.title}</h4>
                          )}
                          {review.comment && (
                            <p className="text-sm text-muted-foreground">
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

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Appointments</CardTitle>
                  <CardDescription>
                    Scheduled maintenance appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vendor.appointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments scheduled
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vendor.appointments.map((appt: any) => (
                        <Card key={appt.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium">{appt.ticket?.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {appt.ticket?.property.name}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(
                                      new Date(appt.scheduledStart),
                                      "MMM dd, yyyy 'at' h:mm a"
                                    )}
                                  </span>
                                </div>
                              </div>
                              <Badge>{appt.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

async function VendorStatsWrapper({ vendorId }: { vendorId: string }) {
  const result = await getVendorStatistics(vendorId);
  
  if (!result.success) {
    return null;
  }
  
  return <VendorStatCards stats={result.data} />;
}