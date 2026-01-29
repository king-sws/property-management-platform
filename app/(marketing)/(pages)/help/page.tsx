'use client'

import Link from 'next/link'
import { 
  ArrowRightIcon, 
  BookOpenIcon, 
  MessageSquareIcon, 
  VideoIcon,
  FileTextIcon,
  HelpCircleIcon,
  MailIcon
} from 'lucide-react'

const helpCategories = [
  {
    icon: BookOpenIcon,
    title: 'Getting Started',
    desc: 'Learn the basics of setting up and managing your properties',
    articles: 12,
    href: '/help/getting-started',
  },
  {
    icon: FileTextIcon,
    title: 'Lease Management',
    desc: 'Creating, signing, and managing lease agreements',
    articles: 8,
    href: '/help/leases',
  },
  {
    icon: MessageSquareIcon,
    title: 'Tenant Communication',
    desc: 'Best practices for tenant messaging and notifications',
    articles: 15,
    href: '/help/communication',
  },
  {
    icon: VideoIcon,
    title: 'Video Tutorials',
    desc: 'Step-by-step video guides for common tasks',
    articles: 20,
    href: '/help/videos',
  },
]

const faqs = [
  {
    question: 'How do I add a new property?',
    answer: 'Navigate to Properties > Add New, fill in the property details including address, type, and rental information. You can also upload photos and documents.',
  },
  {
    question: 'Can I collect rent payments online?',
    answer: 'Yes! Connect your Stripe or PayPal account under Settings > Payments. Tenants can then pay rent via credit card, debit card, or ACH transfer.',
  },
  {
    question: 'How do I screen potential tenants?',
    answer: 'Use our built-in screening tool to run background checks, credit reports, and eviction history. Results are typically available within 24-48 hours.',
  },
  {
    question: 'What happens if a tenant is late on rent?',
    answer: 'You can set up automatic late fee calculations and reminder notifications. The system will send automated reminders at intervals you configure.',
  },
  {
    question: 'Can I manage multiple properties?',
    answer: 'Absolutely! Our platform supports unlimited properties. You can view all properties in one dashboard and filter by location, status, or other criteria.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes, we have mobile apps for both iOS and Android. You can manage properties, communicate with tenants, and view reports on the go.',
  },
  {
    question: 'How do I export financial reports?',
    answer: 'Go to Reports > Financial, select your date range and property filters, then click Export. Reports can be downloaded as PDF or Excel files.',
  },
  {
    question: 'Can I give access to my property manager?',
    answer: 'Yes! Under Settings > Team, you can invite team members and set their permission levels (view-only, editor, or admin).',
  },
]

const supportOptions = [
  {
    icon: MessageSquareIcon,
    title: 'Live Chat',
    desc: 'Chat with our support team',
    availability: 'Mon-Fri, 9am-6pm EST',
    action: 'Start chat',
    href: '/chat',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: MailIcon,
    title: 'Email Support',
    desc: 'Get help via email',
    availability: 'Response within 24 hours',
    action: 'Send email',
    href: 'mailto:support@example.com',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: BookOpenIcon,
    title: 'Documentation',
    desc: 'Browse our knowledge base',
    availability: 'Available 24/7',
    action: 'View docs',
    href: '/docs',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
]

export default function HelpPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-foreground/5 mb-2">
            <HelpCircleIcon className="size-8 text-foreground/70" />
          </div>

          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            HELP CENTER
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl lg:text-5xl">
            How can we help you today?
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-[42em] text-pretty">
            Search our knowledge base, browse articles by category, or get in touch
            with our support team.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-6 py-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
              />
              <ArrowRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/70 mb-6">
            Browse by Category
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, idx) => (
              <Link
                key={idx}
                href={category.href}
                className="group flex flex-col gap-4 rounded-xl border border-border bg-background p-6 transition hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5"
              >
                <div className="flex items-center justify-center size-12 rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition">
                  <category.icon className="size-6 text-foreground/70" />
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {category.desc}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.articles} articles
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium text-foreground mt-auto">
                  Browse articles
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-xl border border-border bg-background overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-medium text-foreground hover:bg-muted/50 transition">
                  <span>{faq.question}</span>
                  <ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-4 pt-2 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Support Options */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Still need help?
            </h2>
            <p className="text-muted-foreground">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {supportOptions.map((option, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center gap-4 rounded-xl border border-border bg-background p-8 transition hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5"
              >
                <div className={`flex items-center justify-center size-14 rounded-full ${option.color}`}>
                  <option.icon className="size-7" />
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {option.desc}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {option.availability}
                  </p>
                </div>

                <Link
                  href={option.href}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90 mt-2"
                >
                  {option.action}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Community CTA */}
        <div className="flex flex-col items-center text-center gap-6 rounded-2xl border border-border bg-muted/30 p-12">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Join our community
            </h3>
            <p className="text-muted-foreground max-w-md">
              Connect with other landlords, share tips, and learn from the community.
            </p>
          </div>

          <Link
            href="/community"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Visit community forum
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}