import React from 'react';

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  description?: string;
}

const InputSlider: React.FC<InputSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = '',
  prefix = '',
  description
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="text-xl font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded shadow-sm min-w-[100px] text-right">
          {prefix}{value.toLocaleString()}{unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-500 transition-all"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
        <span>{prefix}{min}{unit}</span>
        <span>{prefix}{max}{unit}</span>
      </div>
    </div>
  );
};

export default InputSlider;