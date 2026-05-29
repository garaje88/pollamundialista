/**
 * seed-matches.ts
 * Carga los 72 partidos de la fase de grupos del Mundial 2026 en Firestore.
 *
 * REQUISITOS:
 *   1. Instalar dependencias:
 *        npm install -D firebase-admin tsx
 *   2. Descargar la clave de servicio desde Firebase Console:
 *        Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada
 *        Guardar como: scripts/serviceAccountKey.json
 *   3. Ejecutar:
 *        npx tsx scripts/seed-matches.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import { createRequire } from 'module';
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
  console.error('   Descárgala desde Firebase Console → Configuración del proyecto → Cuentas de servicio');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

interface Match {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  utcDateTime: string;
  venue: string;
  city: string;
  country: string;
  group: string;
  round: string;
  homeScore: null;
  awayScore: null;
  status: 'scheduled';
}

const matches: Match[] = [
  // ── GRUPO A ─────────────────────────────────────────────────────────
  { id:'m001', matchNumber:1,  homeTeam:'Mexico',       awayTeam:'South Africa',  utcDateTime:'2026-06-11T18:00:00Z', venue:'Estadio Azteca',          city:'Mexico City',    country:'Mexico',  group:'A', round:'Grupo A', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m002', matchNumber:2,  homeTeam:'South Korea',  awayTeam:'Czech Republic',utcDateTime:'2026-06-12T01:00:00Z', venue:'Estadio Akron',           city:'Zapopan',        country:'Mexico',  group:'A', round:'Grupo A', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m003', matchNumber:3,  homeTeam:'Czech Republic',awayTeam:'South Africa', utcDateTime:'2026-06-18T16:00:00Z', venue:'Mercedes-Benz Stadium',   city:'Atlanta',        country:'USA',     group:'A', round:'Grupo A', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m004', matchNumber:4,  homeTeam:'Mexico',       awayTeam:'South Korea',   utcDateTime:'2026-06-19T00:00:00Z', venue:'Estadio Akron',           city:'Zapopan',        country:'Mexico',  group:'A', round:'Grupo A', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m005', matchNumber:5,  homeTeam:'Czech Republic',awayTeam:'Mexico',       utcDateTime:'2026-06-25T00:00:00Z', venue:'Estadio Azteca',          city:'Mexico City',    country:'Mexico',  group:'A', round:'Grupo A', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m006', matchNumber:6,  homeTeam:'South Africa', awayTeam:'South Korea',   utcDateTime:'2026-06-25T00:00:00Z', venue:'Estadio BBVA',            city:'Guadalupe',      country:'Mexico',  group:'A', round:'Grupo A', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO B ─────────────────────────────────────────────────────────
  { id:'m007', matchNumber:7,  homeTeam:'Canada',       awayTeam:'Bosnia and Herzegovina', utcDateTime:'2026-06-12T19:00:00Z', venue:'BMO Field',          city:'Toronto',    country:'Canada',  group:'B', round:'Grupo B', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m008', matchNumber:8,  homeTeam:'Qatar',        awayTeam:'Switzerland',   utcDateTime:'2026-06-13T19:00:00Z', venue:"Levi's Stadium",          city:'Santa Clara',    country:'USA',     group:'B', round:'Grupo B', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m009', matchNumber:9,  homeTeam:'Switzerland',  awayTeam:'Bosnia and Herzegovina', utcDateTime:'2026-06-18T19:00:00Z', venue:'SoFi Stadium',       city:'Inglewood',  country:'USA',     group:'B', round:'Grupo B', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m010', matchNumber:10, homeTeam:'Canada',       awayTeam:'Qatar',         utcDateTime:'2026-06-18T22:00:00Z', venue:'BC Place',                city:'Vancouver',      country:'Canada',  group:'B', round:'Grupo B', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m011', matchNumber:11, homeTeam:'Switzerland',  awayTeam:'Canada',        utcDateTime:'2026-06-24T19:00:00Z', venue:'BC Place',                city:'Vancouver',      country:'Canada',  group:'B', round:'Grupo B', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m012', matchNumber:12, homeTeam:'Bosnia and Herzegovina', awayTeam:'Qatar', utcDateTime:'2026-06-24T19:00:00Z', venue:'Lumen Field',           city:'Seattle',        country:'USA',     group:'B', round:'Grupo B', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO C ─────────────────────────────────────────────────────────
  { id:'m013', matchNumber:13, homeTeam:'Brazil',       awayTeam:'Morocco',       utcDateTime:'2026-06-13T22:00:00Z', venue:'MetLife Stadium',         city:'East Rutherford',country:'USA',     group:'C', round:'Grupo C', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m014', matchNumber:14, homeTeam:'Haiti',        awayTeam:'Scotland',      utcDateTime:'2026-06-14T01:00:00Z', venue:'Gillette Stadium',        city:'Foxborough',     country:'USA',     group:'C', round:'Grupo C', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m015', matchNumber:15, homeTeam:'Scotland',     awayTeam:'Morocco',       utcDateTime:'2026-06-19T22:00:00Z', venue:'Gillette Stadium',        city:'Foxborough',     country:'USA',     group:'C', round:'Grupo C', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m016', matchNumber:16, homeTeam:'Brazil',       awayTeam:'Haiti',         utcDateTime:'2026-06-20T00:30:00Z', venue:'Lincoln Financial Field', city:'Philadelphia',   country:'USA',     group:'C', round:'Grupo C', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m017', matchNumber:17, homeTeam:'Scotland',     awayTeam:'Brazil',        utcDateTime:'2026-06-24T22:00:00Z', venue:'Hard Rock Stadium',       city:'Miami',          country:'USA',     group:'C', round:'Grupo C', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m018', matchNumber:18, homeTeam:'Morocco',      awayTeam:'Haiti',         utcDateTime:'2026-06-24T22:00:00Z', venue:'Mercedes-Benz Stadium',   city:'Atlanta',        country:'USA',     group:'C', round:'Grupo C', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO D ─────────────────────────────────────────────────────────
  { id:'m019', matchNumber:19, homeTeam:'United States',awayTeam:'Paraguay',      utcDateTime:'2026-06-13T01:00:00Z', venue:'SoFi Stadium',            city:'Inglewood',      country:'USA',     group:'D', round:'Grupo D', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m020', matchNumber:20, homeTeam:'Australia',    awayTeam:'Turkey',        utcDateTime:'2026-06-14T04:00:00Z', venue:'BC Place',                city:'Vancouver',      country:'Canada',  group:'D', round:'Grupo D', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m021', matchNumber:21, homeTeam:'United States',awayTeam:'Australia',     utcDateTime:'2026-06-19T19:00:00Z', venue:'Lumen Field',             city:'Seattle',        country:'USA',     group:'D', round:'Grupo D', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m022', matchNumber:22, homeTeam:'Turkey',       awayTeam:'Paraguay',      utcDateTime:'2026-06-20T03:00:00Z', venue:"Levi's Stadium",          city:'Santa Clara',    country:'USA',     group:'D', round:'Grupo D', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m023', matchNumber:23, homeTeam:'Turkey',       awayTeam:'United States', utcDateTime:'2026-06-26T02:00:00Z', venue:'SoFi Stadium',            city:'Inglewood',      country:'USA',     group:'D', round:'Grupo D', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m024', matchNumber:24, homeTeam:'Paraguay',     awayTeam:'Australia',     utcDateTime:'2026-06-26T02:00:00Z', venue:"Levi's Stadium",          city:'Santa Clara',    country:'USA',     group:'D', round:'Grupo D', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO E ─────────────────────────────────────────────────────────
  { id:'m025', matchNumber:25, homeTeam:'Germany',      awayTeam:'Curacao',       utcDateTime:'2026-06-14T17:00:00Z', venue:'NRG Stadium',             city:'Houston',        country:'USA',     group:'E', round:'Grupo E', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m026', matchNumber:26, homeTeam:'Ivory Coast',  awayTeam:'Ecuador',       utcDateTime:'2026-06-14T23:00:00Z', venue:'Lincoln Financial Field', city:'Philadelphia',   country:'USA',     group:'E', round:'Grupo E', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m027', matchNumber:27, homeTeam:'Germany',      awayTeam:'Ivory Coast',   utcDateTime:'2026-06-20T20:00:00Z', venue:'BMO Field',               city:'Toronto',        country:'Canada',  group:'E', round:'Grupo E', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m028', matchNumber:28, homeTeam:'Ecuador',      awayTeam:'Curacao',       utcDateTime:'2026-06-21T00:00:00Z', venue:'Arrowhead Stadium',       city:'Kansas City',    country:'USA',     group:'E', round:'Grupo E', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m029', matchNumber:29, homeTeam:'Curacao',      awayTeam:'Ivory Coast',   utcDateTime:'2026-06-25T20:00:00Z', venue:'Lincoln Financial Field', city:'Philadelphia',   country:'USA',     group:'E', round:'Grupo E', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m030', matchNumber:30, homeTeam:'Ecuador',      awayTeam:'Germany',       utcDateTime:'2026-06-25T20:00:00Z', venue:'MetLife Stadium',         city:'East Rutherford',country:'USA',     group:'E', round:'Grupo E', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO F ─────────────────────────────────────────────────────────
  { id:'m031', matchNumber:31, homeTeam:'Netherlands',  awayTeam:'Japan',         utcDateTime:'2026-06-14T20:00:00Z', venue:'AT&T Stadium',            city:'Arlington',      country:'USA',     group:'F', round:'Grupo F', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m032', matchNumber:32, homeTeam:'Sweden',       awayTeam:'Tunisia',       utcDateTime:'2026-06-15T01:00:00Z', venue:'Estadio BBVA',            city:'Guadalupe',      country:'Mexico',  group:'F', round:'Grupo F', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m033', matchNumber:33, homeTeam:'Netherlands',  awayTeam:'Sweden',        utcDateTime:'2026-06-20T17:00:00Z', venue:'NRG Stadium',             city:'Houston',        country:'USA',     group:'F', round:'Grupo F', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m034', matchNumber:34, homeTeam:'Tunisia',      awayTeam:'Japan',         utcDateTime:'2026-06-21T03:00:00Z', venue:'Estadio BBVA',            city:'Guadalupe',      country:'Mexico',  group:'F', round:'Grupo F', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m035', matchNumber:35, homeTeam:'Japan',        awayTeam:'Sweden',        utcDateTime:'2026-06-25T23:00:00Z', venue:'AT&T Stadium',            city:'Arlington',      country:'USA',     group:'F', round:'Grupo F', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m036', matchNumber:36, homeTeam:'Tunisia',      awayTeam:'Netherlands',   utcDateTime:'2026-06-25T23:00:00Z', venue:'Arrowhead Stadium',       city:'Kansas City',    country:'USA',     group:'F', round:'Grupo F', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO G ─────────────────────────────────────────────────────────
  { id:'m037', matchNumber:37, homeTeam:'Belgium',      awayTeam:'Egypt',         utcDateTime:'2026-06-15T19:00:00Z', venue:'Lumen Field',             city:'Seattle',        country:'USA',     group:'G', round:'Grupo G', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m038', matchNumber:38, homeTeam:'Iran',         awayTeam:'New Zealand',   utcDateTime:'2026-06-16T01:00:00Z', venue:'SoFi Stadium',            city:'Inglewood',      country:'USA',     group:'G', round:'Grupo G', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m039', matchNumber:39, homeTeam:'Belgium',      awayTeam:'Iran',          utcDateTime:'2026-06-21T19:00:00Z', venue:'SoFi Stadium',            city:'Inglewood',      country:'USA',     group:'G', round:'Grupo G', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m040', matchNumber:40, homeTeam:'New Zealand',  awayTeam:'Egypt',         utcDateTime:'2026-06-22T01:00:00Z', venue:'BC Place',                city:'Vancouver',      country:'Canada',  group:'G', round:'Grupo G', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m041', matchNumber:41, homeTeam:'Egypt',        awayTeam:'Iran',          utcDateTime:'2026-06-27T03:00:00Z', venue:'Lumen Field',             city:'Seattle',        country:'USA',     group:'G', round:'Grupo G', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m042', matchNumber:42, homeTeam:'New Zealand',  awayTeam:'Belgium',       utcDateTime:'2026-06-27T03:00:00Z', venue:'BC Place',                city:'Vancouver',      country:'Canada',  group:'G', round:'Grupo G', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO H ─────────────────────────────────────────────────────────
  { id:'m043', matchNumber:43, homeTeam:'Spain',        awayTeam:'Cape Verde',    utcDateTime:'2026-06-15T16:00:00Z', venue:'Mercedes-Benz Stadium',   city:'Atlanta',        country:'USA',     group:'H', round:'Grupo H', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m044', matchNumber:44, homeTeam:'Saudi Arabia', awayTeam:'Uruguay',       utcDateTime:'2026-06-15T22:00:00Z', venue:'Hard Rock Stadium',       city:'Miami',          country:'USA',     group:'H', round:'Grupo H', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m045', matchNumber:45, homeTeam:'Spain',        awayTeam:'Saudi Arabia',  utcDateTime:'2026-06-21T16:00:00Z', venue:'Mercedes-Benz Stadium',   city:'Atlanta',        country:'USA',     group:'H', round:'Grupo H', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m046', matchNumber:46, homeTeam:'Uruguay',      awayTeam:'Cape Verde',    utcDateTime:'2026-06-21T22:00:00Z', venue:'Hard Rock Stadium',       city:'Miami',          country:'USA',     group:'H', round:'Grupo H', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m047', matchNumber:47, homeTeam:'Cape Verde',   awayTeam:'Saudi Arabia',  utcDateTime:'2026-06-27T00:00:00Z', venue:'NRG Stadium',             city:'Houston',        country:'USA',     group:'H', round:'Grupo H', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m048', matchNumber:48, homeTeam:'Uruguay',      awayTeam:'Spain',         utcDateTime:'2026-06-26T23:00:00Z', venue:'Estadio Akron',           city:'Zapopan',        country:'Mexico',  group:'H', round:'Grupo H', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO I ─────────────────────────────────────────────────────────
  { id:'m049', matchNumber:49, homeTeam:'France',       awayTeam:'Senegal',       utcDateTime:'2026-06-16T19:00:00Z', venue:'MetLife Stadium',         city:'East Rutherford',country:'USA',     group:'I', round:'Grupo I', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m050', matchNumber:50, homeTeam:'Iraq',         awayTeam:'Norway',        utcDateTime:'2026-06-16T22:00:00Z', venue:'Gillette Stadium',        city:'Foxborough',     country:'USA',     group:'I', round:'Grupo I', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m051', matchNumber:51, homeTeam:'France',       awayTeam:'Iraq',          utcDateTime:'2026-06-22T21:00:00Z', venue:'Lincoln Financial Field', city:'Philadelphia',   country:'USA',     group:'I', round:'Grupo I', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m052', matchNumber:52, homeTeam:'Norway',       awayTeam:'Senegal',       utcDateTime:'2026-06-23T00:00:00Z', venue:'MetLife Stadium',         city:'East Rutherford',country:'USA',     group:'I', round:'Grupo I', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m053', matchNumber:53, homeTeam:'Norway',       awayTeam:'France',        utcDateTime:'2026-06-26T19:00:00Z', venue:'Gillette Stadium',        city:'Foxborough',     country:'USA',     group:'I', round:'Grupo I', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m054', matchNumber:54, homeTeam:'Senegal',      awayTeam:'Iraq',          utcDateTime:'2026-06-26T19:00:00Z', venue:'BMO Field',               city:'Toronto',        country:'Canada',  group:'I', round:'Grupo I', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO J ─────────────────────────────────────────────────────────
  { id:'m055', matchNumber:55, homeTeam:'Argentina',    awayTeam:'Algeria',       utcDateTime:'2026-06-17T00:00:00Z', venue:'Arrowhead Stadium',       city:'Kansas City',    country:'USA',     group:'J', round:'Grupo J', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m056', matchNumber:56, homeTeam:'Austria',      awayTeam:'Jordan',        utcDateTime:'2026-06-17T04:00:00Z', venue:"Levi's Stadium",          city:'Santa Clara',    country:'USA',     group:'J', round:'Grupo J', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m057', matchNumber:57, homeTeam:'Argentina',    awayTeam:'Austria',       utcDateTime:'2026-06-22T16:00:00Z', venue:'AT&T Stadium',            city:'Arlington',      country:'USA',     group:'J', round:'Grupo J', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m058', matchNumber:58, homeTeam:'Jordan',       awayTeam:'Algeria',       utcDateTime:'2026-06-23T03:00:00Z', venue:"Levi's Stadium",          city:'Santa Clara',    country:'USA',     group:'J', round:'Grupo J', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m059', matchNumber:59, homeTeam:'Algeria',      awayTeam:'Austria',       utcDateTime:'2026-06-28T01:00:00Z', venue:'Arrowhead Stadium',       city:'Kansas City',    country:'USA',     group:'J', round:'Grupo J', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m060', matchNumber:60, homeTeam:'Jordan',       awayTeam:'Argentina',     utcDateTime:'2026-06-28T01:00:00Z', venue:'AT&T Stadium',            city:'Arlington',      country:'USA',     group:'J', round:'Grupo J', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO K ─────────────────────────────────────────────────────────
  { id:'m061', matchNumber:61, homeTeam:'Portugal',     awayTeam:'DR Congo',      utcDateTime:'2026-06-17T17:00:00Z', venue:'NRG Stadium',             city:'Houston',        country:'USA',     group:'K', round:'Grupo K', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m062', matchNumber:62, homeTeam:'Uzbekistan',   awayTeam:'Colombia',      utcDateTime:'2026-06-18T01:00:00Z', venue:'Estadio Azteca',          city:'Mexico City',    country:'Mexico',  group:'K', round:'Grupo K', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m063', matchNumber:63, homeTeam:'Portugal',     awayTeam:'Uzbekistan',    utcDateTime:'2026-06-23T17:00:00Z', venue:'NRG Stadium',             city:'Houston',        country:'USA',     group:'K', round:'Grupo K', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m064', matchNumber:64, homeTeam:'Colombia',     awayTeam:'DR Congo',      utcDateTime:'2026-06-24T01:00:00Z', venue:'Estadio Akron',           city:'Zapopan',        country:'Mexico',  group:'K', round:'Grupo K', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m065', matchNumber:65, homeTeam:'Colombia',     awayTeam:'Portugal',      utcDateTime:'2026-06-27T23:30:00Z', venue:'Hard Rock Stadium',       city:'Miami',          country:'USA',     group:'K', round:'Grupo K', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m066', matchNumber:66, homeTeam:'DR Congo',     awayTeam:'Uzbekistan',    utcDateTime:'2026-06-27T23:30:00Z', venue:'Mercedes-Benz Stadium',   city:'Atlanta',        country:'USA',     group:'K', round:'Grupo K', homeScore:null, awayScore:null, status:'scheduled' },

  // ── GRUPO L ─────────────────────────────────────────────────────────
  { id:'m067', matchNumber:67, homeTeam:'England',      awayTeam:'Croatia',       utcDateTime:'2026-06-17T19:00:00Z', venue:'AT&T Stadium',            city:'Arlington',      country:'USA',     group:'L', round:'Grupo L', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m068', matchNumber:68, homeTeam:'Ghana',        awayTeam:'Panama',        utcDateTime:'2026-06-17T23:00:00Z', venue:'BMO Field',               city:'Toronto',        country:'Canada',  group:'L', round:'Grupo L', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m069', matchNumber:69, homeTeam:'England',      awayTeam:'Ghana',         utcDateTime:'2026-06-23T20:00:00Z', venue:'Gillette Stadium',        city:'Foxborough',     country:'USA',     group:'L', round:'Grupo L', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m070', matchNumber:70, homeTeam:'Panama',       awayTeam:'Croatia',       utcDateTime:'2026-06-23T23:00:00Z', venue:'BMO Field',               city:'Toronto',        country:'Canada',  group:'L', round:'Grupo L', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m071', matchNumber:71, homeTeam:'Panama',       awayTeam:'England',       utcDateTime:'2026-06-27T21:00:00Z', venue:'MetLife Stadium',         city:'East Rutherford',country:'USA',     group:'L', round:'Grupo L', homeScore:null, awayScore:null, status:'scheduled' },
  { id:'m072', matchNumber:72, homeTeam:'Croatia',      awayTeam:'Ghana',         utcDateTime:'2026-06-27T21:00:00Z', venue:'Lincoln Financial Field', city:'Philadelphia',   country:'USA',     group:'L', round:'Grupo L', homeScore:null, awayScore:null, status:'scheduled' },
];

async function seed() {
  console.log(`Iniciando seed de ${matches.length} partidos...`);

  // Batch writes (max 500 per batch)
  const BATCH_SIZE = 400;
  let count = 0;

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch: WriteBatch = db.batch();
    const chunk = matches.slice(i, i + BATCH_SIZE);
    chunk.forEach(m => {
      const { id, ...data } = m;
      batch.set(db.collection('matches').doc(id), data);
    });
    await batch.commit();
    count += chunk.length;
    console.log(`  ✓ ${count}/${matches.length} partidos escritos`);
  }

  console.log('\n✅  Seed completado exitosamente.');
  console.log('   72 partidos de la fase de grupos del Mundial 2026 cargados en Firestore.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Error durante el seed:', err);
  process.exit(1);
});
