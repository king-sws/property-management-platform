'use client'
import React from 'react';
import Image from 'next/image';

const CTASection = () => {
  return (
    <section className="w-full scroll-mt-8 bg-gradient overflow-clip py-16 sm:py-20 md:py-24 group relative grid place-items-center min-h-96">
      {/* Background gradient image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/gradient.webp"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="container flex flex-col gap-8 relative z-10">
        <div className="flex w-full flex-col gap-y-4 items-center text-center">
          {/* Small heading */}
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[11px] -mb-2">
            JOIN SUCCESSFUL PROPERTY MANAGERS
          </p>

          {/* Main heading */}
          <h2 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl text-white">
            Simplify property management, maximize profits
          </h2>

          {/* Description */}
          <p className="max-w-[42.5em] text-pretty text-[#c2cce9] [word-break:break-word] md:text-lg [&_a]:font-semibold [&_a]:text-foreground [&_a]:hover:text-foreground/85">
            Stop juggling spreadsheets and missed payments. Streamline tenant screening, automate rent collection, 
            and manage maintenance requests all in one powerful platform.
          </p>

          {/* CTA Button */}
          <button
            className="group/cta inline-flex items-center justify-center font-medium text-start
              whitespace-nowrap hover:z-10 disabled:opacity-60 disabled:pointer-events-none
              bg-white text-black hover:bg-gray-100 px-6 py-3 gap-2 rounded-lg text-base
              mt-4 transition-all"
          >
            <span className="flex-1 truncate">
              Start Your Free Trial
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="
                shrink-0 size-[1.1em] opacity-75
                transition-transform duration-300 ease-out
                group-hover/cta:translate-x-1
                group-hover/cta:-translate-y-1
              "
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;