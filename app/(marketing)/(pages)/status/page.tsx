import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

export default function StatusPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-3xl px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-1.5 text-sm font-medium text-green-700 dark:text-green-300 mb-4">
            <CheckCircle2 className="size-4" />
            All Systems Operational
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            System Status
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Current status of Propely's services and infrastructure.
          </p>
        </div>

        {/* Services */}
        <div className="rounded-xl border border-border bg-background overflow-hidden mb-12">
          <div className="p-6 border-b border-border">
            <h2 className="font-medium">Services</h2>
          </div>
          <div className="divide-y divide-border">
            <ServiceRow name="Web Application" status="operational" />
            <ServiceRow name="API" status="operational" />
            <ServiceRow name="Payment Processing" status="operational" />
            <ServiceRow name="Email Notifications" status="operational" />
            <ServiceRow name="File Storage" status="operational" />
          </div>
        </div>

        {/* Subscribe to updates */}
        <div className="text-center rounded-xl border border-border bg-muted/30 p-8">
          <h3 className="font-medium mb-2">Get notified of any outages</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We'll email you if any of our services experience an interruption.
          </p>
          <a
            href="mailto:hello@propely.site?subject=Status%20Updates%20Subscription"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Mail className="size-4" />
            hello@propely.site
          </a>
        </div>
      </div>
    </section>
  )
}

function ServiceRow({ name, status }: { name: string; status: 'operational' }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <span className="text-sm text-foreground">{name}</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
        <span className="size-2 rounded-full bg-green-500" />
        Operational
      </span>
    </div>
  )
}
