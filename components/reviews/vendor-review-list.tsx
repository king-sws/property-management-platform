/* eslint-disable @typescript-eslint/no-unused-vars */
// components/reviews/vendor-review-list.tsx
"use client";

import { useState } from "react";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { addVendorResponse } from "@/actions/vendor-reviews";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

interface VendorReviewListProps {
  reviews: Review[];
  canRespond?: boolean;
  onUpdate?: () => void;
}

export function VendorReviewList({ reviews, canRespond, onUpdate }: VendorReviewListProps) {
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async (reviewId: string) => {
    if (!response.trim() || response.length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addVendorResponse(reviewId, { vendorResponse: response });
      
      if (result.success) {
        toast.success("Response added successfully");
        setRespondingTo(null);
        setResponse("");
        onUpdate?.();
      } else {
        toast.error(result.error || "Failed to add response");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.author.avatar || review.author.image || undefined} />
                  <AvatarFallback>
                    {review.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{review.author.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {review.title && (
              <h4 className="font-semibold">{review.title}</h4>
            )}
            
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}

            {/* Detailed Ratings */}
            {(review.qualityRating || review.punctualityRating || 
              review.professionalismRating || review.valueRating) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {review.qualityRating && (
                  <Badge variant="outline">Quality: {review.qualityRating}/5</Badge>
                )}
                {review.punctualityRating && (
                  <Badge variant="outline">Punctuality: {review.punctualityRating}/5</Badge>
                )}
                {review.professionalismRating && (
                  <Badge variant="outline">Professionalism: {review.professionalismRating}/5</Badge>
                )}
                {review.valueRating && (
                  <Badge variant="outline">Value: {review.valueRating}/5</Badge>
                )}
              </div>
            )}

            {/* Vendor Response */}
            {review.vendorResponse && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Vendor Response</p>
                    <p className="text-sm text-muted-foreground">{review.vendorResponse}</p>
                    {review.respondedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(review.respondedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Response Form */}
            {canRespond && !review.vendorResponse && (
              <div className="border-t pt-4 mt-4">
                {respondingTo === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your response..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitResponse(review.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Response"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponse("");
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond to Review
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}