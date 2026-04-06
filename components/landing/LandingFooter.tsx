'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FooterSection = () => {
  return (
    <footer className="w-full scroll-mt-8 py-fluid-sm mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="flex flex-wrap items-start gap-fluid-lg">
          {/* Brand Column */}
          <div className="flex gap-x-3 gap-y-2 flex-col items-start flex-wrap sm:grow">
            <Image src='/propely-dark.svg' alt='logo' width={120} height={60} className='flex gap-x-2 gap-y-1 flex-row items-center place-content-start text-sm hover:opacity-70' />
            <p className="max-w-64 text-sm text-muted-foreground">
              Propely — Your trusted platform for managing and discovering properties with ease.
            </p>

            {/* Social Icons */}
            <div className="flex gap-x-3 gap-y-2 flex-row items-center place-content-start flex-wrap mt-4">
              <Link
                href="https://propely.site"
                className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] text-start leading-tight whitespace-nowrap rounded-md hover:z-10 disabled:opacity-60 disabled:pointer-events-none bg-foreground/15 text-foreground hover:bg-foreground/10 px-3 py-2 gap-[0.66ch]"
                aria-label="Website"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              </Link>

              <Link
                href="mailto:hello@propely.site"
                className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] text-start leading-tight whitespace-nowrap rounded-md hover:z-10 disabled:opacity-60 disabled:pointer-events-none bg-foreground/15 text-foreground hover:bg-foreground/10 px-3 py-2 gap-[0.66ch]"
                aria-label="Email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Product, Resources, and Company Columns */}
          <div className="grid grid-cols-3 gap-12 sm:gap-16 mt-5 md:mt-5 lg:mt-0">
            {/* Product Column */}
            <div className="space-y-4">
              <h3 className="font-mono text-[11px] font-medium tracking-wider uppercase text-foreground/50">
                Product
              </h3>

              <ul className="space-y-3">
                {[
                  { label: 'Core Features', href: '#features' },
                  { label: 'Plans & Pricing', href: '#pricing' },
                  { label: 'Product Walkthrough', href: '/features/properties' },
                  { label: 'Solutions', href: '/solutions/landlords' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="
                        group inline-flex items-center gap-1
                        text-xs font-[450] text-foreground
                        transition-all duration-200
                        hover:text-secondary-foreground
                      "
                    >
                      <span className="relative">
                        {item.label}
                        <span
                          className="
                            absolute -bottom-0.5 left-0 h-px w-0
                            bg-current transition-all duration-200
                            group-hover:w-full
                          "
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-4 mb-5">
              <h3 className="font-mono text-[11px] font-medium tracking-wider uppercase text-foreground/50">
                Resources
              </h3>

              <ul className="flex gap-x-3 flex-col items-start flex-wrap gap-y-1.5">
                {[
                  { label: 'Blog', href: '/blog' },
                  { label: 'Case Studies', href: '/case-studies' },
                  { label: 'Templates', href: '/templates' },
                  { label: 'Help Center', href: '/help' },
                  { label: 'Contact Support', href: '/support' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="
                        group inline-flex items-center gap-1
                        text-xs font-[450] text-foreground
                        transition-all duration-200
                        hover:text-secondary-foreground
                      "
                    >
                      <span className="relative">
                        {item.label}
                        <span
                          className="
                            absolute -bottom-0.5 left-0 h-px w-0
                            bg-current transition-all duration-200
                            group-hover:w-full
                          "
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="space-y-4 mb-5">
              <h3 className="font-mono text-[11px] font-medium tracking-wider uppercase text-foreground/50">
                Company
              </h3>

              <ul className="flex gap-x-3 flex-col items-start flex-wrap gap-y-1.5">
                {[
                  { label: 'About Propely', href: '/about' },
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'Blog', href: '/blog' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="
                        group inline-flex items-center gap-1
                        text-xs font-[450] text-foreground
                        transition-all duration-200
                        hover:text-secondary-foreground
                      "
                    >
                      <span className="relative">
                        {item.label}
                        <span
                          className="
                            absolute -bottom-0.5 left-0 h-px w-0
                            bg-current transition-all duration-200
                            group-hover:w-full
                          "
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-wrap items-center justify-start gap-5 border-t pt-5">
          <Link
            href="/privacy"
            className="text-xs font-[450] text-foreground hover:text-secondary-foreground"
          >
            Privacy Policy
          </Link>
          <span className="text-xs text-muted-foreground">•</span>
          <Link
            href="/terms"
            className="text-xs font-[450] text-foreground hover:text-secondary-foreground"
          >
            Terms of Service
          </Link>
          <span className="text-xs text-muted-foreground">•</span>
          <Link
            href="/legal/cookie-policy"
            className="text-xs font-[450] text-foreground hover:text-secondary-foreground"
          >
            Cookie Policy
          </Link>

          <div className="flex-1"></div>

          <span className="text-xs text-muted-foreground">
            © 2026 Propely. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;