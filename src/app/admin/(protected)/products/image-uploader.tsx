"use client";

import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import {
  addProductImageAction,
  deleteProductImageAction,
  setPrimaryImageAction,
  reorderProductImagesAction,
} from "./actions";
import type { ProductImage } from "@/lib/database.types";

type UploadingFile = {
  id: string;
  name: string;
  progress: number;
  error?: string;
};

function SortableImage({
  image,
  onSetPrimary,
  onDelete,
}: {
  image: ProductImage;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string, storagePath: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square bg-ink2 border border-bone/10 overflow-hidden cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt=""
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {image.is_primary && (
        <span className="absolute top-2 left-2 bg-gold text-ink text-[0.6rem] uppercase tracking-wider font-semibold px-2 py-0.5">
          Principale
        </span>
      )}

      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/60 transition-colors flex items-end justify-center gap-2 p-2 opacity-0 group-hover:opacity-100">
        {!image.is_primary && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSetPrimary(image.id);
            }}
            className="text-[0.6rem] uppercase tracking-wider bg-bone/90 text-ink px-2 py-1 hover:bg-bone"
          >
            Définir principale
          </button>
        )}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id, image.storage_path);
          }}
          className="text-[0.6rem] uppercase tracking-wider bg-red-900/90 text-bone px-2 py-1 hover:bg-red-800"
        >
          Suppr.
        </button>
      </div>
    </div>
  );
}

export default function ImageUploader({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => a.display_order - b.display_order)
  );
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const uploadId = crypto.randomUUID();
      setUploading((prev) => [
        ...prev,
        { id: uploadId, name: file.name, progress: 0 },
      ]);

      try {
        // Compression automatique : limite à 1.5MB et 1920px max, en
        // gardant un bon compromis qualité/poids pour le web.
        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 10 } : u))
        );
        const compressed = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 35 } : u))
        );

        // Demande un chemin de stockage unique et vérifié côté serveur.
        const pathRes = await fetch("/api/products/upload-path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, productId }),
        });
        if (!pathRes.ok) throw new Error("Impossible de préparer l'upload.");
        const { storagePath } = await pathRes.json();

        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 55 } : u))
        );

        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(storagePath, compressed, {
            cacheControl: "31536000",
            contentType: compressed.type,
          });

        if (uploadError) throw uploadError;

        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 85 } : u))
        );

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(storagePath);

        const isPrimary = images.length === 0; // la toute première image devient principale
        const result = await addProductImageAction(
          productId,
          storagePath,
          publicUrl,
          images.length,
          isPrimary
        );

        if (result.error) throw new Error(result.error);

        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(), // remplacé au prochain refresh serveur
            product_id: productId,
            storage_path: storagePath,
            url: publicUrl,
            display_order: prev.length,
            is_primary: isPrimary,
            created_at: new Date().toISOString(),
          },
        ]);

        setUploading((prev) =>
          prev.map((u) => (u.id === uploadId ? { ...u, progress: 100 } : u))
        );
        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.id !== uploadId));
        }, 600);
      } catch (err) {
        setUploading((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, error: err instanceof Error ? err.message : "Échec de l'upload" }
              : u
          )
        );
      }
    },
    [productId, images.length]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      files.forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const handleDelete = useCallback(
    async (imageId: string, storagePath: string) => {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      await deleteProductImageAction(imageId, storagePath, productId);
    },
    [productId]
  );

  const handleSetPrimary = useCallback(
    async (imageId: string) => {
      setImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
      await setPrimaryImageAction(imageId, productId);
    },
    [productId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setImages((prev) => {
        const oldIndex = prev.findIndex((img) => img.id === active.id);
        const newIndex = prev.findIndex((img) => img.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        reorderProductImagesAction(
          productId,
          reordered.map((img) => img.id)
        );
        return reordered;
      });
    },
    [productId]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
          isDraggingOver
            ? "border-gold bg-gold/5"
            : "border-bone/15 hover:border-bone/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm text-bone/60 mb-1">
          Glissez-déposez vos images ici, ou cliquez pour parcourir
        </p>
        <p className="text-xs text-bone/30">
          JPG, PNG ou WebP — compression et redimensionnement automatiques
        </p>
      </div>

      {uploading.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {uploading.map((u) => (
            <div key={u.id} className="text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-bone/50 truncate max-w-[70%]">{u.name}</span>
                <span className={u.error ? "text-red-400" : "text-bone/40"}>
                  {u.error ?? `${u.progress}%`}
                </span>
              </div>
              <div className="h-1 bg-bone/10 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    u.error ? "bg-red-500" : "bg-gold"
                  }`}
                  style={{ width: `${u.error ? 100 : u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="mt-5 grid [grid-template-columns:repeat(auto-fill,minmax(120px,1fr))] gap-3">
              {images.map((image) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  onSetPrimary={handleSetPrimary}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
