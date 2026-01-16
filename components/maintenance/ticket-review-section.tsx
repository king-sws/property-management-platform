
// components/maintenance/ticket-review-section.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorReviewForm } from "@/components/reviews/vendor-review-form";
import { Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export function TicketReviewSection({
  ticket,
  currentUserRole,
  existingReview,
  onReviewSubmitted,
}: TicketReviewSectionProps) {
  // Only show for completed tickets with vendors
  if (ticket.status !== "COMPLETED" || !ticket.vendor) {
    return null;
  }

  // Only landlords can review
  if (currentUserRole !== "LANDLORD") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Review</CardTitle>
      </CardHeader>
      <CardContent>
        {existingReview ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  You reviewed this job on {new Date(existingReview.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < existingReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Reviewed
                  </Badge>
                </div>
              </div>
            </div>
            
            {existingReview.title && (
              <div>
                <p className="font-medium">{existingReview.title}</p>
              </div>
            )}
            
            {existingReview.comment && (
              <div>
                <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                How was your experience with {ticket.vendor.businessName}?
              </p>
              <div className="flex items-center gap-2 mb-4">
                {ticket.vendor.rating ? (
                  <>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(ticket?.vendor?.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {ticket.vendor.rating.toFixed(1)} ({ticket.vendor.reviewCount} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No reviews yet</span>
                )}
              </div>
            </div>
            
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
