/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/expenses/expenses-list.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Eye, 
  Edit,
  Trash2,
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { deleteExpense } from "@/actions/expenses";
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
  MORTGAGE: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  PROPERTY_TAX: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  INSURANCE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  HOA_FEES: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  UTILITIES: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  MAINTENANCE: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  REPAIRS: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  LANDSCAPING: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
  CLEANING: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  PROPERTY_MANAGEMENT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  LEGAL: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  ACCOUNTING: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  MARKETING: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
  SUPPLIES: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  CAPITAL_IMPROVEMENT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
};

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
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteDialogOpen(true);
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
    } catch (error) {
      toast.error("An error occurred while deleting the expense");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-8 shadow-sm dark:shadow-none dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </p>
            <p className="text-4xl font-bold tracking-tight">
              {formatCurrency(calculateTotal())}
            </p>
          </div>
          <div className="text-right space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Records
            </p>
            <p className="text-3xl font-semibold tracking-tight">{pagination.total}</p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 bg-transparent border border-border/50 shadow-none">
  <div className="flex flex-col sm:flex-row gap-3">
    
    {/* Search */}
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search expenses..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-9 pl-9 text-sm bg-transparent border-border/50 focus:border-primary focus:ring-0"
      />
    </div>

    {/* Category Filter */}
    <Select value={category} onValueChange={handleCategoryChange}>
      <SelectTrigger className="h-9 w-full sm:w-52 text-sm bg-transparent border-border/50 focus:ring-0">
        <SelectValue placeholder="Filter by category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Categories</SelectItem>
        {Object.entries(categoryLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Download */}
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
    >
      <Download className="h-4 w-4" />
    </Button>

  </div>
</Card>


      {/* Expenses Table */}
      <Card className="shadow-sm dark:shadow-none dark:border-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b dark:border-gray-800">
                <TableHead className="py-4">Date</TableHead>
                <TableHead className="py-4">Description</TableHead>
                <TableHead className="py-4">Category</TableHead>
                <TableHead className="py-4">Property</TableHead>
                <TableHead className="py-4">Vendor</TableHead>
                <TableHead className="text-right py-4">Amount</TableHead>
                <TableHead className="py-4">Tax Deductible</TableHead>
                <TableHead className="text-right py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                    <Receipt className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No expenses found</p>
                    <p className="text-sm">
                      Add your first expense to start tracking
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-b dark:border-gray-800 hover:bg-muted/50 dark:hover:bg-gray-900/50">
                    <TableCell className="py-5">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </p>
                        {expense.paidDate && (
                          <p className="text-xs text-muted-foreground">
                            Paid: {format(new Date(expense.paidDate), "MMM dd")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="max-w-xs space-y-1">
                        <p className="font-medium truncate">
                          {expense.description}
                        </p>
                        {expense.notes && (
                          <p className="text-sm text-muted-foreground truncate">
                            {expense.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge className={`${categoryColors[expense.category]} border-0`}>
                        {categoryLabels[expense.category]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5">
                      {expense.property ? (
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {expense.property.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.property.city}, {expense.property.state}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          General
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-5">
                      {expense.vendor || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold py-5">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="py-5">
                      {expense.isTaxDeductible ? (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/expenses/${expense.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/expenses/${expense.id}/edit`)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {expense.receiptUrl && (
                            <DropdownMenuItem
                              onClick={() => window.open(expense.receiptUrl, "_blank")}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download Receipt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(expense.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} expenses
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-10 px-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="h-10 px-4"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}