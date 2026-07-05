import Link from "next/link";
import { LayoutDashboard, Layers3, Library, Share2, Images, Network, Milestone, Trophy } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/sections", label: "Sections", icon: Layers3 },
  { href: "/admin/content", label: "Content", icon: Library },
  { href: "/admin/skills", label: "Skills", icon: Network },
  { href: "/admin/journey", label: "Journey", icon: Milestone },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/media", label: "Media", icon: Images },
  { href: "/admin/socials", label: "Socials", icon: Share2 }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/55 p-5 backdrop-blur lg:flex lg:flex-col">
        <div>
          <Link href="/admin" className="font-serif text-xl text-primary">Dhiptanshu.</Link>
          <nav className="mt-10 grid gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto">
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="flex items-center justify-between border-b border-border bg-card/55 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/admin" className="font-serif text-lg text-primary">Dhiptanshu.</Link>
          <div className="w-32">
            <AdminLogoutButton />
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
