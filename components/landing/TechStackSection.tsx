'use client'
import React from 'react';
import Image from 'next/image';

const TechStackSection = () => {
  const techStack = [
    { name: 'JJ', logo: '/JJ.png' },
    { name: 'merck', logo: '/merck.png' },
    { name: 'amazon', logo: '/amazon.png' },
    { name: 'dell', logo: '/dell.png' },

  ];

  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24 bg-white">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Eyebrow text */}
          <p className="font-mono font-medium tracking-wider text-foreground/50 dark:text-[#888788] uppercase [[href]]:hover:text-foreground/75 text-[12px] -mb-2">
            TRUSTED BY PROFESSIONALS
          </p>

          {/* Title */}
          <h2 className="font-display font-medium text-[#131112] text-3xl tracking-tighter md:text-4xl">
            Powered by industry-leading technology
          </h2>

          {/* Tech logos */}
          <div className="w-full flex flex-wrap gap-x-12 gap-y-6 items-center justify-center lg:gap-x-16 mt-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                <Image
  src={tech.logo}
  alt={tech.name}
  width={200}
  height={80}
  className="max-h-14 md:max-h-30 w-auto object-contain grayscale hover:grayscale-0 transition-all"
/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;