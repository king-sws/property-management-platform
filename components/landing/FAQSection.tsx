"use client";

import React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer: "Sign up without a credit card and get full access to all features for 14 days. You can cancel anytime during the trial period without any charges. After the trial, choose a plan that fits your needs."
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll pro-rate any difference in your billing."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and ACH bank transfers. All payments are processed securely through Stripe."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-level 256-bit SSL encryption, regular security audits, and are GDPR compliant. Your data is backed up daily and stored in secure data centers."
  },
  {
    question: "Can tenants access the platform?",
    answer: "Yes! Each tenant gets their own secure portal where they can pay rent, submit maintenance requests, view documents, and communicate with you."
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes! All plans include email support. Professional and Premium plans get priority support and phone access. We typically respond within 2-4 hours during business days."
  },
  {
    question: "Can I import my existing data?",
    answer: "Yes, we provide tools to import your properties, tenants, and lease data. Our support team can help you migrate from other platforms."
  },
  {
    question: "What happens if I exceed my property limit?",
    answer: "We'll send you a notification when you're approaching your limit. You can easily upgrade to a higher tier plan to add more properties without any service interruption."
  }
];

export function FAQSection() {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <section id='faq' className="py-20 relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#0a0a0b] dark:via-gray-950 dark:to-[#0a0a0b]">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-200/20 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight text-slate-900 dark:text-white mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Everything you need to know about our platform
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 group"
              >
                <span className="font-semibold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {faq.question}
                </span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all duration-300 ${
                  activeIndex === index ? 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500' : ''
                }`}>
                  <ChevronDown 
                    className={`h-5 w-5 transition-all duration-300 ${
                      activeIndex === index 
                        ? 'rotate-180 text-white' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  />
                </div>
              </button>
              
              <div className={`transition-all duration-300 ease-in-out ${
                activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              } overflow-hidden`}>
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
            Still have questions?
          </p>
          <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-purple-400 dark:hover:border-purple-600 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold transition-all duration-300 text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-[#0a0a0b] dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-200/30 dark:bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-200/30 dark:bg-pink-600/20 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 dark:from-purple-700 dark:via-purple-600 dark:to-pink-700 p-12 md:p-16 shadow-2xl overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
            
            {/* Content */}
            <div className="relative text-center space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-white">
                Ready to Simplify Your Property Management?
              </h2>

              <p className="text-base md:text-sm text-white/70 max-w-2xl mx-auto">
                Join 1,000+ landlords who are saving time and increasing profits with our platform
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button className="px-3 py-3 rounded-lg bg-white text-black hover:bg-slate-50 font-semibold text-base min-w-50 flex items-center justify-center gap-2 group shadow-xl hover:shadow-2xl transition-all duration-300">
                  <Link href="/sign-up">Get Started Free</Link>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {/* <button className="px-4 py-3 rounded-lg border-2 border-white text-black hover:bg-white hover:text-purple-600 font-semibold text-base min-w-[200px] transition-all duration-300">
                  Schedule Demo
                </button> */}
              </div>

              <p className="text-[12px] text-white/70 pt-2">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function FAQAndCTA() {
  return (
    <>
      <FAQSection />
      
      {/* Animated divider line */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50 dark:from-[#0a0a0b] dark:via-gray-950 dark:to-gray-950">
        <div className="container mx-auto px-4">
          <div className="h-px w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-gradient"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-gradient-delayed"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        
      `}</style>
      
      <CTASection />
    </>
  );
}