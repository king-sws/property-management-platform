// components/admin/analytics/date-range-selector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

interface DateRangeSelectorProps {
  currentRange: string;
}

export function DateRangeSelector({ currentRange }: DateRangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRangeChange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="90days">Last 90 days</SelectItem>
          <SelectItem value="1year">Last year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}