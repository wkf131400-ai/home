import React from 'react';
import { Sparkles, Home, Layers, FileSpreadsheet, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentStep: 'setup' | 'rooms' | 'summary';
  onStepChange: (step: 'setup' | 'rooms' | 'summary') => void;
  communityName: string;
  totalCostTenThousand: number;
  minBudget: number;
  maxBudget: number;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onStepChange,
  communityName,
  totalCostTenThousand,
  minBudget,
  maxBudget,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 text-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onStepChange('setup')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-0.5 shadow-sm flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight">智家定制</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  全屋智能规划
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {communityName ? `小区: ${communityName}` : '装修方案与设备算量系统'}
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onStepChange('setup')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentStep === 'setup'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-slate-700" />
              <span>小区与户型预算</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              onClick={() => onStepChange('rooms')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentStep === 'rooms'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-700" />
              <span>房间与设备定制</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              onClick={() => onStepChange('summary')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentStep === 'summary'
                  ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700" />
              <span>预估预算BOM清单</span>
            </button>
          </nav>

          {/* Budget Widget & Action */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] text-slate-500">预计设备与安装总计</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-bold text-slate-900">¥{totalCostTenThousand}</span>
                <span className="text-xs text-slate-600">万元</span>
                <span className="text-[10px] text-slate-400 ml-1">
                  (预算: {minBudget}-{maxBudget}万)
                </span>
              </div>
            </div>

            <button
              onClick={onReset}
              title="重置配置方案"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 text-xs">
          <button
            onClick={() => onStepChange('setup')}
            className={`py-1 px-2 rounded ${
              currentStep === 'setup' ? 'text-slate-900 font-bold border-b-2 border-slate-900' : 'text-slate-500'
            }`}
          >
            户型预算
          </button>
          <button
            onClick={() => onStepChange('rooms')}
            className={`py-1 px-2 rounded ${
              currentStep === 'rooms' ? 'text-slate-900 font-bold border-b-2 border-slate-900' : 'text-slate-500'
            }`}
          >
            房间设备
          </button>
          <button
            onClick={() => onStepChange('summary')}
            className={`py-1 px-2 rounded ${
              currentStep === 'summary' ? 'text-slate-900 font-bold border-b-2 border-slate-900' : 'text-slate-500'
            }`}
          >
            BOM预算
          </button>
        </div>
      </div>
    </header>
  );
};
