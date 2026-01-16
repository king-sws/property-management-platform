// ============================================================================
// FILE: src/app/(dashboard)/dashboard/properties/[id]/edit/page.tsx
// Edit Property Page - UPDATED with Images
// ============================================================================

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PropertyForm from "@/components/properties/property-form";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "LANDLORD") {
    redirect("/sign-in");
  }

  const landlord = await prisma.landlord.findUnique({
    where: { userId: session.user.id },
  });

  if (!landlord) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const property = await prisma.property.findFirst({
    where: {
      id: id,
      landlordId: landlord.id,
      deletedAt: null,
    },
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
      },
    },
  });

  if (!property) {
    notFound();
  }

  // Convert Decimal fields to numbers for the form
  const initialData = {
    name: property.name,
    type: property.type,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    country: property.country,
    description: property.description ?? undefined,
    yearBuilt: property.yearBuilt ?? undefined,
    squareFeet: property.squareFeet ?? undefined,
    lotSize: property.lotSize ? Number(property.lotSize) : undefined,
    purchasePrice: property.purchasePrice
      ? Number(property.purchasePrice)
      : undefined,
    currentValue: property.currentValue
      ? Number(property.currentValue)
      : undefined,
    propertyTax: property.propertyTax
      ? Number(property.propertyTax)
      : undefined,
    insurance: property.insurance ? Number(property.insurance) : undefined,
    hoaFees: property.hoaFees ? Number(property.hoaFees) : undefined,
  };

  // Map images to the format expected by PropertyImageUploader
  const images = property.images.map((img) => ({
    id: img.id,
    url: img.url,
    caption: img.caption,
    isPrimary: img.isPrimary,
    order: img.order,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-500 mt-1">
          Update the details of {property.name}
        </p>
      </div>
      <PropertyForm
        propertyId={property.id}
        initialData={initialData}
        images={images}
      />
    </div>
  );
}