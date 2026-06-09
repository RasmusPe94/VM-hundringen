import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getUserProfile } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";

export const metadata: Metadata = {
  title: "VM 1000 2026",
  description: "Privat bettingtävling för fotbolls-VM 2026"
};

const navItems = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/bets", label: "Alla spel" },
  { href: "/my-bets", label: "Mina spel" },
  { href: "/bets/new", label: "Nytt spel" },
  { href: "/rules", label: "Regler" }
];

const adminItems = [
  { href: "/admin/matches", label: "Matcher" },
  { href: "/admin/settle", label: "Avgör spel" }
];

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile, supabaseConfigured } = await getUserProfile();
  const isAdmin = profile?.role === "admin";

  return (
    <html lang="sv">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  className="focus-ring rounded-sm text-xl font-black tracking-normal text-ink"
                  href={user ? "/leaderboard" : "/login"}
                >
                  VM 1000 2026
                </Link>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {user ? (
                    <>
                      <span className="rounded-md bg-paper px-3 py-2 font-medium text-neutral-700">
                        {profile?.display_name ?? user.email}
                      </span>
                      <form action={signOutAction}>
                        <button
                          className="focus-ring rounded-md border border-neutral-300 px-3 py-2 font-semibold text-neutral-700 transition hover:bg-neutral-100"
                          type="submit"
                        >
                          Logga ut
                        </button>
                      </form>
                    </>
                  ) : (
                    <Link
                      className="focus-ring rounded-md bg-grass px-3 py-2 font-semibold text-white transition hover:bg-[#11633c]"
                      href="/login"
                    >
                      Logga in
                    </Link>
                  )}
                </div>
              </div>
              {user ? (
                <nav className="flex flex-wrap gap-2 text-sm font-semibold text-neutral-700">
                  {navItems.map((item) => (
                    <Link
                      className="focus-ring rounded-md px-3 py-2 transition hover:bg-paper"
                      href={item.href}
                      key={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isAdmin
                    ? adminItems.map((item) => (
                        <Link
                          className="focus-ring rounded-md px-3 py-2 text-clay transition hover:bg-paper"
                          href={item.href}
                          key={item.href}
                        >
                          {item.label}
                        </Link>
                      ))
                    : null}
                </nav>
              ) : null}
            </div>
          </header>
          {!supabaseConfigured ? (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Lägg till Supabase-miljövariabler för att aktivera inloggning och data.
            </div>
          ) : null}
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
