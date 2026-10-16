import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-garnet">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm font-semibold text-garnet">Revital UAE Website</p>
        <p className="mt-1 text-sm text-muted-foreground">Last Updated: October 2026</p>
        <p className="mt-4 text-sm text-muted-foreground">
          These Terms &amp; Conditions govern your access to and use of the Revital UAE website,
          including any features, content, and mini-games that remain available. By accessing or
          using the website, you agree to comply with these Terms &amp; Conditions.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If you do not agree with these Terms, please discontinue use of the website.
        </p>

        <div className="prose prose-sm md:prose-base mt-8 space-y-6 text-garnet/85">
          <section>
            <h2 className="text-xl font-bold text-garnet">1. Website Overview</h2>
            <p>
              The Revital UAE website provides information about Revital and may offer
              interactive mini-games for recreational use.
            </p>
            <p>
              The Revital Energy Challenge competition has concluded. The website no longer
              accepts competition entries, awards competition points, or provides opportunities
              to qualify for competition prizes.
            </p>
            <p>Any mini-games that remain accessible are provided for entertainment purposes only.</p>
            <p>
              Revital reserves the right to modify, suspend, or discontinue any website feature
              where necessary for operational, technical, security, or legal reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">2. Eligibility</h2>
            <p>
              Visitors may access publicly available website content, subject to these Terms &amp;
              Conditions and applicable laws.
            </p>
            <p>
              Where a particular feature has additional age or eligibility requirements, those
              requirements must be followed.
            </p>
            <p>
              The website's recreational mini-games do not provide eligibility for the concluded
              competition or any associated prizes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">3. Use of the Website and Mini-Games</h2>
            <p>Visitors may:</p>
            <ul>
              <li>Browse publicly available website content.</li>
              <li>Access available mini-games for recreational use.</li>
              <li>View information about Revital and its products.</li>
              <li>Contact Revital through available communication channels.</li>
            </ul>
            <p>
              Visitors must not use the website to engage in fraudulent, unlawful, abusive, or
              unauthorised activities.
            </p>
            <p>
              Any scores generated through recreational gameplay are for personal entertainment
              only. Previous competition mechanics, including participation registration,
              referral scoring, leaderboard progression, and prize eligibility, are no longer
              active.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">4. Gameplay Scores</h2>
            <p>
              The website may allow visitors to play the Reflex Test, Memory Game, and Balance
              Game, where these features remain available.
            </p>
            <ul>
              <li>Any scores generated through these games are recreational results only.</li>
              <li>Gameplay scores do not qualify visitors for competition rankings.</li>
              <li>Historical competition scores do not represent an active leaderboard.</li>
              <li>No competition points, bonuses, or prizes can be earned through continued gameplay.</li>
              <li>Revital does not guarantee that gameplay results will be saved or remain available.</li>
              <li>Revital may modify or remove game features to maintain website functionality, security, or performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">5. Historical Leaderboards and Competition Records</h2>
            <p>
              Any historical leaderboard information or competition results that remain visible
              on the website are provided as records of the concluded competition.
            </p>
            <p>
              Such information does not indicate that the competition is active or that visitors
              can earn new rankings or prizes.
            </p>
            <p>
              Historical records may be updated, removed, or retained as necessary, subject to
              applicable law and legitimate operational requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">6. Prizes and Winner Verification</h2>
            <p>
              The Revital Energy Challenge competition has concluded, and no new prizes are
              available through the website.
            </p>
            <p>
              Any outstanding prize fulfilment or winner verification relating to the concluded
              competition will be handled separately, where applicable.
            </p>
            <p>
              Revital may request information reasonably necessary to verify an eligible winner or
              fulfil an outstanding prize obligation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">7. Referral Policy</h2>
            <p>
              The referral-based scoring system associated with the concluded competition is no
              longer active.
            </p>
            <p>
              Sharing or using historical referral codes does not generate competition points,
              improve leaderboard rankings, or qualify any person for prizes.
            </p>
            <p>
              Visitors must not misuse website links or features to engage in spam, impersonation,
              fraudulent activity, or other unlawful conduct.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">8. Fair Use Policy</h2>
            <p>Visitors must use the website responsibly and must not:</p>
            <ul>
              <li>Use bots, scripts, or automated tools to interfere with website functionality.</li>
              <li>Attempt to manipulate gameplay results or website data.</li>
              <li>Exploit technical vulnerabilities or security weaknesses.</li>
              <li>Attempt to gain unauthorised access to systems or information.</li>
              <li>Interfere with the website's operation or availability.</li>
              <li>Use the website for unlawful, misleading, or fraudulent purposes.</li>
            </ul>
            <p>
              Revital may restrict access, remove content, or take other appropriate action in
              response to misuse or security concerns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">9. User Content and Acceptable Use</h2>
            <p>Visitors may submit information through available website forms or communication channels.</p>
            <p>
              You are responsible for ensuring that any information or content you submit is
              accurate, lawful, and does not infringe the rights of others.
            </p>
            <p>You must not submit content that is:</p>
            <ul>
              <li>Offensive, abusive, defamatory, or hateful.</li>
              <li>Obscene, threatening, or unlawful.</li>
              <li>Discriminatory or intended to harass another person.</li>
              <li>Misleading, fraudulent, or impersonating another individual or organisation.</li>
              <li>Infringing of copyright, trademark, privacy, or other third-party rights.</li>
              <li>Unauthorised promotional material, spam, or malicious content.</li>
              <li>Containing personal or confidential information belonging to another person without appropriate authorisation.</li>
            </ul>
            <p>Revital may remove or restrict access to submitted content that violates these Terms or applicable law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">10. Intellectual Property</h2>
            <p>All website content, including:</p>
            <ul>
              <li>Revital branding and logos.</li>
              <li>Text, graphics, and illustrations.</li>
              <li>Website design and layouts.</li>
              <li>Game designs and animations.</li>
              <li>Images, videos, and other media.</li>
              <li>Previously published campaign materials.</li>
            </ul>
            <p>is owned by Revital, its affiliates, or its licensors, as applicable.</p>
            <p>
              You may access and view this content for personal, non-commercial purposes. You may
              not reproduce, distribute, modify, publish, or commercially use website content
              without prior written permission from the relevant rights holder.
            </p>
            <p>All rights not expressly granted are reserved.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">11. Privacy and Personal Data</h2>
            <p>Your use of the website is subject to the Revital UAE Privacy Policy.</p>
            <p>Personal information may be collected and processed where necessary to:</p>
            <ul>
              <li>Operate and maintain the website.</li>
              <li>Provide available website features.</li>
              <li>Respond to enquiries and support requests.</li>
              <li>Maintain website security and prevent misuse.</li>
              <li>Analyse website performance and usage, where applicable.</li>
              <li>Meet legal and regulatory obligations.</li>
            </ul>
            <p>
              Information previously collected in connection with the concluded competition may be
              retained where necessary for outstanding obligations or other lawful purposes.
            </p>
            <p>
              Personal information will be handled in accordance with the Privacy Policy and
              applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">12. Cookies and Analytics</h2>
            <p>
              The website may use cookies and similar technologies to support functionality,
              security, analytics, and performance.
            </p>
            <p>
              These technologies may collect technical information about your device, browser,
              website visits, and interactions with available features.
            </p>
            <p>
              You may manage cookies through your browser settings or any cookie preference
              controls provided on the website. Disabling certain cookies may affect website
              functionality.
            </p>
            <p>Further details are provided in the Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">13. Third-Party Services and Links</h2>
            <p>The website may contain links to third-party websites, services, or platforms.</p>
            <p>
              These third parties operate independently and may have their own terms, privacy
              policies, and practices.
            </p>
            <p>
              Revital is not responsible for the content, availability, security, or practices of
              third-party websites. Visitors should review the applicable terms and policies before
              using those services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">14. Limitation of Liability</h2>
            <p>To the extent permitted by applicable law, Revital is not responsible for:</p>
            <ul>
              <li>Temporary website interruptions or unavailability.</li>
              <li>Internet connectivity or device compatibility issues.</li>
              <li>Technical errors, delays, or data loss.</li>
              <li>The unavailability or modification of website features.</li>
              <li>Unauthorised access or misuse arising from circumstances beyond reasonable control.</li>
              <li>The content, availability, or practices of third-party websites and services.</li>
            </ul>
            <p>
              Nothing in these Terms excludes or limits liability where such exclusion or
              limitation is prohibited by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">15. Suspension and Restriction of Access</h2>
            <p>Revital reserves the right to suspend, restrict, or terminate access to the website or any feature where:</p>
            <ul>
              <li>These Terms &amp; Conditions are violated.</li>
              <li>Fraudulent, unlawful, or abusive activity is detected.</li>
              <li>Website security or functionality is threatened.</li>
              <li>A legal or regulatory requirement necessitates such action.</li>
              <li>Maintenance or technical changes require temporary or permanent suspension.</li>
            </ul>
            <p>
              Where appropriate, Revital may take action without prior notice to protect the
              website, its visitors, or its legitimate interests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">16. Changes to These Terms</h2>
            <p>
              Revital may update these Terms &amp; Conditions to reflect changes in website
              functionality, operations, security requirements, or applicable laws.
            </p>
            <p>Updated Terms will be published on this page with a revised "Last Updated" date.</p>
            <p>
              Continued use of the website after changes are published constitutes acceptance of
              the updated Terms, to the extent permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">17. Governing Law</h2>
            <p>
              These Terms &amp; Conditions shall be governed by and interpreted in accordance with
              the applicable laws of the United Arab Emirates.
            </p>
            <p>
              Any disputes arising from the use of the website shall be subject to the jurisdiction
              of the competent courts of the United Arab Emirates, unless otherwise required by
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">18. Contact Us</h2>
            <p>
              If you have questions regarding these Terms &amp; Conditions or your use of the
              Revital UAE website, please contact Revital through the official contact details
              provided on the website.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
