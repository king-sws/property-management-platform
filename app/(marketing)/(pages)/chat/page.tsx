import Link from 'next/link'
import { ArrowLeft, Mail, BookOpen, LifeBuoy } from 'lucide-react'

export default function ChatPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-2xl px-4 sm:px-6 lg:px-8">

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
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Contact Support
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            We're here to help. Choose the support option that works best for you.
          </p>
        </div>

        {/* Support Options */}
        <div className="space-y-4">
          <Link
            href="mailto:hello@propely.site"
            className="group flex items-start gap-4 rounded-xl border border-border bg-background p-6 transition hover:border-foreground/20 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Email Support
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Send us a message and we'll respond within 24 hours.
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                hello@propely.site →
              </p>
            </div>
          </Link>

          <Link
            href="/help"
            className="group flex items-start gap-4 rounded-xl border border-border bg-background p-6 transition hover:border-foreground/20 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Help Center
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Browse articles, guides, and answers to common questions.
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                Browse articles →
              </p>
            </div>
          </Link>

          <Link
            href="/support"
            className="group flex items-start gap-4 rounded-xl border border-border bg-background p-6 transition hover:border-foreground/20 hover:shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
              <LifeBuoy className="size-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Submit a Ticket
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Need detailed help? Open a support ticket and our team will follow up.
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                Open a ticket →
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
