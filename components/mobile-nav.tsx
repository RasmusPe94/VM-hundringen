"use client";

import { useState } from "react";
import Link from "next/link";
import { adminSignOutAction, signOutAction } from "@/lib/actions";

type NavItem = { href: string; label: string };

type MobileNavProps = {
  navItems: NavItem[];
  adminItems: NavItem[];
  isAdmin: boolean;
  playerName: string | null;
  showUser: boolean;
};

export function MobileNav({ navItems, adminItems, isAdmin, playerName, showUser }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        aria-label="Öppna meny"
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition hover:border-border hover:text-body md:hidden"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-surface/95 backdrop-blur-sm shadow-lg md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            {playerName && (
              <div className="mb-2 rounded-md bg-rim px-3 py-2 text-sm font-medium text-body">
                👤 {playerName}
              </div>
            )}

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-rim hover:text-body"
              >
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <>
                <div className="my-2 border-t border-border" />
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold/60">Admin</p>
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2.5 text-sm font-medium text-gold/70 transition hover:bg-gold/10 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}

            <div className="mt-2 border-t border-border pt-2 space-y-1">
              {showUser && (
                <form action={signOutAction}>
                  <button
                    className="w-full rounded-md border border-border px-3 py-2.5 text-left text-sm font-semibold text-muted transition hover:border-gold/50 hover:text-gold"
                    type="submit"
                  >
                    Byt spelare
                  </button>
                </form>
              )}
              {isAdmin ? (
                <form action={adminSignOutAction}>
                  <button
                    className="w-full rounded-md bg-gold/10 border border-gold/30 px-3 py-2.5 text-left text-sm font-semibold text-gold transition hover:bg-gold/20"
                    type="submit"
                  >
                    🔑 Logga ut admin
                  </button>
                </form>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-md border border-border px-3 py-2.5 text-sm font-semibold text-muted transition hover:text-body"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
