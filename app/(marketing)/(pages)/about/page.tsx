import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Propely is building the operating system for modern property management. Learn about our mission, values, and the team behind the product.',
}

const stats = [
  { value: 'Built for landlords', label: 'by landlords' },
  { value: 'All-in-one platform', label: 'Properties, tenants, payments' },
  { value: 'Secure & compliant', label: 'Your data stays protected' },
  { value: 'Ongoing updates', label: 'New features every month' },
]

const values = [
  {
    index: '01',
    title: 'Operators first',
    body: 'Every decision starts with one question: does this make life easier for the person managing properties day to day? Not the investor. Not the analyst. The operator.',
  },
  {
    index: '02',
    title: 'Ruthless simplicity',
    body: 'Property management is already complex. Our job is to absorb that complexity so you never have to feel it. If a feature needs a manual, we have not finished designing it.',
  },
  {
    index: '03',
    title: 'Trust is earned in the details',
    body: 'A missed payment notification, a lease that expires quietly, a maintenance request that falls through the cracks — small failures destroy trust. We sweat the small things.',
  },
  {
    index: '04',
    title: 'Transparent by default',
    body: 'No hidden fees. No dark patterns. No terms designed to trap you. We want you to stay because the product is great, not because leaving is painful.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="w-full pt-36 pb-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
          <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px] mb-6">
            About Propely
          </p>
          <h1 className="font-display font-medium tracking-tighter text-5xl sm:text-6xl md:text-7xl leading-[1.05] max-w-4xl">
            The operating system for modern property management
          </h1>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="w-full border-t border-border">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-b border-border">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 py-8 px-6 first:pl-0">
                <span className="text-3xl font-medium tracking-tighter text-foreground">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why we built this ─────────────────────────────── */}
      <section className="w-full py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
            <div className="pt-1">
              <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px]">
                Why we exist
              </p>
            </div>
            <div className="flex flex-col gap-6 text-[1.0625rem] leading-[1.75] text-foreground/80">
              <p>
                Propely started with a frustration most landlords know well: the gap between how property management software looks in a demo and how it actually performs on a Tuesday afternoon when three tenants have questions, a contractor needs scheduling, and rent is two days late.
              </p>
              <p>
                Existing tools were either enterprise systems that required a full-time admin to operate, or lightweight apps that ran out of capability the moment a portfolio grew beyond a handful of units. Neither was built for the independent operator who manages between 5 and 500 units and needs professional-grade tooling without a six-figure implementation budget.
              </p>
              <p>
                So we built Propely. A platform that handles the full rental lifecycle — screening, leases, payments, maintenance, reporting — in a single product that takes an afternoon to set up and gets out of your way.
              </p>
              <p className="text-foreground/40 text-sm border-l-2 border-border pl-4">
                We are a small, focused team. We do not have a ping-pong table. We do have an obsession with making property management feel effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section className="w-full border-t border-border py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20 mb-16">
            <div className="pt-1">
              <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px]">
                How we work
              </p>
            </div>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl">
              The principles behind every product decision
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-0 border border-border rounded-xl overflow-hidden">
            {values.map((v, i) => (
              <div
                key={v.index}
                className={`flex flex-col gap-4 p-8
                  ${i % 2 === 0 ? 'sm:border-r border-border' : ''}
                  ${i < 2 ? 'border-b border-border' : ''}
                `}
              >
                <span className="font-mono text-[11px] text-foreground/30 font-medium">
                  {v.index}
                </span>
                <h3 className="font-semibold text-base text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Road ahead ────────────────────────────────────── */}
      <section className="w-full border-t border-border py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
            <div className="pt-1">
              <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px]">
                The road ahead
              </p>
            </div>
            <div className="flex flex-col gap-6 text-[1.0625rem] leading-[1.75] text-foreground/80">
              <p>
                The rental market moves billions of dollars a year through processes that have not fundamentally changed since the paper lease was invented. We think that is about to change — and Propely is built to be at the center of it.
              </p>
              <p>
                In the near term, that means deeper automation: AI-assisted maintenance triage, predictive occupancy insights, and integrations that connect Propely to the financial tools property managers already use. In the long term, it means rethinking what a property management company can look like when the operations layer is fully automated.
              </p>
              <p>
                We are early. There is a lot of ground to cover. If that sounds interesting —
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/sign-up">
                  <button className="group/button inline-flex items-center gap-2 font-medium text-sm bg-foreground text-background hover:opacity-85 px-5 py-2.5 rounded-lg transition-opacity">
                    Try Propely free
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="inline-flex items-center gap-2 font-medium text-sm border border-border hover:border-foreground/30 text-foreground/80 px-5 py-2.5 rounded-lg transition-colors">
                    Get in touch
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}