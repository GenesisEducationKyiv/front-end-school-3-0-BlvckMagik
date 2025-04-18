"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-border/40 bg-background">
      <div className="container mx-auto p-8">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-foreground/80"
          >
            Музична бібліотека
          </Link>
        </nav>
      </div>
    </header>
  );
}
