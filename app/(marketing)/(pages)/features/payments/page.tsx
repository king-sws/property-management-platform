// app/(marketing)/features/payments/page.tsx
import Link from "next/link"
import {
  CreditCard,
  ArrowRight,
  Play,
  AlertCircle,
  Clock,
  CheckCircle2,
  Zap,
  RefreshCw,
  Bell,
  ShieldCheck,
  BarChart3,
  Smartphone,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Payments — Propely",
  description:
    "Automate rent collection, eliminate late payments, and get paid on time every month — without chasing anyone.",
}

const problems = [
  {
    icon: Clock,
    title: "Rent is always late",
    description:
      "When paying rent requires a check or a manual transfer, tenants delay. No reminders, no easy way to pay — just you chasing people every month.",
  },
  {
    icon: AlertCircle,
    title: "No central payment record",
    description:
      "Payments come in via Venmo, check, cash, and bank transfer. Reconciling at the end of the month takes hours and mistakes happen.",
  },
  {
    icon: DollarSign,
    title: "Late fees never enforced",
    description:
      "You set late fee policies in the lease but tracking and enforcing them manually is awkward — so you let it slide and lose money.",
  },
]

const solutions = [
  {
    icon: Smartphone,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Online payments from any device",
    description:
      "Tenants pay via card, bank transfer, or auto-pay directly from their portal. No checks, no Venmo, no confusion.",
  },
  {
    icon: RefreshCw,
    color: "bg-blue-500/10 text-blue-400",
    title: "Auto-pay enrollment",
    description:
      "Tenants enroll in auto-pay once. Rent is collected automatically each month — you get paid without doing anything.",
  },
  {
    icon: Bell,
    color: "bg-amber-500/10 text-amber-400",
    title: "Automated rent reminders",
    description:
      "Tenants get reminders 7 days, 3 days, and 1 day before rent is due. Late payments drop significantly without you lifting a finger.",
  },
  {
    icon: Zap,
    color: "bg-violet-500/10 text-violet-400",
    title: "Automatic late fee calculation",
    description:
      "Late fees are calculated and applied automatically based on your lease terms. Enforced consistently, without awkward conversations.",
  },
  {
    icon: BarChart3,
    color: "bg-sky-500/10 text-sky-400",
    title: "Full payment history",
    description:
      "Every payment is logged with a timestamp, amount, and method. One-click export for your accountant or tax records.",
  },
  {
    icon: ShieldCheck,
    color: "bg-rose-500/10 text-rose-400",
    title: "Secure & bank-grade encryption",
    description:
      "All payments are processed through a PCI-compliant, bank-grade payment infrastructure. Your tenants' data is always protected.",
  },
]

const transactions = [
  {
    tenant: "Sarah Mitchell",
    initials: "SM",
    avatarColor: "bg-emerald-500/20 text-emerald-400",
    property: "Maple Court · Unit 4B",
    amount: "+$2,800",
    type: "credit",
    method: "Auto-pay",
    methodColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    date: "Jun 1, 2025",
    status: "Settled",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    tenant: "James Okafor",
    initials: "JO",
    avatarColor: "bg-blue-500/20 text-blue-400",
    property: "Sunset Villa · Unit 1A",
    amount: "+$3,200",
    type: "credit",
    method: "Bank transfer",
    methodColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    date: "Jun 1, 2025",
    status: "Settled",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    tenant: "Priya Sharma",
    initials: "PS",
    avatarColor: "bg-rose-500/20 text-rose-400",
    property: "Birchwood · Unit 2C",
    amount: "+$1,950",
    type: "credit",
    method: "Card",
    methodColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    date: "Jun 4, 2025",
    status: "Late +$75 fee",
    statusColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    tenant: "Marcus Webb",
    initials: "MW",
    avatarColor: "bg-amber-500/20 text-amber-400",
    property: "Maple Court · Unit 7A",
    amount: "+$2,650",
    type: "credit",
    method: "Auto-pay",
    methodColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    date: "Jun 1, 2025",
    status: "Settled",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    tenant: "Elena Kovacs",
    initials: "EK",
    avatarColor: "bg-violet-500/20 text-violet-400",
    property: "Elm St Duplex · Unit B",
    amount: "+$1,800",
    type: "credit",
    method: "Bank transfer",
    methodColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    date: "Jun 1, 2025",
    status: "Settled",
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    tenant: "David Chen",
    initials: "DC",
    avatarColor: "bg-sky-500/20 text-sky-400",
    property: "Harbor View · Unit 3F",
    amount: "$2,400",
    type: "pending",
    method: "Auto-pay",
    methodColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    date: "Due Jun 5",
    status: "Pending",
    statusColor: "bg-foreground/5 text-muted-foreground border-border",
  },
]

