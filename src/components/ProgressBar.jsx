import { Truck, Utensils, Zap, ShoppingBag, Trash2 } from 'lucide-react';

/**
 * ProgressBar Component
 * Renders a premium, responsive multi-step tracker with matching icons.
 * 
 * @param {Object} props
 * @param {number} props.currentStep - 0-indexed current active step
 * @param {number} props.totalSteps - total steps in the form
 * @param {Array<Object>} props.steps - details of each step (title, icon)
 */
export default function ProgressBar({ currentStep, totalSteps, steps }) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  // Icon mapping helper
  const getStepIcon = (iconName, className) => {
    switch (iconName) {
      case 'transport': return <Truck className={className} size={20} />;
      case 'food': return <Utensils className={className} size={20} />;
      case 'electricity': return <Zap className={className} size={20} />;
      case 'shopping': return <ShoppingBag className={className} size={20} />;
      case 'waste': return <Trash2 className={className} size={20} />;
      default: return null;
    }
  };

  return (
    <div className="w-full mb-8">
      <div 
        className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6 relative"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin="1"
        aria-valuemax={totalSteps}
        aria-valuetext={`Step ${currentStep + 1} of ${totalSteps}: ${steps[currentStep]?.label}`}
      >
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stepper Indicators */}
      <div className="flex justify-between items-center relative px-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
              {/* Stepper Node */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 
                  ${isActive 
                    ? 'bg-emerald-950 border-emerald-400 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110' 
                    : isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
              >
                {getStepIcon(step.icon, 'w-5 h-5')}
              </div>

              {/* Step Title Label (Hidden on small screens) */}
              <span 
                className={`mt-2 text-xs font-medium transition-colors duration-300 hidden md:block
                  ${isActive 
                    ? 'text-emerald-400' 
                    : isCompleted 
                      ? 'text-slate-300' 
                      : 'text-slate-500'
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
