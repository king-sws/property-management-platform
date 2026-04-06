/* eslint-disable react/no-unescaped-entities */
'use client'
import React from 'react';
import Image from 'next/image';

const TestimonialsSection = () => {
  const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "Managing a mixed-use portfolio used to be a spreadsheet nightmare. Propely centralized our maintenance workflows and improved our response time by 40%. It's an essential part of our operations now.",
    author: "Omar El Amrani",
    company: "Atlas Asset Management",
    avatar: "/images/dudu.webp",
  },
  {
    id: 2,
    rating: 5,
    text: "The automated rent collection changed the game for us. We went from chasing checks to 98% on-time digital payments within the first two months. The ROI on the subscription was immediate.",
    author: "Sarah K. Jenkins",
    company: "Summit Residential Group",
    avatar: "/images/avatar-2.png",
  },
  {
    id: 3,
    rating: 5,
    text: "Propely’s tenant screening is the most thorough I’ve used. It integrates credit, criminal, and eviction history into a single report that actually helps us make better placement decisions.",
    author: "Marcus Thorne",
    company: "Thorne Realty Partners",
    avatar: "/images/avatar-6.png",
  },
  {
    id: 4,
    rating: 5,
    text: "What I appreciate most is the vendor portal. Being able to send work orders and receive invoices in one thread saves my team roughly 10 hours of admin work every single week.",
    author: "Elena Rodriguez",
    company: "Coastal Living Rentals",
    avatar: "/images/avatar-4.png",
  },
  {
    id: 5,
    rating: 5,
    text: "Finally, a platform that understands the needs of modern landlords. The financial reporting is clean, tax-ready, and significantly more intuitive than the enterprise software we were using before.",
    author: "David Chen",
    company: "Metro Property Advisors",
    avatar: "/images/avatar-8.png",
  },
  {
    id: 6,
    rating: 5,
    text: "The document storage and automated lease renewals keep us compliant and organized. I no longer worry about missing a deadline or losing a signed addendum. Highly reliable.",
    author: "Linda Foster",
    company: "Foster & Co. Real Estate",
    avatar: "/images/avatar-3.png",
  },
  {
    id: 7,
    rating: 5,
    text: "Transitioning our 40 units to Propely was seamless. Their support team actually knows the industry, and the UI is so clean that our older tenants had zero issues using the portal.",
    author: "Robert Miller",
    company: "Blue Chip Management",
    avatar: "/images/avatar-5.png",
  },
  {
    id: 8,
    rating: 5,
    text: "As a small shop, we needed something powerful but affordable. Propely gives us the same tools as the big firms without the massive overhead. It’s helped us scale our business faster.",
    author: "Sofia Alami",
    company: "Alami Property Services",
    avatar: "/images/avatar-7.png",
  },
  {
    id: 9,
    rating: 5,
    text: "The inspection module is brilliant. Taking photos on-site and having them automatically attached to the move-out report has settled three security deposit disputes in our favor this year alone.",
    author: "Jameson Wright",
    company: "Wright Choice Rentals",
    avatar: "/images/dudu.webp",
  },
  {
    id: 10,
    rating: 5,
    text: "Propely isn't just software; it's a productivity multiplier. Our property managers can now handle double the units they used to because the manual tasks are all automated.",
    author: "Nadia Benson",
    company: "Urban Core Property Group",
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
