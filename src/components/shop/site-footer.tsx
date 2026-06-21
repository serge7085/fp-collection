import Link from "next/link";
import type { Settings } from "@/lib/database.types";

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 border border-bone/15 flex items-center justify-center text-bone/50 hover:text-gold hover:border-gold/40 transition-colors"
    >
      {icon}
    </a>
  );
}

export default function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-bone/10 mt-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <div className="font-serif text-lg tracking-[0.1em] mb-2">
            {settings.site_name}
          </div>
          {settings.site_tagline && (
            <p className="font-serif italic text-gold text-sm mb-4">
              {settings.site_tagline}
            </p>
          )}
          <div className="flex gap-2 mt-4">
            {settings.tiktok_url && (
              <SocialLink
                href={settings.tiktok_url}
                label="TikTok"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.6 5.82c-1.05-.92-1.65-2.25-1.65-3.7h-3.07v13.6a2.56 2.56 0 01-4.6 1.53 2.55 2.55 0 011.65-4.45c.26 0 .5.04.74.1V9.83a5.6 5.6 0 00-.74-.05A5.62 5.62 0 003.35 17.5a5.62 5.62 0 0010.7-2.4V8.4a8.18 8.18 0 004.78 1.53V6.87a4.85 4.85 0 01-2.23-1.05z" />
                  </svg>
                }
              />
            )}
            {settings.instagram_url && (
              <SocialLink
                href={settings.instagram_url}
                label="Instagram"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                  </svg>
                }
              />
            )}
            {settings.facebook_url && (
              <SocialLink
                href={settings.facebook_url}
                label="Facebook"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.36C16.2 4.32 15.2 4.24 14 4.24c-2.4 0-4 1.46-4 4.15V10.5H7.5v3H10V21h3.5z" />
                  </svg>
                }
              />
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/40 mb-4">
            Boutique
          </h3>
          <div className="flex flex-col gap-2.5">
            <Link href="/products" className="text-sm text-bone/60 hover:text-gold transition-colors">
              Tous les produits
            </Link>
            <Link href="/vendors" className="text-sm text-bone/60 hover:text-gold transition-colors">
              Nos vendeurs
            </Link>
            <Link href="/a-propos" className="text-sm text-bone/60 hover:text-gold transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-sm text-bone/60 hover:text-gold transition-colors">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/40 mb-4">
            Contact
          </h3>
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-bone/60 hover:text-gold transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-bone/5 px-5 sm:px-8 py-5 text-[0.65rem] text-bone/25 tracking-wide">
        © {year} {settings.site_name} · Marketplace premium africaine
      </div>
    </footer>
  );
}
