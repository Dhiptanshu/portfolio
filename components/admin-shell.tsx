"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Library, Network, Milestone, Trophy, Images, Share2, Settings, Users, Inbox, Briefcase, Menu, X } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero & Profile", icon: Users },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/journey", label: "Journey", icon: Milestone },
  { href: "/admin/content", label: "Projects", icon: Library },
  { href: "/admin/skills", label: "Skills", icon: Network },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/socials", label: "Social Links", icon: Share2 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-border bg-card/50 p-5 backdrop-blur lg:flex lg:flex-col z-40">
        <div>
          <Link href="/admin" className="font-display text-lg text-primary uppercase">Dhiptanshu Malik</Link>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Admin Panel</p>
          <nav className="mt-8 grid gap-0.5" aria-label="Admin navigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto space-y-3">
          <Link href="/" target="_blank" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
            ← View Portfolio
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="lg:pl-56">
        <header className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-3 backdrop-blur lg:hidden sticky top-0 z-30">
          <Link href="/admin" className="font-display text-lg text-primary uppercase">Dhiptanshu Malik</Link>
          <div className="flex items-center gap-4">
            <AdminLogoutButton />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 border border-border rounded bg-muted text-foreground">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-[60px] bg-background/95 backdrop-blur z-30 p-4 overflow-y-auto">
            <nav className="grid gap-2 mb-8">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium border border-border/50 bg-card text-foreground transition-colors hover:bg-secondary"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/" target="_blank" className="block text-center p-3 border border-border rounded bg-muted text-foreground">
              ← View Portfolio
            </Link>
          </div>
        )}

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
