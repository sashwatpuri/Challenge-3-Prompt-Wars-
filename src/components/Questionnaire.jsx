import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Send, Leaf } from 'lucide-react';
import ProgressBar from './ProgressBar';
import StepCard from './StepCard';
import ProfileSummary from './ProfileSummary';
import { getApiUrl } from '../utils/api';

// Schema defining questions, options, validation rules, types, and descriptions
const QUESTIONNAIRE_STEPS = [
  {
    id: 0,
    category: 'Transportation',
    icon: 'transport',
    title: 'How do you usually commute?',
    description: 'Transportation is often one of the largest components of an individual carbon footprint.',
    fields: [
      {
        name: 'transport',
        label: 'Primary Mode of Travel',
        type: 'select',
        required: true,
        tooltip: 'Select the option that matches your most frequent commute mode.',
        options: [
          { value: 'car', label: 'Gasoline / Diesel Car' },
          { value: 'hybrid', label: 'Hybrid Car (HEV/PHEV)' },
          { value: 'ev', label: 'Electric Vehicle (EV)' },
          { value: 'public_transit', label: 'Public Transit (Bus, Subway, Train)' },
          { value: 'active', label: 'Active Commute (Bicycle, Walking)' },
        ],
      },
    ],
  },
  {
    id: 1,
    category: 'Food Consumption',
    icon: 'food',
    title: 'Tell us about your eating habits.',
    description: 'Agricultural emissions vary significantly depending on meat and dairy consumption.',
    fields: [
      {
        name: 'food',
        label: 'Typical Diet Type',
        type: 'select',
        required: true,
        tooltip: 'Select the statement that best aligns with your weekly diet.',
        options: [
          { value: 'heavy_meat', label: 'Frequent Meat (Eat beef/pork/chicken almost daily)' },
          { value: 'mixed', label: 'Mixed / Flexitarian (Occasional meat, dairy, eggs)' },
          { value: 'vegetarian', label: 'Vegetarian (No meat, but consume eggs/dairy)' },
          { value: 'vegan', label: 'Vegan (Strictly plant-based)' },
        ],
      },
    ],
  },
  {
    id: 2,
    category: 'Home Electricity',
    icon: 'electricity',
    title: 'How much electricity does your household consume?',
    description: 'Enter your average monthly electricity usage to compute domestic power footprint.',
    fields: [
      {
        name: 'electricity',
        label: 'Average Monthly Electricity Usage',
        type: 'number',
        required: true,
        suffix: 'kWh',
        min: 0,
        max: 5000,
        placeholder: 'e.g. 350',
        tooltip: 'Check your latest electric bill for monthly kilowatt-hour (kWh) usage.',
      },
    ],
  },
  {
    id: 3,
    category: 'Shopping Habits',
    icon: 'shopping',
    title: 'How frequently do you purchase non-essential goods?',
    description: 'Manufacturing, packaging, and shipping goods has a high upstream carbon cost.',
    fields: [
      {
        name: 'shopping',
        label: 'New items purchased monthly (clothing, electronics, decor, etc.)',
        type: 'number',
        required: true,
        suffix: 'items/month',
        min: 0,
        max: 100,
        placeholder: 'e.g. 4',
        tooltip: 'An estimate of new non-essential goods you purchase in a typical month.',
      },
    ],
  },
  {
    id: 4,
    category: 'Waste Management',
    icon: 'waste',
    title: 'What are your household waste sorting habits?',
    description: 'Proper recycling and composting prevents organic materials from generating landfill methane.',
    fields: [
      {
        name: 'waste',
        label: 'Waste Sorting Level',
        type: 'select',
        required: true,
        tooltip: 'Indicate how much waste you actively divert from municipal landfills.',
        options: [
          { value: 'no_recycling', label: 'No recycling (All waste goes to landfill)' },
          { value: 'partial_recycling', label: 'Partial recycling (Separate paper/plastics only)' },
          { value: 'full_recycling', label: 'Full recycling (Paper, plastic, glass, and metal)' },
          { value: 'zero_waste', label: 'Zero Waste (Recycle everything, plus active organic composting)' },
        ],
      },
    ],
  },
];

