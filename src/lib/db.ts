// src/lib/db.ts
import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp,
} from './firebase';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface WorldCupMatch {
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
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'live' | 'finished';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  totalPoints: number;
  totalPredictions: number;
  exactResults: number;
  correctWinners: number;
  createdAt: any;
}

export interface Prediction {
  id?: string;
  userId: string;
  matchId: string;
  homeGoals: number;
  awayGoals: number;
  points?: number;
  status: 'pending' | 'scored';
  createdAt: any;
  updatedAt: any;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalPoints: number;
  exactResults: number;
  correctWinners: number;
}

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────
export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    uid,
    totalPoints: 0,
    totalPredictions: 0,
    exactResults: 0,
    correctWinners: 0,
    createdAt: serverTimestamp(),
    ...data,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { ...data });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => d.data() as UserProfile);
}

// ──────────────────────────────────────────────
// Predictions
// ──────────────────────────────────────────────
export async function savePrediction(prediction: Omit<Prediction, 'id'>) {
  const id = `${prediction.userId}_${prediction.matchId}`;
  const ref = doc(db, 'predictions', id);
  await setDoc(ref, {
    ...prediction,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return id;
}

export async function getUserPredictions(userId: string): Promise<Prediction[]> {
  const q = query(
    collection(db, 'predictions'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prediction));
}

export async function getPrediction(userId: string, matchId: string): Promise<Prediction | null> {
  const id = `${userId}_${matchId}`;
  const ref = doc(db, 'predictions', id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Prediction) : null;
}

export async function getAllPredictionsForMatch(matchId: string): Promise<Prediction[]> {
  const q = query(collection(db, 'predictions'), where('matchId', '==', matchId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prediction));
}

// ──────────────────────────────────────────────
// Points system
// Exact result → 5 pts | Correct winner/draw → 2 pts
// ──────────────────────────────────────────────
export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): { points: number; type: 'exact' | 'winner' | 'miss' } {
  if (predHome === realHome && predAway === realAway) {
    return { points: 5, type: 'exact' };
  }
  const predWinner = Math.sign(predHome - predAway);
  const realWinner = Math.sign(realHome - realAway);
  if (predWinner === realWinner) {
    return { points: 2, type: 'winner' };
  }
  return { points: 0, type: 'miss' };
}

// ──────────────────────────────────────────────
// Matches (from Firestore, seeded via scripts/seed-matches.js)
// ──────────────────────────────────────────────
export async function getMatches(): Promise<WorldCupMatch[]> {
  const q = query(collection(db, 'matches'), orderBy('utcDateTime', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorldCupMatch));
}

export async function getMatchesByGroup(group: string): Promise<WorldCupMatch[]> {
  const q = query(
    collection(db, 'matches'),
    where('group', '==', group),
    orderBy('utcDateTime', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorldCupMatch));
}

// ──────────────────────────────────────────────
// Standings (group phase table)
// ──────────────────────────────────────────────
export interface TeamStanding {
  team: string;
  PJ: number;
  G: number;
  E: number;
  P: number;
  GF: number;
  GC: number;
  GD: number;
  Pts: number;
}

export interface GroupStanding {
  group: string;
  teams: TeamStanding[];
  updatedAt: any;
}

export function computeStandings(teamNames: string[], matches: WorldCupMatch[]): TeamStanding[] {
  const tbl: Record<string, TeamStanding> = {};
  for (const t of teamNames) tbl[t] = { team: t, PJ: 0, G: 0, E: 0, P: 0, GF: 0, GC: 0, GD: 0, Pts: 0 };
  for (const m of matches) {
    if (m.status !== 'finished' || m.homeScore == null || m.awayScore == null) continue;
    const h = tbl[m.homeTeam], a = tbl[m.awayTeam];
    if (!h || !a) continue;
    h.PJ++; a.PJ++;
    h.GF += m.homeScore; h.GC += m.awayScore; h.GD += m.homeScore - m.awayScore;
    a.GF += m.awayScore; a.GC += m.homeScore; a.GD += m.awayScore - m.homeScore;
    if (m.homeScore > m.awayScore)      { h.G++; h.Pts += 3; a.P++; }
    else if (m.homeScore < m.awayScore) { a.G++; a.Pts += 3; h.P++; }
    else                                { h.E++; h.Pts++;    a.E++; a.Pts++; }
  }
  return Object.values(tbl).sort((a, b) =>
    b.Pts !== a.Pts ? b.Pts - a.Pts : b.GD !== a.GD ? b.GD - a.GD : b.GF - a.GF
  );
}

export async function getGroupStandings(group: string): Promise<GroupStanding | null> {
  const snap = await getDoc(doc(db, 'standings', group));
  return snap.exists() ? (snap.data() as GroupStanding) : null;
}

export async function getAllGroupStandings(): Promise<Record<string, GroupStanding>> {
  const snap = await getDocs(collection(db, 'standings'));
  const out: Record<string, GroupStanding> = {};
  snap.docs.forEach(d => { out[d.id] = d.data() as GroupStanding; });
  return out;
}

export async function saveGroupStandings(group: string, teams: TeamStanding[]): Promise<void> {
  await setDoc(doc(db, 'standings', group), { group, teams, updatedAt: serverTimestamp() });
}

export async function updateMatchScore(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  await updateDoc(doc(db, 'matches', matchId), { homeScore, awayScore, status: 'finished' });
}

export async function setMatchStatus(
  matchId: string,
  status: 'scheduled' | 'live' | 'finished'
): Promise<void> {
  await updateDoc(doc(db, 'matches', matchId), { status });
}

export async function recalculateGroupStandings(group: string, teamNames: string[]): Promise<void> {
  const matches = await getMatchesByGroup(group);
  await saveGroupStandings(group, computeStandings(teamNames, matches));
}

// ──────────────────────────────────────────────
// Scoring — run after admin saves a match result
// ──────────────────────────────────────────────
export async function scorePredictionsForMatch(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<{ scored: number; skipped: number }> {
  const allPreds = await getAllPredictionsForMatch(matchId);
  const pending = allPreds.filter(p => p.status === 'pending');

  for (const pred of pending) {
    const { points, type } = calculatePoints(pred.homeGoals, pred.awayGoals, homeScore, awayScore);

    await updateDoc(doc(db, 'predictions', pred.id!), {
      points,
      status: 'scored',
      updatedAt: serverTimestamp(),
    });

    const userUpdate: Record<string, any> = {
      totalPoints: increment(points),
      totalPredictions: increment(1),
    };
    if (type === 'exact')  userUpdate.exactResults   = increment(1);
    if (type === 'winner') userUpdate.correctWinners = increment(1);

    await updateDoc(doc(db, 'users', pred.userId), userUpdate);
  }

  return { scored: pending.length, skipped: allPreds.length - pending.length };
}

// ──────────────────────────────────────────────
// Leaderboard
// ──────────────────────────────────────────────
export async function getLeaderboard(top = 20): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'users'),
    orderBy('totalPoints', 'desc'),
    limit(top)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL,
      totalPoints: data.totalPoints,
      exactResults: data.exactResults,
      correctWinners: data.correctWinners,
    };
  });
}
