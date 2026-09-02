import React from 'react';
import {
  SlidersHorizontal,
  FileStack,
  FolderHeart,
  User,
} from 'lucide-react';

export type AppTabType = 'design' | 'templates' | 'records' | 'profile';

interface AppBottomNavProps {
  activeTab: AppTabType;
  onChangeTab: (tab: AppTabType) => void;
  savedPlansCount: number;
  isLoggedIn: boolean;
}

export const AppBottomNav: React.FC<AppBottomNavProps> = ({
  activeTab,
  onChangeTab,
  savedPlansCount,
  isLoggedIn,
}) => {
  return (
    <nav className="shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around z-40 shadow-lg">
      {/* 1. 定制方案 */}
      <button
        onClick={() => onChangeTab('design')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'design'
            ? 'text-slate-900 font-extrabold'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'design'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">定制方案</span>
      </button>

      {/* 2. 方案模板 */}
      <button
        onClick={() => onChangeTab('templates')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'templates'
            ? 'text-slate-900 font-extrabold'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'templates'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-400'
            }`}
          >
            <FileStack className="w-4 h-4" />
          </div>
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">我的模板</span>
      </button>

      {/* 3. 方案记录 */}
      <button
        onClick={() => onChangeTab('records')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'records'
            ? 'text-slate-900 font-extrabold'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'records'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-400'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
          </div>
          {savedPlansCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight shadow-xs">
              {savedPlansCount}
            </span>
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">我的记录</span>
      </button>

      {/* 4. 个人中心 */}
      <button
        onClick={() => onChangeTab('profile')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          activeTab === 'profile'
            ? 'text-slate-900 font-extrabold'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
          </div>
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">个人中心</span>
      </button>
    </nav>
  );
};
