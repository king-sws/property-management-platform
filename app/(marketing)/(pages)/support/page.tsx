/* eslint-disable react/no-unescaped-entities */
'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  PlayCircle,
  Wrench,
  CreditCard,
  Users,
  BarChart2,
  ShieldCheck,
  HelpCircle,
  Search,
  ChevronRight,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const categories = [
  {
    icon: <PlayCircle className="size-5" />,
    title: 'Getting started',
    description: 'Set up your account, import properties, and invite your team.',
    articles: 12,
    href: '/docs/getting-started',
  },
  {
    icon: <CreditCard className="size-5" />,
    title: 'Payments & billing',
    description: 'Online rent collection, late fees, invoices, and subscription management.',
    articles: 18,
    href: '/docs/payments',
  },
  {
    icon: <Users className="size-5" />,
    title: 'Tenants & leases',
    description: 'Screening, lease creation, renewals, move-in and move-out workflows.',
    articles: 24,
    href: '/docs/tenants',
  },
  {
    icon: <Wrench className="size-5" />,
    title: 'Maintenance',
    description: 'Request tracking, vendor assignment, scheduling, and work order history.',
    articles: 15,
    href: '/docs/maintenance',
  },
  {
    icon: <BarChart2 className="size-5" />,
    title: 'Reports & analytics',
    description: 'Income statements, expense tracking, occupancy rates, and exports.',
    articles: 9,
    href: '/docs/reports',
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: 'Security & compliance',
    description: 'Data encryption, GDPR, CCPA, two-factor authentication, and audit logs.',
    articles: 7,
    href: '/docs/security',
  },
]

const popular = [
  { title: 'How to collect rent online', href: '/docs/payments/online-rent', tag: 'Payments' },
  { title: 'Setting up automated late fees', href: '/docs/payments/late-fees', tag: 'Payments' },
  { title: 'Importing tenants from a spreadsheet', href: '/docs/tenants/import', tag: 'Tenants' },
  { title: 'Creating and sending a lease', href: '/docs/tenants/leases', tag: 'Leases' },
  { title: 'Inviting team members', href: '/docs/getting-started/team', tag: 'Account' },
  { title: 'Connecting a bank account', href: '/docs/payments/bank', tag: 'Payments' },
]

const faqs = [
  {
    q: 'How do I reset my password?',
    a: 'Go to the login page and click "Forgot password". Enter your email and we will send a reset link within a few minutes. If you don\'t receive it, check your spam folder.',
  },
  {
    q: 'Can I have multiple users on one account?',
    a: 'Yes. Professional and Enterprise plans support multiple team members with role-based permissions. You can invite users from Settings → Team.',
  },
  {
    q: 'How do I export my data?',
    a: 'You can export tenants, payments, leases, and maintenance records as CSV from any list view. Full account exports are available under Settings → Data Export.',
  },
  {
    q: 'What happens if a tenant misses a payment?',
    a: 'Propely automatically sends a reminder notification to the tenant and flags the unit on your dashboard. If you have late fees configured, they are applied automatically after the grace period.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'Yes. Propely is available on iOS and Android. The mobile app supports all core features including maintenance requests, payment tracking, and tenant messaging.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from Settings → Billing. Your account remains active until the end of the current billing period. No cancellation fees apply.',
  },
]

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function TicketForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: '',
    priority: '',
    subject: '',
    description: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.description) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex items-center justify-center size-14 rounded-full bg-blue-500/10 border border-blue-500/30">
          <CheckCircle2 className="size-7 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Ticket submitted</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          We've received your request and will respond to{' '}
          <span className="text-foreground">{form.email}</span> within one business day.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setForm({ name: '', email: '', category: '', priority: '', subject: '', description: '' })
          }}
          className="mt-2 text-sm text-blue-400 hover:underline"
        >
          Submit another ticket
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition'

  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Alex Johnson"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="alex@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
            <option value="">Select category…</option>
            <option value="payments">Payments & billing</option>
            <option value="tenants">Tenants & leases</option>
            <option value="maintenance">Maintenance</option>
            <option value="account">Account & settings</option>
            <option value="reports">Reports & exports</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground/70">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
            <option value="">Select priority…</option>
            <option value="low">Low — general question</option>
            <option value="medium">Medium — something isn't working</option>
            <option value="high">High — blocking my workflow</option>
            <option value="critical">Critical — data or payment issue</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground/70">Subject</label>
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Brief description of the issue"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground/70">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={5}
          placeholder="Include steps to reproduce, what you expected, and what actually happened…"
          className={inputClass + ' resize-none'}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !form.name || !form.email || !form.subject || !form.description}
        className="group/button inline-flex items-center justify-center gap-2 font-medium text-sm bg-foreground text-background hover:opacity-85 disabled:opacity-50 disabled:pointer-events-none px-6 py-3 rounded-lg transition-opacity mt-1"
      >
        {loading ? (
          <>
            <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Submitting…
          </>
        ) : (
          <>
            <Send className="size-4" />
            Submit ticket
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </>
        )}
      </button>
    </div>
  )
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col divide-y divide-border">
      {faqs.map((faq, i) => (
        <div key={i} className="py-4">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <span className="text-sm font-medium text-foreground">{faq.q}</span>
            <svg
              className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                open === i ? 'rotate-45' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {open === i && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed pr-8">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative w-full pt-32 pb-16 overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
              Support center
            </p>
            <h1 className="font-display font-medium text-pretty text-4xl tracking-tighter sm:text-5xl">
              How can we help?
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-[38em] text-pretty">
              Browse the documentation, search for answers, or open a support ticket. We're here to make sure Propely works for you.
            </p>

            {/* Search bar */}
            <div className="relative w-full max-w-md mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search documentation…"
                className="w-full rounded-lg border border-border bg-background/60 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition"
              />
            </div>

            {/* Status strip */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Mon – Fri, 9 AM – 6 PM UTC
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-green-500" />
                <span className="text-green-500">All systems operational</span>
              </span>
              <Link href="https://status.propely.site" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-xs">
                Status page
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Documentation categories ──────────────────────── */}
      <section className="w-full border-t border-border py-14">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <a
                key={cat.title}
                href={cat.href}
                className="group relative flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-6 hover:border-blue-500/40 hover:bg-blue-950/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center size-10 rounded-xl border border-border/60 bg-blue-500/10 text-blue-400">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-mono font-medium tracking-wider uppercase text-muted-foreground">
                    {cat.articles} articles
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-sm text-foreground">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-blue-400 mt-auto">
                  Browse articles
                  <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular articles ──────────────────────────────── */}
      <section className="w-full border-t border-border py-14">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              <h2 className="font-semibold text-base text-foreground">Popular articles</h2>
            </div>
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {popular.map((article) => (
                <a
                  key={article.title}
                  href={article.href}
                  className="group flex items-center justify-between gap-4 px-5 py-4 bg-background/40 hover:bg-blue-950/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex items-center rounded bg-border/60 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground shrink-0">
                      {article.tag}
                    </span>
                    <span className="text-sm text-foreground truncate">{article.title}</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticket form + FAQ ─────────────────────────────── */}
      

    </main>
  )
}