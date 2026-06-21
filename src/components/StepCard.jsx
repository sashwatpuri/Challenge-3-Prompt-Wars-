import { AlertCircle, HelpCircle } from 'lucide-react';

/**
 * StepCard Component
 * Displays the current step's header, description, and inputs with validated error feedback.
 * 
 * @param {Object} props
 * @param {Object} props.step - Current step schema object
 * @param {Object} props.formData - Main questionnaire form state
 * @param {Function} props.onChange - Handler to update the state
 * @param {Object} props.errors - Validation errors object
 */
export default function StepCard({ step, formData, onChange, errors }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl transition-all duration-300">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 rounded-full uppercase">
            {step.category}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
          {step.title}
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Step Input Fields */}
      <div className="space-y-6">
        {step.fields.map((field) => {
          const value = formData[field.name] || '';
          const hasError = !!errors[field.name];

          return (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 mb-2">
                <span>{field.label}</span>
                {field.required && <span className="text-rose-500 font-bold">*</span>}
                {field.tooltip && (
                  <button
                    type="button"
                    className="group relative cursor-help bg-transparent border-none p-0 focus:outline-none focus:text-slate-300 transition-colors"
                    aria-label={`Help about ${field.label}`}
                  >
                    <HelpCircle size={14} className="text-slate-500 group-focus:text-slate-300 group-hover:text-slate-300 transition-colors" />
                    <div 
                      id={`${field.name}-tooltip`}
                      role="tooltip"
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-xs text-slate-300 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 z-20 border border-slate-800 shadow-xl"
                    >
                      {field.tooltip}
                    </div>
                  </button>
                )}
              </label>

              {/* Render select dropdown */}
              {field.type === 'select' && (
                <div className="relative">
                  <select
                    id={field.name}
                    name={field.name}
                    value={value}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    aria-describedby={field.tooltip ? `${field.name}-tooltip` : undefined}
                    className={`w-full px-4 py-3 bg-slate-950 text-slate-100 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer
                      ${hasError 
                        ? 'border-rose-500/60 focus:ring-rose-500/30' 
                        : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                  >
                    <option value="" className="text-slate-500">Select an option...</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Render number input */}
              {field.type === 'number' && (
                <div className="relative flex items-center">
                  <input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={value}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder || "Enter a number..."}
                    aria-describedby={field.tooltip ? `${field.name}-tooltip` : undefined}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      onChange(field.name, val);
                    }}
                    className={`w-full px-4 py-3 bg-slate-950 text-slate-100 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200
                      ${hasError 
                        ? 'border-rose-500/60 focus:ring-rose-500/30' 
                        : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20'
                      }`}
                  />
                  {field.suffix && (
                    <span className="absolute right-4 text-sm text-slate-500 font-medium font-mono">
                      {field.suffix}
                    </span>
                  )}
                </div>
              )}

              {/* Validation Error Text */}
              {hasError && (
                <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs font-semibold">
                  <AlertCircle size={14} />
                  <span>{errors[field.name]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
