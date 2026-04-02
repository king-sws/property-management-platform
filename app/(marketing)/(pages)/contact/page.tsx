/* eslint-disable react/no-unescaped-entities */
'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import React, { useState } from 'react'
import {
  Mail,
  MessageSquare,
  Headphones,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Send,
  MapPin,
  Clock,
} from 'lucide-react'
import { ContactForm } from '@/components/landing/ContactForm'

// ── If you want metadata export, split into a server wrapper.
// For a pure client component page, metadata is set in the layout or a separate file.

const channels = [
  {
    icon: <Mail className="size-5" />,
    title: 'Email support',
    description: 'Best for non-urgent questions, billing, and account changes.',
    action: 'hello@propely.site',
    href: 'mailto:hello@propely.site',
    badge: null,
  },
  {
    icon: <MessageSquare className="size-5" />,
    title: 'Live chat',
    description: 'Chat directly with the team inside the Propely dashboard.',
    action: 'Open dashboard',
    href: '/dashboard',
    badge: 'Online now',
  },
  {
    icon: <Headphones className="size-5" />,
    title: 'Priority support',
    description: 'Professional and Enterprise plans include 24/7 phone & video calls.',
    action: 'Upgrade plan',
    href: '/#pricing',
    badge: 'Pro & Enterprise',
  },
  {
    icon: <BookOpen className="size-5" />,
    title: 'Help center',
    description: 'Step-by-step guides, FAQs, and video walkthroughs for every feature.',
    action: 'Browse docs',
    href: '/docs',
    badge: null,
  },
]

const faqs = [
  {
    q: 'How long does onboarding take?',
    a: 'Most managers are fully set up within an afternoon. Import your properties and tenants via CSV, or add them manually — the wizard walks you through every step.',
  },
  {
    q: 'Can I migrate from another platform?',
    a: 'Yes. We support CSV imports from Buildium, AppFolio, Rentec, and plain spreadsheets. Our team can assist with larger migrations at no extra cost.',
  },
  {
    q: 'Is my data safe?',
    a: 'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II compliant and GDPR/CCPA ready.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'Visa, Mastercard, American Express, and ACH bank transfers. Annual plans can be invoiced on request.',
  },
  {
    q: 'Do you offer a free trial?',
    a: 'Every plan starts with a 14-day free trial — no credit card required. You keep full access to all features during the trial.',
  },
]

// function ContactForm() {
//   const [submitted, setSubmitted] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
//   }

//   const handleSubmit = async (e: React.MouseEvent) => {
//     e.preventDefault()
//     if (!form.name || !form.email || !form.message) return
//     setLoading(true)
//     // Replace with your actual form handler / API route
//     await new Promise((r) => setTimeout(r, 1200))
//     setLoading(false)
//     setSubmitted(true)
//   }

//   if (submitted) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
//         <div className="flex items-center justify-center size-14 rounded-full bg-blue-500/10 border border-blue-500/30">
//           <CheckCircle2 className="size-7 text-blue-400" />
//         </div>
//         <h3 className="text-xl font-semibold text-foreground">Message sent!</h3>
//         <p className="text-sm text-muted-foreground max-w-xs">
//           We usually reply within one business day. Check your inbox — including spam just in case.
//         </p>
//         <button
//           onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
//           className="mt-2 text-sm text-blue-400 hover:underline"
//         >
//           Send another message
//         </button>
//       </div>
//     )
//   }

