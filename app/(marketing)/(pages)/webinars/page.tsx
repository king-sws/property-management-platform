import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Mail } from 'lucide-react'

export default function WebinarsPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Webinars & Events
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Learn from property management experts through live sessions and recorded workshops.
          </p>
        </div>

        {/* Upcoming Webinars */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Upcoming Sessions</h2>

          <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
            <Calendar className="size-8 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Webinars Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              We're planning our first live webinar series on property management best practices.
              Subscribe to our newsletter to be notified when sessions are announced.
            </p>
            <Link
              href="mailto:hello@propely.site?subject=Webinar%20Notification"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Mail className="size-4" />
              Get notified
            </Link>
          </div>
        </div>

        {/* Past Topics */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Topics We'll Cover</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TopicCard
              title="Maximizing Rental Income"
              description="Proven strategies to increase rent while maintaining tenant satisfaction."
              duration="60 min"
            />
            <TopicCard
              title="Tenant Screening Best Practices"
              description="How to find and screen quality tenants to minimize vacancy and turnover."
              duration="45 min"
            />
            <TopicCard
              title="Legal Updates for Landlords"
              description="Stay compliant with the latest landlord-tenant laws in your area."
              duration="90 min"
            />
            <TopicCard
              title="Property Management at Scale"
              description="Systems and tools for managing large portfolios efficiently."
              duration="60 min"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Have a topic you'd like us to cover?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We'd love to hear what you want to learn about. Send us your suggestions.
          </p>
          <a
            href="mailto:hello@propely.site?subject=Webinar%20Topic%20Suggestion"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Suggest a topic →
          </a>
        </div>

      </div>
    </section>
  )
}

function TopicCard({
  title,
  description,
  duration,
}: {
  title: string
  description: string
  duration: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        {duration}
      </div>
    </div>
  )
}
