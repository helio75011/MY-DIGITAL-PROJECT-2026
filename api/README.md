# API Link & Walk (Express + MySQL)

Couche d'accès entre l'app mobile (`../mobile`) et la base MySQL (`../database`).
L'app **ne se connecte jamais directement** à MySQL : elle passe par cette API REST.

```
mobile (React Native)  ──HTTP──►  api (Express + mysql2)  ──SQL──►  MySQL (link_and_walk)
```

## Démarrage recommandé : Docker (tout en une commande)

Depuis la racine du projet (voir `../docker-compose.yml`) :

```bash
docker compose up --build
```

Cela démarre **MySQL** (schéma + seed importés au 1er lancement), **l'API**
(http://localhost:3000) et **phpMyAdmin** (http://localhost:8080). Voir
`../README-docker.md` pour le détail.

## Démarrage manuel (sans Docker)

1. MySQL installé et la base créée :
   ```bash
   mysql -u root -p < ../database/schema.sql
   mysql -u root -p < ../database/seed.sql
   ```
2. Node.js 18+.
   ```bash
   cd api
   npm install
   cp .env.example .env        # puis renseigner DB_USER / DB_PASSWORD / JWT_SECRET
   npm run dev                 # http://localhost:3000  (npm start en prod)
   ```

## Configuration (`.env`)

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | 3000 | port d'écoute de l'API |
| `DB_HOST` | 127.0.0.1 | hôte MySQL (`mysql` sous Docker) |
| `DB_PORT` | 3306 | port MySQL |
| `DB_USER` / `DB_PASSWORD` | root / (vide) | identifiants MySQL |
| `DB_NAME` | link_and_walk | base à utiliser |
| `JWT_SECRET` | — | secret de signature des JWT (**obligatoire**) |
| `JWT_EXPIRES_IN` | 7d | durée de validité des tokens |

## Comptes de démonstration

Tous les comptes du seed ont pour mot de passe **`demo1234`** (hash bcrypt en base).
Exemples : `lucie.berault@example.com` (passagère), `melanie.lepenant@example.com` (chauffeur).

## Endpoints

| Méthode | Route | Auth | Description |
|---|---|:---:|---|
| GET  | `/health` | — | état de l'API + connexion DB (`{status, db}`) |
| POST | `/auth/register` | — | inscription `{ email, password, firstName, lastName, phone? }` → `{ token, user }` |
| POST | `/auth/login` | — | connexion `{ email, password }` → `{ token, user }` |
| GET  | `/auth/me` | 🔒 | utilisateur courant (depuis le token) |
| GET  | `/rides/history` | 🔒 | historique des trajets de la passagère connectée |
| POST | `/kyc/send-code` | 🔒 | maj téléphone + envoi d'un code (mocké, renvoyé en `devCode`) |
| POST | `/kyc/verify-code` | 🔒 | valide le code `{ code }` |
| POST | `/kyc/documents` | 🔒 | upload document d'identité (multipart : `front`, `back?`, `docType`) |
| POST | `/kyc/selfie` | 🔒 | upload selfie (multipart : `selfie`) |
| POST | `/kyc/complete` | 🔒 | clôt le KYC → `is_verified = true` (si document + selfie) |
| GET  | `/kyc/status` | 🔒 | avancement du KYC |
| —    | `/uploads/<fichier>` | — | fichiers KYC servis en statique |

🔒 = en-tête `Authorization: Bearer <token>` requis.

### Authentification

- `/auth/register` et `/auth/login` renvoient un **JWT** (`sub` = `user_id`).
- Les routes protégées passent par le middleware `requireAuth` qui pose `req.userId`.
- Mauvais identifiants → `401 invalid_credentials` (message identique que l'email
  existe ou non, pour ne pas révéler les comptes).

### KYC (vérification d'identité)

Tunnel **simulé** (pas d'OCR ni de reconnaissance faciale réelle) : code de
vérification mocké, fichiers stockés sur disque (`uploads/`), validation finale
qui passe le compte en `is_verified = true`.

> ⚠️ `devCode` est renvoyé dans la réponse de `/kyc/send-code` **pour la démo**
> uniquement (aucun service email/SMS configuré). À retirer en production.

## Sécurité (notes)

- Requêtes **paramétrées** (`namedPlaceholders`) → pas d'injection SQL.
- Mots de passe **hashés bcrypt** (jamais stockés en clair).
- En production : restreindre CORS, utiliser un vrai service email/SMS pour les
  codes, un vrai stockage (S3/Cloud) et un SDK KYC réel, et un `JWT_SECRET` fort.
```
