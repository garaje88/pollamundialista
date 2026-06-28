// src/lib/knockout.ts
// Resolución dinámica del cuadro eliminatorio del Mundial 2026.
//
// Los partidos de eliminatorias se siembran con códigos placeholder en lugar
// de equipos reales, porque los clasificados dependen de los resultados de la
// fase de grupos y de las rondas previas:
//
//   1A, 2B      → 1.º / 2.º de un grupo (se resuelve con la tabla de posiciones)
//   3ABCDF      → uno de los mejores terceros (entre los grupos indicados)
//   W-M74       → ganador del partido m074
//   L-M101      → perdedor del partido m101 (para el 3.er puesto)
//
// Este módulo convierte esos códigos en equipos reales en cuanto los datos
// (standings + resultados) están disponibles en Firestore. Mientras tanto,
// `prettyCode` ofrece una etiqueta legible ("Ganador P74", "1.º Grupo A").

import type { WorldCupMatch, TeamStanding } from './db';

// ──────────────────────────────────────────────
// Banderas
// ──────────────────────────────────────────────
export const FLAG: Record<string, string> = {
  'Mexico':'mx','South Africa':'za','South Korea':'kr','Czech Republic':'cz',
  'Canada':'ca','Bosnia and Herzegovina':'ba','Qatar':'qa','Switzerland':'ch',
  'Brazil':'br','Morocco':'ma','Haiti':'ht','Scotland':'gb-sct',
  'United States':'us','Paraguay':'py','Australia':'au','Turkey':'tr',
  'Germany':'de','Curacao':'cw','Ivory Coast':'ci','Ecuador':'ec',
  'Netherlands':'nl','Japan':'jp','Sweden':'se','Tunisia':'tn',
  'Belgium':'be','Egypt':'eg','Iran':'ir','New Zealand':'nz',
  'Spain':'es','Cape Verde':'cv','Saudi Arabia':'sa','Uruguay':'uy',
  'France':'fr','Senegal':'sn','Iraq':'iq','Norway':'no',
  'Argentina':'ar','Algeria':'dz','Austria':'at','Jordan':'jo',
  'Portugal':'pt','DR Congo':'cd','Uzbekistan':'uz','Colombia':'co',
  'England':'gb-eng','Croatia':'hr','Ghana':'gh','Panama':'pa',
};

/** URL de la bandera del equipo (o bandera neutra si es un código sin resolver). */
export const flagUrl = (team: string): string =>
  `https://flagcdn.com/w80/${FLAG[team] ?? 'un'}.png`;

// ──────────────────────────────────────────────
// Detección y formato de códigos placeholder
// ──────────────────────────────────────────────
const POS_RE   = /^([12])([A-L])$/;          // 1A, 2B
const THIRD_RE = /^3([A-L]{4,6})$/;          // 3ABCDF
const WL_RE    = /^([WL])-M(\d+)$/;          // W-M74, L-M101

/** ¿El nombre sigue siendo un placeholder (no un equipo real)? */
export function isPlaceholder(name: string): boolean {
  return POS_RE.test(name) || THIRD_RE.test(name) || WL_RE.test(name);
}

const ORD = (n: string) => (n === '1' ? '1.º' : n === '2' ? '2.º' : '3.º');

/** Etiqueta legible para un código placeholder ("Ganador P74", "1.º Grupo A"). */
export function prettyCode(code: string): string {
  const p = code.match(POS_RE);
  if (p) return `${ORD(p[1])} Grupo ${p[2]}`;
  const t = code.match(THIRD_RE);
  if (t) return `3.º (${t[1].split('').join('/')})`;
  const wl = code.match(WL_RE);
  if (wl) return `${wl[1] === 'W' ? 'Ganador' : 'Perdedor'} P${+wl[2]}`;
  return code;
}

// ──────────────────────────────────────────────
// Resolución del cuadro
// ──────────────────────────────────────────────

