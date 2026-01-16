
// ============================================================================
// FILE 2: app/(dashboard)/dashboard/(tenant)/my-lease/page.tsx
// ============================================================================
import { Suspense } from "react";
import { getCurrentLease, getLeaseHistory } from "@/actions/my-lease";
import { LeaseOverview } from "@/components/lease/lease-overview";
import { LeaseDetails } from "@/components/lease/lease-details";
import { LeaseDocuments } from "@/components/lease/lease-documents";
import { LeasePayments } from "@/components/lease/lease-payments";
import { RenewalOffers } from "@/components/lease/renewal-offers";
import { LeaseHistory } from "@/components/lease/lease-history";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, History, Home } from "lucide-react";

export default async function MyLeasePage() {
  const [currentLeaseResult, historyResult] = await Promise.all([
    getCurrentLease(),
    getLeaseHistory(),
  ]);

  if (!currentLeaseResult.success) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{currentLeaseResult.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentLease = currentLeaseResult.data;

  if (!currentLease) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Active Lease</CardTitle>
            <CardDescription>
              You don&apos;t have an active lease at the moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Once you sign a lease agreement, your lease details will appear here.
            </p>
          </CardContent>
        </Card>

        {historyResult.success && historyResult.data && historyResult.data.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Lease History</h2>
            <LeaseHistory leases={historyResult.data} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Lease</h1>
        <p className="text-muted-foreground">
          View and manage your current lease agreement
        </p>
      </div>

      <LeaseOverview lease={currentLease} />

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">
            <Home className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="payments">
            <FileText className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <LeaseDetails lease={currentLease} />
          
          {currentLease.hasPendingRenewalOffer && (
            <RenewalOffers
              leaseId={currentLease.lease.id}
              offers={currentLease.lease.renewalOffers}
            />
          )}
        </TabsContent>

        <TabsContent value="payments">
          <LeasePayments
            leaseId={currentLease.lease.id}
            payments={currentLease.lease.payments}
            nextRentDue={currentLease.nextRentDue}
            rentAmount={currentLease.lease.rentAmount}
          />
        </TabsContent>

        <TabsContent value="documents">
          <Suspense fallback={<div>Loading documents...</div>}>
            <LeaseDocuments leaseId={currentLease.lease.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="history">
          {historyResult.success && historyResult.data && (
            <LeaseHistory leases={historyResult.data} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}