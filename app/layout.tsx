import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getUserProfile } from "@/lib/auth";
import { getIsAdmin } from "@/lib/cookies";
import { adminSignOutAction, signOutAction } from "@/lib/actions";
import { MobileNav } from "@/components/mobile-nav";


export const metadata: Metadata = {
  title: "VM-hundringen 2026 🏆",
  description: "Privat bettingtävling för fotbolls-VM 2026"
};

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/leaderboard", label: "Topplista" },
  { href: "/bets",        label: "Alla spel" },
  { href: "/my-bets",     label: "Mina spel" },
  { href: "/bets/new",    label: "+ Nytt spel" },
  { href: "/profile",     label: "Min profil" },
  { href: "/rules",       label: "Regler" }
];

const adminItems = [
  { href: "/admin/bets",    label: "Spel" },
  { href: "/admin/matches", label: "Matcher" },
  { href: "/admin/users",   label: "Spelare" }
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserProfile();
  const isAdmin = getIsAdmin();

  return (
    <html lang="sv">
      <body className="pitch-watermark">
        <div className="min-h-screen flex flex-col">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
            {/* Gold top stripe */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between py-3 gap-4">
                {/* Logo */}
                <Link href={user ? "/leaderboard" : "/login"} className="focus-ring rounded-sm shrink-0">
                  <span className="text-lg font-black tracking-tight logo-text sm:text-xl">
                    VM-hundringen 2026 🏆
                  </span>
                </Link>

                {/* Desktop: right side actions */}
                <div className="hidden md:flex items-center gap-2 text-sm">
                  {user ? (
                    <>
                      <span className="rounded-md bg-rim border border-border px-3 py-1.5 text-sm font-medium text-body">
                        👤 {profile?.display_name}
                      </span>
                      <form action={signOutAction}>
                        <button className="focus-ring rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-muted transition hover:border-gold/50 hover:text-gold">
                          Byt spelare
                        </button>
                      </form>
                    </>
                  ) : (
                    <Link href="/login" className="focus-ring rounded-md bg-turf px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-turf2">
                      Välj spelare
                    </Link>
                  )}
                  {!isAdmin ? (
                    <Link href="/admin/login" className="focus-ring rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-border hover:text-body">
                      Admin
                    </Link>
                  ) : (
                    <form action={adminSignOutAction}>
                      <button className="focus-ring rounded-md bg-gold/10 border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/20">
                        🔑 Logga ut admin
                      </button>
                    </form>
                  )}
                </div>

                {/* Mobile: hamburger */}
                {(user || isAdmin) && (
                  <MobileNav
                    navItems={user ? navItems : []}
                    adminItems={isAdmin ? adminItems : []}
                    isAdmin={isAdmin}
                    playerName={profile?.display_name ?? null}
                    showUser={!!user}
                  />
                )}
              </div>

              {/* Desktop nav */}
              {(user || isAdmin) ? (
                <nav className="hidden md:flex flex-wrap gap-1 pb-2 text-sm font-medium">
                  {user ? navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="focus-ring rounded-md px-3 py-1.5 text-muted transition hover:bg-rim hover:text-body"
                    >
                      {item.label}
                    </Link>
                  )) : null}
                  {isAdmin ? (
                    <>
                      <span className="mx-1 self-center text-border">|</span>
                      {adminItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="focus-ring rounded-md px-3 py-1.5 text-gold/70 transition hover:bg-gold/10 hover:text-gold"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </>
                  ) : null}
                </nav>
              ) : null}
            </div>
          </header>

          {/* ── Main ───────────────────────────────────────────────────── */}
          <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </main>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <footer className="border-t border-border py-4 text-center text-xs text-muted">
            VM-hundringen 2026 · Privat bettingtävling 🍺
          </footer>
        </div>
      </body>
    </html>
  );
}
