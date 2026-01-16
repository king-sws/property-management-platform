/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/users-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Building,
  Home,
  Wrench,
  Star,
  CreditCard,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

interface UsersTableProps {
  users: Array<{
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
  }>;
}

export function UsersTable({ users }: UsersTableProps) {
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
        return <Building className="h-3.5 w-3.5" />;
      case "TENANT":
        return <Home className="h-3.5 w-3.5" />;
      case "VENDOR":
        return <Wrench className="h-3.5 w-3.5" />;
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

  const formatActivityTime = (date: Date, compact: boolean = false) => {
    if (compact) {
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInDays < 7) return `${diffInDays}d ago`;
      return format(date, "MMM d");
    }
    return `Active ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  const getRoleStats = (user: any) => {
    if (!user.roleStats) return null;

    if (user.role === "LANDLORD") {
      return (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <Building className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.roleStats.properties} properties</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.roleStats.subscription}</span>
          </div>
        </div>
      );
    }

    if (user.role === "TENANT") {
      return (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <Home className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.roleStats.activeLeases} leases</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.roleStats.totalPayments} payments</span>
          </div>
        </div>
      );
    }

    if (user.role === "VENDOR") {
      return (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1">
            <Wrench className="h-3 w-3 shrink-0" />
            <span className="truncate">{user.roleStats.completedTickets} jobs</span>
          </div>
          {user.roleStats.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />
              <span className="truncate">{user.roleStats.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] max-w-[250px]">User</TableHead>
              <TableHead className="min-w-[180px] max-w-[200px]">Contact</TableHead>
              <TableHead className="min-w-[100px]">Role</TableHead>
              <TableHead className="min-w-[110px]">Status</TableHead>
              <TableHead className="min-w-[130px] max-w-[150px]">Stats</TableHead>
              <TableHead className="min-w-[80px] max-w-[140px]">
                <span className="hidden xl:inline">Activity</span>
                <span className="xl:hidden">Last Active</span>
              </TableHead>
              <TableHead className="text-right min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell className="min-w-[200px] max-w-[250px]">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/users/${user.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-1 block"
                      >
                        {user.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="hidden lg:inline">Joined </span>
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="min-w-[180px] max-w-[200px]">
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm truncate">{user.email}</div>
                    {user.phone && (
                      <div className="text-xs text-muted-foreground truncate">{user.phone}</div>
                    )}
                  </div>
                </TableCell>

                <TableCell className="min-w-[100px]">
                  <Badge className={getRoleColor(user.role)} variant="secondary">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      {getRoleIcon(user.role)}
                      <span className="hidden sm:inline">{user.role}</span>
                    </span>
                  </Badge>
                </TableCell>

                <TableCell className="min-w-[110px]">
                  <Badge className={getStatusColor(user.status)} variant="secondary">
                    <span className="whitespace-nowrap text-xs">
                      {user.status.replace(/_/g, " ")}
                    </span>
                  </Badge>
                </TableCell>

                <TableCell className="min-w-[130px] max-w-[150px]">
                  <div className="text-muted-foreground">
                    {getRoleStats(user) || "—"}
                  </div>
                </TableCell>

                <TableCell className="min-w-[80px] max-w-[140px]">
                  <div className="text-xs text-muted-foreground">
                    <span className="hidden xl:inline whitespace-nowrap">
                      {formatActivityTime(new Date(user.lastActive), false)}
                    </span>
                    <span className="xl:hidden whitespace-nowrap">
                      {formatActivityTime(new Date(user.lastActive), true)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right min-w-[80px]">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}