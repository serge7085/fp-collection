"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";

export default function VendorPhotoUpload({
  initialUrl,
}: {
  initialUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
      const path = `vendors/${crypto.randomUUID()}.${safeExt}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(path, compressed, {
          cacheControl: "31536000",
          contentType: compressed.type,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("site-assets").getPublicUrl(path);

      setPreview(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-20 h-20 rounded-full bg-ink2 border border-bone/10 overflow-hidden cursor-pointer flex items-center justify-center shrink-0 hover:border-gold/40 transition-colors"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-bone/25 text-xs text-center px-2">Photo</span>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {/* Champ caché qui transporte l'URL finale vers le Server Action */}
        <input type="hidden" name="photoUrl" value={preview ?? ""} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[0.65rem] uppercase tracking-wider text-bone/50 border border-bone/15 px-3 py-1.5 hover:text-bone hover:border-bone/30 transition-colors disabled:opacity-50"
        >
          {uploading ? "Envoi..." : "Choisir une photo"}
        </button>
        {error && <p className="text-xs text-red-400/90 mt-1">{error}</p>}
      </div>
    </div>
  );
}
