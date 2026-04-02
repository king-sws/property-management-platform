import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react'
import ShareButtons from './share-buttons'

const blogPosts = [
  {
    title: '10 Essential Tips for First-Time Landlords',
    excerpt:
      'Starting your journey as a landlord? Learn the fundamental practices that will help you succeed and avoid common pitfalls in property management.',
    content: `
  <h2>1. Understand Local Laws and Regulations</h2>
  <p>Before renting out your property, familiarize yourself with federal, state, and local landlord-tenant laws. These cover everything from fair housing requirements to security deposit limits and eviction procedures. Ignorance of the law is not a valid defense, and violations can result in costly fines or lawsuits. Join a local landlord association to stay current on regulatory changes in your area.</p>

  <h2>2. Set the Right Rental Price</h2>
  <p>Research comparable properties in your area to determine competitive rental rates. Price too high and you'll struggle to find tenants; price too low and you'll leave money on the table. Use tools like Zillow, Rentometer, or local MLS data to benchmark your pricing. Factor in your mortgage, taxes, insurance, and desired profit margin when determining your floor price.</p>

  <h2>3. Screen Tenants Thoroughly</h2>
  <p>Implement a comprehensive screening process including credit checks, employment verification, and rental history. This helps ensure you find reliable, responsible tenants. Always apply your screening criteria consistently to every applicant to comply with fair housing laws. A thorough screening process can save you thousands in lost rent and property damage down the line.</p>

  <h2>4. Create a Solid Lease Agreement</h2>
  <p>Your lease should clearly outline rent amount, due dates, security deposit terms, maintenance responsibilities, pet policies, and rules for the property. Have an attorney review your lease template to ensure it complies with local laws. A well-written lease protects both you and your tenant and serves as the foundation for the entire rental relationship.</p>

  <h2>5. Document Everything</h2>
  <p>Take detailed photos and videos before move-in, conduct regular inspections, and keep records of all communications with tenants. This protects both parties in the event of a dispute. Use a move-in inspection form signed by both parties to establish a baseline condition for the property. Store all records digitally for easy retrieval — platforms like Propely make this seamless.</p>

  <h2>6. Set Up Efficient Rent Collection</h2>
  <p>Use online payment systems to make rent collection easier and more reliable. Clearly communicate payment methods, due dates, and late fee policies from day one. Propely's built-in payment tracking creates automatic paper trails and sends reminders so you never have to chase payments manually. Consistent, on-time rent collection is critical to maintaining healthy cash flow.</p>

  <h2>7. Budget for Maintenance and Repairs</h2>
  <p>Set aside 1–2% of your property's value annually for maintenance. Regular upkeep prevents costly emergency repairs and keeps tenants happy. Create a reserve fund specifically for unexpected expenses like HVAC failures or roof leaks. Proactive maintenance extends the life of major systems and preserves your property's value over time.</p>

  <h2>8. Get Proper Insurance</h2>
  <p>Standard homeowner's insurance doesn't cover rental properties. Invest in landlord insurance that includes property damage, liability coverage, and loss of rental income. Consider also requiring tenants to carry renters insurance, which protects their belongings and reduces your liability exposure in case of accidents.</p>

  <h2>9. Know When to Hire Professionals</h2>
  <p>Consider hiring a property manager if you have multiple properties or live far from your rental. Also work with accountants and attorneys who specialize in real estate. The cost of professional help is usually offset by avoided mistakes, better tenant retention, and more efficient operations. Build a reliable network of contractors for repairs before you need them urgently.</p>

  <h2>10. Stay Organized</h2>
  <p>Keep detailed records of income, expenses, leases, and communications. Good organization is key to successful property management and tax preparation. Propely centralizes all your records and automates routine tasks so you spend less time on admin and more time growing your portfolio. Treat your rental like the business it is from day one.</p>
`,
    author: 'Sarah Johnson',
    authorRole: 'Senior Property Manager',
    authorBio:
      'Sarah has over 15 years of experience in property management, overseeing portfolios of 500+ units across multiple states. She now writes for Propely to help landlords build smarter, more profitable rental businesses.',
    authorImage:
      'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%234f46e5"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3ESJ%3C/text%3E%3C/svg%3E',
    date: 'March 25, 2024',
    isoDate: '2024-03-25',
    readTime: '8 min read',
    category: 'Property Management',
    categorySlug: 'property-management',
    featured: true,
    trending: false,
    slug: 'first-time-landlords-tips',
    image:
'/images/10.png'  },
  {
    title: 'How to Screen Tenants Effectively',
    excerpt:
      'A comprehensive guide to background checks, credit scores, and finding reliable tenants for your rental properties.',
    content: `
  <h2>Why Tenant Screening Matters</h2>
  <p>Finding the right tenant is one of the most critical aspects of successful property management. A good tenant pays rent on time, takes care of your property, and respects the terms of the lease. A bad tenant can cost you thousands in unpaid rent, property damage, and legal fees. Investing time upfront in thorough screening saves enormous headaches later and protects your investment long-term.</p>

  <h2>Step 1: Create a Rental Application</h2>
  <p>Your application should collect essential information including employment history, income, rental history, and references. Make sure to comply with fair housing laws and get written permission for background and credit checks. Use a standardized application form for all applicants to ensure consistency and legal compliance. Never ask questions related to protected classes such as race, religion, familial status, or national origin.</p>

  <h2>Step 2: Check Credit History</h2>
  <p>A credit report reveals financial responsibility. Look for a score of 650 or higher, consistent payment history, and a reasonable debt-to-income ratio. Red flags include recent evictions, accounts in collections, or bankruptcies within the last few years. A low score alone isn't disqualifying — review the full picture and consider whether the applicant can explain any negative marks.</p>

  <h2>Step 3: Verify Income and Employment</h2>
  <p>Request recent pay stubs, tax returns, or bank statements to verify income. Contact their employer directly to confirm employment status and salary. A good rule of thumb is that monthly gross income should be at least 3x the monthly rent. For self-employed applicants, two years of tax returns and recent bank statements are a reliable substitute for pay stubs.</p>

  <h2>Step 4: Contact Previous Landlords</h2>
  <p>Ask about payment history, how they maintained the property, any noise complaints, and whether the landlord would rent to this person again. Be wary of applicants who can only provide personal references rather than prior landlords. If a previous landlord is unusually vague or reluctant to answer, treat that as a potential red flag worth investigating further.</p>

  <h2>Step 5: Run a Background Check</h2>
  <p>Criminal background checks help ensure the safety of your property and other tenants. Focus on recent convictions and crimes related to violence, drugs, or property destruction. Note that blanket policies against renting to anyone with a criminal record may violate fair housing laws in some jurisdictions — consult local regulations before setting your policy.</p>

  <h2>Step 6: Interview the Applicant</h2>
  <p>A face-to-face or phone conversation can reveal a great deal about a potential tenant. Ask about their lifestyle, reasons for moving, pet ownership, and how they would handle maintenance issues. Listen for consistency with what they wrote on their application. Trust your instincts — a professional, communicative applicant is often a reliable tenant.</p>

  <h2>Legal Considerations</h2>
  <p>Always follow fair housing laws and treat all applicants equally regardless of background. Document your screening criteria in writing and apply them consistently to every applicant. If you deny an application based on credit or background check results, you are legally required to send an adverse action notice explaining the decision. Keeping thorough records protects you if a denial is ever challenged.</p>
`,
    author: 'Michael Chen',
    authorRole: 'Tenant Screening Specialist',
    authorBio:
      'Michael has processed over 10,000 tenant applications and specializes in helping landlords find qualified, reliable tenants. He contributes regularly to the Propely blog on screening best practices and fair housing compliance.',
    authorImage:
      'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%2306b6d4"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EMC%3C/text%3E%3C/svg%3E',
    date: 'March 22, 2024',
    isoDate: '2024-03-22',
    readTime: '6 min read',
    category: 'Tenant Tips',
    categorySlug: 'tenant-tips',
    featured: false,
    trending: true,
    slug: 'screen-tenants-effectively',
    image:
      'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad2" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2306b6d4;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230891b2;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad2)"/%3E%3Ccircle cx="150" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Ccircle cx="650" cy="250" r="120" fill="white" opacity="0.1"/%3E%3Crect x="300" y="150" width="200" height="250" rx="20" fill="white" opacity="0.2"/%3E%3C/svg%3E',
  },
  {
    title: 'Preventive Maintenance Checklist for Rental Properties',
    excerpt:
      'Keep your properties in top condition and avoid costly repairs with this seasonal maintenance checklist.',
    content: `
  <h2>Why Preventive Maintenance Matters</h2>
  <p>Regular maintenance protects your investment, keeps tenants happy, and prevents small issues from becoming expensive emergencies. A well-maintained property commands higher rent, attracts quality tenants, and experiences lower vacancy rates. Studies suggest that every dollar spent on preventive maintenance saves three to four dollars in emergency repair costs. Make maintenance a scheduled priority, not an afterthought.</p>

  <h2>Monthly Tasks</h2>
  <p>Staying on top of small monthly tasks prevents them from snowballing into larger problems. Each month, you or your property manager should complete the following:</p>
  <ul>
    <li>Test smoke and carbon monoxide detectors and replace batteries as needed</li>
    <li>Check for water leaks under sinks, around toilets, and near water heaters</li>
    <li>Inspect HVAC filters and replace if dirty or clogged</li>
    <li>Walk the exterior of the property and note any visible damage or hazards</li>
    <li>Check that all exterior lights are working and replace bulbs if needed</li>
  </ul>

  <h2>Quarterly Tasks</h2>
  <p>Every three months, conduct a more thorough inspection of the property's systems and structure. Quarterly checks help you catch seasonal wear before it becomes a costly repair:</p>
  <ul>
    <li>Service HVAC systems and have filters professionally inspected</li>
    <li>Clean gutters and downspouts to prevent water damage</li>
    <li>Inspect the roof for damaged or missing shingles</li>
    <li>Check caulking around windows, doors, and tubs for gaps or cracks</li>
    <li>Test garage door openers and verify safety reversal features are working</li>
    <li>Inspect plumbing for slow drains, corrosion, or unusual water pressure</li>
  </ul>

  <h2>Seasonal Tasks</h2>
  <p>Each season brings unique maintenance demands. Addressing them proactively prevents damage and keeps your tenants comfortable year-round.</p>
  <p><strong>Spring:</strong> Power wash the exterior, service the AC unit before summer heat arrives, check irrigation systems for leaks, and clean windows inside and out.</p>
  <p><strong>Summer:</strong> Inspect decks and patios for rot or loose boards, trim trees and shrubs away from the structure, check ceiling fans for wobble or noise, and service pool or spa equipment if applicable.</p>
  <p><strong>Fall:</strong> Clean gutters after leaves drop, winterize irrigation systems, have the heating system inspected and serviced, and check weatherstripping on all exterior doors and windows.</p>
  <p><strong>Winter:</strong> Monitor the roof for ice dams, check for drafts around windows and doors, test emergency heating systems, and inspect the foundation and basement for moisture intrusion or pest entry points.</p>

  <h2>Annual Tasks</h2>
  <p>Once a year, schedule professional inspections for the major systems of your property:</p>
  <ul>
    <li>Professional roof inspection and flashing check</li>
    <li>Water heater flushing, anode rod inspection, and pressure relief valve test</li>
    <li>Deep cleaning of carpets or refinishing of hardwood floors</li>
    <li>Repainting walls or touching up exterior paint as needed</li>
    <li>Servicing all major appliances including dishwasher, oven, and refrigerator</li>
  </ul>

  <h2>Document Everything</h2>
  <p>Keep detailed records of all maintenance work, including dates, costs, contractor names, and warranty information. Propely's maintenance log lets you attach invoices, photos, and notes to each job — making it easy to track history, support tax deductions, and demonstrate due diligence if disputes arise.</p>
`,
    author: 'David Martinez',
    authorRole: 'Maintenance Coordinator',
    authorBio:
      'David manages maintenance operations for 300+ rental units and has a background in construction and facilities management. He writes for Propely on practical maintenance strategies that save landlords time and money.',
    authorImage:
      'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%2310b981"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EDM%3C/text%3E%3C/svg%3E',
    date: 'March 20, 2024',
    isoDate: '2024-03-20',
    readTime: '10 min read',
    category: 'Maintenance',
    categorySlug: 'maintenance',
    featured: false,
    trending: false,
    slug: 'preventive-maintenance-checklist',
    image:
      'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad3" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2310b981;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23059669;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad3)"/%3E%3Cpath d="M 400 100 L 500 250 L 400 400 L 300 250 Z" fill="white" opacity="0.1"/%3E%3Ccircle cx="400" cy="250" r="100" fill="none" stroke="white" stroke-width="3" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Understanding Rental Property Tax Deductions',
    excerpt:
      'Maximize your returns by learning about legitimate tax deductions available to property owners.',
    content: `
  <h2>Maximize Your Tax Benefits</h2>
  <p>As a rental property owner, you can deduct many expenses from your taxable rental income. Understanding these deductions can significantly reduce your tax burden and improve your overall cash flow. The IRS treats rental activity as a business, which means most ordinary and necessary expenses are deductible. Taking full advantage of these deductions is one of the most powerful financial levers available to landlords.</p>

  <h2>Common Tax Deductions</h2>
  <p>The following expenses are generally deductible in the year they are incurred:</p>
  <ul>
    <li><strong>Mortgage Interest:</strong> Interest on loans used to acquire or improve rental property is fully deductible and is often the largest single deduction for most landlords.</li>
    <li><strong>Property Taxes:</strong> State and local property taxes are deductible as ordinary business expenses.</li>
    <li><strong>Insurance:</strong> Premiums for landlord insurance, liability insurance, flood insurance, and mortgage insurance are all deductible.</li>
    <li><strong>Repairs and Maintenance:</strong> Costs to keep the property in good working condition are deductible — as long as they are repairs, not capital improvements.</li>
    <li><strong>Utilities:</strong> If you pay for utilities such as water, trash, or gas, they are deductible even if the tenant ultimately uses them.</li>
    <li><strong>Property Management Fees:</strong> Fees paid to a management company or professional property manager are fully deductible.</li>
    <li><strong>Legal and Professional Fees:</strong> Attorney fees, accountant fees, and tax preparation costs directly related to your rental activity are deductible.</li>
    <li><strong>Advertising:</strong> The cost of listing your property on rental platforms, placing ads, or creating marketing materials is deductible.</li>
    <li><strong>Travel Expenses:</strong> Mileage or actual costs for travel to and from your rental property for management or maintenance purposes are deductible.</li>
    <li><strong>Software Subscriptions:</strong> Property management software like Propely qualifies as a deductible business expense, including any fees for payment processing or tenant screening tools.</li>
  </ul>

  <h2>Depreciation</h2>
  <p>Depreciation is one of the most valuable deductions available to rental property owners. You can depreciate the cost of the building — not the land — over 27.5 years for residential rental property. This is a significant non-cash deduction that can offset taxable rental income even when the property is actually appreciating in value. Consult a tax professional to ensure you are calculating depreciation correctly and capturing it each year.</p>

  <h2>Repairs vs. Improvements</h2>
  <p>The distinction between repairs and improvements is crucial for tax purposes. Repairs — such as fixing a leaky faucet or patching drywall — are deducted in the year they are made. Improvements — such as adding a new roof, replacing all windows, or renovating a kitchen — must be capitalized and depreciated over time rather than deducted immediately. Misclassifying these can trigger an audit, so document the nature of each expense carefully.</p>

  <h2>Keep Good Records</h2>
  <p>Maintain detailed records of all expenses, receipts, invoices, and mileage logs throughout the year. Propely's expense tracking automatically categorizes spending so you arrive at tax season fully prepared, with clean reports ready to hand to your accountant.</p>

  <h2>Consult a Professional</h2>
  <p>Tax laws are complex, change frequently, and vary by state. Work with a CPA who specializes in real estate investment to ensure you are maximizing every legitimate deduction while staying fully compliant with current regulations.</p>
`,
    author: 'Emily Roberts',
    authorRole: 'Real Estate Tax Specialist',
    authorBio:
      'Emily is a CPA with 20+ years of experience specializing in real estate taxation and investment strategies. She advises landlords and property investors on maximizing returns while staying compliant.',
    authorImage:
      'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23f59e0b"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EER%3C/text%3E%3C/svg%3E',
    date: 'March 18, 2024',
    isoDate: '2024-03-18',
    readTime: '7 min read',
    category: 'Legal & Finance',
    categorySlug: 'legal-finance',
    featured: false,
    trending: true,
    slug: 'rental-property-tax-deductions',
    image:
      'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad4" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23f59e0b;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23d97706;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad4)"/%3E%3Crect x="150" y="350" width="80" height="100" fill="white" opacity="0.3"/%3E%3Crect x="250" y="280" width="80" height="170" fill="white" opacity="0.3"/%3E%3C/svg%3E',
  },
  {
    title: 'Digital Marketing Strategies for Rental Properties',
    excerpt:
      'Learn how to attract quality tenants faster with effective online marketing techniques and listing optimization.',
    content: `
  <h2>Market Your Property Effectively</h2>
  <p>In today's digital age, the majority of tenants begin their apartment search online. A strong digital marketing strategy helps you attract qualified tenants faster, reduce costly vacancy periods, and build a reputation as a landlord of choice. Whether you manage one unit or a large portfolio, investing time in your online presence pays dividends in the quality and speed of tenant placement.</p>

  <h2>Create Compelling Listings</h2>
  <p>Write detailed, honest descriptions that highlight your property's best features. Include information about the neighborhood, nearby schools, public transportation, and local amenities like parks or restaurants. Use specific, searchable keywords that prospective tenants are likely to type into search engines. Listings with more detail consistently outperform vague or minimal descriptions in both click-through rates and inquiry volume.</p>

  <h2>Professional Photography</h2>
  <p>High-quality photos are the single most important element of any rental listing. Use good lighting, clean and stage each room before shooting, and capture multiple angles of every space. Blurry or dark photos signal neglect to prospective tenants and drive down inquiry rates significantly. For premium properties, consider a 3D virtual tour or a short video walkthrough — these features can double the number of serious inquiries you receive.</p>

  <h2>List on Multiple Platforms</h2>
  <p>Maximize your reach by posting on multiple rental platforms simultaneously. Sites like Zillow, Apartments.com, Craigslist, Trulia, and Facebook Marketplace each attract different renter demographics. Keeping your listing active and updated across all platforms ensures you reach the widest possible pool of qualified applicants.</p>

  <h2>Social Media Marketing</h2>
  <p>Use Facebook, Instagram, and LinkedIn to build your brand as a landlord. Share photos of freshly renovated units, tenant testimonials, neighborhood highlights, and move-in ready listings. Consistent social media presence builds trust with prospective tenants before they ever contact you, and a strong following can help fill vacancies faster through organic sharing.</p>

  <h2>Targeted Advertising</h2>
  <p>Run paid ads on Facebook and Google to reach specific demographics most likely to rent your property. You can target by location, age, income range, relationship status, and life events such as job changes or recent relocations. Even a modest advertising budget of $50–$100 per vacancy can dramatically increase qualified inquiries when targeted correctly.</p>

  <h2>Optimize for Mobile</h2>
  <p>More than 70% of rental searches now happen on mobile devices. Ensure your listings load quickly, display correctly on small screens, and include a simple way to inquire or apply directly from a phone. A clunky mobile experience causes prospective tenants to move on to the next listing without ever contacting you.</p>

  <h2>Respond Quickly</h2>
  <p>Speed of response is a major factor in converting inquiries into applications. Aim to reply within one to two hours during business hours. Set up automated acknowledgment messages to let prospects know their inquiry was received and when to expect a follow-up. Tenants in competitive rental markets are often talking to multiple landlords simultaneously — the first to respond thoughtfully often wins.</p>

  <h2>Track Your Results</h2>
  <p>Monitor which platforms generate the most qualified leads and adjust your marketing spend accordingly. Ask each applicant how they found your listing and track the data over time. Doubling down on what works and cutting what doesn't will lower your cost per placement and reduce vacancy duration across your portfolio.</p>
`,
    author: 'Jessica Lee',
    authorRole: 'Marketing Director',
    authorBio:
      'Jessica specializes in digital marketing for real estate and has helped fill over 1,000 rental units through strategic online campaigns. She writes for Propely on marketing and tenant acquisition.',
    authorImage:
      'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23ec4899"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EJL%3C/text%3E%3C/svg%3E',
    date: 'March 15, 2024',
    isoDate: '2024-03-15',
    readTime: '5 min read',
    category: 'Marketing',
    categorySlug: 'marketing',
    featured: false,
    trending: false,
    slug: 'digital-marketing-rental-properties',
    image:
      'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad5" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23ec4899;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23db2777;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad5)"/%3E%3Crect x="200" y="100" width="400" height="300" rx="15" fill="white" opacity="0.15"/%3E%3C/svg%3E',
  },
  {
    title: 'Creating a Seamless Tenant Onboarding Experience',
    excerpt:
      'Set the tone for a great landlord-tenant relationship with a smooth move-in process and clear communication.',
    content: `
  <h2>First Impressions Matter</h2>
  <p>The move-in process sets the tone for your entire landlord-tenant relationship. A smooth, professional onboarding experience leads to happier tenants who are more likely to renew their leases and take better care of your property. Conversely, a disorganized or unwelcoming move-in creates friction from day one and often predicts a difficult tenancy. Investing in a great onboarding process is one of the highest-ROI activities available to a landlord.</p>

  <h2>Before Move-In Day</h2>
  <p>Send a detailed welcome email at least a week before move-in day. Include the confirmed move-in date and time, key pickup instructions, utility transfer information, and parking arrangements for moving trucks. Provide a checklist of tasks the tenant needs to complete before arrival, such as setting up renters insurance or activating utilities. The more information you share proactively, the fewer frantic calls you'll receive on move-in day.</p>

  <h2>Prepare the Property</h2>
  <p>Ensure the property is spotlessly clean, freshly painted where needed, and that all repairs are fully completed before the tenant arrives. Replace air filters, test every appliance, check all locks, and ensure light bulbs are working throughout. Stocking basic supplies — a roll of toilet paper, a few trash bags, some cleaning supplies — as a small welcome gesture signals that you're a thoughtful, attentive landlord.</p>

  <h2>Create a Welcome Packet</h2>
  <p>Prepare a comprehensive welcome packet that includes signed copies of the lease, a move-in inspection form, emergency contact information, trash collection schedules, HOA rules if applicable, and a neighborhood guide with useful local information. With Propely, tenants receive all onboarding documents digitally through their tenant portal — no printing or chasing paper signatures required.</p>

  <h2>Conduct a Walkthrough</h2>
  <p>Schedule a walkthrough with the tenant on or just before move-in day. Walk through every room together, test appliances, and document the condition of the property with dated photos and videos. Have the tenant sign a move-in inspection form acknowledging the condition of the property. This form is your most important legal protection if there is ever a dispute about damage at move-out.</p>

  <h2>Explain Systems and Appliances</h2>
  <p>Show tenants how to operate the thermostat, water heater, circuit breaker, garbage disposal, security system, and all major appliances. Leave user manuals and warranty cards in a designated drawer. Tenants who understand how things work are less likely to call you for simple questions and are better equipped to notice and report problems early before they escalate.</p>

  <h2>Set Communication Expectations</h2>
  <p>Clearly explain your preferred method of communication and your typical response time for non-emergency requests. Provide an after-hours emergency contact number for urgent issues like water leaks or loss of heat. Propely's messaging center keeps all landlord-tenant communication in one thread — no more digging through emails or missed texts. Setting clear expectations upfront builds a professional, respectful dynamic from the start.</p>

  <h2>Follow Up and Build the Relationship</h2>
  <p>Check in with your new tenant after their first week to see if they have any questions or concerns. A brief message shows that you care about their experience and gives you an opportunity to resolve small issues before they become complaints. Tenants who feel valued and respected are far more likely to stay long-term, pay on time, and treat your property well — which is the foundation of stress-free property management.</p>
`,
    author: 'Sarah Johnson',
    authorRole: 'Senior Property Manager',
    authorBio:
      'Sarah has over 15 years of experience in property management, overseeing portfolios of 500+ units across multiple states. She now writes for Propely to help landlords build smarter, more profitable rental businesses.',
    authorImage:
      'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="50" fill="%234f46e5"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3ESJ%3C/text%3E%3C/svg%3E',
    date: 'March 12, 2024',
    isoDate: '2024-03-12',
    readTime: '6 min read',
    category: 'Tenant Tips',
    categorySlug: 'tenant-tips',
    featured: false,
    trending: false,
    slug: 'tenant-onboarding-experience',
    image:
      'data:image/svg+xml,%3Csvg width="800" height="500" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3ClinearGradient id="grad6" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%238b5cf6;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%236d28d9;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad6)"/%3E%3Ccircle cx="400" cy="200" r="80" fill="white" opacity="0.2"/%3E%3C/svg%3E',
  },
]

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// Extracts initials from a full name for the avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
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
              logo: { '@type': 'ImageObject', url: 'https://propely.site/logo.png' },
            },
          }),
        }}
      />

      <article className="relative w-full py-16 sm:py-20 md:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-3xl">

          {/* Back to blog */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to blog
          </Link>

          {/* Category badge */}
          <div className="mb-5">
            <Link
              href={`/blog?category=${post.categorySlug}`}
              className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20 dark:ring-indigo-400/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              {post.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-[2.625rem] font-semibold text-foreground leading-[1.2] tracking-tight mb-5">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-7">
            {post.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 opacity-60" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 opacity-60" />
              <time dateTime={post.isoDate}>{post.date}</time>
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 opacity-60" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Featured image */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted mb-10 ring-1 ring-inset ring-black/5 dark:ring-white/5">
            <Image
              src={post.image}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Share — top */}
          <div className="mb-10">
            <ShareButtons title={post.title} />
          </div>

          {/* Article body */}
          <div className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-p:leading-[1.8] prose-p:text-foreground/80 prose-li:text-foreground/80 prose-li:leading-relaxed prose-strong:text-foreground prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          <hr className="border-border mb-12" />

          {/* Author bio */}
          <div className="flex items-start gap-4 mb-12">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center ring-1 ring-inset ring-black/5 dark:ring-white/10">
              <Image
                src={post.authorImage}
                alt={post.author}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-0.5">
                {post.author}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                {post.authorRole}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.authorBio}
              </p>
            </div>
          </div>

          <hr className="border-border mb-12" />

          {/* Share — bottom */}
          <div className="mb-12">
            <ShareButtons title={post.title} />
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Related articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md"
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
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground mb-2">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5 leading-snug">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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