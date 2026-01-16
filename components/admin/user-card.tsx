/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/user-card.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Activity,
  Building,
  Home,
  Wrench,
  Star,
  CreditCard,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
    avatar?: string | null;
    createdAt: Date;
    lastActive: Date;
    activityCount: number;
    notificationCount: number;
    roleStats?: any;
  };
}

export function UserCard({ user }: UserCardProps) {
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "LANDLORD":
        return <Building className="h-4 w-4" />;
      case "TENANT":
        return <Home className="h-4 w-4" />;
      case "VENDOR":
        return <Wrench className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-primary/10">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/users/${user.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
              >
                {user.name}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status === "ACTIVE" ? (
                <DropdownMenuItem className="text-red-600">
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getRoleColor(user.role)} variant="secondary">
            <span className="flex items-center gap-1">
              {getRoleIcon(user.role)}
              {user.role}
            </span>
          </Badge>
          <Badge className={getStatusColor(user.status)} variant="secondary">
            {user.status.replace(/_/g, " ")}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {user.phone && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>
              Active {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Role-Specific Stats */}
        {user.roleStats && (
          <div className="pt-3 border-t">
            {user.role === "LANDLORD" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Properties</span>
                  <span className="font-semibold">{user.roleStats.properties}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <Badge variant="outline" className="text-xs">
                    {user.roleStats.subscription}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Subscription
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      user.roleStats.subscriptionStatus === "ACTIVE"
                        ? "text-green-600"
                        : user.roleStats.subscriptionStatus === "TRIAL"
                        ? "text-blue-600"
                        : "text-red-600"
                    }
                  >
                    {user.roleStats.subscriptionStatus}
                  </Badge>
                </div>
              </div>
            )}

            {user.role === "TENANT" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Leases</span>
                  <span className="font-semibold">{user.roleStats.activeLeases}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Total Payments
                  </span>
                  <span className="font-semibold">{user.roleStats.totalPayments}</span>
                </div>
              </div>
            )}

            {user.role === "VENDOR" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed Jobs</span>
                  <span className="font-semibold">{user.roleStats.completedTickets}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-semibold">{user.roleStats.reviews}</span>
                </div>
                {user.roleStats.rating && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Rating
                    </span>
                    <span className="font-semibold">
                      {user.roleStats.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Link href={`/dashboard/users/${user.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}