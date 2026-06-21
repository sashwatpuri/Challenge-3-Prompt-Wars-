import { useMemo } from 'react';
import { RefreshCw, Leaf, Zap, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { calculateFootprint } from '../utils/carbonEngine';
import { runInsightEngine } from '../utils/aiEngine';
import CarbonTwin from './CarbonTwin';
import ProgressDashboard from './ProgressDashboard';
import CarbonChatbot from './CarbonChatbot';

/**
 * ProfileSummary Component
 * Renders the compiled footprint, user profiling metadata, and AI Decision recommendations.
 * 
 * @param {Object} props
 * @param {Object} props.profile - Compiled user lifestyle profile JSON
 * @param {Function} props.onReset - Action handler to retake the questionnaire
 */
export default function ProfileSummary({ profile, onReset }) {
  // Compile calculations and feed to the AI decision engine
  const footprintReport = useMemo(() => calculateFootprint(profile), [profile]);
  const totalEmissions = footprintReport.totalEmission.yearly;

  const { profile: aiProfile, recommendations, insight } = useMemo(() => runInsightEngine(footprintReport), [footprintReport]);

  // Setup risk category styling dynamically
  let riskColor = 'text-emerald-450 border-emerald-500/20 bg-emerald-950/20';
  let riskIcon = <Leaf className="w-4.5 h-4.5" />;
  if (aiProfile.risk === 'High') {
    riskColor = 'text-rose-400 border-rose-500/20 bg-rose-950/20';
    riskIcon = <ShieldAlert className="w-4.5 h-4.5" />;
  } else if (aiProfile.risk === 'Moderate') {
    riskColor = 'text-amber-400 border-amber-500/20 bg-amber-950/20';
    riskIcon = <Zap className="w-4.5 h-4.5" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto animate-fade-in text-left">
      
      {/* Left Column: Footprint Indicator & Action Controls */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Footprint Indicator Card */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Footprint Calculation
          </h2>

          <div className="flex flex-col items-center justify-center py-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
              Estimated Annual Emissions
            </span>
            <div className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 mb-4 font-mono">
              {totalEmissions.toLocaleString()} <span className="text-xl font-semibold text-slate-300">kg CO₂e</span>
            </div>
            
            {/* User Carbon Profile Badges */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <span className={`px-3.5 py-1.5 border rounded-full text-xs font-bold flex items-center gap-1.5 ${riskColor}`}>
                {riskIcon}
                Risk: {aiProfile.risk}
              </span>
              <span className="px-3.5 py-1.5 border border-slate-800 bg-slate-950/40 text-slate-300 rounded-full text-xs font-bold">
                {aiProfile.type}
              </span>
            </div>

            {/* Personalized AI Insight Statement */}
            <div className="mt-8 p-4 bg-slate-950/60 border border-slate-850 rounded-xl max-w-lg">
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed text-center italic">
                "{insight}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-slate-900/50"
          >
            <RefreshCw size={18} />
            Retake Questionnaire
          </button>
        </div>
      </div>

      {/* Right Column: AI Recommendations Action Plan */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            Optimized Action Plan (Ranked by Impact)
          </h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index} 
                className="p-5 bg-slate-950/80 border border-slate-850 hover:border-slate-700/60 rounded-xl transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-800/40">
                      {index + 1}
                    </span>
                    <h4 className="text-white font-bold text-sm md:text-base leading-tight">
                      {rec.recommendation}
                    </h4>
                  </div>

                  {/* Impact Rating Badge */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Score</span>
                    <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/20">
                      {rec.impactScore}
                    </span>
                  </div>
                </div>

                {/* Audit Factors */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900/30 p-2 rounded-lg text-center text-xs font-medium border border-slate-900 mb-3 text-slate-400">
                  <div>
                    <span className="block text-[9px] uppercase font-semibold text-slate-650 mb-0.5">Est. Reduction</span>
                    <span className="text-emerald-400 font-bold font-mono">-{rec.estimatedReduction}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-semibold text-slate-650 mb-0.5">Difficulty</span>
                    <span className="text-slate-350">{rec.difficulty}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-semibold text-slate-650 mb-0.5">Source</span>
                    <span className="text-slate-350">{rec.primaryEmissionSource}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed">
                  {rec.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification, Streak and Badges */}
      <div className="lg:col-span-12">
        <ProgressDashboard profile={profile} emissions={footprintReport} />
      </div>

      {/* Carbon Twin Simulator Dashboard */}
      <div className="lg:col-span-12">
        <CarbonTwin 
          currentProfile={profile} 
          recommendations={recommendations} 
          emissionBreakdown={footprintReport} 
        />
      </div>

      {/* AI Assistant Chatbot Widget */}
      <CarbonChatbot 
        userProfile={profile} 
        emissionBreakdown={footprintReport} 
        recommendations={recommendations} 
      />
    </div>
  );
}
