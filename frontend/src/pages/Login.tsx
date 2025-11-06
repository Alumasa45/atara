import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import NavigationHeader from '../components/NavigationHeader';
import api from '../api';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const nav = useNavigate();
  const googleBtn = useRef<HTMLDivElement | null>(null);
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    // If GSI script is loaded and clientId is provided, render Google button
    const google = (window as any).google;
    if (!google || !clientId || !googleBtn.current) return;

    // callback invoked when Google returns an id_token credential
    function handleCredentialResponse(response: any) {
      const idToken = response?.credential;
      if (!idToken) return;
      (async () => {
        setLoading(true);
        try {
          await (auth as any).googleLogin(idToken);
          toast.success('Signed in with Google');
          nav('/');
        } catch (err: any) {
          toast.error('Google sign-in failed: ' + (err?.message ?? err));
        } finally {
          setLoading(false);
        }
      })();
    }

    try {
      // Initialize the Google Identity Services client
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      // Render the Google button into our container
      google.accounts.id.renderButton(googleBtn.current, {
        theme: 'outline',
        size: 'large',
      });

      // Optionally show One Tap prompt (commented out by default)
      // google.accounts.id.prompt();
    } catch (e) {
      // ignore init errors — fallback will still work
      // console.warn('Google Identity init failed', e);
    }
  }, [auth, clientId, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') {
        await auth.login(email, password);
        toast.success('Signed in');
        nav('/');
      } else {
        // Sign up flow
        try {
          await api.register({ email, username, password });
          toast.success(
            'Registered — please sign in. If registration is restricted, contact admin.',
          );
          setMode('signin');
          setPassword('');
        } catch (err: any) {
          // Backend may reject registration (e.g., admin-only). Surface message.
          const msg = err?.message ?? String(err);
          toast.error('Sign up failed: ' + msg);
        }
      }
    } catch (err: any) {
      toast.error('Authentication failed: ' + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  // Fallback/manual prompt (kept for dev/testing if GSI/ENV not configured)
  async function handleGoogle() {
    const idToken = window.prompt('Paste Google idToken here (for testing)');
    if (!idToken) return;
    setLoading(true);
    try {
      await (auth as any).googleLogin(idToken);
      toast.success('Signed in with Google');
      nav('/');
    } catch (err: any) {
      toast.error('Google sign-in failed: ' + (err?.message ?? err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <NavigationHeader />
      <div className="card" style={{ maxWidth: 480, margin: '92px auto 32px' }}>
        <h2>{mode === 'signin' ? 'Sign in' : 'Create an account'}</h2>
        <form
          onSubmit={submit}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode === 'signup' && (
            <input
              className="input"
              placeholder="Username (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="button" type="submit" disabled={loading}>
              {loading
                ? mode === 'signin'
                  ? 'Signing in...'
                  : 'Signing up...'
                : mode === 'signin'
                  ? 'Sign in'
                  : 'Sign up'}
            </button>
            {/* Container for Google's rendered sign-in button. If GSI is unavailable
                the button won't render and we fall back to the manual prompt below. */}
            <div ref={googleBtn} />
          </div>
        </form>

        <div style={{ marginTop: 12, color: 'var(--muted)' }}>
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                className="button"
                style={{ padding: '6px 10px' }}
                onClick={() => setMode('signup')}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="button"
                style={{ padding: '6px 10px' }}
                onClick={() => setMode('signin')}
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Small fallback when GSI is not available (dev/test) */}
        {!((window as any).google && clientId) && (
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="button"
              style={{ background: 'var(--accent-1)' }}
              onClick={handleGoogle}
            >
              Sign in with Google (manual)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
