/* eslint-disable react/no-unescaped-entities */
// app/(marketing)/features/tenants/page.tsx
import Link from "next/link"
import {
  Users,
  ArrowRight,
  Play,
  MessageSquare,
  CreditCard,
  FileText,
  Bell,
  ShieldCheck,
  Smartphone,
  Clock,
  AlertCircle,
  CheckCircle2,
  Star,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Tenant Portal — Propely",
  description:
    "Give your tenants a self-service portal to pay rent, submit maintenance requests, and access their lease — reducing your workload and improving satisfaction.",
}

const problems = [
  {
    icon: MessageSquare,
    title: "Constant back-and-forth",
    description:
      "Tenants text you for lease copies, payment confirmations, and maintenance updates. You spend hours each week on questions that shouldn't need you.",
  },
  {
    icon: Clock,
    title: "Late rent every month",
    description:
      "When paying rent requires a check or a bank transfer, tenants delay. No reminders, no easy payment method, no accountability.",
  },
  {
    icon: AlertCircle,
    title: "No paper trail on disputes",
    description:
      "When a tenant claims they reported something or paid on time, you have no record. Disputes drag on with no documentation to fall back on.",
  },
]

const solutions = [
  {
    icon: CreditCard,
    color: "bg-violet-500/10 text-violet-400",
    title: "Online rent payments",
    description:
      "Tenants pay from their phone — card, bank transfer, or auto-pay. You get notified instantly and see a full payment history in your dashboard.",
  },
  {
    icon: MessageSquare,
    color: "bg-blue-500/10 text-blue-400",
    title: "Maintenance request portal",
    description:
      "Tenants submit requests with photos and descriptions. No more texts — every request is logged, assigned, and tracked to resolution.",
  },
  {
    icon: FileText,
    color: "bg-sky-500/10 text-sky-400",
    title: "Lease & document access",
    description:
      "Tenants can view and download their lease, addendums, and move-in inspection reports anytime — without asking you.",
  },
  {
    icon: Bell,
    color: "bg-amber-500/10 text-amber-400",
    title: "Automated reminders",
    description:
      "Rent due reminders, lease renewal notices, and maintenance status updates go out automatically. You set it once and it runs itself.",
  },
  {
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Full communication log",
    description:
      "Every message, payment, and request is timestamped and stored. If a dispute arises, you have an ironclad record of everything.",
  },
  {
    icon: Smartphone,
    color: "bg-rose-500/10 text-rose-400",
    title: "Mobile-first experience",
    description:
      "The portal works beautifully on any device. Tenants don't need to download an app — it just works in their browser.",
  },
]

const tenants = [
  {
    name: "Sarah Mitchell",
    unit: "Unit 4B · Maple Court Apts",
    initials: "SM",
    color: "bg-violet-500/20 text-violet-400",
    rentStatus: "Paid",
    rentStatusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    leaseEnd: "Dec 2025",
    openTickets: 1,
    lastActive: "2h ago",
    rating: 5,
  },
  {
    name: "James Okafor",
    unit: "Unit 1A · Sunset Villa",
    initials: "JO",
    color: "bg-blue-500/20 text-blue-400",
    rentStatus: "Due in 3 days",
    rentStatusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    leaseEnd: "Mar 2026",
    openTickets: 0,
    lastActive: "1d ago",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    unit: "Unit 2C · Birchwood Terrace",
    initials: "PS",
    color: "bg-emerald-500/20 text-emerald-400",
    rentStatus: "Overdue",
    rentStatusColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    leaseEnd: "Aug 2025",
    openTickets: 2,
    lastActive: "3d ago",
    rating: 4,
  },
  {
    name: "Marcus Webb",
    unit: "Unit 7A · Maple Court Apts",
    initials: "MW",
    color: "bg-amber-500/20 text-amber-400",
    rentStatus: "Paid",
    rentStatusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    leaseEnd: "Jun 2026",
    openTickets: 0,
    lastActive: "5h ago",
    rating: 5,
  },
  {
    name: "Elena Kovacs",
    unit: "Unit B · Elm Street Duplex",
    initials: "EK",
    color: "bg-rose-500/20 text-rose-400",
    rentStatus: "Paid",
    rentStatusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    leaseEnd: "Nov 2025",
    openTickets: 1,
    lastActive: "1h ago",
    rating: 5,
  },
  {
    name: "David Chen",
    unit: "Unit 3F · Harbor View Lofts",
    initials: "DC",
    color: "bg-sky-500/20 text-sky-400",
    rentStatus: "Due in 7 days",
    rentStatusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    leaseEnd: "Jan 2026",
    openTickets: 0,
    lastActive: "2d ago",
    rating: 4,
  },
]

