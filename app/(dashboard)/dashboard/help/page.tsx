/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(dashboard)/dashboard/help/page.tsx
"use client";

import { useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  MessageCircle,
  Mail,
  Home,
  Users,
  DollarSign,
  Wrench,
  FileText,
  Bell,
  Shield,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Help Categories
  const helpCategories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Home className="h-4 w-4" />,
      articles: [
        {
          id: "gs-1",
          question: "How do I add my first property?",
          answer: "Navigate to Properties page, click 'Add Property' button, fill in property details including name, address, and type. Then add units to your property and upload images.",
        },
        {
          id: "gs-2",
          question: "How do I create a lease agreement?",
          answer: "Go to Leases section, click 'Create New Lease', select property and unit, choose tenant, set lease terms (dates, rent amount, deposit), and send for e-signature.",
        },
        {
          id: "gs-3",
          question: "What's included in my trial?",
          answer: "Your 14-day trial includes up to 5 properties, unlimited units and leases, full payment processing, maintenance management, tenant screening, and document storage. No credit card required.",
        },
      ],
    },
    {
      id: "properties",
      title: "Property Management",
      icon: <Home className="h-4 w-4" />,
      articles: [
        {
          id: "pm-1",
          question: "How do I add units to a property?",
          answer: "Select your property, go to Units tab, click 'Add Unit', enter unit details (number, bedrooms, bathrooms, rent amount), add amenities, and save.",
        },
        {
          id: "pm-2",
          question: "Can I upload property photos?",
          answer: "Yes. Go to property details, click photo gallery section, drag and drop images or browse to upload. Set one as primary image and add captions. Supported: JPG, PNG, WebP (max 10MB).",
        },
        {
          id: "pm-3",
          question: "How do I track property expenses?",
          answer: "Go to Expenses section, click 'Add Expense', select property, choose category, enter amount and date, upload receipts, and mark if tax-deductible. Generate reports monthly, quarterly, or annually.",
        },
      ],
    },
    {
      id: "tenants",
      title: "Tenant Management",
      icon: <Users className="h-4 w-4" />,
      articles: [
        {
          id: "tm-1",
          question: "How does tenant screening work?",
          answer: "Tenant pays $35 screening fee, background check is automatically initiated, you receive results in 24-48 hours including criminal history, credit report, employment and rental history verification.",
        },
        {
          id: "tm-2",
          question: "Can I have multiple tenants on one lease?",
          answer: "Yes. When creating lease, add all tenant names, designate one as primary tenant. All tenants receive lease for e-signature and can make payments individually or jointly.",
        },
        {
          id: "tm-3",
          question: "How do tenants submit applications?",
          answer: "Share property listing link or tenants can browse available properties in tenant portal. Applications include personal info, employment details, rental history, references, and screening authorization.",
        },
      ],
    },
    {
      id: "payments",
      title: "Payments & Finances",
      icon: <DollarSign className="h-4 w-4" />,
      articles: [
        {
          id: "pay-1",
          question: "How do tenants pay rent?",
          answer: "Tenants can pay via credit/debit card (2.9% + $0.30 fee) or ACH bank transfer (1% fee, max $5). Auto-pay available for recurring payments. Late fees calculated automatically based on lease terms.",
        },
        {
          id: "pay-2",
          question: "When do I receive payment funds?",
          answer: "Credit/debit cards: 2-3 business days. ACH transfers: 5-7 business days. Funds deposited directly to connected bank account. Platform fees: Basic 3%, Professional 2%, Premium 1%.",
        },
        {
          id: "pay-3",
          question: "How do I handle security deposits?",
          answer: "Record deposit amount in lease, payment processed through platform. When returning: conduct move-out inspection, document damages, create itemized deductions if needed, process refund through Deposits section.",
        },
      ],
    },
    {
      id: "maintenance",
      title: "Maintenance Requests",
      icon: <Wrench className="h-4 w-4" />,
      articles: [
        {
          id: "main-1",
          question: "How do maintenance requests work?",
          answer: "Tenant submits request with photos and description, you receive instant notification, assign priority, assign to vendor or handle yourself, schedule work, track progress, and mark complete when done.",
        },
        {
          id: "main-2",
          question: "Can I hire vendors through the platform?",
          answer: "Yes. Add vendors to your list, assign maintenance tickets directly, vendors update status, submit invoices through platform, you approve and pay invoices, then rate vendors after job completion.",
        },
        {
          id: "main-3",
          question: "What if there's an emergency?",
          answer: "Tenants mark requests as 'Urgent' for emergencies (no heat/AC, flooding, gas leaks, etc.). Emergency requests send immediate push notification and SMS if enabled, flagged in red, and can auto-assign to on-call vendors.",
        },
      ],
    },
    {
      id: "leases",
      title: "Lease Agreements",
      icon: <FileText className="h-4 w-4" />,
      articles: [
        {
          id: "lease-1",
          question: "Can I use my own lease template?",
          answer: "Yes. Use built-in state-specific templates, upload your own PDF/Word documents, or create custom templates with merge fields like {{tenant_name}}, {{rent_amount}}, {{start_date}}.",
        },
        {
          id: "lease-2",
          question: "How does e-signature work?",
          answer: "Create lease with all terms, click 'Send for Signature', tenant receives email with secure link, reviews and signs electronically, you receive notification to sign, fully executed lease stored in Documents.",
        },
        {
          id: "lease-3",
          question: "What happens when a lease is expiring?",
          answer: "90 days before: flagged as expiring. 60 days before: send renewal offer. 30 days before: list unit as available if no renewal. At expiration: process deposit return or begin new lease if renewed.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Billing",
      icon: <Shield className="h-4 w-4" />,
      articles: [
        {
          id: "acc-1",
          question: "How do I upgrade my subscription?",
          answer: "Go to Settings > Subscription, click 'Upgrade Plan', select new plan (Professional or Premium), enter payment info, confirm. Upgrades take effect immediately with prorated billing.",
        },
        {
          id: "acc-2",
          question: "How do I update my payment method?",
          answer: "Navigate to Settings > Billing, click 'Update Payment Method', enter new card information, save. New payment method used for next billing cycle. Accepted: Visa, Mastercard, Amex, debit cards.",
        },
        {
          id: "acc-3",
          question: "Is my data secure?",
          answer: "Yes. All data encrypted in transit (TLS 1.3) and at rest (AES-256). SSNs and payment info tokenized. Two-factor authentication available. SOC 2 Type II certified, GDPR compliant. Daily automated backups.",
        },
      ],
    },
  ];

  // Filter categories based on search
  const filteredCategories = helpCategories.map((category) => ({
    ...category,
    articles: category.articles.filter(
      (article) =>
        article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.articles.length > 0 || !searchQuery);

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h2" className="mb-1">
              Help & Support
            </Typography>
            <Typography variant="muted">
              Find answers to common questions
            </Typography>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="mailto:support@propely.com">
            <Card className="transition-all hover:border-primary cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm font-medium">Email Support</CardTitle>
                    <CardDescription className="text-xs">support@propely.com</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Card className="transition-all hover:border-primary cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
                  <CardDescription className="text-xs">Mon-Fri, 9 AM - 6 PM EST</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Link href="https://docs.propely.com" target="_blank">
            <Card className="transition-all hover:border-primary cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-sm font-medium">Documentation</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1">
                      View full docs <ExternalLink className="h-3 w-3" />
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Help Categories */}
        {searchQuery && filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <Typography variant="h3" className="mb-2">
                No results found
              </Typography>
              <Typography variant="muted" className="mb-4">
                Try searching with different keywords
              </Typography>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <Badge variant="secondary" className="ml-auto">
                      {category.articles.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.articles.map((article, index) => (
                      <AccordionItem key={article.id} value={article.id} className="border-b last:border-0">
                        <AccordionTrigger className="text-left text-sm hover:no-underline py-3">
                          {article.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-4">
                          {article.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Typography variant="h3" className="mb-1">
                  Still need help?
                </Typography>
                <Typography variant="muted" className="text-sm">
                  Our support team is available Monday through Friday, 9 AM - 6 PM EST
                </Typography>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="mailto:support@propely.com">
                  <Button variant="default" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}