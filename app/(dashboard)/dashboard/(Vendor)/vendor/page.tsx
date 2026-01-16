// app/(dashboard)/dashboard/vendor/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Star,
  DollarSign,
  MapPin
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vendor Dashboard | Property Management",
  description: "Manage your jobs and appointments",
};

export default async function VendorDashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  // Only vendors can access this page
  if (session.user.role !== "VENDOR") {
    const rolePath = session.user.role?.toLowerCase();
    redirect(`/dashboard/${rolePath}`);
  }
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here&rsquo;s your job overview and upcoming appointments</p>
      </div>
      
      {/* Stats */}
      <Suspense fallback={<StatsLoading />}>
        <VendorStats userId={session.user?.id || ""} />
      </Suspense>
      
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Jobs */}
        <Suspense fallback={<CardLoading title="Active Jobs" />}>
          <ActiveJobs userId={session.user.id || ""} />
        </Suspense>
        
        {/* Upcoming Appointments */}
        <Suspense fallback={<CardLoading title="Upcoming Appointments" />}>
          <UpcomingAppointments userId={session.user.id || ""} />
        </Suspense>
      </div>
      
      {/* Recent Reviews */}
      <Suspense fallback={<CardLoading title="Recent Reviews" />}>
        <RecentReviews userId={session.user.id || ""} />
      </Suspense>
    </div>
  );
}

// Stats Component
async function VendorStats({ userId }: { userId: string }) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      tickets: {
        where: { deletedAt: null }
      },
      appointments: true,
      reviews: true,
    },
  });
  
  if (!vendor) {
    return <div>Vendor profile not found</div>;
  }
  
  const activeJobs = vendor.tickets.filter(t => 
    ["OPEN", "IN_PROGRESS", "SCHEDULED"].includes(t.status)
  ).length;
  
  const completedJobs = vendor.tickets.filter(t => t.status === "COMPLETED").length;
  
  const upcomingAppointments = vendor.appointments.filter(a => 
    new Date(a.scheduledStart) > new Date() && a.status === "SCHEDULED"
  ).length;
  
  const avgRating = vendor.rating ? Number(vendor.rating) : 0;
  
  const stats = [
    {
      title: "Active Jobs",
      value: activeJobs,
      icon: Wrench,
      description: "Currently assigned",
      variant: "default" as const,
    },
    {
      title: "Completed Jobs",
      value: completedJobs,
      icon: CheckCircle,
      description: "Total completed",
      variant: "success" as const,
    },
    {
      title: "Upcoming",
      value: upcomingAppointments,
      icon: Calendar,
      description: "Scheduled appointments",
      variant: "default" as const,
    },
    {
      title: "Average Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      description: `${vendor.reviewCount} reviews`,
      variant: avgRating >= 4 ? ("success" as const) : ("default" as const),
    },
  ];
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Active Jobs Component
async function ActiveJobs({ userId }: { userId: string }) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
  });
  
  if (!vendor) return null;
  
  const activeTickets = await prisma.maintenanceTicket.findMany({
    where: {
      vendorId: vendor.id,
      status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
      deletedAt: null,
    },
    include: {
      property: {
        select: {
          name: true,
          address: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  
  const statusColors: Record<string, string> = {
    OPEN: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    SCHEDULED: "bg-green-100 text-green-800",
  };
  
  const priorityColors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-blue-100 text-blue-800",
    HIGH: "bg-orange-100 text-orange-800",
    URGENT: "bg-red-100 text-red-800",
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Jobs</CardTitle>
            <CardDescription>Your current maintenance assignments</CardDescription>
          </div>
          <Badge variant="secondary">{activeTickets.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeTickets.length === 0 ? (
          <div className="text-center py-6">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No active jobs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTickets.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground">{ticket.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{ticket.property.name} - {ticket.property.city}, {ticket.property.state}</span>
                </div>
                
                {ticket.scheduledDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Scheduled: {new Date(ticket.scheduledDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {ticket.estimatedCost && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Estimated: ${Number(ticket.estimatedCost).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/dashboard/maintenance/${ticket.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTickets.length > 0 && (
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/dashboard/maintenance">View All Jobs</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Upcoming Appointments Component
async function UpcomingAppointments({ userId }: { userId: string }) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
  });
  
  if (!vendor) return null;
  
  const today = new Date();
  
  const appointments = await prisma.serviceAppointment.findMany({
    where: {
      vendorId: vendor.id,
      scheduledStart: { gte: today },
      status: { in: ["SCHEDULED", "CONFIRMED"] },
    },
    include: {
      ticket: {
        select: {
          id: true,
          title: true,
          property: {
            select: {
              name: true,
              address: true,
              city: true,
              state: true,
            },
          },
        },
      },
    },
    orderBy: { scheduledStart: "asc" },
    take: 5,
  });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled service calls</CardDescription>
          </div>
          <Badge variant="secondary">{appointments.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const start = new Date(appointment.scheduledStart);
              const end = new Date(appointment.scheduledEnd);
              const isToday = start.toDateString() === today.toDateString();
              
              return (
                <div key={appointment.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{appointment.ticket?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.ticket?.property.name}
                      </p>
                    </div>
                    {isToday && (
                      <Badge variant="destructive">Today</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {appointment.ticket?.property.address}, {appointment.ticket?.property.city}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {start.toLocaleDateString()} • {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="pt-2">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/dashboard/maintenance/${appointment.ticketId}`}>
                        View Job Details
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {appointments.length > 0 && (
          <Button asChild className="w-full mt-4" variant="outline">
            <Link href="/dashboard/appointments">View All Appointments</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Recent Reviews Component
async function RecentReviews({ userId }: { userId: string }) {
  const vendor = await prisma.vendor.findUnique({
    where: { userId },
    include: {
      reviews: {
        include: {
          author: {
            select: {
              name: true,
              avatar: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });
  
  if (!vendor) return null;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              {vendor.rating ? (
                <span className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {Number(vendor.rating).toFixed(1)} average • {vendor.reviewCount} total reviews
                </span>
              ) : (
                "No reviews yet"
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {vendor.reviews.length === 0 ? (
          <div className="text-center py-6">
            <Star className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendor.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{review.author.name}</div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
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
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {review.title && (
                  <h4 className="font-medium mb-1">{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
                
                {(review.qualityRating || review.punctualityRating || review.professionalismRating || review.valueRating) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {review.qualityRating && (
                      <Badge variant="outline" className="text-xs">
                        Quality: {review.qualityRating}/5
                      </Badge>
                    )}
                    {review.punctualityRating && (
                      <Badge variant="outline" className="text-xs">
                        Punctuality: {review.punctualityRating}/5
                      </Badge>
                    )}
                    {review.professionalismRating && (
                      <Badge variant="outline" className="text-xs">
                        Professionalism: {review.professionalismRating}/5
                      </Badge>
                    )}
                    {review.valueRating && (
                      <Badge variant="outline" className="text-xs">
                        Value: {review.valueRating}/5
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading Components
function StatsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CardLoading({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
