'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRightIcon, CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon } from 'lucide-react'
import { NewsletterSignup } from '@/components/landing/NewsletterSignup'

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
    author: 'Propely Editorial Team',
    date: 'March 25, 2026',
    readTime: '8 min read',
    category: 'Property Management',
    featured: true,
    href: '/blog/first-time-landlords-tips',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop',
  },
  {
    title: 'How to Screen Tenants Effectively',
    excerpt:
      'A comprehensive guide to background checks, credit scores, and finding reliable tenants for your rental properties.',
    author: 'Propely Editorial Team',
    date: 'March 22, 2026',
    readTime: '6 min read',
    category: 'Tenant Tips',
    featured: false,
    href: '/blog/screen-tenants-effectively',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
  },
  {
    title: 'Preventive Maintenance Checklist for Rental Properties',
    excerpt:
      'Keep your properties in top condition and avoid costly repairs with this seasonal maintenance checklist.',
    author: 'Propely Editorial Team',
    date: 'March 20, 2026',
    readTime: '10 min read',
    category: 'Maintenance',
    featured: false,
    href: '/blog/preventive-maintenance-checklist',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=450&fit=crop',
  },
  {
    title: 'Understanding Rental Property Tax Deductions',
    excerpt:
      'Maximize your returns by learning about legitimate tax deductions available to property owners.',
    author: 'Propely Editorial Team',
    date: 'March 18, 2026',
    readTime: '7 min read',
    category: 'Legal & Finance',
    featured: false,
    href: '/blog/rental-property-tax-deductions',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=450&fit=crop',
  },
  {
    title: 'Digital Marketing Strategies for Rental Properties',
    excerpt:
      'Learn how to attract quality tenants faster with effective online marketing techniques and listing optimization.',
    author: 'Propely Editorial Team',
    date: 'March 15, 2026',
    readTime: '5 min read',
    category: 'Marketing',
    featured: false,
    href: '/blog/digital-marketing-rental-properties',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
  },
  {
    title: 'Creating a Seamless Tenant Onboarding Experience',
    excerpt:
      'Set the tone for a great landlord-tenant relationship with a smooth move-in process and clear communication.',
    author: 'Propely Editorial Team',
    date: 'March 12, 2026',
    readTime: '6 min read',
    category: 'Tenant Tips',
    featured: false,
    href: '/blog/tenant-onboarding-experience',
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800&h=450&fit=crop',
  },
  {
    title: 'How to Handle Late Rent Payments Professionally',
    excerpt:
      'Dealing with late payments is inevitable. Here\'s how to address them firmly, fairly, and in full compliance with the law.',
    author: 'Propely Editorial Team',
    date: 'March 10, 2026',
    readTime: '5 min read',
    category: 'Property Management',
    featured: false,
    href: '/blog/handle-late-rent-payments',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=450&fit=crop',
  },
  {
    title: 'Security Deposits: What Landlords Need to Know',
    excerpt:
      'A complete guide to collecting, holding, and returning security deposits while staying compliant with local laws.',
    author: 'Propely Editorial Team',
    date: 'March 8, 2026',
    readTime: '6 min read',
    category: 'Legal & Finance',
    featured: false,
    href: '/blog/security-deposits-guide',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
  },
  {
    title: 'Lease Renewal Strategies to Retain Great Tenants',
    excerpt:
      'Keeping a good tenant is far cheaper than finding a new one. Learn how to approach renewals and reduce turnover.',
    author: 'Propely Editorial Team',
    date: 'March 5, 2026',
    readTime: '5 min read',
    category: 'Tenant Tips',
    featured: false,
    href: '/blog/lease-renewal-strategies',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=450&fit=crop',
  },
  {
    title: 'How to Price Your Rental Property in Any Market',
    excerpt:
      'Pricing your rental right is both an art and a science. Discover the tools and frameworks landlords use to maximize occupancy and income.',
    author: 'Propely Editorial Team',
    date: 'March 3, 2026',
    readTime: '7 min read',
    category: 'Property Management',
    featured: false,
    href: '/blog/how-to-price-rental-property',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=450&fit=crop',
  },
  {
    title: 'Landlord Insurance: Coverage Every Property Owner Needs',
    excerpt:
      'Standard homeowner\'s insurance won\'t protect your rental. Here\'s exactly what coverage to get and why it matters.',
    author: 'Propely Editorial Team',
    date: 'February 28, 2026',
    readTime: '6 min read',
    category: 'Legal & Finance',
    featured: false,
    href: '/blog/landlord-insurance-guide',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop',
  },
  {
    title: 'Managing Multiple Rental Properties Without Burning Out',
    excerpt:
      'Scaling your portfolio is exciting — but without the right systems, it becomes overwhelming fast. Here\'s how to stay in control.',
    author: 'Propely Editorial Team',
    date: 'February 25, 2026',
    readTime: '8 min read',
    category: 'Property Management',
    featured: false,
    href: '/blog/managing-multiple-rental-properties',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop',
  },
]

