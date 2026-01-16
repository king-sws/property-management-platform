// components/lease/renewal-offers.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, DollarSign, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { respondToRenewalOffer } from "@/actions/my-lease";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RenewalOffersProps {
  leaseId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  offers: any[];
}

export function RenewalOffers({ offers }: RenewalOffersProps) {
  const router = useRouter();
  const [responding, setResponding] = useState(false);
  const [counterOfferData, setCounterOfferData] = useState({
    rentAmount: "",
    endDate: "",
    message: "",
  });

  const handleAccept = async (offerId: string) => {
    setResponding(true);
    const result = await respondToRenewalOffer(offerId, "ACCEPTED");
    
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setResponding(false);
  };

  const handleReject = async (offerId: string) => {
    setResponding(true);
    const result = await respondToRenewalOffer(offerId, "REJECTED");
    
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setResponding(false);
  };

  const handleCounterOffer = async (offerId: string) => {
    if (!counterOfferData.message.trim()) {
      toast.error("Please provide a message with your counter offer");
      return;
    }

    setResponding(true);
    const result = await respondToRenewalOffer(offerId, "COUNTERED", {
      rentAmount: counterOfferData.rentAmount
        ? Number(counterOfferData.rentAmount)
        : undefined,
      endDate: counterOfferData.endDate || undefined,
      message: counterOfferData.message,
    });
    
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      setCounterOfferData({ rentAmount: "", endDate: "", message: "" });
    } else {
      toast.error(result.error);
    }
    setResponding(false);
  };

  if (offers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const isExpired = new Date() > new Date(offer.expiresAt);
        const daysUntilExpiry = Math.ceil(
          (new Date(offer.expiresAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return (
          <Card key={offer.id} className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Lease Renewal Offer
                </CardTitle>
                <Badge
                  variant={isExpired ? "destructive" : "default"}
                  className="ml-2"
                >
                  {isExpired ? "Expired" : offer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Offer Details */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Proposed Rent
                  </div>
                  <div className="text-2xl font-bold">
                    ${offer.proposedRentAmount.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    New Start Date
                  </div>
                  <div className="font-semibold">
                    {format(new Date(offer.proposedStartDate), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    New End Date
                  </div>
                  <div className="font-semibold">
                    {format(new Date(offer.proposedEndDate), "MMM d, yyyy")}
                  </div>
                </div>
              </div>

              {offer.proposedDeposit && (
                <div className="p-3 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Security Deposit
                  </div>
                  <div className="font-semibold">
                    ${offer.proposedDeposit.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Expiry Warning */}
              {!isExpired && daysUntilExpiry <= 7 && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-900">
                    This offer expires in {daysUntilExpiry} day
                    {daysUntilExpiry !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Actions */}
              {!isExpired && offer.status === "SENT" && (
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleAccept(offer.id)}
                    disabled={responding}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept Offer
                  </Button>
                  <Button
                    onClick={() => handleReject(offer.id)}
                    disabled={responding}
                    variant="destructive"
                  >
                    Reject Offer
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={responding}>
                        Make Counter Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-125">
                      <DialogHeader>
                        <DialogTitle>Counter Offer</DialogTitle>
                        <DialogDescription>
                          Propose different terms for your lease renewal
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="counter-rent">
                            Proposed Monthly Rent (Optional)
                          </Label>
                          <Input
                            id="counter-rent"
                            type="number"
                            placeholder={`Current offer: $${offer.proposedRentAmount}`}
                            value={counterOfferData.rentAmount}
                            onChange={(e) =>
                              setCounterOfferData({
                                ...counterOfferData,
                                rentAmount: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="counter-date">
                            Proposed End Date (Optional)
                          </Label>
                          <Input
                            id="counter-date"
                            type="date"
                            value={counterOfferData.endDate}
                            onChange={(e) =>
                              setCounterOfferData({
                                ...counterOfferData,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="counter-message">
                            Message *
                          </Label>
                          <Textarea
                            id="counter-message"
                            placeholder="Explain your counter offer..."
                            value={counterOfferData.message}
                            onChange={(e) =>
                              setCounterOfferData({
                                ...counterOfferData,
                                message: e.target.value,
                              })
                            }
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => handleCounterOffer(offer.id)}
                          disabled={responding || !counterOfferData.message.trim()}
                        >
                          Submit Counter Offer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Counter Offer Info */}
              {offer.counterOffer && (
                <div className="p-4 bg-background rounded-lg border">
                  <div className="font-medium mb-2">Your Counter Offer</div>
                  {offer.counterOffer.rentAmount && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Proposed Rent:
                      </span>{" "}
                      ${offer.counterOffer.rentAmount}/month
                    </div>
                  )}
                  {offer.counterOffer.endDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Proposed End Date:
                      </span>{" "}
                      {format(
                        new Date(offer.counterOffer.endDate),
                        "MMM d, yyyy"
                      )}
                    </div>
                  )}
                  {offer.counterOffer.message && (
                    <div className="text-sm mt-2">
                      <span className="text-muted-foreground">Message:</span>
                      <p className="mt-1">{offer.counterOffer.message}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}