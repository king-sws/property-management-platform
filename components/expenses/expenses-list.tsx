/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/expenses/expenses-list.tsx
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
  Eye,
  Edit,
  Trash2,
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { deleteExpense } from "@/actions/expenses";
import { toast } from "sonner";

interface ExpensesListProps {
  initialData: {
    expenses: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

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

const categoryLabels: Record<string, string> = {
  MORTGAGE: "Mortgage", PROPERTY_TAX: "Property Tax", INSURANCE: "Insurance",
  HOA_FEES: "HOA Fees", UTILITIES: "Utilities", MAINTENANCE: "Maintenance",
  REPAIRS: "Repairs", LANDSCAPING: "Landscaping", CLEANING: "Cleaning",
  PROPERTY_MANAGEMENT: "Property Management", LEGAL: "Legal",
  ACCOUNTING: "Accounting", MARKETING: "Marketing", SUPPLIES: "Supplies",
  CAPITAL_IMPROVEMENT: "Capital Improvement", OTHER: "Other",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function ExpensesList({ initialData }: ExpensesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { expenses, pagination } = initialData;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set("search", value); } else { params.delete("search"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") { params.set("category", value); } else { params.delete("category"); }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteExpense(expenseToDelete);
      if (result.success) {
        toast.success("Expense deleted successfully");
        setDeleteDialogOpen(false);
        setExpenseToDelete(null);
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

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            <p className="text-xs text-muted-foreground mt-1">Current page</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pagination.total}</p>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(expenses.filter(e => e.isTaxDeductible).reduce((s, e) => s + e.amount, 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.filter(e => e.isTaxDeductible).length} records
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(expenses.map(e => e.category)).size}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main card ── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Expenses</CardTitle>
              <CardDescription>
                {pagination.total} record{pagination.total !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 w-full sm:w-52"
                />
              </div>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No expenses found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first expense to start tracking
              </p>
            </div>
          ) : (
            <>
              {/* Desktop — grid rows */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[1fr_2fr_1.2fr_1.2fr_1fr_1fr_1fr_auto] gap-3 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>Date</span>
                  <span>Description</span>
                  <span>Category</span>
                  <span>Property</span>
                  <span>Vendor</span>
                  <span className="text-right">Amount</span>
                  <span>Tax</span>
                  <span />
                </div>

                {expenses.map((expense: any) => (
                  <div
                    key={expense.id}
                    onClick={() => router.push(`/dashboard/expenses/${expense.id}`)}
                    className="grid grid-cols-[1fr_2fr_1.2fr_1.2fr_1fr_1fr_1fr_auto] gap-3 px-6 py-4 border-b last:border-0 items-center cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    {/* Date */}
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(expense.date), "MMM dd, yyyy")}
                      </p>
                      {expense.paidDate && (
                        <p className="text-xs text-muted-foreground">
                          Paid {format(new Date(expense.paidDate), "MMM dd")}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-xs text-muted-foreground truncate">{expense.notes}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <Badge className={`${categoryColors[expense.category]} border-0 text-xs`}>
                        {categoryLabels[expense.category]}
                      </Badge>
                    </div>

                    {/* Property */}
                    <div>
                      {expense.property ? (
                        <>
                          <p className="text-sm font-medium truncate">{expense.property.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.property.city}, {expense.property.state}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">General</p>
                      )}
                    </div>

                    {/* Vendor */}
                    <p className="text-sm truncate">
                      {expense.vendor || <span className="text-muted-foreground">—</span>}
                    </p>

                    {/* Amount */}
                    <p className="text-sm font-semibold text-right">
                      {formatCurrency(expense.amount)}
                    </p>

                    {/* Tax deductible */}
                    <div>
                      {expense.isTaxDeductible ? (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">No</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/expenses/${expense.id}`); }}>
                          <Eye className="mr-2 h-4 w-4" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/expenses/${expense.id}/edit`); }}>
                          <Edit className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        {expense.receiptUrl && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(expense.receiptUrl, "_blank"); }}>
                            <Download className="mr-2 h-4 w-4" />Download Receipt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); setExpenseToDelete(expense.id); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y">
                {expenses.map((expense: any) => (
                  <div
                    key={expense.id}
                    onClick={() => router.push(`/dashboard/expenses/${expense.id}`)}
                    className="p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                          {expense.property ? ` · ${expense.property.name}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={`${categoryColors[expense.category]} border-0 text-xs`}>
                        {categoryLabels[expense.category]}
                      </Badge>
                      {expense.isTaxDeductible && (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 text-green-700 text-xs">
                          Tax Deductible
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1}–
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total}
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
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense record and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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