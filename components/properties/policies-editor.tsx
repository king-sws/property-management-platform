// components/properties/policies-editor.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { upsertPropertyPolicies } from "@/actions/policies-amenities";
import { toast } from "sonner";

interface Policy {
  id?: string;
  name: string;
  description: string;
  order: number;
}

interface PoliciesEditorProps {
  propertyId: string;
  initialPolicies?: Policy[];
}

export function PoliciesEditor({ propertyId, initialPolicies = [] }: PoliciesEditorProps) {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [isSaving, setIsSaving] = useState(false);

  const addPolicy = () => {
    setPolicies((prev) => [
      ...prev,
      { name: "", description: "", order: prev.length },
    ]);
  };

  const removePolicy = (index: number) => {
    setPolicies((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePolicy = (index: number, field: keyof Policy, value: string) => {
    setPolicies((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async () => {
    // Validate — every policy needs a name
    const invalid = policies.find((p) => !p.name.trim());
    if (invalid) {
      toast.error("All policies must have a name");
      return;
    }

    setIsSaving(true);
    try {
      const result = await upsertPropertyPolicies(
        propertyId,
        policies.map((p, i) => ({ ...p, order: i }))
      );
      if (result.success) {
        toast.success("Policies saved");
      } else {
        toast.error(result.error || "Failed to save policies");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {policies.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          No policies yet. Add your first policy below.
        </p>
      )}

      {policies.map((policy, index) => (
        <Card key={index} className="border border-border">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Policy name (e.g. No Smoking, Pet Policy)"
                value={policy.name}
                onChange={(e) => updatePolicy(index, "name", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePolicy(index)}
                className="shrink-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Describe this policy..."
              value={policy.description}
              onChange={(e) => updatePolicy(index, "description", e.target.value)}
              rows={2}
              className="ml-6 w-[calc(100%-1.5rem)]"
            />
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPolicy}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
        {policies.length > 0 && (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Policies"}
          </Button>
        )}
      </div>
    </div>
  );
}