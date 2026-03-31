import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon, FacebookIcon, TwitterIcon, LinkedinIcon, Link2Icon } from 'lucide-react'
import ShareButtons from './share-buttons'

const blogPosts = [
  {
    title: '10 Essential Tips for First-Time Landlords',
    excerpt:
      'Starting your journey as a landlord? Learn the fundamental practices that will help you succeed and avoid common pitfalls in property management.',
    content: `
      <h2>1. Understand Local Laws and Regulations</h2>
      <p>Before renting out your property, familiarize yourself with federal, state, and local landlord-tenant laws. These cover everything from fair housing requirements to security deposit limits and eviction procedures.</p>
      
      <h2>2. Set the Right Rental Price</h2>
      <p>Research comparable properties in your area to determine competitive rental rates. Price too high, and you'll struggle to find tenants; price too low, and you'll leave money on the table.</p>
      
      <h2>3. Screen Tenants Thoroughly</h2>
      <p>Implement a comprehensive screening process including credit checks, employment verification, and rental history. This helps ensure you find reliable, responsible tenants.</p>
      
      <h2>4. Create a Solid Lease Agreement</h2>
      <p>Your lease should clearly outline rent amount, due dates, security deposit terms, maintenance responsibilities, pet policies, and rules for the property.</p>
      
      <h2>5. Document Everything</h2>
      <p>Take detailed photos before move-in, conduct regular inspections, and keep records of all communications with tenants. This protects both you and your tenants.</p>
      
      <h2>6. Set Up Efficient Rent Collection</h2>
      <p>Use online payment systems to make rent collection easier and more reliable. Clearly communicate payment methods, due dates, and late fee policies.</p>
      
      <h2>7. Budget for Maintenance and Repairs</h2>
      <p>Set aside 1-2% of your property's value annually for maintenance. Regular upkeep prevents costly emergency repairs and keeps tenants happy.</p>
      
      <h2>8. Get Proper Insurance</h2>
      <p>Standard homeowner's insurance doesn't cover rental properties. Invest in landlord insurance that includes property damage, liability coverage, and loss of rental income.</p>
      
      <h2>9. Know When to Hire Professionals</h2>
      <p>Consider hiring a property manager if you have multiple properties or live far from your rental. Also work with accountants and attorneys who specialize in real estate.</p>
      
      <h2>10. Stay Organized</h2>
      <p>Keep detailed records of income, expenses, leases, and communications. Good organization is key to successful property management and tax preparation.</p>
    `,
    author: 'Sarah Johnson',
    authorRole: 'Senior Property Manager',
    authorBio: 'Sarah has over 15 years of experience in property management, overseeing portfolios of 500+ units across multiple states.',
    authorImage: 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%234f46e5"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3ESJ%3C/text%3E%3C/svg%3E',
    date: 'March 25, 2024',
    isoDate: '2024-03-25',
    readTime: '8 min read',
    category: 'Property Management',
    categorySlug: 'property-management',
    featured: true,
    trending: false,
    slug: 'first-time-landlords-tips',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad1" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad1)"/%3E%3Ccircle cx="200" cy="150" r="80" fill="white" opacity="0.1"/%3E%3Ccircle cx="600" cy="350" r="100" fill="white" opacity="0.1"/%3E%3Crect x="250" y="180" width="300" height="200" rx="15" fill="white" opacity="0.15"/%3E%3C/svg%3E',
  },
  {
    title: 'How to Screen Tenants Effectively',
    excerpt:
      'A comprehensive guide to background checks, credit scores, and finding reliable tenants for your rental properties.',
    content: `
      <h2>Why Tenant Screening Matters</h2>
      <p>Finding the right tenant is one of the most critical aspects of successful property management. A good tenant pays rent on time, takes care of your property, and respects the terms of the lease. A bad tenant can cost you thousands in unpaid rent, property damage, and legal fees.</p>
      
      <h2>Step 1: Create a Rental Application</h2>
      <p>Your application should collect essential information including employment history, income, rental history, and references. Make sure to comply with fair housing laws and get written permission for background checks.</p>
      
      <h2>Step 2: Check Credit History</h2>
      <p>A credit report reveals financial responsibility. Look for a score of 650 or higher, consistent payment history, and reasonable debt-to-income ratio. Red flags include evictions, collections, and bankruptcies.</p>
      
      <h2>Step 3: Verify Income and Employment</h2>
      <p>Request recent pay stubs, tax returns, or bank statements. Contact their employer to confirm employment status and income. A good rule of thumb: monthly income should be at least 3x the rent.</p>
      
      <h2>Step 4: Contact Previous Landlords</h2>
      <p>Ask about payment history, property condition, noise complaints, and whether they would rent to this tenant again. Be wary of applicants who can only provide personal references.</p>
      
      <h2>Step 5: Run a Background Check</h2>
      <p>Criminal background checks help ensure the safety of your property and other tenants. Focus on recent convictions and crimes related to violence, drugs, or property damage.</p>
      
      <h2>Step 6: Interview the Applicant</h2>
      <p>A face-to-face or phone conversation can reveal a lot about a potential tenant. Ask about their lifestyle, reasons for moving, and how they would handle maintenance issues.</p>
      
      <h2>Legal Considerations</h2>
      <p>Always follow fair housing laws and treat all applicants equally. Document your screening criteria and apply them consistently. Provide adverse action notices if you deny an application based on credit or background checks.</p>
    `,
    author: 'Michael Chen',
    authorRole: 'Tenant Screening Specialist',
    authorBio: 'Michael has processed over 10,000 tenant applications and specializes in helping landlords find qualified, reliable tenants.',
    authorImage: 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%2306b6d4"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EMC%3C/text%3E%3C/svg%3E',
    date: 'March 22, 2024',
    isoDate: '2024-03-22',
    readTime: '6 min read',
    category: 'Tenant Tips',
    categorySlug: 'tenant-tips',
    featured: false,
    trending: true,
    slug: 'screen-tenants-effectively',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2306b6d4;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230891b2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad2)"/%3E%3Ccircle cx="150" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Ccircle cx="650" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Crect x="300" y="150" width="200" height="250" rx="20" fill="white" opacity="0.2"/%3E%3C/svg%3E',
  },
  {
    title: 'Preventive Maintenance Checklist for Rental Properties',
    excerpt:
      'Keep your properties in top condition and avoid costly repairs with this seasonal maintenance checklist.',
    content: `
      <h2>Why Preventive Maintenance Matters</h2>
      <p>Regular maintenance protects your investment, keeps tenants happy, and prevents small issues from becoming expensive emergencies. A well-maintained property also commands higher rent and attracts quality tenants.</p>
      
      <h2>Monthly Tasks</h2>
      <ul>
        <li>Test smoke and carbon monoxide detectors</li>
        <li>Check for water leaks under sinks and around toilets</li>
        <li>Inspect HVAC filters and replace if needed</li>
        <li>Walk the property and note any visible issues</li>
      </ul>
      
      <h2>Quarterly Tasks</h2>
      <ul>
        <li>Service HVAC systems</li>
        <li>Clean gutters and downspouts</li>
        <li>Inspect roof for damaged shingles</li>
        <li>Check caulking around windows and doors</li>
        <li>Test garage door openers and safety features</li>
      </ul>
      
      <h2>Seasonal Tasks</h2>
      <p><strong>Spring:</strong> Power wash exterior, service AC unit, check irrigation systems, clean windows.</p>
      <p><strong>Summer:</strong> Inspect deck and patio, trim trees and shrubs, check ceiling fans, service pool equipment.</p>
      <p><strong>Fall:</strong> Clean gutters, winterize irrigation, inspect heating system, check weatherstripping.</p>
      <p><strong>Winter:</strong> Monitor for ice dams, check for drafts, test emergency heat, inspect for pest entry points.</p>
      
      <h2>Annual Tasks</h2>
      <ul>
        <li>Professional roof inspection</li>
        <li>Water heater flushing and inspection</li>
        <li>Deep clean carpets</li>
        <li>Repaint walls as needed</li>
        <li>Service all major appliances</li>
      </ul>
      
      <h2>Document Everything</h2>
      <p>Keep detailed records of all maintenance work, including dates, costs, and contractors used. This helps with budgeting, tax deductions, and demonstrating due diligence if issues arise.</p>
    `,
    author: 'David Martinez',
    authorRole: 'Maintenance Coordinator',
    authorBio: 'David manages maintenance operations for 300+ rental units and has a background in construction and facilities management.',
    authorImage: 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%2310b981"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EDM%3C/text%3E%3C/svg%3E',
    date: 'March 20, 2024',
    isoDate: '2024-03-20',
    readTime: '10 min read',
    category: 'Maintenance',
    categorySlug: 'maintenance',
    featured: false,
    trending: false,
    slug: 'preventive-maintenance-checklist',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2310b981;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad3)"/%3E%3Cpath d="M 400 100 L 500 250 L 400 400 L 300 250 Z" fill="white" opacity="0.1"/%3E%3Ccircle cx="400" cy="250" r="100" fill="none" stroke="white" stroke-width="3" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Understanding Rental Property Tax Deductions',
    excerpt:
      'Maximize your returns by learning about legitimate tax deductions available to property owners.',
    content: `
      <h2>Maximize Your Tax Benefits</h2>
      <p>As a rental property owner, you can deduct many expenses from your taxable rental income. Understanding these deductions can significantly reduce your tax burden and improve your cash flow.</p>
      
      <h2>Common Tax Deductions</h2>
      <ul>
        <li><strong>Mortgage Interest:</strong> Interest on loans used to acquire or improve rental property is fully deductible.</li>
        <li><strong>Property Taxes:</strong> State and local property taxes are deductible as business expenses.</li>
        <li><strong>Insurance:</strong> Premiums for landlord insurance, liability insurance, and mortgage insurance.</li>
        <li><strong>Repairs and Maintenance:</strong> Costs to keep the property in good working condition (not improvements).</li>
        <li><strong>Utilities:</strong> If you pay for utilities, they're deductible even if the tenant uses them.</li>
        <li><strong>Property Management Fees:</strong> Fees paid to management companies or property managers.</li>
        <li><strong>Legal and Professional Fees:</strong> Attorney fees, accountant fees, and tax preparation costs.</li>
        <li><strong>Advertising:</strong> Costs of advertising your rental property.</li>
        <li><strong>Travel Expenses:</strong> Mileage or actual expenses for travel related to your rental activity.</li>
        <li><strong>Home Office:</strong> If you have a dedicated space for managing your rentals.</li>
      </ul>
      
      <h2>Depreciation</h2>
      <p>You can depreciate the cost of the building (not land) over 27.5 years for residential property. This is a significant non-cash deduction that can offset rental income.</p>
      
      <h2>Repairs vs. Improvements</h2>
      <p>Repairs are deducted in the year they're made. Improvements (like a new roof or kitchen remodel) must be capitalized and depreciated over time.</p>
      
      <h2>Keep Good Records</h2>
      <p>Maintain detailed records of all expenses, receipts, and mileage. Use accounting software or hire a bookkeeper to track everything throughout the year.</p>
      
      <h2>Consult a Professional</h2>
      <p>Tax laws are complex and change frequently. Work with a CPA who specializes in real estate to ensure you're maximizing legitimate deductions while staying compliant.</p>
    `,
    author: 'Emily Roberts',
    authorRole: 'Tax Specialist',
    authorBio: 'Emily is a CPA with 20+ years of experience specializing in real estate taxation and investment strategies.',
    authorImage: 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23f59e0b"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EER%3C/text%3E%3C/svg%3E',
    date: 'March 18, 2024',
    isoDate: '2024-03-18',
    readTime: '7 min read',
    category: 'Legal & Finance',
    categorySlug: 'legal-finance',
    featured: false,
    trending: true,
    slug: 'rental-property-tax-deductions',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad4" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f59e0b;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23d97706;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad4)"/%3E%3Crect x="150" y="350" width="80" height="100" fill="white" opacity="0.3"/%3E%3Crect x="250" y="280" width="80" height="170" fill="white" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Digital Marketing Strategies for Rental Properties',
    excerpt:
      'Learn how to attract quality tenants faster with effective online marketing techniques and listing optimization.',
    content: `
      <h2>Market Your Property Effectively</h2>
      <p>In today's digital age, most tenants search for rentals online. A strong digital marketing strategy helps you attract qualified tenants faster and reduce vacancy periods.</p>
      
      <h2>Create Compelling Listings</h2>
      <p>Write detailed, honest descriptions highlighting the property's best features. Include information about the neighborhood, schools, transportation, and amenities. Use keywords tenants are likely to search for.</p>
      
      <h2>Professional Photography</h2>
      <p>High-quality photos are essential. Use good lighting, shoot from multiple angles, and showcase each room's best features. Consider virtual tours or video walkthroughs for premium listings.</p>
      
      <h2>List on Multiple Platforms</h2>
      <p>Post your listing on popular rental sites like Zillow, Apartments.com, Craigslist, and Facebook Marketplace. Each platform reaches different demographics.</p>
      
      <h2>Social Media Marketing</h2>
      <p>Use Facebook, Instagram, and LinkedIn to showcase your properties. Share tenant testimonials, neighborhood highlights, and behind-the-scenes content to build your brand.</p>
      
      <h2>Targeted Advertising</h2>
      <p>Run targeted ads on Facebook and Google to reach specific demographics. You can target by location, income, interests, and life events like job changes or relocations.</p>
      
      <h2>Optimize for Mobile</h2>
      <p>Most renters search on mobile devices. Ensure your listings and application process are mobile-friendly with fast loading times and easy navigation.</p>
      
      <h2>Respond Quickly</h2>
      <p>Respond to inquiries within hours, not days. Use automated responses to acknowledge interest and set expectations for follow-up.</p>
      
      <h2>Track Your Results</h2>
      <p>Monitor which platforms generate the most qualified leads. Adjust your marketing budget based on what works best for your properties and target tenants.</p>
    `,
    author: 'Jessica Lee',
    authorRole: 'Marketing Director',
    authorBio: 'Jessica specializes in digital marketing for real estate and has helped fill over 1,000 rental units through strategic online campaigns.',
    authorImage: 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23ec4899"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EJL%3C/text%3E%3C/svg%3E',
    date: 'March 15, 2024',
    isoDate: '2024-03-15',
    readTime: '5 min read',
    category: 'Marketing',
    categorySlug: 'marketing',
    featured: false,
    trending: false,
    slug: 'digital-marketing-rental-properties',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad5" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ec4899;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23db2777;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad5)"/%3E%3Crect x="200" y="100" width="400" height="300" rx="15" fill="white" opacity="0.15"/%3E%3C/svg%3E',
  },
  {
    title: 'Creating a Seamless Tenant Onboarding Experience',
    excerpt:
      'Set the tone for a great landlord-tenant relationship with a smooth move-in process and clear communication.',
    content: `
      <h2>First Impressions Matter</h2>
      <p>The move-in process sets the tone for your entire landlord-tenant relationship. A smooth, professional onboarding experience leads to happier tenants who are more likely to stay long-term.</p>
      
      <h2>Before Move-In Day</h2>
      <p>Send a welcome email with move-in instructions, including date, time, key pickup details, and utility transfer information. Provide a checklist of tasks they need to complete before arrival.</p>
      
      <h2>Prepare the Property</h2>
      <p>Ensure the property is spotlessly clean and all repairs are completed. Replace air filters, test all appliances, and stock basic supplies like toilet paper and trash bags as a welcome gesture.</p>
      
      <h2>Create a Welcome Packet</h2>
      <p>Include lease copies, move-in inspection forms, emergency contact information, trash collection schedules, and neighborhood guides. Digital packets via email or a tenant portal work well.</p>
      
      <h2>Conduct a Walkthrough</h2>
      <p>Meet tenants at the property for a detailed walkthrough. Document the condition with photos and videos. Have them sign a move-in inspection report noting any existing issues.</p>
      
      <h2>Explain Systems and Appliances</h2>
      <p>Show tenants how to operate the thermostat, water heater, security system, and major appliances. Provide manuals and warranty information.</p>
      
      <h2>Set Communication Expectations</h2>
      <p>Explain how to submit maintenance requests, preferred communication methods, and typical response times. Provide after-hours emergency contact information.</p>
      
      <h2>Follow Up</h2>
      <p>Check in after the first week to address any questions or concerns. A quick call or email shows you care about their experience and catches issues early.</p>
      
      <h2>Build a Relationship</h2>
      <p>Treat tenants as valued customers, not just rent payers. Responsive communication and respect go a long way toward creating positive, long-term relationships.</p>
    `,
    author: 'Sarah Johnson',
    authorRole: 'Senior Property Manager',
    authorBio: 'Sarah has over 15 years of experience in property management, overseeing portfolios of 500+ units across multiple states.',
    authorImage: 'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%234f46e5"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3ESJ%3C/text%3E%3C/svg%3E',
    date: 'March 12, 2024',
    isoDate: '2024-03-12',
    readTime: '6 min read',
    category: 'Tenant Tips',
    categorySlug: 'tenant-tips',
    featured: false,
    trending: false,
    slug: 'tenant-onboarding-experience',
    image: 'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad6" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%238b5cf6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%236d28d9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad6)"/%3E%3Ccircle cx="400" cy="200" r="80" fill="white" opacity="0.2"/%3E%3C/svg%3E',
  },
]

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug && p.categorySlug === post.categorySlug)
    .slice(0, 2)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            url: `https://propely.com/blog/${post.slug}`,
            datePublished: post.isoDate,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Propely',
              logo: { '@type': 'ImageObject', url: 'https://propely.com/logo.png' },
            },
          }),
        }}
      />

      <article className="relative w-full py-16 sm:py-20 md:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Back to blog link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to blog
          </Link>

          {/* Category badge */}
          <div className="mb-6">
            <Link
              href={`/blog?category=${post.categorySlug}`}
              className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300"
            >
              {post.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={post.isoDate}>{post.date}</time>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Featured image */}
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Share buttons - top */}
          <div className="mb-8">
            <ShareButtons title={post.title} />
          </div>

          {/* Content */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author bio */}
          <div className="rounded-xl bg-muted p-6 mb-12">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                  src={post.authorImage}
                  alt={post.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {post.author}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{post.authorRole}</p>
                <p className="text-sm text-foreground/80">{post.authorBio}</p>
              </div>
            </div>
          </div>

          {/* Share buttons - bottom */}
          <div className="mb-12">
            <ShareButtons title={post.title} />
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Related articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-background transition hover:border-foreground/30 hover:shadow-lg"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          {relatedPost.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  )
}
