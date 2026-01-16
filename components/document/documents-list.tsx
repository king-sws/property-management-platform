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
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { format } from "date-fns";
import { deleteDocument } from "@/actions/documents";
import { toast } from "sonner";
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
    return <FileImage className="h-5 w-5" />;
  } else if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  ) {
    return <FileSpreadsheet className="h-5 w-5" />;
  } else if (mimeType.includes("pdf")) {
    return <FileText className="h-5 w-5" />;
  }
  return <File className="h-5 w-5" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function DocumentsList({ initialData }: DocumentsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { documents, pagination } = initialData;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("type", value);
    } else {
      params.delete("type");
    }
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
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleDownload = (document: any) => {
    // TODO: Implement actual download from storage
    window.open(document.fileUrl, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {documentTypes.map((dt) => (
                <SelectItem key={dt.value} value={dt.value}>
                  {dt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.length === 0 ? (
          <Card className="col-span-full p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No documents found</p>
            </div>
          </Card>
        ) : (
          documents.map((document) => (
            <Card key={document.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 space-y-3">
                {/* File Icon & Type Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getFileIcon(document.mimeType)}
                    </div>
                  </div>
                  <Badge className={typeColors[document.type]}>
                    {documentTypes.find((t) => t.value === document.type)?.label}
                  </Badge>
                </div>

                {/* Document Name */}
                <div>
                  <h3 className="font-medium line-clamp-2 text-sm">
                    {document.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>

                {/* Property */}
                {document.property && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    📍 {document.property.name}
                  </p>
                )}

                {/* Tags */}
                {document.tags && document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {document.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{document.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Upload Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>{document.uploadedBy.name}</span>
                  <span>{format(new Date(document.createdAt), "MMM dd")}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/documents/${document.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(document.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} documents
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
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