'use client'
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const PricingSection = () => {
  const pricingPlans = [
    {
      name: 'Starter',
      subtitle: 'Perfect for small portfolios',
      price: '49',
      originalPrice: '69',
      features: [
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>, text: 'Up to 10 properties', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>, text: 'Basic tenant management', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>, text: 'Online rent collection', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>, text: 'Lease agreement storage', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>, text: 'Maintenance tracking', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>, text: 'Basic financial reports', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>, text: 'Email support', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>, text: 'Mobile app access', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"></path></svg>, text: 'Free updates', badge: true },
      ],
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-white text-black hover:bg-gray-100',
    },
    {
      name: 'Professional',
      badge: 'MOST POPULAR',
      subtitle: 'For growing property portfolios',
      price: '99',
      originalPrice: '129',
      featured: true,
      features: [
        { text: 'Everything in Starter, plus:', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>, text: 'Up to 50 properties', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5V2"></path><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"></path><path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"></path></svg>, text: 'AI-powered maintenance scheduling', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, text: 'Advanced tenant screening', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>, text: 'Automated lease renewals', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>, text: 'Custom dashboards & analytics', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"></path></svg>, text: 'Priority support (24/7)', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" x2="12" y1="22.08" y2="12"></line></svg>, text: 'API & integrations access', badge: true },
      ],
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      name: 'Enterprise',
      subtitle: 'For large-scale operations',
      price: '299',
      fromPrice: true,
      features: [
        { text: 'Everything in Professional, plus:', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>, text: 'Unlimited properties', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" x2="22" y1="8" y2="8"></line><line x1="17" x2="22" y1="12" y2="12"></line><line x1="17" x2="22" y1="16" y2="16"></line></svg>, text: 'Multi-user team accounts', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>, text: 'White-label customization', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="M11 10.27 7 3.34"></path><path d="m20.66 17-1.73-1"></path><path d="m3.34 7 1.73 1"></path><path d="M14 12h8"></path><path d="M2 12h2"></path><path d="m20.66 7-1.73 1"></path><path d="m3.34 17 1.73-1"></path><path d="m17 3.34-1 1.73"></path><path d="m11 13.73-4 6.93"></path></svg>, text: 'Dedicated account manager', badge: false },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, text: 'Custom pricing & billing', badge: false },
      ],
      buttonText: 'Contact Sales',
      buttonClass: 'bg-gray-800 text-white hover:bg-gray-700',
    },
  ];

  return (
    <section id="pricing" className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            PRICING
          </p>

          <h2 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Simple, transparent pricing for every portfolio size
          </h2>

          <p className="text-muted-foreground text-base md:text-lg   [word-break:break-word] md:text-lg [&_a]:font-semibold [&_a]:text-foreground [&_a]:hover:text-foreground/85 max-w-2xl">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>

          {/* Discount badge */}
          <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded bg-green-500/10 px-3 py-1.5 font-medium text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gift" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
              20% off annual plans
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">limited time offer</span>
            <span className="inline-flex items-center rounded bg-white/10 px-2 py-1 font-mono text-xs font-medium">
              Save $240/year
            </span>
          </div>
        </div>

        {/* Pricing Cards Container */}
        <div className="flex flex-col items-center ring ring-inset ring-border rounded-xl w-full max-w-sm mx-auto overflow-clip md:flex-row md:space-y-0 md:max-w-none md:items-stretch md:justify-center">
          {/* Starter Card */}
          <div className="flex flex-col gap-6 w-full p-8 overflow-clip basis-full lg:basis-[45%] border-b md:border-b-0 md:border-r border-border">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold text-foreground">
                {pricingPlans[0].name}
              </h3>
              <p className="text-sm text-muted-foreground">{pricingPlans[0].subtitle}</p>
            </div>           

            <div>
              <div className="relative flex items-baseline gap-0.5 h-14 text-muted-foreground">
                {/* Main price */}
                <span className="text-2xl">
                  $
                </span>
                  <span className="relative">
                    <span className="text-6xl font-medium tracking-tighter text-foreground">{pricingPlans[0].price}</span>

                    {/* Original price */}
                    <span className="absolute -top-[0.25em] left-full ml-2 text-lg font-normal before:absolute before:-inset-x-0.5 before:top-1/2 before:h-[0.075em] before:-rotate-10 before:bg-red-500/75">
                      ${pricingPlans[0].originalPrice}
                    </span>
                  </span>
                <span className="text-sm ml-1">/month</span>
              </div>
            </div>

            <hr className="-mx-8" />

            <div className="flex gap-x-4 gap-y-3 flex-col items-start flex-wrap flex-1">
              {pricingPlans[0].features.map((feature, idx) => (
                <div key={idx} className="flex gap-x-3 gap-y-2 flex-row place-content-start items-start">
                  {feature.icon && (
                    <>
                      <span className="flex-shrink-0 w-4 h-4 text-muted-foreground mt-0.5">
                        {feature.icon}
                      </span>
                      <span className="-mt-0.5 flex-1 text-sm text-[#b4b4b6]">
                        {feature.text}
                        {feature.badge && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="inline-block ml-2 text-blue-500" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none"></path></svg>
                        )}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
  className={`group/button inline-flex items-center justify-center
    font-medium text-start whitespace-nowrap hover:z-10
    disabled:opacity-60 disabled:pointer-events-none
    text-background bg-foreground hover:opacity-85
    px-5 py-3 gap-[1ch] rounded-lg text-sm sm:text-base mt-2
    ${pricingPlans[0].buttonClass}`}
>
  {/* Text — stays at start */}
  <span className="flex-1 truncate only:text-center has-[div]:contents">
    {pricingPlans[0].buttonText}
  </span>

  {/* Icon — stays on the other side */}
  <ArrowRightIcon
    className="lucide lucide-arrow-right shrink-0 size-[1.1em] opacity-75
               transition-transform duration-300 ease-out
               group-hover/button:translate-x-1.5"
  />
</button>

          </div>

          {/* Professional Card (Featured) */}
          <div className="flex flex-col gap-6 w-full p-8 overflow-clip basis-full bg-gradient-to-b from-blue-950/30 to-blue-950/10 ring ring-inset ring-primary/50 lg:basis-[55%] border-b md:border-b-0 md:border-r border-border relative">
            <div className="flex gap-x-3 gap-y-2 flex-row items-center place-content-start flex-wrap">
              <h3 className="text-2xl font-semibold text-foreground">
                {pricingPlans[1].name}
              </h3>
              <div className="font-mono font-medium tracking-wider uppercase [&[href]]:hover:text-foreground/75 text-[11px] bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                Most Popular
              </div>
            </div>

            <p className="text-sm text-muted-foreground -mt-4">{pricingPlans[1].subtitle}</p>

            <div>
              <div className="relative flex items-baseline gap-0.5 h-14 text-muted-foreground">
              {/* Main price */}
              <span className="text-2xl">
                $
              </span>
                <span className="relative">
                  <span className="text-6xl font-medium tracking-tighter text-foreground">{pricingPlans[1].price}</span>

              {/* Original price */}
              <span className="absolute -top-[0.25em] left-full ml-2 text-lg font-normal before:absolute before:-inset-x-0.5 before:top-1/2 before:h-[0.075em] before:-rotate-10 before:bg-red-500/75">
                ${pricingPlans[1].originalPrice}
              </span>
                </span>
                <span className="text-sm ml-1">/month</span>
            </div>

            </div>

            <hr className="-mx-8" />

            <div className="flex gap-x-4 gap-y-3 flex-col items-start flex-wrap flex-1">
              {pricingPlans[1].features.map((feature, idx) => (
                <div key={idx} className="flex gap-x-3 gap-y-2 flex-row place-content-start items-start">
                  {feature.icon ? (
                    <>
                      <span className="flex-shrink-0 w-4 h-4 text-muted-foreground mt-0.5">
                        {feature.icon}
                      </span>
                      <span className="-mt-0.5 flex-1 text-sm text-secondary-foreground">
                        {feature.text}
                        
                        {feature.badge && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="inline-block ml-2 text-blue-500" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" fill="none"></path></svg>
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-foreground/70 font-medium">{feature.text}</span>
                  )}
                </div>
              ))}
            </div>

            <button
  className={`group w-full py-3 px-6 rounded-lg font-medium
    transition-colors flex items-center
    ${pricingPlans[1].buttonClass}`}
>
  {/* Text — start */}
  <span className="flex-1 text-left truncate">
    {pricingPlans[1].buttonText}
  </span>

  {/* Icon — right */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="shrink-0 transition-transform duration-300 ease-out
               group-hover:translate-x-1.5"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
</button>

          </div>

          {/* Enterprise Card */}
          <div className="flex flex-col gap-6 w-full p-8 overflow-clip basis-full opacity-80 lg:basis-[45%]">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold text-foreground">
                {pricingPlans[2].name}
              </h3>
              <p className="text-sm text-muted-foreground">{pricingPlans[2].subtitle}</p>
            </div>

            <div className='relative flex items-baseline gap-0.5 h-14 text-muted-foreground'>
              <p className="text-xs absolute -top-3.5 left-0">From</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl">
                  $
                </span>
                <span className="relative">
                  <span className="text-6xl font-medium tracking-tighter text-foreground">
                    {pricingPlans[2].price}
                  </span>
                  </span>
                  <span className="text-sm ml-1">/month</span>
              </div>
            </div>

            <hr className="-mx-8" />

            <div className="flex gap-x-4 gap-y-3 flex-col items-start flex-wrap flex-1">
              {pricingPlans[2].features.map((feature, idx) => (
                <div key={idx} className="flex gap-x-3 gap-y-2 flex-row place-content-start items-start">
                  {feature.icon ? (
                    <>
                      <span className="flex-shrink-0 w-4 h-4 text-muted-foreground mt-0.5">
                        {feature.icon}
                      </span>
                      <span className="-mt-0.5 flex-1 text-sm text-secondary-foreground">
                        {feature.text}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-foreground/70 font-medium">{feature.text}</span>
                  )}
                </div>
              ))}
            </div>

            <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${pricingPlans[2].buttonClass}`}>
              {pricingPlans[2].buttonText}
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase [&[href]]:hover:text-foreground/75 text-[11px] text-center mt-5">
          All prices in USD. Taxes may apply.
        </p>

        <div className="flex items-center justify-center gap-3 mt-2">
  {/* Avatars */}
  <div className="flex -space-x-2">
    <Image src="/images/avatar-2.png" alt="Customer 1" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-background" />
    <Image src="/images/avatar-3.png" alt="Customer 2" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-background" />
    <Image src="/images/avatar-5.png" alt="Customer 3" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-background" />
    <Image src="/images/avatar-8.png" alt="Customer 4" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-background" />
    <Image src="/images/avatar-9.png" alt="Customer 5" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-background" />
  </div>

  {/* Stars + Text (column) */}
  <div className="flex flex-col items-start gap-0.5">
    {/* Stars */}
    <div className="flex items-center gap-1 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>

    {/* Text under stars */}
    <span className="text-xs text-muted-foreground">
      Trusted by 500+ property managers
    </span>
  </div>
</div>

      </div>
    </section>
  );
};

export default PricingSection;