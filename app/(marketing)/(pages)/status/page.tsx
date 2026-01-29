'use client'

import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default function StatusPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            System Status
          </h1>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Real-time status and uptime monitoring for all Propely services.
          </p>
        </div>

        {/* Overall Status */}
        <div className="rounded-xl border border-border bg-green-500/5 p-8 mb-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">All Systems Operational</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Services Status */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6">Services</h3>
          <div className="space-y-3">
            <ServiceStatus 
              name="Web Application" 
              status="operational"
              uptime="99.98%"
            />
            <ServiceStatus 
              name="API Services" 
              status="operational"
              uptime="99.99%"
            />
            <ServiceStatus 
              name="Payment Processing" 
              status="operational"
              uptime="99.97%"
            />
            <ServiceStatus 
              name="Email Notifications" 
              status="operational"
              uptime="99.95%"
            />
            <ServiceStatus 
              name="File Storage" 
              status="operational"
              uptime="99.99%"
            />
            <ServiceStatus 
              name="Mobile Apps" 
              status="operational"
              uptime="99.96%"
            />
          </div>
        </div>

        {/* Uptime Stats */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6">Uptime (Last 90 Days)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <UptimeCard period="24 Hours" uptime="100%" />
            <UptimeCard period="7 Days" uptime="99.98%" />
            <UptimeCard period="90 Days" uptime="99.97%" />
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6">Recent Incidents</h3>
          <div className="space-y-4">
            <IncidentCard
              date="Jan 18, 2026"
              title="Brief API Slowdown"
              description="API response times increased by 15% for approximately 8 minutes. Issue was resolved by scaling infrastructure."
              status="resolved"
              duration="8 minutes"
            />
            <IncidentCard
              date="Jan 10, 2026"
              title="Scheduled Maintenance"
              description="Planned database maintenance completed successfully with minimal service impact."
              status="resolved"
              duration="15 minutes"
            />
            <IncidentCard
              date="Dec 28, 2025"
              title="Email Delivery Delay"
              description="Some transactional emails experienced delays of up to 30 minutes. All emails were delivered successfully."
              status="resolved"
              duration="45 minutes"
            />
          </div>
        </div>

        {/* Scheduled Maintenance */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Upcoming Maintenance
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                Scheduled database optimization on February 3, 2026 from 2:00 AM - 3:00 AM EST
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Expected impact: Brief read-only mode for approximately 10 minutes
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function ServiceStatus({ 
  name, 
  status, 
  uptime 
}: { 
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: string 
}) {
  const statusConfig = {
    operational: {
      icon: CheckCircle,
      text: 'Operational',
      color: 'text-green-600 dark:text-green-400'
    },
    degraded: {
      icon: AlertCircle,
      text: 'Degraded',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    down: {
      icon: AlertCircle,
      text: 'Down',
      color: 'text-red-600 dark:text-red-400'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-foreground/30 transition">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{uptime} uptime</span>
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    </div>
  )
}

function UptimeCard({ period, uptime }: { period: string; uptime: string }) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <div className="text-2xl font-semibold mb-1">{uptime}</div>
      <div className="text-sm text-muted-foreground">{period}</div>
    </div>
  )
}

function IncidentCard({ 
  date, 
  title, 
  description, 
  status,
  duration
}: { 
  date: string
  title: string
  description: string
  status: string
  duration: string
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
          {status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      <p className="text-xs text-muted-foreground">Duration: {duration}</p>
    </div>
  )
}