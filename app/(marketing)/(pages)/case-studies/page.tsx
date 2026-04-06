'use client'

import Link from 'next/link'
import { ArrowRight, Home, TrendingUp, Clock } from 'lucide-react'

export default function CaseStudiesPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            How Landlords Use Propely
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Real-world scenarios showing how property managers and landlords streamline their operations.
          </p>
        </div>

        {/* Use Cases */}
        <div className="grid gap-8 mb-16">
          <UseCaseCard
            title="Single-Property Landlords' Journey'
            icon={<Home className="size-5" />}
            summary="Managing one rental property shouldn't require a full-time job. Here's how solo landlords use Propely to stay organized without the overhead of spreadsheets and paper files."
            benefits={[
              { label: 'Rent collection', detail: 'Automated online payments replace checks and cash' },
              { label: 'Maintenance tracking', detail: 'One dashboard for all repair requests and vendor coordination' },
              { label: 'Lease management', detail: 'Digital signing, reminders, and document storage in one place' },
            ]}
          />

          <UseCaseCard
            title="Scaling a Rental Portfolio'
            icon={<TrendingUp className="size-5" />}
            summary="Growing from 5 to 50+ properties requires systems that scale. Landlords who grow with Propely report spending less time on admin and more time acquiring properties."
            benefits={[
              { label: 'Centralized dashboard', detail: 'See all properties, units, and tenants at a glance' },
              { label: 'Automated workflows', detail: 'Lease renewals, rent reminders, and late fee calculations run on autopilot' },
              { label: 'Financial clarity', detail: 'Income, expenses, and profitability tracked per property' },
            ]}
          />

          <UseCaseCard
            title="Reducing Tenant Turnover'
            icon={<Clock className="size-5" />}
            summary="Finding a new tenant costs far more than keeping a good one. Landlords who use Propely's tenant portal and communication tools report higher satisfaction and longer lease renewals."
            benefits={[
              { label: 'Tenant portal', detail: 'Self-service payments, maintenance requests, and lease documents' },
              { label: 'Faster responses', detail: 'Maintenance tickets are tracked and never fall through the cracks' },
              { label: 'Smooth renewals', detail: 'Automated lease renewal offers and digital re-signing' },
            ]}
          />
        </div>

        {/* CTA */}
        <div className="text-center rounded-2xl border border-border bg-muted/30 p-10">
          <h2 className="text-2xl font-semibold tracking-tight mb-3">
            See how Propely can work for you
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Start your free trial and experience the difference a dedicated property management platform makes.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Get started free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function UseCaseCard({
  title,
  icon,
  summary,
  benefits,
}: {
  title: string
  icon: React.ReactNode
  summary: string
  benefits: { label: string; detail: string }[]
}) {
  return (
    <div className="group rounded-xl border border-border bg-background p-6 md:p-8 transition hover:border-foreground/20 hover:shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{summary}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mt-6 pt-6 border-t border-border">
        {benefits.map((b) => (
          <div key={b.label}>
            <p className="text-sm font-medium text-foreground">{b.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{b.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
