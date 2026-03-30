/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/documents/documents-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  File,
  FileImage,
  FileSpreadsheet,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { deleteDocument } from "@/actions/documents";
import { toast } from "sonner";

interface DocumentsListProps {
  initialData: {
    documents: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
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

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))                              return <FileImage className="h-5 w-5" />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="h-5 w-5" />;
  if (mimeType.includes("pdf"))                                   return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function DocumentsList({ initialData }: DocumentsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch]   = useState(searchParams.get("search") || "");
  const [type, setType]       = useState(searchParams.get("type") || "ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { documents, pagination } = initialData;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set("search", value); } else { params.delete("search"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") { params.set("type", value); } else { params.delete("type"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteDocument(deleteId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── Filters card ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>
                {pagination.total} document{pagination.total !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 w-full sm:w-52"
                />
              </div>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {documentTypes.map((dt) => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ── Documents grid ── */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No documents found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc: any) => {
              const typeLabel = documentTypes.find((t) => t.value === doc.type)?.label;
              return (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      {/* File icon */}
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {getFileIcon(doc.mimeType)}
                      </div>
                      {/* Type badge + menu */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge className={`${typeColors[doc.type] ?? ""} text-xs`}>
                          {typeLabel}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/documents/${doc.id}`); }}>
                              <Eye className="mr-2 h-4 w-4" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(doc.fileUrl, "_blank"); }}>
                              <Download className="mr-2 h-4 w-4" />Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Name + size */}
                    <div className="px-6 pb-3">
                      <p className="text-sm font-medium line-clamp-2 leading-snug">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(doc.fileSize)}</p>
                    </div>

                    {/* Property */}
                    {doc.property && (
                      <div className="px-6 py-2 border-t flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{doc.property.name}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {doc.tags?.length > 0 && (
                      <div className="px-6 py-2 border-t flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{doc.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Footer: uploader + date + download */}
                    <div className="px-6 py-3 border-t flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground truncate max-w-24">{doc.uploadedBy.name}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(doc.createdAt), "MMM dd, yyyy")}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); window.open(doc.fileUrl, "_blank"); }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />Previous
                </Button>
                <Button
                  variant="outline" size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone and the file will be permanently removed.
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