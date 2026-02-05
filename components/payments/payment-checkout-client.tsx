/* eslint-disable @typescript-eslint/no-explicit-any */
// components/payments/payment-checkout-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Building2,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { CashPaymentDialog } from "./cash-payment-dialog";
import { toast } from "sonner";

interface PaymentCheckoutClientProps {
  payment: any;
}

type PaymentMethodType = "card" | "bank" | "cash" | "wallet";

export function PaymentCheckoutClient({ payment }: PaymentCheckoutClientProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCashDialog, setShowCashDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Check if payment can be paid
  const canPay = payment.status === "PENDING";
  const isPaid = payment.status === "COMPLETED";
  const isOverdue = payment.dueDate && new Date(payment.dueDate) < new Date();

  const handlePayment = async () => {
    if (selectedMethod === "cash") {
      setShowCashDialog(true);
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    try {
      // In a real app, this would integrate with Stripe or another payment processor
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Payment processed successfully!");
      router.push("/dashboard/payments");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "card" as PaymentMethodType,
      name: "Credit/Debit Card",
      description: "Pay with your credit or debit card",
      icon: CreditCard,
      fee: 2.9,
      available: true,
    },
    {
      id: "bank" as PaymentMethodType,
      name: "Bank Transfer (ACH)",
      description: "Direct transfer from your bank account",
      icon: Building2,
      fee: 0,
      available: true,
    },
    {
      id: "cash" as PaymentMethodType,
      name: "Cash Payment",
      description: "Pay in cash (requires landlord confirmation)",
      icon: Banknote,
      fee: 0,
      available: true,
    },
    {
      id: "wallet" as PaymentMethodType,
      name: "Digital Wallet",
      description: "Apple Pay, Google Pay, etc.",
      icon: Wallet,
      fee: 2.9,
      available: false,
    },
  ];

  const selectedMethodDetails = paymentMethods.find(m => m.id === selectedMethod);
  const processingFee = selectedMethodDetails ? (payment.amount * selectedMethodDetails.fee) / 100 : 0;
  const totalAmount = payment.amount + processingFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Payment Status Alert */}
        {!canPay && (
          <Card className={`border-2 ${
            isPaid 
              ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20" 
              : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {isPaid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    {isPaid ? "Payment Completed" : "Payment Not Available"}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {isPaid 
                      ? `Paid on ${format(new Date(payment.paidAt), "MMM d, yyyy")}`
                      : "This payment cannot be processed at this time"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overdue Warning */}
        {canPay && isOverdue && (
          <Card className="border-2 border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Payment Overdue
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This payment was due on {format(new Date(payment.dueDate), "MMM d, yyyy")}. 
                    Late fees may apply.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods */}
        {canPay && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>
                Select how you&#39;d like to pay your rent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedMethod} onValueChange={(value: PaymentMethodType) => setSelectedMethod(value)}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                          selectedMethod === method.id
                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                        } ${!method.available && "opacity-50 cursor-not-allowed"}`}
                      >
                        <RadioGroupItem
                          value={method.id}
                          id={method.id}
                          disabled={!method.available}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={method.id}
                          className={`flex-1 cursor-pointer ${!method.available && "cursor-not-allowed"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-lg p-2 ${
                                selectedMethod === method.id
                                  ? "bg-primary/10 dark:bg-primary/20"
                                  : "bg-gray-100 dark:bg-gray-800"
                              }`}>
                                <Icon className={`h-5 w-5 ${
                                  selectedMethod === method.id
                                    ? "text-primary"
                                    : "text-gray-600 dark:text-gray-400"
                                }`} />
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {method.name}
                                  {!method.available && (
                                    <Badge variant="secondary" className="text-xs">
                                      Coming Soon
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                            {method.fee > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {method.fee}% fee
                              </Badge>
                            )}
                            {method.fee === 0 && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/50">
                                No fee
                              </Badge>
                            )}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Payment Method Details */}
        {canPay && selectedMethod === "card" && (
          <Card>
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
              <CardDescription>
                Enter your card information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card-number">Card Number</Label>
                  <div className="mt-1 relative">
                    <input
                      id="card-number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900"
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <input
                      id="cvc"
                      type="text"
                      placeholder="123"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {canPay && selectedMethod === "bank" && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>
                Connect your bank account for ACH transfer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routing">Routing Number</Label>
                  <input
                    id="routing"
                    type="text"
                    placeholder="110000000"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900"
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account Number</Label>
                  <input
                    id="account"
                    type="text"
                    placeholder="000123456789"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
                  ACH transfers typically take 3-5 business days to process
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Property Info */}
            <div>
              <p className="text-sm text-muted-foreground">Property</p>
              <p className="font-medium">
                {payment.lease?.unit?.property?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Unit {payment.lease?.unit?.unitNumber}
              </p>
            </div>

            <Separator />

            {/* Payment Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">{payment.type}</Badge>
            </div>

            {/* Due Date */}
            {payment.dueDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(new Date(payment.dueDate), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            )}

            <Separator />

            {/* Amount Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Amount</span>
                <span className="text-sm font-medium">
                  {formatCurrency(payment.amount)}
                </span>
              </div>

              {processingFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Processing Fee ({selectedMethodDetails?.fee}%)
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(processingFee)}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {canPay && (
              <>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedMethodDetails?.available}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>Pay {formatCurrency(totalAmount)}</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard/payments")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Payments
                </Button>
              </>
            )}

            {!canPay && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/dashboard/payments")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payments
              </Button>
            )}

            {/* Security Badge */}
            <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-900">
              <p className="text-xs text-muted-foreground">
                🔒 Secured by 256-bit SSL encryption
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Contact your landlord if you have questions about this payment.
            </p>
            {payment.lease?.unit?.property?.landlord?.user && (
              <div className="mt-3 space-y-1">
                <p className="font-medium">
                  {payment.lease.unit.property.landlord.user.name}
                </p>
                <p className="text-muted-foreground">
                  {payment.lease.unit.property.landlord.user.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cash Payment Dialog */}
      <CashPaymentDialog
        open={showCashDialog}
        onOpenChange={setShowCashDialog}
        payment={payment}
      />
    </div>
  );
}