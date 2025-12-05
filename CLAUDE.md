# CLAUDE.md - Mémoire Projet Renty

## Projet
Plateforme SaaS de gestion locative (propriétaires & locataires)

## Stack
- Next.js 16 / React 19 / TypeScript
- Prisma + PostgreSQL (Supabase)
- NextAuth 5 (JWT)
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

## En cours
- [ ] Authentification (en développement)
- [ ] Features diverses avant dashboard admin
- [ ] Bugs à corriger (liste à venir)

## À venir
- Dashboard admin

---
*Dernière mise à jour : décembre 2025*
