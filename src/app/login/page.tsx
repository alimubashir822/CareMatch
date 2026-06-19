'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cb = params.get('callbackUrl');
      if (cb) setCallbackUrl(cb);
    }
    if (user) {
      router.push(callbackUrl);
    }
  }, [user, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center p-4 md:p-8 bg-radial from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-0 overflow-hidden bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Left Side: Illustration / Brand Banner */}
        <div className="md:col-span-5 relative hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-teal-600 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="p-1.5 bg-white/10 rounded-lg">
                <span className="text-white text-lg">🩺</span>
              </span>
              CareMatch
            </Link>
          </div>

          <div className="relative z-10 my-auto">
            <h1 className="text-3xl font-extrabold tracking-tight mb-4 leading-tight">
              Smarter Healthcare Connections
            </h1>
            <p className="text-teal-100/90 text-sm leading-relaxed">
              Log in to access your dashboard, consult with patients or doctors, view medical reports, and manage appointment schedules.
            </p>
          </div>

          <div className="relative z-10 text-xs text-teal-200/80">
            © 2026 CareMatch SaaS Marketplace Platform.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Enter your credentials or choose a quick login below
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3">
              <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-glow"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-glow"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-medium rounded-xl shadow-lg shadow-teal-600/15 hover:shadow-teal-600/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Login Section */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Demo Accounts Quick Login
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('patient@carematch.com')}
                className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 text-left transition duration-150 cursor-pointer"
              >
                <div className="font-bold text-teal-600 dark:text-teal-400">Patient</div>
                <div className="truncate text-slate-400">Sarah Connor</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('dr.sarah@carematch.com')}
                className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 text-left transition duration-150 cursor-pointer"
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-400">Doctor</div>
                <div className="truncate text-slate-400">Dr. Sarah Ahmed</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@carematch.com')}
                className="py-2 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 text-left transition duration-150 col-span-2 md:col-span-1 cursor-pointer"
              >
                <div className="font-bold text-violet-600 dark:text-violet-400">Admin</div>
                <div className="truncate text-slate-400">CareMatch Admin</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
