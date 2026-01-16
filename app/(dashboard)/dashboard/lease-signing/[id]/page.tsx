// app/(dashboard)/dashboard/lease-signing/[id]/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeaseForSigning } from "@/actions/lease-signing";
import { LeaseSigningView } from "@/components/lease-signing/lease-signing-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LeaseSigningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const result = await getLeaseForSigning(id);

  if (!result.success) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const lease = result.data;

  // If user has already signed
  if (lease.userSigningStatus.hasSigned) {
    // ✅ Determine user role for correct button
    const isTenant = lease.userSigningStatus.role === "TENANT";
    
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Already Signed</h2>
                <p className="text-muted-foreground mt-2">
                  You signed this lease on{" "}
                  {new Date(lease.userSigningStatus.signedAt!).toLocaleDateString()}
                </p>
              </div>

              {lease.signingProgress.isFullySigned ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600 font-medium">
                    ✓ All parties have signed - Lease is now ACTIVE
                  </p>
                  <div className="flex gap-3 justify-center">
                    {/* ✅ Show different buttons based on role */}
                    {isTenant ? (
                      <Button asChild>
                        <Link href="/dashboard/my-lease">View My Lease</Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href={`/dashboard/leases/${id}`}>View Lease Details</Link>
                      </Button>
                    )}
                    <Button asChild variant="outline">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Waiting for {lease.signingProgress.totalNeeded - lease.signingProgress.totalSigned} more signature(s)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${lease.signingProgress.percentage}%` }}
                    />
                  </div>
                  <Button asChild variant="outline" className="mt-4">
                    <Link href="/dashboard">Return to Dashboard</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <LeaseSigningView lease={lease} />
    </div>
  );
}