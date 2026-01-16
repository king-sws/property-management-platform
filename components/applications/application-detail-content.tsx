/* eslint-disable @typescript-eslint/no-explicit-any */
// components/applications/application-detail-content.tsx
"use client";

import { format } from "date-fns";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  Briefcase,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

interface ApplicationDetailContentProps {
  application: any;
  isLandlord: boolean;
  isTenant: boolean;
}

export function ApplicationDetailContent({
  application,
  isLandlord,
}: ApplicationDetailContentProps) {
  const propertyImages = application.unit.property.images || [];
  const primaryImage = propertyImages.find((img: any) => img.isPrimary) || propertyImages[0];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Property & Unit Information with Images */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property & Unit Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Property Images Gallery */}
          {propertyImages.length > 0 && (
            <div className="space-y-3">
              {/* Primary Image */}
              {primaryImage && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.caption || application.unit.property.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {primaryImage.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3">
                      <p className="text-sm text-white">{primaryImage.caption}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnail Gallery */}
              {propertyImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {propertyImages.slice(0, 4).map((image: any, index: number) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-md overflow-hidden bg-muted"
                    >
                      <Image
                        src={image.url}
                        alt={image.caption || `Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {image.isPrimary && (
                        <Badge className="absolute top-1 right-1 text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Images Placeholder */}
          {propertyImages.length === 0 && (
            <div className="flex items-center justify-center p-12 bg-muted rounded-lg">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No property images available</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Property Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Property</p>
                <p className="text-lg font-semibold">{application.unit.property.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{application.unit.property.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.unit.property.city}, {application.unit.property.state}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unit</p>
                  <p className="text-lg font-semibold">#{application.unit.unitNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rent</p>
                  <p className="text-lg font-semibold">
                    ${Number(application.unit.rentAmount).toLocaleString()}/mo
                  </p>
                </div>
              </div>

              {application.unit.bedrooms && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bedrooms</p>
                    <p>{application.unit.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bathrooms</p>
                    <p>{application.unit.bathrooms}</p>
                  </div>
                </div>
              )}

              {application.unit.squareFeet && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Square Feet</p>
                  <p>{application.unit.squareFeet.toLocaleString()} sq ft</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicant Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Applicant Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-lg font-semibold">{application.tenant.user.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Contact</p>
            <div className="space-y-2 mt-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${application.tenant.user.email}`}
                  className="text-primary hover:underline"
                >
                  {application.tenant.user.email}
                </a>
              </div>
              {application.tenant.user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${application.tenant.user.phone}`}
                    className="text-primary hover:underline"
                  >
                    {application.tenant.user.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Move-In Date</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p>{format(new Date(application.desiredMoveInDate), "MMM dd, yyyy")}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Occupants</p>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p>{application.numberOfOccupants}</p>
              </div>
            </div>
          </div>

          {application.hasPets && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pets</p>
              <p className="text-sm mt-1">{application.petDetails || "Yes"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment & Income */}
      {(application.employer || application.monthlyIncome) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment & Income
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.employer && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employer</p>
                <p className="font-medium">{application.employer}</p>
              </div>
            )}

            {application.employmentLength && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Length of Employment
                </p>
                <p>{application.employmentLength}</p>
              </div>
            )}

            {application.monthlyIncome && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Monthly Income
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    ${Number(application.monthlyIncome).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rental History */}
      {(application.previousAddress || application.previousLandlord) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Rental History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.previousAddress && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Previous Address
                </p>
                <p>{application.previousAddress}</p>
              </div>
            )}

            {application.previousLandlord && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Previous Landlord
                </p>
                <p>{application.previousLandlord}</p>
                {application.previousLandlordPhone && (
                  <p className="text-sm text-muted-foreground">
                    {application.previousLandlordPhone}
                  </p>
                )}
              </div>
            )}

            {application.reasonForMoving && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reason for Moving
                </p>
                <p className="text-sm">{application.reasonForMoving}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Occupants */}
      {application.occupants && application.occupants.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Additional Occupants
            </CardTitle>
            <CardDescription>
              {application.occupants.length} additional occupant(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {application.occupants.map((occupant: any, index: number) => (
                <div key={index} className="rounded-lg border p-4 space-y-2">
                  <p className="font-medium">{occupant.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{occupant.relationship}</span>
                    {occupant.age && <span>Age: {occupant.age}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {application.references && application.references.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              References
            </CardTitle>
            <CardDescription>
              {application.references.length} reference(s) provided
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {application.references.map((reference: any, index: number) => (
                <div key={index} className="rounded-lg border p-4 space-y-2">
                  <p className="font-medium">{reference.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {reference.relationship}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <a href={`tel:${reference.phone}`} className="text-primary hover:underline">
                        {reference.phone}
                      </a>
                    </div>
                    {reference.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${reference.email}`} className="text-primary hover:underline">
                          {reference.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Timeline */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Application Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(application.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
            </div>

            {application.submittedAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(application.submittedAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
            )}

            {application.approvedAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Application Approved</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(application.approvedAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
            )}

            {application.deniedAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Application Denied</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(application.deniedAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                  {application.denialReason && (
                    <p className="text-sm mt-2 p-3 bg-red-50 rounded-md">
                      {application.denialReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {application.expiresAt && application.status === "SUBMITTED" && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Expires On</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(application.expiresAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Landlord Notes */}
      {isLandlord && application.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Notes visible only to landlords</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{application.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}