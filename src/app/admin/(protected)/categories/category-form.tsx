"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { slugify } from "@/lib/slug";
import { useState } from "react";
import { createCategoryAction, updateCategoryAction, type CategoryActionState } from "./actions";
import type { Category } from "@/lib/database.types";

const initialState: CategoryActionState = {};

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

const inputClass =
  "bg-ink2 border border-bone/10 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors w-full";

export default function CategoryForm({ category }: { category?: Category }) {
  const isEditing = !!category;
  const action = isEditing
    ? updateCategoryAction.bind(null, category.id)
    : createCategoryAction;
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(category?.name ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-lg">
      {state.error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60">
          Nom de la catégorie
        </label>
        <input
          name="name"
          defaultValue={category?.name}
          onChange={(e) => setName(e.target.value)}
          required
          className={inputClass}
          placeholder="Ex. Maroquinerie"
        />
        {name && (
          <p className="text-[0.65rem] text-bone/30 mt-0.5">
            URL : /collections/{slugify(name)}
          </p>
        )}
        {state.fieldErrors?.name && (
          <p className="text-xs text-red-400/90">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={3}
          className={inputClass}
          placeholder="Brève description de la catégorie"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-bone/70">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.is_active ?? true}
          className="accent-gold w-4 h-4"
        />
        Catégorie active (visible sur le site)
      </label>

      <div className="pt-2">
        <SubmitButton label={isEditing ? "Enregistrer" : "Créer la catégorie"} />
      </div>
    </form>
  );
}
