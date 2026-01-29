'use client'

import Link from 'next/link'
import {
  Mail,
  MessageCircle,
  Phone,
  ArrowRight
} from 'lucide-react'

export default function SupportPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Get in touch
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Our team is here to help you with any questions or issues.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {/* Email */}
          <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
            <Mail className="h-6 w-6 mb-4 text-primary" />
            <h3 className="font-medium mb-1">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get help via email. We typically respond within 24 hours.
            </p>
            <Link
              href="mailto:support@propely.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              support@propely.com
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Live Chat */}
          <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
            <MessageCircle className="h-6 w-6 mb-4 text-primary" />
            <h3 className="font-medium mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with our team in real-time during business hours.
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Start chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Phone */}
          <div className="rounded-xl border border-border p-6 hover:border-foreground/30 transition">
            <Phone className="h-6 w-6 mb-4 text-primary" />
            <h3 className="font-medium mb-1">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Speak directly with our support team.
            </p>
            <Link
              href="tel:+1-555-123-4567"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              +1 (555) 123-4567
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">
            Send us a message
          </h2>

          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us more about your question or issue..."
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Office Hours */}
        <div className="rounded-xl bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
          </p>
        </div>

      </div>
    </section>
  )
}