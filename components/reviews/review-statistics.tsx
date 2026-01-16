
// components/reviews/review-statistics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface ReviewStatisticsProps {
  statistics: {
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
  };
}

export function ReviewStatistics({ statistics }: ReviewStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{statistics.averageRating.toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(statistics.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {statistics.totalReviews} {statistics.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}★</span>
                <Progress
                  value={
                    statistics.totalReviews > 0
                      ? ((statistics.ratingDistribution[rating] || 0) / statistics.totalReviews) * 100
                      : 0
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-8 text-right">
                  {statistics.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Ratings */}
        {statistics.detailedRatings && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm">Detailed Ratings</h4>
            <div className="grid grid-cols-2 gap-2">
              {statistics.detailedRatings.quality && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quality</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {statistics.detailedRatings.quality.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              {statistics.detailedRatings.punctuality && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Punctuality</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {statistics.detailedRatings.punctuality.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              {statistics.detailedRatings.professionalism && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Professionalism</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {statistics.detailedRatings.professionalism.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
              {statistics.detailedRatings.value && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {statistics.detailedRatings.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Stats */}
        <div className="border-t pt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Verified Reviews</p>
            <p className="text-2xl font-bold">{statistics.verifiedCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">With Response</p>
            <p className="text-2xl font-bold">{statistics.withResponseCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}