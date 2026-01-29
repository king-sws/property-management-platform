'use client'

import Link from 'next/link'
import { Calendar, Users, Clock, ArrowRight } from 'lucide-react'

export default function WebinarsPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Webinars & Live Events
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Join our live sessions and learn from property management experts.
          </p>
        </div>

        {/* Upcoming Webinars */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Upcoming Webinars</h2>
          <div className="space-y-4">
            <WebinarCard
              title="Maximizing Rental Income in 2026"
              date="Feb 5, 2026"
              time="2:00 PM EST"
              duration="60 min"
              attendees="234 registered"
              description="Learn proven strategies to increase your rental income while maintaining tenant satisfaction."
              type="upcoming"
              href="/webinars/rental-income-2026"
            />
            <WebinarCard
              title="Tenant Screening Best Practices"
              date="Feb 12, 2026"
              time="1:00 PM EST"
              duration="45 min"
              attendees="189 registered"
              description="Discover how to find and screen quality tenants to minimize vacancy and turnover."
              type="upcoming"
              href="/webinars/tenant-screening"
            />
            <WebinarCard
              title="Legal Updates for Landlords"
              date="Feb 19, 2026"
              time="3:00 PM EST"
              duration="90 min"
              attendees="312 registered"
              description="Stay compliant with the latest landlord-tenant laws and regulations in your area."
              type="upcoming"
              href="/webinars/legal-updates"
            />
          </div>
        </div>

        {/* Past Webinars */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Past Webinars (On-Demand)</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <WebinarCard
              title="Property Maintenance Automation"
              date="Jan 15, 2026"
              time="Recorded"
              duration="55 min"
              attendees="456 views"
              description="Learn how to automate maintenance requests and reduce response times."
              type="recorded"
              href="/webinars/maintenance-automation"
            />
            <WebinarCard
              title="Scaling Your Property Portfolio"
              date="Jan 8, 2026"
              time="Recorded"
              duration="70 min"
              attendees="623 views"
              description="Strategies for growing from 5 to 50+ properties without losing control."
              type="recorded"
              href="/webinars/scaling-portfolio"
            />
            <WebinarCard
              title="Financial Reporting for Tax Season"
              date="Dec 18, 2025"
              time="Recorded"
              duration="60 min"
              attendees="891 views"
              description="Get your books ready for tax season with our comprehensive reporting guide."
              type="recorded"
              href="/webinars/tax-reporting"
            />
            <WebinarCard
              title="Creating Effective Lease Agreements"
              date="Dec 11, 2025"
              time="Recorded"
              duration="50 min"
              attendees="534 views"
              description="Essential clauses and terms to protect your interests as a landlord."
              type="recorded"
              href="/webinars/lease-agreements"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Want to host a webinar?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We&#39;re always looking for industry experts to share their knowledge with our community.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Get in touch
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

function WebinarCard({ 
  title, 
  date, 
  time, 
  duration, 
  attendees, 
  description, 
  type,
  href 
}: {
  title: string
  date: string
  time: string
  duration: string
  attendees: string
  description: string
  type: 'upcoming' | 'recorded'
  href: string
}) {
  return (
    <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        {type === 'upcoming' && (
          <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
            Upcoming
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {date}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {time} • {duration}
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {attendees}
        </div>
      </div>

      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        {type === 'upcoming' ? 'Register now' : 'Watch recording'}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}