//   const inputClass =
//     'w-full rounded-lg border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition'

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid sm:grid-cols-2 gap-4">
//         <div className="flex flex-col gap-1.5">
//           <label className="text-xs font-medium text-foreground/70">Name</label>
//           <input
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             placeholder="Alex Johnson"
//             className={inputClass}
//           />
//         </div>
//         <div className="flex flex-col gap-1.5">
//           <label className="text-xs font-medium text-foreground/70">Email</label>
//           <input
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={handleChange}
//             placeholder="alex@example.com"
//             className={inputClass}
//           />
//         </div>
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="text-xs font-medium text-foreground/70">Subject</label>
//         <select
//           name="subject"
//           value={form.subject}
//           onChange={handleChange}
//           className={inputClass}
//         >
//           <option value="">Select a topic…</option>
//           <option value="sales">Sales & pricing</option>
//           <option value="support">Technical support</option>
//           <option value="billing">Billing & invoices</option>
//           <option value="migration">Data migration</option>
//           <option value="other">Other</option>
//         </select>
//       </div>

//       <div className="flex flex-col gap-1.5">
//         <label className="text-xs font-medium text-foreground/70">Message</label>
//         <textarea
//           name="message"
//           value={form.message}
//           onChange={handleChange}
//           rows={5}
//           placeholder="Tell us what you need…"
//           className={inputClass + ' resize-none'}
//         />
//       </div>

//       <button
//         onClick={handleSubmit}
//         disabled={loading || !form.name || !form.email || !form.message}
//         className="group/button inline-flex items-center justify-center gap-2 font-medium text-sm bg-foreground text-background hover:opacity-85 disabled:opacity-50 disabled:pointer-events-none px-6 py-3 rounded-lg transition-opacity mt-1"
//       >
//         {loading ? (
//           <>
//             <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//             </svg>
//             Sending…
//           </>
//         ) : (
//           <>
//             <Send className="size-4" />
//             Send message
//             <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
//           </>
//         )}
//       </button>
//     </div>
//   )
// }

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
              className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}
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

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative w-full pt-32 pb-16 overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
              Get in touch
            </p>
            <h1 className="font-display font-medium text-pretty text-4xl tracking-tighter sm:text-5xl">
              We're here to help
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-[38em] text-pretty">
              Whether you have a question before signing up or need help with an existing account, the Propely team responds fast.
            </p>

            {/* Office info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Mon – Fri, 9 AM – 6 PM UTC
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                Remote-first team
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-green-500" />
                <span className="text-green-500">All systems operational</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Channels ──────────────────────────────────────── */}
      <section className="w-full border-t border-border py-14">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {channels.map((ch) => (
              <a
                key={ch.title}
                href={ch.href}
                className="group relative flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-6 hover:border-blue-500/40 hover:bg-blue-950/10 transition-colors"
              >
                {ch.badge && (
                  <span className="absolute top-4 right-4 text-[7px] text-center flex items-center justify-center font-mono font-medium tracking-wider uppercase bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">
                    {ch.badge}
                  </span>
                )}
                <div className="flex items-center justify-center size-10 rounded-xl border border-border/60 bg-blue-500/10 text-blue-400">
                  {ch.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-sm text-foreground">{ch.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ch.description}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-blue-400 mt-auto">
                  {ch.action}
                  <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + FAQ ────────────────────────────────────── */}
      <section className="w-full py-20 border-t border-border">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14">

            {/* Contact form */}
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-medium text-pretty text-2xl tracking-tighter md:text-3xl">
                  Send us a message
                </h2>
                <p className="text-sm text-muted-foreground">
                  Fill in the form and we'll get back to you within one business day.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-6 md:p-8">
                <ContactForm />
              </div>
            </div>

            {/* FAQ */}
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-medium text-pretty text-2xl tracking-tighter md:text-3xl">
                  Frequently asked
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quick answers to the most common questions.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/40 p-6 md:p-8">
                <FaqAccordion />
              </div>

              {/* Still need help */}
              <div className="rounded-xl border border-blue-900/40 bg-gradient-to-br from-blue-950/20 to-background p-6 flex flex-col gap-3">
                <h3 className="font-semibold text-sm text-foreground">Still have questions?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our help center has 200+ articles covering every feature in Propely.
                </p>
                <Link href="/docs" className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:underline">
                  Browse the help center
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}