/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { Scale, FileText, AlertTriangle, ArrowRight } from 'lucide-react'

export default function LegalResourcesPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Legal Resources for Landlords
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Stay informed about landlord-tenant laws and regulations.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6 mb-12">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Legal Disclaimer
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This information is for educational purposes only and does not constitute legal advice. 
                Always consult with a qualified attorney for specific legal questions.
              </p>
            </div>
          </div>
        </div>

        {/* Federal Laws */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Federal Laws & Regulations</h2>
          <div className="space-y-4">
            <LegalCard
              title="Fair Housing Act"
              description="Prohibits discrimination in housing based on race, color, religion, sex, national origin, disability, and familial status."
              topics={['Discrimination', 'Protected Classes', 'Reasonable Accommodations']}
              href="/legal/fair-housing-act"
            />
            <LegalCard
              title="Americans with Disabilities Act (ADA)"
              description="Requires reasonable accommodations for tenants with disabilities in common areas and public spaces."
              topics={['Accessibility', 'Service Animals', 'Modifications']}
              href="/legal/ada"
            />
            <LegalCard
              title="Lead-Based Paint Disclosure"
              description="Requires disclosure of known lead-based paint hazards in properties built before 1978."
              topics={['Disclosure Requirements', 'EPA Regulations', 'Penalties']}
              href="/legal/lead-paint"
            />
          </div>
        </div>

        {/* State-Specific Laws */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">State-Specific Resources</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <StateCard
              state="California"
              topics={['Rent Control', 'Just Cause Eviction', 'Security Deposits']}
              href="/legal/california"
            />
            <StateCard
              state="New York"
              topics={['Rent Stabilization', 'Lease Requirements', 'Warranty of Habitability']}
              href="/legal/new-york"
            />
            <StateCard
              state="Texas"
              topics={['Security Deposit Limits', 'Notice Requirements', 'Eviction Process']}
              href="/legal/texas"
            />
            <StateCard
              state="Florida"
              topics={['Notice to Vacate', 'Security Deposit Returns', 'Tenant Rights']}
              href="/legal/florida"
            />
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/legal/states"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View all states
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Common Legal Topics */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Common Legal Topics</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <TopicCard
              icon={FileText}
              title="Security Deposits"
              description="Laws governing security deposit collection, holding, and return procedures."
              href="/legal/security-deposits"
            />
            <TopicCard
              icon={FileText}
              title="Eviction Process"
              description="Legal procedures for evicting tenants, including notice requirements and court processes."
              href="/legal/evictions"
            />
            <TopicCard
              icon={FileText}
              title="Lease Agreements"
              description="Essential clauses, legal requirements, and best practices for drafting leases."
              href="/legal/lease-agreements"
            />
            <TopicCard
              icon={FileText}
              title="Property Inspections"
              description="Landlord rights to enter property and required notice periods by state."
              href="/legal/inspections"
            />
            <TopicCard
              icon={FileText}
              title="Tenant Screening"
              description="Legal considerations for background checks, credit reports, and application fees."
              href="/legal/tenant-screening"
            />
            <TopicCard
              icon={FileText}
              title="Maintenance & Repairs"
              description="Landlord responsibilities and tenant rights regarding property maintenance."
              href="/legal/maintenance"
            />
          </div>
        </div>

        {/* Resources */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Additional Resources</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <ResourceCard
              title="HUD Resources"
              description="Official guidance from the U.S. Department of Housing and Urban Development"
              href="https://www.hud.gov"
              external
            />
            <ResourceCard
              title="EPA Lead Program"
              description="Information about lead-based paint regulations and compliance"
              href="https://www.epa.gov/lead"
              external
            />
            <ResourceCard
              title="Legal Aid Organizations"
              description="Find free or low-cost legal assistance in your area"
              href="/legal/legal-aid"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Need legal advice?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We recommend consulting with a qualified attorney for your specific situation.
          </p>
          <Link
            href="/legal/find-attorney"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Find an Attorney
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

function LegalCard({ 
  title, 
  description, 
  topics,
  href 
}: {
  title: string
  description: string
  topics: string[]
  href: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
      <div className="flex items-start gap-4">
        <Scale className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {topics.map((topic, idx) => (
              <span 
                key={idx}
                className="text-xs bg-muted px-2 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Learn more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function StateCard({ 
  state, 
  topics,
  href 
}: {
  state: string
  topics: string[]
  href: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
      <h3 className="font-semibold mb-3">{state}</h3>
      <ul className="space-y-2 mb-4">
        {topics.map((topic, idx) => (
          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {topic}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        View {state} laws
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function TopicCard({ 
  icon: Icon,
  title, 
  description,
  href 
}: {
  icon: any
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border p-6 hover:border-foreground/30 transition group"
    >
      <Icon className="h-6 w-6 text-primary mb-3" />
      <h3 className="font-semibold mb-2 group-hover:text-primary transition">{title}</h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </Link>
  )
}

function ResourceCard({ 
  title, 
  description,
  href,
  external
}: {
  title: string
  description: string
  href: string
  external?: boolean
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <Link
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        {external ? 'Visit site' : 'Learn more'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}