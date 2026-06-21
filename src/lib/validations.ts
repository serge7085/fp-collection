import { z } from "zod";

// ----------------------------------------------------------------------------
// /setup — création du compte super admin
// ----------------------------------------------------------------------------
export const setupAdminSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(100),
    email: z.string().trim().email("Adresse e-mail invalide"),
    phone: z
      .string()
      .trim()
      .min(8, "Numéro de téléphone invalide")
      .max(20)
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SetupAdminInput = z.infer<typeof setupAdminSchema>;

// ----------------------------------------------------------------------------
// /admin/login — connexion administrateur
// ----------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z.string().trim().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ----------------------------------------------------------------------------
// /admin/products — création / édition de produit
// ----------------------------------------------------------------------------
export const productSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  reference: z.string().trim().max(50).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Le prix doit être positif"),
  promoPrice: z.coerce.number().min(0).optional().or(z.literal(NaN)),
  stock: z.coerce.number().int().min(0, "Le stock doit être positif ou nul"),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  vendorId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "draft"]),
  isFeatured: z.coerce.boolean().optional(),
}).refine(
  (data) => isNaN(data.promoPrice as number) || (data.promoPrice as number) < data.price,
  {
    message: "Le prix promotionnel doit être inférieur au prix normal",
    path: ["promoPrice"],
  }
);

export type ProductInput = z.infer<typeof productSchema>;

// ----------------------------------------------------------------------------
// /admin/categories
// ----------------------------------------------------------------------------
export const categorySchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ----------------------------------------------------------------------------
// /admin/vendors
// ----------------------------------------------------------------------------
export const vendorSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  tiktokUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  facebookUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  isActive: z.coerce.boolean().optional(),
});

export type VendorInput = z.infer<typeof vendorSchema>;

// ----------------------------------------------------------------------------
// /admin/settings
// ----------------------------------------------------------------------------
export const settingsSchema = z.object({
  siteName: z.string().trim().min(2, "Le nom du site est requis").max(100),
  siteTagline: z.string().trim().max(200).optional().or(z.literal("")),
  whatsappNumber: z
    .string()
    .trim()
    .min(8, "Numéro WhatsApp invalide")
    .max(20)
    .regex(/^\+?[0-9\s]+$/, "Format invalide (chiffres uniquement)"),
  whatsappMessage: z.string().trim().min(5).max(500),
  tiktokUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  instagramUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  facebookUrl: z.string().trim().url("URL invalide").optional().or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide (format #RRGGBB)"),
  backgroundColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide (format #RRGGBB)"),
  textColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide (format #RRGGBB)"),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
