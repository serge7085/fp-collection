# F-P Collection

Marketplace premium africaine — Next.js 15 + Supabase + Vercel.

## Stack

- **Frontend** : Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend** : Supabase (Auth, Database/Postgres, Storage)
- **Déploiement** : Vercel

---

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un nouveau projet.
2. Note le **mot de passe de la base de données** que tu choisis — tu en auras besoin si tu veux te connecter directement en SQL plus tard.
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche).
4. Ouvre le fichier [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) de ce dépôt, copie tout son contenu, colle-le dans l'éditeur SQL de Supabase, et clique sur **Run**.
   - Ce script crée toutes les tables (`admins`, `categories`, `vendors`, `products`, `product_images`, `settings`), les policies de sécurité (RLS), les buckets de stockage d'images, et les fonctions nécessaires.
   - Tu peux le relancer sans risque si besoin : il utilise `if not exists` / `on conflict do nothing` partout.
5. Vérifie que ça a fonctionné : dans **Table Editor**, tu dois voir les 6 tables listées ci-dessus, et dans **Storage**, deux buckets : `product-images` et `site-assets`.

### Récupérer les clés API

Dans **Project Settings → API**, note ces 3 valeurs (tu en auras besoin à l'étape 3) :

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** (clique sur "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ La `service_role key` donne un accès complet à la base, sans restriction. Ne la mets jamais dans du code exposé au navigateur, ne la commit jamais dans Git. Elle ne doit exister que dans les variables d'environnement du serveur (Vercel, `.env.local`).

---

## 2. Pousser le code sur GitHub

Si ce n'est pas déjà fait :

```bash
git init
git add .
git commit -m "Initial commit — F-P Collection"
git branch -M main
git remote add origin https://github.com/<ton-compte>/fp-collection.git
git push -u origin main
```

---

## 3. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com), connecte-toi avec GitHub.
2. **Add New → Project**, sélectionne le dépôt `fp-collection`.
3. Vercel détecte automatiquement Next.js — pas besoin de toucher aux réglages de build.
4. Avant de cliquer sur **Deploy**, ouvre la section **Environment Variables** et ajoute :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | l'URL notée à l'étape 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clé anon notée à l'étape 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | la clé service_role notée à l'étape 1 |
| `NEXT_PUBLIC_SITE_URL` | l'URL finale de ton site, ex. `https://fp-collection.vercel.app` (tu peux la mettre à jour après le premier déploiement une fois l'URL connue) |

5. Clique sur **Deploy**. Le premier build prend 1 à 2 minutes.

---

## 4. Premier lancement — créer le compte administrateur

1. Une fois déployé, va sur `https://<ton-site>.vercel.app/setup`.
2. Remplis le formulaire (nom, e-mail, téléphone, mot de passe).
3. Ce compte devient automatiquement **Super Admin**. Cette page se désactive d'elle-même juste après — elle ne peut servir qu'une seule fois.
4. Tu es redirigé vers `/admin`, le tableau de bord.

Si tu visites `/setup` à nouveau après ça, tu seras automatiquement renvoyé vers la page d'accueil : c'est normal, c'est la protection prévue.

---

## 5. Configurer le site

Depuis `/admin`, dans l'ordre logique :

1. **Paramètres** (`/admin/settings`) — nom du site, logo, numéro WhatsApp, réseaux sociaux, couleurs, SEO.
2. **Catégories** (`/admin/categories`) — crée tes familles de produits (ex. Maroquinerie, Bijoux...).
3. **Vendeurs** (`/admin/vendors`) — ajoute les vendeurs, avec leur photo et leur WhatsApp.
4. **Produits** (`/admin/products`) — crée tes produits, ajoute des images (glisser-déposer), assigne-les à une catégorie et un vendeur, passe leur statut en **Actif** pour qu'ils apparaissent sur le site public.

---

## Développement local

```bash
npm install
cp .env.example .env.local   # puis remplis les vraies valeurs Supabase
npm run dev
```

Le site tourne sur [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
src/
  app/
    (shop)/             → pages publiques (accueil, boutique, fiches produits...)
    admin/
      login/             → connexion admin
      (protected)/        → tout ce qui nécessite d'être connecté en admin
    setup/                → création du premier compte admin (one-shot)
    api/                  → routes API internes (upload d'images)
  components/
    shop/                 → composants du frontend public (header, footer, cartes produit...)
  lib/
    supabase/             → clients Supabase (browser, serveur, admin)
    database.types.ts     → types TypeScript du schéma
    validations.ts        → schémas de validation (Zod)
supabase/
  migrations/
    0001_init.sql         → schéma SQL complet à exécuter dans Supabase
```

## Notes techniques

- **RLS (Row Level Security)** : activé sur toutes les tables. Les visiteurs anonymes ne peuvent lire que les produits/catégories/vendeurs **actifs** ; tout le reste nécessite d'être authentifié en tant qu'admin.
- **Images** : compressées automatiquement côté navigateur avant upload (max 1.5 Mo / 1920 px pour les produits) pour limiter le poids du Storage et accélérer le site.
- **Slugs** : générés automatiquement à partir du nom, avec suffixe numérique en cas de collision (`sac-cuir-milano`, `sac-cuir-milano-2`...).
- **WhatsApp** : le message pré-rempli inclut automatiquement le nom et la référence du produit consulté. Si un produit a un vendeur avec son propre numéro WhatsApp, le client est dirigé vers ce numéro plutôt que le numéro générique du site.