/**
 * Resuelve, para cada partido, los nombres reales de local y visitante a partir
 * de las tablas de posiciones y los resultados ya cargados.
 *
 * @param matches    Todos los partidos (grupos + eliminatorias).
 * @param standings  Tablas por grupo: { A: TeamStanding[], B: [...], ... } ya ordenadas.
 * @returns Map matchId → { home, away } con equipos reales donde sea posible;
 *          si un dato falta, se conserva el código placeholder original.
 */
export function resolveBracket(
  matches: WorldCupMatch[],
  standings: Record<string, TeamStanding[]>,
): Map<string, { home: string; away: string }> {
  const byId = new Map(matches.map(m => [m.id, m]));

  // 1.º / 2.º de grupo → equipo real
  const fromPos = (code: string): string | null => {
    const m = code.match(POS_RE);
    if (!m) return null;
    const arr = standings[m[2]];
    const idx = +m[1] - 1;
    return arr?.[idx]?.team ?? null;
  };

  // Mejores terceros: ranking global de los terceros de cada grupo con partidos jugados.
  const thirds = Object.keys(standings)
    .map(g => ({ group: g, s: standings[g]?.[2] }))
    .filter((x): x is { group: string; s: TeamStanding } => !!x.s && x.s.PJ > 0)
    .sort((a, b) =>
      b.s.Pts - a.s.Pts ||
      b.s.GD - a.s.GD ||
      b.s.GF - a.s.GF ||
      a.group.localeCompare(b.group),
    )
    .slice(0, 8);

  // Asignación de terceros a cada ranura "3XXXX", por orden de partido y respetando
  // los grupos permitidos en cada ranura (greedy: mejor tercero disponible elegible).
  const thirdAssign = new Map<string, string>(); // matchId+side → team
  const used = new Set<string>();
  const slots = matches
    .flatMap(m => {
      const out: { id: string; side: 'home' | 'away'; allowed: string[]; num: number }[] = [];
      const h = m.homeTeam.match(THIRD_RE);
      const a = m.awayTeam.match(THIRD_RE);
      if (h) out.push({ id: m.id, side: 'home', allowed: h[1].split(''), num: m.matchNumber });
      if (a) out.push({ id: m.id, side: 'away', allowed: a[1].split(''), num: m.matchNumber });
      return out;
    })
    .sort((a, b) => a.num - b.num);
  for (const slot of slots) {
    const pick = thirds.find(t => !used.has(t.group) && slot.allowed.includes(t.group));
    if (pick) {
      used.add(pick.group);
      thirdAssign.set(slot.id + slot.side, pick.s.team);
    }
  }

  // Resolución por ranura (memoizada). La recursión de ganadores/perdedores siempre
  // apunta a partidos con número menor, así que termina.
  const memo = new Map<string, string>();

  const resolveSlot = (matchId: string, side: 'home' | 'away'): string => {
    const key = matchId + side;
    if (memo.has(key)) return memo.get(key)!;
    const m = byId.get(matchId);
    if (!m) return '';
    const code = side === 'home' ? m.homeTeam : m.awayTeam;

    let result = code;
    const pos = fromPos(code);
    if (pos) {
      result = pos;
    } else if (THIRD_RE.test(code)) {
      result = thirdAssign.get(key) ?? code;
    } else {
      const wl = code.match(WL_RE);
      if (wl) {
        const refId = 'm' + wl[2].padStart(3, '0');
        const rm = byId.get(refId);
        if (rm && rm.homeScore != null && rm.awayScore != null && rm.homeScore !== rm.awayScore) {
          const winSide: 'home' | 'away' = rm.homeScore > rm.awayScore ? 'home' : 'away';
          const takeSide = wl[1] === 'W' ? winSide : winSide === 'home' ? 'away' : 'home';
          result = resolveSlot(refId, takeSide);
        }
      }
    }
    memo.set(key, result);
    return result;
  };

  const out = new Map<string, { home: string; away: string }>();
  for (const m of matches) {
    out.set(m.id, { home: resolveSlot(m.id, 'home'), away: resolveSlot(m.id, 'away') });
  }
  return out;
}
