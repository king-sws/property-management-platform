'use client'
import React, { useState } from 'react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What features are included in Propely?",
      answer: "Propely includes comprehensive property management tools: property and unit management, tenant applications and screening, lease management with e-signatures, automated rent collection and payment tracking, maintenance ticket system with vendor coordination, financial reporting and expense tracking, document management, communication tools, and activity logging. Everything you need to manage your rental properties efficiently."
    },
    {
      question: "How does tenant screening work?",
      answer: "Propely streamlines tenant screening with integrated background checks, credit reports, employment verification, and rental history checks. Landlords can review applications, request screenings, and make informed decisions all within the system. Results are securely stored and easily accessible for future reference."
    },
    {
      question: "Can I manage multiple properties and units?",
      answer: "Yes! Propely supports unlimited properties and units based on your subscription tier. Each property can have multiple units with individual rent amounts, deposits, and amenities. Track everything from a unified dashboard with detailed views for each property or unit."
    },
    {
      question: "How does the maintenance management system work?",
      answer: "Tenants submit maintenance requests through their portal. Landlords receive notifications and can assign tickets to verified vendors. The system includes priority levels, status tracking, cost estimation, scheduling, and completion verification. Vendors can update progress in real-time and submit invoices directly through Propely."
    },
    {
      question: "What subscription plans are available?",
      answer: "Propely offers flexible subscription tiers: Basic (up to 5 properties), Professional (up to 10 properties), Premium (up to 20 properties), and Enterprise (custom). All plans include core features with trial options available. Subscriptions include automated billing and can be upgraded anytime as your portfolio grows."
    },
    {
      question: "How does rent collection and payment processing work?",
      answer: "Propely supports automated rent collection with multiple payment methods including credit cards and ACH transfers. Set up recurring payments, track payment history, manage late fees, and generate receipts automatically. Payment processing is secure and PCI-compliant."
    },
    {
      question: "Can vendors submit and manage invoices?",
      answer: "Yes! Vendors can create detailed invoices directly in Propely with line items, tax calculations, and attachments. Landlords review and approve invoices, track payment status, and maintain a complete record of all vendor transactions. The system supports draft, pending, approved, and paid statuses."
    },
    {
      question: "What lease management features are included?",
      answer: "Create custom lease templates, manage fixed-term and month-to-month leases, track lease status and renewals, collect e-signatures, manage multiple tenants per lease, calculate late fees, track security deposits and deductions, and send automated renewal offers. All lease documents are securely stored in Propely."
    },
    {
      question: "How does the financial reporting work?",
      answer: "Generate comprehensive financial reports including income statements, expense tracking by category, property-level profitability, tax reporting, and custom date ranges. Track all revenue and expenses with detailed categorization, receipt storage, and export capabilities for your accountant."
    },
    {
      question: "Is Propely secure and compliant?",
      answer: "Security and compliance are top priorities. Propely includes role-based access control, encrypted data storage, secure authentication with two-factor authentication support, activity logging, GDPR/CCPA consent management, and data retention policies. All sensitive information including SSNs and payment data is properly secured."
    },
    {
      question: "What communication tools are available?",
      answer: "Propely includes a built-in messaging system for landlord-tenant-vendor communication, automated notifications for important events (rent due, lease expiring, maintenance updates), email and SMS notification options, conversation threading, and document sharing capabilities. Keep all communication centralized and documented."
    },
    {
      question: "Can I track property inspections and utilities?",
      answer: "Yes! Schedule and document move-in, move-out, and routine inspections with detailed checklists and photo uploads. Track utility providers, account numbers, meter readings, and determine who pays for each utility. Maintain complete records for compliance and reference."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full scroll-mt-8 py-fluid-lg pt-fluid-sm">
      <div className="containe flex flex-col gap-fluid-sm">
        {/* Header */}
        <div className="flex w-full flex-col gap-y-4 items-center text-center">
          <h2 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Frequently Asked Questions
          </h2>
          
          <p className="text-muted-foreground text-base md:text-lg   [word-break:break-word] md:text-lg [&_a]:font-semibold [&_a]:text-foreground [&_a]:hover:text-foreground/85 max-w-2xl">
            Have questions about Propely? We&#39;ve answered the most common ones below. For additional support, please contact us.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="flex flex-col gap-2 p-2 bg-card/50 rounded-xl w-full max-w-2xl mx-auto my-10">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-background rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="group flex items-start justify-between w-full gap-4 py-3.5 px-4 text-start text-secondary-foreground duration-100 hover:text-foreground data-[state=open]:text-foreground"
                data-state={openIndex === index ? 'open' : 'closed'}
              >
                <span className="font-medium text-base md:text-lg pr-2">{faq.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-45' : ''
                  }`}
                  aria-hidden="true"
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-4 text-sm md:text-base text-[#b3b3b3] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;