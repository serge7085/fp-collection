"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full bg-gold text-ink font-semibold text-[0.72rem] uppercase tracking-[0.2em] py-3.5 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Connexion..." : "Se connecter"}
    </button>
  );
}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-full max-w-sm">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!state.fieldErrors?.email}
          className="bg-ink2 border border-bone/10 px-4 py-3 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-red-400/90">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[0.65rem] uppercase tracking-[0.15em] text-bone/60"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!state.fieldErrors?.password}
          className="bg-ink2 border border-bone/10 px-4 py-3 text-sm text-bone placeholder:text-bone/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors"
        />
        {state.fieldErrors?.password && (
          <p className="text-xs text-red-400/90">{state.fieldErrors.password}</p>
        )}
      </div>

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
