// components/properties/amenities-picker.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Search, X } from "lucide-react";
import { getAllAmenities, createAmenity, setUnitAmenities } from "@/actions/policies-amenities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Amenity {
  id: string;
  name: string;
  category: string | null;
  icon: string | null;
}

interface AmenitiesPickerProps {
  unitId: string;
  initialAmenityIds?: string[];
  onSaved?: () => void;
}

export function AmenitiesPicker({ unitId, initialAmenityIds = [], onSaved }: AmenitiesPickerProps) {
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAmenityIds));
  const [search, setSearch] = useState("");
  const [newAmenityName, setNewAmenityName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    getAllAmenities().then((result) => {
      if (result.success && result.data) setAllAmenities(result.data);
      setIsLoading(false);
    });
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateAmenity = async () => {
    const name = newAmenityName.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const result = await createAmenity(name);
      if (result.success && result.data) {
        setAllAmenities((prev) => [...prev, { ...result.data!, category: "Other", icon: null }]);
        setSelected((prev) => new Set([...prev, result.data!.id]));
        setNewAmenityName("");
        toast.success(`"${name}" added`);
      } else {
        toast.error(result.error || "Failed to create amenity");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await setUnitAmenities(unitId, Array.from(selected));
      if (result.success) {
        toast.success("Amenities saved");
        onSaved?.();
      } else {
        toast.error(result.error || "Failed to save amenities");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Group by category
  const filtered = allAmenities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc: Record<string, Amenity[]>, amenity) => {
    const cat = amenity.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(amenity);
    return acc;
  }, {});

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading amenities...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Selected badges */}
      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from(selected).map((id) => {
            const amenity = allAmenities.find((a) => a.id === id);
            if (!amenity) return null;
            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {amenity.name}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search amenities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grouped amenities */}
      <div className="max-h-56 overflow-y-auto space-y-3 border rounded-lg p-3">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No amenities found
          </p>
        ) : (
          Object.entries(grouped).map(([category, amenities]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => {
                  const isSelected = selected.has(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggle(amenity.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {amenity.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add custom amenity */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom amenity..."
          value={newAmenityName}
          onChange={(e) => setNewAmenityName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateAmenity();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCreateAmenity}
          disabled={!newAmenityName.trim() || isCreating}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Save button */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? "Saving..." : "Save Amenities"}
      </Button>
    </div>
  );
}