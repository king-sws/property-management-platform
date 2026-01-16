/* eslint-disable react-hooks/exhaustive-deps */
// app/(dashboard)/dashboard/tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Clock, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import Link from "next/link";
import { getMaintenanceTickets } from "@/actions/maintenance";
import { formatDistanceToNow } from "date-fns";

type Ticket = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "WAITING_VENDOR" | "WAITING_PARTS" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  location?: string;
  estimatedCost?: number;
  actualCost?: number;
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  property: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
};

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusColors = {
  OPEN: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  WAITING_VENDOR: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  WAITING_PARTS: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  SCHEDULED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusIcons = {
  OPEN: Clock,
  IN_PROGRESS: Clock,
  WAITING_VENDOR: AlertCircle,
  WAITING_PARTS: AlertCircle,
  SCHEDULED: Calendar,
  COMPLETED: CheckCircle2,
  CANCELLED: AlertCircle,
};

export default function VendorTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const loadTickets = async () => {
    setLoading(true);
    const result = await getMaintenanceTickets({
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
      category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      search: search || undefined,
    });

    if (result.success && result.data) {
      setTickets(result.data.tickets || []);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    loadTickets();
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (search && !ticket.title.toLowerCase().includes(search.toLowerCase()) &&
        !ticket.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const activeTickets = filteredTickets.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "SCHEDULED"
  );
  const pendingTickets = filteredTickets.filter(
    (t) => t.status === "OPEN" || t.status === "WAITING_VENDOR" || t.status === "WAITING_PARTS"
  );
  const completedTickets = filteredTickets.filter((t) => t.status === "COMPLETED");

  const categories = Array.from(new Set(tickets.map((t) => t.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Maintenance Tickets</h1>
        <p className="text-muted-foreground">
          Manage your assigned maintenance tickets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTickets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTickets.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeTickets.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTickets.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <TicketList tickets={activeTickets} loading={loading} />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <TicketList tickets={pendingTickets} loading={loading} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <TicketList tickets={completedTickets} loading={loading} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <TicketList tickets={filteredTickets} loading={loading} />
        </TabsContent>
      </Tabs>

      
    </div>
  );
}

function TicketList({ tickets, loading }: { tickets: Ticket[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Filter className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No tickets found</CardTitle>
          <CardDescription>
            Try adjusting your filters or check back later
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => {
        const StatusIcon = statusIcons[ticket.status];
        return (
          <Link key={ticket.id} href={`/dashboard/maintenance/${ticket.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <StatusIcon className="h-5 w-5" />
                      {ticket.title}
                    </CardTitle>
                    <CardDescription>
                      {ticket.property.name} - {ticket.property.city}, {ticket.property.state}
                      {ticket.location && ` • ${ticket.location}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        Category: <span className="font-medium text-foreground">{ticket.category}</span>
                      </span>
                      {ticket.estimatedCost && (
                        <span className="text-muted-foreground">
                          Est. Cost: <span className="font-medium text-foreground">${ticket.estimatedCost.toFixed(2)}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {ticket.scheduledDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Scheduled: {new Date(ticket.scheduledDate).toLocaleDateString()}
                    </div>
                  )}

                  
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}