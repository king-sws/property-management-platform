/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/documents/document-details.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  ArrowLeft, Download, Trash2, Edit, FileText, Calendar,
  User, MapPin, Tag, Eye, EyeOff, Clock,
  FileImage, FileSpreadsheet, File as FileIcon, ExternalLink, Mail,
} from "lucide-react";
import { format } from "date-fns";
import { deleteDocument } from "@/actions/documents";
import { toast } from "sonner";

interface DocumentDetailsProps {
  document: any;
}

const documentTypes = [
  { value: "LEASE",             label: "Lease Agreement" },
  { value: "AMENDMENT",         label: "Amendment" },
  { value: "NOTICE",            label: "Notice" },
  { value: "INSPECTION_REPORT", label: "Inspection Report" },
  { value: "RECEIPT",           label: "Receipt" },
  { value: "TAX_DOCUMENT",      label: "Tax Document" },
  { value: "INSURANCE",         label: "Insurance" },
  { value: "WARRANTY",          label: "Warranty" },
  { value: "W9",                label: "W-9" },
  { value: "BANK_STATEMENT",    label: "Bank Statement" },
  { value: "OTHER",             label: "Other" },
];

const typeColors: Record<string, string> = {
  LEASE:             "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  AMENDMENT:         "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  NOTICE:            "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  INSPECTION_REPORT: "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  RECEIPT:           "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  TAX_DOCUMENT:      "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  INSURANCE:         "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  WARRANTY:          "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  W9:                "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300",
  BANK_STATEMENT:    "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300",
  OTHER:             "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

function getFileIcon(mimeType: string, size = "md") {
  const cls = size === "lg" ? "h-8 w-8" : "h-5 w-5";
  if (mimeType.startsWith("image/"))                                   return <FileImage className={cls} />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className={cls} />;
  if (mimeType.includes("pdf"))                                        return <FileText className={cls} />;
  return <FileIcon className={cls} />;
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

  const isExpired     = document.expiresAt && new Date(document.expiresAt) < new Date();
  const isExpiringSoon = document.expiresAt &&
    !isExpired &&
    new Date(document.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const handleDownload = () => window.open(document.fileUrl, "_blank");

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
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />Download
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/documents/${document.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </Button>
        </div>
      </div>

      {/* ── Expiry alerts ── */}
      {isExpired && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 px-4 py-3">
          <Clock className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm font-medium text-destructive">
            This document expired on {format(new Date(document.expiresAt), "MMM dd, yyyy")}.
          </p>
        </div>
      )}
      {isExpiringSoon && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/20 px-4 py-3">
          <Clock className="h-4 w-4 text-orange-600 shrink-0" />
          <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Expiring soon — {format(new Date(document.expiresAt), "MMM dd, yyyy")}.
          </p>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: document preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {getFileIcon(document.mimeType, "lg")}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{document.name}</CardTitle>
                    <CardDescription>
                      {formatFileSize(document.fileSize)} · {document.mimeType}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={`${typeColors[document.type] ?? ""} shrink-0`}>
                  {typeLabel}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Description */}
              {document.description && (
                <div className="px-6 py-4 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{document.description}</p>
                </div>
              )}

              {/* Image preview */}
              {document.mimeType.startsWith("image/") && (
                <div className="px-6 py-4 border-b">
                  <img
                    src={document.fileUrl}
                    alt={document.name}
                    className="rounded-lg border max-h-96 w-full object-contain"
                  />
                </div>
              )}

              {/* PDF open button */}
              {document.mimeType === "application/pdf" && (
                <div className="px-6 py-4 border-b">
                  <Button variant="outline" className="w-full" onClick={handleDownload}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open PDF in New Tab
                  </Button>
                </div>
              )}

              {/* Tags */}
              {document.tags?.length > 0 && (
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {document.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Details card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">

                {/* Property */}
                {document.property && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Property</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{document.property.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {document.property.address}, {document.property.city}, {document.property.state}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded by */}
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Uploaded By</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium">{document.uploadedBy.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {document.uploadedBy.email}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Uploaded</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {format(new Date(document.createdAt), "PPP")}
                  </div>
                  <p className="text-xs text-muted-foreground pl-5 mt-0.5">
                    {format(new Date(document.createdAt), "p")}
                  </p>
                </div>

                {/* Expiry */}
                {document.expiresAt && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Expires</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className={isExpired ? "text-destructive" : isExpiringSoon ? "text-orange-600" : ""}>
                        {format(new Date(document.expiresAt), "PPP")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Visibility */}
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Visibility</p>
                  <div className="flex items-center gap-2 text-sm">
                    {document.isPublic
                      ? <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      : <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    }
                    <span>{document.isPublic ? "Public — visible to tenants" : "Private"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

<Card className="overflow-hidden border border-border/50">
  <CardHeader className="pb-3 border-b">
    <CardTitle className="text-base font-medium">Actions</CardTitle>
  </CardHeader>

  <CardContent className="p-2 space-y-1">
    
    {/* Download */}
    <button
      onClick={handleDownload}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-sm group"
    >
      <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
        <Download className="w-4 h-4" />
      </div>
      <span className="flex-1 text-left">Download file</span>
    </button>

    {/* Edit */}
    <button
      onClick={() => router.push(`/dashboard/documents/${document.id}/edit`)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-sm group"
    >
      <div className="p-2 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
        <Edit className="w-4 h-4" />
      </div>
      <span className="flex-1 text-left">Edit document</span>
    </button>

    {/* Divider */}
    <div className="h-px bg-border my-2" />

    {/* Delete */}
    <button
      onClick={() => setDeleteDialogOpen(true)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-destructive"
    >
      <div className="p-2 rounded-md bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
        <Trash2 className="w-4 h-4" />
      </div>
      <span className="flex-1 text-left">Delete document</span>
    </button>

  </CardContent>
</Card>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{document.name}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}