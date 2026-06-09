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
} as const;

export type Colors = typeof colors;
