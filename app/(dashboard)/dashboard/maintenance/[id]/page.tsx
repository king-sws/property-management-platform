// app/(dashboard)/dashboard/maintenance/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMaintenanceTicketById } from "@/actions/maintenance";
import { Wrench } from "lucide-react";
import { MaintenanceDetailsImproved } from "@/components/maintenance/maintenance-details";
import { TicketReviewSection } from "@/components/maintenance/ticket-review-section";
import prisma from "@/lib/prisma";

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Details</h1>
          <p className="text-muted-foreground">
            View and manage maintenance request
          </p>
        </div>
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
    </div>
  );
}