const steps = [
  { number: "01", title: "Set up your bank account", description: "Connect your bank account securely in under 2 minutes." },
  { number: "02", title: "Invite tenants to pay online", description: "Tenants get a link to their payment portal — card, bank, or auto-pay." },
  { number: "03", title: "Reminders go out automatically", description: "Propely handles due-date reminders and late fee calculations for you." },
  { number: "04", title: "Funds land in your account", description: "Payments settle directly to your bank. Full history in your dashboard." },
]

const trustedBy = [
  { initials: "MK", bg: "bg-emerald-500/20 text-emerald-400" },
  { initials: "JR", bg: "bg-blue-500/20 text-blue-400" },
  { initials: "AL", bg: "bg-violet-500/20 text-violet-400" },
  { initials: "TS", bg: "bg-amber-500/20 text-amber-400" },
  { initials: "PW", bg: "bg-rose-500/20 text-rose-400" },
]

export default function PaymentsPage() {
  const settled = transactions.filter((t) => t.status === "Settled").length
  const pending = transactions.filter((t) => t.status === "Pending").length
  const late = transactions.filter((t) => t.status.includes("Late")).length
  const totalCollected = transactions
    .filter((t) => t.type === "credit" && t.status !== "Pending")
    .reduce((acc, t) => acc + parseInt(t.amount.replace(/\D/g, "")), 0)

  return (
    <main className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-26 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
            Payments
          </p>
          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            Get paid on time.{" "}
            <span className="text-emerald-400">Every time.</span>{" "}
            Automatically.
          </h1>
          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Propely automates rent collection, sends reminders, enforces late fees, and deposits
            funds directly to your bank — without you chasing anyone.
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
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Why collecting rent is harder than it should be</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Manual rent collection is slow, error-prone, and puts the burden on you every single month.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {problems.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-6">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Icon className="size-5 text-emerald-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Payment dashboard mockup ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">The solution</p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Every payment. Every tenant. One view.</h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">Track collection status in real time. See what&#39;s settled, what&lsquo;s pending, and where late fees applied.</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          {[
            { label: "Collected this month", value: `$${totalCollected.toLocaleString()}`, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: ArrowUpRight },
            { label: "Settled", value: settled, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
            { label: "Pending", value: pending, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Clock },
            { label: "Late fees applied", value: late, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: AlertCircle },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`size-4 ${s.color}`} />
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
                <p className={`font-display text-2xl font-medium tracking-tighter ${s.color}`}>{s.value}</p>
              </div>
            )
          })}
        </div>

        {/* Transactions list */}
        <div className="rounded-xl border border-border bg-foreground/[0.02] overflow-hidden">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">June 2025 — Rent Collection</p>
          </div>
          <div className="divide-y divide-border">
            {transactions.map((t) => (
              <div key={t.tenant} className="flex items-center gap-4 px-4 py-3 hover:bg-foreground/[0.02] transition-colors">
                <div className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${t.avatarColor}`}>
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.tenant}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.property}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${t.methodColor}`}>
                  {t.method}
                </span>
                <p className="text-[11px] text-muted-foreground flex-shrink-0">{t.date}</p>
                <p className={`font-display text-sm font-medium tracking-tight flex-shrink-0 ${t.type === "credit" ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {t.amount}
                </p>
                <span className={`hidden md:inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium flex-shrink-0 ${t.statusColor}`}>
                  {t.status}
                </span>
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
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Everything you need to get paid</h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">Built to handle the full payment lifecycle — from due date to your bank account.</p>
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
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">Set it up once. Collect forever.</h2>
          <p className="text-[#b4b4b5]">Takes 10 minutes to set up. Saves you hours every single month after that.</p>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block" />
              )}
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-medium text-emerald-400">
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
                Stop chasing rent.{" "}
                <span className="text-emerald-400">Start collecting it.</span>
              </h2>
              <p className="text-[#b4b4b5] leading-relaxed mb-8">
                Landlords on Propely collect rent an average of 4 days faster per month and see a 60% drop in late payments within the first 90 days.
              </p>
              <ul className="space-y-3">
                {[
                  { icon: TrendingUp, text: "60% fewer late payments in first 90 days" },
                  { icon: RefreshCw, text: "Auto-pay enrollment for worry-free collection" },
                  { icon: BarChart3, text: "Full payment history, export-ready" },
                  { icon: ShieldCheck, text: "PCI-compliant, bank-grade security" },
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
                  <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px] mb-4">Without Propely</p>
                  <ul className="space-y-3">
                    {["Checks & Venmo chaos", "No payment reminders", "Manual reconciliation", "Late fees never enforced", "No payment history"].map((t) => (
                      <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-[9px]">✕</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6">
                  <p className="font-mono font-medium tracking-wider text-emerald-400/70 uppercase text-[11px] mb-4">With Propely</p>
                  <ul className="space-y-3">
                    {["Card, bank & auto-pay", "Automated reminders", "Real-time dashboard", "Auto late fee enforcement", "Full exportable history"].map((t) => (
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