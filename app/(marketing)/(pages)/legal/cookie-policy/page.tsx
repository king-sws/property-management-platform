import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | Property Management Platform',
  description: 'Learn about how we use cookies and tracking technologies on our website. Understand your choices and how to manage cookie preferences.',
}

export default function CookiePolicyPage() {
  return (
    <section className="relative w-full py-16 sm:py-20 md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-12">
          <p className="font-mono font-medium tracking-wider text-foreground/50 uppercase text-[12px]">
            LEGAL
          </p>

          <h1 className="font-display font-medium text-pretty text-3xl tracking-tighter md:text-4xl">
            Cookie Policy
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
                This Cookie Policy explains how Property Management Platform uses cookies and similar tracking technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                By continuing to use our website, you consent to the use of cookies as described in this policy.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="rounded-xl bg-muted/50 border border-border p-6 mb-12">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                <a href="#what-are-cookies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  1. What Are Cookies?
                </a>
                <a href="#types-of-cookies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  2. Types of Cookies We Use
                </a>
                <a href="#specific-cookies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  3. Specific Cookies Used
                </a>
                <a href="#third-party-cookies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  4. Third-Party Cookies
                </a>
                <a href="#managing-cookies" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  5. Managing Your Cookie Preferences
                </a>
                <a href="#updates" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  6. Updates to This Policy
                </a>
                <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  7. Contact Us
                </a>
              </nav>
            </div>

            {/* Section 1 */}
            <div id="what-are-cookies" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                1. What Are Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work efficiently and to provide information to the owners of the site.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cookies perform many different jobs, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Remembering your preferences and settings</li>
                <li>Understanding how you use our website</li>
                <li>Improving your browsing experience</li>
                <li>Delivering relevant advertisements</li>
                <li>Analyzing website traffic and performance</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div id="types-of-cookies" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                2. Types of Cookies We Use
              </h2>
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-5">
                  <h3 className="text-base font-medium text-foreground mb-2">
                    Essential Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These cookies are necessary for the website to function properly. They enable basic functions like page navigation, secure access to protected areas, and form submission. Without these cookies, our services cannot function properly.
                  </p>
                </div>

                <div className="rounded-xl border border-border p-5">
                  <h3 className="text-base font-medium text-foreground mb-2">
                    Analytics Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve our website and services.
                  </p>
                </div>

                <div className="rounded-xl border border-border p-5">
                  <h3 className="text-base font-medium text-foreground mb-2">
                    Advertising Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These cookies are used to track visitors across websites to display relevant advertisements. They remember your visits and help us measure the effectiveness of our advertising campaigns.
                  </p>
                </div>

                <div className="rounded-xl border border-border p-5">
                  <h3 className="text-base font-medium text-foreground mb-2">
                    Preference Cookies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    These cookies allow the website to remember choices you make (such as your user name, language, or region) to provide enhanced, more personalized features.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div id="specific-cookies" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                3. Specific Cookies Used
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground">Cookie Name</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">session_id</td>
                      <td className="py-3 px-4 text-muted-foreground">Essential</td>
                      <td className="py-3 px-4 text-muted-foreground">Session</td>
                      <td className="py-3 px-4 text-muted-foreground">Maintains user session</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">auth_token</td>
                      <td className="py-3 px-4 text-muted-foreground">Essential</td>
                      <td className="py-3 px-4 text-muted-foreground">7 days</td>
                      <td className="py-3 px-4 text-muted-foreground">Authentication</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">_ga</td>
                      <td className="py-3 px-4 text-muted-foreground">Analytics</td>
                      <td className="py-3 px-4 text-muted-foreground">2 years</td>
                      <td className="py-3 px-4 text-muted-foreground">Google Analytics</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">_gid</td>
                      <td className="py-3 px-4 text-muted-foreground">Analytics</td>
                      <td className="py-3 px-4 text-muted-foreground">24 hours</td>
                      <td className="py-3 px-4 text-muted-foreground">User identification</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">preferences</td>
                      <td className="py-3 px-4 text-muted-foreground">Preference</td>
                      <td className="py-3 px-4 text-muted-foreground">1 year</td>
                      <td className="py-3 px-4 text-muted-foreground">User settings</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">_fbp</td>
                      <td className="py-3 px-4 text-muted-foreground">Advertising</td>
                      <td className="py-3 px-4 text-muted-foreground">3 months</td>
                      <td className="py-3 px-4 text-muted-foreground">Facebook Pixel</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4 */}
            <div id="third-party-cookies" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                4. Third-Party Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and for other purposes. These may include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                <li><strong>Google AdSense:</strong> For displaying relevant advertisements</li>
                <li><strong>Facebook Pixel:</strong> For advertising and conversion tracking</li>
                <li><strong>Hotjar:</strong> For user behavior analytics and feedback</li>
                <li><strong>Intercom:</strong> For customer communication and support</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These third parties may collect information about your online activities over time and across different websites.
              </p>
            </div>

            {/* Section 5 */}
            <div id="managing-cookies" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                5. Managing Your Cookie Preferences
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>View cookies currently stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block third-party cookies</li>
                <li>Clear cookies when you close your browser</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Please note that if you choose to disable cookies, some features of our website may not function properly.
              </p>
              <div className="rounded-xl bg-muted/50 border border-border p-6 mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Browser-Specific Instructions
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div id="updates" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                6. Updates to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business operations. We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.
              </p>
            </div>

            {/* Section 7 */}
            <div id="contact" className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground">
                7. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about our use of cookies, please contact us:
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
                <a href="/privacy" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  Terms of Service
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
