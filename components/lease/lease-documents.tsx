/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// components/lease/lease-documents.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { getLeaseDocuments } from "@/actions/my-lease";
import { toast } from "sonner";

interface LeaseDocumentsProps {
  leaseId: string;
}

export function LeaseDocuments({ leaseId }: LeaseDocumentsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      const result = await getLeaseDocuments(leaseId);
      if (result.success) {
        setDocuments(result.data);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    }
    loadDocuments();
  }, [leaseId]);

  const getDocumentIcon = (type: string) => {
    return <FileText className="h-5 w-5" />;
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case "LEASE":
        return "default";
      case "AMENDMENT":
        return "secondary";
      case "NOTICE":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Loading documents...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lease Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents available
            </p>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </span>
                      {doc.fileSize && (
                        <>
                          <span>•</span>
                          <span>
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getDocumentColor(doc.type)}>
                    {doc.type}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.fileUrl} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}