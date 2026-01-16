/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/maintenance/assign-vendor-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Star, Search, Loader2 } from "lucide-react";
import { getVendors } from "@/actions/vendors";
import { updateMaintenanceTicket } from "@/actions/maintenance";
import { toast } from "sonner";

interface AssignVendorDialogProps {
  ticketId: string;
  currentVendorId?: string;
  ticketCategory?: string;
}

export function AssignVendorDialog({
  ticketId,
  currentVendorId,
  ticketCategory,
}: AssignVendorDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ticketCategory || "ALL");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(
    currentVendorId || null
  );

  // Load vendors when dialog opens
  useEffect(() => {
    if (open) {
      loadVendors();
    }
  }, [open]);

  // Filter vendors based on search and category
  useEffect(() => {
    let filtered = vendors;

    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.businessName.toLowerCase().includes(search.toLowerCase()) ||
          v.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== "ALL") {
      filtered = filtered.filter((v) => v.category === category);
    }

    setFilteredVendors(filtered);
  }, [search, category, vendors]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const result = await getVendors({ isActive: true, limit: 50 });
      if (result.success) {
        setVendors(result.data.vendors);
        setFilteredVendors(result.data.vendors);
      } else {
        toast.error("Failed to load vendors");
      }
    } catch (error) {
      toast.error("Error loading vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedVendorId) {
      toast.error("Please select a vendor");
      return;
    }

    setLoading(true);
    try {
      const selectedVendor = vendors.find((v) => v.id === selectedVendorId);
      
      const result = await updateMaintenanceTicket(ticketId, {
        vendorId: selectedVendorId,
        assignedToId: selectedVendor?.userId,
        status: "IN_PROGRESS",
      });

      if (result.success) {
        toast.success("Vendor assigned successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to assign vendor");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async () => {
    setLoading(true);
    try {
      const result = await updateMaintenanceTicket(ticketId, {
        vendorId: undefined,
        assignedToId: undefined,
      });

      if (result.success) {
        toast.success("Vendor unassigned");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unassign vendor");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          {currentVendorId ? "Change Vendor" : "Assign Vendor"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Assign Vendor</DialogTitle>
          <DialogDescription>
            Select a vendor to assign to this maintenance ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="PLUMBER">Plumber</SelectItem>
                <SelectItem value="ELECTRICIAN">Electrician</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="LANDSCAPING">Landscaping</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="HANDYMAN">Handyman</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vendors found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                        selectedVendorId === vendor.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedVendorId(vendor.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={vendor.user.avatar || vendor.user.image}
                          />
                          <AvatarFallback>
                            {vendor.businessName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {vendor.businessName}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {vendor.user.name}
                              </p>
                            </div>
                            {vendor.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">
                                  {vendor.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {vendor.category.replace(/_/g, " ")}
                            </Badge>
                            {vendor.tickets.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {vendor.tickets.length} active jobs
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {vendor.services.slice(0, 3).map((service: string) => (
                              <span
                                key={service}
                                className="text-xs text-muted-foreground"
                              >
                                {service}
                                {vendor.services.indexOf(service) < 2 && " • "}
                              </span>
                            ))}
                            {vendor.services.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{vendor.services.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {currentVendorId && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={loading}
            >
              Unassign Current
            </Button>
          )}
          <Button
            onClick={handleAssign}
            disabled={!selectedVendorId || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Vendor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
