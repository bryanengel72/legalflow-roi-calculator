import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, Clock, DollarSign, Zap, ArrowRight, CheckCircle2, Bot, TrendingUp, Info, Rocket, Smile, Lock, X } from 'lucide-react';
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
  
  // Unlock / Modal State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<boolean>(false);

  const [insight, setInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState<boolean>(false);

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

  const sendWebhookData = (email: string) => {
    // Send all input and result data to the n8n webhook.
    fetch('https://n8n.srv1137065.hstgr.cloud/webhook/a8d8e344-8947-482c-afcf-c77825e79095', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        email: email,
        inputs,
        results,
        funActivity,
        // We won't have the insight yet when unlocking, but that's okay
        source: "Unlock Report"
      })
    }).then(() => {
      console.log('Webhook sent successfully');
    }).catch(err => {
      console.error('Failed to send webhook data:', err);
    });
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) {
      setEmailError(true);
      return;
    }
    
    // 1. Send Data
    sendWebhookData(userEmail);
    
    // 2. Unlock UI
    setIsUnlocked(true);
    setShowEmailModal(false);
    
    // 3. Auto-trigger the AI insight as a "Bonus"
    handleGenerateInsight();
  };

  // Data for the Chart
  const monthlyManualCost = (monthlyVolume * hoursPerDocManual * hourlyRate);
  const monthlyAutomatedCost = (monthlyVolume * (minutesPerDocAuto/60) * hourlyRate);

  // Email construction
  const emailSubject = "Pilot Program Inquiry";
  const emailBody = "Hi Bryan, I ran the numbers and I'm ready to stop drafting manually. Also, I might start roller skating.";
  const mailtoLink = `mailto:thebryanengel@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

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
            See the value of your <br/>
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
            <div className={`bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden transition-all duration-500 ${!isUnlocked ? 'opacity-80' : ''}`}>
               {/* Decorative background element */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500 rounded-full blur-[60px] opacity-20"></div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-indigo-400" />
                  The AI's Hot Take
                </h3>
                
                {/* LOCKED STATE FOR AI CARD */}
                {!isUnlocked && (
                   <div className="text-slate-300 text-sm italic">
                     <p>Unlock your full report to get a personalized efficiency roast from our AI.</p>
                   </div>
                )}

                {/* UNLOCKED BUT NOT GENERATED */}
                {isUnlocked && !insight && !isGeneratingInsight && (
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

          {/* Right Column: Results (With Lock Overlay) */}
          <div className="lg:col-span-7 space-y-6 relative">
            
            {/* The Blur Wrapper */}
            <div className={`transition-all duration-700 ${!isUnlocked ? 'filter blur-md select-none pointer-events-none' : ''}`}>
              
              {/* Big Numbers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-lg border-l-4 border-primary-500 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 group relative">
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide cursor-help border-b border-dashed border-slate-300">
                        Opportunity Cost Recovered
                      </p>
                      <Info className="w-4 h-4 text-slate-400 opacity-75" />
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
              <Charts 
                monthlyManualCost={monthlyManualCost}
                monthlyAutomatedCost={monthlyAutomatedCost}
                setupCost={setupCost}
              />

              {/* CTA / Context Section */}
              <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">
                  Ready to reclaim those {Math.round(results.hoursSavedAnnually / 12)} hours next month?
                </h3>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                  Warning: Sudden increase in free time may lead to spontaneous hobbies like <strong>{funActivity}</strong>. Proceed with caution.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <a 
                    href="https://calendar.app.google/tvRdRPuBEsnbKaE48"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 px-8 py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center cursor-pointer"
                  >
                    Book 15 Min Demo
                  </a>
                </div>
              </div>
            </div>

            {/* THE UNLOCK OVERLAY */}
            {!isUnlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-center p-6">
                   <button
                     onClick={() => setShowEmailModal(true)}
                     className="bg-primary-600 hover:bg-primary-700 text-white text-xl font-bold py-5 px-10 rounded-full shadow-2xl transform hover:scale-105 transition-all flex items-center mx-auto border-4 border-white/20 ring-4 ring-primary-500/20"
                   >
                     <Lock className="w-6 h-6 mr-3" />
                     Reveal My Savings Report
                   </button>
                   <p className="mt-4 text-slate-500 font-medium bg-white/80 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
                     Adjust the sliders to see the charts update
                   </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:hidden z-40">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 uppercase">Annual "Fun Fund"</p>
            {isUnlocked ? (
              <p className="text-xl font-bold text-slate-900">${results.annualSavings.toLocaleString()}</p>
            ) : (
              <p className="text-xl font-bold text-slate-400 blur-sm">$15,000</p>
            )}
          </div>
          {isUnlocked ? (
             <a 
               href={mailtoLink}
               onClick={() => sendWebhookData(userEmail)}
               className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold text-sm"
             >
               Contact Bryan
             </a>
          ) : (
            <button
              onClick={() => setShowEmailModal(true)}
               className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center"
            >
              <Lock className="w-3 h-3 mr-1" />
              Unlock
            </button>
          )}
        </div>
      </div>

      {/* Email Capture Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEmailModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-50 p-6 md:p-8 animate-[fadeIn_0.2s_ease-out]">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Rocket className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Unlock Your Report</h3>
              <p className="text-slate-600">
                Where should we send your custom ROI breakdown and efficiency analysis?
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                <input 
                  type="email" 
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    setEmailError(false);
                  }}
                  placeholder="name@lawfirm.com"
                  className={`w-full px-4 py-3 rounded-xl border ${emailError ? 'border-red-300 focus:ring-red-200' : 'border-slate-300 focus:ring-primary-100'} focus:border-primary-500 focus:ring-4 transition-all outline-none`}
                  autoFocus
                />
                {emailError && <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>}
              </div>
              
              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg"
              >
                Reveal My Savings
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4">
                We'll only use this to send you the calculator results. No spam, we promise.
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
