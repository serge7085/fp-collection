"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "./actions";

export default function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteCategoryAction(categoryId);
              router.refresh();
            })
          }
          className="text-[0.65rem] uppercase tracking-wider text-red-400 hover:text-red-300"
        >
          Confirmer
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-[0.65rem] uppercase tracking-wider text-bone/30 hover:text-bone/50"
        >
          Annuler
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-red-400 transition-colors"
    >
      Supprimer
    </button>
  );
}
