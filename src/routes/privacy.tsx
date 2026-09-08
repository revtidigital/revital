import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-garnet">Privacy Policy</h1>
        <p className="mt-2 text-sm font-semibold text-garnet">Revital Energy Challenge</p>
        <p className="mt-1 text-sm text-muted-foreground">Last Updated: August 2026</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Revital is committed to protecting your privacy and handling your personal information
          responsibly. This Privacy Policy explains how we collect, use, store, and protect your
          personal data when you participate in the Revital Energy Challenge website and campaign.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          By participating in the Revital Energy Challenge, you acknowledge that you have read and
          understood this Privacy Policy.
        </p>

        <div className="prose prose-sm md:prose-base mt-8 space-y-6 text-garnet/85">
          <section>
            <h2 className="text-xl font-bold text-garnet">1. Who We Are</h2>
            <p>
              The Revital Energy Challenge is a promotional campaign operated by Revital for
              participants in the United Arab Emirates.
            </p>
            <p>
              For the purpose of this campaign, Revital acts as the Data Controller, responsible
              for collecting and processing your personal data in accordance with applicable UAE
              privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">2. Information We Collect</h2>
            <p>When you participate in the Revital Energy Challenge, we may collect the following information:</p>
            <p className="font-semibold mt-3">Information You Provide</p>
            <ul>
              <li>Mobile number submitted after gameplay.</li>
              <li>Name and profile information.</li>
              <li>Profile image or photograph uploaded or captured as part of your campaign profile.</li>
              <li>Any information voluntarily shared during prize verification or customer support.</li>
            </ul>
            <p className="font-semibold mt-3">Profile Images and Photographs</p>
            <p>
              As part of your campaign profile, we may collect, capture, store, and use your image
              or photograph. Your image may be displayed on the campaign website, leaderboard, or
              other campaign-related pages.
            </p>
            <p className="mt-1">
              Subject to applicable law and any required consent, Revital may also use your image
              or photograph in connection with the Revital Energy Challenge on:
            </p>
            <ul>
              <li>Revital's official social media channels.</li>
              <li>Revital's website and campaign pages.</li>
              <li>Campaign-related digital communications.</li>
              <li>Promotional, marketing, or recap materials relating to the campaign.</li>
            </ul>
            <p className="mt-1">
              By submitting or allowing your image to be captured for your profile, you acknowledge
              that it may be used for the purposes described above. You should not submit or allow
              the capture of an image if you do not agree to this use.
            </p>
            <p className="font-semibold mt-3">Gameplay Information</p>
            <ul>
              <li>Daily gameplay scores.</li>
              <li>Best daily score across all games.</li>
              <li>Grand Leaderboard score.</li>
              <li>Gameplay history and participation days.</li>
              <li>Consecutive play streak information.</li>
            </ul>
            <p className="font-semibold mt-3">Referral Information</p>
            <ul>
              <li>Referral code generated for your account.</li>
              <li>Number of successful referrals.</li>
              <li>Referral activity associated with your campaign profile.</li>
            </ul>
            <p className="font-semibold mt-3">Technical Information</p>
            <ul>
              <li>Device type.</li>
              <li>Browser type and version.</li>
              <li>IP address.</li>
              <li>Operating system.</li>
              <li>Website usage analytics and session information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">3. How We Use Your Information</h2>
            <p>Your information is collected only for purposes related to the Revital Energy Challenge.</p>
            <p className="mt-1">We use your data to:</p>
            <ul>
              <li>Register and maintain your gameplay profile.</li>
              <li>Capture, store, and display your profile image or photograph.</li>
              <li>Save your daily and Grand Scores.</li>
              <li>Display leaderboard rankings and campaign profiles.</li>
              <li>
                Use participant images in campaign-related website, social media, promotional,
                marketing, or recap content.
              </li>
              <li>Calculate consistency bonuses and streak bonuses.</li>
              <li>Track successful referrals.</li>
              <li>Verify daily and grand winners.</li>
              <li>Contact winners regarding rewards.</li>
              <li>Improve website performance and user experience.</li>
              <li>Monitor platform security and prevent misuse.</li>
            </ul>
            <p className="mt-1">We do not use gameplay information for automated marketing decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">4. Leaderboard &amp; Referral Processing</h2>
            <p>To operate the campaign fairly, we process gameplay and referral information.</p>
            <p className="font-semibold mt-3">Daily Leaderboard</p>
            <p className="mt-1">
              Your Daily Energy Score is calculated using your best gameplay performance for that
              day.
            </p>
            <p className="font-semibold mt-3">Grand Leaderboard</p>
            <p className="mt-1">Your Grand Score is calculated using:</p>
            <ul>
              <li>Gameplay Performance.</li>
              <li>Consistency Bonus.</li>
              <li>Performance Streak Bonus.</li>
              <li>Referral Points.</li>
            </ul>
            <p className="font-semibold mt-3">Referral Rules</p>
            <ul>
              <li>Every successful verified referral earns 100 points.</li>
              <li>Referrals are unlimited.</li>
              <li>Referral points affect only the Grand Leaderboard.</li>
              <li>Referral points do not affect Daily Winners or Daily Energy Scores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">5. Winner Verification</h2>
            <p>
              If you become a daily or grand winner, Revital may request additional information to
              verify your eligibility.
            </p>
            <p className="mt-1">Verification may include:</p>
            <ul>
              <li>Registered mobile number.</li>
              <li>Identity confirmation, if required for prize fulfilment.</li>
              <li>Eligibility validation for campaign participation.</li>
              <li>Confirmation of your profile image or photograph, where relevant to campaign communications or winner announcements.</li>
            </ul>
            <p className="mt-1">
              Revital reserves the right to disqualify fraudulent, duplicate, or invalid entries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">6. Legal Basis for Processing (UAE PDPL)</h2>
            <p>
              We process your personal data only where there is a lawful basis under the UAE
              Personal Data Protection Law (PDPL).
            </p>
            <p className="mt-1">This includes:</p>
            <ul>
              <li>Your consent when participating in the campaign and submitting or allowing the capture of your image.</li>
              <li>Performance of campaign services you request.</li>
              <li>Compliance with legal or regulatory obligations.</li>
              <li>Fraud prevention and campaign security.</li>
              <li>Legitimate campaign administration and prize fulfilment.</li>
              <li>Campaign communications, promotional activities, and publication of campaign-related content, where permitted by applicable law.</li>
            </ul>
            <p className="mt-1">
              You may withdraw your consent where applicable, subject to campaign eligibility
              requirements and any use or publication that has already taken place.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">7. Data Sharing</h2>
            <p>We do not sell your personal data.</p>
            <p className="mt-1">Your information, including your profile image or photograph, may be shared only with:</p>
            <ul>
              <li>Revital campaign administrators.</li>
              <li>Technology partners managing the campaign website.</li>
              <li>Service providers supporting hosting, analytics, content production, social media management, or prize fulfilment.</li>
              <li>Government or regulatory authorities where required by applicable law.</li>
            </ul>
            <p className="mt-1">
              Your image may be made publicly available when used on Revital's website, campaign
              pages, official social media channels, or campaign-related promotional materials.
            </p>
            <p className="mt-1">
              All service providers are required to handle personal data securely and only for
              authorized campaign purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">8. Data Retention</h2>
            <p>
              We retain your personal data, including your profile image or photograph, only for as
              long as necessary to operate the campaign, complete winner verification and prize
              distribution, publish campaign-related content, and meet applicable legal, regulatory,
              reporting, and business requirements.
            </p>
            <p className="mt-1">Campaign information may be retained for:</p>
            <ul>
              <li>Campaign administration.</li>
              <li>Fraud prevention.</li>
              <li>Legal compliance.</li>
              <li>Internal reporting and audit requirements.</li>
              <li>Campaign-related social media, website, promotional, or recap content.</li>
            </ul>
            <p className="mt-1">
              After the retention period, personal data will be securely deleted or anonymized
              where appropriate. Content that has already been published or distributed may not be
              capable of being fully removed from third-party platforms or copies made by others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">9. Cookies &amp; Analytics</h2>
            <p>The website uses cookies and similar technologies to:</p>
            <ul>
              <li>Keep the website functioning properly.</li>
              <li>Understand gameplay performance and website usage.</li>
              <li>Improve user experience.</li>
              <li>Measure campaign engagement.</li>
            </ul>
            <p className="mt-1">
              You may manage cookies through your browser settings, although some website features
              may not function correctly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">10. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal data against:
            </p>
            <ul>
              <li>Unauthorized access.</li>
              <li>Loss or misuse.</li>
              <li>Alteration.</li>
              <li>Accidental disclosure.</li>
            </ul>
            <p className="mt-1">
              Access to campaign data is limited to authorized personnel and approved technology
              partners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">11. International Data Transfers</h2>
            <p>
              Your personal data may be processed or stored using technology providers located
              inside or outside the UAE.
            </p>
            <p className="mt-1">
              Where personal data is transferred outside the UAE, Revital will ensure appropriate
              safeguards are implemented in accordance with the UAE Personal Data Protection Law.
              These safeguards are intended to protect your personal information during
              international transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">12. Your Privacy Rights (UAE)</h2>
            <p>Under the UAE Personal Data Protection Law, you may have the right to:</p>
            <ul>
              <li>Request access to your personal data.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your personal data where applicable.</li>
              <li>
                Request restriction or objection to certain processing activities where legally
                permitted.
              </li>
              <li>Withdraw consent for processing where consent is the legal basis.</li>
            </ul>
            <p className="mt-1">
              Requests will be handled in accordance with applicable UAE laws and campaign
              requirements. If you withdraw consent for the use of your image, Revital will
              consider your request in accordance with applicable law and operational requirements.
              Withdrawal may not affect uses that occurred before the withdrawal or content already
              published or distributed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">13. Children's Privacy</h2>
            <p>
              The Revital Energy Challenge is intended for eligible participants as defined by the
              campaign rules.
            </p>
            <p className="mt-1">
              We do not knowingly collect personal information, including images or photographs,
              from children without appropriate authorization where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">14. Updates to This Privacy Policy</h2>
            <p>
              Revital may update this Privacy Policy from time to time to reflect campaign
              updates, operational changes, including changes to image collection or usage, or
              legal requirements.
            </p>
            <p className="mt-1">
              The latest version will always be available on this page with the updated revision
              date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">15. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, the use of your image or photograph, or
              your personal data, participants may contact the Revital campaign support team
              through the official campaign contact details provided on the website.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
