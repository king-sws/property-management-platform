// app/(marketing)/features/leases/page.tsx
import Link from "next/link"
import {
  FileText,
  ArrowRight,
  Play,
  AlertCircle,
  Clock,
  CheckCircle2,
  PenLine,
  FolderOpen,
  Bell,
  RefreshCw,
  ShieldCheck,
  Upload,
  CalendarDays,
  Building2,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Lease Management — Propely",
  description:
    "Create, sign, and store leases digitally. Get automated renewal alerts, track lease status across your portfolio, and never lose a document again.",
}

const problems = [
  {
    icon: FolderOpen,
    title: "Leases lost in filing cabinets",
    description:
      "Paper leases get damaged, misfiled, or lost entirely. When a dispute arises, you scramble to find documentation that may no longer exist.",
  },
  {
    icon: Clock,
    title: "Missed renewal deadlines",
    description:
      "Lease end dates are tracked in spreadsheets or not at all. You find out a lease expired because the tenant already moved out.",
  },
  {
    icon: AlertCircle,
    title: "Slow, manual signing",
    description:
      "Printing, signing, scanning, and emailing leases wastes hours. New tenants get frustrated before they've even moved in.",
  },
]

const solutions = [
  {
    icon: PenLine,
    color: "bg-sky-500/10 text-sky-400",
    title: "Digital e-signatures",
    description:
      "Send leases for signature in seconds. Tenants sign from any device — no printing, no scanning, no delays.",
  },
  {
    icon: FolderOpen,
    color: "bg-blue-500/10 text-blue-400",
    title: "Centralized document storage",
    description:
      "Every lease, addendum, and renewal is stored securely in the cloud, organized by property and unit, accessible in seconds.",
  },
  {
    icon: Bell,
    color: "bg-amber-500/10 text-amber-400",
    title: "Automated renewal alerts",
    description:
      "Get notified 90, 60, and 30 days before a lease expires. Never miss a renewal window or leave a unit vacant by accident.",
  },
  {
    icon: RefreshCw,
    color: "bg-violet-500/10 text-violet-400",
    title: "One-click lease renewal",
    description:
      "Renew a lease with updated rent and dates in seconds. Send to tenant for e-signature and it's done — no reprinting.",
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Built-in legal templates",
    description:
      "Start from state-compliant lease templates. Customize clauses, add addendums, and know your leases hold up legally.",
  },
  {
    icon: Upload,
    color: "bg-rose-500/10 text-rose-400",
    title: "Import existing leases",
    description:
      "Already have leases? Upload your PDFs to Propely and they'll be stored, organized, and tracked alongside new ones.",
  },
]

const leases = [
  {
    tenant: "Sarah Mitchell",
    initials: "SM",
    avatarColor: "bg-sky-500/20 text-sky-400",
    property: "Maple Court Apts",
    unit: "Unit 4B",
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    startDate: "Jan 1, 2025",
    endDate: "Dec 31, 2025",
    rent: "$2,800",
    daysLeft: 245,
    urgency: "safe",
  },
  {
    tenant: "Priya Sharma",
    initials: "PS",
    avatarColor: "bg-violet-500/20 text-violet-400",
    property: "Birchwood Terrace",
    unit: "Unit 2C",
    status: "Expiring Soon",
    statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    startDate: "Sep 1, 2024",
    endDate: "Aug 31, 2025",
    rent: "$1,950",
    daysLeft: 52,
    urgency: "warn",
  },
  {
    tenant: "James Okafor",
    initials: "JO",
    avatarColor: "bg-blue-500/20 text-blue-400",
    property: "Sunset Villa",
    unit: "Unit 1A",
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    startDate: "Apr 1, 2025",
    endDate: "Mar 31, 2026",
    rent: "$3,200",
    daysLeft: 334,
    urgency: "safe",
  },
  {
    tenant: "Marcus Webb",
    initials: "MW",
    avatarColor: "bg-amber-500/20 text-amber-400",
    property: "Maple Court Apts",
    unit: "Unit 7A",
    status: "Active",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    startDate: "Jul 1, 2025",
    endDate: "Jun 30, 2026",
    rent: "$2,650",
    daysLeft: 390,
    urgency: "safe",
  },
  {
    tenant: "Elena Kovacs",
    initials: "EK",
    avatarColor: "bg-rose-500/20 text-rose-400",
    property: "Elm Street Duplex",
    unit: "Unit B",
    status: "Renewal Pending",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    startDate: "Dec 1, 2024",
    endDate: "Nov 30, 2025",
    rent: "$1,800",
    daysLeft: 145,
    urgency: "safe",
  },
  {
    tenant: "David Chen",
    initials: "DC",
    avatarColor: "bg-emerald-500/20 text-emerald-400",
    property: "Harbor View Lofts",
    unit: "Unit 3F",
    status: "Expiring Soon",
    statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    startDate: "Feb 1, 2025",
    endDate: "Jan 31, 2026",
    rent: "$2,400",
    daysLeft: 38,
    urgency: "danger",
  },
]

