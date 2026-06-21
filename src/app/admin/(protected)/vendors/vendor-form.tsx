"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createVendorAction, updateVendorAction, type VendorActionState } from "./actions";
import VendorPhotoUpload from "./photo-upload";
import VideoUpload from "@/components/admin/video-upload";
import type { Vendor } from "@/lib/database.types";

const initialState: VendorActionState = {};

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

export default function VendorForm({ vendor }: { vendor?: Vendor }) {
  const isEditing = !!vendor;
  const action = isEditing
    ? updateVendorAction.bind(null, vendor.id)
    : createVendorAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-lg">
      {state.error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {state.error}
        </div>
      )}

      <Field label="Photo">
        <VendorPhotoUpload initialUrl={vendor?.photo_url} />
      </Field>

      <Field label="Vidéo de présentation (optionnel)">
        <VideoUpload
          initialUrl={vendor?.video_url}
          urlFieldName="videoUrl"
          pathFieldName="videoStoragePath"
          folder="vendors"
        />
      </Field>

      <Field label="Nom du vendeur" error={state.fieldErrors?.name}>
        <input
          name="name"
          defaultValue={vendor?.name}
          required
          className={inputClass}
          placeholder="Ex. Atelier Awa"
        />
      </Field>

      <Field label="Description" error={state.fieldErrors?.description}>
        <textarea
          name="description"
          defaultValue={vendor?.description ?? ""}
          rows={3}
          className={inputClass}
          placeholder="Présentation du vendeur, son savoir-faire..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Téléphone" error={state.fieldErrors?.phone}>
          <input
            name="phone"
            defaultValue={vendor?.phone ?? ""}
            className={inputClass}
            placeholder="+228 90 00 00 00"
          />
        </Field>
        <Field label="WhatsApp" error={state.fieldErrors?.whatsapp}>
          <input
            name="whatsapp"
            defaultValue={vendor?.whatsapp ?? ""}
            className={inputClass}
            placeholder="+228 90 00 00 00"
          />
        </Field>
      </div>

      <Field label="TikTok (URL)" error={state.fieldErrors?.tiktokUrl}>
        <input
          name="tiktokUrl"
          defaultValue={vendor?.tiktok_url ?? ""}
          className={inputClass}
          placeholder="https://www.tiktok.com/@..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Instagram (URL)" error={state.fieldErrors?.instagramUrl}>
          <input
            name="instagramUrl"
            defaultValue={vendor?.instagram_url ?? ""}
            className={inputClass}
            placeholder="https://instagram.com/..."
          />
        </Field>
        <Field label="Facebook (URL)" error={state.fieldErrors?.facebookUrl}>
          <input
            name="facebookUrl"
            defaultValue={vendor?.facebook_url ?? ""}
            className={inputClass}
            placeholder="https://facebook.com/..."
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-bone/70">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={vendor?.is_active ?? true}
          className="accent-gold w-4 h-4"
        />
        Vendeur actif (visible sur le site)
      </label>

      <div className="pt-2">
        <SubmitButton label={isEditing ? "Enregistrer" : "Créer le vendeur"} />
      </div>
    </form>
  );
}
