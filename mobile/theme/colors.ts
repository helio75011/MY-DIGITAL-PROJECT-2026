// Design tokens issus de la maquette Figma Link & Walk
// https://www.figma.com/design/70VIHWDwqr7yUAhtmLunBf/Link---Walk?node-id=3-55
export const colors = {
  background: '#ffffff',
  text: '#000000',
  // Bleu nuit de la marque (titre logo, bouton primaire)
  primary: '#2f335c',
  primaryText: '#ffffff',
  // Pétales du logo
  petalPink: '#d9436a',
  petalBlue: '#606bab',
  petalDark: '#2f335c',
  // Bordures des champs de formulaire
  inputBorder: '#000000',
  // Placeholders (opacité 50% dans la maquette)
  placeholder: 'rgba(0, 0, 0, 0.5)',

  // --- Écran Accueil SafeWalk (node 23:230) ---
  navy: '#000666', // bleu marine principal (titres, accents)
  navyGradientEnd: '#1a237e', // fin du dégradé du CTA
  green: '#003910', // vert "Safe Zones"
  bodyText: '#454652', // texte secondaire
  mutedText: '#94a3b8', // libellés nav inactifs
  searchPlaceholder: '#c6c5d4',
  mapBackground: '#eeeef0',
  sosBg: '#ffdad6', // fond bouton SOS (douille)
  sosRed: '#ba1a1a', // texte / cercle SOS
  driverRed: '#b83938', // bouton "Réservez votre chauffeur"
  navActiveBg: 'rgba(197, 163, 255, 0.3)', // pastille onglet actif
  cardSurface: 'rgba(255, 255, 255, 0.8)', // cartes translucides
  barSurface: 'rgba(255, 255, 255, 0.9)', // barres recherche / CTA
  topBarSurface: 'rgba(255, 255, 255, 0.7)', // top app bar

  // --- Écran Historique (node 23:1310) ---
  tripCardBg: '#000666', // fond carte trajet (bleu marine)
  badgeDriverBg: 'rgba(217, 67, 106, 0.5)', // badge "Chauffeur"
  badgeDriverText: '#ff5782',
  badgeWalkBg: '#90d792', // badge "Link & Walk"
  walkGreen: '#90d792', // prix "Gratuit"
  onDarkMuted: 'rgba(255, 255, 255, 0.6)', // texte secondaire sur fond sombre
  filterActiveBg: '#606bab', // pastille de filtre active
  filterInactiveBg: '#eeeef0', // pastille de filtre inactive
  filterInactiveText: '#030303',

  // --- Écran Profil (node 23:1902) ---
  verifiedGreen: '#27923e', // badge "Profil vérifié"
  statCardBg: '#606bab', // cartes stats (trajets / score)
  menuCardBg: '#000666', // cartes de menu
  menuSubGreen: '#63a768', // sous-textes verts ("3 actifs", "Vérifié")
  sectionTitle: 'rgba(0, 6, 102, 0.6)', // titres de section
  logoutBg: '#fbeced', // fond bouton déconnexion
  navProfileBg: '#e9e0f9', // pastille onglet Profile actif
  heartRed: '#ba1a1a', // cœur "Score de confiance" / texte déconnexion

  // --- Écran Réserver un trajet (node 23:2060) ---
  routeFieldBg: '#eeeef0', // carte itinéraire (position/destination)
  routeLabel: '#6d4ea2', // labels "MA POSITION" / "DESTINATION"
  routeValue: '#1a1c1d', // valeurs d'adresse
  modeSolidaireBg: '#e9e0f9', // carte mode "Accompagnement Solidaire"
  modePremiumBg: '#000666', // carte mode "Chauffeur Premium"
  priceRose: '#d9436a', // prix Premium
  iconTileRose: '#d9436a', // pastille d'icône des cartes de mode
  freeGreen: '#63a768', // badge "GRATUIT"
  onDarkDesc: '#cecece', // description sur carte premium

  // --- Écran Trouver une accompagnatrice (node 23:2122) ---
  companionCardBg: '#000666', // carte accompagnatrice
  ratingBg: '#d9d9d9', // badge de note (fond gris clair)
  availableDot: '#abf4ac', // pastille "disponible" sur l'avatar
  metaText: '#9d9d9d', // temps / distance
  selectBtnBg: '#606bab', // bouton "Sélectionner"

  // --- Écran Chauffeur premium (node 23:2360) ---
  purple: '#6d4ea2', // accents violets (ETA, labels)
  driverCardBg: '#606bab', // carte chauffeur
  infoCardBg: '#000666', // cartes Véhicule / Sécurité
  infoCardMuted: '#afafaf', // texte secondaire des cartes info
  confirmBtnBg: '#040b6a', // bouton "Confirmer le trajet"
  starRose: '#d9436a', // étoiles de note
} as const;

export type Colors = typeof colors;
