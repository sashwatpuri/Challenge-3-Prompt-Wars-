import React, { useState } from 'react';
import { User, UserCheck, CheckCircle2, Circle, ArrowRight, ShieldCheck, Leaf, IndianRupee, TrendingDown } from 'lucide-react';

/**
 * CarbonTwin Component
 * Simulates a virtual future version of the user based on adopted recommendations.
 * 
 * @param {Object} props
 * @param {Object} props.currentProfile - User lifestyle profile JSON
 * @param {Array<Object>} props.recommendations - List of recommendations from AI Insight Engine
 * @param {Object} props.emissionBreakdown - Detailed emission metrics
 */
export default function CarbonTwin({ currentProfile, recommendations, emissionBreakdown }) {
  // Store indexes of adopted recommendations in state (by default first one is adopted)
  const [adoptedIndexes, setAdoptedIndexes] = useState([0]);

  const origTotal = emissionBreakdown.totalEmission.yearly;

  // Toggle adoption of a recommendation
  const handleToggleAdopt = (index) => {
    setAdoptedIndexes(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // 1. Calculate Carbon Score (0-100 where 100 is ideal, 0 is 8000+ kg CO2e)
  const calculateScore = (emissionsValue) => {
    const raw = 100 - (emissionsValue / 80);
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  // Original metrics
  const originalScore = calculateScore(origTotal);
  const originalTransport = emissionBreakdown.transportEmission.yearly;
  const originalEnergy = emissionBreakdown.energyEmission.yearly;

  // Calculate simulated future emissions by deducting adopted reductions
  const calculateFutureMetrics = () => {
    let savedYearly = 0;
    let savedMonthlyCash = 0;

    adoptedIndexes.forEach(index => {
      const rec = recommendations[index];
      if (!rec) return;

      // Extract numerical reduction from the string (e.g. "14%" or "40%")
      const pctValue = Number(rec.estimatedReduction.replace('%', '')) || 0;
      const reductionKg = Math.round(origTotal * (pctValue / 100));
      savedYearly += reductionKg;

      // Map estimated monetary savings in INR based on recommendation types
      if (rec.primaryEmissionSource === 'Transport') {
        savedMonthlyCash += rec.difficulty === 'High' ? 4000 : 8000; // EV vs transit savings
      } else if (rec.primaryEmissionSource === 'Food') {
        savedMonthlyCash += 5000; // Vegetarian savings
      } else if (rec.primaryEmissionSource === 'Electricity') {
        savedMonthlyCash += 2000; // LED / Green plan savings
      } else if (rec.primaryEmissionSource === 'Shopping') {
        savedMonthlyCash += 3000; // Secondhand savings
      } else {
        savedMonthlyCash += 800;
      }
    });

    const futureTotal = Math.max(0, origTotal - savedYearly);
    const reductionPct = origTotal > 0 ? Math.round((savedYearly / origTotal) * 100) : 0;

    return {
      futureTotal,
      futureScore: calculateScore(futureTotal),
      annualCO2Saved: savedYearly,
      carbonReductionPercentage: reductionPct,
      monthlySavingsEstimate: savedMonthlyCash
    };
  };

  const {
    futureTotal,
    futureScore,
    annualCO2Saved,
    carbonReductionPercentage,
    monthlySavingsEstimate
  } = calculateFutureMetrics();

  // Helper for gradient colors based on carbon score
  const getScoreColor = (score) => {
    if (score > 75) return 'text-emerald-400';
    if (score > 40) return 'text-amber-450';
    return 'text-rose-450';
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mt-8 text-left">
      
      {/* Header */}
      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2 border-b border-slate-800 pb-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        Carbon Twin Simulation
      </h3>
      <p className="text-slate-400 text-xs md:text-sm mb-6">
        Adopt recommendations to model your Carbon Twin and visualize your future footprint side-by-side.
      </p>

      {/* Grid: Twin Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card 1: Current Twin Profile */}
        <div className="p-6 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <User size={90} className="text-slate-600" />
          </div>

          <div>
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 bg-slate-900 border border-slate-800 rounded-full uppercase">
              Current Twin
            </span>
            <div className="mt-4 space-y-3">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Annual Emissions</span>
                <span className="text-3xl font-extrabold text-white font-mono">{origTotal.toLocaleString()} kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-400 border-t border-slate-900 pt-3">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Transport</span>
                  <span className="text-slate-200 font-mono">{originalTransport.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Electricity</span>
                  <span className="text-slate-200 font-mono">{originalEnergy.toLocaleString()} kg</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-900 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Eco-Score</span>
            <span className={`text-2xl font-extrabold font-mono ${getScoreColor(originalScore)}`}>
              {originalScore}/100
            </span>
          </div>
        </div>

        {/* Card 2: Future Twin Profile */}
        <div className="p-6 bg-slate-950/60 border border-emerald-950/40 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-lg shadow-emerald-950/5">
          <div className="absolute top-0 right-0 p-4 opacity-15">
            <UserCheck size={90} className="text-emerald-500" />
          </div>

          <div>
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-full uppercase">
              Future Twin (Simulated)
            </span>
            <div className="mt-4 space-y-3">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Predicted Emissions</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">{futureTotal.toLocaleString()} kg</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-400 border-t border-slate-900 pt-3">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Annual Saved</span>
                  <span className="text-emerald-400 font-bold font-mono">-{annualCO2Saved.toLocaleString()} kg</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase tracking-wider">Reduction</span>
                  <span className="text-emerald-400 font-bold font-mono">{carbonReductionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-900 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Predicted Eco-Score</span>
            <span className={`text-2xl font-extrabold font-mono ${getScoreColor(futureScore)}`}>
              {futureScore}/100
            </span>
          </div>
        </div>

      </div>

      {/* Grid: Toggles & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Recommendation Toggles */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Actions to Adopt
          </h4>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const isAdopted = adoptedIndexes.includes(index);
              return (
                <button
                  key={index}
                  onClick={() => handleToggleAdopt(index)}
                  className={`w-full flex items-start gap-3 p-3.5 border rounded-xl text-left transition-all duration-150 cursor-pointer
                    ${isAdopted 
                      ? 'bg-emerald-950/20 border-emerald-500/35 text-emerald-400' 
                      : 'bg-slate-950/40 border-slate-850 text-slate-350 hover:border-slate-800'
                    }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isAdopted 
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-current" /> 
                      : <Circle className="w-5 h-5 text-slate-650" />
                    }
                  </div>
                  <div>
                    <h5 className={`text-xs md:text-sm font-bold leading-normal ${isAdopted ? 'text-white' : ''}`}>
                      {rec.recommendation}
                    </h5>
                    <p className="text-[10px] text-slate-550 leading-relaxed mt-1">
                      {rec.reason}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-900/80 border border-slate-800 rounded text-[9px] font-bold text-slate-400 font-mono">
                        Reduces {rec.estimatedReduction}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Twin Dashboard Metrics & AI Insight */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Key Simulation KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Savings</span>
                <span className="text-base font-extrabold text-emerald-405 font-mono">
                  ₹{monthlySavingsEstimate.toLocaleString()}/mo
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Annual Saved</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  -{annualCO2Saved} kg
                </span>
              </div>
            </div>
          </div>

          {/* SVG Comparison Twin Chart */}
          <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-4 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Emissions Twin Bar Chart
            </span>

            <div className="space-y-4">
              {/* Bar 1: Current */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Current Twin</span>
                  <span className="font-mono">{origTotal.toLocaleString()} kg CO₂e</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-slate-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, Math.min(100, (origTotal / Math.max(origTotal, futureTotal)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Bar 2: Future */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-emerald-400">
                  <span>Future Twin</span>
                  <span className="font-mono">{futureTotal.toLocaleString()} kg CO₂e</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, Math.min(100, (futureTotal / Math.max(origTotal, futureTotal)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Friendly AI Insight */}
            <div className="mt-6 p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-center">
              <p className="text-xs text-emerald-400 font-semibold leading-relaxed">
                "Following these recommendations could reduce your emissions by {carbonReductionPercentage}% over the next year."
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
