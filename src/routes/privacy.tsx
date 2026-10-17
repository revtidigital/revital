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
        <p className="mt-2 text-sm font-semibold text-garnet">Revital UAE</p>
        <p className="mt-1 text-sm text-muted-foreground">Last Updated: October 2026</p>

        <div className="prose prose-sm md:prose-base mt-8 space-y-6 text-garnet/85">
          <section>
            <h2 className="text-xl font-bold text-garnet">1. Who We Are</h2>
            <p>
              Revital is committed to protecting your privacy and ensuring the security of your
              personal information. This Privacy Policy explains how we collect, use, store, and
              protect your information when you visit or use the Revital UAE website.
            </p>
            <p className="mt-1">
              This policy applies to all visitors who browse the website, use its available
              features, access recreational mini-games, or contact us through the website.
            </p>
            <p className="mt-1">
              The Revital Energy Challenge competition has concluded. Any mini-games that remain
              available on the website are for recreational use only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">2. Information We Collect</h2>
            <p>
              When you visit or use our website, we may collect the following information,
              depending on the features you access and the information you choose to provide.
            </p>
            <p className="font-semibold mt-3">Information You Provide</p>
            <ul>
              <li>Name and contact details submitted through contact or support channels.</li>
              <li>
                Information voluntarily provided when making an enquiry or requesting
                assistance.
              </li>
            </ul>
            <p className="font-semibold mt-3">Gameplay Information</p>
            <ul>
              <li>
                Scores generated through the Reflex Test, Memory Game, and Balance Game, where
                these games remain available.
              </li>
              <li>Gameplay activity and performance data generated through recreational use of the mini-games.</li>
            </ul>
            <p className="font-semibold mt-3">Technical Information</p>
            <ul>
              <li>Device type and operating system.</li>
              <li>Browser type and version.</li>
              <li>IP address.</li>
              <li>Website usage data and session information.</li>
              <li>Cookies and similar tracking technologies, where enabled.</li>
            </ul>
            <p className="font-semibold mt-3">Previously Collected Information</p>
            <p className="mt-1">
              Certain information previously collected in connection with the concluded
              competition, including participant details, historical scores, referral records, or
              profile images, may be retained where necessary for outstanding obligations, legal
              compliance, or other lawful purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">3. How We Use Your Information</h2>
            <p>We may use your information for the following purposes:</p>
            <ul>
              <li>To operate, maintain, and improve the website.</li>
              <li>To provide access to available website features and recreational mini-games.</li>
              <li>To understand website usage and improve the user experience.</li>
              <li>To maintain website security and prevent misuse or fraudulent activity.</li>
              <li>To respond to enquiries and support requests.</li>
              <li>To fulfil any outstanding obligations relating to previously awarded prizes, where applicable.</li>
              <li>To maintain records where necessary for legal compliance.</li>
              <li>To monitor website performance and troubleshoot technical issues.</li>
              <li>To comply with applicable legal and regulatory requirements.</li>
            </ul>
            <p className="mt-1">
              We process personal information only for appropriate purposes and in accordance
              with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">4. Website Usage and Gameplay Information</h2>
            <p>
              The website may provide access to mini-games for recreational use. Gameplay scores
              and results generated through these games are for personal entertainment only.
            </p>
            <p className="mt-1">
              The Revital Energy Challenge competition has concluded. Leaderboard rankings,
              referral-based scoring, competition bonuses, and prize opportunities associated with
              that competition are no longer active.
            </p>
            <p className="mt-1">
              Any historical gameplay or competition records retained will be handled in
              accordance with this Privacy Policy and applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">5. Profile Images and Photographs</h2>
            <p>
              The website does not require general visitors to submit profile images or
              photographs to browse its pages.
            </p>
            <p className="mt-1">
              If profile images or photographs were previously collected, they may be retained or
              displayed where there is an appropriate purpose and legal basis, including any
              consent required by applicable law.
            </p>
            <p className="mt-1">
              Requests concerning the use or removal of personal images may be submitted through
              the contact details provided below, subject to applicable legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">6. Legal Basis for Processing</h2>
            <p>
              We process personal information in accordance with applicable data protection laws,
              including the UAE Personal Data Protection Law where applicable.
            </p>
            <p className="mt-1">
              Depending on the circumstances, processing may be based on consent, the provision of
              requested services, compliance with legal obligations, legitimate interests where
              permitted, or another lawful basis.
            </p>
            <p className="mt-1">
              Where consent is required by law, we will obtain it before carrying out the relevant
              processing. You may withdraw consent where applicable, subject to legal limitations
              and obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">7. Data Sharing</h2>
            <p>We do not sell your personal information.</p>
            <p className="mt-1">
              We may share information with authorised service providers that support website
              hosting, technical maintenance, analytics, security, and other necessary website
              operations.
            </p>
            <p className="mt-1">
              We may also disclose information where required by law, in response to lawful
              requests, or to protect our rights and the security of the website.
            </p>
            <p className="mt-1">
              Any sharing of personal information will be limited to what is necessary for the
              relevant purpose and handled in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">8. Data Retention</h2>
            <p>
              We retain personal information only for as long as necessary to fulfil the purposes
              for which it was collected, including website operation, customer support, security,
              and legal compliance.
            </p>
            <p className="mt-1">
              Information previously collected in connection with the concluded competition may be
              retained where necessary to fulfil outstanding obligations or meet legal
              requirements.
            </p>
            <p className="mt-1">
              When personal information is no longer required, it will be securely deleted or
              anonymised, where appropriate, in accordance with applicable legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">9. Cookies and Analytics</h2>
            <p>
              The website may use cookies and similar technologies to support website
              functionality, understand visitor behaviour, analyse website traffic, and improve
              performance.
            </p>
            <p className="mt-1">
              These technologies may collect information such as browser details, device
              information, pages visited, and interactions with website features.
            </p>
            <p className="mt-1">
              You may manage cookies through your browser settings or any cookie preference
              controls available on the website. Disabling certain cookies may affect website
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">10. Data Security</h2>
            <p>
              We implement reasonable technical and organisational measures to protect personal
              information against unauthorised access, disclosure, alteration, loss, or misuse.
            </p>
            <p className="mt-1">
              However, no method of online transmission or electronic storage can be guaranteed to
              be completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">11. International Data Transfers</h2>
            <p>
              Where personal information is transferred outside the jurisdiction in which it was
              collected, we will take the measures required by applicable data protection laws to
              ensure that the transfer is lawful and appropriate safeguards are in place.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">12. Your Privacy Rights</h2>
            <p>Subject to applicable law, you may have the right to:</p>
            <ul>
              <li>Request access to your personal information.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your personal information, where applicable.</li>
              <li>Request restriction of or object to certain processing.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>Exercise other rights available under applicable data protection laws.</li>
            </ul>
            <p className="mt-1">
              To exercise these rights, please contact us using the contact details provided
              below. We may need to verify your identity before processing certain requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">13. Children&apos;s Privacy</h2>
            <p>
              The website is not intended to collect personal information from children in
              violation of applicable law.
            </p>
            <p className="mt-1">
              Where consent or additional safeguards are required for processing a child&apos;s
              personal information, we will follow the applicable legal requirements.
            </p>
            <p className="mt-1">
              If you believe that a child has provided personal information inappropriately,
              please contact us so that we can review the matter and take appropriate action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">14. Updates to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              website, data handling practices, or applicable legal requirements.
            </p>
            <p className="mt-1">
              Any updates will be published on this page with a revised &quot;Last Updated&quot;
              date. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">15. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, our handling of personal
              information, or your privacy rights, please contact us through the official contact
              details provided on the Revital UAE website.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
