// components/maintenance/maintenance-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, Plus } from "lucide-react";

export function MaintenanceHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Manage maintenance requests and tickets
          </p>
        </div>
      </div>

      <Button onClick={() => router.push("/dashboard/maintenance/new")}>
        <Plus className="mr-2 h-4 w-4" />
        New Request
      </Button>
    </div>
  );
}


// // components/maintenance/maintenance-header.tsx
// "use client";

// import { Button } from "@/components/ui/button";
// import { Plus } from "lucide-react";
// import { useState } from "react";
// import { CreateTicketDialog } from "./create-ticket-dialog";

// export function MaintenanceHeader() {
//   const [showCreateDialog, setShowCreateDialog] = useState(false);

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
//           <p className="text-muted-foreground mt-1">
//             Manage maintenance requests and work orders
//           </p>
//         </div>
//         <Button onClick={() => setShowCreateDialog(true)}>
//           <Plus className="mr-2 h-4 w-4" />
//           New Ticket
//         </Button>
//       </div>

//       <CreateTicketDialog 
//         open={showCreateDialog} 
//         onOpenChange={setShowCreateDialog} 
//       />
//     </>
//   );
// }