export default function Questionnaire({ user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    transport: '',
    food: '',
    electricity: '',
    shopping: '',
    waste: '',
  });
  const [errors, setErrors] = useState({});
  const [submittedProfile, setSubmittedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch profile from FastAPI backend when user logs in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      setApiError('');
      try {
        const response = await fetch(getApiUrl('/api/profile'), {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setFormData(data.profile);
            // Auto skip to completed summary if profile already exists
            setSubmittedProfile(data.profile);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile from server", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Field change handler updates form state and clears any error for that field
  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    
    if (errors[fieldName]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Validate the inputs in the current step
  const validateCurrentStep = () => {
    const stepConfig = QUESTIONNAIRE_STEPS[currentStep];
    const newErrors = {};

    stepConfig.fields.forEach((field) => {
      const value = formData[field.name];

      // Check required validation
      if (field.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label} is required.`;
      }

      // Check numeric min/max limits
      if (field.type === 'number' && value !== '') {
        const numVal = Number(value);
        if (isNaN(numVal)) {
          newErrors[field.name] = 'Please enter a valid number.';
        } else if (field.min !== undefined && numVal < field.min) {
          newErrors[field.name] = `Value must be at least ${field.min}.`;
        } else if (field.max !== undefined && numVal > field.max) {
          newErrors[field.name] = `Value cannot exceed ${field.max}.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step progression triggers validation check
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Compiles and outputs the final profile state
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      const profile = {
        transport: formData.transport,
        food: formData.food,
        electricity: Number(formData.electricity),
        shopping: Number(formData.shopping),
        waste: formData.waste,
      };

      // Sync to backend SQLite if authenticated
      if (user) {
        setLoading(true);
        setApiError('');
        try {
          const response = await fetch(getApiUrl('/api/profile'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify(profile)
          });
          if (!response.ok) {
            throw new Error('Could not sync profile to backend.');
          }
        } catch (err) {
          setApiError(err.message);
        } finally {
          setLoading(false);
        }
      }

      setSubmittedProfile(profile);
    }
  };

  const handleReset = () => {
    setFormData({
      transport: '',
      food: '',
      electricity: '',
      shopping: '',
      waste: '',
    });
    setErrors({});
    setSubmittedProfile(null);
    setCurrentStep(0);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold">Synchronizing profile database...</p>
      </div>
    );
  }

  if (submittedProfile) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 rounded-full uppercase">
            Data Compiled
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
            Your CarbonMind AI Profile
          </h1>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto text-sm md:text-base">
            Below is your structured profile data and a summary of your environmental footprint.
          </p>
        </div>

        <ProfileSummary profile={submittedProfile} onReset={handleReset} />
      </div>
    );
  }

  const activeStepConfig = QUESTIONNAIRE_STEPS[currentStep];
  const isLastStep = currentStep === QUESTIONNAIRE_STEPS.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Platform Title */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <Leaf className="w-6 h-6 animate-pulse" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          CarbonMind AI
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-md">
          Carbon Footprint Awareness Platform — Data Collection Engine
        </p>
      </div>

      {/* Progress Tracker */}
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={QUESTIONNAIRE_STEPS.length} 
        steps={QUESTIONNAIRE_STEPS.map((s) => ({ id: s.id, label: s.category, icon: s.icon }))}
      />

      {/* Question Card Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <StepCard 
          step={activeStepConfig} 
          formData={formData} 
          onChange={handleFieldChange} 
          errors={errors} 
        />

        {/* Step Navigation Controls */}
        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-205 cursor-pointer
              ${currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-205 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              Continue
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl text-sm transition-all duration-205 cursor-pointer shadow-lg shadow-emerald-400/20"
            >
              Compile Profile
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
