// SafeMatch : code de validation à l'embarquement (couleur + 4 chiffres).
// Confirme à la passagère qu'elle monte avec la bonne personne, contre
// l'usurpation. Stocké en mémoire (rideRef -> code), éphémère le temps du trajet.

// Palette de couleurs mémorisables et bien distinctes.
const COLORS = ['VIOLET', 'ROSE', 'BLEU', 'VERT', 'ORANGE', 'TURQUOISE'];

// rideRef -> { color, digits, confirmed }
const codes = new Map();

/** Génère et enregistre un code SafeMatch pour un trajet. */
function generate(rideRef) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000)); // 4 chiffres
  const entry = { color, digits, confirmed: false };
  codes.set(rideRef, entry);
  return entry;
}

/** Récupère le code d'un trajet (ou undefined). */
function get(rideRef) {
  return codes.get(rideRef);
}

/** Marque le code comme confirmé (embarquement validé). */
function confirm(rideRef) {
  const entry = codes.get(rideRef);
  if (!entry) return null;
  entry.confirmed = true;
  return entry;
}

module.exports = { generate, get, confirm, COLORS };
