'use client'

const FeaturesSection = () => {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      title: 'Property Management',
      description: 'Track unlimited properties and units with detailed records'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: 'Tenant Screening',
      description: 'Background checks, credit reports, and employment verification'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
          <line x1="10" x2="14" y1="13" y2="13"></line>
          <line x1="10" x2="14" y1="17" y2="17"></line>
          <path d="M10 9h.01"></path>
        </svg>
      ),
      title: 'Lease Management',
      description: 'Custom templates, e-signatures, and automated renewals'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      ),
      title: 'Automated Payments',
      description: 'Online rent collection with late fee tracking'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      ),
      title: 'Maintenance Tracking',
      description: 'Request management with vendor coordination and scheduling'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-check p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <polyline points="16 11 18 13 22 9"></polyline>
        </svg>
      ),
      title: 'Vendor Management',
      description: 'Coordinate with verified vendors and manage invoices'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <line x1="12" x2="12" y1="20" y2="10"></line>
          <line x1="18" x2="18" y1="20" y2="4"></line>
          <line x1="6" x2="6" y1="20" y2="16"></line>
        </svg>
      ),
      title: 'Financial Reporting',
      description: 'Income statements, expense tracking, and tax reports'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
      ),
      title: 'Smart Notifications',
      description: 'Automated alerts via email and SMS for important events'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-folder p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path>
        </svg>
      ),
      title: 'Document Management',
      description: 'Secure storage for leases, reports, and receipts'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-check p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <path d="m9 14 2 2 4-4"></path>
        </svg>
      ),
      title: 'Inspection Tools',
      description: 'Checklists and photo documentation for property inspections'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      title: 'Communication Hub',
      description: 'Centralized messaging with conversation threading'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check p-3 mb-1 border rounded-xl text-muted-foreground size-12" aria-hidden="true">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
      ),
      title: 'Security & Compliance',
      description: 'Encrypted storage with GDPR/CCPA compliance'
    }
  ];

  return (
    <section id="features" className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          {/* Title */}
          <h2 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Everything you need to manage properties
          </h2>

          {/* Subtitle - Shortened */}
          <p className="text-muted-foreground text-base md:text-lg max-w-[42.5em] text-pretty [word-break:break-word] [&_a]:font-semibold [&_a]:text-foreground [&_a]:hover:text-foreground/85">
            Complete property management with tenant screening, automated payments, and financial reporting
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            // Determine if this feature is in the last row for lg screens (3 columns)
            const isLastRowLg = index >= features.length - 3;
            
            return (
              <div key={index} className="relative flex flex-col items-center md:items-start text-center md:text-left md:pl-6">
                {/* Border line - hidden on mobile, shown on md+ */}
                <div className="hidden md:block absolute left-0 top-0 bottom-0 w-0.5 bg-border"></div>
                
                {/* Highlight line - centered vertically, hidden on mobile */}
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-foreground"></div>
                
                {/* Connecting line to next row - only show if not in last row */}
                {!isLastRowLg && (
                  <div className="hidden lg:block absolute left-0 bottom-0 w-0.5 h-8 translate-y-full bg-border"></div>
                )}
                
                {feature.icon}
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;