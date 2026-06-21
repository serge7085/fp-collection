import Link from "next/link";
import CategoryForm from "../category-form";

export const metadata = {
  title: "Nouvelle catégorie",
  robots: { index: false, follow: false },
};

export default function NewCategoryPage() {
  return (
    <div className="px-8 py-8">
      <Link
        href="/admin/categories"
        className="text-[0.65rem] uppercase tracking-wider text-bone/40 hover:text-gold transition-colors"
      >
        ← Retour aux catégories
      </Link>
      <h1 className="font-serif text-2xl font-normal mt-3 mb-8">Nouvelle catégorie</h1>
      <CategoryForm />
    </div>
  );
}
