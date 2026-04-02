import { useState } from "react"
import { Send, ArrowRight, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex items-center justify-center size-14 rounded-full bg-primary/10 border border-primary/30">
          <CheckCircle2 className="size-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Message sent!</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          We usually reply within one business day. Check your inbox — including spam just in case.
        </p>
        <Button
          variant="link"
          className="mt-2 text-primary h-auto p-0"
          onClick={() => {
            setSubmitted(false)
            setForm({ name: "", email: "", subject: "", message: "" })
          }}
        >
          Send another message
        </Button>
      </div>
    )
  }

  const isDisabled = loading || !form.name || !form.email || !form.message

  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Alex Johnson"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="alex@example.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Select
          value={form.subject}
          onValueChange={(value) => setForm((prev) => ({ ...prev, subject: value }))}
        >
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select a topic…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales & pricing</SelectItem>
            <SelectItem value="support">Technical support</SelectItem>
            <SelectItem value="billing">Billing & invoices</SelectItem>
            <SelectItem value="migration">Data migration</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Tell us what you need…"
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isDisabled}
        className="group/button mt-1 gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            <Send className="size-4" />
            Send message
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </>
        )}
      </Button>
    </div>
  )
}