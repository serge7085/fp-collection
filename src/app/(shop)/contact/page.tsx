import { getSettings, buildWhatsAppUrl } from "@/lib/settings";

export const metadata = {
  title: "Contact",
  description: "Contactez F-P Collection par WhatsApp ou retrouvez-nous sur les réseaux sociaux.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsappUrl = buildWhatsAppUrl(settings);

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-20 text-center">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3">
        Restons en contact
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-5">
        Contactez-<em className="text-gold not-italic">nous</em>
      </h1>
      <p className="text-sm text-bone/45 leading-relaxed mb-10">
        La façon la plus rapide de nous joindre — pour une question, une
        commande, ou en savoir plus sur un produit.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 bg-whatsapp/15 border border-whatsapp/40 text-green-300 text-[0.72rem] uppercase tracking-[0.15em] font-semibold py-4 px-9 hover:bg-whatsapp/20 transition-colors"
      >
        Discuter sur WhatsApp
      </a>

      {settings.whatsapp_qr_url && (
        <div className="mt-12">
          <p className="text-[0.6rem] uppercase tracking-[0.15em] text-bone/35 mb-4">
            Ou scannez ce QR code
          </p>
          <div className="w-44 h-44 mx-auto bg-bone/[0.02] border border-bone/10 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.whatsapp_qr_url}
              alt="QR code WhatsApp"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 mt-14">
        {settings.tiktok_url && (
          <a
            href={settings.tiktok_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] uppercase tracking-wider text-bone/45 border border-bone/15 px-4 py-2.5 hover:text-gold hover:border-gold/30 transition-colors"
          >
            TikTok
          </a>
        )}
        {settings.instagram_url && (
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] uppercase tracking-wider text-bone/45 border border-bone/15 px-4 py-2.5 hover:text-gold hover:border-gold/30 transition-colors"
          >
            Instagram
          </a>
        )}
        {settings.facebook_url && (
          <a
            href={settings.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.65rem] uppercase tracking-wider text-bone/45 border border-bone/15 px-4 py-2.5 hover:text-gold hover:border-gold/30 transition-colors"
          >
            Facebook
          </a>
        )}
      </div>
    </div>
  );
}
