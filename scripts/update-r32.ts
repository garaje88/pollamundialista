/**
 * update-r32.ts
 * Actualiza ÚNICAMENTE los 16 partidos de dieciseisavos (m073–m088) en Firestore
 * con los cruces ya confirmados, sin tocar marcadores ni el resto del fixture.
 *
 * Usa batch.update (no set), así que sólo modifica homeTeam/awayTeam/utcDateTime
 * y conserva homeScore/awayScore/status si ya existieran.
 *
 *   npx tsx scripts/update-r32.ts
 *
 * Requiere scripts/serviceAccountKey.json (igual que seed-matches.ts).
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, 'serviceAccountKey.json');

let serviceAccount: any;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
} catch {
  console.error('❌  No se encontró scripts/serviceAccountKey.json');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// Dieciseisavos confirmados (horarios en UTC; -5 = Bogotá)
const r32: { id: string; homeTeam: string; awayTeam: string; utcDateTime: string }[] = [
  { id:'m073', homeTeam:'South Africa',  awayTeam:'Canada',                 utcDateTime:'2026-06-28T19:00:00Z' },
  { id:'m074', homeTeam:'Brazil',        awayTeam:'Japan',                  utcDateTime:'2026-06-29T16:00:00Z' },
  { id:'m075', homeTeam:'Germany',       awayTeam:'Paraguay',               utcDateTime:'2026-06-29T19:00:00Z' },
  { id:'m076', homeTeam:'Netherlands',   awayTeam:'Morocco',                utcDateTime:'2026-06-29T23:00:00Z' },
  { id:'m077', homeTeam:'Ivory Coast',   awayTeam:'Norway',                 utcDateTime:'2026-06-30T16:00:00Z' },
  { id:'m078', homeTeam:'France',        awayTeam:'Sweden',                 utcDateTime:'2026-06-30T19:00:00Z' },
  { id:'m079', homeTeam:'Mexico',        awayTeam:'Ecuador',                utcDateTime:'2026-06-30T23:00:00Z' },
  { id:'m080', homeTeam:'England',       awayTeam:'DR Congo',               utcDateTime:'2026-07-01T16:00:00Z' },
  { id:'m081', homeTeam:'Belgium',       awayTeam:'Senegal',                utcDateTime:'2026-07-01T19:00:00Z' },
  { id:'m082', homeTeam:'United States', awayTeam:'Bosnia and Herzegovina', utcDateTime:'2026-07-01T23:00:00Z' },
  { id:'m083', homeTeam:'Spain',         awayTeam:'Austria',                utcDateTime:'2026-07-02T16:00:00Z' },
  { id:'m084', homeTeam:'Portugal',      awayTeam:'Croatia',                utcDateTime:'2026-07-02T19:00:00Z' },
  { id:'m085', homeTeam:'Switzerland',   awayTeam:'Algeria',                utcDateTime:'2026-07-02T23:00:00Z' },
  { id:'m086', homeTeam:'Australia',     awayTeam:'Egypt',                  utcDateTime:'2026-07-03T16:00:00Z' },
  { id:'m087', homeTeam:'Argentina',     awayTeam:'Cape Verde',             utcDateTime:'2026-07-03T19:00:00Z' },
  { id:'m088', homeTeam:'Colombia',      awayTeam:'Ghana',                  utcDateTime:'2026-07-03T23:00:00Z' },
];

async function run() {
  console.log(`Actualizando ${r32.length} dieciseisavos...`);
  const batch = db.batch();
  for (const m of r32) {
    const { id, ...data } = m;
    batch.update(db.collection('matches').doc(id), data);
  }
  await batch.commit();
  console.log('✅  Dieciseisavos actualizados (marcadores y resto del fixture intactos).');
  process.exit(0);
}

run().catch(err => {
  console.error('❌  Error:', err);
  process.exit(1);
});
