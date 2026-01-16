// components/admin/system/system-settings.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SystemSettingsProps {
  data: Array<{
    id: string;
    key: string;
    value: string;
    type: string;
    description: string | null;
    isPublic: boolean;
  }> | null;
}

export function SystemSettings({ data }: SystemSettingsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No system settings configured
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 10).map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{setting.key}</span>
                  {setting.isPublic && (
                    <Badge variant="outline" className="text-xs">Public</Badge>
                  )}
                </div>
                {setting.description && (
                  <p className="text-xs text-muted-foreground text-wrap mt-1">{setting.description}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground ml-4 truncate max-w-37.5">
                {setting.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}