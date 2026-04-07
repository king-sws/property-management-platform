/* eslint-disable react/no-unescaped-entities */
// app/(marketing)/resources/state/page.tsx
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Wrench,
  DollarSign,
  Home,
  AlertTriangle,
  Download,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "State of Property Management 2026 — Propely",
  description:
    "Data and insights from 500+ independent landlords on how they manage their portfolios, what's working, and where the industry is heading.",
}

const keyFindings = [
  {
    stat: "68%",
    label: "of landlords still use spreadsheets as their primary management tool",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: AlertTriangle,
  },
  {
    stat: "11 days",
    label: "average time to fill a vacant unit — down from 18 days in 2022",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: TrendingDown,
  },
  {
    stat: "4.2x",
    label: "landlords using software collect rent faster than those who don't",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: DollarSign,
  },
  {
    stat: "34%",
    label: "of maintenance requests are never formally tracked or documented",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: Wrench,
  },
]

const sections = [
  {
    number: "01",
    icon: Home,
    color: "bg-blue-500/10 text-blue-400",
    title: "Portfolio growth & composition",
    summary: "The average independent landlord manages 6.2 units across 2.8 properties — up from 4.8 units in 2020. Single-family rentals still dominate at 54% of all units, but multi-family acquisition is growing at twice the rate.",
    stats: [
      { label: "Avg units per landlord", value: "6.2", change: "+29%", up: true },
      { label: "Single-family share", value: "54%", change: "-4%", up: false },
      { label: "Multi-family growth rate", value: "2x", change: "vs SFR", up: true },
    ],
  },
  {
    number: "02",
    icon: DollarSign,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Rent collection & late payments",
    summary: "Late rent remains the top operational challenge for 71% of landlords. However, those using automated payment platforms report 60% fewer late payments — and collect an average of 4 days faster per month.",
    stats: [
      { label: "Landlords with late payment issues", value: "71%", change: "top challenge", up: false },
      { label: "Reduction with automation", value: "60%", change: "fewer late payments", up: true },
      { label: "Days faster with auto-pay", value: "4 days", change: "avg per month", up: true },
    ],
  },
  {
    number: "03",
    icon: Wrench,
    color: "bg-rose-500/10 text-rose-400",
    title: "Maintenance & repair costs",
    summary: "Maintenance costs have risen 22% since 2022, driven by labor shortages and materials inflation. HVAC and plumbing together account for 62% of all emergency repairs. Landlords with a formal ticketing system resolve issues 3x faster.",
    stats: [
      { label: "Cost increase since 2022", value: "22%", change: "labor & materials", up: false },
      { label: "HVAC + plumbing share", value: "62%", change: "of emergency repairs", up: false },
      { label: "Faster resolution with software", value: "3x", change: "vs informal tracking", up: true },
    ],
  },
  {
    number: "04",
    icon: Users,
    color: "bg-violet-500/10 text-violet-400",
    title: "Tenant retention & satisfaction",
    summary: "A 10% improvement in tenant satisfaction correlates with a 6-month longer average tenancy. The biggest driver? Responsiveness to maintenance requests — not rent price. Landlords with portals see 18% higher retention rates.",
    stats: [
      { label: "Correlation: satisfaction to tenure", value: "6 mo", change: "longer avg tenancy", up: true },
      { label: "Top retention driver", value: "Maintenance", change: "not rent price", up: true },
      { label: "Portal users' retention lift", value: "18%", change: "higher retention", up: true },
    ],
  },
  {
    number: "05",
    icon: BarChart3,
    color: "bg-amber-500/10 text-amber-400",
    title: "Technology adoption",
    summary: "Software adoption is accelerating but fragmented. 68% still rely on spreadsheets, while 44% use at least two separate tools that don't talk to each other. All-in-one platforms see the highest satisfaction scores by a wide margin.",
    stats: [
      { label: "Still using spreadsheets", value: "68%", change: "primary tool", up: false },
      { label: "Using 2+ disconnected tools", value: "44%", change: "fragmented stack", up: false },
      { label: "All-in-one satisfaction score", value: "4.7/5", change: "vs 3.1 fragmented", up: true },
    ],
  },
]

const pullQuotes = [
  {
    quote: "I used to spend every Sunday reconciling rent payments. Now it just happens.",
    name: "Marcus T.",
    role: "12-unit portfolio, Denver CO",
    initials: "MT",
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    quote: "A tenant left a 5-star review specifically because I responded to maintenance so fast. That's the portal doing its job.",
    name: "Sarah K.",
    role: "8-unit portfolio, Austin TX",
    initials: "SK",
    color: "bg-violet-500/20 text-violet-400",
  },
  {
    quote: "I bought two more properties this year because I finally had the bandwidth. The software paid for itself ten times over.",
    name: "James O.",
    role: "22-unit portfolio, Miami FL",
    initials: "JO",
    color: "bg-blue-500/20 text-blue-400",
  },
]

