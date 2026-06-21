import { useState } from 'react';
import { Award, Flame, CheckCircle2, Trophy, Calendar } from 'lucide-react';

/**
 * ProgressDashboard Component
 * Manages behavioral design metrics: Carbon Score (0-100), weekly challenges,
 * streak tracking, achievement badges, and local persistence.
 * 
 * @param {Object} props
 * @param {Object} props.profile - Compiled user profile
 * @param {Object} props.emissions - Emissions report from the engine
 */
export default function ProgressDashboard({ profile, emissions }) {
  const yearlyTotal = emissions.totalEmission.yearly;

  // 1. Carbon Score calculation (0 to 100 where 100 is ideal zero footprint, and 8000+ kg CO2e is 0)
  const calculateCarbonScore = (emissionsValue) => {
    const raw = 100 - (emissionsValue / 80);
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  const carbonScore = calculateCarbonScore(yearlyTotal);

  // Lazy state initializers to load cached data directly on creation (prevents cascading mounts)
  const [streak, setStreak] = useState(() => {
    const cached = localStorage.getItem('carbonmind_streak');
    return cached ? Number(cached) : 3;
  });

  const [challenges, setChallenges] = useState(() => {
    const cached = localStorage.getItem('carbonmind_challenges');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse challenges cache", e);
      }
    }
    return [
      { id: 1, text: 'Walk 10 km this week instead of driving', completed: false, value: 50 },
      { id: 2, text: 'Use public transport at least twice', completed: false, value: 80 },
      { id: 3, text: 'Reduce household standby power usage by 5%', completed: false, value: 40 }
    ];
  });

  const [savedEmissions, setSavedEmissions] = useState(() => {
    const cached = localStorage.getItem('carbonmind_saved_emissions');
    return cached ? Number(cached) : 120;
  });

  // Save to localStorage on change helper
  const updateLocalStorage = (newStreak, newChallenges, newSaved) => {
    localStorage.setItem('carbonmind_streak', String(newStreak));
    localStorage.setItem('carbonmind_challenges', JSON.stringify(newChallenges));
    localStorage.setItem('carbonmind_saved_emissions', String(newSaved));
  };

  // Toggle challenge completion
  const handleToggleChallenge = (id) => {
    const updated = challenges.map(ch => {
      if (ch.id === id) {
        const nextState = !ch.completed;
        // Adjust simulated savings score upon completion
        const adjustment = nextState ? ch.value : -ch.value;
        const nextSaved = Math.max(0, savedEmissions + adjustment);
        setSavedEmissions(nextSaved);
        
        // Dynamic streak check: completing a challenge increments streak
        let nextStreak = streak;
        if (nextState) {
          nextStreak += 1;
          setStreak(nextStreak);
        }
        
        const updatedCh = { ...ch, completed: nextState };
        updateLocalStorage(nextStreak, challenges.map(c => c.id === id ? updatedCh : c), nextSaved);
        return updatedCh;
      }
      return ch;
    });
    setChallenges(updated);
  };

  // 3. Dynamic badge definitions and unlock rules
  const badgesList = [
    {
      id: 'starter',
      name: 'Eco Starter',
      desc: 'Completed initial carbon profile survey.',
      unlocked: !!profile,
      iconColor: 'text-sky-400 bg-sky-950/40 border-sky-850'
    },
    {
      id: 'commuter',
      name: 'Green Commuter',
      desc: 'Adopted low-impact commute (ev/transit/active).',
      unlocked: ['ev', 'hybrid', 'public_transit', 'active'].includes(profile?.transport),
      iconColor: 'text-teal-400 bg-teal-950/40 border-teal-850'
    },
    {
      id: 'reducer',
      name: 'Carbon Reducer',
      desc: 'Saved emissions by completing weekly challenge actions.',
      unlocked: savedEmissions > 150,
      iconColor: 'text-amber-405 bg-amber-950/40 border-amber-850'
    },
    {
      id: 'champion',
      name: 'Sustainability Champion',
      desc: 'Maintain a green carbon score > 75.',
      unlocked: carbonScore > 75,
      iconColor: 'text-purple-400 bg-purple-950/40 border-purple-850'
    }
  ];

  // Dynamic status text for score dial
  let scoreLabel = 'Moderate';
  let scoreColor = 'text-amber-450';
  if (carbonScore > 75) {
    scoreLabel = 'Optimal Eco-Rating';
    scoreColor = 'text-emerald-400';
  } else if (carbonScore < 40) {
    scoreLabel = 'High Footprint';
    scoreColor = 'text-rose-400';
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      
      {/* Header */}
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
        <Trophy className="w-5 h-5 text-amber-400" aria-hidden="true" />
        Gamification & Progress System
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Dynamic circular Carbon Score Meter & Streak */}
        <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-6 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Carbon Score</span>
          
          {/* SVG Circular Dial */}
          <div 
            className="relative w-32 h-32 flex items-center justify-center"
            role="img"
            aria-label={`Carbon score is ${carbonScore} out of 100. Rating: ${scoreLabel}`}
          >
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#1e293b" strokeWidth="8" fill="transparent" 
              />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="url(#scoreGrad)" strokeWidth="8" fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * carbonScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="60%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center" aria-hidden="true">
              <span className="text-3xl font-extrabold text-white font-mono">{carbonScore}</span>
              <span className="text-[9px] text-slate-400">/ 100</span>
            </div>
          </div>

          <span className={`text-xs font-bold mt-3 ${scoreColor}`}>{scoreLabel}</span>

          {/* Daily Streak Indicator */}
          <div 
            className="mt-5 flex items-center gap-2 px-3 py-1.5 bg-rose-950/20 border border-rose-900/30 rounded-lg text-rose-400 text-xs font-bold"
            role="status"
            aria-label={`${streak} day commute streak`}
          >
            <Flame className="w-4 h-4 fill-current animate-bounce" aria-hidden="true" />
            <span>{streak} Day Commute Streak</span>
          </div>
        </div>

        {/* Center: Weekly Sustainability Challenges */}
        <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-450" aria-hidden="true" />
                Weekly Tasks
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Active
              </span>
            </div>
            
            <div className="space-y-3">
              {challenges.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleToggleChallenge(ch.id)}
                  aria-pressed={ch.completed}
                  aria-label={`Toggle weekly task: ${ch.text}`}
                  className={`w-full flex items-start gap-2.5 p-3 rounded-lg text-left transition-all border duration-150 cursor-pointer
                    ${ch.completed 
                      ? 'bg-emerald-950/15 border-emerald-900/40 text-emerald-400' 
                      : 'bg-slate-900/40 border-slate-850 text-slate-300 hover:border-slate-700'
                    }`}
                >
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ch.completed ? 'text-emerald-400 fill-current' : 'text-slate-650'}`} aria-hidden="true" />
                  <div>
                    <p className={`text-xs leading-normal font-semibold ${ch.completed ? 'line-through opacity-75' : ''}`}>
                      {ch.text}
                    </p>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5 block" aria-hidden="true">
                      Reward: +{ch.value}g CO₂ Saved
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aggregate Savings Indicator */}
          <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500">Total Saved:</span>
            <span className="text-emerald-400 font-mono font-bold">{savedEmissions} kg CO₂</span>
          </div>
        </div>

        {/* Right: Achievement Badges Collection */}
        <div className="md:col-span-4 bg-slate-950/40 border border-slate-850 p-5 rounded-xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-455" aria-hidden="true" />
            Milestone Badges
          </span>

          <ul className="space-y-3.5" role="list">
            {badgesList.map(badge => (
              <li 
                key={badge.id}
                className={`flex items-center gap-3 transition-opacity duration-200 ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}
                aria-label={`${badge.name} badge: ${badge.desc}. ${badge.unlocked ? 'Unlocked' : 'Locked'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${badge.unlocked ? badge.iconColor : 'bg-slate-900 border-slate-800 text-slate-650'}`} aria-hidden="true">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className={`block text-xs font-extrabold ${badge.unlocked ? 'text-white' : 'text-slate-500'}`} aria-hidden="true">
                    {badge.name}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block" aria-hidden="true">
                    {badge.desc}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}
