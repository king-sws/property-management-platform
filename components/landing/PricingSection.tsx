"use client";

import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: "Basic",
    price: "29",
    features: [
      "Up to 5 properties",
      "Unlimited tenants",
      "Online rent collection",
      "Basic maintenance tracking",
      "Lease management",
      "Email support",
      "Mobile app access",
      "Basic reporting"
    ],
    highlighted: false,
    cta: "Start Free Trial",
    icon: "🌱"
  },
  {
    name: "Professional",
    price: "49",
    badge: "Most Popular",
    features: [
      "Up to 10 properties",
      "Everything in Basic",
      "Advanced maintenance workflows",
      "Vendor management & reviews",
      "E-signature for leases",
      "Automated rent reminders",
      "Priority support",
      "Advanced financial reports",
      "Custom lease templates",
      "Tenant screening integration"
    ],
    highlighted: true,
    cta: "Start Free Trial",
    icon: "🚀"
  },
  {
    name: "Premium",
    price: "79",
    features: [
      "Up to 20 properties",
      "Everything in Professional",
      "Multi-user accounts",
      "White-label tenant portal",
      "API access",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom integrations",
      "Advanced analytics",
      "Bulk operations"
    ],
    highlighted: false,
    cta: "Start Free Trial",
    icon: "💎"
  }
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('yearly');

  return (
    <section id="pricing" className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-[#0a0a0b] dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto max-w-6xl">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight text-slate-900 dark:text-white mb-4">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
        </div>


        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6  max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white text-xs font-normal shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className={`relative h-full rounded-lg p-8 transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white shadow-2xl border border-purple-500/50 dark:border-purple-400/50'
                  : 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl'
              }`}>
                
                {/* Icon */}

                {/* Plan name */}
                <div className="mb-6">
                  <h3 className={`text-2xl font-normal ${
                    plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                  }`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-normal ${
                      plan.highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      ${billingCycle === 'yearly' ? Math.round(Number(plan.price) * 0.83) : plan.price}
                    </span>
                    <span className={`text-sm ${
                      plan.highlighted ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      /month {billingCycle === 'yearly' && 'billed annually'}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className={`w-full py-3.5 px-6 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                  plan.highlighted
                    ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white hover:shadow-lg hover:scale-105'
                }`}>
                  {plan.cta}
                </button>

                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`rounded-full p-1 mt-0.5 flex-shrink-0 ${
                        plan.highlighted
                          ? 'bg-purple-500/20'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <Check className={`w-3.5 h-3.5 ${
                          plan.highlighted
                            ? 'text-purple-300'
                            : 'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <span className={`text-sm leading-relaxed ${
                        plan.highlighted
                          ? 'text-slate-200'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <div className="mt-16 text-center space-y-8">
          <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">14-day free trial</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">No credit card required</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Change anytime</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Flexible plan switching</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Cancel anytime</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">No commitments</p>
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-[14px]">
            Need more than 20 properties?{' '}
            <a href="#contact" className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:underline">
              Contact us for Enterprise pricing →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}