const steps = [
  { number: "01", title: "Choose a template", description: "Start from a state-compliant template or upload your own existing lease." },
  { number: "02", title: "Customize & send", description: "Fill in the unit, rent, dates, and clauses. Send to tenant for e-signature in one click." },
  { number: "03", title: "Tenant signs digitally", description: "They sign from any device. You both get a signed copy stored automatically." },
  { number: "04", title: "Propely tracks it", description: "Renewal alerts fire automatically. Your lease history is always one click away." },
]

const trustedBy = [
  { initials: "MK", bg: "bg-sky-500/20 text-sky-400" },
  { initials: "JR", bg: "bg-blue-500/20 text-blue-400" },
  { initials: "AL", bg: "bg-violet-500/20 text-violet-400" },
  { initials: "TS", bg: "bg-amber-500/20 text-amber-400" },
  { initials: "PW", bg: "bg-emerald-500/20 text-emerald-400" },
]

function daysLeftColor(urgency: string) {
  if (urgency === "danger") return "text-rose-400"
  if (urgency === "warn") return "text-amber-400"
  return "text-emerald-400"
}

function daysLeftBg(urgency: string) {
  if (urgency === "danger") return "bg-rose-500"
  if (urgency === "warn") return "bg-amber-500"
  return "bg-emerald-500"
}

export default function LeasePage() {
  const active = leases.filter((l) => l.status === "Active").length
  const expiring = leases.filter((l) => l.status === "Expiring Soon").length
  const pending = leases.filter((l) => l.status === "Renewal Pending").length

  return (
    <main className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
            Lease management
          </p>
          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            Digital leases.{" "}
            <span className="text-sky-400">Zero paperwork.</span>{" "}
            Zero missed renewals.
          </h1>
          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Create, sign, and store leases entirely online. Propely tracks every expiry date and
            alerts you before renewals slip through the cracks.
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
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">The problem</p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Lease chaos is costing you money</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">A missed renewal or a lost lease can cost thousands. Most landlords are one filing cabinet away from a disaster.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-xl border border-sky-500/10 bg-sky-500/[0.03] p-6">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
                    <Icon className="size-5 text-sky-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Lease dashboard mockup ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">The solution</p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Every lease. Every status. At a glance.</h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">See which leases are active, expiring, or pending renewal — across your entire portfolio.</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Active", count: active, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
            { label: "Expiring soon", count: expiring, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
            { label: "Renewal pending", count: pending, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: RefreshCw },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`rounded-xl border p-4 text-center ${s.bg}`}>
                <Icon className={`size-5 mx-auto mb-2 ${s.color}`} />
                <p className={`font-display text-2xl font-medium tracking-tighter ${s.color}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Lease cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leases.map((l) => (
            <div key={l.tenant} className="rounded-xl border border-border bg-foreground/[0.02] p-4 transition-colors hover:border-foreground/20">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex size-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${l.avatarColor}`}>
                  {l.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <User className="size-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{l.tenant}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 className="size-3 text-muted-foreground flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground truncate">{l.property} · {l.unit}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium flex-shrink-0 ${l.statusColor}`}>
                  {l.status}
                </span>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                <CalendarDays className="size-3 flex-shrink-0" />
                <span>{l.startDate} → {l.endDate}</span>
              </div>

              {/* Days left bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground">Days remaining</span>
                  <span className={`text-[11px] font-medium ${daysLeftColor(l.urgency)}`}>{l.daysLeft}d</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className={`h-full rounded-full ${daysLeftBg(l.urgency)}`}
                    style={{ width: `${Math.min((l.daysLeft / 365) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Monthly rent</p>
                  <p className="font-display text-base font-medium tracking-tight">
                    {l.rent}<span className="text-xs text-muted-foreground font-normal">/mo</span>
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                  <FileText className="size-3" />
                  View lease
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solutions ─────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">Features</p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">The full lease lifecycle, handled</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">From creation to renewal, Propely manages every stage of your leases automatically.</p>
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
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">A signed lease in under 5 minutes</h2>
          <p className="text-[#b4b4b5]">No printing. No scanning. No waiting for someone to drop off keys just to sign a document.</p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block" />
              )}
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-medium text-sky-400">
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
                Never miss a renewal.{" "}
                <span className="text-sky-400">Never lose a lease.</span>
              </h2>
              <p className="text-[#b4b4b5] leading-relaxed mb-8">
                A single missed lease renewal can cost you 1–2 months of vacant rent. Propely&lsquo;s automated tracking and alerts make sure that never happens.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Bell, text: "90/60/30-day renewal alerts, automatically" },
                  { icon: PenLine, text: "E-signatures in minutes, not days" },
                  { icon: FolderOpen, text: "Every document stored and searchable" },
                  { icon: ShieldCheck, text: "State-compliant templates built in" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-[#b4b4b5]">
                      <Icon className="size-4 flex-shrink-0 text-sky-400" />
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
                    {["Paper leases in a drawer", "Renewals tracked in Excel", "Manual printing & signing", "No expiry reminders", "Disputes with no paper trail"].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-[9px]">✕</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="font-mono font-medium tracking-wider text-sky-400/70 uppercase text-[11px] mb-4">With Propely</p>
                  <ul className="space-y-3">
                    {["Cloud-stored digital leases", "Automatic renewal tracking", "E-sign in one click", "Automated expiry alerts", "Full legal audit trail"].map((t) => (
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