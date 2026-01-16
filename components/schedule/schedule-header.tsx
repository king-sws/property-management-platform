// components/schedule/schedule-header.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateAppointmentDialog } from "./create-appointment-dialog";

interface ScheduleHeaderProps {
  role: "vendor" | "landlord";
}

export function ScheduleHeader({ role }: ScheduleHeaderProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">
            {role === "vendor" 
              ? "View your upcoming appointments" 
              : "Manage maintenance appointments"}
          </p>
        </div>
        
        {role === "landlord" && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        )}
      </div>
      
      {role === "landlord" && (
        <CreateAppointmentDialog open={open} onOpenChange={setOpen} />
      )}
    </>
  );
}