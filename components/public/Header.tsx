"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import Logo from "@/components/brand/Logo";
import { publicNav } from "@/lib/mock-data";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-10">
      <div
        className={[
          "mx-auto max-w-7xl rounded-[1.75rem] border px-5 py-4 transition-all duration-300 lg:px-7",
          scrolled
            ? "surface border-[var(--border-strong)] shadow-sm"
            : "border-transparent bg-white/50 backdrop-blur-sm",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-[var(--ink)] transition hover:bg-white hover:text-[var(--brand)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:text-[var(--brand)]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#1a3a8f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152d73]"
            >
              Start free trial
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--ink)] shadow-sm lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="mt-4 rounded-[1.5rem] border border-[var(--border)] bg-white p-3 shadow-lg lg:hidden">
            <div className="space-y-1">
              {publicNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3"
                >
                  <div className="text-sm font-semibold text-[var(--ink)]">{item.label}</div>
                  <div className="mt-1 text-sm text-[var(--ink)]">{item.description}</div>
                </Link>
              ))}
            </div>
            <div className="mt-3 grid gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-[#1a3a8f] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Start free trial
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
