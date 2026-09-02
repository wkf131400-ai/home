import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Layout,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Plus,
  X,
  ChevronDown,
  Sparkle,
} from 'lucide-react';
import { LAYOUT_PRESETS } from '../data/presetData';
import { AdminStorageManager } from '../utils/adminStorage';
import { LayoutPreset, RoomItem } from '../types';

interface CommunityBudgetSetupProps {
  communityName: string;
  onCommunityNameChange: (val: string) => void;
  minBudget: number;
  onMinBudgetChange: (val: number) => void;
  maxBudget: number;
  onMaxBudgetChange: (val: number) => void;
  selectedPresetId?: string;
  onSelectPresetLayout: (preset: LayoutPreset) => void;
  rooms: RoomItem[];
  onNextStep: () => void;
}

export const CommunityBudgetSetup: React.FC<CommunityBudgetSetupProps> = ({
  communityName,
  onCommunityNameChange,
  minBudget,
  onMinBudgetChange,
  maxBudget,
  onMaxBudgetChange,
  selectedPresetId,
  onSelectPresetLayout,
  rooms,
  onNextStep,
}) => {
  // Mode selection: 'presets' vs 'diy'
  const [layoutMode, setLayoutMode] = useState<'presets' | 'diy'>('presets');

  // Filter tag for preset templates
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Show only 4 presets initially, allow expand / collapse
  const [isPresetsExpanded, setIsPresetsExpanded] = useState<boolean>(false);

  // Custom DIY Layout Manual Room Typing States
  const [diyCustomRooms, setDiyCustomRooms] = useState<string[]>([
    '玄关',
    '客厅',
    '餐厅',
    '主卧',
    '次卧',
    '厨房',
    '卫生间',
    '阳台',
  ]);
  const [typedRoomInput, setTypedRoomInput] = useState<string>('');

  const handleAddTypedRoom = (roomName?: string) => {
    const targetName = (roomName || typedRoomInput).trim();
    if (targetName) {
      if (!diyCustomRooms.includes(targetName)) {
        setDiyCustomRooms((prev) => [...prev, targetName]);
      }
      setTypedRoomInput('');
    }
  };

  const handleRemoveDiyRoom = (index: number) => {
    setDiyCustomRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplyDiyLayout = () => {
    if (diyCustomRooms.length === 0) return;
    const customPreset: LayoutPreset = {
      id: `layout_diy_${Date.now()}`,
      title: `自定义DIY户型 (${diyCustomRooms.length}个房间)`,
      subtitle: `手输录入房间 · 自定义户型结构`,
      categoryTag: 'medium',
      roomNames: [...diyCustomRooms],
      suggestedMinBudget: Math.max(3, Math.round(diyCustomRooms.length * 0.7)),
      suggestedMaxBudget: Math.max(6, Math.round(diyCustomRooms.length * 1.6)),
    };
    onSelectPresetLayout(customPreset);
  };

  // Preset Filtering from Admin Storage Manager
  const allPresets = AdminStorageManager.getLayoutPresets();
  const filteredPresets = allPresets.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.categoryTag === activeCategory;
  });


  // Limit to 4 presets unless expanded
  const visiblePresets = isPresetsExpanded ? filteredPresets : filteredPresets.slice(0, 4);

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Main Column Layout */}
      <div className="space-y-3.5">
        {/* Section 1: Community Input */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
          <label className="block text-xs font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-700" />
              <span>小区/楼盘名称 <span className="text-amber-600 font-normal">*手输</span></span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">极速精确定制</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={communityName}
              onChange={(e) => onCommunityNameChange(e.target.value)}
              placeholder="请输入小区名称（如：万科翡翠公园、龙湖天璞...）"
              className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-900 rounded-xl px-3 py-2 text-xs placeholder-slate-400 transition-all outline-none"
            />
          </div>
        </div>

        {/* Section 2: Budget Range Input */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-700" />
              <span>装修预算范围 (万元)</span>
            </label>
            <span className="text-[10px] text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {minBudget}万 - {maxBudget}万元
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="text-[10px] text-slate-500 block mb-1 font-medium">预算下限</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={1}
                  max={maxBudget}
                  value={minBudget}
                  onChange={(e) => onMinBudgetChange(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none"
                />
                <span className="text-slate-500 text-[10px] font-bold">万</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-1 font-medium">预算上限</span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={minBudget}
                  max={100}
                  value={maxBudget}
                  onChange={(e) => onMaxBudgetChange(Math.max(minBudget, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-semibold outline-none"
                />
                <span className="text-slate-500 text-[10px] font-bold">万</span>
              </div>
            </div>
          </div>

          {/* Range slider visual */}
          <div className="pt-1">
            <input
              type="range"
              min={1}
              max={50}
              value={maxBudget}
              onChange={(e) => onMaxBudgetChange(Number(e.target.value))}
              className="w-full accent-slate-900 bg-slate-200 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
              <span>1万(经济)</span>
              <span>15万(标准)</span>
              <span>30万(高配)</span>
              <span>50万+(奢享)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Layout Selection & Creation Dual Controller */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-slate-700" />
              <span>户型获取方式</span>
            </label>
            <span className="text-[10px] text-slate-400">选择模板或自定义DIY</span>
          </div>

          {/* Dual Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setLayoutMode('presets')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'presets'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>选择标准户型模板</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('diy')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'diy'
                  ? 'bg-slate-900 text-amber-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>创建户型</span>
            </button>
          </div>

          {/* Mode 1: Rich Standard Presets (Max 4 displayed initially) */}
          {layoutMode === 'presets' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: '全部户型' },
                  { id: 'small', label: '小户型(1-2居)' },
                  { id: 'medium', label: '中户型(3居)' },
                  { id: 'large', label: '大户型(4居+)' },
                  { id: 'villa', label: '复式/别墅' },
                  { id: 'commercial', label: '商业/办公' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsPresetsExpanded(false);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of presets (Max 4 when collapsed) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visiblePresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onSelectPresetLayout(preset)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold mb-1 inline-block border ${
                              isSelected
                                ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {preset.categoryLabel || '标准户型'}
                          </span>
                          <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {preset.title}
                          </h4>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {preset.roomNames.slice(0, 5).map((r, i) => (
                          <span
                            key={i}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                              isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                        {preset.roomNames.length > 5 && (
                          <span
                            className={`text-[9px] px-1 py-0.5 rounded ${
                              isSelected ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            +{preset.roomNames.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expand / Collapse Toggle if total filtered items > 4 */}
              {filteredPresets.length > 4 && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>
                      {isPresetsExpanded
                        ? '收起部分户型'
                        : `展开更多户型 (剩余 ${filteredPresets.length - 4} 个)`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        isPresetsExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Custom DIY House Layout Builder with Manual Room Input */}
          {layoutMode === 'diy' && (
            <div className="space-y-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-1.5 text-slate-800">
                  <Sparkle className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold">创建户型 ({diyCustomRooms.length}个房间)</h4>
                </div>
                <button
                  type="button"
                  onClick={handleApplyDiyLayout}
                  disabled={diyCustomRooms.length === 0}
                  className={`px-3.5 py-1.5 font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1 transition-all ${
                    diyCustomRooms.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>确认户型</span>
                </button>
              </div>

              {/* Manual Input Form */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  输入房间名称添加:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={typedRoomInput}
                    onChange={(e) => setTypedRoomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTypedRoom();
                      }
                    }}
                    placeholder="输入例如: 儿童房、电竞室、阁楼、阳光房..."
                    className="flex-1 bg-white border border-slate-300 focus:border-slate-900 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTypedRoom()}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1 cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加房间</span>
                  </button>
                </div>
              </div>

              {/* Added Room List Display */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">
                    已添加房间清单 ({diyCustomRooms.length}个)
                  </span>
                  {diyCustomRooms.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDiyCustomRooms([])}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                    >
                      清空全部
                    </button>
                  )}
                </div>

                {diyCustomRooms.length === 0 ? (
                  <p className="text-slate-400 text-[11px] py-2 text-center">
                    当前暂未添加任何房间，请在上方手输或点击添加
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {diyCustomRooms.map((r, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-semibold flex items-center gap-1.5"
                      >
                        <span>{r}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDiyRoom(i)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="删除房间"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Action Bar */}
      <div className="pt-2">
        <button
          onClick={onNextStep}
          disabled={!communityName.trim()}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-xs ${
            communityName.trim()
              ? 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>下一步：定制房间设备与需求 (AI对话生成)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


