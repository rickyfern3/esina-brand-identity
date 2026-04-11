"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
  primary?: boolean;
}

const DEFAULT_LINKS: NavLink[] = [
  { href: "/brands",   label: "brands" },
  { href: "/discover", label: "discover" },
  { href: "/audits",   label: "audits" },
  { href: "/match",    label: "match" },
];

interface NavBarProps {
  links?: NavLink[];
}

export default function NavBar({ links = DEFAULT_LINKS }: NavBarProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollYRef.current;

      // At the very top — always show, no auto-hide
      if (currentScrollY < 10) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY > prevScrollY) {
        // Scrolling DOWN — hide immediately
        setVisible(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        // Scrolling UP — show + start 2s auto-hide timer
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 2000);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-6 py-4"
        style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}
      >
        {/* Left links */}
        <nav className="flex items-center gap-8 justify-start">
          {links.slice(0, 2).map((link) =>
            link.primary ? (
              <Link key={link.href} href={link.href} className="btn-primary px-4 py-2 text-xs inline-block">{link.label}</Link>
            ) : (
              <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
            )
          )}
        </nav>

        {/* Center logo */}
        <Link
          href="/"
          className="font-goldman text-white uppercase"
          style={{ fontSize: "32px", letterSpacing: "3px", fontWeight: 700, textAlign: "center" }}
        >
          ESINA
        </Link>

        {/* Right links */}
        <nav className="flex items-center gap-8 justify-end">
          {links.slice(2).map((link) =>
            link.primary ? (
              <Link key={link.href} href={link.href} className="btn-primary px-4 py-2 text-xs inline-block">{link.label}</Link>
            ) : (
              <Link key={link.href} href={link.href} className="nav-link">{link.label}</Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
