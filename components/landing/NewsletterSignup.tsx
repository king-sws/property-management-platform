"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [resent, setResent] = useState(false)

  function validate(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  }

  async function handleSubmit() {
    if (!validate(email)) {
      setError("Please enter a valid email address.")
      return
    }
    setError("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900)) 
    setSubmittedEmail(email)
    setLoading(false)
    setConfirmed(true)
  }

  async function handleResend() {
    setResent(true)
    await new Promise((r) => setTimeout(r, 3000))
    setResent(false)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-8 md:p-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-[15%] top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-white/[0.07]" />

      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        {!confirmed ? (
          <>
            <Badge
              variant="outline"
              className="border-white/25 bg-white/15 text-white hover:bg-white/15 gap-1.5"
            >
              <Mail className="h-3 w-3" />
              Weekly newsletter
            </Badge>

            <h3 className="text-xl font-semibold text-white md:text-2xl">
              Property insights, straight to your inbox
            </h3>
            <p className="max-w-md text-sm text-white/75 leading-relaxed">
              Landlord tips, tenant screening guides, rent trends, and legal
              updates — curated weekly for property managers.
            </p>

            <div className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={cn(
                  "h-11 flex-1 border-0 bg-white/90 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:bg-white",
                  error && "ring-2 ring-red-300"
                )}
              />
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="h-11 bg-foreground text-background hover:bg-foreground/90 sm:w-auto w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </div>

            {error && (
              <p className="text-xs text-red-300">{error}</p>
            )}
            <p className="text-[11px] text-white/50">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/40 bg-white/15">
              <CheckCircle2 className="h-7 w-7 text-white/90" />
            </div>

            <h3 className="text-xl font-semibold text-white md:text-2xl">
              Check your inbox
            </h3>
            <p className="text-sm text-white/75">
              We sent a confirmation link to
            </p>
            <span className="rounded-full border border-white/25 bg-white/15 px-4 py-1 text-sm font-medium text-white">
              {submittedEmail}
            </span>
            <p className="max-w-sm text-sm text-white/70 leading-relaxed">
              Click the link in that email to complete your subscription.
            </p>

            <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-2">
              {[
                { label: "Email sent", done: true },
                { label: "Confirm link", done: false },
                { label: "All set", done: false },
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-1.5 text-xs text-white/60">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      step.done ? "bg-emerald-300" : "bg-white/35"
                    )}
                  />
                  {step.label}
                </div>
              ))}
            </div>

            <p className="mt-1 text-[11px] text-white/50">
              Didn&apos;t get it? Check your spam or{" "}
              <button
                onClick={handleResend}
                disabled={resent}
                className="underline transition-colors hover:text-white/80 disabled:opacity-60"
              >
                {resent ? "Sent!" : "resend the email"}
              </button>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}