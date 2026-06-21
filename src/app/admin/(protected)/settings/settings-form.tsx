"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettingsAction, type SettingsActionState } from "./actions";
import AssetUpload from "./asset-upload";
import type { Settings } from "@/lib/database.types";

const initialState: SettingsActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-gold text-ink font-semibold text-[0.72rem] uppercase tracking-[0.2em] px-6 py-3 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Enregistrement..." : "Enregistrer les paramètres"}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-bone/10 p-6">
      <h2 className="text-[0.65rem] uppercase tracking-[0.15em] text-gold mb-5">
        {title}
      </h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60">
        {label}
      </label>
      {children}
      {hint && <p className="text-[0.65rem] text-bone/30">{hint}</p>}
      {error && <p className="text-xs text-red-400/90">{error}</p>}
    </div>
  );
}

const inputClass =
  "bg-ink2 border border-bone/10 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors w-full";

function ColorField({
  name,
  defaultValue,
  error,
}: {
  name: string;
  defaultValue: string;
  error?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        defaultValue={defaultValue}
        onChange={(e) => {
          const textInput = e.currentTarget
            .nextElementSibling as HTMLInputElement | null;
          if (textInput) textInput.value = e.currentTarget.value;
        }}
        className="w-10 h-10 bg-transparent border border-bone/10 cursor-pointer shrink-0"
      />
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        className={inputClass}
        placeholder="#000000"
      />
      {error && <p className="text-xs text-red-400/90">{error}</p>}
    </div>
  );
}

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-2xl">
      {state.error && (
        <div className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-950/30 border border-green-500/25 text-green-300 text-sm px-4 py-3">
          Paramètres enregistrés avec succès.
        </div>
      )}

      <Section title="Identité du site">
        <Field label="Logo">
          <AssetUpload
            label="Logo"
            fieldName="logoUrl"
            initialUrl={settings.logo_url}
            folder="branding"
            maxWidthOrHeight={512}
          />
        </Field>
        <Field label="Favicon">
          <AssetUpload
            label="Favicon"
            fieldName="faviconUrl"
            initialUrl={settings.favicon_url}
            folder="branding"
            maxWidthOrHeight={128}
          />
        </Field>
        <Field label="Nom du site" error={state.fieldErrors?.siteName}>
          <input
            name="siteName"
            defaultValue={settings.site_name}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Slogan" error={state.fieldErrors?.siteTagline}>
          <input
            name="siteTagline"
            defaultValue={settings.site_tagline}
            className={inputClass}
            placeholder="L'élégance à votre portée"
          />
        </Field>
      </Section>

      <Section title="WhatsApp">
        <Field
          label="Numéro WhatsApp"
          error={state.fieldErrors?.whatsappNumber}
          hint="Format international, sans le signe +. Ex. 22890000000"
        >
          <input
            name="whatsappNumber"
            defaultValue={settings.whatsapp_number}
            required
            className={inputClass}
            placeholder="22890000000"
          />
        </Field>
        <Field
          label="Message automatique"
          error={state.fieldErrors?.whatsappMessage}
          hint="Pré-rempli quand un client clique sur un bouton WhatsApp"
        >
          <textarea
            name="whatsappMessage"
            defaultValue={settings.whatsapp_message}
            rows={3}
            required
            className={inputClass}
          />
        </Field>
        <Field
          label="QR code WhatsApp (optionnel)"
          hint="Affiché sur la page Contact"
        >
          <AssetUpload
            label="QR code"
            fieldName="whatsappQrUrl"
            initialUrl={settings.whatsapp_qr_url}
            folder="branding"
            maxWidthOrHeight={512}
          />
        </Field>
      </Section>

      <Section title="Réseaux sociaux">
        <Field label="TikTok (URL)" error={state.fieldErrors?.tiktokUrl}>
          <input
            name="tiktokUrl"
            defaultValue={settings.tiktok_url ?? ""}
            className={inputClass}
            placeholder="https://www.tiktok.com/@..."
          />
        </Field>
        <Field label="Instagram (URL)" error={state.fieldErrors?.instagramUrl}>
          <input
            name="instagramUrl"
            defaultValue={settings.instagram_url ?? ""}
            className={inputClass}
            placeholder="https://instagram.com/..."
          />
        </Field>
        <Field label="Facebook (URL)" error={state.fieldErrors?.facebookUrl}>
          <input
            name="facebookUrl"
            defaultValue={settings.facebook_url ?? ""}
            className={inputClass}
            placeholder="https://facebook.com/..."
          />
        </Field>
      </Section>

      <Section title="Apparence">
        <Field label="Couleur principale (or)" error={state.fieldErrors?.primaryColor}>
          <ColorField name="primaryColor" defaultValue={settings.primary_color} />
        </Field>
        <Field label="Couleur de fond" error={state.fieldErrors?.backgroundColor}>
          <ColorField name="backgroundColor" defaultValue={settings.background_color} />
        </Field>
        <Field label="Couleur du texte" error={state.fieldErrors?.textColor}>
          <ColorField name="textColor" defaultValue={settings.text_color} />
        </Field>
      </Section>

      <Section title="Référencement (SEO)">
        <Field
          label="Titre SEO"
          error={state.fieldErrors?.seoTitle}
          hint="Affiché dans l'onglet du navigateur et sur Google"
        >
          <input
            name="seoTitle"
            defaultValue={settings.seo_title ?? ""}
            className={inputClass}
            placeholder="F-P Collection — L'élégance à votre portée"
          />
        </Field>
        <Field label="Description SEO" error={state.fieldErrors?.seoDescription}>
          <textarea
            name="seoDescription"
            defaultValue={settings.seo_description ?? ""}
            rows={3}
            className={inputClass}
            placeholder="Marketplace premium africaine..."
          />
        </Field>
      </Section>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
