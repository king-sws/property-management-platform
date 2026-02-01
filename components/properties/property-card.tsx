"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, MapPin, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProperty } from "@/actions/properties";

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    address: string;
    type: string;
    imageUrl?: string;
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    monthlyRevenue: number;
    openTickets: number;
  };
}

const propertyTypeLabels: Record<string, string> = {
  SINGLE_FAMILY: "Single Family",
  MULTI_FAMILY: "Multi Family",
  APARTMENT: "Apartment",
  CONDO: "Condo",
  TOWNHOUSE: "Townhouse",
  COMMERCIAL: "Commercial",
  OTHER: "Other",
};

export function PropertyCard({ property }: PropertyCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 dark:text-green-400";
    if (rate >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProperty(property.id);
      
      if (result.success) {
        toast.success("Property deleted successfully");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Failed to delete property");
      }
    });
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
          {property.imageUrl ? (
            <Image
              src={property.imageUrl}
              alt={property.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-12 w-12 text-slate-400" />
            </div>
          )}
          
          {/* Type Badge */}
          <Badge className="absolute left-3 top-3 bg-white/90 text-slate-900 dark:bg-slate-900/90 dark:text-white">
            {propertyTypeLabels[property.type] || property.type}
          </Badge>

          {/* Actions Menu */}
          <div className="absolute right-3 top-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${property.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/properties/${property.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Open Tickets Badge */}
          {property.openTickets > 0 && (
            <Badge
              variant="destructive"
              className="absolute bottom-3 right-3"
            >
              {property.openTickets} Open Ticket{property.openTickets !== 1 && "s"}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <div>
              <Link href={`/dashboard/properties/${property.id}`}>
                <h3 className="font-semibold leading-none transition-colors hover:text-primary line-clamp-1">
                  {property.name}
                </h3>
              </Link>
              <div className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{property.address}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className={cn("font-semibold", getOccupancyColor(property.occupancyRate))}>
                  {property.occupancyRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {property.occupiedUnits}/{property.totalUnits} units
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                <p className="font-semibold">
                  ${property.monthlyRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="border-t p-4">
          <div className="flex w-full gap-2">
            <Link href={`/dashboard/properties/${property.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <Link href={`/dashboard/properties/${property.id}/units`} className="flex-1">
              <Button variant="default" className="w-full">
                Manage Units
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{property.name}</strong> and all associated data.
              This action cannot be undone.
              {property.occupiedUnits > 0 && (
                <span className="mt-2 block text-destructive">
                  Warning: This property has {property.occupiedUnits} occupied unit(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}