/* eslint-disable react/no-unescaped-entities */
// app/(dashboard)/dashboard/vendor/reviews/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VendorReviewList } from "@/components/reviews/vendor-review-list";
import { ReviewStatistics } from "@/components/reviews/review-statistics";
import { getVendorReviews, getReviewStatistics } from "@/actions/vendor-reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  qualityRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  isVerified: boolean;
  vendorResponse?: string;
  respondedAt?: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    image?: string;
  };
}

interface Statistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  verifiedCount: number;
  withResponseCount: number;
  detailedRatings?: {
    quality: number | null;
    punctuality: number | null;
    professionalism: number | null;
    value: number | null;
  };
}

export default function VendorReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vendorId, setVendorId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [session]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get vendor profile
      const response = await fetch("/api/vendor/profile");
      const profileData = await response.json();
      
      if (profileData.vendorId) {
        setVendorId(profileData.vendorId);
        
        // Load reviews
        const reviewsResult = await getVendorReviews({
          vendorId: profileData.vendorId,
          limit: 50,
        });
        
        if (reviewsResult.success && reviewsResult.data) {
          setReviews(reviewsResult.data.reviews || []);
        }
        
        // Load statistics
        const statsResult = await getReviewStatistics(profileData.vendorId);
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

  const reviewsWithResponse = reviews.filter(r => r.vendorResponse);
  const reviewsWithoutResponse = reviews.filter(r => !r.vendorResponse);
  const verifiedReviews = reviews.filter(r => r.isVerified);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground">
          View and respond to customer reviews
        </p>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</div>
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(statistics.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalReviews > 0
                  ? Math.round((statistics.withResponseCount / statistics.totalReviews) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.withResponseCount} of {statistics.totalReviews} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.verifiedCount}</div>
              <p className="text-xs text-muted-foreground">
                From completed jobs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <ReviewStatistics statistics={statistics} />
      )}

      {/* Reviews Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Reviews ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="need-response">
            Need Response ({reviewsWithoutResponse.length})
          </TabsTrigger>
          <TabsTrigger value="responded">
            Responded ({reviewsWithResponse.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>
                View all customer reviews and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorReviewList
                reviews={reviews}
                canRespond={true}
                onUpdate={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="need-response">
          <Card>
            <CardHeader>
              <CardTitle>Reviews Needing Response</CardTitle>
              <CardDescription>
                Respond to customer feedback to improve your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsWithoutResponse.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <p className="text-lg font-medium mb-2">All caught up!</p>
                  <p className="text-sm text-muted-foreground">
                    You've responded to all your reviews
                  </p>
                </div>
              ) : (
                <VendorReviewList
                  reviews={reviewsWithoutResponse}
                  canRespond={true}
                  onUpdate={loadData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responded">
          <Card>
            <CardHeader>
              <CardTitle>Reviews with Responses</CardTitle>
              <CardDescription>
                Reviews you've already responded to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorReviewList
                reviews={reviewsWithResponse}
                canRespond={false}
                onUpdate={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>Verified Reviews</CardTitle>
              <CardDescription>
                Reviews from completed maintenance jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorReviewList
                reviews={verifiedReviews}
                canRespond={true}
                onUpdate={loadData}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

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