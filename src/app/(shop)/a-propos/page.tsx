import { getSettings } from "@/lib/settings";

export const metadata = {
  title: "À propos",
  description: "Découvrez F-P Collection, marketplace premium africaine.",
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3 text-center">
        Notre histoire
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl font-normal mb-10 text-center">
        À propos de <em className="text-gold not-italic">{settings.site_name}</em>
      </h1>

      <div className="prose-sm text-sm text-bone/60 leading-relaxed flex flex-col gap-5">
        <p>
          {settings.site_name} est une marketplace premium dédiée à la mode, au
          luxe et à l&apos;excellence, pensée pour mettre en lumière le
          savoir-faire de vendeurs certifiés à travers l&apos;Afrique.
        </p>
        <p>
          Maroquinerie, joaillerie, prêt-à-porter et accessoires : chaque pièce
          de notre catalogue est sélectionnée pour sa qualité et son
          authenticité. Nous mettons un point d&apos;honneur à connecter
          directement nos clients avec les vendeurs, sans intermédiaire
          superflu, via un contact WhatsApp simple et immédiat.
        </p>
        <p>
          Notre ambition : offrir une expérience d&apos;achat aussi soignée que
          les maisons de luxe internationales, tout en restant fidèle à
          l&apos;élégance et à la richesse du continent africain.
        </p>
      </div>
    </div>
  );
}
