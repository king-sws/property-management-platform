'use client'
import React from 'react';
import Image from 'next/image';
import { Meteors } from '../ui/meteors';
import Link from 'next/link';

const HeroSection = () => {
  // Generate random stars
  const generateStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
    }));
  };

  const stars = generateStars(150);

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-rainbow {
          animation: rainbow 6s linear infinite;
        }
      `}</style>

      <section className="relative w-full min-h-screen flex items-center">
          {/* Radial gradient overlay - lighter at top only */}
          <div className="absolute top-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_top_center,#1a2642_0%,#0a1120_40%,transparent_80%)]"></div>

          {/* Meteors - random from all edges and directions */}
          <Meteors count={8} />

          {/* Stars */}
          <div className="absolute inset-0">
            {stars.map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: star.left,
                  top: star.top,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                }}
              />
            ))}
          </div>

        {/* Content */}
        <div className="relative container z-10  px-4 sm:px-6 lg:px-8 pt-35 lg:pt-50 ">
          <div className="flex w-full flex-col gap-y-4 items-center text-center">
            {/* Eyebrow text */}
            <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase [[href]]:hover:text-foreground/75 text-[12px] -mb-2">
              Built with a modern, battle-tested tech stack
            </p>

            {/* Main headline */}
            <h1 className="font-display font-medium text-pretty text-4xl tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl max-w-[13em]">
              Manage, automate, and scale your property operations          
            </h1>

            {/* Subheadline */}
            <p className="text-pretty text-[#b4b4b5] [word-break:break-word] md:text-lg [&_a]:font-semibold [&_a]:text-foreground [&_a]:hover:text-foreground/85 max-w-[40em]">
              Propely helps property managers streamline operations, stay organized, and manage portfolios with confidence.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
  <Link href="/sign-up">
    <button className="group/button inline-flex items-center justify-center gap-2 font-medium text-base sm:text-lg leading-tight whitespace-nowrap hover:z-10 relative text-background animate-rainbow hover:opacity-85 bg-[linear-gradient(var(--foreground),var(--foreground)),linear-gradient(var(--background)_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)] bg-size-[200%] [background-clip:padding-box,border-box,border-box] bg-origin-border [border:calc(0.125rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)] before:filter-[blur(0.75rem)] px-8 py-4 rounded-lg w-full">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 216 251" 
        role="img" 
        aria-label="Logo" 
        className="w-5 h-5 sm:w-6 sm:h-6 fill-current"
      >
        <path d="M0 105v93c0 3.18.29 6.35 2.53 8.6l42.25 42.24C48.56 252.62 55 250.34 55 245v-93c0-3.19-1.05-6.36-3.31-8.62l-42.6-42.6C5.28 96.97-.02 99.64 0 105Zm74-49v132c0 3.18.79 6.14 3.03 8.38l42.25 42.24c3.77 3.78 10.72.73 10.72-4.62V103c0-3.18-1.55-6.5-3.8-8.76L83.56 51.62C79.8 47.84 74 50.66 74 56Zm74-50v155c0 3.18.84 6.6 3.08 8.85l54.99 54.98c3.78 3.78 9.93 1.02 9.93-4.33v-155c0-3.18-.76-6.1-3.01-8.36L157.62 1.77C153.84-2 148 .66 148 6Z"/>
      </svg>
      Start Managing Today
    </button>
  </Link>
</div>

            {/* Discount badge */}
            <div className="flex gap-x-2 gap-y-1 flex-row items-center place-content-start flex-wrap font-medium text-sm text-secondary-foreground text-center">
              <span className="flex gap-x-1 gap-y-0.5 flex-row items-center justify-end place-content-start flex-wrap font-medium text-green-500/80 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gift" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg> 
                <span className="text-green-500/80">20% off</span>
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">first 200 customers</span>
              <span className="inline-flex items-center rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums">
                3 left
              </span>
            </div>
          </div>

          {/* Dashboard Preview Image */}
          <div className="relative isolate sm:mt-20 mt-10 mb-fluid-lg container">
            <div className="flex flex-wrap items-center justify-center text-center gap-y-1 mt-2 -space-x-1.5 absolute z-20 bottom-6 left-1/2 -translate-x-1/2">
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
                  100+ happy customers
                </span>
              </div>
            </div>
            </div>
            
            <div className="relative rounded-t-xl overflow-hidden border-x border-t border-gray-800/50 shadow-2xl">
              <Image
                src="/dashboard-dark.webp"
                alt="Dashboard Preview"
                width={1024}
                height={1000}
                className="w-full max-h-96 aspect-2-1 object-cover object-top rounded-t-xl ring-8 ring-foreground/10 select-none opacity-90 md:rounded-t-2xl"
                priority
              />
            </div>

            {/* Bottom fade to dark */}
            <div className="absolute inset-0 z-10 bg-linear-to-b from-transparent from-50% to-background pointer-events-none"></div>
          </div>
        </div>

        {/* Darker vignette edges - for the dark edge effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_50%,#000000_100%)] pointer-events-none"></div>
      </section>
    </>
  );
};

export default HeroSection;