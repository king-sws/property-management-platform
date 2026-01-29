/* eslint-disable react/no-unescaped-entities */
'use client'
import React from 'react';
import Image from 'next/image';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      rating: 5,
      text: "Propely has completely transformed how I manage my rental properties. The maintenance tracking and vendor coordination alone save me hours every week. Highly recommend!",
      author: "Sarah Mitchell",
      company: "Mitchell Properties",
      avatar: "/images/dudu.webp",
    },
    {
      id: 2,
      rating: 5,
      text: "Finally, a property management system that actually works! The tenant screening is thorough, rent collection is automated, and the financial reports are exactly what I need for tax season. Best investment I've made for my business.",
      author: "James Rodriguez",
      company: "Urban Living Rentals",
      avatar: "/images/avatar-2.png",
    },
    {
      id: 3,
      rating: 5,
      text: "As someone managing 15 units, Propely is a game-changer. The lease management and automated notifications keep everything running smoothly. My tenants love the portal too!",
      author: "Emily Chen",
      company: "Chen Property Group",
      avatar: "/images/avatar-6.png",
    },
    {
      id: 4,
      rating: 5,
      text: "I'm really impressed by the attention to detail. Every feature I need is here - from application tracking to expense categorization. The vendor invoice system is particularly brilliant! 🎉",
      author: "Michael Thompson",
      company: "Thompson Residential",
      avatar: "/images/avatar-4.png",
    },
    {
      id: 5,
      rating: 5,
      text: "Best property management platform I've used. Clean interface, powerful features, and excellent support. Managing my properties has never been easier. 5 stars ⭐",
      author: "Lisa Anderson",
      company: "Anderson Estates",
      avatar: "/images/avatar-8.png",
    },
    {
      id: 6,
      rating: 5,
      text: "The automated rent collection and late fee tracking have improved my cash flow significantly. Plus, having all documents in one secure place is invaluable. Love this platform!",
      author: "David Park",
      company: "Park Property Management",
      avatar: "/images/avatar-3.png",
    },
    {
      id: 7,
      rating: 5,
      text: "Switched from spreadsheets and it's like night and day. The financial reporting, maintenance tracking, and tenant communication tools are exactly what landlords need. Respect!",
      author: "Rachel Green",
      company: "Green Rentals LLC",
      avatar: "/images/avatar-5.png",
    },
    {
      id: 8,
      rating: 5,
      text: "The inspection checklists and photo documentation features have saved me from several disputes. Everything is timestamped and organized. This is professional-grade software! 🎉",
      author: "Marcus Johnson",
      company: "Johnson Property Services",
      avatar: "/images/avatar-7.png",
    },
    // Duplicate for continuous scroll
{
  id: 9,
  rating: 5,
  text: "Propely completely changed how we manage our portfolio. From tracking maintenance requests to coordinating vendors, everything is finally in one place. What used to take hours every week now takes minutes.",
  author: "Emma Collins",
  company: "Collins Property Group",
  avatar: "/images/dudu.webp",
},
{
  id: 10,
  rating: 5,
  text: "We’ve tried multiple property management tools, but Propely is the first one that truly fits our workflow. Automated rent collection, clear financial reports, and smooth tenant management — it just works.",
  author: "Daniel Perez",
  company: "UrbanStay Management",
  avatar: "/images/tiago.webp",
},

  ];

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={i < rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={i < rating ? "text-yellow-400" : "text-gray-300"}
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="w-full scroll-mt-8 bg-background text-foreground py-16 sm:py-20 md:py-24">
      <div className="container max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex w-full flex-col gap-y-4 items-center text-center px-4">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase [&[href]]:hover:text-foreground/75 text-[12px] -mb-2">
            TESTIMONIALS
          </p>

          <h2 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Trusted by property managers nationwide
          </h2>

          <p className="text-pretty text-muted-foreground [word-break:break-word] md:text-lg [&_a]:font-semibold [&_a]:text-foreground [&_a]:hover:text-foreground/85 max-w-2xl mb-10">
            Join hundreds of landlords and property managers who have streamlined their operations
            and improved their bottom line with Propely.
          </p>
        </div>

        {/* First Row - Scrolling Left to Right */}
        <div className="group overflow-clip mask-l-from-90 mask-r-from-90">
          <div 
            className="flex gap-6 w-max animate-marquee group-hover:paused"
            style={{ animationDuration: '95.84s', animationDirection: 'normal' }}
          >
            {testimonials.slice(0, 10).map((testimonial) => (
              <div
                key={`row1-${testimonial.id}`}
                className="flex flex-col gap-4 w-80 bg-foreground/5 rounded-xl p-6 shrink-0"
              >
                <StarRating rating={testimonial.rating} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Row - Scrolling Right to Left */}
        <div className="group overflow-clip mask-l-from-90 mask-r-from-90">
          <div 
            className="flex gap-6 w-max animate-marquee group-hover:paused"
            style={{ animationDuration: '95.84s', animationDirection: 'reverse' }}
          >
            {testimonials.slice(0, 10).map((testimonial) => (
              <div
                key={`row2-${testimonial.id}`}
                className="flex flex-col gap-4 w-80 bg-foreground/5 rounded-xl p-6 shrink-0"
              >
                <StarRating rating={testimonial.rating} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </section>
  );
};

export default TestimonialsSection;