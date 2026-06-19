import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, LogIn, LogOut, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '../utils/api';

/**
 * AuthSection Component
 * Manages user login/register modal using React Portals to escape container context limits.
 */
export default function AuthSection({ onAuthChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  // Load user session on mount
  useEffect(() => {
    const cachedToken = localStorage.getItem('carbonmind_token');
    const cachedUser = localStorage.getItem('carbonmind_username');
    if (cachedToken && cachedUser) {
      const activeUser = { token: cachedToken, username: cachedUser };
      setUser(activeUser);
      if (onAuthChange) onAuthChange(activeUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('carbonmind_token');
    localStorage.removeItem('carbonmind_username');
    setUser(null);
    if (onAuthChange) onAuthChange(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Success
      localStorage.setItem('carbonmind_token', data.access_token);
      localStorage.setItem('carbonmind_username', data.username);
      
      const activeUser = { token: data.access_token, username: data.username };
      setUser(activeUser);
      setSuccess(isRegister ? 'Registration successful!' : 'Logged in successfully!');
      
      setTimeout(() => {
        setIsOpen(false);
        if (onAuthChange) onAuthChange(activeUser);
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
            Signed in as: <span className="text-emerald-400 font-bold">{user.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-855 bg-slate-900/40 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          <LogIn size={13} />
          Sync Account
        </button>
      )}

      {/* Render Auth Modal overlay directly at document.body using React Portals */}
      {isOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-805 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 cursor-pointer text-xl"
            >
              &times;
            </button>

            <div className="flex items-center gap-2 mb-4">
              <KeyRound className="text-emerald-400 w-5 h-5" />
              <h3 className="text-white font-bold text-lg">
                {isRegister ? 'Create Account' : 'Sign In'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3 py-2 bg-slate-950 text-slate-200 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-emerald-500 animate-fade-in"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3 py-2 bg-slate-950 text-slate-200 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-emerald-500 animate-fade-in"
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 p-2 bg-rose-950/20 border border-rose-900/30 rounded-lg text-rose-400 text-xs">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-1.5 p-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-450 text-xs">
                  <CheckCircle2 size={14} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-emerald-400 hover:bg-emerald-350 text-slate-950 font-bold rounded-lg text-sm transition-colors cursor-pointer"
              >
                {isRegister ? 'Sign Up' : 'Log In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setSuccess('');
                }}
                className="text-xs text-slate-450 hover:underline hover:text-emerald-450 cursor-pointer"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
