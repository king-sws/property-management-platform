/* eslint-disable react/no-unescaped-entities */
// app/(marketing)/features/analytics/page.tsx
import Link from "next/link"
import {
  BarChart3,
  ArrowRight,
  Play,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Wrench,
  Users,
  PieChart,
  FileDown,
  Eye,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Analytics — Propely",
  description:
    "Financial insights, occupancy trends, and maintenance reports — all in one place. Know your portfolio inside out.",
}

const problems = [
  {
    icon: Eye,
    title: "Flying blind on portfolio health",
    description:
      "Without real data, you don't know which properties are profitable, which are underperforming, or where money is leaking. Gut feel isn't a strategy.",
  },
  {
    icon: Clock,
    title: "Hours building reports manually",
    description:
      "You export from your bank, copy into Excel, and spend a Sunday afternoon building reports your accountant needs. Every. Single. Month.",
  },
  {
    icon: AlertCircle,
    title: "Patterns you can't see",
    description:
      "Recurring maintenance issues, seasonal vacancy spikes, and late payment trends are invisible when data lives in spreadsheets and text threads.",
  },
]

const solutions = [
  {
    icon: DollarSign,
    color: "bg-amber-500/10 text-amber-400",
    title: "Income & expense tracking",
    description:
      "See your total revenue, expenses, and net operating income per property, per month, and across your whole portfolio — updated in real time.",
  },
  {
    icon: Home,
    color: "bg-blue-500/10 text-blue-400",
    title: "Occupancy rate trends",
    description:
      "Track vacancy over time, spot seasonal patterns, and see which properties consistently underperform so you can act before it costs you.",
  },
  {
    icon: Wrench,
    color: "bg-rose-500/10 text-rose-400",
    title: "Maintenance cost analysis",
    description:
      "See your total maintenance spend by property, category, and vendor. Identify which properties drain the most and optimize accordingly.",
  },
  {
    icon: Users,
    color: "bg-violet-500/10 text-violet-400",
    title: "Tenant payment analytics",
    description:
      "Track on-time payment rates per tenant, see late payment trends, and identify who needs automated reminders before they become a problem.",
  },
  {
    icon: PieChart,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Portfolio overview dashboard",
    description:
      "One screen to rule them all — total units, gross rent, NOI, vacancy rate, and open tickets. The executive view of your portfolio.",
  },
  {
    icon: FileDown,
    color: "bg-sky-500/10 text-sky-400",
    title: "Tax-ready exports",
    description:
      "Download income statements, expense reports, and transaction history in one click — formatted exactly how your accountant needs them.",
  },
]

const kpis = [
  { label: "Gross monthly rent", value: "$34,200", change: "+8.2%", trend: "up", color: "text-emerald-400", changeBg: "bg-emerald-500/10 text-emerald-400" },
  { label: "Net operating income", value: "$26,450", change: "+5.1%", trend: "up", color: "text-emerald-400", changeBg: "bg-emerald-500/10 text-emerald-400" },
  { label: "Portfolio occupancy", value: "87%", change: "-2.3%", trend: "down", color: "text-amber-400", changeBg: "bg-amber-500/10 text-amber-400" },
  { label: "Avg days to fill unit", value: "11 days", change: "-3 days", trend: "up", color: "text-emerald-400", changeBg: "bg-emerald-500/10 text-emerald-400" },
]

const propertyPerformance = [
  { name: "Maple Court Apts", units: 12, occupancy: 92, revenue: 18_400, expenses: 3_200, noi: 15_200, trend: "up" },
  { name: "Sunset Villa", units: 1, occupancy: 100, revenue: 3_200, expenses: 280, noi: 2_920, trend: "up" },
  { name: "Harbor View Lofts", units: 6, occupancy: 83, revenue: 7_800, expenses: 1_400, noi: 6_400, trend: "up" },
  { name: "Birchwood Terrace", units: 4, occupancy: 50, revenue: 2_800, expenses: 1_900, noi: 900, trend: "down" },
  { name: "Elm Street Duplex", units: 2, occupancy: 50, revenue: 1_800, expenses: 620, noi: 1_180, trend: "down" },
]

const maintenanceByCategory = [
  { category: "HVAC", count: 8, cost: 3_200, pct: 38 },
  { category: "Plumbing", count: 5, cost: 1_800, pct: 24 },
  { category: "Electrical", count: 3, cost: 950, pct: 11 },
  { category: "Appliances", count: 4, cost: 1_200, pct: 14 },
  { category: "Other", count: 4, cost: 1_100, pct: 13 },
]

const steps = [
  { number: "01", title: "Connect your data", description: "Propely pulls from your rent, maintenance, and lease data automatically — no imports needed." },
  { number: "02", title: "See your dashboard", description: "Your portfolio KPIs, income trends, and property breakdown are ready the moment you log in." },
  { number: "03", title: "Drill into what matters", description: "Click into any property, tenant, or expense category for a full breakdown." },
  { number: "04", title: "Export when you need it", description: "One-click reports for your accountant, investors, or tax filing — always up to date." },
]

