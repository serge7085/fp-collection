// ============================================================================
// Types générés à partir du schéma SQL (supabase/migrations/0001_init.sql)
// En production, régénérer avec :
//   npx supabase gen types typescript --project-id <ID> > src/lib/database.types.ts
// ============================================================================

export type AdminRole = "super_admin" | "admin";
export type ProductStatus = "active" | "inactive" | "draft";

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: {
      increment_product_views: {
        Args: { product_id: string };
        Returns: void;
      };
    };
    Enums: {
      admin_role: AdminRole;
      product_status: ProductStatus;
    };
    CompositeTypes: Record<string, never>;
    Tables: {
      admins: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: AdminRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: AdminRole;
        };
        Update: Partial<{
          full_name: string;
          email: string;
          phone: string | null;
          role: AdminRole;
        }>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
        };
        Update: Partial<{
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          photo_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          tiktok_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          photo_url?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          tiktok_url?: string | null;
          instagram_url?: string | null;
          facebook_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<{
          name: string;
          slug: string;
          description: string | null;
          photo_url: string | null;
          phone: string | null;
          whatsapp: string | null;
          tiktok_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          reference: string | null;
          price: number;
          promo_price: number | null;
          stock: number;
          category_id: string | null;
          vendor_id: string | null;
          status: ProductStatus;
          is_featured: boolean;
          view_count: number;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          reference?: string | null;
          price: number;
          promo_price?: number | null;
          stock?: number;
          category_id?: string | null;
          vendor_id?: string | null;
          status?: ProductStatus;
          is_featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: Partial<{
          name: string;
          slug: string;
          description: string | null;
          reference: string | null;
          price: number;
          promo_price: number | null;
          stock: number;
          category_id: string | null;
          vendor_id: string | null;
          status: ProductStatus;
          is_featured: boolean;
          meta_title: string | null;
          meta_description: string | null;
        }>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          url: string;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          url: string;
          display_order?: number;
          is_primary?: boolean;
        };
        Update: Partial<{
          storage_path: string;
          url: string;
          display_order: number;
          is_primary: boolean;
        }>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: boolean;
          site_name: string;
          site_tagline: string;
          logo_url: string | null;
          favicon_url: string | null;
          whatsapp_number: string;
          whatsapp_qr_url: string | null;
          whatsapp_message: string;
          tiktok_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          primary_color: string;
          background_color: string;
          text_color: string;
          seo_title: string | null;
          seo_description: string | null;
          setup_completed: boolean;
          updated_at: string;
        };
        Insert: Partial<{
          id: boolean;
          site_name: string;
          site_tagline: string;
          logo_url: string | null;
          favicon_url: string | null;
          whatsapp_number: string;
          whatsapp_qr_url: string | null;
          whatsapp_message: string;
          tiktok_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          primary_color: string;
          background_color: string;
          text_color: string;
          seo_title: string | null;
          seo_description: string | null;
          setup_completed: boolean;
        }>;
        Update: Partial<{
          id: boolean;
          site_name: string;
          site_tagline: string;
          logo_url: string | null;
          favicon_url: string | null;
          whatsapp_number: string;
          whatsapp_qr_url: string | null;
          whatsapp_message: string;
          tiktok_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          primary_color: string;
          background_color: string;
          text_color: string;
          seo_title: string | null;
          seo_description: string | null;
          setup_completed: boolean;
        }>;
        Relationships: [];
      };
    };
  };
}

// Raccourcis pratiques
export type Admin = Database["public"]["Tables"]["admins"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];

export type ProductWithRelations = Product & {
  category: Category | null;
  vendor: Vendor | null;
  product_images: ProductImage[];
};
