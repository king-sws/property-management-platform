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
  { value: '10K+', label: 'Properties managed' },
  { value: '98%', label: 'Customer satisfaction' },
  { value: '50+', label: 'Features included' },
  { value: '24/7', label: 'Support available' },
]

const userSolutions = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Landlords',
    description: 'Manage your properties with ease. Track rent, maintenance, and tenant communications all in one place.',
    features: ['Automated rent collection', 'Maintenance tracking', 'Tenant screening tools', 'Financial reporting'],
    href: '/solutions/landlords',
    color: 'from-blue-500/10 to-blue-500/5',
    borderColor: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'Property Managers',
    description: 'Scale your portfolio without scaling your headcount. Built for teams managing multiple owners and properties.',
    features: ['Multi-owner dashboards', 'Automated workflows', 'Owner reporting portal', 'Vendor management'],
    href: '/solutions/managers',
    color: 'from-violet-500/10 to-violet-500/5',
    borderColor: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    badgeColor: 'bg-violet-500/10 text-violet-400',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'HOAs',
    description: 'Streamline community management. Handle dues, violations, and board communications effortlessly.',
    features: ['Dues collection & tracking', 'Violation management', 'Board member portal', 'Community calendar'],
    href: '/solutions/hoa',
    color: 'from-emerald-500/10 to-emerald-500/5',
    borderColor: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400',
  },
]

const propertyTypeSolutions = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Residential',
    description: 'Single-family homes, condos, and multi-family properties. Everything you need for residential property management.',
    features: ['Tenant portals', 'Lease management', 'Maintenance requests', 'Rent collection'],
    href: '/solutions/residential',
    color: 'from-sky-500/10 to-sky-500/5',
    borderColor: 'border-sky-500/20',
    iconColor: 'text-sky-400',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2"/>
        <path d="M8 6h.01"/><path d="M12 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
      </svg>
    ),
    title: 'Commercial',
    description: 'Office buildings, retail spaces, and mixed-use properties. Manage leases, CAM charges, and tenant improvements.',
    features: ['CAM reconciliation', 'Percentage rent tracking', 'Tenant improvement tracking', 'Lease abstract management'],
    href: '/solutions/commercial',
    color: 'from-amber-500/10 to-amber-500/5',
    borderColor: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <path d="M9 22V12h6v10"/>
        <path d="M2 10h20"/>
      </svg>
    ),
    title: 'Multi-Unit',
    description: 'Apartments, complexes, and large-scale residential communities. Manage hundreds of units from one dashboard.',
    features: ['Bulk operations', 'Unit turnover tracking', 'Waitlist management', 'Common area maintenance'],
    href: '/solutions/multi-unit',
    color: 'from-rose-500/10 to-rose-500/5',
    borderColor: 'border-rose-500/20',
    iconColor: 'text-rose-400',
  },
]

