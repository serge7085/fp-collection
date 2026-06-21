import type { Metadata } from "next";
import { getSettings, buildWhatsAppUrl } from "@/lib/settings";
import SiteHeader from "@/components/shop/site-header";
import SiteFooter from "@/components/shop/site-footer";
import WhatsAppFloatingButton from "@/components/shop/whatsapp-button";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.seo_title || `${settings.site_name} — ${settings.site_tagline}`,
      template: `%s — ${settings.site_name}`,
    },
    description: settings.seo_description || settings.site_tagline,
    openGraph: {
      title: settings.seo_title || settings.site_name,
      description: settings.seo_description || settings.site_tagline,
      siteName: settings.site_name,
      type: "website",
      images: settings.logo_url ? [{ url: settings.logo_url }] : undefined,
    },
    icons: settings.favicon_url ? { icon: settings.favicon_url } : undefined,
  };
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const whatsappUrl = buildWhatsAppUrl(settings);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloatingButton whatsappUrl={whatsappUrl} />
    </div>
  );
}
