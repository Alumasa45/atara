// Use same domain as frontend to avoid CORS issues
const BASE = window.location.origin;
console.log('API BASE URL:', BASE);

async function getJson(path: string) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${BASE}${path}`;
  console.log('Making GET request to:', url);
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse error:', e, 'Response text:', text);
    throw new Error('Invalid JSON response');
  }
}

/**
 * Try a POST JSON and return parsed JSON or throw.
 */
async function postJson(path: string, body: any) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('JSON parse error:', e, 'Response text:', text);
    throw new Error('Invalid JSON response');
  }
}

/**
 * Decode JWT payload (best-effort) from stored token to prefill user info.
 */
export function getCurrentUserFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    // common fields: sub/userId/email/username
    return payload;
  } catch (e) {
    return null;
  }
}

export { getJson, postJson };

export async function fetchTrainers() {
  return getJson('/trainers');
}

export async function fetchSessions() {
  return getJson('/sessions');
}

export async function fetchSchedules() {
  return getJson('/schedule');
}

/**
 * Fetch slide filenames from an admin endpoint. Fallback to static list if the endpoint is missing or fails.
 */
export async function fetchSlides() {
  try {
    const result = await getJson('/slides');
    // Expect result to be array of filenames or full URLs
    if (Array.isArray(result) && result.length)
      return result.map((f: string) =>
        f.startsWith('http') ? f : `/images/${f}`,
      );
  } catch (err) {
    // ignore and fallback
  }
  // fallback defaults (these files should exist in public/images)
  return ['/images/slide-1.jpg', '/images/slide-2.jpg', '/images/slide-3.jpg'];
}

export async function createBooking(payload: any) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}/bookings`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create booking failed ${res.status}`);
  return res.json();
}

export async function confirmBooking(
  bookingId: number | string,
  payment_ref?: string,
) {
  // call backend confirm endpoint that verifies payment refs or triggers admin flow
  return postJson(`/bookings/${bookingId}/confirm`, { payment_ref });
}

export async function login(credentials: { email: string; password: string }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error(`Login failed ${res.status}`);
  const data = await res.json();
  // if server returns token in body, store it here for convenience
  const t = data?.access_token ?? data?.token ?? null;
  if (t) localStorage.setItem('token', t);
  return data;
}

export async function googleSignIn(body: {
  idToken: string;
  email?: string;
  username?: string;
  google_id?: string;
}) {
  return postJson('/auth/google', body);
}

export async function register(body: {
  email: string;
  username?: string;
  password?: string;
  google_id?: string;
}) {
  // Note: backend currently restricts /auth/register to admin users. Call will likely 403 in production.
  return postJson('/auth/register', body);
}

// ============ MEMBERSHIP ENDPOINTS ============

export async function fetchMembershipPlans() {
  console.log('Fetching from:', BASE + '/memberships/plans');
  return getJson('/memberships/plans');
}

export async function purchaseMembership(
  planId: number,
  paymentReference?: string,
) {
  return postJson('/memberships/purchase', {
    plan_id: planId,
    payment_reference: paymentReference,
  });
}

export async function getMySubscriptions() {
  return getJson('/memberships/my-subscriptions');
}

export async function getMyActiveSubscription() {
  return getJson('/memberships/my-active');
}

export default {
  fetchTrainers,
  fetchSessions,
  fetchSchedules,
  fetchSlides,
  createBooking,
  confirmBooking,
  getCurrentUserFromToken,
  login,
  googleSignIn,
  register,
  fetchMembershipPlans,
  purchaseMembership,
  getMySubscriptions,
  getMyActiveSubscription,
};
