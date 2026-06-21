import { useState } from 'react';
import { createPortal } from 'react-dom';
import Questionnaire from './components/Questionnaire';
import AuthSection from './components/AuthSection';
import { Leaf, Shield, Globe, Award, X, Info, BookOpen, ChevronRight, Zap } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'platform', 'methodology', or null

  const handleAuthChange = (activeUser) => {
    setUser(activeUser);
  };

  const renderModal = () => {
    if (!activeModal) return null;

    const modalContent = activeModal === 'platform' ? {
      icon: <Info className="text-emerald-400 w-5 h-5" />,
      title: "About CarbonMind AI Platform",
      body: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            CarbonMind AI is a premium, personal sustainability management platform designed to help you calculate, visualize, and optimize your environmental footprint.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex gap-2.5">
              <ChevronRight className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-white font-bold block">Carbon Twin & What-If Simulator</span>
                Model lifestyle changes (like swapping commute modes or switching diets) to optimize a virtual future version of your footprint in real-time.
              </div>
            </div>
            <div className="flex gap-2.5">
              <ChevronRight className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-white font-bold block">Weekly Sustainability Challenges</span>
                Engage in actionable tasks (like walking instead of driving) to build commute streaks, earn points, and unlock milestones.
              </div>
            </div>
            <div className="flex gap-2.5">
              <ChevronRight className="text-emerald-400 w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-white font-bold block">AI Chatbot Assistant</span>
                Interact with a sustainability assistant trained to provide explanation on carbon metrics, reduction pathways, and personalized tips.
              </div>
            </div>
          </div>
        </div>
      )
    } : {
      icon: <BookOpen className="text-emerald-400 w-5 h-5" />,
      title: "Carbon Calculation Methodology",
      body: (
        <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            Carbon footprint estimations are calculated in kilograms of Carbon Dioxide Equivalent (kg CO₂e) per year, reflecting direct and upstream lifecycle emissions.
          </p>
          
          <div className="border-t border-slate-800/80 my-3 pt-3 space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400 font-semibold">Electricity (India Grid)</span>
              <span className="text-emerald-400 font-bold">0.82 kg CO₂e / kWh</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400 font-semibold">Transportation (Gas Car)</span>
              <span className="text-slate-300">2,400 kg CO₂e / yr</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400 font-semibold">Diet (mixed / heavy meat)</span>
              <span className="text-slate-300">1,200 / 2,200 kg CO₂e / yr</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400 font-semibold">Diet (vegetarian / vegan)</span>
              <span className="text-emerald-400 font-bold">600 / 300 kg CO₂e / yr</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400 font-semibold">Consumer Shopping</span>
              <span className="text-slate-300">10 kg CO₂e / item</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg flex gap-2 items-start text-xs text-slate-400">
            <Zap size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Note: The electricity intensity index is optimized for India's coal-heavy energy grid (0.82 kg/kWh) according to Central Electricity Authority (CEA) reports.
            </p>
          </div>
        </div>
      )
    };

    return createPortal(
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-left">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-350 cursor-pointer text-xl p-1 rounded-lg hover:bg-slate-850 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-3">
            {modalContent.icon}
            <h3 className="text-white font-bold text-lg">
              {modalContent.title}
            </h3>
          </div>

          {modalContent.body}

          <button
            onClick={() => setActiveModal(null)}
            className="mt-6 w-full py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg text-sm transition-colors cursor-pointer text-center"
          >
            Close Window
          </button>
        </div>
      </div>,
      document.body
    );
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

          <div className="flex items-center gap-5 text-sm">
            <button 
              onClick={() => setActiveModal('platform')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block bg-transparent border-none p-0 focus:outline-none"
            >
              Platform
            </button>
            <button 
              onClick={() => setActiveModal('methodology')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block bg-transparent border-none p-0 focus:outline-none"
            >
              Methodology
            </button>
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

      {/* Render Portal Modals */}
      {renderModal()}
    </div>
  );
}
