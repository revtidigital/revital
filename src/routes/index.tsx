import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { getUser } from "@/lib/storage";
import { InstagramFeed } from "@/components/InstagramFeed";
import { Leaderboard } from "@/components/Leaderboard";
import { PlayerAvatarsCarousel } from "@/components/PlayerAvatarsCarousel";
import { getDailyLeaderboard, getGlobalLeaderboard, type LeaderEntry } from "@/lib/leaderboard";
import heroWordmark from "@/assets/revital-hero-wordmark.webp";
import readyDesktop from "@/assets/ready-desktop-new.webp";
import readyMobile from "@/assets/ready-mobile.webp";

export const Route = createFileRoute("/")({
  component: Landing,
});

const SCORE_BOOST_HACKS = [
  {
    emoji: "📅",
    title: "PLAY REGULARLY",
    description: "Play on more days to unlock Consistency Bonus points.",
  },
  {
    emoji: "🔥",
    title: "BUILD YOUR STREAK",
    description: "Maintain consecutive days of gameplay to earn Streak Bonus points.",
  },
  {
    emoji: "🎮",
    title: "IMPROVE YOUR GAMEPLAY",
    description: "Your Gameplay Score can contribute up to 1,500 points to your Global Score.",
  },
  {
    emoji: "🤝",
    title: "REFER & CLIMB",
    description:
      "Earn 100 bonus points for every successful verified referral, with no limit. Referral points boost your Global Leaderboard score only.",
  },
  {
    emoji: "🏔️",
    title: "KEEP PLAYING, KEEP CLIMBING",
    description: "Every day and every point can take you closer to the top.",
  },
] as const;

