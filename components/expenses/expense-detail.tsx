/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/expenses/expense-detail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft, Edit, Trash2, Receipt, Calendar,
  DollarSign, Building2, Tag, FileText, Download,
  CheckCircle2, XCircle, MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { deleteExpense } from "@/actions/expenses";
import { toast } from "sonner";

interface ExpenseDetailProps {
  expense: any;
}

const categoryLabels: Record<string, string> = {
  MORTGAGE: "Mortgage", PROPERTY_TAX: "Property Tax", INSURANCE: "Insurance",
  HOA_FEES: "HOA Fees", UTILITIES: "Utilities", MAINTENANCE: "Maintenance",
  REPAIRS: "Repairs", LANDSCAPING: "Landscaping", CLEANING: "Cleaning",
  PROPERTY_MANAGEMENT: "Property Management", LEGAL: "Legal",
  ACCOUNTING: "Accounting", MARKETING: "Marketing", SUPPLIES: "Supplies",
  CAPITAL_IMPROVEMENT: "Capital Improvement", OTHER: "Other",
};

const categoryColors: Record<string, string> = {
  MORTGAGE:           "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  PROPERTY_TAX:       "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  INSURANCE:          "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300",
  HOA_FEES:           "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
  UTILITIES:          "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300",
  MAINTENANCE:        "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  REPAIRS:            "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  LANDSCAPING:        "bg-lime-100 text-lime-800 dark:bg-lime-950/40 dark:text-lime-300",
  CLEANING:           "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  PROPERTY_MANAGEMENT:"bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  LEGAL:              "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-300",
  ACCOUNTING:         "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  MARKETING:          "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  SUPPLIES:           "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  CAPITAL_IMPROVEMENT:"bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  OTHER:              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function ExpenseDetail({ expense }: ExpenseDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteExpense(expense.id);
      if (result.success) {
        toast.success("Expense deleted successfully");
        router.push("/dashboard/expenses");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete expense");
      }
    } catch {
      toast.error("An error occurred while deleting the expense");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Expenses
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/expenses/${expense.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </Button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: main details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Primary card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">{expense.description}</CardTitle>
                  <CardDescription>
                    {format(new Date(expense.date), "MMMM dd, yyyy")}
                  </CardDescription>
                </div>
                <p className="text-3xl font-bold shrink-0">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Category + vendor */}
              <div className="grid grid-cols-2 divide-x border-b">
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Category
                  </p>
                  <Badge className={`${categoryColors[expense.category]} border-0`}>
                    {categoryLabels[expense.category]}
                  </Badge>
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Vendor
                  </p>
                  <p className="text-sm font-medium">
                    {expense.vendor || <span className="text-muted-foreground">—</span>}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {expense.notes && (
                <div className="px-6 py-4 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                    {expense.notes}
                  </p>
                </div>
              )}

              {/* Receipt */}
              {expense.receiptUrl && (
                <div className="px-6 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(expense.receiptUrl, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property card */}
          {expense.property && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 py-4 space-y-2">
                  <p className="text-sm font-semibold">{expense.property.name}</p>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <div>
                      <p>{expense.property.address}</p>
                      <p>{expense.property.city}, {expense.property.state} {expense.property.zipCode}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => router.push(`/dashboard/properties/${expense.property.id}`)}
                  >
                    View Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Dates card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Expense Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(expense.date), "MMMM dd, yyyy")}
                  </p>
                </div>
                {expense.paidDate && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Paid Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(expense.paidDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(expense.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(expense.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax info card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="px-6 py-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Tax Deductible</p>
                  {expense.isTaxDeductible ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">No</span>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tax Year</p>
                  <p className="text-sm font-medium">{expense.taxYear}</p>
                </div>
                {expense.taxCategory && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Tax Category</p>
                    <p className="text-sm font-medium">{expense.taxCategory}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the expense record for{" "}
              <strong>{expense.description}</strong> and remove it from your financial reports.
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