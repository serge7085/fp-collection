"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const next = String(formData.get("next") ?? "/admin");

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: LoginActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<LoginActionState["fieldErrors"]>;
      fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  // Un compte Auth valide ne suffit pas : il doit exister dans `admins`.
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", authData.user.id)
    .single();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès au tableau de bord administrateur." };
  }

  // Empêche un open redirect : on n'accepte qu'un chemin interne.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  redirect(safeNext);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
