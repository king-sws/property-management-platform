/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/expenses/expense-detail.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  Receipt,
  Calendar,
  DollarSign,
  Building2,
  Tag,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { deleteExpense } from "@/actions/expenses";
import { toast } from "sonner";

interface ExpenseDetailProps {
  expense: any;
}

const categoryLabels: Record<string, string> = {
  MORTGAGE: "Mortgage",
  PROPERTY_TAX: "Property Tax",
  INSURANCE: "Insurance",
  HOA_FEES: "HOA Fees",
  UTILITIES: "Utilities",
  MAINTENANCE: "Maintenance",
  REPAIRS: "Repairs",
  LANDSCAPING: "Landscaping",
  CLEANING: "Cleaning",
  PROPERTY_MANAGEMENT: "Property Management",
  LEGAL: "Legal",
  ACCOUNTING: "Accounting",
  MARKETING: "Marketing",
  SUPPLIES: "Supplies",
  CAPITAL_IMPROVEMENT: "Capital Improvement",
  OTHER: "Other",
};

const categoryColors: Record<string, string> = {
  MORTGAGE: "bg-purple-100 text-purple-800",
  PROPERTY_TAX: "bg-blue-100 text-blue-800",
  INSURANCE: "bg-green-100 text-green-800",
  HOA_FEES: "bg-yellow-100 text-yellow-800",
  UTILITIES: "bg-cyan-100 text-cyan-800",
  MAINTENANCE: "bg-orange-100 text-orange-800",
  REPAIRS: "bg-red-100 text-red-800",
  LANDSCAPING: "bg-lime-100 text-lime-800",
  CLEANING: "bg-teal-100 text-teal-800",
  PROPERTY_MANAGEMENT: "bg-indigo-100 text-indigo-800",
  LEGAL: "bg-pink-100 text-pink-800",
  ACCOUNTING: "bg-violet-100 text-violet-800",
  MARKETING: "bg-fuchsia-100 text-fuchsia-800",
  SUPPLIES: "bg-amber-100 text-amber-800",
  CAPITAL_IMPROVEMENT: "bg-emerald-100 text-emerald-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export function ExpenseDetail({ expense }: ExpenseDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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
    } catch (error) {
      toast.error("An error occurred while deleting the expense");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Expense Details
            </h1>
            <p className="text-muted-foreground">
              View and manage expense information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/expenses/${expense.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Amount Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {formatCurrency(expense.amount)}
              </p>
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {expense.description}
                </h3>
                {expense.notes && (
                  <p className="text-muted-foreground">{expense.notes}</p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Category
                  </p>
                  <Badge className={categoryColors[expense.category]}>
                    {categoryLabels[expense.category]}
                  </Badge>
                </div>

                {expense.vendor && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Vendor
                    </p>
                    <p className="font-medium">{expense.vendor}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Card */}
          {expense.property && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold text-lg">
                    {expense.property.name}
                  </p>
                  <p className="text-muted-foreground">
                    {expense.property.address}
                  </p>
                  <p className="text-muted-foreground">
                    {expense.property.city}, {expense.property.state}{" "}
                    {expense.property.zipCode}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      router.push(`/dashboard/properties/${expense.property.id}`)
                    }
                  >
                    View Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {expense.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {expense.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Expense Date
                </p>
                <p className="font-medium">
                  {format(new Date(expense.date), "MMMM dd, yyyy")}
                </p>
              </div>

              {expense.paidDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Paid Date
                    </p>
                    <p className="font-medium">
                      {format(new Date(expense.paidDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </p>
                <p className="text-sm">
                  {format(new Date(expense.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm">
                  {format(new Date(expense.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Tax Deductible
                </p>
                {expense.isTaxDeductible ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Yes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">No</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Tax Year
                </p>
                <p className="font-medium">{expense.taxYear}</p>
              </div>

              {expense.taxCategory && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Tax Category
                    </p>
                    <p className="font-medium">{expense.taxCategory}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Receipt */}
          {expense.receiptUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => window.open(expense.receiptUrl, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense record for <strong>{expense.description}</strong> and remove
              it from your financial reports.
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