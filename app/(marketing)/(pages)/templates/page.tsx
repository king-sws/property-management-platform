'use client'

import Link from 'next/link'
import { FileText, Download, ArrowRight } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Free Templates & Resources
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Download professionally designed templates to streamline your property management.
          </p>
        </div>

        {/* Lease Templates */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Lease Agreements</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TemplateCard
              title="Standard Residential Lease"
              description="Comprehensive lease agreement for residential properties with all essential terms and conditions."
              format="PDF, DOCX"
              downloads="12.3k"
              href="/templates/residential-lease"
            />
            <TemplateCard
              title="Month-to-Month Rental Agreement"
              description="Flexible agreement for short-term tenancies with automatic renewal provisions."
              format="PDF, DOCX"
              downloads="8.7k"
              href="/templates/month-to-month"
            />
            <TemplateCard
              title="Commercial Lease Agreement"
              description="Professional lease template for commercial properties including retail and office spaces."
              format="PDF, DOCX"
              downloads="5.2k"
              href="/templates/commercial-lease"
            />
            <TemplateCard
              title="Roommate Agreement"
              description="Define responsibilities and expectations for multiple tenants sharing a property."
              format="PDF, DOCX"
              downloads="6.1k"
              href="/templates/roommate-agreement"
            />
          </div>
        </div>

        {/* Property Documents */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Property Documents</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TemplateCard
              title="Move-In/Move-Out Checklist"
              description="Detailed inspection checklist to document property condition and avoid disputes."
              format="PDF, DOCX"
              downloads="15.4k"
              href="/templates/inspection-checklist"
            />
            <TemplateCard
              title="Rental Application Form"
              description="Comprehensive application to collect tenant information, references, and employment details."
              format="PDF, DOCX"
              downloads="11.2k"
              href="/templates/rental-application"
            />
            <TemplateCard
              title="Notice to Enter Property"
              description="Legal notice template for landlord entry with proper advance notification."
              format="PDF, DOCX"
              downloads="9.8k"
              href="/templates/notice-to-enter"
            />
            <TemplateCard
              title="Late Rent Notice"
              description="Professional notice for late rent payments with payment instructions."
              format="PDF, DOCX"
              downloads="7.3k"
              href="/templates/late-rent-notice"
            />
          </div>
        </div>

        {/* Financial Templates */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Financial & Administrative</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TemplateCard
              title="Rent Receipt Template"
              description="Professional receipt for documenting rent payments and maintaining records."
              format="PDF, DOCX, XLSX"
              downloads="13.6k"
              href="/templates/rent-receipt"
            />
            <TemplateCard
              title="Property Expense Tracker"
              description="Spreadsheet to track and categorize all property-related expenses for tax purposes."
              format="XLSX, Google Sheets"
              downloads="10.9k"
              href="/templates/expense-tracker"
            />
            <TemplateCard
              title="Lease Renewal Letter"
              description="Template for offering lease renewals with updated terms and rent adjustments."
              format="PDF, DOCX"
              downloads="8.4k"
              href="/templates/lease-renewal"
            />
            <TemplateCard
              title="Security Deposit Return Letter"
              description="Itemized breakdown of security deposit deductions with proper documentation."
              format="PDF, DOCX"
              downloads="9.1k"
              href="/templates/deposit-return"
            />
          </div>
        </div>

        {/* Maintenance Templates */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Maintenance & Repairs</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TemplateCard
              title="Maintenance Request Form"
              description="Standardized form for tenants to submit maintenance and repair requests."
              format="PDF, DOCX"
              downloads="14.2k"
              href="/templates/maintenance-request"
            />
            <TemplateCard
              title="Vendor Agreement Template"
              description="Contract template for engaging contractors and service providers."
              format="PDF, DOCX"
              downloads="6.7k"
              href="/templates/vendor-agreement"
            />
            <TemplateCard
              title="Property Maintenance Schedule"
              description="Calendar template for scheduling routine maintenance and inspections."
              format="XLSX, Google Sheets"
              downloads="7.8k"
              href="/templates/maintenance-schedule"
            />
            <TemplateCard
              title="Emergency Contact List"
              description="Template for maintaining emergency contacts for tenants and service providers."
              format="PDF, DOCX, XLSX"
              downloads="5.9k"
              href="/templates/emergency-contacts"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Need custom templates?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our team can create customized templates tailored to your specific needs.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

function TemplateCard({ 
  title, 
  description, 
  format, 
  downloads,
  href 
}: {
  title: string
  description: string
  format: string
  downloads: string
  href: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>Format: {format}</span>
        <span className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          {downloads} downloads
        </span>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Download template
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}