const trustedBy = [
  { initials: "MK", bg: "bg-blue-500/20 text-blue-400" },
  { initials: "JR", bg: "bg-emerald-500/20 text-emerald-400" },
  { initials: "AL", bg: "bg-violet-500/20 text-violet-400" },
  { initials: "TS", bg: "bg-amber-500/20 text-amber-400" },
  { initials: "PW", bg: "bg-rose-500/20 text-rose-400" },
]

export default function StateOfPropertyManagementPage() {
  return (
    <main className="w-full">

      {/* ── Hero — editorial style ────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">Propely Research</span>
            <span className="text-border">·</span>
            <span className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">2026 Report</span>
          </div>
          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            State of Property Management{" "}
            <span className="text-foreground/40">2026</span>
          </h1>
          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Data and insights from 500+ independent landlords on how they manage their portfolios,
            what's breaking down, and where the industry is heading.
          </p>

          {/* Report meta */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />
              500+ landlords surveyed
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Home className="size-3.5" />
              12,000+ units represented
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Published June 2026
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="gap-2">
              <Download className="size-4" />
              Download full report
            </Button>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="gap-2">
                Try Propely free
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Key findings ─────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">Key findings</p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">The numbers that matter</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Four data points every landlord should know — and what they mean for how you run your portfolio.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {keyFindings.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.stat} className={`rounded-xl border p-6 ${f.bg}`}>
                  <Icon className={`size-5 mb-4 ${f.color}`} />
                  <p className={`font-display text-4xl font-medium tracking-tighter mb-3 ${f.color}`}>{f.stat}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Report sections ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">Report sections</p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Five areas. Hundreds of data points.</h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">Each section covers a critical area of property management — with benchmarks you can compare your portfolio against.</p>
        </div>

        <div className="space-y-5">
          {sections.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.number} className="rounded-xl border border-border bg-foreground/[0.02] p-6 transition-colors hover:border-foreground/20">
                <div className="flex items-start gap-5">
                  <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[11px] text-muted-foreground">{s.number}</span>
                      <h3 className="font-medium text-base">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.summary}</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {s.stats.map((stat) => (
                        <div key={stat.label} className="rounded-lg border border-border bg-background p-3">
                          <p className={`font-display text-xl font-medium tracking-tighter mb-1 ${stat.up ? "text-emerald-400" : "text-rose-400"}`}>{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                          <p className="text-[10px] text-foreground/40 mt-0.5">{stat.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Pull quotes ───────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">From the survey</p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">In their own words</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Landlords who switched to software-first management — in their own words.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {pullQuotes.map((q) => (
              <div key={q.name} className="rounded-xl border border-border bg-background p-6 flex flex-col gap-4">
                <div className="flex-1">
                  <p className="font-mono text-[11px] text-foreground/30 mb-3">"</p>
                  <p className="text-sm text-[#b4b4b5] leading-relaxed">{q.quote}</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${q.color}`}>
                    {q.initials}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{q.name}</p>
                    <p className="text-[10px] text-muted-foreground">{q.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Methodology + CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">

          {/* Methodology */}
          <div className="rounded-xl border border-border bg-foreground/[0.02] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="size-4 text-muted-foreground" />
              <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">Methodology</p>
            </div>
            <h3 className="font-display font-medium tracking-tighter text-xl mb-3">How we collected this data</h3>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>This report is based on a survey of 512 independent landlords across the United States, conducted in April–May 2026. Respondents managed between 1 and 150 units, with a median of 6.2 units.</p>
              <p>Quantitative data was supplemented with 24 in-depth interviews with landlords managing 10+ units. All respondents were recruited from Propely's user base and independent landlord communities.</p>
              <p>Statistical significance was assessed at the 95% confidence interval. Margin of error is ±3.8%.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-foreground/[0.02] p-6 flex flex-col gap-5">
            <div>
              <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px] mb-3">Get the full report</p>
              <h3 className="font-display font-medium tracking-tighter text-xl mb-3">
                58 pages of data, benchmarks, and playbooks
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The full report includes per-state occupancy benchmarks, a vendor cost comparison tool, and a 12-month implementation roadmap for modernizing your portfolio management.
              </p>
            </div>
            <ul className="space-y-2">
              {[
                "State-by-state occupancy benchmarks",
                "Vendor cost comparison by category",
                "12-month modernization roadmap",
                "Full survey data tables",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-[#b4b4b5]">
                  <span className="flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[9px]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 pt-2">
              <Button className="gap-2 w-full">
                <Download className="size-4" />
                Download full report — free
              </Button>
              <Link href="/sign-up">
                <Button variant="outline" className="gap-2 w-full">
                  Try Propely free
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
