'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ─────────────────────────────────────────────────────────────────────────────
   STARFIELD BACKGROUND
───────────────────────────────────────────────────────────────────────────── */
const StarfieldBackground = ({
  starCount = 140,
  children,
}: {
  starCount?: number
  children: React.ReactNode
}) => {
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
      })),
    [starCount],
  )
  return (
    <div className="relative min-h-screen">
      <div className="fixed top-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_top_center,#1a2642_0%,#0a1120_40%,transparent_80%)] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ left: s.left, top: s.top, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }}
          />
        ))}
      </div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,#000000_100%)] pointer-events-none z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */
const CheckBadge = ({ className = 'text-emerald-400' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={`shrink-0 ${className}`}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
  </svg>
)

const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
)

const RainbowButton = ({ children, href, large = false }: { children: React.ReactNode; href: string; large?: boolean }) => (
  <Link href={href}>
    <button
      className={`group/button inline-flex items-center justify-center gap-2 font-medium leading-tight whitespace-nowrap hover:z-10 relative text-background animate-rainbow hover:opacity-85
        bg-[linear-gradient(var(--foreground),var(--foreground)),linear-gradient(var(--background)_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)]
        bg-size-[200%] [background-clip:padding-box,border-box,border-box] bg-origin-border [border:calc(0.125rem)_solid_transparent]
        ${large ? 'text-lg px-10 py-4' : 'text-base px-8 py-3.5'} rounded-lg`}
    >
      {children}
    </button>
  </Link>
)

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const stats = [
  { value: '500+', label: 'Communities managed' },
  { value: '95%', label: 'Dues collection rate' },
  { value: '24hr', label: 'Avg response time' },
  { value: '100%', label: 'Board satisfaction' },
]

