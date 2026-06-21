import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SetupForm from "./setup-form";

export const metadata = {
  title: "Configuration initiale — F-P Collection",
  robots: { index: false, follow: false },
};

export default async function SetupPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("setup_completed")
    .single();

  if (settings?.setup_completed) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-ink text-bone flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-14 h-14 border border-gold flex items-center justify-center text-gold text-base font-semibold mb-6">
          FP
        </div>

        <div className="text-center mb-10">
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-gold mb-3">
            Configuration initiale
          </p>
          <h1 className="font-serif text-3xl font-normal mb-3">
            Créer le compte <em className="text-gold not-italic">administrateur</em>
          </h1>
          <p className="text-sm text-bone/45 leading-relaxed">
            Ce compte aura un accès complet au tableau de bord F-P Collection.
            Cette étape ne s'affiche qu'une seule fois.
          </p>
        </div>

        <SetupForm />

        <p className="text-[0.65rem] text-bone/25 text-center mt-8 leading-relaxed">
          Aucun autre compte administrateur ne peut être créé tant que celui-ci
          n'est pas configuré.
        </p>
      </div>
    </main>
  );
}
