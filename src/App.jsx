import React, { useState } from 'react';
import Questionnaire from './components/Questionnaire';
import AuthSection from './components/AuthSection';
import { Leaf, Shield, Globe, Award } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);

  const handleAuthChange = (activeUser) => {
    setUser(activeUser);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#090d16]">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950">
              <Leaf size={16} className="fill-current" />
            </div>
            <span className="font-sans font-bold text-lg text-white tracking-tight">
              CarbonMind <span className="text-emerald-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block">Platform</span>
            <span className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block">Methodology</span>
            <AuthSection onAuthChange={handleAuthChange} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center py-10 relative z-10">
        <div className="w-full">
          <Questionnaire user={user} />
        </div>
      </main>

      {/* Features Showcase Section */}
      <section className="bg-slate-950/40 border-t border-slate-900/60 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4">
                <Globe size={20} />
              </div>
              <h3 className="text-white font-bold text-base mb-2">Global Impact tracking</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                We use recognized CO₂e coefficients matching global carbon protocols to compute direct household emissions.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4">
                <Shield size={20} />
              </div>
              <h3 className="text-white font-bold text-base mb-2">Secure & Private</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                All metrics are computed client-side. We generate profile structures directly without saving trackers or cookies.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start p-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4">
                <Award size={20} />
              </div>
              <h3 className="text-white font-bold text-base mb-2">Tailored Optimization</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Receive context-specific guidance based on your eating habits, transportation choices, and electrical profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CarbonMind AI. Build for Green Tech Initiative.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Contact Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
