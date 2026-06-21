import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fp-collection.vercel.app";
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: vendors }] =
    await Promise.all([
      supabase
        .from("products")
        .select("slug, updated_at")
        .eq("status", "active"),
      supabase
        .from("categories")
        .select("slug, updated_at")
        .eq("is_active", true),
      supabase
        .from("vendors")
        .select("slug, updated_at")
        .eq("is_active", true),
    ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/vendors`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/a-propos`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: c.updated_at,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const vendorPages: MetadataRoute.Sitemap = (vendors ?? []).map((v) => ({
    url: `${baseUrl}/vendors/${v.slug}`,
    lastModified: v.updated_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...vendorPages];
}
