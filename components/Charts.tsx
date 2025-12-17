import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';

interface ChartsProps {
  monthlyManualCost: number;
  monthlyAutomatedCost: number;
  setupCost: number;
}

const Charts: React.FC<ChartsProps> = ({ monthlyManualCost, monthlyAutomatedCost, setupCost }) => {
  // Generate 12 months of cumulative data
  const data = React.useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => {
      const manual = monthlyManualCost * i;
      const automated = setupCost + (monthlyAutomatedCost * i);
      return {
        month: i,
        manual: manual,
        automated: automated,
        savings: manual - automated,
        name: i === 0 ? 'Start' : `Month ${i}`
      };
    });
  }, [monthlyManualCost, monthlyAutomatedCost, setupCost]);

  // Calculate precise break-even month for intersection point
  const monthlySavings = monthlyManualCost - monthlyAutomatedCost;
  const breakEvenMonth = monthlySavings > 0 ? setupCost / monthlySavings : null;
  const breakEvenY = breakEvenMonth !== null ? monthlyManualCost * breakEvenMonth : 0;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-lg font-bold text-slate-900">Cumulative Cost Analysis</h3>
           <p className="text-sm text-slate-500">Watch the savings gap grow over time.</p>
        </div>
        <div className="flex space-x-4 text-xs font-medium">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-slate-400 mr-2"></span>
            Old Way (Manual)
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-primary-500 mr-2"></span>
            With LegalFlow
          </div>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="month" 
              type="number"
              domain={[0, 12]}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickCount={13}
              tickFormatter={(val) => val === 0 ? 'Start' : `Mo ${val}`}
              padding={{ left: 10, right: 10 }}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(val) => `$${val / 1000}k`}
              width={40}
            />
            
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  // Recharts may pass formatted label or value depending on config, but payload has data
                  const dataPoint = payload[0].payload;
                  const manualVal = dataPoint.manual;
                  const autoVal = dataPoint.automated;
                  const savings = manualVal - autoVal;
                  const monthName = dataPoint.name;
                  
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700">
                      <p className="font-bold mb-2 border-b border-slate-700 pb-1">{monthName}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-400">Manual Cumulative:</span>
                          <span className="font-mono">{formatCurrency(manualVal)}</span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-sky-300">With LegalFlow:</span>
                          <span className="font-mono">{formatCurrency(autoVal)}</span>
                        </div>
                        <div className="pt-2 mt-1 border-t border-slate-700 flex justify-between space-x-4">
                          <span className={savings > 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                            {savings > 0 ? "Net Benefit:" : "Investment Phase:"}
                          </span>
                          <span className={`font-mono font-bold ${savings > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {formatCurrency(Math.abs(savings))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="manual"
              stroke="#94a3b8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorManual)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            
            <Area
              type="monotone"
              dataKey="automated"
              stroke="#0ea5e9"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAuto)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }}
            />

            {breakEvenMonth !== null && breakEvenMonth > 0 && breakEvenMonth <= 12 && (
              <>
                 <ReferenceLine 
                    x={breakEvenMonth} 
                    stroke="#10b981" 
                    strokeDasharray="3 3"
                    label={{ 
                      value: 'ROI Positive', 
                      position: 'insideTopLeft', 
                      fill: '#10b981', 
                      fontSize: 10,
                      fontWeight: 'bold',
                      offset: 10
                    }} 
                 />
                 <ReferenceDot 
                    x={breakEvenMonth} 
                    y={breakEvenY} 
                    r={6} 
                    fill="#10b981" 
                    stroke="white"
                    strokeWidth={2}
                 />
              </>
            )}
            
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend / Helper Text */}
      <div className="mt-4 bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700 flex items-start">
         <div className="bg-indigo-100 rounded-full p-1 mr-2 shrink-0">
            <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
         </div>
         <p>
           The area between the grey line and the blue line represents your <strong>pure profit</strong>.
           {breakEvenMonth !== null && breakEvenMonth <= 12 && (
             <span> The green dot marks where your investment is fully paid off (approx. <strong>Month {breakEvenMonth.toFixed(1)}</strong>).</span>
           )}
         </p>
      </div>
    </div>
  );
};

export default Charts;