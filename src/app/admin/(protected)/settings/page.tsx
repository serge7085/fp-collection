import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./settings-form";

export const metadata = {
  title: "Paramètres",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("settings").select("*").single();

  if (!settings) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm text-red-300">
          Impossible de charger les paramètres du site.
        </p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      <h1 className="font-serif text-2xl font-normal mb-1">Paramètres</h1>
      <p className="text-sm text-bone/40 mb-8">
        Configuration générale du site, sans avoir besoin de coder.
      </p>

      <SettingsForm settings={settings} />
    </div>
  );
}
