"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { slugify } from "@/lib/slug";
import {
  createProductAction,
  updateProductAction,
  type ProductActionState,
} from "./actions";
import type { Category, Vendor, Product } from "@/lib/database.types";

const initialState: ProductActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gold text-ink font-semibold text-[0.72rem] uppercase tracking-[0.2em] px-6 py-3 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400/90">{error}</p>}
    </div>
  );
}

const inputClass =
  "bg-ink2 border border-bone/10 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors w-full";

export default function ProductForm({
  product,
  categories,
  vendors,
}: {
  product?: Product;
  categories: Category[];
  vendors: Vendor[];
}) {
  const isEditing = !!product;
  const action = isEditing
    ? updateProductAction.bind(null, product.id)
    : createProductAction;

  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(product?.name ?? "");
  const slugPreview = name ? slugify(name) : "";

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      {state.error && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3"
        >
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-950/30 border border-green-500/25 text-green-300 text-sm px-4 py-3">
          Produit enregistré avec succès.
        </div>
      )}

      <Field label="Nom du produit" error={state.fieldErrors?.name}>
        <input
          name="name"
          defaultValue={product?.name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          placeholder="Ex. Sac Cuir Milano"
        />
        {slugPreview && (
          <p className="text-[0.65rem] text-bone/30 mt-0.5">
            URL : /products/{slugPreview}
          </p>
        )}
      </Field>

      <Field label="Description" error={state.fieldErrors?.description}>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={5}
          className={inputClass}
          placeholder="Décrivez le produit, ses matériaux, ses dimensions..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Référence (auto si vide)" error={state.fieldErrors?.reference}>
          <input
            name="reference"
            defaultValue={product?.reference ?? ""}
            className={inputClass}
            placeholder="FP-A1B2C3"
          />
        </Field>
        <Field label="Stock" error={state.fieldErrors?.stock}>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Prix (FCFA)" error={state.fieldErrors?.price}>
          <input
            name="price"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.price ?? ""}
            required
            className={inputClass}
            placeholder="95000"
          />
        </Field>
        <Field label="Prix promotionnel (optionnel)" error={state.fieldErrors?.promoPrice}>
          <input
            name="promoPrice"
            type="number"
            min={0}
            step="1"
            defaultValue={product?.promo_price ?? ""}
            className={inputClass}
            placeholder="78000"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Catégorie" error={state.fieldErrors?.categoryId}>
          <select
            name="categoryId"
            defaultValue={product?.category_id ?? ""}
            className={inputClass}
          >
            <option value="">— Aucune —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendeur" error={state.fieldErrors?.vendorId}>
          <select
            name="vendorId"
            defaultValue={product?.vendor_id ?? ""}
            className={inputClass}
          >
            <option value="">— Aucun —</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <Field label="Statut" error={state.fieldErrors?.status}>
          <select
            name="status"
            defaultValue={product?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Brouillon</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-bone/70 pb-2.5">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.is_featured ?? false}
            className="accent-gold w-4 h-4"
          />
          Produit vedette (mis en avant sur l&apos;accueil)
        </label>
      </div>

      <div className="pt-2">
        <SubmitButton label={isEditing ? "Enregistrer les modifications" : "Créer le produit"} />
      </div>
    </form>
  );
}