const trustedBy = [
  { initials: "MK", bg: "bg-amber-500/20 text-amber-400" },
  { initials: "JR", bg: "bg-blue-500/20 text-blue-400" },
  { initials: "AL", bg: "bg-violet-500/20 text-violet-400" },
  { initials: "TS", bg: "bg-emerald-500/20 text-emerald-400" },
  { initials: "PW", bg: "bg-rose-500/20 text-rose-400" },
]

export default function AnalyticsPage() {
  return (
    <main className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
            Analytics
          </p>
          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            Stop guessing.{" "}
            <span className="text-amber-400">Know your numbers.</span>
          </h1>
          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Propely turns your rent, maintenance, and lease data into clear financial insights —
            so you can make smarter decisions and grow your portfolio with confidence.
          </p>
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start free trial
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="size-4" />
                Watch demo
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex">
              {trustedBy.map((a, i) => (
                <div key={a.initials} className={`flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium ${a.bg} ${i !== 0 ? "-ml-2" : ""}`}>
                  {a.initials}
                </div>
              ))}
            </div>
            <span className="text-amber-400">★★★★★</span>
            <span>Trusted by 500+ property managers</span>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/2">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">The problem</p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">What you don't know is costing you</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Most landlords have no real visibility into their portfolio performance. They're managing millions in assets with a spreadsheet.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-6">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Icon className="size-5 text-amber-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Analytics dashboard mockup ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">The solution</p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Your portfolio, fully visible</h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">Real-time KPIs, property-level breakdowns, and maintenance cost analysis — always one click away.</p>
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-foreground/[0.02] p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{k.label}</p>
              <p className={`font-display text-2xl font-medium tracking-tighter mb-1 ${k.color}`}>{k.value}</p>
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${k.changeBg}`}>
                {k.trend === "up" ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
                {k.change} vs last month
              </div>
            </div>
          ))}
        </div>

        {/* Property performance table */}
        <div className="rounded-xl border border-border bg-foreground/[0.02] overflow-hidden mb-6">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <p className="text-xs font-medium">Property performance — June 2025</p>
            <span className="text-[10px] text-muted-foreground font-mono">NOI = Revenue − Expenses</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Property", "Units", "Occupancy", "Revenue", "Expenses", "NOI", "Trend"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {propertyPerformance.map((p) => (
                  <tr key={p.name} className="hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3 text-xs font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.units}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-foreground/10">
                          <div className={`h-full rounded-full ${p.occupancy >= 80 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${p.occupancy}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${p.occupancy >= 80 ? "text-emerald-400" : "text-amber-400"}`}>{p.occupancy}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-emerald-400 font-medium">${p.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">${p.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-medium">${p.noi.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {p.trend === "up"
                        ? <TrendingUp className="size-4 text-emerald-400" />
                        : <TrendingDown className="size-4 text-rose-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance breakdown */}
        <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
          <p className="text-xs font-medium mb-4">Maintenance spend by category — last 30 days</p>
          <div className="space-y-3">
            {maintenanceByCategory.map((m) => (
              <div key={m.category} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{m.category}</span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-amber-400 w-16 text-right flex-shrink-0">${m.cost.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground w-8 text-right flex-shrink-0">{m.count}x</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ─────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">Features</p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Every insight you actually need</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">No bloated BI tools. No manual reports. Just the data that matters, surfaced automatically.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-foreground/20">
                  <div className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg ${s.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">How it works</p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Insights without the setup</h2>
          <p className="text-[#b4b4b5]">No data pipelines. No integrations to configure. It just works with your existing Propely data.</p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block" />
              )}
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-medium text-amber-400">
                {step.number}
              </div>
              <h3 className="font-medium text-sm mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ───────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">Before vs after</p>
              <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-5">
                From gut feel to{" "}
                <span className="text-amber-400">data-driven decisions</span>
              </h2>
              <p className="text-[#b4b4b5] leading-relaxed mb-8">
                Landlords who track their portfolio with Propely identify underperforming properties an average of 4 months earlier — and course-correct before it becomes a real problem.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: BarChart3, text: "Real-time NOI per property, always visible" },
                  { icon: TrendingUp, text: "Spot occupancy trends before vacancies hit" },
                  { icon: FileDown, text: "Tax-ready reports in one click" },
                  { icon: Wrench, text: "See which properties cost the most to maintain" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-[#b4b4b5]">
                      <Icon className="size-4 flex-shrink-0 text-amber-400" />
                      {item.text}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-foreground/[0.02] overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="border-r border-border p-6">
                  <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px] mb-4">Without Propely</p>
                  <ul className="space-y-3">
                    {["Manual Excel reports", "No occupancy trends", "Guessing NOI", "Tax prep takes days", "Invisible maintenance costs"].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-[9px]">✕</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="font-mono font-medium tracking-wider text-amber-400/70 uppercase text-[11px] mb-4">With Propely</p>
                  <ul className="space-y-3">
                    {["Auto-generated reports", "Live occupancy dashboard", "Real-time NOI per property", "One-click tax export", "Full maintenance cost breakdown"].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-[#b4b4b5]">
                        <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-[9px]">✓</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}