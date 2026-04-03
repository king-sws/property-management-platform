// app/(marketing)/property-management/page.tsx
import Link from "next/link"
import Image from "next/image"
import {
  Home,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  FileText,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  BedDouble,
  Maximize2,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Property Management — Propely",
  description:
    "Manage your entire rental portfolio from one powerful dashboard. Tenants, leases, rent, and maintenance — all in one place.",
}

// ─── Static data ─────────────────────────────────────────────────────────────

const features = [
  {
    icon: Home,
    color: "bg-blue-500/10 text-blue-400",
    title: "Portfolio at a glance",
    description:
      "See occupancy rates, monthly income, and open maintenance tickets across every property in one unified dashboard.",
  },
  {
    icon: Users,
    color: "bg-emerald-500/10 text-emerald-400",
    title: "Tenant management",
    description:
      "Screen applicants, manage leases, store documents, and communicate with tenants — all from one place.",
  },
  {
    icon: CreditCard,
    color: "bg-amber-500/10 text-amber-400",
    title: "Online rent collection",
    description:
      "Automate rent reminders, accept online payments, and get notified instantly when a payment lands — or misses.",
  },
  {
    icon: Wrench,
    color: "bg-rose-500/10 text-rose-400",
    title: "Maintenance tracking",
    description:
      "Tenants submit requests, you assign vendors, and both sides track progress — no more back-and-forth texts.",
  },
  {
    icon: BarChart3,
    color: "bg-violet-500/10 text-violet-400",
    title: "Financial reports",
    description:
      "Income statements, expense tracking, and tax-ready summaries generated automatically every month.",
  },
  {
    icon: FileText,
    color: "bg-sky-500/10 text-sky-400",
    title: "Lease management",
    description:
      "Create, sign, and store leases digitally. Get automated alerts before renewals so you never miss a deadline.",
  },
]

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up free in 30 seconds. No credit card required to start.",
  },
  {
    number: "02",
    title: "Add your properties",
    description: "Import from a spreadsheet or add properties one by one.",
  },
  {
    number: "03",
    title: "Invite your tenants",
    description: "Tenants get a portal to pay rent and submit requests instantly.",
  },
  {
    number: "04",
    title: "Manage everything",
    description: "Your entire portfolio, one dashboard, zero chaos.",
  },
]

const stats = [
  { value: "500+", label: "Property managers" },
  { value: "12k+", label: "Units managed" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "$2M+", label: "Rent collected monthly" },
]

const previewProperties = [
  {
    image: "/images/house-1.webp",
    name: "Maple Court Apartments",
    address: "142 Maple St, Austin, TX",
    type: "Multi-Family",
    beds: 3,
    sqft: 1_420,
    rent: 2_800,
    occ: 92,
    occColor: "bg-emerald-500",
    occText: "text-emerald-400",
    status: "Occupied",
    statusBg: "bg-emerald-500/10 text-emerald-400",
    units: 12,
  },
  {
    image: "/images/house-2.jpg",
    name: "Sunset Villa",
    address: "38 Hilltop Dr, Denver, CO",
    type: "Single Family",
    beds: 4,
    sqft: 2_150,
    rent: 3_200,
    occ: 100,
    occColor: "bg-emerald-500",
    occText: "text-emerald-400",
    status: "Occupied",
    statusBg: "bg-emerald-500/10 text-emerald-400",
    units: 1,
  },
  {
    image: "/images/house-3.jpg",
    name: "Birchwood Terrace",
    address: "55 Birch Ln, Portland, OR",
    type: "Apartment",
    beds: 2,
    sqft: 980,
    rent: 1_950,
    occ: 50,
    occColor: "bg-amber-500",
    occText: "text-amber-400",
    status: "Partially Vacant",
    statusBg: "bg-amber-500/10 text-amber-400",
    units: 4,
  },
]

