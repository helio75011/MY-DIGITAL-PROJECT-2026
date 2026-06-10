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
} as const;

export type Colors = typeof colors;
