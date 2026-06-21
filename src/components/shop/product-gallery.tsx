"use client";

import { useState } from "react";

type GalleryItem =
  | { type: "image"; url: string; isPrimary: boolean }
  | { type: "video"; url: string };

export default function ProductGallery({
  images,
  videos = [],
  productName,
}: {
  images: { url: string; is_primary: boolean }[];
  videos?: { url: string }[];
  productName: string;
}) {
  const sortedImages = [...images].sort((a, b) =>
    a.is_primary ? -1 : b.is_primary ? 1 : 0
  );

  // Les images passent en premier (la principale en tête), les vidéos
  // ensuite : un visiteur regarde généralement les photos avant la vidéo.
  const items: GalleryItem[] = [
    ...sortedImages.map((img) => ({
      type: "image" as const,
      url: img.url,
      isPrimary: img.is_primary,
    })),
    ...videos.map((v) => ({ type: "video" as const, url: v.url })),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  if (items.length === 0) {
    return (
      <div className="aspect-square bg-ink2 flex items-center justify-center text-bone/15 text-4xl">
        —
      </div>
    );
  }

  const active = items[activeIndex];

  return (
    <div>
      <div
        className="aspect-square bg-ink2 overflow-hidden relative"
        onMouseMove={(e) => {
          if (active.type !== "image") return;
          const rect = e.currentTarget.getBoundingClientRect();
          setZoomPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseEnter={() => active.type === "image" && setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {active.type === "video" ? (
          <video
            src={active.url}
            controls
            className="w-full h-full object-contain bg-ink"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.url}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-200 cursor-zoom-in"
            style={
              isZoomed
                ? {
                    transform: "scale(1.8)",
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />
        )}
      </div>

      {items.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {items.map((item, i) => (
            <button
              key={`${item.type}-${item.url}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`aspect-square bg-ink2 overflow-hidden border transition-colors relative ${
                i === activeIndex ? "border-gold" : "border-transparent hover:border-bone/20"
              }`}
            >
              {item.type === "video" ? (
                <>
                  <video src={item.url} className="w-full h-full object-cover" muted />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
