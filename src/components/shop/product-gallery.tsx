"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; is_primary: boolean }[];
  productName: string;
}) {
  const sorted = [...images].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-ink2 flex items-center justify-center text-bone/15 text-4xl">
        —
      </div>
    );
  }

  const active = sorted[activeIndex];

  return (
    <div>
      <div
        className="aspect-square bg-ink2 overflow-hidden cursor-zoom-in relative"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoomPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-200"
          style={
            isZoomed
              ? {
                  transform: "scale(1.8)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
        />
      </div>

      {sorted.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {sorted.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`aspect-square bg-ink2 overflow-hidden border transition-colors ${
                i === activeIndex ? "border-gold" : "border-transparent hover:border-bone/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
