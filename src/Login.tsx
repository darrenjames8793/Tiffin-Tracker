import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from './api';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const result = await login(password);
    setIsSubmitting(false);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Incorrect password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Decorative gradient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Card container */}
      <div className={`w-full max-w-[420px] bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 rounded-[32px] shadow-2xl shadow-black/40 text-center transition-all ${
        shake ? 'animate-shake' : ''
      }`}>
        <div className="flex flex-col items-center">
          {/* Logo Icon with Bounce */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-emerald-500/5 animate-bounce">
            🍱
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Tiffin Tracker
          </h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">
            Please enter your access password to view your meal logs
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="relative w-full">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full bg-slate-950/80 border text-slate-100 placeholder-slate-500 rounded-2xl pl-5 pr-12 py-3.5 h-[52px] text-base focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all ${
                  error ? 'border-red-500/50 focus-visible:ring-red-500/10' : 'border-slate-800 hover:border-slate-700 focus:border-emerald-500'
                }`}
              />
              
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg cursor-pointer"
              >
                {showPassword ? (
                  // Eye Off Icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // Eye Icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-xs font-semibold text-left pl-1 -mt-1 flex items-center gap-1.5 animate-fadeIn">
                <span className="text-sm">⚠️</span> {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold rounded-2xl py-3.5 h-[52px] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2 mt-2"
            >
              <span>{isSubmitting ? 'Accessing...' : 'Access Tracker'}</span>
              {!isSubmitting && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/70">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Secured Access Session</span>
        </div>
      </div>
    </div>
  );
}
