"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { addProductVideoAction, deleteProductVideoAction } from "./actions";
import type { ProductVideo } from "@/lib/database.types";

const MAX_SIZE_MB = 50;

export default function ProductVideoManager({
  productId,
  initialVideos,
}: {
  productId: string;
  initialVideos: ProductVideo[];
}) {
  const [videos, setVideos] = useState<ProductVideo[]>(initialVideos);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadVideo = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.type.startsWith("video/")) {
        setError("Le fichier doit être une vidéo.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`La vidéo dépasse la taille maximale de ${MAX_SIZE_MB} Mo.`);
        return;
      }

      setUploading(true);
      setProgress(10);

      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
        const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "mp4";
        const path = `${productId}/${crypto.randomUUID()}.${safeExt}`;

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("product-videos")
          .upload(path, file, {
            cacheControl: "31536000",
            contentType: file.type,
          });

        if (uploadError) throw uploadError;
        setProgress(80);

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-videos").getPublicUrl(path);

        const result = await addProductVideoAction(
          productId,
          path,
          publicUrl,
          videos.length
        );
        if (result.error) throw new Error(result.error);

        setVideos((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            product_id: productId,
            storage_path: path,
            url: publicUrl,
            display_order: prev.length,
            created_at: new Date().toISOString(),
          },
        ]);
        setProgress(100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [productId, videos.length]
  );

  const handleDelete = useCallback(
    async (videoId: string, storagePath: string) => {
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      await deleteProductVideoAction(videoId, storagePath, productId);
    },
    [productId]
  );

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-bone/15 hover:border-bone/30 transition-colors px-6 py-8 text-center cursor-pointer"
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadVideo(file);
          }}
        />
        <p className="text-sm text-bone/60 mb-1">
          Cliquez pour ajouter une vidéo produit
        </p>
        <p className="text-xs text-bone/30">MP4, WebM — {MAX_SIZE_MB} Mo max</p>
      </div>

      {uploading && (
        <div className="mt-3">
          <div className="h-1 bg-bone/10 overflow-hidden">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400/90 mt-2">{error}</p>}

      {videos.length > 0 && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              <video
                src={video.url}
                controls
                className="w-full aspect-video bg-ink2 border border-bone/10"
              />
              <button
                type="button"
                onClick={() => handleDelete(video.id, video.storage_path)}
                className="mt-1 text-[0.6rem] uppercase tracking-wider text-bone/40 hover:text-red-400 transition-colors"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
