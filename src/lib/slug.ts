/**
 * Génère un slug à partir d'un texte, de façon cohérente avec la fonction
 * SQL `slugify()` définie dans supabase/migrations/0001_init.sql.
 * Utilisé côté client pour un aperçu instantané, et côté serveur avant
 * insertion pour garantir l'unicité (avec suffixe numérique si collision).
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Génère une référence produit lisible si l'utilisateur n'en fournit pas.
 * Format : FP-XXXXXX (6 caractères alphanumériques).
 */
export function generateReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O/1/I ambigus
  let result = "FP-";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
