import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Property Management Platform',
  description: 'Our commitment to protecting your privacy and personal information. Learn how we collect, use, and safeguard your data.',
}

export default function PrivacyPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            LEGAL
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Privacy Policy
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
                At Property Management Platform, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our property management services.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our services.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="rounded-xl bg-muted/50 border border-border p-6 mb-12">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                <a href="#information-collection" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  1. Information We Collect
                </a>
                <a href="#information-use" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  2. How We Use Your Information
                </a>
                <a href="#information-sharing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  3. Information Sharing and Disclosure
                </a>
                <a href="#data-security" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  4. Data Security
                </a>
                <a href="#cookies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  5. Cookies and Tracking Technologies
                </a>
                <a href="#your-rights" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  6. Your Privacy Rights
                </a>
                <a href="#data-retention" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  7. Data Retention
                </a>
                <a href="#children-privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  8. Children's Privacy
                </a>
                <a href="#changes" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  9. Changes to This Policy
                </a>
                <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  10. Contact Us
                </a>
              </nav>
            </div>

            {/* Section 1 */}
            <div id="information-collection" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                1. Information We Collect
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium text-foreground mb-2">
                    Personal Information
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may collect personally identifiable information that you voluntarily provide to us when you register on the website, use our services, or contact us. This may include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Name and contact information (email, phone number, address)</li>
                    <li>Property information and rental details</li>
                    <li>Tenant information and screening data</li>
                    <li>Payment and billing information</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base font-medium text-foreground mb-2">
                    Usage Data
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We automatically collect certain information when you visit and use our services, including:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>IP address and browser type</li>
                    <li>Device information and operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referral source and exit pages</li>
                    <li>Click patterns and user interactions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div id="information-use" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                2. How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide, maintain, and improve our property management services</li>
                <li>Process transactions and send related information</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions</li>
                <li>Personalize your experience and deliver relevant content</li>
                <li>Comply with legal obligations and enforce our terms</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div id="information-sharing" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                3. Information Sharing and Disclosure
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to others. We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (payment processing, data analysis, email delivery)</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of business assets</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>With Your Consent:</strong> When you have given us explicit permission to share your information</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div id="data-security" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                4. Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
                <li>Secure data storage and backup procedures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 5 */}
            <div id="cookies" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                5. Cookies and Tracking Technologies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies, web beacons, and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Types of cookies we use:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div id="your-rights" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                6. Your Privacy Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict certain processing activities</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent for data processing</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </div>

            {/* Section 7 */}
            <div id="data-retention" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                7. Data Retention
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. When determining retention periods, we consider:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>The nature and sensitivity of the data</li>
                <li>The purpose for which we collected the data</li>
                <li>Legal and regulatory requirements</li>
                <li>Whether there is an ongoing business need</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div id="children-privacy" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                8. Children's Privacy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child without parental consent, we will take steps to delete that information.
              </p>
            </div>

            {/* Section 9 */}
            <div id="changes" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                9. Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (where applicable)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            {/* Section 10 */}
            <div id="contact" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                10. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="rounded-xl bg-muted/50 border border-border p-6 mt-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Email:</strong> privacy@propertyplatform.com</li>
                  <li><strong>Phone:</strong> (555) 123-4567</li>
                  <li><strong>Address:</strong> 123 Property Lane, Suite 100, City, State 12345</li>
                </ul>
              </div>
            </div>

            {/* Additional Links */}
            <div className="rounded-xl border border-border p-6 mt-12">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Related Policies
              </h3>
              <div className="flex flex-wrap gap-4">
                <a href="/terms" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Terms of Service
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
