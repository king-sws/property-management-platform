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
              Next.js directory template for building profitable directory websites.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-x-3 gap-y-2 flex-row items-center place-content-start flex-wrap mt-4">
              <Link
                href="https://github.com"
                className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] text-start leading-tight whitespace-nowrap rounded-md hover:z-10 disabled:opacity-60 disabled:pointer-events-none bg-foreground/15 text-foreground hover:bg-foreground/10 px-3 py-2 gap-[0.66ch]"
                aria-label="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </Link>

              <Link
                href="https://twitter.com"
                className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] text-start leading-tight whitespace-nowrap rounded-md hover:z-10 disabled:opacity-60 disabled:pointer-events-none bg-foreground/15 text-foreground hover:bg-foreground/10 px-3 py-2 gap-[0.66ch]"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>

              <Link
                href="https://bsky.app"
                className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] text-start leading-tight whitespace-nowrap rounded-md hover:z-10 disabled:opacity-60 disabled:pointer-events-none bg-foreground/15 text-foreground hover:bg-foreground/10 px-3 py-2 gap-[0.66ch]"
                aria-label="Bluesky"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"></path>
                </svg>
              </Link>

              <Link
                href="mailto:hello@dirstarter.com"
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

          {/* Product Column */}
          <div className="grid grid-cols-2 gap-12 sm:gap-16 mt-5 md:mt-5 lg:mt-0">
  {/* Product Column */}
  <div className="space-y-4">
    <h3 className="font-mono text-[11px] font-medium tracking-wider uppercase text-foreground/50">
      Product
    </h3>

    <ul className="space-y-3">
      {[
        { label: 'Buy Now', href: '#pricing' },
        { label: 'Demo', href: '#demo' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Features', href: '#features' },
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
        { label: 'Showcase', href: '/showcase' },
        { label: 'Changelog', href: '/changelog' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Become an Affiliate', href: '/affiliate' },
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
          <Link 
            href="/terms" 
            className="text-xs font-[450] text-foreground hover:text-secondary-foreground"
          >
            Terms of Service
          </Link>
          <Link 
            href="/license" 
            className="text-xs font-[450] text-foreground hover:text-secondary-foreground"
          >
            License Policy
          </Link>
          
          <span className="text-xs text-muted-foreground">
            © 2026 Dirstarter. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;