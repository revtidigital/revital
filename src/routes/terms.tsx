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
        <p className="mt-2 text-sm font-semibold text-garnet">Revital Energy Challenge</p>
        <p className="mt-1 text-sm text-muted-foreground">Last Updated: August 2026</p>
        <p className="mt-4 text-sm text-muted-foreground">
          These Terms &amp; Conditions govern participation in the Revital Energy Challenge
          promotional campaign. By accessing or participating in the campaign website, you agree
          to comply with these Terms &amp; Conditions.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          If you do not agree with these Terms, please do not participate in the campaign.
        </p>

        <div className="prose prose-sm md:prose-base mt-8 space-y-6 text-garnet/85">
          <section>
            <h2 className="text-xl font-bold text-garnet">1. Campaign Overview</h2>
            <p>
              The Revital Energy Challenge is a promotional gaming campaign where participants
              compete by playing three mini-games, earning Daily Energy Scores, climbing the
              Global Leaderboard, and becoming eligible for daily and grand rewards.
            </p>
            <p className="mt-1">Campaign Period: 15 August 2026 – 15 September 2026.</p>
            <p className="mt-1">
              Revital reserves the right to modify, extend, suspend, or terminate the campaign if
              required for operational, legal, or technical reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">2. Eligibility</h2>
            <p>To participate in the campaign, participants must:</p>
            <ul>
              <li>Be eligible to participate under applicable laws in the United Arab Emirates.</li>
              <li>Participate during the official campaign period.</li>
              <li>Submit a valid mobile number after completing gameplay to save their score.</li>
              <li>Comply with these Terms &amp; Conditions.</li>
            </ul>
            <p className="mt-1">
              Revital may request additional verification before confirming winners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">3. How the Challenge Works</h2>
            <p>Participants can:</p>
            <ul>
              <li>Start the challenge without OTP verification.</li>
              <li>
                Play all three mini-games: Reflex Test, Memory Game, Balance Game.
              </li>
              <li>Complete all games to generate a Daily Energy Score.</li>
              <li>Submit their mobile number to save their score.</li>
              <li>Return daily to improve their ranking.</li>
              <li>Share their referral code to earn Global Leaderboard points.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">4. Daily Energy Score</h2>
            <ul>
              <li>Each game has a maximum score of 1,500 points.</li>
              <li>The Daily Energy Score is the average of the three game scores.</li>
              <li>Maximum Daily Energy Score is 1,500 points.</li>
              <li>
                If a participant plays multiple times in one day, only the best Daily Energy Score
                is considered.
              </li>
              <li>Daily Scores determine Daily Leaderboard rankings and Daily Winners.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">5. Global Leaderboard Score</h2>
            <p>
              The Global Leaderboard reflects a participant's overall campaign performance.
            </p>
            <p className="font-semibold mt-3">Gameplay Score Components</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-garnet/10">
                    <th className="text-left px-4 py-2 font-bold text-garnet">Component</th>
                    <th className="text-left px-4 py-2 font-bold text-garnet">Maximum Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">Average Gameplay Performance</td>
                    <td className="px-4 py-2">1,500</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">Consistency Bonus</td>
                    <td className="px-4 py-2">1,000</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">Performance Streak Bonus</td>
                    <td className="px-4 py-2">500</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2 font-semibold">Maximum Gameplay Score</td>
                    <td className="px-4 py-2 font-semibold">3,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="font-semibold mt-4">Referral Points</p>
            <ul>
              <li>Every successful verified referral earns 100 points.</li>
              <li>Referrals are unlimited.</li>
              <li>Referral points are added only to the Global Leaderboard score.</li>
            </ul>
            <p className="font-semibold mt-4">Global Score Formula</p>
            <p className="mt-1">Global Score = Gameplay Score + (Successful Referrals × 100)</p>
            <p className="mt-1">
              Referral points do not affect Daily Scores or Daily Winner selection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">6. Daily Winners</h2>
            <p>A Daily Winner is selected every campaign day.</p>
            <p className="font-semibold mt-3">Winner Selection Criteria</p>
            <ul>
              <li>Highest Daily Energy Score of the day.</li>
              <li>Only the participant's best score of that day is considered.</li>
              <li>Referrals do not influence Daily Winners.</li>
            </ul>
            <p className="font-semibold mt-3">Tie-Breaker</p>
            <p className="mt-1">
              If multiple participants achieve the same Daily Score, the participant who achieved
              the score first (earliest recorded timestamp) will be selected as the Daily Winner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">7. Grand Winners</h2>
            <p>
              Grand Winners are selected based on the final Global Leaderboard rankings at the end
              of the campaign.
            </p>
            <p className="mt-1">
              The final number of Grand Winners and reward structure will be announced by Revital.
            </p>
            <p className="mt-1">
              Revital reserves the right to verify eligibility before prize distribution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">8. Winner Verification &amp; Prize Eligibility</h2>
            <p>Before announcing any winner, Revital may verify:</p>
            <ul>
              <li>Registered mobile number.</li>
              <li>Participant identity (where required for prize fulfilment).</li>
              <li>Campaign eligibility.</li>
              <li>Gameplay and referral validity.</li>
            </ul>
            <p className="mt-1">
              Revital may disqualify participants if verification fails or fraudulent activity is
              detected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">9. Referral Policy</h2>
            <p>
              Referral points are awarded only for successful verified referrals.
            </p>
            <p className="mt-1">The following will not qualify:</p>
            <ul>
              <li>Duplicate registrations.</li>
              <li>Self-referrals.</li>
              <li>Fake or invalid mobile numbers.</li>
              <li>Fraudulent or automated referrals.</li>
              <li>Referrals generated using bots, scripts, or manipulated accounts.</li>
            </ul>
            <p className="mt-1">
              Revital reserves the right to remove invalid referral points at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">10. Fair Play Policy</h2>
            <p>Participants must play fairly and honestly.</p>
            <p className="mt-1">The following activities are strictly prohibited:</p>
            <ul>
              <li>Using bots, automation tools, scripts, or third-party software.</li>
              <li>Manipulating gameplay scores.</li>
              <li>Exploiting technical bugs or loopholes.</li>
              <li>Attempting to interfere with leaderboard rankings.</li>
              <li>Creating multiple accounts for unfair advantage.</li>
            </ul>
            <p className="mt-1">
              Any suspicious activity may result in score removal, leaderboard removal, or
              permanent disqualification.
            </p>
            <p className="mt-1">Revital's decision regarding fraudulent gameplay will be final.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">11. User Content &amp; Acceptable Use</h2>
            <p>
              Participants are responsible for all information submitted during the campaign,
              including names, profile information, referrals, and any other content entered on
              the website.
            </p>
            <p className="mt-1">The following content is strictly prohibited:</p>
            <ul>
              <li>Offensive, abusive, defamatory, or hateful language.</li>
              <li>Obscene, sexually explicit, or inappropriate content.</li>
              <li>Religious, political, or discriminatory content.</li>
              <li>Violent, threatening, or illegal content.</li>
              <li>Impersonation of another individual or organization.</li>
              <li>False, misleading, or fraudulent information.</li>
              <li>Spam, promotional messages, or unauthorized advertisements.</li>
            </ul>
            <p className="font-semibold mt-3">Revital's Moderation Rights</p>
            <p className="mt-1">Revital has the full right and authority to:</p>
            <ul>
              <li>
                Remove, edit, or reject any name, username, referral information, or other content
                that violates these Terms.
              </li>
              <li>Remove inappropriate or unauthorized content without prior notice.</li>
              <li>Disqualify participants who repeatedly submit prohibited content.</li>
              <li>Suspend or permanently block accounts involved in misuse of the platform.</li>
            </ul>
            <p className="mt-1">
              Any unauthorized, offensive, or misleading content submitted anywhere on the
              platform will not be accepted and may be removed immediately at Revital's sole
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">12. Intellectual Property</h2>
            <p>All campaign content, including:</p>
            <ul>
              <li>Revital branding,</li>
              <li>Logos,</li>
              <li>Graphics,</li>
              <li>Game designs,</li>
              <li>Animations,</li>
              <li>Website content,</li>
              <li>Leaderboards,</li>
              <li>Campaign creatives,</li>
            </ul>
            <p className="mt-1">is owned by Revital or its licensors.</p>
            <p className="mt-1">
              Participants may not reproduce, distribute, modify, or commercially use any campaign
              content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">13. Privacy &amp; Personal Data</h2>
            <p>Participation in the campaign is subject to the Revital Privacy Policy.</p>
            <p className="mt-1">
              By participating, you consent to the collection and processing of your personal
              information for:
            </p>
            <ul>
              <li>Gameplay administration.</li>
              <li>Leaderboard management.</li>
              <li>Winner verification.</li>
              <li>Prize fulfilment.</li>
              <li>Fraud prevention.</li>
              <li>Campaign analytics.</li>
            </ul>
            <p className="mt-1">
              Personal data will be processed in accordance with applicable UAE privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">14. Limitation of Liability</h2>
            <p>Revital is not responsible for:</p>
            <ul>
              <li>Internet connectivity issues.</li>
              <li>Device compatibility issues.</li>
              <li>Technical interruptions or server downtime.</li>
              <li>Delayed or incomplete submissions caused by technical failures.</li>
              <li>Loss of participation due to circumstances beyond reasonable control.</li>
            </ul>
            <p className="mt-1">
              Revital may temporarily suspend gameplay for maintenance or security reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">15. Suspension, Cancellation &amp; Disqualification</h2>
            <p>Revital reserves the right to suspend, cancel, or disqualify any participant if:</p>
            <ul>
              <li>Campaign rules are violated.</li>
              <li>Fraudulent gameplay or referrals are detected.</li>
              <li>Unauthorized or inappropriate content is submitted.</li>
              <li>Multiple accounts are created for unfair advantage.</li>
              <li>Technical manipulation or abuse of the platform is identified.</li>
            </ul>
            <p className="mt-1">
              Disqualified participants may lose eligibility for leaderboard rankings and prizes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">16. Changes to the Campaign</h2>
            <p>Revital reserves the right to:</p>
            <ul>
              <li>Update these Terms &amp; Conditions.</li>
              <li>Modify gameplay rules.</li>
              <li>Change scoring mechanisms if required for fairness or security.</li>
              <li>Update prize structures or campaign timelines where necessary.</li>
            </ul>
            <p className="mt-1">Any updates will be published on the campaign website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">17. Governing Law</h2>
            <p>
              These Terms &amp; Conditions shall be governed by and interpreted in accordance with
              the laws of the United Arab Emirates.
            </p>
            <p className="mt-1">
              Any disputes arising from the campaign shall be subject to the competent courts of
              the United Arab Emirates, unless otherwise required under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">18. Contact Us</h2>
            <p>
              For questions regarding the Revital Energy Challenge, Terms &amp; Conditions, or
              winner verification, participants may contact the official Revital campaign support
              team through the contact details provided on the campaign website.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
