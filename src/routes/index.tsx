import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { getUser } from "@/lib/storage";
import { Leaderboard } from "@/components/Leaderboard";
import { InstagramFeed } from "@/components/InstagramFeed";
import { EndingSoonBanner } from "@/components/EndingSoonBanner";
import { PlayerAvatarsCarousel } from "@/components/PlayerAvatarsCarousel";
import { getDailyLeaderboard, getGlobalLeaderboard, type LeaderEntry } from "@/lib/leaderboard";
import heroWordmark from "@/assets/revital-hero-wordmark.webp";
import readyDesktop from "@/assets/ready-desktop-new.webp";
import readyMobile from "@/assets/ready-mobile.webp";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const defaultAnnouncement = "The challenge has ended";
  const [daily, setDaily] = useState<LeaderEntry[]>([]);
  const [global, setGlobal] = useState<LeaderEntry[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([defaultAnnouncement]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showInstaBadge, setShowInstaBadge] = useState(true);
  const [endingSoon, setEndingSoon] = useState<{
    endAt: string;
    heading: string;
    subheading: string;
    message: string;
  } | null>(null);
  useEffect(() => {
    setIsLoggedIn(Boolean(getUser()));
    const syncAuth = () => setIsLoggedIn(Boolean(getUser()));
    window.addEventListener("revital-auth-changed", syncAuth);

    getDailyLeaderboard().then(setDaily);
    getGlobalLeaderboard().then(setGlobal);
    import("@/server/adminFns")
      .then((mod) => mod.getPlatformSettingsFn())
      .then((settings) => {
        if (
          settings.endingSoonEnabled &&
          settings.endingSoonEndAt &&
          Date.now() < new Date(settings.endingSoonEndAt).getTime()
        ) {
          setEndingSoon({
            endAt: settings.endingSoonEndAt,
            heading: settings.endingSoonHeading,
            subheading: settings.endingSoonSubheading,
            message: settings.endingSoonMessage,
          });
        }
        setAnnouncements([defaultAnnouncement]);
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

          {endingSoon && (
            <EndingSoonBanner
              endAt={endingSoon.endAt}
              heading={endingSoon.heading}
              subheading={endingSoon.subheading}
              message={endingSoon.message}
            />
          )}

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
            Play 3 quick games. Score your energy.
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
              HOW TO PLAY
            </div>
            <h2 className="mt-3 text-3xl md:text-5xl font-black text-garnet">
              Get Started in <span className="text-gradient-energy">3 Easy Steps</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Three quick games. One energy-filled experience.
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                emoji: "⚡",
                title: "START PLAYING",
                desc: 'Hit "Start Now!" to jump into the Revital Energy Challenge.',
              },
              {
                step: "02",
                emoji: "🎯",
                title: "PLAY 3 QUICK GAMES",
                desc: "Take on Reflex, Balance, and Memory, with each game testing a different skill.",
              },
              {
                step: "03",
                emoji: "🏆",
                title: "GET YOUR ENERGY SCORE",
                desc: "Complete all three games and discover your Energy Score.",
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

          {global.length >= 3 && (
            <div className="relative mt-12 md:mt-16 w-full max-w-4xl mx-auto px-2 sm:px-4">
              <div className="text-center mb-8 sm:mb-10">
                <div className="inline-block px-4 sm:px-6 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-[#FDE68A] via-[#FBBF24] to-[#FDE68A] text-[#78350F] text-[10px] sm:text-xs uppercase tracking-[0.25em] font-black border border-[#F59E0B]/40 mb-3">
                  THE TOP 3 CHAMPIONS
                </div>
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <svg viewBox="0 0 40 28" className="w-7 h-5 sm:w-10 sm:h-7 text-[#D97706] fill-current">
                    <path d="M38 24 C28 20 14 14 4 4" stroke="#B45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <ellipse cx="6" cy="6" rx="4.5" ry="2.5" transform="rotate(-30 6 6)" />
                    <ellipse cx="14" cy="11" rx="4.5" ry="2.5" transform="rotate(-20 14 11)" />
                    <ellipse cx="23" cy="16" rx="4.5" ry="2.5" transform="rotate(-10 23 16)" />
                    <ellipse cx="32" cy="21" rx="4.5" ry="2.5" transform="rotate(0 32 21)" />
                  </svg>
                  <span className="text-3xl sm:text-5xl filter drop-shadow-[0_4px_6px_rgba(217,119,6,0.35)] select-none">
                    🏆
                  </span>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#451A03] drop-shadow-sm">
                    GRAND WINNERS
                  </h2>
                  <svg viewBox="0 0 40 28" className="w-7 h-5 sm:w-10 sm:h-7 text-[#D97706] fill-current scale-x-[-1]">
                    <path d="M38 24 C28 20 14 14 4 4" stroke="#B45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <ellipse cx="6" cy="6" rx="4.5" ry="2.5" transform="rotate(-30 6 6)" />
                    <ellipse cx="14" cy="11" rx="4.5" ry="2.5" transform="rotate(-20 14 11)" />
                    <ellipse cx="23" cy="16" rx="4.5" ry="2.5" transform="rotate(-10 23 16)" />
                    <ellipse cx="32" cy="21" rx="4.5" ry="2.5" transform="rotate(0 32 21)" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-5 items-end">
                {[
                  { entry: global[1], rank: "2nd", medal: "🥈", size: "w-20 h-20 sm:w-28 sm:h-28", nameSize: "text-xs sm:text-base", border: "border-[#F59E0B]/70 shadow-[0_8px_20px_-6px_rgba(217,119,6,0.28)]", scale: "" },
                  { entry: global[0], rank: "1st", medal: "🥇", size: "w-24 h-24 sm:w-32 sm:h-32", nameSize: "text-sm sm:text-lg", border: "border-[#FEF08A] shadow-[0_0_0_4px_rgba(253,230,138,0.55),0_20px_45px_-8px_rgba(217,119,6,0.45)]", scale: "scale-[1.06] z-10" },
                  { entry: global[2], rank: "3rd", medal: "🥉", size: "w-20 h-20 sm:w-28 sm:h-28", nameSize: "text-xs sm:text-base", border: "border-[#F59E0B]/70 shadow-[0_8px_20px_-6px_rgba(217,119,6,0.28)]", scale: "" },
                ].map(({ entry, rank, medal, size, nameSize, border, scale }) => (
                  <div
                    key={rank}
                    className={`relative flex flex-col items-center rounded-2xl sm:rounded-3xl border-2 bg-gradient-to-b from-[#FCD34D] via-[#FBBF24] to-[#F59E0B] p-3 sm:p-4 text-center ${border} ${scale}`}
                  >
                    <span className="text-[10px] sm:text-xs font-black text-[#78350F]/80 tracking-widest uppercase mb-2 select-none">
                      {medal} {rank}
                    </span>
                    <div
                      className={`rounded-full overflow-hidden flex items-end justify-center bg-gradient-to-b from-[#FFFDF0] via-[#FDE68A] to-[#F59E0B] p-[3px] sm:p-1 mb-3 ${size}`}
                      style={{ containerType: "inline-size" }}
                    >
                      <div
                        className="w-full h-full rounded-full overflow-hidden flex items-end justify-center bg-gradient-energy"
                        style={{ containerType: "inline-size" }}
                      >
                        <span
                          className="leading-none drop-shadow-sm origin-bottom scale-x-[1.35] scale-y-[1.25] select-none"
                          style={{ fontSize: "clamp(2rem, 60cqw, 6rem)" }}
                        >
                          👤
                        </span>
                      </div>
                    </div>
                    <p className={`font-black truncate w-full px-1 text-[#3E1B02] leading-tight ${nameSize}`}>
                      {entry?.name}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-white/30 text-[#78350F] font-black text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 rounded-full border border-white/50">
                      <span className="text-[#D97706]">★</span>
                      <span>{entry?.total.toLocaleString()} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          {/* Leaderboard block hidden on staging, set to true to restore */}
          {false && (
          <>
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
              highlightWinner
              showMedals={false}
            />
            <Leaderboard
              title="Grand Prize Leaderboard"
              subtitle="All-Time Top 10"
              emoji="👑"
              entries={global}
              accent="marigold"
              highlightWinner={false}
              showMedals
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
          </>
          )}

          <div id="instagram-feed" className="mt-20 md:mt-24 scroll-mt-24 text-center">
            <a
              href="https://www.instagram.com/revital.uae"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("social_click", { platform: "instagram", source: "hacks_section" })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--garnet)] text-white font-bold hover:scale-105 active:scale-95 transition-transform shadow-button"
            >
              Follow us on Instagram →
            </a>

            <div className="mt-6">
              <InstagramFeed />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
