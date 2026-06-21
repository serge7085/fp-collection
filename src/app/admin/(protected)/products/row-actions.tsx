"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductStatusAction,
} from "./actions";
import type { ProductStatus } from "@/lib/database.types";

export function StatusToggle({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(status);

  if (current === "draft") {
    return (
      <span className="text-[0.65rem] uppercase tracking-wider text-bone/35 px-2 py-1 border border-bone/15">
        Brouillon
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await toggleProductStatusAction(productId, current);
          if (result.newStatus) setCurrent(result.newStatus as ProductStatus);
        })
      }
      className={`text-[0.65rem] uppercase tracking-wider px-2 py-1 border transition-colors disabled:opacity-50 ${
        current === "active"
          ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
          : "border-bone/15 text-bone/40 hover:bg-bone/5"
      }`}
    >
      {current === "active" ? "Actif" : "Inactif"}
    </button>
  );
}

export function ProductRowActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await duplicateProductAction(productId);
            router.refresh();
          })
        }
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors disabled:opacity-50"
      >
        Dupliquer
      </button>

      {confirmingDelete ? (
        <span className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deleteProductAction(productId);
                router.refresh();
              })
            }
            className="text-[0.65rem] uppercase tracking-wider text-red-400 hover:text-red-300"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="text-[0.65rem] uppercase tracking-wider text-bone/30 hover:text-bone/50"
          >
            Annuler
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-red-400 transition-colors"
        >
          Supprimer
        </button>
      )}
    </div>
  );
}
