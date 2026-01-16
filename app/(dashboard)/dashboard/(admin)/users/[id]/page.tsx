/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/(admin)/users/[id]/page.tsx
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getUserDetails, getUserStatistics } from "@/actions/admin/users";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Container, Stack } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Activity,
  Building,
  Home,
  Wrench,
  Star,
  FileText,
  Bell,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { UserStatusActions } from "@/components/admin/user-status-actions";
import { UserRoleActions } from "@/components/admin/user-role-actions";
import { UserActivityLog } from "@/components/admin/user-activity-log";
import { SendEmailDialog } from "@/components/admin/send-email-dialog";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const user = await getUserDetails(id);
  const stats = await getUserStatistics(id);

  if (!user) {
    notFound();
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING_VERIFICATION":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "LANDLORD":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "TENANT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "VENDOR":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/users">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Typography variant="h2">User Details</Typography>
              <Typography variant="muted">
                View and manage user information
              </Typography>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - User Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar || user.image || undefined} />
                    <AvatarFallback className="bg-primary/10 text-2xl">
                      {getInitials(user.name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 w-full">
                    <Typography variant="h3">{user.name}</Typography>
                    <Typography variant="muted" className="text-sm">
                      {user.email}
                    </Typography>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge className={getRoleColor(user.role)} variant="secondary">
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)} variant="secondary">
                        {user.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  {user.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="break-all">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Last active {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="space-y-2">
                  <SendEmailDialog
                    userId={user.id} 
                    userEmail={user.email} 
                    userName={user.name || "User"} 
                  />
                  <UserStatusActions userId={user.id} currentStatus={user.status} />
                  <UserRoleActions userId={user.id} currentRole={user.role} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <Typography variant="h4">Quick Stats</Typography>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Logs
                  </span>
                  <span className="font-semibold">{stats?.totalActivity || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </span>
                  <span className="font-semibold">{stats?.totalNotifications || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </span>
                  <span className="font-semibold">{stats?.totalMessages || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </span>
                  <span className="font-semibold">{stats?.totalDocuments || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Role Specific Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role-Specific Stats */}
            {user.role === "LANDLORD" && user.landlordProfile && stats?.landlord && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    <Typography variant="h4">Landlord Information</Typography>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Properties
                      </Typography>
                      <Typography variant="h3">{stats.landlord.totalProperties}</Typography>
                    </div>
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Total Revenue
                      </Typography>
                      <Typography variant="h3">
                        ${stats.landlord.totalRevenue.toLocaleString()}
                      </Typography>
                    </div>
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Subscription Plan
                      </Typography>
                      <Badge variant="outline">{stats.landlord.subscriptionTier}</Badge>
                    </div>
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Subscription Status
                      </Typography>
                      <Badge
                        variant="outline"
                        className={
                          stats.landlord.subscriptionStatus === "ACTIVE"
                            ? "text-green-600"
                            : stats.landlord.subscriptionStatus === "TRIAL"
                            ? "text-blue-600"
                            : "text-red-600"
                        }
                      >
                        {stats.landlord.subscriptionStatus}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === "TENANT" && user.tenantProfile && stats?.tenant && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    <Typography variant="h4">Tenant Information</Typography>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Active Leases
                      </Typography>
                      <Typography variant="h3">{stats.tenant.activeLeases}</Typography>
                    </div>
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Total Payments
                      </Typography>
                      <Typography variant="h3">{stats.tenant.totalPayments}</Typography>
                    </div>
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Amount Paid
                      </Typography>
                      <Typography variant="h3">
                        ${stats.tenant.totalPaid.toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.role === "VENDOR" && user.vendorProfile && stats?.vendor && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    <Typography variant="h4">Vendor Information</Typography>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Total Tickets
                      </Typography>
                      <Typography variant="h3">{stats.vendor.totalTickets}</Typography>
                    </div>
                    <div className="space-y-2">
                      <Typography variant="muted" className="text-sm">
                        Reviews
                      </Typography>
                      <Typography variant="h3">{stats.vendor.totalReviews}</Typography>
                    </div>
                    {stats.vendor.rating && (
                      <div className="space-y-2">
                        <Typography variant="muted" className="text-sm flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          Rating
                        </Typography>
                        <Typography variant="h3">{stats.vendor.rating.toFixed(1)}</Typography>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <Typography variant="h4">Recent Activity</Typography>
              </CardHeader>
              <CardContent>
                <UserActivityLog activities={user.activityLogs} />
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <Typography variant="h4">Recent Notifications</Typography>
              </CardHeader>
              <CardContent>
                {user.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {user.notifications.map((notification: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; message: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; }) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                      >
                        <Bell className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <Typography className="text-sm font-medium">
                            {notification.title}
                          </Typography>
                          <Typography variant="muted" className="text-xs">
                            {notification.message}
                          </Typography>
                          <Typography variant="muted" className="text-xs">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography variant="muted" className="text-center py-8">
                    No notifications yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Stack>
    </Container>
  );
}