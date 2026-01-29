'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from 'lucide-react'

const products = [
  {
    title: 'Property Management Suite',
    excerpt:
      'Complete platform for managing multiple properties, tenants, and maintenance requests in one place.',
    price: '$49/mo',
    features: 'Unlimited properties',
    href: '/products/management-suite',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad1)"/%3E%3Ccircle cx="200" cy="150" r="80" fill="white" opacity="0.1"/%3E%3Ccircle cx="600" cy="350" r="100" fill="white" opacity="0.1"/%3E%3Crect x="250" y="180" width="300" height="200" rx="15" fill="white" opacity="0.15"/%3E%3Crect x="280" y="210" width="80" height="80" rx="10" fill="white" opacity="0.3"/%3E%3Crect x="380" y="210" width="80" height="80" rx="10" fill="white" opacity="0.3"/%3E%3Crect x="480" y="210" width="80" height="80" rx="10" fill="white" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Tenant Portal Pro',
    excerpt:
      'Give your tenants a modern self-service portal for rent payments, maintenance, and communication.',
    price: '$29/mo',
    features: 'Up to 50 tenants',
    href: '/products/tenant-portal',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2306b6d4;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230891b2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad2)"/%3E%3Ccircle cx="150" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Ccircle cx="650" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Crect x="300" y="150" width="200" height="250" rx="20" fill="white" opacity="0.2"/%3E%3Crect x="320" y="180" width="160" height="40" rx="8" fill="white" opacity="0.4"/%3E%3Crect x="320" y="240" width="160" height="40" rx="8" fill="white" opacity="0.4"/%3E%3Crect x="320" y="300" width="160" height="40" rx="8" fill="white" opacity="0.4"/%3E%3C/svg%3E',
  },
  {
    title: 'Maintenance Manager',
    excerpt:
      'Track work orders, assign vendors, and keep your properties in top condition with automated workflows.',
    price: '$39/mo',
    features: 'Vendor management included',
    href: '/products/maintenance-manager',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2310b981;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad3)"/%3E%3Cpath d="M 400 100 L 500 250 L 400 400 L 300 250 Z" fill="white" opacity="0.1"/%3E%3Ccircle cx="400" cy="250" r="100" fill="none" stroke="white" stroke-width="3" opacity="0.3"/%3E%3Cpath d="M 400 180 L 420 220 L 380 220 Z" fill="white" opacity="0.4"/%3E%3Crect x="385" y="230" width="30" height="60" rx="5" fill="white" opacity="0.4"/%3E%3Crect x="350" y="250" width="100" height="8" rx="4" fill="white" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Financial Analytics',
    excerpt:
      'Real-time dashboards, profit tracking, and tax-ready reports for your entire portfolio.',
    price: '$59/mo',
    features: 'Advanced reporting',
    href: '/products/analytics',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad4" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f59e0b;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23d97706;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad4)"/%3E%3Crect x="150" y="350" width="80" height="100" fill="white" opacity="0.3"/%3E%3Crect x="250" y="280" width="80" height="170" fill="white" opacity="0.3"/%3E%3Crect x="350" y="200" width="80" height="250" fill="white" opacity="0.3"/%3E%3Crect x="450" y="250" width="80" height="200" fill="white" opacity="0.3"/%3E%3Crect x="550" y="180" width="80" height="270" fill="white" opacity="0.3"/%3E%3Cpolyline points="190,350 290,280 390,200 490,250 590,180" fill="none" stroke="white" stroke-width="4" opacity="0.5"/%3E%3C/svg%3E',
  },
  {
    title: 'Lease Management',
    excerpt:
      'Digital lease signing, automated renewals, and document storage with e-signature integration.',
    price: '$34/mo',
    features: 'E-signature included',
    href: '/products/lease-management',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad5" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ec4899;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23db2777;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad5)"/%3E%3Crect x="200" y="100" width="400" height="300" rx="15" fill="white" opacity="0.15"/%3E%3Crect x="230" y="140" width="340" height="30" rx="5" fill="white" opacity="0.3"/%3E%3Crect x="230" y="190" width="340" height="30" rx="5" fill="white" opacity="0.3"/%3E%3Crect x="230" y="240" width="340" height="30" rx="5" fill="white" opacity="0.3"/%3E%3Crect x="230" y="290" width="200" height="30" rx="5" fill="white" opacity="0.3"/%3E%3Cpath d="M 480 310 Q 500 295 520 310" fill="none" stroke="white" stroke-width="3" opacity="0.5"/%3E%3C/svg%3E',
  },
  {
    title: 'Screening & Background Checks',
    excerpt:
      'Comprehensive tenant screening with credit checks, criminal background, and eviction history.',
    price: '$19/mo',
    features: 'Pay per screening',
    href: '/products/screening',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad6" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%238b5cf6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%236d28d9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad6)"/%3E%3Ccircle cx="400" cy="200" r="80" fill="white" opacity="0.2"/%3E%3Ccircle cx="400" cy="200" r="50" fill="white" opacity="0.3"/%3E%3Crect x="300" y="300" width="200" height="120" rx="10" fill="white" opacity="0.15"/%3E%3Ccircle cx="350" cy="340" r="15" fill="white" opacity="0.4"/%3E%3Crect x="375" y="330" width="100" height="8" rx="4" fill="white" opacity="0.3"/%3E%3Crect x="375" y="350" width="80" height="8" rx="4" fill="white" opacity="0.3"/%3E%3Ccircle cx="350" cy="385" r="15" fill="white" opacity="0.4"/%3E%3Crect x="375" y="375" width="100" height="8" rx="4" fill="white" opacity="0.3"/%3E%3Crect x="375" y="395" width="80" height="8" rx="4" fill="white" opacity="0.3"/%3E%3C/svg%3E',
  },
]

export default function ProductsPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            PRODUCTS
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Tools built for modern landlords
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-[42em] text-pretty">
            Powerful solutions to automate your workflow, save time, and grow
            your property portfolio with confidence.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, idx) => (
            <article
              key={idx}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition hover:border-foreground/30"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{product.price}</span>
                  <span>•</span>
                  <span>{product.features}</span>
                </div>

                <h2 className="text-lg font-semibold text-foreground leading-snug">
                  {product.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.excerpt}
                </p>

                <Link
                  href={product.href}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  Learn more
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}