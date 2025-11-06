import fetch from 'node-fetch';

export async function verifyRecaptcha(token?: string) {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return false; // no secret configured -> skip verification false

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return (
      data.success === true && (data.score === undefined || data.score >= 0.3)
    );
  } catch (e) {
    return false;
  }
}
