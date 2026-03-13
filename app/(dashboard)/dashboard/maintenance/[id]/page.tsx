// app/(dashboard)/dashboard/maintenance/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMaintenanceTicketById } from "@/actions/maintenance";
import { MaintenanceDetailsImproved } from "@/components/maintenance/maintenance-details";
import { TicketReviewSection } from "@/components/maintenance/ticket-review-section";
import prisma from "@/lib/prisma";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";

export const metadata = {
  title: "Maintenance Ticket Details | Property Management",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MaintenanceDetailsPage({ params }: PageProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  const { id } = await params;
  
  const result = await getMaintenanceTicketById(id);
  
  if (!result.success) {
    notFound();
  }

  const ticket = result.data;

  // Check for existing review if ticket has a vendor and user is a landlord
  let existingReview = null;
  if (ticket.vendor && session.user.role === "LANDLORD") {
    const review = await prisma.vendorReview.findFirst({
      where: {
        vendorId: ticket.vendor.id,
        authorId: session.user.id,
      },
      select: {
        id: true,
        rating: true,
        title: true,
        comment: true,
        createdAt: true,
        qualityRating: true,
        punctualityRating: true,
        professionalismRating: true,
        valueRating: true,
      },
    });

    // Transform the review data to match component expectations
    if (review) {
      existingReview = {
        id: review.id,
        rating: review.rating,
        title: review.title ?? undefined, // Convert null to undefined
        comment: review.comment ?? undefined, // Convert null to undefined
        createdAt: review.createdAt.toISOString(), // Convert Date to string
      };
    }
  }
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div>
          <Typography variant="h2" className="mb-1">
            Ticket Details
          </Typography>
          <Typography variant="muted">
            View and manage maintenance request
          </Typography>
        </div>
        
        <MaintenanceDetailsImproved ticket={ticket} userRole={session.user.role} />
        
        {/* Review Section - Only shows for completed tickets with vendors */}
        <TicketReviewSection
          ticket={{
            id: ticket.id,
            status: ticket.status,
            vendor: ticket.vendor ? {
              id: ticket.vendor.id,
              businessName: ticket.vendor.businessName,
              rating: ticket.vendor.rating ? Number(ticket.vendor.rating) : undefined,
              reviewCount: ticket.vendor.reviewCount,
            } : null,
          }}
          currentUserRole={session.user.role || ''}
          existingReview={existingReview}
        />
      </Stack>
    </Container>
  );
}