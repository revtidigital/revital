import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/rules")({
  component: RulesPage,
});

function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-garnet">
          Revital Energy Challenge — Official Rules
        </h1>
        <p className="mt-2 text-sm font-semibold text-garnet">
          Campaign Duration: 15 August – 15 September 2026
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Welcome to the Revital Energy Challenge — a 30-day energy gaming challenge where your
          reflexes, memory, balance, consistency, and referrals help you climb the leaderboard and
          win exciting rewards.
        </p>

        <div className="prose prose-sm md:prose-base mt-8 space-y-8 text-garnet/85">
          <section>
            <h2 className="text-xl font-bold text-garnet">How to Participate</h2>
            <ul>
              <li>Start the Revital Energy Challenge.</li>
              <li>Play all 3 mini-games — Reflex Test, Memory Game, and Balance Game.</li>
              <li>Complete all three games to generate your Daily Energy Score.</li>
              <li>Submit your phone number after completing the games to save your score.</li>
              <li>Return every day to improve your score and climb the leaderboard.</li>
              <li>
                Invite friends using your referral link to earn additional Global Leaderboard
                points.
              </li>
              <li>No OTP verification is required to start playing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">The Three Games</h2>
            <p className="font-semibold mt-3">1. Reflex Test</p>
            <p className="mt-1">
              Test your reaction speed. Your fastest valid reaction determines your Reflex score.
              <br />
              Maximum Score: 1,500 Points
            </p>
            <p className="font-semibold mt-4">2. Memory Game</p>
            <p className="mt-1">
              Match all cards as quickly and accurately as possible.
              <br />
              Maximum Score: 1,500 Points
            </p>
            <p className="font-semibold mt-4">3. Balance Game</p>
            <p className="mt-1">
              Keep the moving object inside the target zone for as long as possible during the
              challenge.
              <br />
              Maximum Score: 1,500 Points
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">
              Daily Energy Score (Maximum: 1,500 Points)
            </h2>
            <ul>
              <li>
                Your Daily Energy Score is calculated by averaging your scores across all three
                games.
              </li>
              <li className="font-semibold">Daily Energy Score = (Reflex + Memory + Balance) ÷ 3</li>
              <li>Maximum Daily Score: 1,500 Points</li>
              <li>If you play multiple times in one day, only your best Daily Score is considered.</li>
              <li>Daily Scores determine your Daily Rank Band and eligibility for the Daily Winner.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">General Energy Rank Bands (All Games)</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-garnet/10">
                    <th className="text-left px-4 py-2 font-bold text-garnet">Energy Rank</th>
                    <th className="text-left px-4 py-2 font-bold text-garnet">
                      Daily Score (Out of 1,500)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">S – Peak Performer</td>
                    <td className="px-4 py-2">1,200 – 1,500 Points</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">A – High Energy</td>
                    <td className="px-4 py-2">900 – 1,199 Points</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">B – Charged Up</td>
                    <td className="px-4 py-2">600 – 899 Points</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">C – Warming Up</td>
                    <td className="px-4 py-2">300 – 599 Points</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">D – Recharge Needed</td>
                    <td className="px-4 py-2">0 – 299 Points</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">
              Global Leaderboard Score (Maximum Gameplay Score: 3,000)
            </h2>
            <p className="mt-1">
              The Global Leaderboard measures your overall campaign performance. Your Global Score
              is calculated using four components:
            </p>
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
                    <td className="px-4 py-2">Referral Points</td>
                    <td className="px-4 py-2">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-semibold mt-4">Global Score Formula</p>
            <p className="mt-1">Global Score = Gameplay Score + (Successful Referrals × 100)</p>
            <p className="mt-1">
              Gameplay Score includes Average Gameplay Performance, Consistency Bonus, and
              Performance Streak Bonus.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">
              Consistency Bonus (Maximum: 1,000 Points)
            </h2>
            <p className="mt-1">
              Play regularly throughout the campaign to earn additional consistency points.
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-garnet/10">
                    <th className="text-left px-4 py-2 font-bold text-garnet">Unique Days Played</th>
                    <th className="text-left px-4 py-2 font-bold text-garnet">Bonus Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">1–5 Days</td>
                    <td className="px-4 py-2">100</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">6–10 Days</td>
                    <td className="px-4 py-2">250</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">11–15 Days</td>
                    <td className="px-4 py-2">450</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">16–20 Days</td>
                    <td className="px-4 py-2">650</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">21–25 Days</td>
                    <td className="px-4 py-2">850</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">26–30 Days</td>
                    <td className="px-4 py-2">1,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="font-semibold mt-4">Rules</p>
            <ul>
              <li>Only one participation per calendar day counts.</li>
              <li>Missing a day does not reset your bonus.</li>
              <li>Playing more than once on the same day does not increase consistency points.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">
              Performance Streak Bonus (Maximum: 500 Points)
            </h2>
            <p className="mt-1">
              Maintain consecutive days of gameplay to unlock streak rewards.
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-garnet/10">
                    <th className="text-left px-4 py-2 font-bold text-garnet">
                      Consecutive Days Played
                    </th>
                    <th className="text-left px-4 py-2 font-bold text-garnet">Bonus Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">7-Day Streak</td>
                    <td className="px-4 py-2">100</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">14-Day Streak</td>
                    <td className="px-4 py-2">200</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">21-Day Streak</td>
                    <td className="px-4 py-2">350</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">30-Day Streak</td>
                    <td className="px-4 py-2">500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">Referral Rewards</h2>
            <p className="mt-1">
              Invite your friends and earn bonus points on the Global Leaderboard.
            </p>
            <p className="font-semibold mt-4">Referral Rules</p>
            <ul>
              <li>Every successful verified referral earns 100 points.</li>
              <li>There is no limit to the number of referrals you can make.</li>
              <li>Referral points are added only to the Global Leaderboard.</li>
              <li>Referrals do not affect your Daily Energy Score or Daily Winner eligibility.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">Daily Winner Rules</h2>
            <p className="mt-1">A Daily Winner is selected every day during the campaign.</p>
            <p className="font-semibold mt-4">Winner Selection</p>
            <ul>
              <li>Highest Daily Energy Score of the day wins.</li>
              <li>Only the player's best score of that day is considered.</li>
              <li>Referrals do not influence Daily Winners.</li>
            </ul>
            <p className="font-semibold mt-4">Tie-Breaker</p>
            <p className="mt-1">
              If multiple players achieve the same Daily Score, the player who achieved that score
              first (earliest timestamp) is declared the winner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">Global Leaderboard Rules</h2>
            <p className="mt-1">
              The Global Leaderboard ranks players throughout the campaign using their overall
              Global Score.
            </p>
            <p className="font-semibold mt-4">Tie-Breaker Priority</p>
            <p className="mt-1">
              If two or more players have the same Global Score, ranking is decided in this order:
            </p>
            <ol>
              <li>More active campaign days played.</li>
              <li>Higher average Reflex Test score.</li>
              <li>Higher average Memory Game score.</li>
              <li>Higher average Balance Game score.</li>
              <li>Higher number of successful referrals.</li>
              <li>Earlier campaign participation timestamp.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">Winner Verification</h2>
            <p className="mt-1">
              All winners will undergo verification before rewards are announced.
            </p>
            <p className="mt-1">Verification may include:</p>
            <ul>
              <li>Registered mobile number submitted during score submission.</li>
              <li>Eligibility validation by the Revital team.</li>
              <li>Duplicate, fraudulent, or invalid entries may be disqualified.</li>
            </ul>
            <p className="mt-1">
              Revital reserves the right to verify participant details before confirming winners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">Important Rules</h2>
            <ul>
              <li>The challenge is open only during the official campaign period.</li>
              <li>Only valid gameplay submissions are eligible for leaderboard consideration.</li>
              <li>Duplicate or fraudulent referrals will not be counted.</li>
              <li>
                Revital reserves the right to remove suspicious or manipulated scores after
                verification.
              </li>
              <li>
                The decision of the Revital team regarding winners and rewards will be final.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-garnet">Reward Categories</h2>
            <p className="font-semibold mt-3">Daily Winners</p>
            <p className="mt-1">Win the daily reward by topping the Daily Leaderboard.</p>
            <p className="font-semibold mt-4">Grand Winners</p>
            <p className="mt-1">
              Top performers on the Global Leaderboard at the end of the campaign will be eligible
              for the Grand Winner Rewards. Final prize details will be announced by the Revital
              team.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
