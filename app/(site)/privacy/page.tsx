"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    Privacy Policy
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                    Last updated: September 12, 2026
                </p>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">1. Introduction</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            Welcome to PokéTeamBuilder (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website at poketeambuilder.com (the &quot;Service&quot;).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">2. Information We Collect</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            We collect minimal information to provide and improve our Service:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                            <li><strong>Usage Data:</strong> If you allow analytics, Google Analytics 4 collects information about pages visited and features used to help us improve the Service.</li>
                            <li><strong>Browser Storage:</strong> Saved teams and settings are stored in your browser. Some settings, such as your language, use cookies that are also sent to our servers. Your cookie choices are stored locally under <code>ptb_cookie_consent</code>.</li>
                            <li><strong>Technical Data:</strong> Our hosting and security providers process connection information, including IP addresses and request details, to deliver and protect the Service.</li>
                            <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies for analytics and advertising purposes. See Section 5 for more details.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">3. How We Use Your Information</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            The information we collect is used for the following purposes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                            <li>To provide and maintain our Service</li>
                            <li>To improve, personalize, and expand our Service</li>
                            <li>To understand and analyze how you use our Service</li>
                            <li>To display relevant advertisements through Google AdSense</li>
                            <li>To detect, prevent, and address technical issues</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">4. Google AdSense</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            If you allow advertising, our Service can load Google AdSense. Google and its advertising partners may place and read cookies, use web beacons, and process IP addresses and other identifiers to deliver and measure ads and prevent fraud. Where permitted and with any required consent, advertising cookies may also be used to personalize ads based on visits to this and other websites.
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-3">
                            Our local advertising choice controls whether we load AdSense; it is not a certified consent management platform (CMP). Personalized ads in the European Economic Area, the United Kingdom, and Switzerland require a separate Google-certified CMP. Any additional consent message shown by Google or its partners explains the purposes and partners it covers.
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-3">
                            Learn more about{" "}
                            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                how Google uses information from sites and apps that use its services
                            </a>.
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-3">
                            You may opt out of personalized advertising by visiting{" "}
                            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                Google Ads Settings
                            </a>. Alternatively, you can opt out of third-party vendor cookies by visiting{" "}
                            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                aboutads.info
                            </a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">5. Cookie Consent</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            Our local cookie banner controls both analytics and advertising. Both are off until you explicitly allow them, regardless of your location. Essential storage for language, theme, and your cookie choices remains available.
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-3">
                            Choose &quot;Reject Optional&quot; to decline both categories, or use the switches and &quot;Save Choices&quot; to choose them separately. You can change or withdraw your choices at any time using &quot;Cookie Settings&quot; in the footer. If a disabled service has already loaded, the page reloads to stop its scripts. Withdrawal stops future loading but does not undo data already sent or automatically remove existing cookies; you can remove those through your browser settings. If browser storage is unavailable, choices may only last for the current page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">6. Cookies</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            Our Service uses the following types of cookies:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                            <li><strong>Essential Cookies:</strong> Required for the basic functionality of the website, such as remembering your language preference and theme choice.</li>
                            <li><strong>Analytics Cookies:</strong> Google Analytics 4 may use cookies such as <code>_ga</code> and <code>_ga_*</code> when you allow analytics. These use identifiers to measure usage; reports are aggregated, but collection is not described as anonymous.</li>
                            <li><strong>Advertising Cookies:</strong> Google AdSense and its partners may use cookies such as <code>__gads</code>, <code>__gpi</code>, and <code>IDE</code> when advertising is allowed, subject to any additional consent requirements.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">7. Third-Party Services</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            Our Service may contain links to third-party websites or use data from external sources:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                            <li><strong>Smogon / Pokémon Showdown:</strong> We use publicly available competitive Pokémon data to generate teams and provide guides.</li>
                            <li><strong>Google AdSense:</strong> For serving advertisements. Governed by Google&apos;s Privacy Policy.</li>
                            <li><strong>Google Analytics 4:</strong> For measuring site usage when you allow analytics. See the Google data-use link above.</li>
                            <li><strong>Ko-fi:</strong> For voluntary donations. Governed by Ko-fi&apos;s privacy policy.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">8. Data Security</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            We value your trust in providing us your information, and we strive to use commercially acceptable means of protecting it. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">9. Children&apos;s Privacy</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            Our Service is intended for general audiences and does not knowingly collect personally identifiable information from children under 13 years of age. If you are a parent or guardian and believe that your child has provided us with personal data, please contact us so that we can take the necessary actions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">10. Your Rights</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            Depending on your location, you may have the following rights regarding your personal data:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                            <li>The right to access the information we hold about you</li>
                            <li>The right to request correction of inaccurate data</li>
                            <li>The right to request deletion of your data</li>
                            <li>The right to opt out of personalized advertising</li>
                            <li>The right to withdraw or change your cookie consent at any time</li>
                            <li>The right to data portability</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">11. Changes to This Policy</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We advise you to review this Privacy Policy periodically for any changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">12. Contact Us</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us through our{" "}
                            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                                Contact Page
                            </Link>.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </main>
        </div>
    );
}
