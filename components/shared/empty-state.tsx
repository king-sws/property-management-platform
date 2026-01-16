
// components/shared/empty-state.tsx
import { ReactNode } from "react";
import { Typography } from "@/components/ui/typography";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <Typography variant="h4" className="mb-2">
        {title}
      </Typography>
      <Typography variant="muted" className="mb-6 max-w-md">
        {description}
      </Typography>
      {action}
    </div>
  );
}