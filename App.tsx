import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Clock, DollarSign, Zap, ArrowRight, CheckCircle2, Bot, TrendingUp, Info, Rocket, Smile } from 'lucide-react';
import InputSlider from './components/InputSlider';
import Charts from './components/Charts';
import { CalculationData, CalculationResults } from './types';
import { generateEfficiencyInsight } from './services/geminiService';

const FUN_ACTIVITIES = [
  "mastering roller derby",
  "learning the banjo",
  "competitive dog grooming",
  "becoming a pizza snob",
  "training for a marathon",
  "perfecting your sourdough",
  "learning to juggle",
  "taking 3-hour naps",
  "watching every 80s movie",
  "writing a bad novel"
];

const App: React.FC = () => {
  // --- State ---
  const [hourlyRate, setHourlyRate] = useState<number>(450);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(8);
  const [hoursPerDocManual, setHoursPerDocManual] = useState<number>(2.5);
  const [minutesPerDocAuto, setMinutesPerDocAuto] = useState<number>(15);
  const [setupCost, setSetupCost] = useState<number>(2000);
  const [funActivity, setFunActivity] = useState<string>(FUN_ACTIVITIES[0]);

  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false);

  // Email gate state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');

  // Set a random activity on mount
  useEffect(() => {
    setFunActivity(FUN_ACTIVITIES[Math.floor(Math.random() * FUN_ACTIVITIES.length)]);
  }, []);

  // --- Calculations ---
  const results: CalculationResults = useMemo(() => {
    const annualDocs = monthlyVolume * 12;

    // Time calculations (in hours)
    const annualHoursManual = annualDocs * hoursPerDocManual;
    const annualHoursAuto = annualDocs * (minutesPerDocAuto / 60);
    const hoursSavedAnnually = annualHoursManual - annualHoursAuto;

    // Cost calculations (Opportunity Cost mostly)
    const annualCostManual = annualHoursManual * hourlyRate;
    const annualCostAuto = annualHoursAuto * hourlyRate;
    const annualSavings = annualCostManual - annualCostAuto;

    // ROI Days
    // Calculate daily savings based on working days (approx 260 days/year)
    const WORKING_DAYS_PER_YEAR = 260;
    const dailySavings = annualSavings / WORKING_DAYS_PER_YEAR;

    // Formula: setupCost / (annualSavings / 260)
    // Handle cases where annualSavings is zero or negative
    const roiDays = dailySavings > 0 ? setupCost / dailySavings : 0;

    return {
      annualSavings,
      monthlySavings: annualSavings / 12,
      hoursSavedAnnually,
      opportunityCost: annualSavings, // In professional services, savings = opportunity for billable work
      roiDays
    };
  }, [hourlyRate, monthlyVolume, hoursPerDocManual, minutesPerDocAuto, setupCost]);

  const inputs: CalculationData = {
    hourlyRate,
    monthlyVolume,
    hoursPerDocManual,
    minutesPerDocAuto,
    setupCost
  };

  // --- Handlers ---
  const handleGenerateInsight = async () => {
    setIsGeneratingInsight(true);
    const text = await generateEfficiencyInsight({ inputs, results });
    setInsight(text);
    setIsGeneratingInsight(false);
  };

  const handleUnlockResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput && emailInput.includes('@')) {
      setIsUnlocked(true);

      // Send email to webhook
      try {
        await fetch('https://n8n.srv1137065.hstgr.cloud/webhook/a8d8e344-8947-482c-afcf-c77825e79095', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailInput,
            timestamp: new Date().toISOString(),
            calculatorInputs: inputs,
            calculatorResults: results,
          }),
        });
      } catch (error) {
        console.error('Failed to send to webhook:', error);
        // Still unlock even if webhook fails
      }
    }
  };

  // Data for the Chart
  const monthlyManualCost = (monthlyVolume * hoursPerDocManual * hourlyRate);
  const monthlyAutomatedCost = (monthlyVolume * (minutesPerDocAuto / 60) * hourlyRate);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* Header */}
      <header className="bg-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-800 to-transparent opacity-50 skew-x-12 transform origin-top-right"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center space-x-2 text-primary-500 mb-4">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-bold tracking-widest uppercase">LegalFlow Automation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            See the value of your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-indigo-300">billable time</span> restored.
            <span className="block text-2xl md:text-3xl mt-2 text-slate-400 font-sans font-light">(And maybe your sanity too.)</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mt-4">
            Commercial agreements shouldn't be a soul-sucking loss leader. Let's do the math on how much fun you're missing out on.
          </p>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                The Boring Stuff (Metrics)
              </h2>

              <InputSlider
                label="Billable Hourly Rate"
                value={hourlyRate}
                onChange={setHourlyRate}
                min={200}
                max={1500}
                step={25}
                prefix="$"
                description="Your standard rate. Be honest!"
              />

              <InputSlider
                label="Agreements Per Month"
                value={monthlyVolume}
                onChange={setMonthlyVolume}
                min={1}
                max={50}
                step={1}
                description="How many of these headaches do you handle?"
              />

              <InputSlider
                label="Implementation Fee"
                value={setupCost}
                onChange={setSetupCost}
                min={0}
                max={10000}
                step={100}
                prefix="$"
                description="One-time cost (the price of freedom)."
              />

              <div className="pt-6 border-t border-slate-100">
                <InputSlider
                  label="Manual Drafting Time"
                  value={hoursPerDocManual}
                  onChange={setHoursPerDocManual}
                  min={0.5}
                  max={5}
                  step={0.5}
                  unit=" hrs"
                  description="Time spent wrestling with formatting manually."
                />

                <InputSlider
                  label="Automated Time"
                  value={minutesPerDocAuto}
                  onChange={setMinutesPerDocAuto}
                  min={5}
                  max={60}
                  step={5}
                  unit=" min"
                  description="Time with LegalFlow (aka Magic Mode)."
                />
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-[60px] opacity-20"></div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-indigo-400" />
                  The AI's Hot Take
                </h3>

                {!insight && !isGeneratingInsight && (
                  <div className="text-slate-300 text-sm">
                    <p className="mb-4">Want a witty breakdown of what these numbers actually mean for your life?</p>
                    <button
                      onClick={handleGenerateInsight}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Roast My Efficiency
                    </button>
                  </div>
                )}

                {isGeneratingInsight && (
                  <div className="animate-pulse space-y-4 mt-2">
                    <p className="text-sm text-indigo-200 font-medium italic">
                      Consulting the efficiency oracle regarding {funActivity}...
                    </p>
                    <div className="space-y-2">
                      <div className="h-2 bg-indigo-400/30 rounded w-3/4"></div>
                      <div className="h-2 bg-indigo-400/30 rounded w-full"></div>
                      <div className="h-2 bg-indigo-400/30 rounded w-5/6"></div>
                      <div className="h-2 bg-indigo-400/30 rounded w-full"></div>
                    </div>
                  </div>
                )}

                {insight && !isGeneratingInsight && (
                  <div className="prose prose-invert prose-sm">
                    <p className="text-slate-200 leading-relaxed whitespace-pre-line text-sm">
                      {insight}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6 relative">

            {/* Email Gate Overlay */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mx-4">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                    Unlock Your Results
                  </h3>
                  <p className="text-slate-600 mb-6 text-center">
                    Enter your email to see your personalized ROI breakdown
                  </p>
                  <form onSubmit={handleUnlockResults} className="space-y-4">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors"
                    >
                      Show My Results
                    </button>
                  </form>
                  <p className="text-xs text-slate-400 mt-4 text-center">
                    We respect your privacy. No spam, ever.
                  </p>
                </div>
              </div>
            )}

            {/* Big Numbers Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!isUnlocked ? 'filter blur-sm' : ''}`}>
              <div className="bg-white rounded-2xl shadow-lg border-l-4 border-primary-500 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 group relative">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide cursor-help border-b border-dashed border-slate-300">
                      Opportunity Cost Recovered
                    </p>
                    <Info className="w-4 h-4 text-slate-400 opacity-75" />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                      <p className="font-semibold mb-1">In plain English:</p>
                      This is the money you're practically setting on fire by doing administrative work instead of billable work.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">${results.annualSavings.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  That's a lot of roller skates.
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border-l-4 border-indigo-500 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Hours Saved Annually</p>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">{Math.round(results.hoursSavedAnnually).toLocaleString()}</span>
                    <span className="ml-1 text-lg text-slate-500">hrs</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-500 flex items-start">
                  <Smile className="w-4 h-4 mr-1 text-indigo-500 mt-0.5 shrink-0" />
                  <span>Enough time to start <strong>{funActivity}</strong>!</span>
                </div>
              </div>

              {/* ROI Days Card */}
              <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border-l-4 border-emerald-500 p-6 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">The "No-Brainer" Stat</p>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900">
                      {results.roiDays > 0 ? Math.ceil(results.roiDays) : "N/A"}
                    </span>
                    <span className="ml-2 text-xl font-medium text-slate-600">Working Days</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {results.roiDays > 0
                      ? `Your $${setupCost.toLocaleString()} investment pays for itself in ${Math.ceil(results.roiDays)} days. The rest is pure profit (or fun).`
                      : "Savings are currently negative. Are you charging enough?"}
                  </p>
                </div>
                <div className="hidden sm:block p-4 bg-emerald-50 rounded-full transform rotate-12">
                  <Rocket className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className={!isUnlocked ? 'filter blur-sm' : ''}>
              <Charts
                monthlyManualCost={monthlyManualCost}
                monthlyAutomatedCost={monthlyAutomatedCost}
                setupCost={setupCost}
              />
            </div>

            {/* CTA / Context Section */}
            <div className={`bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center ${!isUnlocked ? 'filter blur-sm' : ''}`}>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                Ready to reclaim those {Math.round(results.hoursSavedAnnually / 12)} hours next month?
              </h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                Warning: Sudden increase in free time may lead to spontaneous hobbies like <strong>{funActivity}</strong>. Proceed with caution.
              </p>

              <div className="flex justify-center">
                <a
                  href="https://calendar.app.google/tvRdRPuBEsnbKaE48"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer"
                >
                  Book 15 Min Demo
                </a>
              </div>

              <div className="mt-8 flex justify-center space-x-8 text-slate-400 text-sm">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  No new software to learn
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                  Roller skates not included
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};

export default App;