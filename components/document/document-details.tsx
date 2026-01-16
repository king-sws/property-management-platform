/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/document/document-details.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  ArrowLeft,
  Download,
  Trash2,
  Edit,
  FileText,
  Calendar,
  User,
  MapPin,
  Tag,
  Eye,
  EyeOff,
  Clock,
  FileImage,
  FileSpreadsheet,
  File as FileIcon,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { deleteDocument } from "@/actions/documents";
import { toast } from "sonner";

interface DocumentDetailsProps {
  document: any;
}

const documentTypes = [
  { value: "LEASE", label: "Lease Agreement" },
  { value: "AMENDMENT", label: "Amendment" },
  { value: "NOTICE", label: "Notice" },
  { value: "INSPECTION_REPORT", label: "Inspection Report" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "TAX_DOCUMENT", label: "Tax Document" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "WARRANTY", label: "Warranty" },
  { value: "W9", label: "W-9" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "OTHER", label: "Other" },
];

const typeColors: Record<string, string> = {
  LEASE: "bg-blue-100 text-blue-800",
  AMENDMENT: "bg-purple-100 text-purple-800",
  NOTICE: "bg-yellow-100 text-yellow-800",
  INSPECTION_REPORT: "bg-teal-100 text-teal-800",
  RECEIPT: "bg-green-100 text-green-800",
  TAX_DOCUMENT: "bg-orange-100 text-orange-800",
  INSURANCE: "bg-red-100 text-red-800",
  WARRANTY: "bg-indigo-100 text-indigo-800",
  W9: "bg-pink-100 text-pink-800",
  BANK_STATEMENT: "bg-cyan-100 text-cyan-800",
  OTHER: "bg-gray-100 text-gray-800",
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <FileImage className="h-8 w-8" />;
  } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="h-8 w-8" />;
  } else if (mimeType.includes("pdf")) {
    return <FileText className="h-8 w-8" />;
  }
  return <FileIcon className="h-8 w-8" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function DocumentDetails({ document }: DocumentDetailsProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeLabel = documentTypes.find((t) => t.value === document.type)?.label || document.type;

  const handleDownload = async () => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = document.fileUrl;
      link.download = document.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDocument(document.id);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/documents");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const isExpired = document.expiresAt && new Date(document.expiresAt) < new Date();
  const isExpiringSoon =
    document.expiresAt &&
    new Date(document.expiresAt) > new Date() &&
    new Date(document.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/documents/${document.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                    {getFileIcon(document.mimeType)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{document.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {formatFileSize(document.fileSize)} • {document.mimeType}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={typeColors[document.type]}>{typeLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {document.description && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm">{document.description}</p>
                </div>
              )}

              {/* Preview for images */}
              {document.mimeType.startsWith("image/") && (
                <div className="mt-4">
                  <img
                    src={document.fileUrl}
                    alt={document.name}
                    className="rounded-lg border max-h-96 w-full object-contain"
                  />
                </div>
              )}

              {/* Preview for PDFs */}
              {document.mimeType === "application/pdf" && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full" onClick={handleDownload}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open PDF in New Tab
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          {document.tags && document.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property */}
              {document.property && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Property</p>
                    <p className="text-sm text-muted-foreground">{document.property.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {document.property.address}, {document.property.city}, {document.property.state}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Uploaded By */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Uploaded By</p>
                  <p className="text-sm text-muted-foreground">{document.uploadedBy.name}</p>
                  <p className="text-xs text-muted-foreground">{document.uploadedBy.email}</p>
                </div>
              </div>

              <Separator />

              {/* Created Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Uploaded</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(document.createdAt), "PPP")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(document.createdAt), "p")}
                  </p>
                </div>
              </div>

              {/* Expiration Date */}
              {document.expiresAt && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Expires</p>
                      <p className={`text-sm ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-muted-foreground"}`}>
                        {format(new Date(document.expiresAt), "PPP")}
                      </p>
                      {isExpired && (
                        <Badge variant="destructive" className="mt-1">
                          Expired
                        </Badge>
                      )}
                      {isExpiringSoon && (
                        <Badge variant="outline" className="mt-1 border-orange-600 text-orange-600">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Visibility */}
              <div className="flex items-start gap-3">
                {document.isPublic ? (
                  <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    {document.isPublic ? "Public (visible to tenants)" : "Private"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/dashboard/documents/${document.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Document
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &#34;{document.name}"? This action cannot be undone and the file will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}