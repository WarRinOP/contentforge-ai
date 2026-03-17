// Max free content generations per session
export const MAX_GENERATIONS = 3;

const SESSION_KEY = 'cf_session_id';
const REMAINING_KEY = 'cf_remaining';
const ADMIN_KEY = 'cf_admin_key';

// ── Session ID ──────────────────────────────────────────
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

// ── Remaining count ─────────────────────────────────────
export function getStoredRemaining(): number {
  if (typeof window === 'undefined') return MAX_GENERATIONS;
  const val = localStorage.getItem(REMAINING_KEY);
  if (val === null) return MAX_GENERATIONS;
  const n = parseInt(val, 10);
  return isNaN(n) ? MAX_GENERATIONS : n;
}

export function setStoredRemaining(n: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMAINING_KEY, String(n));
}

// ── Admin key ───────────────────────────────────────────
export function getAdminKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ADMIN_KEY) || '';
}

export function setAdminKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_KEY, key);
}

export function clearAdminKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminMode(): boolean {
  return Boolean(getAdminKey());
}
