"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_MB = 50;

export default function VideoUpload({
  initialUrl,
  urlFieldName,
  pathFieldName,
  folder,
}: {
  initialUrl?: string | null;
  urlFieldName: string;
  pathFieldName: string;
  folder: string;
}) {
  const [videoUrl, setVideoUrl] = useState<string | null>(initialUrl ?? null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
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
    setProgress(0);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "mp4";
      const path = `${folder}/${crypto.randomUUID()}.${safeExt}`;

      const supabase = createClient();

      // Pas de compression côté navigateur pour la vidéo (trop coûteux en
      // ressources et en temps) : on upload le fichier tel quel, avec une
      // limite de taille appliquée à la fois côté client et côté bucket.
      setProgress(20);
      const { error: uploadError } = await supabase.storage
        .from("product-videos")
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
        });

      if (uploadError) throw uploadError;
      setProgress(90);

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-videos").getPublicUrl(path);

      setVideoUrl(publicUrl);
      setStoragePath(path);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload de la vidéo");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setVideoUrl(null);
    setStoragePath(null);
  }

  return (
    <div>
      <input type="hidden" name={urlFieldName} value={videoUrl ?? ""} />
      <input type="hidden" name={pathFieldName} value={storagePath ?? ""} />

      {videoUrl ? (
        <div className="relative">
          <video
            src={videoUrl}
            controls
            className="w-full max-w-sm aspect-video bg-ink2 border border-bone/10"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="mt-2 text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-red-400 transition-colors"
          >
            Retirer la vidéo
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-bone/15 hover:border-bone/30 transition-colors px-6 py-8 text-center cursor-pointer max-w-sm"
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <p className="text-sm text-bone/60 mb-1">
            Cliquez pour ajouter une vidéo
          </p>
          <p className="text-xs text-bone/30">MP4, WebM — {MAX_SIZE_MB} Mo max</p>
        </div>
      )}

      {uploading && (
        <div className="mt-3 max-w-sm">
          <div className="h-1 bg-bone/10 overflow-hidden">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-bone/40 mt-1">Envoi en cours...</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400/90 mt-2">{error}</p>}
    </div>
  );
}
