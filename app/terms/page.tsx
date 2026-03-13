"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function TermsOfServicePage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                    Terms of Service
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                    Last updated: March 13, 2026
                </p>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">1. Acceptance of Terms</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            By accessing and using PokéTeamBuilder at poketeambuilder.com (the &quot;Service&quot;), you accept and agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">2. Description of Service</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            PokéTeamBuilder is a free, web-based tool that helps users create competitive Pokémon teams for use in Pokémon Showdown. The Service includes team generation, competitive guides, tier lists, and related content. The Service uses publicly available competitive Pokémon data from sources such as Smogon to provide its functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">3. Free Service</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            The Service is provided free of charge. We reserve the right to introduce premium features in the future, but any free features available at the time of these Terms will remain free. The Service is supported through advertising (Google AdSense) and voluntary donations (Ko-fi).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">4. Acceptable Use</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                            You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                            <li>Use the Service in any way that violates any applicable local, national, or international law</li>
                            <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                            <li>Use automated tools (bots, scrapers) to access the Service in a manner that places excessive load on our infrastructure</li>
                            <li>Interfere with or disrupt the integrity of the Service</li>
                            <li>Use the Service to distribute malware, spam, or any harmful content</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">5. Intellectual Property</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            Pokémon and all associated names, characters, and imagery are trademarks and copyrights of Nintendo, The Pokémon Company, and Game Freak. PokéTeamBuilder is a fan-made tool and is not affiliated with, endorsed by, or sponsored by Nintendo, The Pokémon Company, Game Freak, or Smogon University. All Pokémon-related content is used under fair use for informational and educational purposes.
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-3">
                            The original code, design, and written content of PokéTeamBuilder are the property of the PokéTeamBuilder team and are protected by applicable copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">6. User-Generated Content</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            Teams that you create and save using the Service are stored locally in your browser. We do not claim ownership over your generated teams. You are free to share your teams with others, export them to Pokémon Showdown, or use them for any personal purpose.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">7. Disclaimer of Warranties</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free. The competitive data used to generate teams may not always be up to date or accurate, as it depends on external data sources.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">8. Limitation of Liability</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            In no event shall PokéTeamBuilder, its team members, or contributors be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data or profits, arising from your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">9. Advertising</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            The Service displays advertisements through Google AdSense. By using the Service, you acknowledge that advertisements will be displayed alongside the content. Ad content is provided by Google and its advertising partners, and we are not responsible for the content of third-party advertisements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">10. Links to Third-Party Sites</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            The Service may contain links to third-party websites such as Pokémon Showdown, Smogon University, and Ko-fi. These links are provided for your convenience. We have no control over and are not responsible for the content, privacy policies, or practices of any third-party websites.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">11. Changes to Terms</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            We reserve the right to modify or replace these Terms at any time. Material changes will be reflected by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service after any changes constitutes acceptance of the new Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">12. Contact Us</h2>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            If you have any questions about these Terms, please contact us through our{" "}
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
