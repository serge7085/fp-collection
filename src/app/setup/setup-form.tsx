"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createSuperAdminAction, type SetupActionState } from "./actions";

const initialState: SetupActionState = {};

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60"
      >
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="bg-ink2 border border-bone/10 px-4 py-3 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors"
      />
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-400/90">
          {error}
        </p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full bg-gold text-ink font-semibold text-[0.72rem] uppercase tracking-[0.2em] py-3.5 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Création en cours..." : "Créer le compte administrateur"}
    </button>
  );
}

export default function SetupForm() {
  const [state, formAction] = useActionState(createSuperAdminAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-md">
      <Field
        label="Nom complet"
        name="fullName"
        placeholder="Ex. Serge Adjévi"
        error={state.fieldErrors?.fullName}
      />
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        placeholder="admin@fp-collection.com"
        error={state.fieldErrors?.email}
      />
      <Field
        label="Téléphone"
        name="phone"
        type="tel"
        placeholder="+228 90 00 00 00"
        required={false}
        error={state.fieldErrors?.phone}
      />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        placeholder="8 caractères min., 1 majuscule, 1 chiffre"
        error={state.fieldErrors?.password}
      />
      <Field
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        error={state.fieldErrors?.confirmPassword}
      />

      {state.error && (
        <div
          role="alert"
          className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm px-4 py-3"
        >
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
