/* eslint-disable react/no-unescaped-entities */
'use client'

import Link from 'next/link'
import { PlayCircle, Clock, ArrowRight } from 'lucide-react'

export default function VideoTutorialsPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Video Tutorials
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Step-by-step video guides to help you master property management.
          </p>
        </div>

        {/* Getting Started */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Getting Started</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <VideoCard
              title="Account Setup & First Steps"
              duration="5:32"
              thumbnail="https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop"
              href="/videos/account-setup"
            />
            <VideoCard
              title="Adding Your First Property"
              duration="8:15"
              thumbnail="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop"
              href="/videos/add-property"
            />
            <VideoCard
              title="Inviting Tenants to the Portal"
              duration="4:20"
              thumbnail="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop"
              href="/videos/invite-tenants"
            />
          </div>
        </div>

        {/* Property Management */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Property Management</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <VideoCard
              title="Managing Multiple Properties"
              duration="10:45"
              thumbnail="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop"
              href="/videos/multiple-properties"
            />
            <VideoCard
              title="Setting Up Maintenance Workflows"
              duration="7:30"
              thumbnail="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop"
              href="/videos/maintenance"
            />
            <VideoCard
              title="Document Storage & Organization"
              duration="6:15"
              thumbnail="https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&h=400&fit=crop"
              href="/videos/documents"
            />
          </div>
        </div>

        {/* Rent & Payments */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Rent & Payments</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <VideoCard
              title="Setting Up Online Rent Collection"
              duration="9:20"
              thumbnail="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop"
              href="/videos/rent-collection"
            />
            <VideoCard
              title="Late Fee Configuration"
              duration="5:50"
              thumbnail="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop"
              href="/videos/late-fees"
            />
            <VideoCard
              title="Financial Reports & Analytics"
              duration="11:10"
              thumbnail="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
              href="/videos/reports"
            />
          </div>
        </div>

        {/* Tenant Management */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Tenant Management</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <VideoCard
              title="Tenant Screening Process"
              duration="12:35"
              thumbnail="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop"
              href="/videos/screening"
            />
            <VideoCard
              title="Digital Lease Signing"
              duration="6:40"
              thumbnail="https://images.unsplash.com/photo-1450101215322-bf5cd27642fc?w=600&h=400&fit=crop"
              href="/videos/lease-signing"
            />
            <VideoCard
              title="Communication Best Practices"
              duration="8:25"
              thumbnail="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop"
              href="/videos/communication"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-muted/40 p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Can't find what you're looking for?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Request a tutorial topic or contact our support team for personalized help.
          </p>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

function VideoCard({ title, duration, thumbnail, href }: {
  title: string
  duration: string
  thumbnail: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border overflow-hidden hover:border-foreground/30 transition"
    >
      <div className="relative aspect-video bg-muted">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <PlayCircle className="h-12 w-12 text-white" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {duration}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium group-hover:text-primary transition">
          {title}
        </h3>
      </div>
    </Link>
  )
}