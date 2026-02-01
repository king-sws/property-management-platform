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
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export default async function MyLeasePage() {
  const [currentLeaseResult, historyResult] = await Promise.all([
    getCurrentLease(),
    getLeaseHistory(),
  ]);

  if (!currentLeaseResult.success) {
    return (
      <Container padding="none" size="full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{currentLeaseResult.error}</AlertDescription>
        </Alert>
      </Container>
    );
  }

  const currentLease = currentLeaseResult.data;

  if (!currentLease) {
    return (
      <Container padding="none" size="full">
        <Stack spacing="lg">
          <Card>
            <CardHeader>
              <CardTitle>No Active Lease</CardTitle>
              <CardDescription>
                You don&apos;t have an active lease at the moment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="muted">
                Once you sign a lease agreement, your lease details will appear here.
              </Typography>
            </CardContent>
          </Card>

          {historyResult.success && historyResult.data && historyResult.data.length > 0 && (
            <div>
              <Typography variant="h2" className="mb-4">
                Lease History
              </Typography>
              <LeaseHistory leases={historyResult.data} />
            </div>
          )}
        </Stack>
      </Container>
    );
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            My Lease
          </Typography>
          <Typography variant="muted">
            View and manage your current lease agreement
          </Typography>
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
      </Stack>
    </Container>
  );
}