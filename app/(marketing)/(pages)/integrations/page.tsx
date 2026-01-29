'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

const integrations = [
  {
    category: 'Payments',
    items: [
      {
        name: 'Stripe',
        desc: 'Secure online rent collection and invoicing',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23635BFF"/%3E%3Cpath d="M26.5 23.8c0-1.2.9-1.7 2.4-1.7 2.1 0 4.8.6 6.9 1.8v-6.5c-2.3-.9-4.6-1.3-6.9-1.3-5.6 0-9.4 2.9-9.4 7.8 0 7.6 10.4 6.4 10.4 9.7 0 1.3-1.1 1.7-2.7 1.7-2.3 0-5.3-.9-7.6-2.2v6.6c2.6 1.1 5.2 1.6 7.6 1.6 5.8 0 9.7-2.9 9.7-7.8.1-8.2-10.4-6.7-10.4-9.7z" fill="white"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'PayPal',
        desc: 'Accept payments from tenants worldwide',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23003087"/%3E%3Cpath d="M24.5 18h7.8c3.8 0 6 1.9 6 5.3 0 3.8-2.8 6.5-6.8 6.5h-3.2l-1.2 5.7h-3.5l3-14.5zm4.3 8.5h2.4c1.8 0 3-.9 3-2.5 0-1.2-.8-1.9-2.3-1.9h-2.2l-.9 4.4z" fill="%2300457C"/%3E%3Cpath d="M24.5 18h7.8c3.8 0 6 1.9 6 5.3 0 3.8-2.8 6.5-6.8 6.5h-3.2l-1.2 5.7h-3.5l3-14.5zm4.3 8.5h2.4c1.8 0 3-.9 3-2.5 0-1.2-.8-1.9-2.3-1.9h-2.2l-.9 4.4z" fill="%23009CDE" opacity="0.7"/%3E%3C/svg%3E',
        status: 'Coming Soon',
      },
      {
        name: 'Plaid',
        desc: 'Bank account verification and ACH payments',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23000000"/%3E%3Cpath d="M30 16l-8 8 8 8 8-8-8-8zm0 4.8L34.2 24 30 28.2 25.8 24 30 20.8z" fill="%2300D4B5"/%3E%3Cpath d="M30 32l-8 8h16l-8-8zm-4.2 5.2L30 41.2l4.2-4z" fill="%2300D4B5"/%3E%3C/svg%3E',
        status: 'Live',
      },
    ],
  },
  {
    category: 'Authentication',
    items: [
      {
        name: 'Auth.js',
        desc: 'Modern authentication for your app',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23000000"/%3E%3Cpath d="M30 17c-7.2 0-13 5.8-13 13s5.8 13 13 13 13-5.8 13-13-5.8-13-13-13zm0 3.2c5.4 0 9.8 4.4 9.8 9.8s-4.4 9.8-9.8 9.8-9.8-4.4-9.8-9.8 4.4-9.8 9.8-9.8z" fill="%23B537F2"/%3E%3Ccircle cx="30" cy="30" r="5" fill="%23B537F2"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'Google OAuth',
        desc: 'One-click sign-in for users',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="white"/%3E%3Cpath d="M38.5 30.2c0-.8-.1-1.6-.2-2.4H30v4.5h4.8c-.2 1.1-.9 2.1-1.8 2.7v3h2.9c1.7-1.6 2.6-3.9 2.6-6.8z" fill="%234285F4"/%3E%3Cpath d="M30 39c2.4 0 4.5-.8 6-2.2l-2.9-3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8h-3v3.1C23.4 37 26.5 39 30 39z" fill="%2334A853"/%3E%3Cpath d="M24.9 30.9c-.4-1.1-.4-2.3 0-3.4v-3.1h-3c-1.3 2.5-1.3 5.5 0 8l3-3.5z" fill="%23FBBC04"/%3E%3Cpath d="M30 24.2c1.4 0 2.6.5 3.6 1.4l2.7-2.7C34.5 21.3 32.4 20 30 20c-3.5 0-6.6 2-8.1 5l3 3.1c.7-2.2 2.7-3.9 5.1-3.9z" fill="%23EA4335"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'Clerk',
        desc: 'Complete user management solution',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%236C47FF"/%3E%3Cpath d="M30 19c-6.1 0-11 4.9-11 11s4.9 11 11 11 11-4.9 11-11-4.9-11-11-11zm0 18c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" fill="white"/%3E%3Ccircle cx="30" cy="30" r="3.5" fill="white"/%3E%3C/svg%3E',
        status: 'Coming Soon',
      },
    ],
  },
  {
    category: 'Communication',
    items: [
      {
        name: 'Resend',
        desc: 'Transactional emails and notifications',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23000000"/%3E%3Cpath d="M18 24l12 8 12-8v-4l-12 8-12-8v4z" fill="white"/%3E%3Cpath d="M18 28v8c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2v-8l-12 8-12-8z" fill="white"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'Twilio',
        desc: 'SMS alerts and reminders',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23F22F46"/%3E%3Ccircle cx="30" cy="30" r="13" fill="none" stroke="white" stroke-width="2"/%3E%3Ccircle cx="26" cy="26" r="2.5" fill="white"/%3E%3Ccircle cx="34" cy="26" r="2.5" fill="white"/%3E%3Ccircle cx="26" cy="34" r="2.5" fill="white"/%3E%3Ccircle cx="34" cy="34" r="2.5" fill="white"/%3E%3C/svg%3E',
        status: 'Coming Soon',
      },
      {
        name: 'SendGrid',
        desc: 'Email delivery and marketing campaigns',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%2399E1F4"/%3E%3Crect x="19" y="19" width="8" height="8" fill="%231A82E2"/%3E%3Crect x="27" y="19" width="8" height="8" fill="%231A82E2"/%3E%3Crect x="27" y="27" width="8" height="8" fill="%231A82E2"/%3E%3Crect x="19" y="27" width="8" height="8" fill="white"/%3E%3Crect x="33" y="27" width="8" height="8" fill="white"/%3E%3Crect x="27" y="33" width="8" height="8" fill="white"/%3E%3C/svg%3E',
        status: 'Live',
      },
    ],
  },
  {
    category: 'Accounting',
    items: [
      {
        name: 'QuickBooks',
        desc: 'Sync financial data and reporting',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%232CA01C"/%3E%3Ccircle cx="23" cy="30" r="7" fill="white"/%3E%3Ccircle cx="37" cy="30" r="7" fill="white"/%3E%3Cpath d="M23 23v14M37 23v14" stroke="%232CA01C" stroke-width="3"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'Xero',
        desc: 'Cloud accounting integration',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%2313B5EA"/%3E%3Cpath d="M22 23l8 14m0-14l-8 14M32 30h10" stroke="white" stroke-width="3" stroke-linecap="round"/%3E%3C/svg%3E',
        status: 'Coming Soon',
      },
      {
        name: 'FreshBooks',
        desc: 'Invoicing and expense tracking',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%230075DD"/%3E%3Cpath d="M20 25h20v3H20zM20 30h20v3H20zM20 35h13v3H20z" fill="white"/%3E%3Cpath d="M35 36l5 5" stroke="white" stroke-width="3" stroke-linecap="round"/%3E%3C/svg%3E',
        status: 'Live',
      },
    ],
  },
  {
    category: 'Property Listings',
    items: [
      {
        name: 'Zillow',
        desc: 'Sync listings and lead management',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%230074E4"/%3E%3Cpath d="M30 19l-13 10h5v12h6V32h4v9h6V29h5l-13-10z" fill="white"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'Apartments.com',
        desc: 'Multi-platform listing distribution',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23E31C79"/%3E%3Crect x="22" y="20" width="6" height="6" rx="1" fill="white"/%3E%3Crect x="32" y="20" width="6" height="6" rx="1" fill="white"/%3E%3Crect x="22" y="28" width="6" height="6" rx="1" fill="white"/%3E%3Crect x="32" y="28" width="6" height="6" rx="1" fill="white"/%3E%3Crect x="27" y="36" width="6" height="5" rx="1" fill="white"/%3E%3C/svg%3E',
        status: 'Coming Soon',
      },
      {
        name: 'Realtor.com',
        desc: 'Reach millions of property seekers',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23D92228"/%3E%3Cpath d="M30 18l-12 10v14h8V32h8v10h8V28l-12-10z" fill="white"/%3E%3C/svg%3E',
        status: 'Live',
      },
    ],
  },
  {
    category: 'Document Management',
    items: [
      {
        name: 'DocuSign',
        desc: 'Digital lease signing and agreements',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23FFD000"/%3E%3Cpath d="M20 24h20v3H20zM20 29h20v3H20zM20 34h12v3H20z" fill="%23333333"/%3E%3Cpath d="M34 36q3-2 6 0" stroke="%23333333" stroke-width="2.5" fill="none"/%3E%3C/svg%3E',
        status: 'Live',
      },
      {
        name: 'Adobe Sign',
        desc: 'E-signature and document workflows',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="%23ED1C24"/%3E%3Cpath d="M25 35h-6l8-16h6l-8 16zM34 35h6V25q0-3-3-3h-3v13z" fill="white"/%3E%3C/svg%3E',
        status: 'Coming Soon',
      },
      {
        name: 'Google Drive',
        desc: 'Cloud storage for all property documents',
        logo: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="60" height="60" rx="12" fill="white"/%3E%3Cpath d="M30 20l-8 14h16l-8-14z" fill="%23FFCF63"/%3E%3Cpath d="M22 34l-4 7h16l4-7H22z" fill="%231FA463"/%3E%3Cpath d="M38 34l-8-14-8 14h16z" fill="%234285F4"/%3E%3C/svg%3E',
        status: 'Live',
      },
    ],
  },
]

export default function IntegrationsPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            INTEGRATIONS
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl lg:text-5xl">
            Works with the tools you already use
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-[42em] text-pretty">
            Connect payments, authentication, and communication tools to build a
            seamless property management workflow.
          </p>
        </div>

        {/* Integrations */}
        <div className="space-y-16">
          {integrations.map((group, idx) => (
            <div key={idx}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/70 mb-6">
                {group.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-4 rounded-xl border border-border bg-background p-6 transition hover:border-foreground/30 hover:shadow-lg hover:shadow-foreground/5"
                  >
                    {/* Logo */}
                    <div className="relative size-12 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={item.logo}
                        alt={`${item.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {item.name}
                        </h3>

                        <span
                          className={`text-[10px] rounded-full px-2 py-0.5 font-mono uppercase tracking-wide shrink-0 ${
                            item.status === 'Live'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 flex flex-col items-center text-center gap-6 rounded-2xl border border-border bg-muted/30 p-12">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Need another integration?
            </h3>
            <p className="text-muted-foreground max-w-md">
              We&apos;re always adding new integrations. Let us know what tools you&apos;d like to see connected.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Request an integration
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}