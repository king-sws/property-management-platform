/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/dashboard/invoices/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { getInvoiceById } from "@/actions/invoices";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wrench, Home, Mail, Phone, Calendar, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { InvoiceActions } from "@/components/invoices/invoice-actions";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, { label: string; className: string }> = {
  DRAFT:     { label: "Draft",     className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  PENDING:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300" },
  APPROVED:  { label: "Approved",  className: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300" },
  PAID:      { label: "Paid",      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
  REJECTED:  { label: "Rejected",  className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
};

export default async function LandlordInvoiceDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) redirect("/sign-in");
  if (session.user.role !== "LANDLORD" && session.user.role !== "ADMIN") redirect("/dashboard");

  const result = await getInvoiceById(id);
  if (!result.success || !result.data) notFound();

  const invoice = result.data;
  const sv = statusVariant[invoice.status];

  // Add this function above the page component
function serializeInvoice(invoice: any): any {
  return {
    ...invoice,
    subtotal: invoice.subtotal ? Number(invoice.subtotal) : null,
    tax: invoice.tax ? Number(invoice.tax) : null,
    discount: invoice.discount ? Number(invoice.discount) : null,
    total: invoice.total ? Number(invoice.total) : null,
    createdAt: invoice.createdAt ? new Date(invoice.createdAt).toISOString() : null,
    updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt).toISOString() : null,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : null,
    paidAt: invoice.paidAt ? new Date(invoice.paidAt).toISOString() : null,
    approvedAt: invoice.approvedAt ? new Date(invoice.approvedAt).toISOString() : null,
    items: invoice.items?.map((item: any) => ({
      ...item,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
      amount: item.amount ? Number(item.amount) : null,
    })) ?? [],
    vendor: invoice.vendor ? {
      ...invoice.vendor,
      rating: invoice.vendor.rating ? Number(invoice.vendor.rating) : null,
      user: invoice.vendor.user ? {
        ...invoice.vendor.user,
        createdAt: invoice.vendor.user.createdAt ? new Date(invoice.vendor.user.createdAt).toISOString() : null,
        updatedAt: invoice.vendor.user.updatedAt ? new Date(invoice.vendor.user.updatedAt).toISOString() : null,
      } : null,
    } : null,
    ticket: invoice.ticket ? {
      ...invoice.ticket,
      createdAt: invoice.ticket.createdAt ? new Date(invoice.ticket.createdAt).toISOString() : null,
      updatedAt: invoice.ticket.updatedAt ? new Date(invoice.ticket.updatedAt).toISOString() : null,
      property: invoice.ticket.property ? {
        ...invoice.ticket.property,
        purchasePrice: invoice.ticket.property.purchasePrice ? Number(invoice.ticket.property.purchasePrice) : null,
        currentValue: invoice.ticket.property.currentValue ? Number(invoice.ticket.property.currentValue) : null,
        propertyTax: invoice.ticket.property.propertyTax ? Number(invoice.ticket.property.propertyTax) : null,
        insurance: invoice.ticket.property.insurance ? Number(invoice.ticket.property.insurance) : null,
        hoaFees: invoice.ticket.property.hoaFees ? Number(invoice.ticket.property.hoaFees) : null,
        latitude: invoice.ticket.property.latitude ? Number(invoice.ticket.property.latitude) : null,
        longitude: invoice.ticket.property.longitude ? Number(invoice.ticket.property.longitude) : null,
        createdAt: invoice.ticket.property.createdAt ? new Date(invoice.ticket.property.createdAt).toISOString() : null,
        updatedAt: invoice.ticket.property.updatedAt ? new Date(invoice.ticket.property.updatedAt).toISOString() : null,
        deletedAt: invoice.ticket.property.deletedAt ? new Date(invoice.ticket.property.deletedAt).toISOString() : null,
      } : null,
    } : null,
  };
}

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge className={sv?.className ?? ""}>{sv?.label ?? invoice.status}</Badge>
            <InvoiceActions invoice={invoice} role="landlord" />
          </div>
        </div>

        {/* ── Action banners ── */}
        {invoice.status === "PENDING" && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-400/40 bg-yellow-50/50 dark:bg-yellow-950/10 px-4 py-3">
            <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              This invoice is awaiting your review — please approve or reject it.
            </p>
          </div>
        )}
        {invoice.status === "APPROVED" && (
          <div className="flex items-center gap-3 rounded-lg border border-green-400/40 bg-green-50/50 dark:bg-green-950/10 px-4 py-3">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Approved — mark as paid after completing the payment.
            </p>
          </div>
        )}
        {invoice.status === "REJECTED" && invoice.rejectionReason && (
          <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 px-4 py-3">
            <p className="text-xs font-medium text-red-800 dark:text-red-300 uppercase tracking-wide mb-1">Rejection Reason</p>
            <p className="text-sm text-red-800 dark:text-red-300">{invoice.rejectionReason}</p>
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Invoice details card */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{invoice.invoiceNumber}</CardTitle>
                    <CardDescription>
                      Created {format(new Date(invoice.createdAt), "MMMM dd, yyyy")}
                    </CardDescription>
                  </div>
                  <p className="text-3xl font-bold">${invoice.total.toFixed(2)}</p>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Vendor + ticket info */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                  {/* Vendor */}
                  <div className="px-6 py-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Vendor</p>
                    <p className="text-sm font-medium">{invoice.vendor.businessName}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        {invoice.vendor.user.email}
                      </div>
                      {invoice.vendor.user.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {invoice.vendor.user.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket / property */}
                  {invoice.ticket ? (
                    <div className="px-6 py-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Related Ticket</p>
                      <Link
  href={`/dashboard/maintenance/${invoice.ticket.id}`}
  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
>
                        <Wrench className="h-3.5 w-3.5 shrink-0" />
                        {invoice.ticket.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Home className="h-3 w-3 shrink-0" />
                        {invoice.ticket.property.name}
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">
                        {invoice.ticket.property.address}
                      </p>
                    </div>
                  ) : (
                    <div className="px-6 py-4">
                      <p className="text-xs text-muted-foreground">No related ticket</p>
                    </div>
                  )}
                </div>

                {/* Dates row */}
                <div className="grid grid-cols-2 md:grid-cols-3 divide-x border-b">
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Created</p>
                    <p className="text-sm">{format(new Date(invoice.createdAt), "MMM dd, yyyy")}</p>
                  </div>
                  {invoice.dueDate && (
                    <div className="px-6 py-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Due Date</p>
                      <p className="text-sm">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</p>
                    </div>
                  )}
                  {invoice.approvedAt && (
                    <div className="px-6 py-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Approved</p>
                      <p className="text-sm">{format(new Date(invoice.approvedAt), "MMM dd, yyyy")}</p>
                    </div>
                  )}
                  {invoice.paidAt && (
                    <div className="px-6 py-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Paid</p>
                      <p className="text-sm text-green-600">{format(new Date(invoice.paidAt), "MMM dd, yyyy")}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line items card */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Items</CardTitle>
                <CardDescription>{invoice.items.length} line item{invoice.items.length !== 1 ? "s" : ""}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Item rows */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {invoice.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b last:border-0 items-center"
                    >
                      <p className="text-sm font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity}</p>
                      <p className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)}</p>
                      <p className="text-sm font-semibold text-right">${item.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Mobile items */}
                <div className="md:hidden divide-y">
                  {invoice.items.map((item: any, index: number) => (
                    <div key={index} className="px-6 py-3 space-y-1">
                      <p className="text-sm font-medium">{item.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.quantity} × ${item.unitPrice.toFixed(2)}</span>
                        <span className="font-semibold text-foreground">${item.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-6 py-4 border-t space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax</span>
                      <span>${invoice.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Discount</span>
                      <span className="text-destructive">-${invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">

            {/* Payment summary card */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                    <Badge className={sv?.className ?? ""}>{sv?.label ?? invoice.status}</Badge>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Invoice Total</p>
                    <p className="text-2xl font-bold">${invoice.total.toFixed(2)}</p>
                  </div>
                  {invoice.dueDate && (
                    <div className="px-6 py-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Due</p>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </Stack>
    </Container>
  );
}