function Landing() {
  const defaultAnnouncement = "🔥 Play now and become today's Revital Energy Challenge winner!";
  const [daily, setDaily] = useState<LeaderEntry[]>([]);
  const [global, setGlobal] = useState<LeaderEntry[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([defaultAnnouncement]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showInstaBadge, setShowInstaBadge] = useState(true);
  useEffect(() => {
    setIsLoggedIn(Boolean(getUser()));
    const syncAuth = () => setIsLoggedIn(Boolean(getUser()));
    window.addEventListener("revital-auth-changed", syncAuth);

    getDailyLeaderboard().then(setDaily);
    getGlobalLeaderboard().then(setGlobal);
    import("@/server/adminFns")
      .then((mod) => mod.getPlatformSettingsFn())
      .then((settings) => {
        if (settings.homeAnnouncementMode === "text") {
          const texts = (settings.homeAnnouncementTexts ?? [])
            .map((text) => text.trim())
            .filter(Boolean);
          setAnnouncements(texts.length ? texts : [defaultAnnouncement]);
          return;
        }
        if (settings.homeAnnouncementMode === "leaderboard") {
          getDailyLeaderboard().then((entries) => {
            const leaderboardTexts = entries
              .slice(0, 10)
              .map((entry, index) => `🏅 #${index + 1} ${entry.name} — ${entry.total} pts`);
            setAnnouncements(leaderboardTexts.length ? leaderboardTexts : [defaultAnnouncement]);
          });
          return;
        }
        import("@/server/adminFns")
          .then((mod) => mod.getPreviousDayWinnersFn())
          .then(({ date, winners }) => {
            if (!winners.length) {
              setAnnouncements([defaultAnnouncement]);
              return;
            }
            const texts = winners.map((w) => `🏆 Winner (${date}): ${w.name} — ${w.score} pts`);
            setAnnouncements(texts);
          })
          .catch(() => setAnnouncements([defaultAnnouncement]));
      })
      .catch(() => null);

    return () => window.removeEventListener("revital-auth-changed", syncAuth);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--marigold)] rounded-full blur-3xl opacity-50 float-anim" />
      <div
        className="absolute top-40 -left-32 w-96 h-96 bg-[var(--tiger)] rounded-full blur-3xl opacity-30 float-anim"
        style={{ animationDelay: "1.5s" }}
      />

      <AnimatePresence>
        {showInstaBadge && (
          <motion.a
            href="https://www.instagram.com/revital.uae"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("social_click", { platform: "instagram", source: "floating_badge" })}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed top-1/2 right-0 -translate-y-1/2 z-50 flex flex-col items-center gap-1 bg-white/95 backdrop-blur border-2 border-r-0 border-[var(--garnet)]/15 rounded-l-2xl shadow-card px-2.5 py-3 sm:px-3 sm:py-4 max-w-[72px] sm:max-w-[110px] text-center"
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowInstaBadge(false);
                trackEvent("instagram_badge_dismissed");
              }}
              aria-label="Close"
              className="absolute -top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--garnet)] text-white text-xs flex items-center justify-center shadow-button hover:scale-110 active:scale-95 transition-transform"
            >
              ✕
            </button>
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 sm:w-7 sm:h-7 shrink-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEDA75" />
                  <stop offset="25%" stopColor="#FA7E1E" />
                  <stop offset="50%" stopColor="#D62976" />
                  <stop offset="75%" stopColor="#962FBF" />
                  <stop offset="100%" stopColor="#4F5BD5" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-gradient)" />
              <rect
                x="6.5"
                y="6.5"
                width="11"
                height="11"
                rx="3.5"
                stroke="white"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12" r="3.2" stroke="white" strokeWidth="1.6" />
              <circle cx="16.2" cy="7.8" r="1" fill="white" />
            </svg>
            <span className="text-[9px] sm:text-[12px] font-bold leading-tight text-garnet">
              Follow us on Instagram
            </span>
            <span className="text-[8px] sm:text-[11px] font-medium leading-tight text-garnet/70">
              for the winner updates
            </span>
          </motion.a>
        )}
      </AnimatePresence>

      <div className="announcement-track">
        <div className="announcement-marquee">
          {[...announcements, ...announcements].map((item, index) => (
            <span key={`${item}-${index}`} aria-hidden={index >= announcements.length}>
              {item}
            </span>
          ))}
        </div>
      </div>
      <Header />

      {/* HERO */}
      <main className="relative max-w-6xl mx-auto px-4 pt-6 md:pt-10 max-[900px]:pt-4 pb-16">
        <section id="hero-section" className="scroll-mt-24 text-center">
          <motion.img
            src={heroWordmark}
            alt="Revital Energy Challenge"
            className="mx-auto h-24 md:h-40 max-[900px]:h-20 w-auto drop-shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.1 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 max-[900px]:mt-3 inline-block px-4 py-1.5 rounded-full bg-[var(--garnet)] text-white text-xs uppercase tracking-[0.2em] font-bold shadow-button"
          >
            ⚡ Power Up. Play. Conquer.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 max-[900px]:mt-3 text-4xl md:text-6xl max-[900px]:text-3xl font-black leading-[1.05] text-garnet"
          >
            YOUR DAY TESTS YOU
            <br />
            <span className="text-gradient-energy">ARE YOU READY?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-4 max-[900px]:mt-3 text-base md:text-lg max-[900px]:text-sm text-garnet/80 max-w-2xl mx-auto"
          >
            Take the Revital{" "}
            <span className="font-script text-[var(--tiger)] text-xl md:text-2xl">
              Energy Challenge
            </span>
            <br />
            Play 3 quick games. Score your energy. Climb the leaderboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-5 max-[900px]:mt-4 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/play/reflex"
              onClick={() => trackEvent("cta_click", { cta_label: "start_now" })}
              className="group relative inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-energy text-white font-bold text-lg shadow-button glow-pulse hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="relative z-10">Start Now! →</span>
              <span className="absolute inset-0 rounded-full shimmer opacity-0 group-hover:opacity-100" />
            </Link>
            <Link
              to={isLoggedIn ? "/profile" : "/auth"}
              onClick={() => trackEvent("cta_click", { cta_label: "view_score" })}
              className="px-6 py-4 rounded-full border-2 border-[var(--garnet)]/20 bg-white/80 backdrop-blur text-garnet hover:bg-white hover:border-[var(--tiger)] transition-colors font-semibold"
            >
              View My Score
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 max-[900px]:mt-4 max-w-4xl mx-auto rounded-3xl border-2 border-[var(--garnet)]/10 bg-white/85 p-3 md:p-4 max-[900px]:p-2 backdrop-blur shadow-card"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--garnet)]/10 bg-white/70 p-4 text-left">
                <div className="text-5xl md:text-6xl leading-none">🏆</div>
                <div>
                  <p className="text-2xl font-black uppercase leading-tight text-garnet">
                    <span className="text-[var(--tiger)]">1 Winner</span> Everyday
                  </p>
                  <p className="mt-1 text-sm md:text-base text-garnet/80">
                    Top the daily leaderboard and win the daily reward.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--garnet)]/10 bg-white/70 p-4 text-left">
                <div className="text-5xl md:text-6xl leading-none">🎁</div>
                <div>
                  <p className="text-2xl font-black uppercase leading-tight text-garnet">
                    <span className="text-[var(--tiger)]">3 Grand</span> Global Winners
                  </p>
                  <p className="mt-1 text-sm md:text-base text-garnet/80">
                    Compete across players and win the ultimate prize.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-garnet/70">
              Daily winners announced on our Instagram.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 max-[900px]:mt-5 grid grid-cols-3 gap-2 sm:gap-3 md:gap-6 max-w-2xl mx-auto"
          >
            {[
              { n: "3", label: "Quick games" },
              { n: "15s", label: "Per challenge" },
              { n: "Daily", label: "Leaderboard" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/90 border-2 border-[var(--garnet)]/10 rounded-2xl p-2 sm:p-4 backdrop-blur shadow-card min-w-0"
              >
                <div className="text-xl sm:text-2xl md:text-4xl font-black text-gradient-energy">
                  {s.n}
                </div>
                <div className="text-[9px] sm:text-[11px] md:text-sm text-muted-foreground uppercase tracking-wide sm:tracking-wider mt-1 font-semibold whitespace-nowrap sm:whitespace-normal">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* HOW TO PARTICIPATE */}
        <section id="how-to-participate" className="scroll-mt-24 mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--tiger)] text-white text-xs uppercase tracking-[0.2em] font-black">
              🎮 How to Participate
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-garnet">
              Get Started in <span className="text-gradient-energy">3 Easy Steps</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              No sign-up required. Just show up, play, and win.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                emoji: "⚡",
                title: "Start the Challenge",
                desc: 'Hit "Start Now!" to kick off your first mini-game. No account needed — just your energy and reflexes.',
              },
              {
                step: "02",
                emoji: "🎯",
                title: "Play 3 Quick Games",
                desc: "Complete the Reflex, Balance, and Memory challenges. Each game takes about 15 seconds. Score as high as you can!",
              },
              {
                step: "03",
                emoji: "🏆",
                title: "Claim Your Score",
                desc: "Enter your number to save your score, climb the leaderboard, and compete for the daily prize.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white/90 border-2 border-[var(--garnet)]/10 rounded-2xl p-6 backdrop-blur shadow-card flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-black text-[var(--tiger)] uppercase tracking-widest">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-black text-garnet">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Link
              to="/play/reflex"
              onClick={() => trackEvent("cta_click", { cta_label: "im_ready" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-energy text-white font-bold text-lg shadow-button glow-pulse hover:scale-105 active:scale-95 transition-transform"
            >
              I'm Ready — Let's Go! →
            </Link>
          </motion.div>

          <PlayerAvatarsCarousel />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-8 rounded-2xl overflow-hidden"
          >
            <img
              src={readyMobile}
              alt="Introducing the new look"
              loading="lazy"
              className="block md:hidden w-full h-auto"
            />
            <img
              src={readyDesktop}
              alt="Introducing the new look"
              loading="lazy"
              className="hidden md:block w-full h-auto"
            />
          </motion.div>
        </section>

        {/* LEADERBOARDS */}
        <section id="leaderboard-section" className="scroll-mt-24 mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--marigold)] text-garnet text-xs uppercase tracking-[0.2em] font-black">
              🏆 Hall of Champions
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-garnet">
              Who's <span className="text-gradient-energy">Topping the Charts?</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Daily prize for the daily board. Eternal glory for the global one.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2">
            <Leaderboard
              title="Today's Leaders"
              subtitle="Daily Reward Pool"
              emoji="🔥"
              entries={daily}
              accent="tiger"
            />
            <Leaderboard
              title="Global Leaderboard"
              subtitle="All-Time Top 10"
              emoji="👑"
              entries={global}
              accent="marigold"
              highlightWinner={false}
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/play/reflex"
              onClick={() => trackEvent("cta_click", { cta_label: "join_leaderboard" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--garnet)] text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-button"
            >
              Join the Leaderboard →
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 text-center"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--tiger)] text-white text-xs uppercase tracking-[0.2em] font-black">
              🚀 Hacks to Boost Your Global Score
            </div>
          </motion.div>

          <div className="mt-8 flex flex-wrap justify-center gap-5">
            {SCORE_BOOST_HACKS.map((hack, i) => (
              <motion.div
                key={hack.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/90 border-2 border-[var(--garnet)]/10 rounded-2xl p-6 backdrop-blur shadow-card flex flex-col gap-3 w-full sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-0.834rem)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{hack.emoji}</span>
                  <span className="text-xs font-black text-[var(--tiger)] uppercase tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-black text-garnet">{hack.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{hack.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://www.instagram.com/revital.uae"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("social_click", { platform: "instagram", source: "hacks_section" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--garnet)] text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-button"
            >
              Follow us on Instagram →
            </a>
          </div>
        </section>

        {/* INSTAGRAM */}
        <section id="instagram-feed" className="scroll-mt-24 mt-20 md:mt-28">
          <InstagramFeed />
        </section>
      </main>
    </div>
  );
}
