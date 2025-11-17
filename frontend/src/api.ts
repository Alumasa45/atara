// Always use production backend for now
const BASE = 'https://atara-dajy.onrender.com';
console.log('API BASE URL:', BASE);

// Test server connectivity on load
fetch(`${BASE}/health`)
  .then(res => res.text())
  .then(text => console.log('Server health check:', text))
  .catch(err => console.error('Server health check failed:', err));

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
  return getJson('/trainers?page=1&limit=100');
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
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Login failed:', res.status, errorText);
    throw new Error(`Login failed ${res.status}`);
  }
  const text = await res.text();
  if (!text) throw new Error('Empty response from server');
  try {
    const data = JSON.parse(text);
    const t = data?.access_token ?? data?.token ?? null;
    if (t) localStorage.setItem('token', t);
    return data;
  } catch (e) {
    console.error('Login JSON parse error:', e, 'Response:', text);
    throw new Error('Invalid response from server');
  }
}

export async function googleSignIn(body: {
  idToken: string;
  email?: string;
  username?: string;
  google_id?: string;
}) {
  console.log('Google sign in attempt with:', { ...body, idToken: 'HIDDEN' });
  const result = await postJson('/auth/google', body);
  console.log('Google sign in result:', result);
  const t = result?.access_token ?? result?.token ?? null;
  if (t) {
    localStorage.setItem('token', t);
    console.log('Token stored successfully');
  } else {
    console.error('No token in Google sign in response:', result);
  }
  return result;
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
