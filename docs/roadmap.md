# Roadmap — Link & Walk

Suivi des fonctionnalités, croisé avec la matrice **MoSCoW**, le **diagramme de cas
d'usage** (3 acteurs : passagère, accompagnatrice/chauffeur, modérateur) et
l'architecture. Mise à jour : 2026-06-15.

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

## 🟠 Should-Have — À FAIRE

### 1. Application côté acteur (accompagnatrice / chauffeur) — _priorité n°1_
Le plus gros manque conceptuel : l'app est entièrement côté passagère, alors que
le diagramme de cas d'usage prévoit 3 acteurs.
- [ ] Voir les demandes de trajet à proximité (statut `searching`)
- [ ] Accepter une course → devient l'acteur du `booking`
- [ ] Voir ses trajets en cours / passés
- [ ] Gérer son véhicule (table `vehicle` existe, aucun écran)
- [ ] Tableau de bord acteur (courses, note moyenne reçue)

### 2. Modération étendue (dashboard admin)
- [ ] Valider / refuser les dossiers KYC (passer `is_verified`)
- [ ] Bannir / réactiver un utilisateur
- [ ] Onglet « utilisateurs » dans `/admin`

### 3. Réservation à l'avance / planification
- [ ] Choisir une date/heure de départ future
- [ ] Liste des trajets planifiés

---

## 🟡 Could-Have — reportable
- [ ] Déclenchement biométrique du SOS
- [ ] Cartographie des zones éclairées / sûres
- [ ] Gamification (badges, fiabilité)
- [ ] IA « Corridor » (itinéraire le plus sûr)
- [ ] Analyse prédictive des risques

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
- [ ] **`mobile/CLAUDE.md`** : à mettre à jour (écrans et modules API récents non listés).

---

## Notes de test
- Démarrer : `docker compose up` (voir `README-docker.md`).
- Comptes de démo (mot de passe `demo1234`) : `lucie.berault@example.com`
  (passagère), `melanie.lepenant@example.com` (chauffeur), `admin@linkandwalk.fr`
  (modérateur).
- Fonctions natives (SMS, GPS, batterie, caméra KYC) : tester sur **appareil réel**
  (Expo Go), comportement limité en émulateur.
