/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/vendor/invoices/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getInvoiceById } from "@/actions/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { InvoiceActions } from "@/components/invoices/invoice-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "VENDOR" && session.user.role !== "LANDLORD") {
    redirect("/dashboard");
  }
  
  const result = await getInvoiceById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }
  
  const invoice = result.data;
  const role = session.user.role === "VENDOR" ? "vendor" : "landlord";
  
  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    PAID: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${role}/invoices`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {invoice.invoiceNumber}
              <Badge className={statusColors[invoice.status]}>
                {invoice.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">
              Created on {format(new Date(invoice.createdAt), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        
        <InvoiceActions invoice={invoice} role={role} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vendor Info */}
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{invoice.vendor.businessName}</p>
                <p className="text-sm text-muted-foreground">
                  {invoice.vendor.user.email}
                </p>
                {invoice.vendor.user.phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.vendor.user.phone}
                  </p>
                )}
              </div>

              {/* Ticket Info */}
              {invoice.ticket && (
                <div>
                  <p className="text-sm text-muted-foreground">Related Ticket</p>
                  <Link
                    href={`/dashboard/maintenance/${invoice.ticket.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {invoice.ticket.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {invoice.ticket.property.name}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                {invoice.dueDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
                {invoice.approvedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Approved On</p>
                    <p className="font-medium">
                      {format(new Date(invoice.approvedAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
                {invoice.paidAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Paid On</p>
                    <p className="font-medium">
                      {format(new Date(invoice.paidAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">${item.amount.toFixed(2)}</p>
                  </div>
                ))}

                {/* Totals */}
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${invoice.tax.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-red-600">-${invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Rejection Reason */}
          {invoice.rejectionReason && invoice.status === "REJECTED" && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800">{invoice.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusColors[invoice.status]}>
                  {invoice.status}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Invoice Total</p>
                <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
              </div>
              
              {invoice.status === "PENDING" && role === "vendor" && (
                <p className="text-xs text-muted-foreground pt-2">
                  Waiting for landlord approval
                </p>
              )}
              
              {invoice.status === "APPROVED" && (
                <p className="text-xs text-muted-foreground pt-2">
                  Approved and awaiting payment
                </p>
              )}
              
              {invoice.status === "PAID" && (
                <div className="pt-2 text-sm text-green-600">
                  ✓ Payment received
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions based on status and role */}
          {role === "landlord" && invoice.status === "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Actions Required</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Review this invoice and approve or reject it.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}