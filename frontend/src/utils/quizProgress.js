// Utility for tracking quiz completion in localStorage
const STORAGE_KEY = 'sr_completed_quizzes';

export function getCompletedQuizzes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
  } catch (e) {
    // ignore
  }
  return [];
}

export function isQuizCompleted(id) {
  if (!id) return false;
  return getCompletedQuizzes().includes(id);
}

export async function markQuizCompleted(id) {
  if (!id) return;
  // update local cache immediately
  const arr = new Set(getCompletedQuizzes());
  arr.add(id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...arr])); } catch (e) {}

  // dispatch event so other parts can react immediately
  try { window.dispatchEvent(new CustomEvent('quiz:completed', { detail: { id } })); } catch (e) {}

  // best-effort server sync: POST to a conventional endpoint if API_BASE + auth present
  try {
    const base = (typeof API_BASE !== 'undefined') ? API_BASE : null;
    const authHeaders = (window.AuthService && window.AuthService.getAuthHeaders) ? window.AuthService.getAuthHeaders() : {};
    if (base && authHeaders && Object.keys(authHeaders).length) {
      // NOTE: endpoint is conventional and may need to be adapted to your backend
      await fetch(`${base}/users/me/quizzes/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ completed_at: new Date().toISOString() }),
      });
    }
  } catch (e) {
    // ignore failures – local storage is the source of truth for now
  }
}

export function clearQuizCompleted(id) {
  if (!id) return;
  const arr = new Set(getCompletedQuizzes());
  arr.delete(id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...arr])); } catch (e) {}
}
