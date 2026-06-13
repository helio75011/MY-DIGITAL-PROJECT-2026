# Lancer la stack avec Docker

Tout l'environnement back-end (base + API + interface DB) démarre en **une seule
commande**, sans installer MySQL/WAMP ni lancer `npm run dev` à la main.

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et **démarré**.

## Démarrer

Depuis la racine du projet :

```bash
docker compose up --build
```

Au **premier** démarrage, MySQL importe automatiquement `database/schema.sql`
puis `database/seed.sql`. Les services exposés :

| Service | URL | Détail |
|---|---|---|
| API | http://localhost:3000 | `/health` doit renvoyer `{ "status": "ok", "db": "up" }` |
| phpMyAdmin | http://localhost:8080 | serveur `mysql`, utilisateur `root`, mot de passe `root` |
| MySQL | localhost:3306 | base `link_and_walk` |

Comptes de démo : tous les utilisateurs du seed ont le mot de passe **`demo1234`**
(ex. `lucie.berault@example.com`).

## Arrêter

```bash
docker compose down            # arrête et supprime les conteneurs
docker compose down -v         # + supprime le volume MySQL (réimport au prochain up)
```

> Le schéma + seed ne sont ré-importés **que** sur une base vide. Pour forcer une
> réinitialisation des données, utilise `docker compose down -v` puis `up`.

## Mobile (BlueStacks)

L'app mobile appelle l'API via l'**IP LAN de ton PC** sur le port **3000**
(`API_BASE_URL` dans `mobile/api/client.ts`), pas via `localhost`. Docker publie
déjà le port 3000 sur l'hôte : aucun changement côté app, vérifie juste que l'IP
est la bonne.

## Détails

- `api/Dockerfile` : image Node 20 (alpine) de l'API.
- `docker-compose.yml` : services `mysql`, `api`, `phpmyadmin`.
  - L'API attend que MySQL soit **healthy** (`depends_on: condition: service_healthy`).
  - `DB_HOST` vaut `mysql` (nom du service) côté conteneur.
  - Les fichiers KYC uploadés sont persistés via le volume `./api/uploads`.
- Données MySQL persistées dans le volume nommé `lw_mysql_data`.

## Dépannage

- **L'API redémarre en boucle au tout premier `up`** : MySQL met quelques secondes
  à s'initialiser ; le healthcheck gère l'attente, laisse le temps au premier
  démarrage. Sinon `docker compose logs api`.
- **Port déjà utilisé (3306/3000/8080)** : un WAMP/MySQL/phpMyAdmin local tourne
  déjà. Arrête-le, ou change le port hôte dans `docker-compose.yml` (ex. `3307:3306`).
- **Voir les logs** : `docker compose logs -f api` (ou `mysql`, `phpmyadmin`).
