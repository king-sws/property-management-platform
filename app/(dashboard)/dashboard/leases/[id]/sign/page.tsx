// ============================================================================
// FILE 2: app/(dashboard)/dashboard/leases/[id]/sign/page.tsx
// ============================================================================
import { LeaseSigningForm } from "@/components/lease/lease-signing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { getLeaseForSigning } from "@/actions/lease-signing"; 

interface LeaseSigningPageProps {
  params: {
    id: string;
  };
}

export default async function LeaseSigningPage({ params }: LeaseSigningPageProps) {
  const result = await getLeaseForSigning(params.id); // ✅ Use correct function name

  if (!result.success) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { lease, userSigningStatus, signingProgress } = result.data; // ✅ Destructure correct properties

  // If already signed, show confirmation
  if (userSigningStatus.hasSigned) { // ✅ Use userSigningStatus.hasSigned
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle>Lease Agreement Signed</CardTitle>
            </div>
            <CardDescription>
              You have successfully signed this lease agreement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <p className="text-sm font-medium">
                <strong>Signing Status:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✅ You have signed the lease</li>
                <li>
                  {signingProgress.isFullySigned
                    ? "✅ All tenants have signed" 
                    : `⏳ ${signingProgress.tenantsSignedCount} of ${lease.tenants.length} tenants have signed`}
                </li>
                <li>
                  {signingProgress.landlordSigned
                    ? "✅ Landlord has signed" 
                    : "⏳ Waiting for landlord signature"}
                </li>
              </ul>
            </div>
            
            {signingProgress.isFullySigned && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Your lease is now fully executed and active! You can view it in{" "}
                  <a href="/dashboard/my-lease" className="underline font-medium">
                    My Lease
                  </a>
                  .
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <LeaseSigningForm leaseData={result.data} />
    </div>
  );
}