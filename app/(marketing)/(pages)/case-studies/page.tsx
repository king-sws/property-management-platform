/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, Users, Home } from 'lucide-react'

export default function CaseStudiesPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Customer Success Stories
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            See how landlords and property managers are growing their business with Propely.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-6 mb-16">
          <CaseStudyCard
            company="Metro Property Group"
            industry="Commercial Real Estate"
            logo="🏢"
            quote="Propely helped us manage 50+ properties efficiently and reduced our administrative work by 60%."
            results={[
              { label: 'Properties Managed', value: '50+' },
              { label: 'Time Saved', value: '60%' },
              { label: 'Tenant Satisfaction', value: '95%' }
            ]}
            href="/case-studies/metro-property-group"
          />

          <CaseStudyCard
            company="Riverside Rentals"
            industry="Residential Property Management"
            logo="🏘️"
            quote="We scaled from 10 to 75 properties in 18 months while maintaining high tenant satisfaction."
            results={[
              { label: 'Portfolio Growth', value: '650%' },
              { label: 'Vacancy Rate', value: '2.1%' },
              { label: 'Collections', value: '99.2%' }
            ]}
            href="/case-studies/riverside-rentals"
          />

          <CaseStudyCard
            company="Urban Living Properties"
            industry="Multi-Family Housing"
            logo="🌆"
            quote="Automated rent collection increased our on-time payments from 78% to 96% in just 3 months."
            results={[
              { label: 'On-Time Payments', value: '+18%' },
              { label: 'Collection Time', value: '-5 days' },
              { label: 'Late Fees', value: '-72%' }
            ]}
            href="/case-studies/urban-living"
          />

          <CaseStudyCard
            company="Heritage Homes LLC"
            industry="Historic Property Rentals"
            logo="🏛️"
            quote="The maintenance workflow automation helped us respond to tenant requests 3x faster."
            results={[
              { label: 'Response Time', value: '3x faster' },
              { label: 'Tenant Retention', value: '92%' },
              { label: 'Maintenance Costs', value: '-25%' }
            ]}
            href="/case-studies/heritage-homes"
          />

          <CaseStudyCard
            company="Campus Housing Partners"
            industry="Student Housing"
            logo="🎓"
            quote="Managing 200+ student tenants became effortless with automated lease renewals and payments."
            results={[
              { label: 'Units Managed', value: '200+' },
              { label: 'Renewal Rate', value: '88%' },
              { label: 'Admin Time', value: '-70%' }
            ]}
            href="/case-studies/campus-housing"
          />

          <CaseStudyCard
            company="Coastal Vacation Rentals"
            industry="Short-Term Rentals"
            logo="🏖️"
            quote="Integrated calendar and payment systems streamlined our vacation rental operations across 30 properties."
            results={[
              { label: 'Booking Rate', value: '+42%' },
              { label: 'Revenue Growth', value: '+38%' },
              { label: 'Occupancy', value: '87%' }
            ]}
            href="/case-studies/coastal-vacation"
          />
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <StatCard
            icon={Home}
            value="10,000+"
            label="Properties Managed"
          />
          <StatCard
            icon={Users}
            value="50,000+"
            label="Happy Tenants"
          />
          <StatCard
            icon={TrendingUp}
            value="$2.5B+"
            label="Rent Collected"
          />
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Ready to grow your portfolio?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join thousands of landlords who trust Propely to manage their properties.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

function CaseStudyCard({ 
  company, 
  industry, 
  logo, 
  quote, 
  results,
  href 
}: {
  company: string
  industry: string
  logo: string
  quote: string
  results: { label: string; value: string }[]
  href: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{logo}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{company}</h3>
          <p className="text-sm text-muted-foreground">{industry}</p>
        </div>
      </div>

      <blockquote className="text-muted-foreground mb-6 italic">
        "{quote}"
      </blockquote>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {results.map((result, idx) => (
          <div key={idx} className="text-center">
            <div className="text-xl font-semibold text-foreground mb-1">
              {result.value}
            </div>
            <div className="text-xs text-muted-foreground">
              {result.label}
            </div>
          </div>
        ))}
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Read full story
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function StatCard({ icon: Icon, value, label }: {
  icon: any
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 text-center">
      <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}