import Link from "next/link";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default function ProductCard({
  slug,
  name,
  price,
  promoPrice,
  imageUrl,
}: {
  slug: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  imageUrl?: string;
}) {
  return (
    <Link href={`/products/${slug}`} className="bg-ink group block">
      <div className="aspect-square bg-ink2 overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-bone/15 text-3xl">
            —
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="font-serif text-sm font-normal mb-2 truncate group-hover:text-gold transition-colors">
          {name}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">
            {formatPrice(promoPrice ?? price)}
          </span>
          {promoPrice && (
            <span className="text-xs text-bone/30 line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