const trustedBy = [
  { initials: "MK", bg: "bg-blue-500/20 text-blue-400" },
  { initials: "JR", bg: "bg-emerald-500/20 text-emerald-400" },
  { initials: "AL", bg: "bg-violet-500/20 text-violet-400" },
  { initials: "TS", bg: "bg-amber-500/20 text-amber-400" },
  { initials: "PW", bg: "bg-rose-500/20 text-rose-400" },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PropertyManagementPage() {
  return (
    <main className="w-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">

          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
            Property management
          </p>

          <h1 className="font-display font-medium text-pretty tracking-tighter text-4xl sm:text-5xl lg:text-6xl max-w-3xl mb-5">
            Everything you need to{" "}
            <span className="text-blue-400">manage properties</span>{" "}
            effortlessly
          </h1>

          <p className="text-pretty text-[#b4b4b5] md:text-lg max-w-2xl mb-8">
            Propely gives landlords a single dashboard to track tenants, collect rent, handle
            maintenance, and grow their portfolio — without the spreadsheet chaos.
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

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <div className="flex">
              {trustedBy.map((a, i) => (
                <div
                  key={a.initials}
                  className={`flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-medium ${a.bg} ${i !== 0 ? "-ml-2" : ""}`}
                >
                  {a.initials}
                </div>
              ))}
            </div>
            <span className="text-amber-400">★★★★★</span>
            <span>Trusted by 500+ property managers</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-medium tracking-tighter">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Property Cards ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
            Live portfolio view
          </p>
          <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
            Your properties, at a glance
          </h2>
          <p className="text-[#b4b4b5] max-w-xl mx-auto">
            Every property in your portfolio, with real-time occupancy, rent, and status — all in one place.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {previewProperties.map((p) => (
            <div
              key={p.name}
              className="group rounded-xl border border-border bg-foreground/[0.02] overflow-hidden transition-colors hover:border-foreground/20"
            >
              {/* Property image */}
              <div className="relative h-44 w-full overflow-hidden bg-foreground/5">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Status badge over image */}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm border border-white/10 ${p.statusBg}`}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {p.status}
                  </span>
                </div>
                {/* Type badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                    {p.type}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4">
                <h3 className="font-medium text-sm mb-1 truncate">{p.name}</h3>
                <div className="flex items-center gap-1 text-[12px] text-muted-foreground mb-3">
                  <MapPin className="size-3 flex-shrink-0" />
                  <span className="truncate">{p.address}</span>
                </div>

                {/* Meta chips */}
                <div className="flex items-center gap-3 mb-4 text-[12px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BedDouble className="size-3" />
                    {p.beds} beds
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Maximize2 className="size-3" />
                    {p.sqft.toLocaleString()} sqft
                  </span>
                  <span className="text-border">·</span>
                  <span>{p.units} {p.units === 1 ? "unit" : "units"}</span>
                </div>

                {/* Occupancy bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground">Occupancy</span>
                    <span className={`text-[11px] font-medium ${p.occText}`}>{p.occ}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className={`h-full rounded-full ${p.occColor}`}
                      style={{ width: `${p.occ}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Monthly rent</p>
                    <p className="font-display font-medium tracking-tight text-base">
                      ${p.rent.toLocaleString()}
                      <span className="text-xs text-muted-foreground font-normal">/mo</span>
                    </p>
                  </div>
                  <Link href="/sign-up">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                      View details
                      <ArrowRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
              Features
            </p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
              Built for serious landlords
            </h2>
            <p className="text-[#b4b4b5] max-w-xl mx-auto">
              Every tool you need, none of the complexity you don&#39;t.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-border bg-background p-6 transition-colors hover:border-foreground/20"
                >
                  <div className={`mb-4 inline-flex size-10 items-center justify-center rounded-lg ${f.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-medium text-sm mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Why Propely ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-4">
              Why Propely
            </p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-5">
              Stop managing with spreadsheets.{" "}
              <span className="text-blue-400">Start managing smarter.</span>
            </h2>
            <p className="text-[#b4b4b5] leading-relaxed mb-8">
              Most landlords spend hours every week chasing rent, answering maintenance calls, and
              digging through email chains. Propely automates the busywork so you can focus on
              growing your portfolio.
            </p>
            <ul className="space-y-3">
              {[
                { icon: TrendingUp, text: "Boost occupancy with faster tenant placement" },
                { icon: Shield, text: "Stay legally compliant with built-in lease templates" },
                { icon: Zap, text: "Save 8+ hours per month on admin tasks" },
                { icon: CheckCircle, text: "Get paid on time, every time, automatically" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-[#b4b4b5]">
                    <Icon className="size-4 flex-shrink-0 text-blue-400" />
                    {item.text}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Comparison card */}
          <div className="rounded-xl border border-border bg-foreground/[0.02] overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="border-r border-border p-6">
                <p className="font-mono font-medium tracking-wider text-foreground/40 uppercase text-[11px] mb-4">
                  Without Propely
                </p>
                <ul className="space-y-3">
                  {[
                    "Chasing rent via text",
                    "Maintenance lost in email",
                    "Leases in a filing cabinet",
                    "Manual income tracking",
                    "No tenant portal",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 flex size-3.5 flex-shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-[9px]">✕</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6">
                <p className="font-mono font-medium tracking-wider text-blue-400/70 uppercase text-[11px] mb-4">
                  With Propely
                </p>
                <ul className="space-y-3">
                  {[
                    "Automated rent collection",
                    "Maintenance ticket system",
                    "Digital lease storage",
                    "Automatic financial reports",
                    "Tenant self-service portal",
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
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-foreground/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px] mb-3">
              How it works
            </p>
            <h2 className="font-display font-medium tracking-tighter text-3xl md:text-4xl mb-3">
              Up and running in minutes
            </h2>
            <p className="text-[#b4b4b5]">
              No setup fees, no onboarding calls, no spreadsheet migration headaches.
            </p>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.number} className="relative flex flex-col items-start">
                {i < steps.length - 1 && (
                  <div className="absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-2.5rem)] bg-border lg:block" />
                )}
                <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-medium text-blue-400">
                  {step.number}
                </div>
                <h3 className="font-medium text-sm mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}