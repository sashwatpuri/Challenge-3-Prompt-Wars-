import { useState, useMemo } from 'react';
import { Leaf, IndianRupee, TrendingDown, RefreshCw, User, UserCheck, ArrowRight } from 'lucide-react';
import { calculateFootprint } from '../utils/carbonEngine';

/**
 * WhatIfSimulator Component
 * Interactive sandbox allowing users to model lifestyle adjustments, view carbon-twin comparison,
 * and calculate dynamic carbon reductions and financial savings.
 * 
 * @param {Object} props
 * @param {Object} props.originalProfile - Compiled user profile JSON
 */
export default function WhatIfSimulator({ originalProfile }) {
  // Initialize simulated profile state with original profile values
  const [simulatedProfile, setSimulatedProfile] = useState({ ...originalProfile });

  // Reset simulator to initial profile state
  const handleReset = () => {
    setSimulatedProfile({ ...originalProfile });
  };

  // Run footprint engine on both profiles using memoization
  const originalFootprint = useMemo(() => calculateFootprint(originalProfile), [originalProfile]);
  const simulatedFootprint = useMemo(() => calculateFootprint(simulatedProfile), [simulatedProfile]);

  const origTotal = originalFootprint.totalEmission.yearly;
  const simTotal = simulatedFootprint.totalEmission.yearly;

  // Calculate carbon reduction parameters
  const carbonSaved = useMemo(() => Math.max(0, origTotal - simTotal), [origTotal, simTotal]);
  const reductionPercentage = useMemo(() => origTotal > 0 ? Math.round((carbonSaved / origTotal) * 100) : 0, [carbonSaved, origTotal]);

  // Calculate estimated financial savings (in INR/year) using memoization
  const financialSavings = useMemo(() => {
    let savings = 0;

    // Transport savings (in INR)
    const transportMap = { car: 0, hybrid: 30000, ev: 50000, public_transit: 100000, active: 150000 };
    const origTransVal = transportMap[originalProfile.transport] || 0;
    const simTransVal = transportMap[simulatedProfile.transport] || 0;
    savings += Math.max(0, simTransVal - origTransVal);

    // Food savings (in INR)
    const foodMap = { heavy_meat: 0, high_meat: 0, mixed: 25000, vegetarian: 60000, vegan: 75000 };
    const origFoodVal = foodMap[originalProfile.food] || foodMap.mixed;
    const simFoodVal = foodMap[simulatedProfile.food] || foodMap.mixed;
    savings += Math.max(0, simFoodVal - origFoodVal);

    // Electricity savings (₹7.00 per kWh)
    const electricitySaved = Math.max(0, originalProfile.electricity - simulatedProfile.electricity);
    savings += electricitySaved * 12 * 7.00;

    // Shopping savings (₹2,500 average cost per consumer product saved)
    const shoppingSaved = Math.max(0, originalProfile.shopping - simulatedProfile.shopping);
    savings += shoppingSaved * 12 * 2500;

    return Math.round(savings);
  }, [originalProfile, simulatedProfile]);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mt-8">
      
      {/* Simulator Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            Carbon Twin & What-If Simulator
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Simulate custom lifestyle adjustments in real-time to watch your carbon twin optimize.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw size={12} aria-hidden="true" />
          Reset Simulator
        </button>
      </div>

      {/* Grid Layout: Controls on Left, Metrics & Twin comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Simulation Toggles */}
        <div className="lg:col-span-5 space-y-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Simulation Parameters
          </h4>

          {/* Transport Mode select */}
          <div className="flex flex-col">
            <label htmlFor="sim-transport" className="text-xs font-semibold text-slate-300 mb-1.5">
              Simulated Travel Mode
            </label>
            <select
              id="sim-transport"
              value={simulatedProfile.transport}
              onChange={(e) => setSimulatedProfile(prev => ({ ...prev, transport: e.target.value }))}
              className="px-3 py-2 bg-slate-950 text-slate-200 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="car">Gasoline / Diesel Car</option>
              <option value="hybrid">Hybrid Vehicle</option>
              <option value="ev">Electric Vehicle (EV)</option>
              <option value="public_transit">Public Transit (Metro/Bus)</option>
              <option value="active">Active Commute (Biking/Walking)</option>
            </select>
          </div>

          {/* Food Habits Select */}
          <div className="flex flex-col">
            <label htmlFor="sim-food" className="text-xs font-semibold text-slate-300 mb-1.5">
              Simulated Diet Profile
            </label>
            <select
              id="sim-food"
              value={simulatedProfile.food}
              onChange={(e) => setSimulatedProfile(prev => ({ ...prev, food: e.target.value }))}
              className="px-3 py-2 bg-slate-950 text-slate-200 border border-slate-850 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="heavy_meat">Frequent Meat Diet</option>
              <option value="mixed">Mixed Flexitarian Diet</option>
              <option value="vegetarian">Vegetarian Diet</option>
              <option value="vegan">Strictly Plant-Based (Vegan)</option>
            </select>
          </div>

          {/* Electricity slider */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="sim-electricity" className="text-xs font-semibold text-slate-300">
                Electricity consumption
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{simulatedProfile.electricity} kWh</span>
            </div>
            <input
              id="sim-electricity"
              type="range"
              min="0"
              max="2000"
              step="20"
              value={simulatedProfile.electricity}
              onChange={(e) => setSimulatedProfile(prev => ({ ...prev, electricity: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-450"
            />
          </div>

          {/* Shopping slider */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="sim-shopping" className="text-xs font-semibold text-slate-300">
                Monthly purchases count
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{simulatedProfile.shopping} items</span>
            </div>
            <input
              id="sim-shopping"
              type="range"
              min="0"
              max="30"
              step="1"
              value={simulatedProfile.shopping}
              onChange={(e) => setSimulatedProfile(prev => ({ ...prev, shopping: Number(e.target.value) }))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-450"
            />
          </div>
        </div>

        {/* Right Column: Comparative Metrics & Carbon Twin Visual */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key Simulation KPI Badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-900/40 flex items-center justify-center text-emerald-400" aria-hidden="true">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">CO₂ reduction</span>
                <span className="text-lg font-extrabold text-emerald-400 font-mono">
                  {reductionPercentage}% Saved
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-900/40 flex items-center justify-center text-emerald-450" aria-hidden="true">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Money Saved</span>
                <span className="text-lg font-extrabold text-emerald-405 font-mono">
                  ₹{financialSavings.toLocaleString()}/yr
                </span>
              </div>
            </div>
          </div>

          {/* Carbon Twin Feature (Visual Comparison Chart) */}
          <div className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              Carbon Twin Comparison
            </h5>

            {/* Current vs Simulated Twins */}
            <div className="space-y-4">
              
              {/* Twin 1: Current User */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-350 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-450" aria-hidden="true" />
                    Current Twin
                  </span>
                  <span className="font-mono font-bold text-slate-300">{origTotal.toLocaleString()} kg CO₂e</span>
                </div>
                <div 
                  className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative"
                  role="progressbar"
                  aria-valuenow={origTotal}
                  aria-valuemin="0"
                  aria-valuemax={Math.max(origTotal, simTotal)}
                  aria-label="Current Twin annual carbon footprint"
                >
                  <div 
                    className="h-full bg-slate-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, Math.min(100, (origTotal / Math.max(origTotal, simTotal)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex justify-center text-emerald-450" aria-hidden="true">
                <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
              </div>

              {/* Twin 2: Future User */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Future Twin (Simulated)
                  </span>
                  <span className="font-mono font-bold text-emerald-450">{simTotal.toLocaleString()} kg CO₂e</span>
                </div>
                <div 
                  className="w-full h-3 bg-slate-900 rounded-full overflow-hidden relative"
                  role="progressbar"
                  aria-valuenow={simTotal}
                  aria-valuemin="0"
                  aria-valuemax={Math.max(origTotal, simTotal)}
                  aria-label="Future Twin simulated annual carbon footprint"
                >
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(10, Math.min(100, (simTotal / Math.max(origTotal, simTotal)) * 100))}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Simulated Breakdown Details */}
            <div className="border-t border-slate-900 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] text-slate-400 font-semibold font-mono">
              <div className="p-2 bg-slate-900/30 rounded-lg">
                <span className="block text-slate-500 uppercase text-[8px] mb-0.5">Transport</span>
                <span className="text-white font-bold">{simulatedFootprint.transportEmission.yearly} kg</span>
              </div>
              <div className="p-2 bg-slate-900/30 rounded-lg">
                <span className="block text-slate-500 uppercase text-[8px] mb-0.5">Food</span>
                <span className="text-white font-bold">{simulatedFootprint.foodEmission.yearly} kg</span>
              </div>
              <div className="p-2 bg-slate-900/30 rounded-lg">
                <span className="block text-slate-500 uppercase text-[8px] mb-0.5">Energy</span>
                <span className="text-white font-bold">{simulatedFootprint.energyEmission.yearly} kg</span>
              </div>
              <div className="p-2 bg-slate-900/30 rounded-lg">
                <span className="block text-slate-500 uppercase text-[8px] mb-0.5">Shopping</span>
                <span className="text-white font-bold">{simulatedFootprint.shoppingEmission.yearly} kg</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// Simple Helper icon import
function Activity(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
