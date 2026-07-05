import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublicPortfolio } from "@/lib/data";
import { EmptyState } from "@/components/empty-state";

export default async function Home() {
  const { sections, socials } = await getPublicPortfolio();

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-xl text-primary">Dhiptanshu.</Link>
          <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {sections.map((section) => <a key={section.id} href={`#${section.slug}`} className="hover:text-foreground">{section.title}</a>)}
          </div>
        </div>
      </nav>

      <section className="luxury-grid relative mx-auto grid min-h-[82vh] max-w-6xl content-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm uppercase tracking-[0.24em] text-primary">Dynamic Portfolio OS</p>
          <h1 className="font-serif text-5xl leading-tight text-foreground sm:text-7xl">A living resume for the work behind the craft.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Every section, entry, link, and asset on this portfolio is managed through the admin dashboard and rendered from Supabase content.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {socials.map((social) => (
              <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary">
                {social.name}<ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        {sections.length === 0 ? (
          <EmptyState title="No visible sections yet" description="Configure Supabase and publish sections from the admin dashboard." />
        ) : (
          <div className="grid gap-16">
            {sections.map((section) => (
              <section key={section.id} id={section.slug} className="scroll-mt-24">
                <div className="mb-6 flex flex-col justify-between gap-3 border-b border-border pb-5 md:flex-row">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">{section.type}</p>
                    <h2 className="mt-2 font-serif text-3xl">{section.title}</h2>
                  </div>
                  {section.description ? <p className="max-w-xl text-sm leading-6 text-muted-foreground">{section.description}</p> : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.entries?.map((entry) => (
                    <article key={entry.id} className="rounded-lg border border-border bg-card p-5">
                      <h3 className="text-lg font-medium">{entry.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.short_description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>)}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
