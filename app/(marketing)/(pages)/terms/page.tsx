import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Propely',
  description: 'Terms and conditions for using our property management platform. Read our service agreement, user responsibilities, and legal terms.',
}

export default function TermsPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            LEGAL
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Terms of Service
          </h1>

          <p className="text-muted-foreground text-base md:text-lg max-w-[42em] text-pretty">
            Last updated: March 30, 2024
          </p>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {/* Introduction */}
            <div className="space-y-6 mb-12">
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Propely. These Terms of Service govern your access to and use of our website, software, and related services. By accessing or using our services, you agree to be bound by these terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Please read these terms carefully before using our services. If you do not agree to these terms, please do not use our platform.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="rounded-xl bg-muted/50 border border-border p-6 mb-12">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                <a href="#acceptance" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  1. Acceptance of Terms
                </a>
                <a href="#services" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  2. Description of Services
                </a>
                <a href="#accounts" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  3. User Accounts
                </a>
                <a href="#user-conduct" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  4. User Conduct and Responsibilities
                </a>
                <a href="#payments" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  5. Payments and Billing
                </a>
                <a href="#intellectual-property" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  6. Intellectual Property
                </a>
                <a href="#disclaimers" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  7. Disclaimers and Warranties
                </a>
                <a href="#liability" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  8. Limitation of Liability
                </a>
                <a href="#termination" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  9. Termination
                </a>
                <a href="#governing-law" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  10. Governing Law
                </a>
                <a href="#changes" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  11. Changes to Terms
                </a>
                <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  12. Contact Information
                </a>
              </nav>
            </div>

            {/* Section 1 */}
            <div id="acceptance" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing, browsing, or using this website and our property management services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. These terms apply to all visitors, users, and others who access or use our services.
              </p>
            </div>

            {/* Section 2 */}
            <div id="services" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                2. Description of Services
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Propely provides a comprehensive suite of tools for property managers, landlords, and real estate professionals, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Property listing and management tools</li>
                <li>Tenant screening and background checks</li>
                <li>Lease management and document storage</li>
                <li>Maintenance request tracking</li>
                <li>Financial reporting and analytics</li>
                <li>Tenant communication portals</li>
                <li>Payment processing services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any part of our services at any time without prior notice.
              </p>
            </div>

            {/* Section 3 */}
            <div id="accounts" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                3. User Accounts
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  To access certain features of our services, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 18 years old to create an account. We reserve the right to suspend or terminate accounts that violate these terms.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div id="user-conduct" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                4. User Conduct and Responsibilities
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to use our services to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Violate any applicable laws, regulations, or ordinances</li>
                <li>Infringe upon the rights of others, including intellectual property rights</li>
                <li>Transmit fraudulent, deceptive, or misleading information</li>
                <li>Distribute spam, malware, or harmful code</li>
                <li>Interfere with or disrupt our servers or networks</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Post false, inaccurate, or defamatory content</li>
                <li>Use our services for illegal property transactions</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div id="payments" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                5. Payments and Billing
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Certain features of our services require payment of fees. By subscribing to paid services, you agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Pay all applicable fees as described on our pricing pages</li>
                  <li>Provide valid payment information and authorize charges</li>
                  <li>Understand that fees are non-refundable except as required by law</li>
                  <li>Allow automatic renewal unless cancelled before the billing cycle</li>
                  <li>Notify us of any billing errors within 30 days</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  We may change our fees at any time with reasonable notice. Continued use after fee changes constitutes acceptance of the new fees.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div id="intellectual-property" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                6. Intellectual Property
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Our services and their original content, features, and functionality are owned by Propely and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You retain ownership of any content you submit, post, or display through our services. By submitting content, you grant us a license to use, store, and display that content in connection with providing our services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You may not copy, modify, distribute, sell, or lease any part of our services without our express written permission.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div id="disclaimers" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                7. Disclaimers and Warranties
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties that services will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or completeness of information</li>
                <li>Warranties that results will be achieved from use of services</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We do not warrant that tenant screening results are complete or that properties meet any particular standard.
              </p>
            </div>

            {/* Section 8 */}
            <div id="liability" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Propely shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Loss of profits, data, or business opportunities</li>
                <li>Personal injury or property damage</li>
                <li>Errors, mistakes, or omissions in content</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Disputes between landlords and tenants</li>
                <li>Any conduct or content of third parties on our platform</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>

            {/* Section 9 */}
            <div id="termination" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                9. Termination
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Breach of these Terms of Service</li>
                <li>Suspected fraudulent or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Technical or security issues</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use our services will immediately cease. Provisions that should survive termination include intellectual property, disclaimers, and limitation of liability.
              </p>
            </div>

            {/* Section 10 */}
            <div id="governing-law" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                10. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of the state where our company is headquartered, without regard to its conflict of law provisions.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these terms shall be resolved in the courts located in that jurisdiction. You agree to submit to the personal jurisdiction of such courts.
              </p>
            </div>

            {/* Section 11 */}
            <div id="changes" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                11. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will provide notice of significant changes by:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Posting the new terms on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending email notification to registered users</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </div>

            {/* Section 12 */}
            <div id="contact" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                12. Contact Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="rounded-xl bg-muted/50 border border-border p-6 mt-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Email:</strong> <a href="mailto:hello@propely.site" className="text-indigo-600 dark:text-indigo-400 hover:underline">hello@propely.site</a></li>
                  <li><strong>Website:</strong> <a href="https://propely.site" className="text-indigo-600 dark:text-indigo-400 hover:underline">propely.site</a></li>
                </ul>
              </div>
            </div>

            {/* Additional Links */}
            <div className="rounded-xl border border-border p-6 mt-12">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Related Policies
              </h3>
              <div className="flex flex-wrap gap-4">
                <a href="/privacy" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Privacy Policy
                </a>
                <a href="/cookies" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Cookie Policy
                </a>
                <a href="/legal" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Legal Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