/**
 * Ad slot — renders nothing until Google AdSense is approved and real ad code
 * is inserted here. Keeping the component so you can swap in the real script
 * without touching the layout. Set NEXT_PUBLIC_ADSENSE_APPROVED=true in your
 * Vercel env vars once approved and replace the inner content with the real
 * adsbygoogle snippet.
 */
const POSTS_PER_PAGE = 6

function AdSlot({ className = '' }: { className?: string }) {
  return <div className={className} aria-hidden="true" />
}


export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeCategory, setActiveCategory] = useState('All')

  const featuredPost = blogPosts.find((post) => post.featured)

  const filteredPosts = blogPosts
    .filter((post) => !post.featured)
    .filter((post) =>
      activeCategory === 'All' ? true : post.category === activeCategory
    )

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  const handleCategoryChange = (name: string) => {
    setActiveCategory(name)
    setCurrentPage(1)
  }
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">

        {/* Header — unchanged */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">BLOG</p>
          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Property management insights & tips
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-[42em] text-pretty">
            Expert advice on managing rentals, screening tenants, maintenance, and growing your property portfolio.
          </p>
        </div>

        <AdSlot className="mb-12" />

        {/* Categories — now interactive */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryChange(category.name)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === category.name
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Post — only show on page 1 with 'All' */}
        {featuredPost && currentPage === 1 && activeCategory === 'All' && (
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
                    <span className="text-xs text-muted-foreground">Featured</span>
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

        {/* Sidebar Ad slot — invisible until approved */}
        <AdSlot className="hidden lg:block mb-12" />

        {/* Divider before grid */}
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-xs text-muted-foreground uppercase tracking-widest font-mono">
              {activeCategory === 'All' ? 'All Articles' : activeCategory} · {filteredPosts.length} posts
            </span>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {paginatedPosts.map((post, idx) => (
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
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
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

        {/* ── REAL PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 mb-16">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeftIcon className="size-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              const isActive = page === currentPage
              const isEllipsis =
                totalPages > 7 &&
                page !== 1 &&
                page !== totalPages &&
                Math.abs(page - currentPage) > 2

              if (isEllipsis) {
                // Only render one ellipsis on each side
                const prevPage = page - 1
                const prevIsEllipsis =
                  prevPage !== 1 &&
                  prevPage !== totalPages &&
                  Math.abs(prevPage - currentPage) > 2
                if (prevIsEllipsis) return null
                return (
                  <span key={page} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
                    …
                  </span>
                )
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                    isActive
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        )}

        {/* Show count when no pagination */}
        {totalPages <= 1 && (
          <p className="text-center text-sm text-muted-foreground mb-16">
            Showing all {filteredPosts.length} articles
          </p>
        )}

        <AdSlot className="mb-12" />
        <div className="mb-12"><NewsletterSignup /></div>
        <AdSlot className="mb-8" />
      </div>
    </section>
  )
}
