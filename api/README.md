# API Link & Walk (Express + MySQL)

Couche d'accès entre l'app mobile (`../mobile`) et la base MySQL (`../database`).
L'app **ne se connecte jamais directement** à MySQL : elle passe par cette API REST.

```
mobile (React Native)  ──HTTP──►  api (Express + mysql2)  ──SQL──►  MySQL (link_and_walk)
```

## Prérequis

1. MySQL installé et la base créée :
   ```bash
   mysql -u root -p < ../database/schema.sql
   mysql -u root -p < ../database/seed.sql
   ```
2. Node.js 18+.

## Lancer

```bash
cd api
npm install
cp .env.example .env        # puis renseigner DB_USER / DB_PASSWORD
npm run dev                 # http://localhost:3000  (npm start en prod)
```

## Configuration (`.env`)

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | 3000 | port d'écoute de l'API |
| `DB_HOST` | 127.0.0.1 | hôte MySQL |
| `DB_PORT` | 3306 | port MySQL |
| `DB_USER` / `DB_PASSWORD` | root / (vide) | identifiants MySQL |
| `DB_NAME` | link_and_walk | base à utiliser |

## Endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/health` | état de l'API + connexion DB (`{status, db}`) |
| GET | `/rides/history?passengerId=1` | historique des trajets terminés d'une passagère |

### `GET /rides/history`

Joint `ride` → `booking` → `app_user`. Réponse (forme attendue par `HistoryScreen`) :

```json
[
  {
    "id": "RIDE-0001",
    "name": "Alice B.",
    "kind": "driver",
    "price": "24,50€",
    "date": "16/03/26",
    "departurePlace": "Gare de Lyon, Paris",
    "departureTime": "21H45",
    "arrivalPlace": "Rue de la Roquette, 11e"
  }
]
```

- `kind` = `walk` si `booking.option = 'solidaire'`, sinon `driver`.
- `price` = `null` pour un accompagnement (gratuit), formaté `"xx,xx€"` pour un chauffeur.

## Sécurité (notes)

- Requêtes **paramétrées** (`namedPlaceholders`) → pas d'injection SQL.
- En production : restreindre CORS, authentifier les requêtes (JWT) et déduire
  `passengerId` du token plutôt que de le passer en query.
