import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Renders children only for a signed-in Supabase user.
 * Admin accounts are created in Supabase → Authentication → Users (no public sign-up).
 */
export default function AdminGate({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('بيانات الدخول غير صحيحة / Invalid credentials');
    setBusy(false);
  };

  if (checking) return null;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7] p-4">
        <form onSubmit={signIn} className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-4">
          <h1 className="text-xl font-black text-center">Fastamor Admin</h1>
          <input
            type="email" required autoComplete="username" placeholder="Email"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
          <input
            type="password" required autoComplete="current-password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button disabled={busy} className="w-full bg-primary text-white font-bold rounded-xl py-3 disabled:opacity-60">
            {busy ? '...' : 'Sign in'}
          </button>
          <button type="button" onClick={onClose} className="w-full text-sm text-muted">Back</button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-3 left-3 z-50">
        <button
          onClick={async () => { await supabase.auth.signOut(); onClose(); }}
          className="text-xs bg-black/80 text-white rounded-full px-3 py-1"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
