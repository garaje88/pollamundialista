// src/lib/api.ts
// TheSportsDB Free API – League 4429 = FIFA World Cup

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const LEAGUE_ID = '4429';
const SEASON = '2026';

export interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strVenue: string;
  strLeagueSeason: string;
  strRound: string;
  strStatus: string;
  idHomeTeam: string;
  idAwayTeam: string;
}

export interface Team {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
  strCountry: string;
  strDescriptionES?: string;
}

// ── Fetch all season matches ──────────────────
export async function fetchWorldCupMatches(): Promise<Match[]> {
  try {
    const res = await fetch(
      `${BASE}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`
    );
    const json = await res.json();
    return (json.events as Match[]) || [];
  } catch {
    return [];
  }
}

// ── Fetch upcoming matches (next 10) ─────────
export async function fetchNextMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE}/eventsnextleague.php?id=${LEAGUE_ID}`);
    const json = await res.json();
    return (json.events as Match[]) || [];
  } catch {
    return [];
  }
}

// ── Fetch past matches (last 15) ─────────────
export async function fetchLastMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${BASE}/eventspastleague.php?id=${LEAGUE_ID}`);
    const json = await res.json();
    return (json.events as Match[]) || [];
  } catch {
    return [];
  }
}

// ── Fetch team badge URL ──────────────────────
export function getBadgeUrl(teamName: string): string {
  const codes: Record<string, string> = {
    // Grupo A
    'Mexico': 'mx', 'South Africa': 'za', 'South Korea': 'kr', 'Czech Republic': 'cz',
    // Grupo B
    'Canada': 'ca', 'Bosnia and Herzegovina': 'ba', 'Qatar': 'qa', 'Switzerland': 'ch',
    // Grupo C
    'Brazil': 'br', 'Morocco': 'ma', 'Haiti': 'ht', 'Scotland': 'gb-sct',
    // Grupo D
    'United States': 'us', 'USA': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turkey': 'tr',
    // Grupo E
    'Germany': 'de', 'Curacao': 'cw', 'Curaçao': 'cw', 'Ivory Coast': 'ci', 'Ecuador': 'ec',
    // Grupo F
    'Netherlands': 'nl', 'Japan': 'jp', 'Sweden': 'se', 'Tunisia': 'tn',
    // Grupo G
    'Belgium': 'be', 'Egypt': 'eg', 'Iran': 'ir', 'New Zealand': 'nz',
    // Grupo H
    'Spain': 'es', 'Cape Verde': 'cv', 'Saudi Arabia': 'sa', 'Uruguay': 'uy',
    // Grupo I
    'France': 'fr', 'Senegal': 'sn', 'Iraq': 'iq', 'Norway': 'no',
    // Grupo J
    'Argentina': 'ar', 'Algeria': 'dz', 'Austria': 'at', 'Jordan': 'jo',
    // Grupo K
    'Portugal': 'pt', 'DR Congo': 'cd', 'Uzbekistan': 'uz', 'Colombia': 'co',
    // Grupo L
    'England': 'gb-eng', 'Croatia': 'hr', 'Ghana': 'gh', 'Panama': 'pa',
    // Extras
    'Chile': 'cl', 'Peru': 'pe', 'Venezuela': 've', 'Poland': 'pl',
    'Denmark': 'dk', 'Serbia': 'rs', 'Italy': 'it', 'Greece': 'gr',
    'Nigeria': 'ng', 'Cameroon': 'cm', 'Indonesia': 'id', 'Hungary': 'hu',
    'Ukraine': 'ua', 'Romania': 'ro', 'Angola': 'ao',
  };
  const code = codes[teamName] || teamName.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/w80/${code}.png`;
}

// ── Group matches by round ─────────────────────
export function groupByRound(matches: Match[]): Record<string, Match[]> {
  return matches.reduce((acc, match) => {
    const round = match.strRound || 'Fase de grupos';
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {} as Record<string, Match[]>);
}

// ── Format date to Spanish locale (America/Bogota, UTC-5) ─────────────
export function formatMatchDate(utcIso: string): string {
  try {
    return new Date(utcIso).toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return utcIso; }
}

export function formatMatchTime(utcIso: string): string {
  try {
    return new Date(utcIso).toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return utcIso; }
}

export function formatMatchDay(utcIso: string): string {
  try {
    return new Date(utcIso).toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      weekday: 'short', day: 'numeric', month: 'short',
    });
  } catch { return utcIso; }
}

// ── World Cup 2026 groups (draw oficial dic 2024) ──
export const WC2026_GROUPS: Record<string, string[]> = {
  'A': ['Mexico', 'South Africa', 'South Korea', 'Czech Republic'],
  'B': ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  'C': ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  'D': ['United States', 'Paraguay', 'Australia', 'Turkey'],
  'E': ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
  'F': ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  'G': ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  'H': ['Spain', 'Uruguay', 'Saudi Arabia', 'Cape Verde'],
  'I': ['France', 'Senegal', 'Iraq', 'Norway'],
  'J': ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  'K': ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  'L': ['England', 'Croatia', 'Ghana', 'Panama'],
};
