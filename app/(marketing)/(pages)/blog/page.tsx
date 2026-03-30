'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'

const categories = [
  { name: 'All', href: '/blog' },
  { name: 'Property Management', href: '/blog?category=property-management' },
  { name: 'Tenant Tips', href: '/blog?category=tenant-tips' },
  { name: 'Maintenance', href: '/blog?category=maintenance' },
  { name: 'Legal & Finance', href: '/blog?category=legal-finance' },
  { name: 'Marketing', href: '/blog?category=marketing' },
]

const blogPosts = [
  {
    title: '10 Essential Tips for First-Time Landlords',
    excerpt:
      'Starting your journey as a landlord? Learn the fundamental practices that will help you succeed and avoid common pitfalls in property management.',
    author: 'Sarah Johnson',
    date: 'March 25, 2024',
    readTime: '8 min read',
    category: 'Property Management',
    featured: true,
    href: '/blog/first-time-landlords-tips',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad1)"/%3E%3Ccircle cx="200" cy="150" r="80" fill="white" opacity="0.1"/%3E%3Ccircle cx="600" cy="350" r="100" fill="white" opacity="0.1"/%3E%3Crect x="250" y="180" width="300" height="200" rx="15" fill="white" opacity="0.15"/%3E%3C/svg%3E',
  },
  {
    title: 'How to Screen Tenants Effectively',
    excerpt:
      'A comprehensive guide to background checks, credit scores, and finding reliable tenants for your rental properties.',
    author: 'Michael Chen',
    date: 'March 22, 2024',
    readTime: '6 min read',
    category: 'Tenant Tips',
    featured: false,
    href: '/blog/screen-tenants-effectively',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2306b6d4;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230891b2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad2)"/%3E%3Ccircle cx="150" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Ccircle cx="650" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Crect x="300" y="150" width="200" height="250" rx="20" fill="white" opacity="0.2"/%3E%3C/svg%3E',
  },
  {
    title: 'Preventive Maintenance Checklist for Rental Properties',
    excerpt:
      'Keep your properties in top condition and avoid costly repairs with this seasonal maintenance checklist.',
    author: 'David Martinez',
    date: 'March 20, 2024',
    readTime: '10 min read',
    category: 'Maintenance',
    featured: false,
    href: '/blog/preventive-maintenance-checklist',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2310b981;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad3)"/%3E%3Cpath d="M 400 100 L 500 250 L 400 400 L 300 250 Z" fill="white" opacity="0.1"/%3E%3Ccircle cx="400" cy="250" r="100" fill="none" stroke="white" stroke-width="3" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Understanding Rental Property Tax Deductions',
    excerpt:
      'Maximize your returns by learning about legitimate tax deductions available to property owners.',
    author: 'Emily Roberts',
    date: 'March 18, 2024',
    readTime: '7 min read',
    category: 'Legal & Finance',
    featured: false,
    href: '/blog/rental-property-tax-deductions',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad4" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f59e0b;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23d97706;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad4)"/%3E%3Crect x="150" y="350" width="80" height="100" fill="white" opacity="0.3"/%3E%3Crect x="250" y="280" width="80" height="170" fill="white" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Digital Marketing Strategies for Rental Properties',
    excerpt:
      'Learn how to attract quality tenants faster with effective online marketing techniques and listing optimization.',
    author: 'Jessica Lee',
    date: 'March 15, 2024',
    readTime: '5 min read',
    category: 'Marketing',
    featured: false,
    href: '/blog/digital-marketing-rental-properties',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad5" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ec4899;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23db2777;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad5)"/%3E%3Crect x="200" y="100" width="400" height="300" rx="15" fill="white" opacity="0.15"/%3E%3C/svg%3E',
  },
  {
    title: 'Creating a Seamless Tenant Onboarding Experience',
    excerpt:
      'Set the tone for a great landlord-tenant relationship with a smooth move-in process and clear communication.',
    author: 'Sarah Johnson',
    date: 'March 12, 2024',
    readTime: '6 min read',
    category: 'Tenant Tips',
    featured: false,
    href: '/blog/tenant-onboarding-experience',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad6" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%238b5cf6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%236d28d9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad6)"/%3E%3Ccircle cx="400" cy="200" r="80" fill="white" opacity="0.2"/%3E%3C/svg%3E',
  },
]

// Ad placeholder component - ready for future ad integration
function AdPlaceholder({ size, label }: { size: string; label: string }) {
  return (
    <div
      className={`relative w-full ${size} bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center`}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Advertisement
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{label}</p>
      </div>
    </div>
  )
}

function NewsletterSignup() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-10">
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <h3 className="text-xl font-semibold text-white">
          Subscribe to our newsletter
        </h3>
        <p className="text-white/80 text-sm max-w-md">
          Get the latest property management tips, tenant screening guides, and
          industry insights delivered to your inbox weekly.
        </p>
        <form className="flex w-full max-w-md gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-lg border-0 bg-white/90 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-white/10" />
    </div>
  )
}

export default function BlogPage() {
  const featuredPost = blogPosts.find((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            BLOG
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Property management insights & tips
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-[42em] text-pretty">
            Expert advice on managing rentals, screening tenants, maintenance,
            and growing your property portfolio.
          </p>
        </div>

        {/* Top Ad Banner */}
        <div className="mb-12">
          <AdPlaceholder size="h-32" label="Leaderboard (728x90)" />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <article className="mb-12">
            <Link href={featuredPost.href} className="group block">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                      {featuredPost.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Featured
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="size-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="size-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="size-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>Read article</span>
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </article>
        )}

        {/* Sidebar Ad - Desktop */}
        <div className="hidden lg:block mb-12">
          <AdPlaceholder size="h-48" label="Sidebar Banner (300x250)" />
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {regularPosts.map((post, idx) => (
            <article
              key={idx}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition hover:border-foreground/30 hover:shadow-lg"
            >
              <Link href={post.href} className="block">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-3" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* In-Feed Ad */}
        <div className="mb-12">
          <AdPlaceholder size="h-40" label="In-Feed Ad (Responsive)" />
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mb-16">
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50">
            Previous
          </button>
          <button className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background">
            1
          </button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            2
          </button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            3
          </button>
          <span className="text-muted-foreground">...</span>
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
            10
          </button>
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Next
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-12">
          <NewsletterSignup />
        </div>

        {/* Bottom Ad Banner */}
        <div className="mb-8">
          <AdPlaceholder size="h-32" label="Bottom Banner (728x90)" />
        </div>
      </div>
    </section>
  )
}
