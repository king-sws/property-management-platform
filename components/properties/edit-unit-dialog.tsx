/* eslint-disable @typescript-eslint/no-unused-vars */
// ============================================================================
// FILE: src/components/properties/edit-unit-dialog.tsx
// Edit Unit Dialog Component
// ============================================================================

"use client";

import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUnit } from "@/actions/units";
import { toast } from "sonner";

interface EditUnitDialogProps {
  unit: {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet?: number | null;
    floor?: number | null;
    rentAmount: number;
    deposit: number;
    description?: string | null;
    status: string;
  };
  propertyId: string;
}

export default function EditUnitDialog({ unit, propertyId }: EditUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    unitNumber: unit.unitNumber,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    squareFeet: unit.squareFeet || "",
    floor: unit.floor || "",
    rentAmount: unit.rentAmount,
    deposit: unit.deposit,
    description: unit.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateUnit(unit.id, {
        unitNumber: formData.unitNumber,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        squareFeet: formData.squareFeet ? Number(formData.squareFeet) : undefined,
        floor: formData.floor ? Number(formData.floor) : undefined,
        rentAmount: Number(formData.rentAmount),
        deposit: Number(formData.deposit),
        description: formData.description || undefined,
      });

      if (result.success) {
        toast("Unit updated successfully");
        setOpen(false);
        window.location.reload(); // Refresh to show updated data
      } else {
        toast("Failed to update unit");
      }
    } catch (error) {
      toast("Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit {unit.unitNumber}</DialogTitle>
          <DialogDescription>
            Update the details for this unit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Unit Number */}
            <div>
              <Label htmlFor="unitNumber">
                Unit Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unitNumber"
                value={formData.unitNumber}
                onChange={(e) =>
                  setFormData({ ...formData, unitNumber: e.target.value })
                }
                required
              />
            </div>

            {/* Floor */}
            <div>
              <Label htmlFor="floor">Floor (Optional)</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Bedrooms */}
            <div>
              <Label htmlFor="bedrooms">
                Bedrooms <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: Number(e.target.value) })
                }
                required
              />
            </div>

            {/* Bathrooms */}
            <div>
              <Label htmlFor="bathrooms">
                Bathrooms <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bathrooms"
                type="number"
                step="0.5"
                min="0"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bathrooms: Number(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          {/* Square Feet */}
          <div>
            <Label htmlFor="squareFeet">Square Feet (Optional)</Label>
            <Input
              id="squareFeet"
              type="number"
              min="0"
              value={formData.squareFeet}
              onChange={(e) =>
                setFormData({ ...formData, squareFeet: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Rent Amount */}
            <div>
              <Label htmlFor="rentAmount">
                Monthly Rent ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rentAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.rentAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rentAmount: Number(e.target.value),
                  })
                }
                required
              />
            </div>

            {/* Deposit */}
            <div>
              <Label htmlFor="deposit">
                Security Deposit ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                min="0"
                value={formData.deposit}
                onChange={(e) =>
                  setFormData({ ...formData, deposit: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Additional details about this unit..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}