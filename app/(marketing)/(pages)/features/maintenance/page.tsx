// app/(marketing)/features/maintenance/page.tsx
import Link from "next/link"
import {
  Wrench,
  ArrowRight,
  Play,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  MessageSquare,
  Bell,
  ClipboardList,
  Zap,
  Shield,
  TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export const metadata = {
  title: "Maintenance Tracking — Propely",
  description:
    "Stop losing maintenance requests in text threads. Propely gives tenants a portal to submit tickets, landlords a dashboard to assign vendors, and everyone real-time status updates.",
}

// ─── Static data ─────────────────────────────────────────────────────────────

const problems = [
  {
    icon: MessageSquare,
    title: "Requests buried in texts",
    description:
      "Maintenance requests arrive via text, WhatsApp, email, and voicemail — scattered across 5 different places with no central record.",
  },
  {
    icon: Clock,
    title: "No visibility on progress",
    description:
      "Tenants have no idea what's happening after they report an issue. They follow up repeatedly, you spend time on status calls instead of fixing things.",
  },
  {
    icon: AlertCircle,
    title: "Vendors fall through the cracks",
    description:
      "Coordinating vendors over text means missed confirmations, double-bookings, and jobs that simply never get done.",
  },
]

const solutions = [
  {
    icon: ClipboardList,
    color: "bg-blue-500/10 text-blue-400",
    title: "Structured ticket submission",
    description:
      "Tenants submit requests through their portal with photos, descriptions, and preferred access times. Every request is logged, timestamped, and categorized automatically.",
  },
  {
    icon: User,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "One-click vendor assignment",
    description:
      "Assign tickets to vendors from your saved contact list. They get notified instantly with all the details they need — no back-and-forth required.",
  },
  {
    icon: Bell,
    color: "bg-violet-500/10 text-violet-400",
    title: "Automatic status updates",
    description:
      "Tenants get notified when their ticket is assigned, when work is scheduled, and when it's resolved. Zero chasing, zero status calls.",
  },
  {
    icon: Building2,
    color: "bg-amber-500/10 text-amber-400",
    title: "Property-level tracking",
    description:
      "See all open tickets across your entire portfolio at once. Filter by property, priority, or status — and catch recurring issues before they become expensive.",
  },
  {
    icon: Shield,
    color: "bg-rose-500/10 text-rose-400",
    title: "Full audit trail",
    description:
      "Every action is logged — who reported it, when it was assigned, how long it took to resolve. Useful for disputes, insurance claims, and compliance.",
  },
  {
    icon: TrendingDown,
    color: "bg-sky-500/10 text-sky-400",
    title: "Trend reporting",
    description:
      "Identify which properties generate the most tickets, which vendors resolve fastest, and where your maintenance spend is going — automatically.",
  },
]

const tickets = [
  {
    id: "TKT-0041",
    title: "HVAC unit not cooling",
    property: "Maple Court Apts",
    unit: "Unit 4B",
    status: "In Progress",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    priority: "Urgent",
    priorityColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    vendor: "CoolAir HVAC Services",
    vendorLogo: "/images/avatar-3.png",
    submitted: "2h ago",
    category: "HVAC",
  },
  {
    id: "TKT-0039",
    title: "Kitchen faucet leaking",
    property: "Sunset Villa",
    unit: "Unit 1A",
    status: "Open",
    statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    priority: "Medium",
    priorityColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    vendor: "Unassigned",
    vendorInitials: "—",
    vendorColor: "bg-foreground/10 text-muted-foreground",
    submitted: "5h ago",
    category: "Plumbing",
  },
  {
    id: "TKT-0037",
    title: "Broken door lock on unit entry",
    property: "Birchwood Terrace",
    unit: "Unit 2C",
    status: "Open",
    statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    priority: "High",
    priorityColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    vendor: "SecureFix Locksmiths",
    vendorInitials: "SF",
    vendorColor: "bg-emerald-500/20 text-emerald-400",
    submitted: "1d ago",
    category: "Security",
  },
  {
    id: "TKT-0034",
    title: "Hallway light fixture out",
    property: "Harbor View Lofts",
    unit: "Common Area",
    status: "Resolved",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    priority: "Low",
    priorityColor: "bg-foreground/10 text-muted-foreground border-border",
    vendor: "BrightSpark Electric",
    vendorInitials: "BS",
    vendorColor: "bg-violet-500/20 text-violet-400",
    submitted: "3d ago",
    category: "Electrical",
  },
  {
    id: "TKT-0031",
    title: "Dishwasher not draining",
    property: "Maple Court Apts",
    unit: "Unit 7A",
    status: "Resolved",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    priority: "Medium",
    priorityColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    vendor: "QuickFix Appliances",
    vendorInitials: "QF",
    vendorColor: "bg-amber-500/20 text-amber-400",
    submitted: "5d ago",
    category: "Appliances",
  },
  {
    id: "TKT-0028",
    title: "Pest issue reported in kitchen",
    property: "Elm Street Duplex",
    unit: "Unit B",
    status: "In Progress",
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    priority: "High",
    priorityColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    vendor: "GreenShield Pest Control",
    vendorInitials: "GP",
    vendorColor: "bg-emerald-500/20 text-emerald-400",
    submitted: "6d ago",
    category: "Pest Control",
  },
]

const steps = [
  {
    number: "01",
    title: "Tenant submits a request",
    description:
      "Through their portal, with a photo, description, and preferred access window. Takes 60 seconds.",
  },
  {
    number: "02",
    title: "You review & assign",
    description:
      "You see the ticket instantly on your dashboard. One click to assign a vendor from your saved list.",
  },
  {
    number: "03",
    title: "Vendor is notified",
    description:
      "The vendor gets all the details automatically — property, unit, issue, and contact info.",
  },
  {
    number: "04",
    title: "Everyone stays in the loop",
    description:
      "Status updates flow automatically to the tenant. You see everything resolve in real time.",
  },
]

const trustedBy = [
  { image: "/images/avatar-1.png" },
  { image: "/images/avatar-2.png" },
  { image: "/images/avatar-3.png" },
  { image: "/images/avatar-1.png" },
  { image: "/images/avatar-2.png" },
];

// ─── Ticket card component ────────────────────────────────────────────────────

function TicketCard({ ticket }: { ticket: typeof tickets[0] }) {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4 transition-colors hover:border-foreground/20">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] text-muted-foreground mb-1">{ticket.id}</p>
          <h4 className="text-sm font-medium truncate">{ticket.title}</h4>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium flex-shrink-0 ${ticket.priorityColor}`}>
          {ticket.priority === "Urgent" && <AlertTriangle className="size-2.5" />}
          {ticket.priority}
        </span>
      </div>

      {/* Property + unit */}
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
        <Building2 className="size-3 flex-shrink-0" />
        <span className="truncate">{ticket.property}</span>
        <span className="text-border">·</span>
        <span className="flex-shrink-0">{ticket.unit}</span>
      </div>

      {/* Category chip */}
      <div className="mb-3">
        <span className="inline-flex items-center rounded-full bg-foreground/5 border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          {ticket.category}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
        {/* Vendor */}

<div className="flex items-center gap-2 min-w-0">
  <div className="size-6 flex-shrink-0 rounded-full overflow-hidden bg-muted">
    {ticket.vendorLogo ? (
      <Image
        src={ticket.vendorLogo}
        alt={ticket.vendor}
        width={24}
        height={24}
        className="object-cover"
      />
    ) : (
      <div className="size-6 flex items-center justify-center text-xs font-medium text-muted-foreground">
        {ticket.vendorInitials}
      </div>
    )}
  </div>
  <span className="text-[11px] text-muted-foreground truncate">
    {ticket.vendor}
  </span>
</div>
        {/* Status + time */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-muted-foreground">{ticket.submitted}</span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${ticket.statusColor}`}>
            {ticket.status === "Resolved" && <CheckCircle2 className="size-2.5" />}
            {ticket.status === "In Progress" && <Zap className="size-2.5" />}
            {ticket.status === "Open" && <Clock className="size-2.5" />}
            {ticket.status}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const open = tickets.filter((t) => t.status === "Open").length
  const inProgress = tickets.filter((t) => t.status === "In Progress").length
  const resolved = tickets.filter((t) => t.status === "Resolved").length

  return (
    <main className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
            Maintenance tracking
          </p>
          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            Stop losing maintenance requests{" "}
            <span className="text-rose-400">in your texts</span>
          </h1>
          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Propely replaces scattered texts and missed calls with a structured ticketing system —
            so every request is tracked, every vendor is assigned, and every tenant stays informed.
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
  <div
    key={i}
    className={`size-7 rounded-full border-2 border-background overflow-hidden ${
      i !== 0 ? "-ml-2" : ""
    }`}
  >
    <Image
      src={a.image}
      alt="avatar"
      width={28}
      height={28}
      className="object-cover"
    />
  </div>
              ))}
            </div>
            <span className="text-amber-400">★★★★★</span>
            <span>Trusted by 500+ property managers</span>
          </div>
        </div>
      </section>

      {/* ── Problem section ──────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
              The problem
            </p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
              How maintenance gets chaotic
            </h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">
              Most landlords manage maintenance the same broken way — until a tenant leaves over it.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-xl border border-rose-500/10 bg-rose-500/[0.03] p-6">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
                    <Icon className="size-5 text-rose-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Ticket dashboard preview ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
            The solution
          </p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
            Every ticket. Every status. One place.
          </h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">
            From submission to resolution — your entire maintenance workflow in a single dashboard.
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Open", count: open, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
            { label: "In Progress", count: inProgress, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Zap },
            { label: "Resolved", count: resolved, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
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

        {/* Ticket grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </section>

      {/* ── Solution features ─────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
              How Propely fixes it
            </p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
              Built around how maintenance actually works
            </h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">
              Not a generic helpdesk. A maintenance system designed specifically for landlords and tenants.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-foreground/20"
                >
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
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
            How it works
          </p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
            From report to resolved in 4 steps
          </h2>
          <p className="text-[#b4b4b5]">
            No phone calls. No lost messages. No chasing vendors.
          </p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block" />
              )}
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-medium text-rose-400">
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
              <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
                Before vs after
              </p>
              <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-5">
                The difference is{" "}
                <span className="text-emerald-400">night and day</span>
              </h2>
              <p className="text-[#b4b4b5] leading-relaxed mb-8">
                Landlords who switch to Propely&#39;s maintenance system resolve tickets 3x faster
                and see a measurable drop in tenant complaints within the first 30 days.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: Zap, text: "Average resolution time drops from 6 days to 2" },
                  { icon: Bell, text: "Zero missed requests — every ticket is logged" },
                  { icon: Shield, text: "Full paper trail for every maintenance action" },
                  { icon: TrendingDown, text: "Fewer tenant escalations and early move-outs" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-[#b4b4b5]">
                      <Icon className="size-4 flex-shrink-0 text-emerald-400" />
                      {item.text}
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-foreground/[0.02] overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="border-r border-border p-6">
                  <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px] mb-4">
                    Without Propely
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Requests via text & email",
                      "No vendor assignment system",
                      "Tenants left in the dark",
                      "No audit trail",
                      "Recurring issues go unnoticed",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-[9px]">✕</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="font-mono font-medium tracking-wider text-emerald-400/70 uppercase text-[11px] mb-4">
                    With Propely
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Structured tenant portal",
                      "One-click vendor dispatch",
                      "Automatic status updates",
                      "Complete maintenance history",
                      "Trend reports per property",
                    ].map((t) => (
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