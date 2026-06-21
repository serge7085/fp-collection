"use server";

import { redirect } from "next/navigation";
import { setupAdminSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/server";

export type SetupActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"fullName" | "email" | "phone" | "password" | "confirmPassword", string>>;
};

export async function createSuperAdminAction(
  _prevState: SetupActionState,
  formData: FormData
): Promise<SetupActionState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = setupAdminSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: SetupActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<SetupActionState["fieldErrors"]>;
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { fullName, email, phone, password } = parsed.data;

  const supabaseAdmin = createAdminClient();

  // 1. Garde-fou serveur : revérifie qu'aucun admin n'existe déjà.
  const { count, error: countError } = await supabaseAdmin
    .from("admins")
    .select("id", { count: "exact", head: true });

  if (countError) {
    return { error: "Erreur serveur : impossible de vérifier l'état du système." };
  }
  if (count && count > 0) {
    return { error: "Un compte administrateur existe déjà. Le setup est terminé." };
  }

  // 2. Création de l'utilisateur dans Supabase Auth.
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (authError || !authData.user) {
    return {
      error:
        authError?.message === "User already registered"
          ? "Cet e-mail est déjà utilisé."
          : "Impossible de créer le compte. Réessayez.",
    };
  }

  const userId = authData.user.id;

  // 3. Insertion dans la table admins avec le rôle super_admin.
  const { error: adminInsertError } = await supabaseAdmin.from("admins").insert({
    id: userId,
    full_name: fullName,
    email,
    phone: phone || null,
    role: "super_admin",
  });

  if (adminInsertError) {
    // Rollback : on supprime l'utilisateur Auth orphelin.
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { error: "Impossible de finaliser la création du compte. Réessayez." };
  }

  // 4. Désactivation de /setup : marque setup_completed = true.
  const { error: settingsError } = await supabaseAdmin
    .from("settings")
    .update({ setup_completed: true })
    .eq("id", true);

  if (settingsError) {
    return {
      error:
        "Compte créé, mais une erreur a empêché la finalisation du setup. Contactez le support.",
    };
  }

  redirect("/admin");
}