const features = [
  {
    tag: 'DUES',
    title: 'Automated dues collection that actually works',
    body: 'Online payment portal, automatic late fee application, and comprehensive payment history. Reserve fund tracking ensures your community stays financially healthy.',
    bullets: ['Online payment portal', 'Automatic late fee application', 'Payment history & receipts', 'Reserve fund tracking'],
    accent: 'from-emerald-950/50 via-emerald-950/20 to-transparent',
    border: 'border-emerald-900/40',
    iconColor: 'text-emerald-400',
    badgeColor: 'text-emerald-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
  },
  {
    tag: 'VIOLATIONS',
    title: 'Streamlined violation management',
    body: 'Digital violation logging, automated notice sending, and compliance tracking. Store photo evidence and maintain complete records for every case.',
    bullets: ['Digital violation logging', 'Automated notice sending', 'Compliance tracking & reporting', 'Photo evidence storage'],
    accent: 'from-amber-950/50 via-amber-950/20 to-transparent',
    border: 'border-amber-900/40',
    iconColor: 'text-amber-400',
    badgeColor: 'text-amber-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 14h16a2 2 0 0 0 1.73-4Z"/>
        <path d="M12 9v4"/><path d="M12 17h.01"/>
      </svg>
    ),
  },
  {
    tag: 'COMMUNICATIONS',
    title: 'Board & community communications',
    body: 'Broadcast announcements, facilitate community discussions, and share documents seamlessly. Keep everyone informed and engaged.',
    bullets: ['Announcement broadcasting', 'Community discussion boards', 'Document sharing portal', 'Meeting minutes distribution'],
    accent: 'from-blue-950/50 via-blue-950/20 to-transparent',
    border: 'border-blue-900/40',
    iconColor: 'text-blue-400',
    badgeColor: 'text-blue-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
      </svg>
    ),
  },
  {
    tag: 'MAINTENANCE',
    title: 'Common area maintenance made simple',
    body: 'Manage work orders, coordinate vendors, track budgets, and schedule preventive maintenance for all common areas from one place.',
    bullets: ['Work order management', 'Vendor coordination', 'Budget tracking', 'Preventive maintenance scheduling'],
    accent: 'from-violet-950/50 via-violet-950/20 to-transparent',
    border: 'border-violet-900/40',
    iconColor: 'text-violet-400',
    badgeColor: 'text-violet-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
  {
    tag: 'DOCUMENTS',
    title: 'Document management & compliance',
    body: 'Store bylaws, archive meetings, generate financial reports, and maintain an owner directory. Everything your community needs in one place.',
    bullets: ['Bylaws & rules storage', 'Meeting archive', 'Financial reports', 'Owner directory'],
    accent: 'from-sky-950/50 via-sky-950/20 to-transparent',
    border: 'border-sky-900/40',
    iconColor: 'text-sky-400',
    badgeColor: 'text-sky-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
      </svg>
    ),
  },
  {
    tag: 'BOARD',
    title: 'Board member portal',
    body: 'Secure access for board members, voting & approvals, committee management, and meeting scheduling. Run your board like a professional organization.',
    bullets: ['Secure access for board members', 'Voting & approvals', 'Committee management', 'Meeting scheduling'],
    accent: 'from-rose-950/50 via-rose-950/20 to-transparent',
    border: 'border-rose-900/40',
    iconColor: 'text-rose-400',
    badgeColor: 'text-rose-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

const workflow = [
  {
    step: '01',
    title: 'Import your community data',
    body: 'Upload your existing member lists, financial records, and documents. We\'ll help you migrate everything smoothly.',
  },
  {
    step: '02',
    title: 'Onboard board members & residents',
    body: 'Invite board members with secure access and residents to the community portal. Everyone gets the tools they need.',
  },
  {
    step: '03',
    title: 'Automate dues & communications',
    body: 'Set up automatic dues collection, late fees, and community announcements. Let Propely handle the routine work.',
  },
  {
    step: '04',
    title: 'Manage with transparency',
    body: 'Run meetings, track violations, and maintain common areas with full visibility for your community.',
  },
]

const testimonials = [
  {
    quote: 'Our HOA has never run smoother. Board members actually look forward to meetings now.',
    name: 'Patricia L.',
    role: 'HOA President · Sunset Hills',
    avatar: '/images/avatar-2.png',
  },
  {
    quote: 'Collecting dues went from a 3-month headache to a 2-week process. Incredible.',
    name: 'Robert M.',
    role: 'Treasurer · Oakridge Community',
    avatar: '/images/avatar-5.png',
  },
  {
    quote: 'Residents finally feel connected. Violation complaints dropped by 60% since we started using Propely.',
    name: 'Karen S.',
    role: 'HOA Manager · 8 communities',
    avatar: '/images/avatar-8.png',
  },
]

const comparisons = [
  { label: 'Online dues collection', them: false, us: true },
  { label: 'Violation tracking', them: false, us: true },
  { label: 'Board portal', them: false, us: true },
  { label: 'Community announcements', them: true, us: true },
  { label: 'Document management', them: true, us: true },
  { label: 'Maintenance tracking', them: true, us: true },
  { label: 'Vendor coordination', them: false, us: true },
]

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function HOAsPage() {
  return (
    <div className='bg-black'>
      <style jsx global>{`
        @keyframes rainbow {
          0%   { background-position: 0%   50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-rainbow { animation: rainbow 6s linear infinite; }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up      { animation: fade-up 0.6s ease both; }
        .fade-up-d1   { animation-delay: 0.1s; }
        .fade-up-d2   { animation-delay: 0.2s; }
        .fade-up-d3   { animation-delay: 0.3s; }
        .fade-up-d4   { animation-delay: 0.4s; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-y-7">

          {/* Breadcrumb pill */}
          <div className="fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-mono font-medium tracking-widest uppercase text-foreground/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Solutions · HOAs
          </div>

          {/* Headline */}
          <h1 className="fade-up fade-up-d1 font-display font-medium text-4xl sm:text-5xl lg:text-[4.5rem] tracking-tighter text-pretty leading-[1.04] max-w-[16em]">
            Run your HOA
            <br />
            <span className="text-foreground/35">like a well-oiled machine</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up fade-up-d2 text-[#b4b4b5] text-base sm:text-lg md:text-xl max-w-[38em] text-pretty leading-relaxed">
            Streamline dues collection, violation management, and board communications. Propely gives your HOA the tools to operate efficiently and keep residents happy.
          </p>

          {/* CTAs */}
          

          {/* Social proof strip */}
          <div className="fade-up fade-up-d4 flex items-center gap-3 pt-1">
            <div className="flex -space-x-2">
              {['/images/avatar-2.png', '/images/avatar-3.png', '/images/avatar-5.png', '/images/avatar-8.png', '/images/avatar-9.png'].map((src, i) => (
                <Image key={i} src={src} alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex gap-0.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-foreground/40">Trusted by 500+ communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="relative w-full border-y border-white/5 bg-white/[0.025]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-9 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1.5">
              <span className="font-display font-medium text-[2.25rem] tracking-tighter text-foreground leading-none">{s.value}</span>
              <span className="text-[11px] text-foreground/40 font-mono uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">COMMUNITY MANAGEMENT</p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
              Everything your HOA needs
            </h2>
            <p className="text-[#b4b4b5] max-w-xl text-base sm:text-lg">
              From dues collection to violation tracking, Propely handles every aspect of HOA management.
            </p>
          </div>

          {/* Alternating feature rows */}
          <div className="flex flex-col gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.accent} overflow-hidden group`}
              >
                <div className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-0`}>

                  {/* Text side */}
                  <div className="flex flex-col gap-5 p-7 sm:p-10 lg:w-[52%]">
                    <div className="flex items-center gap-2">
                      <span className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${f.iconColor} shrink-0`}>
                        {f.icon}
                      </span>
                      <span className={`font-mono text-[10px] tracking-widest uppercase ${f.badgeColor} font-medium`}>{f.tag}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="font-display font-medium text-xl sm:text-2xl tracking-tight text-foreground leading-snug">{f.title}</h3>
                      <p className="text-sm sm:text-base text-foreground/55 leading-relaxed">{f.body}</p>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-white/5">
                      {f.bullets.map((b, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-foreground/60">
                          <CheckBadge className={f.badgeColor} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual side */}
                  <div className={`hidden lg:flex items-center justify-center lg:w-[48%] border-l border-white/5 ${i % 2 === 1 ? 'border-l-0 border-r border-white/5' : ''} p-10`}>
                    <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                      {[120, 90, 60].map((r, ri) => (
                        <div
                          key={ri}
                          className="absolute rounded-full border border-white/5"
                          style={{ width: r * 2, height: r * 2 }}
                        />
                      ))}
                      <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${f.iconColor}`}>
                        <span style={{ transform: 'scale(1.5)' }}>{f.icon}</span>
                      </div>
                      <div className="absolute top-4 right-4 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm px-3 py-1.5 text-[11px] font-mono text-foreground/50">
                        {['LIVE', 'AUTO', 'SYNC', 'AI', 'FAST', 'SAFE'][i]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ──────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center gap-3 mb-14">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">GETTING STARTED</p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tighter">
              Live in days, not weeks
            </h2>
            <p className="text-[#b4b4b5] max-w-lg text-base sm:text-lg">
              Import your community data and start managing your HOA more efficiently almost immediately.
            </p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="hidden lg:block absolute top-[2.75rem] left-[12.5%] right-[12.5%] h-px bg-white/5 z-0" />

            {workflow.map((w, i) => (
              <div key={i} className="relative z-10 flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-6">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-mono text-xs text-foreground/40 shrink-0">
                    {w.step}
                  </span>
                </div>
                <h3 className="font-medium text-sm text-foreground">{w.title}</h3>
                <p className="text-xs text-foreground/45 leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────────── */}
      <section className="relative w-full py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center gap-3 mb-12">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">VS THE REST</p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tighter">Why HOAs choose Propely</h2>
          </div>

          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/5 bg-white/[0.025]">
              <div className="p-4 text-xs font-mono text-foreground/30 uppercase tracking-wider">Feature</div>
              <div className="p-4 text-center text-xs font-mono text-foreground/30 uppercase tracking-wider">Others</div>
              <div className="p-4 text-center text-xs font-mono text-emerald-400/70 uppercase tracking-wider">Propely</div>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} className={`grid grid-cols-3 border-b border-white/5 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.012]'}`}>
                <div className="p-4 text-sm text-foreground/60">{row.label}</div>
                <div className="p-4 flex items-center justify-center">
                  {row.them ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-foreground/25">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-foreground/20">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center">
                  <CheckBadge className="text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center gap-3 mb-14">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">TESTIMONIALS</p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tighter">
              Loved by HOA boards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.025] p-8 flex flex-col gap-5">
                <p className="text-sm sm:text-base text-foreground/60 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <Image src={testimonial.avatar} alt={testimonial.name} width={40} height={40} className="w-10 h-10 rounded-full border-2 border-background object-cover" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{testimonial.name}</span>
                    <span className="text-xs text-foreground/40">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-violet-500/5 p-12 sm:p-16">
            <div className="flex flex-col items-center gap-6">
              <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tighter text-foreground">
                Ready to transform your HOA?
              </h2>
              <p className="text-[#b4b4b5] max-w-xl text-base sm:text-lg">
                Start your free trial and see how Propely can streamline your community management.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <RainbowButton href="/sign-up" large>
                  Start Your Free Trial
                </RainbowButton>
                
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
