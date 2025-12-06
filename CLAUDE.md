# CLAUDE.md - Mémoire Projet Renty

## Projet
Plateforme SaaS de gestion locative (propriétaires & locataires)

## Stack
- Next.js 16 / React 19 / TypeScript
- Prisma + PostgreSQL (Supabase)
- Supabase Auth (OAuth Google inclus)
- Stripe, Cloudinary, Resend, Pusher

## Architecture
```
/app          → Pages + API routes (App Router)
/components   → 60 composants React
/lib          → Logique métier (auth, stripe, xp, badges)
/prisma       → Schéma DB (21+ migrations)
/types        → Définitions TypeScript
```

## Commandes
```bash
npm run dev          # Lancer en développement
npx prisma studio    # Interface DB
npx prisma migrate dev  # Migrations
```

## Conventions
- ESLint + Prettier
- Imports absolus avec `@/`
- Commentaires et commits en **français**
- Composants : PascalCase
- API : `/api/[resource]/route.ts`
- Validation : Zod côté serveur

## Règles Claude Code
- **Toujours demander confirmation** avant de modifier des fichiers
- Réponses courtes sauf si explication demandée
- Ne pas expliquer les changements mineurs
- Ne jamais toucher : `.env`
- Pour l'UX toujours avoir un style comme Airbnb

## Features implémentées
- [x] Authentification (inscription, connexion, OAuth Google)
- [x] Vérification email (token + page /verify-email)
- [x] Gestion des propriétés (CRUD, photos, types variés)
- [x] Candidatures (envoi, acceptation, rejet, documents partagés)
- [x] Baux & colocations (création, gestion, états des lieux)
- [x] Quittances (génération PDF, déclaration/confirmation paiements)
- [x] Messagerie intégrée (conversations, notifications)
- [x] Système d'avis double-blind
- [x] Gamification (XP, niveaux, badges)
- [x] Profil locataire (infos pro, documents)
- [x] Services partenaires (affiliation)
- [x] Liens de partage (profil, propriété)
- [x] Abonnements Stripe (free, pro, business)
- [x] Page d'accueil Renty
- [x] Suppression colocataire avec modal de confirmation
- [x] Autocomplétion adresses (API Adresse gouv.fr)
- [x] Notation symétrique caution (proprio 3/5 min si 100% rendu, locataire 4/5 min)
- [x] Badge Pionnier pour tous les inscrits (+500 XP)
- [x] Migration Supabase Auth (remplacement NextAuth)
- [x] Mot de passe oublié (Supabase email recovery)

## En cours
- [ ] Tests avant mise en prod

## À faire (MVP)
- [ ] Révision automatique du loyer (IRL INSEE + génération lettre)
- [ ] Relances automatiques impayés (emails J+5, J+15...)
- [ ] Système de litige caution (contestation, médiation)
- [ ] Contacts utiles sur fiche bail (plombier, syndic, urgences...)
- [ ] Bouton "Rapport de bug" sur dashboards owner/tenant → formulaire → dashboard admin
- [ ] Dashboard admin (gestion bugs, utilisateurs, stats)
- [ ] Aide déclaration impôts (revenus locatifs)
- [ ] Dark mode

## À venir (post-MVP)
- [ ] Signature électronique (Yousign ou DocuSign)
- [ ] Synchronisation bancaire (Bridge ou Powens)
- [ ] Déploiement Vercel

---
*Dernière mise à jour : 6 décembre 2025 (mot de passe oublié)*