const testimonials = [
  {
    quote: 'Propely transformed how we manage our portfolio. We went from spending 20 hours a week on admin to just 5.',
    name: 'Sarah Chen',
    role: 'Property Manager · 85 units',
    avatar: '/images/avatar-2.png',
  },
  {
    quote: 'The automated rent collection alone saved us from hiring an additional team member. Best ROI we\'ve seen.',
    name: 'Michael Torres',
    role: 'Landlord · 12 properties',
    avatar: '/images/avatar-5.png',
  },
  {
    quote: 'Our HOA board meetings are actually productive now. Everything is transparent and members can see updates in real-time.',
    name: 'Jennifer Walsh',
    role: 'HOA President · Oakridge Community',
    avatar: '/images/avatar-8.png',
  },
]

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function SolutionsPage() {
  return (
    <StarfieldBackground starCount={140}>
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
            Solutions
          </div>

          {/* Headline */}
          <h1 className="fade-up fade-up-d1 font-display font-medium text-4xl sm:text-5xl lg:text-[4.5rem] tracking-tighter text-pretty leading-[1.04] max-w-[18em]">
            Built for every role
            <br />
            <span className="text-foreground/35">and every property type</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up fade-up-d2 text-[#b4b4b5] text-base sm:text-lg md:text-xl max-w-[38em] text-pretty leading-relaxed">
            Whether you manage a single property or a thousand, Propely adapts to your workflow. Choose the solution that fits your needs.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-d3 flex flex-col sm:flex-row gap-3 pt-1">
            <RainbowButton href="/sign-up">Start Free Trial</RainbowButton>
            <Link href="/demo">
              <button className="inline-flex items-center justify-center gap-2 font-medium text-base px-8 py-3.5 rounded-lg border border-white/10 bg-white/5 text-foreground hover:bg-white/10 transition-colors">
                Book a demo
                <ArrowRight size={15} />
              </button>
            </Link>
          </div>

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
              <span className="text-xs text-foreground/40">Trusted by 1,000+ property professionals</span>
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

      {/* ── SOLUTIONS BY ROLE ─────────────────────────────────────────────── */}
      <section className="relative w-full py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">BY ROLE</p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
              Solutions for your team
            </h2>
            <p className="text-[#b4b4b5] max-w-xl text-base sm:text-lg">
              Purpose-built tools for every property management role, from individual landlords to enterprise teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userSolutions.map((solution, i) => (
              <Link
                key={i}
                href={solution.href}
                className={`group relative rounded-2xl border ${solution.borderColor} bg-gradient-to-br ${solution.color} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              >
                <div className="flex flex-col gap-5">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${solution.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {solution.icon}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-display font-medium text-2xl tracking-tight text-foreground leading-snug">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-foreground/55 leading-relaxed">
                      {solution.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 pt-2 border-t border-white/5">
                    {solution.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-foreground/60">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={solution.iconColor}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 pt-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all duration-200">
                    Learn more
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS BY PROPERTY TYPE ────────────────────────────────────── */}
      <section className="relative w-full py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col items-center text-center gap-3 mb-16">
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px]">BY PROPERTY TYPE</p>
            <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
              Tailored for your assets
            </h2>
            <p className="text-[#b4b4b5] max-w-xl text-base sm:text-lg">
              Specialized features for residential, commercial, and multi-unit properties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {propertyTypeSolutions.map((solution, i) => (
              <Link
                key={i}
                href={solution.href}
                className={`group relative rounded-2xl border ${solution.borderColor} bg-gradient-to-br ${solution.color} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              >
                <div className="flex flex-col gap-5">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${solution.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                    {solution.icon}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-display font-medium text-2xl tracking-tight text-foreground leading-snug">
                      {solution.title}
                    </h3>
                    <p className="text-sm text-foreground/55 leading-relaxed">
                      {solution.description}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 pt-2 border-t border-white/5">
                    {solution.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-foreground/60">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={solution.iconColor}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 pt-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all duration-200">
                    Learn more
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
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
              Loved by property managers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 bg-white/[0.025] p-8 flex flex-col gap-5"
              >
                {/* Quote */}
                <p className="text-sm sm:text-base text-foreground/60 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  />
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

      {/* ── CTA SECTION ───────────────────────────────────────────────────── */}
      <section className="relative w-full py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-emerald-500/5 p-12 sm:p-16">
            <div className="flex flex-col items-center gap-6">
              <h2 className="font-display font-medium text-3xl sm:text-4xl tracking-tighter text-foreground">
                Ready to streamline your property management?
              </h2>
              <p className="text-[#b4b4b5] max-w-xl text-base sm:text-lg">
                Join thousands of property managers and landlords who trust Propely to run their operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <RainbowButton href="/sign-up" large>
                  Start Your Free Trial
                </RainbowButton>
                <Link href="/demo">
                  <button className="inline-flex items-center justify-center gap-2 font-medium text-base px-8 py-3.5 rounded-lg border border-white/10 bg-white/5 text-foreground hover:bg-white/10 transition-colors">
                    Schedule a Demo
                    <ArrowRight size={15} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StarfieldBackground>
  )
}
