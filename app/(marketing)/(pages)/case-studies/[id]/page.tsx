/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import { ArrowLeft, Building2, TrendingUp, Users, DollarSign } from 'lucide-react'

export default function CaseStudyDetailPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <Link 
          href="/case-studies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to case studies
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-6xl">🏢</div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
                Metro Property Group
              </h1>
              <p className="text-muted-foreground">Commercial Real Estate</p>
            </div>
          </div>

          <blockquote className="text-xl text-muted-foreground italic border-l-4 border-primary pl-6">
            "Propely helped us manage 50+ properties efficiently and reduced our administrative work by 60%."
          </blockquote>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MetricCard
            icon={Building2}
            value="50+"
            label="Properties Managed"
            change="+42%"
          />
          <MetricCard
            icon={TrendingUp}
            value="60%"
            label="Time Saved"
          />
          <MetricCard
            icon={Users}
            value="95%"
            label="Tenant Satisfaction"
            change="+8%"
          />
        </div>

        {/* Story Content */}
        <div className="prose prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-semibold mb-4">The Challenge</h2>
          <p className="text-muted-foreground mb-6">
            Metro Property Group was managing over 50 commercial properties across three states using a combination of spreadsheets, email, and paper documents. This fragmented approach led to missed rent payments, delayed maintenance responses, and countless hours spent on administrative tasks.
          </p>

          <h2 className="text-2xl font-semibold mb-4">The Solution</h2>
          <p className="text-muted-foreground mb-6">
            After implementing Propely, Metro Property Group consolidated all property management operations into a single platform. Automated rent collection, maintenance tracking, and tenant communication streamlined their workflow significantly.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Key Features Used</h2>
          <ul className="space-y-2 mb-6">
            <li className="text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Automated rent collection with integrated payment processing</span>
            </li>
            <li className="text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Centralized maintenance request management system</span>
            </li>
            <li className="text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Real-time financial reporting and analytics dashboard</span>
            </li>
            <li className="text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Tenant portal for self-service access</span>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">The Results</h2>
          <p className="text-muted-foreground mb-6">
            Within six months of implementation, Metro Property Group saw dramatic improvements across all key metrics. Administrative time decreased by 60%, allowing staff to focus on strategic growth initiatives. Tenant satisfaction increased to 95%, and on-time rent payments improved by 23%.
          </p>

          <div className="rounded-lg border border-border bg-muted/40 p-6 mb-6">
            <p className="text-sm text-muted-foreground italic">
              "The automation features alone saved us countless hours every week. We can now focus on growing our portfolio instead of drowning in paperwork."
            </p>
            <p className="text-sm font-medium mt-2">
              — Sarah Johnson, Operations Director at Metro Property Group
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-4">What's Next</h2>
          <p className="text-muted-foreground mb-6">
            Metro Property Group plans to expand their portfolio to 75 properties by end of year, confident that Propely's platform can scale with their growth. They're also exploring advanced analytics features to optimize rental pricing and occupancy rates.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Ready to transform your property management?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join thousands of landlords who trust Propely.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Start Free Trial
          </Link>
        </div>

      </div>
    </section>
  )
}

function MetricCard({ 
  icon: Icon, 
  value, 
  label, 
  change 
}: {
  icon: any
  value: string
  label: string
  change?: string
}) {
  return (
    <div className="rounded-lg border border-border p-6">
      <Icon className="h-6 w-6 text-primary mb-3" />
      <div className="text-2xl font-semibold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {change && (
        <div className="text-xs text-green-500 font-medium mt-2">
          {change}
        </div>
      )}
    </div>
  )
}