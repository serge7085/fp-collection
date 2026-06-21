import LoginForm from "./login-form";

export const metadata = {
  title: "Connexion administrateur — F-P Collection",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="min-h-screen bg-ink text-bone flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-14 h-14 border border-gold flex items-center justify-center text-gold text-base font-semibold mb-6">
          FP
        </div>

        <div className="text-center mb-10">
          <p className="text-[0.6rem] uppercase tracking-[0.35em] text-gold mb-3">
            Espace administrateur
          </p>
          <h1 className="font-serif text-3xl font-normal">
            F-P <em className="text-gold not-italic">Collection</em>
          </h1>
        </div>

        <LoginForm next={next ?? "/admin"} />
      </div>
    </main>
  );
}
