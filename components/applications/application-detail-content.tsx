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
import { Badge } from "@/components/ui/badge";
import {
  Building2, Calendar, DollarSign, Mail, MapPin, Phone,
  User, Users, Briefcase, Home, CheckCircle2, XCircle,
  AlertCircle, ImageIcon, BedDouble, Bath, Maximize2,
} from "lucide-react";

interface ApplicationDetailContentProps {
  application: any;
  isLandlord: boolean;
  isTenant: boolean;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 w-36">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export function ApplicationDetailContent({
  application,
  isLandlord,
}: ApplicationDetailContentProps) {
  const propertyImages = application.unit.property.images || [];
  const primaryImage = propertyImages.find((img: any) => img.isPrimary) || propertyImages[0];

  return (
    <div className="grid gap-6 md:grid-cols-2">

      {/* ── Property & Unit ── */}
      <Card className="md:col-span-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property & Unit Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Images */}
          {propertyImages.length > 0 ? (
            <div className="p-6 border-b space-y-3">
              {primaryImage && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.caption || application.unit.property.name}
                    fill className="object-cover" priority
                  />
                  {primaryImage.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-4 py-2">
                      <p className="text-sm text-white">{primaryImage.caption}</p>
                    </div>
                  )}
                </div>
              )}
              {propertyImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {propertyImages.slice(0, 4).map((image: any, index: number) => (
                    <div key={image.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                      <Image src={image.url} alt={image.caption || `Image ${index + 1}`} fill className="object-cover" />
                      {image.isPrimary && <Badge className="absolute top-1 right-1 text-xs">Primary</Badge>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 border-b flex flex-col items-center justify-center text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No property images available</p>
            </div>
          )}

          {/* Property + unit info side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            <div className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Property</p>
              <p className="font-semibold mb-1">{application.unit.property.name}</p>
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  {application.unit.property.address}, {application.unit.property.city}, {application.unit.property.state}
                </span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Unit</p>
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Number</p>
                  <p className="font-semibold">#{application.unit.unitNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rent</p>
                  <p className="font-semibold">${Number(application.unit.rentAmount).toLocaleString()}/mo</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {application.unit.bedrooms && (
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />{application.unit.bedrooms} bed
                  </span>
                )}
                {application.unit.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" />{application.unit.bathrooms} bath
                  </span>
                )}
                {application.unit.squareFeet && (
                  <span className="flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5" />{application.unit.squareFeet.toLocaleString()} sqft
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Applicant Information ── */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Applicant
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="font-semibold text-base mb-1">{application.tenant.user.name}</p>
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <a href={`mailto:${application.tenant.user.email}`} className="text-primary hover:underline truncate">
                {application.tenant.user.email}
              </a>
            </div>
            {application.tenant.user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a href={`tel:${application.tenant.user.phone}`} className="text-primary hover:underline">
                  {application.tenant.user.phone}
                </a>
              </div>
            )}
          </div>

          <InfoRow
            label="Move-In Date"
            value={
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                {format(new Date(application.desiredMoveInDate), "MMM dd, yyyy")}
              </span>
            }
          />
          <InfoRow
            label="Occupants"
            value={
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                {application.numberOfOccupants}
              </span>
            }
          />
          {application.hasPets && (
            <InfoRow label="Pets" value={application.petDetails || "Yes"} />
          )}
        </CardContent>
      </Card>

      {/* ── Employment & Income ── */}
      {(application.employer || application.monthlyIncome) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment & Income
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {application.employer && (
              <InfoRow label="Employer" value={application.employer} />
            )}
            {application.employmentLength && (
              <InfoRow label="Employment Length" value={application.employmentLength} />
            )}
            {application.monthlyIncome && (
              <InfoRow
                label="Monthly Income"
                value={
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <DollarSign className="h-3.5 w-3.5" />
                    {Number(application.monthlyIncome).toLocaleString()}
                  </span>
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Rental History ── */}
      {(application.previousAddress || application.previousLandlord) && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Rental History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {application.previousAddress && (
              <InfoRow label="Previous Address" value={application.previousAddress} />
            )}
            {application.previousLandlord && (
              <InfoRow
                label="Previous Landlord"
                value={
                  <span>
                    {application.previousLandlord}
                    {application.previousLandlordPhone && (
                      <span className="block text-xs text-muted-foreground font-normal">
                        {application.previousLandlordPhone}
                      </span>
                    )}
                  </span>
                }
              />
            )}
            {application.reasonForMoving && (
              <InfoRow label="Reason for Moving" value={application.reasonForMoving} />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Additional Occupants ── */}
      {application.occupants?.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Additional Occupants
            </CardTitle>
            <CardDescription>
              {application.occupants.length} additional occupant{application.occupants.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {application.occupants.map((occupant: any, index: number) => (
                <div key={index} className="rounded-lg border px-4 py-3 space-y-0.5">
                  <p className="text-sm font-medium">{occupant.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{occupant.relationship}</span>
                    {occupant.age && <span>· Age {occupant.age}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── References ── */}
      {application.references?.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              References
            </CardTitle>
            <CardDescription>
              {application.references.length} reference{application.references.length !== 1 ? "s" : ""} provided
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {application.references.map((reference: any, index: number) => (
                <div key={index} className="rounded-lg border px-4 py-3 space-y-2">
                  <div>
                    <p className="text-sm font-semibold">{reference.name}</p>
                    <p className="text-xs text-muted-foreground">{reference.relationship}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                      <a href={`tel:${reference.phone}`} className="text-primary hover:underline">{reference.phone}</a>
                    </div>
                    {reference.email && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                        <a href={`mailto:${reference.email}`} className="text-primary hover:underline">{reference.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Timeline ── */}
      <Card className="md:col-span-2">
        <CardHeader className="border-b">
          <CardTitle>Application Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-0">
            {[
              {
                show: true,
                icon: CheckCircle2,
                iconClass: "text-primary",
                bgClass: "bg-primary/10",
                label: "Application Created",
                date: application.createdAt,
              },
              {
                show: !!application.submittedAt,
                icon: CheckCircle2,
                iconClass: "text-blue-600",
                bgClass: "bg-blue-100 dark:bg-blue-950/40",
                label: "Application Submitted",
                date: application.submittedAt,
              },
              {
                show: !!application.approvedAt,
                icon: CheckCircle2,
                iconClass: "text-green-600",
                bgClass: "bg-green-100 dark:bg-green-950/40",
                label: "Application Approved",
                date: application.approvedAt,
              },
              {
                show: !!application.deniedAt,
                icon: XCircle,
                iconClass: "text-destructive",
                bgClass: "bg-red-100 dark:bg-red-950/40",
                label: "Application Denied",
                date: application.deniedAt,
                extra: application.denialReason ? (
                  <div className="mt-2 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2">
                    <p className="text-xs text-red-800 dark:text-red-300">{application.denialReason}</p>
                  </div>
                ) : null,
              },
              {
                show: !!application.expiresAt && application.status === "SUBMITTED",
                icon: AlertCircle,
                iconClass: "text-yellow-600",
                bgClass: "bg-yellow-100 dark:bg-yellow-950/40",
                label: "Expires On",
                date: application.expiresAt,
              },
            ]
              .filter((e) => e.show)
              .map((entry, i, arr) => {
                const Icon = entry.icon;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${entry.bgClass}`}>
                        <Icon className={`h-4 w-4 ${entry.iconClass}`} />
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-px flex-1 bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-6 flex-1">
                      <p className="text-sm font-medium leading-none pt-1.5">{entry.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.date), "MMM dd, yyyy 'at' hh:mm a")}
                      </p>
                      {entry.extra}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* ── Internal Notes ── */}
      {isLandlord && application.notes && (
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Visible only to landlords</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {application.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}