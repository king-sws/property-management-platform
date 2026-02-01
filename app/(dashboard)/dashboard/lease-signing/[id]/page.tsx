// app/(dashboard)/dashboard/lease-signing/[id]/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getLeaseForSigning } from "@/actions/lease-signing";
import { LeaseSigningView } from "@/components/lease-signing/lease-signing-view";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
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
      <Container padding="none" size="full">
        <Stack spacing="lg">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </Stack>
      </Container>
    );
  }

  const lease = result.data;

  // If user has already signed
  if (lease.userSigningStatus.hasSigned) {
    const isTenant = lease.userSigningStatus.role === "TENANT";
    
    return (
      <Container padding="none" size="full">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <Typography variant="h2" className="mb-2">
                    Already Signed
                  </Typography>
                  <Typography variant="muted">
                    You signed this lease on{" "}
                    {new Date(lease.userSigningStatus.signedAt!).toLocaleDateString()}
                  </Typography>
                </div>

                {lease.signingProgress.isFullySigned ? (
                  <div className="space-y-2">
                    <Typography variant="muted" className="text-sm text-green-600 font-medium">
                      ✓ All parties have signed - Lease is now ACTIVE
                    </Typography>
                    <div className="flex gap-3 justify-center">
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
                    <Typography variant="muted" className="text-sm">
                      Waiting for {lease.signingProgress.totalNeeded - lease.signingProgress.totalSigned} more signature(s)
                    </Typography>
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
      </Container>
    );
  }

  return (
    <Container padding="none" size="full">
      <LeaseSigningView lease={lease} />
    </Container>
  );
}