// components/maintenance/ticket-review-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VendorReviewForm } from "@/components/reviews/vendor-review-form";
import { Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TicketReviewSectionProps {
  ticket: {
    id: string;
    status: string;
    vendor?: {
      id: string;
      businessName: string;
      rating?: number;
      reviewCount: number;
    } | null;
  };
  currentUserRole: string;
  existingReview?: {
    id: string;
    rating: number;
    title?: string | undefined;
    comment?: string | undefined;
    createdAt: string;
  } | null;
  onReviewSubmitted?: () => void;
}

function StarRating({ rating, max = 5, size = "md" }: { rating: number; max?: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function TicketReviewSection({
  ticket,
  currentUserRole,
  existingReview,
  onReviewSubmitted,
}: TicketReviewSectionProps) {
  if (ticket.status !== "COMPLETED" || !ticket.vendor) return null;
  if (currentUserRole !== "LANDLORD") return null;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Vendor Review
            </CardTitle>
            <CardDescription>
              {existingReview
                ? `You reviewed ${ticket.vendor.businessName} on ${format(new Date(existingReview.createdAt), "MMM d, yyyy")}`
                : `Share your experience with ${ticket.vendor.businessName}`}
            </CardDescription>
          </div>

          {/* Vendor's overall rating pill */}
          {ticket.vendor.rating ? (
            <div className="flex items-center gap-2 shrink-0">
              <StarRating rating={Math.round(ticket.vendor.rating)} size="sm" />
              <span className="text-sm text-muted-foreground">
                {ticket.vendor.rating.toFixed(1)}
                <span className="text-xs"> ({ticket.vendor.reviewCount})</span>
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No reviews yet</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {existingReview ? (
          /* ── Already reviewed ── */
          <div className="divide-y">
            {/* Rating row */}
            <div className="px-6 py-4 flex items-center justify-between">
              <StarRating rating={existingReview.rating} />
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Reviewed
              </Badge>
            </div>

            {/* Title row */}
            {existingReview.title && (
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Title
                </p>
                <p className="text-sm font-medium">{existingReview.title}</p>
              </div>
            )}

            {/* Comment row */}
            {existingReview.comment && (
              <div className="px-6 py-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Comment
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {existingReview.comment}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ── Review form ── */
          <div className="px-6 py-6">
            <VendorReviewForm
              vendorId={ticket.vendor.id}
              vendorName={ticket.vendor.businessName}
              ticketId={ticket.id}
              onSuccess={onReviewSubmitted}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}