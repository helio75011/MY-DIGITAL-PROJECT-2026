/**
 * Donne un mot de passe connu et hashé (bcrypt) à tous les comptes du seed.
 *
 * Le seed.sql contient des hashs factices (`$2y$10$seedhash...`) que
 * bcrypt.compare ne validera jamais. Ce script remplace le hash de tous les
 * app_user par le hash bcrypt de DEMO_PASSWORD, pour avoir des comptes de
 * démonstration réellement connectables (utile en soutenance).
 *
 * Usage :
 *   cd api
 *   node scripts/seed-passwords.js
 *
 * Pré-requis : la base est créée et le seed importé ; le .env pointe dessus.
 *
 * Comptes de démo après exécution (mot de passe = DEMO_PASSWORD) :
 *   lucie.berault@example.com   (passagère, écran Profil/Historique)
 *   melanie.lepenant@example.com (chauffeur)
 *   ... et tous les autres e-mails du seed.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/db');

const DEMO_PASSWORD = 'demo1234';

async function main() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [result] = await pool.query('UPDATE app_user SET password = :hash', { hash });
  console.log(
    `OK — ${result.affectedRows} compte(s) mis à jour. Mot de passe = "${DEMO_PASSWORD}".`
  );
  await pool.end();
}

main().catch((err) => {
  console.error('Échec :', err.message);
  process.exit(1);
});
