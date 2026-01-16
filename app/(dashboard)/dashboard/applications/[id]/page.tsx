// app/(dashboard)/dashboard/applications/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getApplicationById } from "@/actions/applications";
import { ApplicationDetailHeader } from "@/components/applications/application-detail-header";
import { ApplicationDetailContent } from "@/components/applications/application-detail-content";
import { ApplicationActions } from "@/components/applications/application-actions";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return {
    title: `Application ${id.slice(0, 8)} | Property Management`,
    description: "View rental application details",
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/sign-in");
  }

  const result = await getApplicationById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const application = result.data;
  const isLandlord = session.user.role === "LANDLORD";
  const isTenant = session.user.role === "TENANT";

  return (
    <div className="flex flex-col gap-6 p-6">
      <ApplicationDetailHeader 
        application={application}
        isLandlord={isLandlord}
        isTenant={isTenant}
      />
      
      <ApplicationDetailContent 
        application={application}
        isLandlord={isLandlord}
        isTenant={isTenant}
      />
      
      <ApplicationActions 
        application={application}
        isLandlord={isLandlord}
        isTenant={isTenant}
      />
    </div>
  );
}