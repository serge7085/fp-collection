import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Settings } from "@/lib/database.types";
import MobileMenu from "./mobile-menu";

export default async function SiteHeader({ settings }: { settings: Settings }) {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("display_order")
    .limit(6);

  const navItems = (categories ?? []).map((c) => ({
    label: c.name,
    href: `/collections/${c.slug}`,
  }));

  return (
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur-sm border-b border-bone/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={settings.site_name} className="h-9 w-auto" />
          ) : (
            <div className="w-9 h-9 border border-gold flex items-center justify-center text-gold text-xs font-semibold">
              {settings.site_name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}
          <span className="hidden sm:inline text-sm tracking-[0.2em] uppercase">
            {settings.site_name}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/55 hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/vendors"
            className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/55 hover:text-gold transition-colors"
          >
            Vendeurs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="hidden sm:inline-flex text-[0.65rem] uppercase tracking-[0.15em] text-bone/55 hover:text-gold transition-colors"
          >
            Rechercher
          </Link>
          <MobileMenu navItems={[...navItems, { label: "Vendeurs", href: "/vendors" }]} />
        </div>
      </div>
    </header>
  );
}
