# Roadmap — Link & Walk

Suivi des fonctionnalités, croisé avec la matrice **MoSCoW**, le **diagramme de cas
d'usage** (3 acteurs : passagère, accompagnatrice/chauffeur, modérateur) et
l'architecture. Mise à jour : 2026-06-15.

> **État global : MoSCoW Must + Should + Could-Have TOUS implémentés.**
> Reste uniquement le Won't-Have (hors périmètre) et la dette technique.

Architecture : `mobile` (React Native/Expo) → `api` (Express + mysql2) → MySQL
(`database`). L'app ne parle jamais directement à la base. Stack dockerisée
(`docker-compose.yml`).

---

## ✅ Must-Have — TERMINÉS

| Feature | Implémentation |
|---|---|
| Inscription / Connexion (JWT) | `auth.js`, `WelcomeScreen`, `SignupScreen`, `AuthContext` |
| Vérification d'identité (KYC) | `kyc.js`, `KycScreen` (tunnel 4 étapes, simulé) |
| Réservation + Matching (notes réelles) | `bookings.js`, `BookingScreen`, `MatchingScreen`, `DriverScreen` |
| SafeMatch (code couleur d'embarquement) | `safematch/`, `SafeMatchScreen` |
| Suivi temps réel (polling GPS) | `tracking.js`, `TrackingScreen` |
| Alertes SOS + dashboard modérateur | `tracking.js` (`/incidents`), `admin.js`, `/admin` |
| Contacts d'urgence | `contacts.js`, `ContactsScreen`, table `emergency_contact` |
| Mode batterie faible (SMS) | `TrackingScreen` (`expo-battery` + `expo-sms`) |
| Partage de trajet (SMS/WhatsApp) | `TrackingScreen` (feuille de partage native) |
| Notation après trajet | `ratings.js`, `RatingModal` |

---

## 🟠 Should-Have — TERMINÉS

### 1. Application côté acteur (accompagnatrice / chauffeur) ✅
Navigation par rôle : GUARDIAN/DRIVER → onglets Courses / Mes trajets / Profil.
- [x] Voir les demandes de trajet à proximité (statut `searching`) — `actor.js`, `ActorRequestsScreen`
- [x] Accepter une course → devient l'acteur du `booking` (trajet `ongoing`)
- [x] Voir ses trajets en cours / passés — `ActorRidesScreen`
- [x] Gérer son véhicule — `ActorVehicleScreen` (`GET/PUT /actor/vehicle`)
- [x] Profil acteur — `ActorProfileScreen`

### 2. Modération étendue (dashboard admin) ✅
- [x] Valider / refuser les dossiers KYC (`POST /admin/users/:id/verify`)
- [x] Bannir / réactiver (`POST /admin/users/:id/ban` ; login bloqué si banni)
- [x] Onglet « Utilisateurs » dans `/admin` ; colonne `app_user.is_banned`

### 3. Réservation à l'avance / planification ✅
- [x] Choisir une date/heure future — `BookingScreen` (datetimepicker) ; colonne `ride.scheduled_at`, statut `scheduled`
- [x] Liste des trajets planifiés — section « À venir » dans `HistoryScreen` (`GET /rides/upcoming`)

---

## 🟡 Could-Have — TERMINÉS (sauf analyse prédictive)
- [x] Déclenchement biométrique du SOS — `TrackingScreen` (`expo-local-authentication`)
- [x] Cartographie des zones éclairées / sûres — `SafeZonesScreen` (`react-native-maps`),
      table `safe_zone`, `GET /safe-zones`
- [x] Gamification (badges, score de fiabilité) — `stats.js` (`GET /users/me/stats`), `ProfileScreen`
- [x] IA « Corridor » (score de sûreté du trajet) — `corridor.js` (`POST /corridor/assess`),
      heuristique zones sûres + incidents
- [ ] Analyse prédictive des risques — _non commencée (reportée)_

## ⚪ Won't-Have (hors périmètre assumé)
Messagerie libre · publicité · abonnement premium payant.

---

## 🔧 Dette technique (avant mise en production)
- [ ] **Codes en mémoire** (SafeMatch, KYC, vérification) → perdus au redémarrage
      de l'API. À migrer vers la base ou un cache (Redis) pour la prod.
- [ ] **Paiement** simulé en dur (« Apple Pay •••• 4242 ») → intégrer un PSP réel.
- [ ] **Auto-clôture** du trajet basée sur la progression simulée → la baser sur
      l'arrivée GPS réelle.
- [ ] **KYC / SMS / codes** : simulés (pas d'OCR, pas de service SMS/email réel,
      `devCode` exposé). À remplacer par des services tiers (Onfido, Twilio…).
- [ ] **`react-native-maps`** : nécessite une clé Google Maps + un dev build pour un
      rendu fiable (carte parfois blanche en Expo Go).
- [x] **`mobile/CLAUDE.md`** : à jour (écrans et modules API récents documentés).

---

## Notes de test
- Démarrer : `docker compose up` (voir `README-docker.md`).
- Comptes de démo (mot de passe `demo1234`) : `lucie.berault@example.com`
  (passagère), `melanie.lepenant@example.com` (chauffeur), `admin@linkandwalk.fr`
  (modérateur).
- Fonctions natives (SMS, GPS, batterie, caméra KYC) : tester sur **appareil réel**
  (Expo Go), comportement limité en émulateur.
