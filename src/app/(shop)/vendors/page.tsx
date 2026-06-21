import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Nos vendeurs",
  description: "Découvrez les vendeurs certifiés de F-P Collection.",
};

export default async function VendorsPage() {
  const supabase = await createClient();
  const { data: vendors } = await supabase
    .from("vendors")
    .select("id, name, slug, description, photo_url")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      <div className="text-center mb-12">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold mb-3">
          Confiance
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal">
          Nos <em className="text-gold not-italic">vendeurs</em>
        </h1>
      </div>

      {vendors && vendors.length > 0 ? (
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(240px,300px))] gap-px bg-bone/10">
          {vendors.map((v) => (
            <Link
              key={v.id}
              href={`/vendors/${v.slug}`}
              className="bg-ink p-8 text-center hover:bg-ink2 transition-colors group"
            >
              <div className="w-20 h-20 rounded-full bg-ink2 mx-auto mb-4 overflow-hidden group-hover:ring-1 group-hover:ring-gold/40 transition-all">
                {v.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-bone/20 text-xl font-serif">
                    {v.name[0]}
                  </div>
                )}
              </div>
              <h2 className="font-serif text-lg font-normal mb-2">{v.name}</h2>
              {v.description && (
                <p className="text-xs text-bone/40 line-clamp-2 leading-relaxed">
                  {v.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center text-sm text-bone/30">
          Aucun vendeur disponible pour le moment.
        </div>
      )}
    </div>
  );
}
