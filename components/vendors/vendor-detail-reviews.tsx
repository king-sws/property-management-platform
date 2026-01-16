/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

// components/vendors/vendor-detail-reviews.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorReviewList } from "@/components/reviews/vendor-review-list";
import { ReviewStatistics } from "@/components/reviews/review-statistics";
import { VendorReviewForm } from "@/components/reviews/vendor-review-form";
import { getVendorReviews, getReviewStatistics } from "@/actions/vendor-reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface VendorDetailReviewsProps {
  vendorId: string;
  vendorName: string;
  currentUserRole: string;
  canReview?: boolean;
}

export function VendorDetailReviews({
  vendorId,
  vendorName,
  currentUserRole,
  canReview = false,
}: VendorDetailReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadData();
  }, [vendorId, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load reviews
      const reviewsResult = await getVendorReviews({
        vendorId,
        page,
        limit: 10,
      });
      
      if (reviewsResult.success && reviewsResult.data) {
        setReviews(reviewsResult.data.reviews || []);
        setHasMore(reviewsResult.data.pagination.page < reviewsResult.data.pagination.totalPages);
      }
      
      // Load statistics (only on first page)
      if (page === 1) {
        const statsResult = await getReviewStatistics(vendorId);
        if (statsResult.success && statsResult.data) {
          setStatistics(statsResult.data);
        }
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && page === 1) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {statistics && (
        <ReviewStatistics statistics={statistics} />
      )}

      {/* Add Review */}
      {canReview && currentUserRole === "LANDLORD" && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <VendorReviewForm
              vendorId={vendorId}
              vendorName={vendorName}
              onSuccess={loadData}
              trigger={
                <Button className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <VendorReviewList
            reviews={reviews}
            canRespond={false}
          />
          
          {hasMore && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Reviews"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}