const steps = [
  { number: "01", title: "Invite your tenant", description: "Send an invite link from your dashboard. Takes 10 seconds." },
  { number: "02", title: "Tenant sets up their account", description: "They create a password and see their unit, lease, and payment details instantly." },
  { number: "03", title: "They self-serve from day one", description: "Pay rent, submit requests, download documents — without texting you." },
  { number: "04", title: "You see everything in one place", description: "Payment history, open tickets, and communication — all in your dashboard." },
]

const trustedBy = [
  { initials: "MK", bg: "bg-violet-500/20 text-violet-400" },
  { initials: "JR", bg: "bg-blue-500/20 text-blue-400" },
  { initials: "AL", bg: "bg-emerald-500/20 text-emerald-400" },
  { initials: "TS", bg: "bg-amber-500/20 text-amber-400" },
  { initials: "PW", bg: "bg-rose-500/20 text-rose-400" },
]

export default function TenantPortalPage() {
  const paid = tenants.filter((t) => t.rentStatus === "Paid").length
  const due = tenants.filter((t) => t.rentStatus.includes("Due")).length
  const overdue = tenants.filter((t) => t.rentStatus === "Overdue").length

  return (
    <main className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
            Tenant portal
          </p>
          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            Give tenants{" "}
            <span className="text-violet-400">self-service.</span>{" "}
            Get your time back.
          </h1>
          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Propely gives every tenant their own portal to pay rent, submit maintenance requests,
            and access their lease — so they stop texting you for everything.
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
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Why managing tenants is exhausting</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Without a portal, you become the single point of contact for everything.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-6">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                    <Icon className="size-5 text-violet-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Tenant dashboard mockup ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">The solution</p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">All your tenants. One dashboard.</h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">Track rent status, open tickets, and lease end dates across your entire portfolio.</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Paid", count: paid, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
            { label: "Due soon", count: due, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Clock },
            { label: "Overdue", count: overdue, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: AlertCircle },
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

        {/* Tenant cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-foreground/[0.02] p-4 transition-colors hover:border-foreground/20">
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex size-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${t.color}`}>
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.unit}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium flex-shrink-0 ${t.rentStatusColor}`}>
                  {t.rentStatus}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Lease ends</p>
                  <p className="text-xs font-medium">{t.leaseEnd}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Open tickets</p>
                  <p className={`text-xs font-medium ${t.openTickets > 0 ? "text-amber-400" : "text-emerald-400"}`}>{t.openTickets}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Rating</p>
                  <div className="flex items-center justify-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Last active {t.lastActive}</span>
                <span className="flex size-2 rounded-full bg-emerald-500" />
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
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Everything in the tenant portal</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Designed to handle the most common landlord-tenant interactions automatically.</p>
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
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Live in minutes, not days</h2>
          <p className="text-[#b4b4b5]">No app to install. No training required. Tenants are self-sufficient from day one.</p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block" />
              )}
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-medium text-violet-400">
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
                Stop being your tenants'{" "}
                <span className="text-violet-400">personal help desk</span>
              </h2>
              <p className="text-[#b4b4b5] leading-relaxed mb-8">
                Landlords using Propely's tenant portal report saving an average of 6 hours per week on routine tenant communication — time that goes back into growing their portfolio.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: CheckCircle2, text: "90% reduction in routine tenant messages" },
                  { icon: CreditCard, text: "Rent collected on time, automatically" },
                  { icon: Home, text: "Higher tenant satisfaction and retention" },
                  { icon: ShieldCheck, text: "Every interaction logged and timestamped" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-[#b4b4b5]">
                      <Icon className="size-4 flex-shrink-0 text-violet-400" />
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
                    {["Rent via check or transfer", "Requests via text & call", "Lease copies emailed manually", "No communication record", "Tenants feel ignored"].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-[9px]">✕</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="font-mono font-medium tracking-wider text-violet-400/70 uppercase text-[11px] mb-4">With Propely</p>
                  <ul className="space-y-3">
                    {["Online payments with auto-pay", "Structured ticket system", "Self-serve document access", "Full message history", "Tenants feel empowered"].map((t) => (
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