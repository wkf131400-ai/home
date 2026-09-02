import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  Layers,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sliders,
  Plus,
  Trash2,
  Printer,
  Save,
  Share2,
  Sparkles,
  Zap,
  RotateCcw,
  FileText,
  Smartphone,
  Eye,
  Check,
  Tag,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import {
  RoomItem,
  LayoutPreset,
  DeviceSeries,
  RenovationProject,
  SavedPlanRecord,
  Customer,
} from '../../types';
import { LAYOUT_PRESETS, DEVICE_SERIES_LIST, SAMPLE_FLOOR_PLAN_SVG } from '../../data/presetData';
import { createDefaultRoom, calculateProjectCost, calculateRoomCost } from '../../utils/calculator';
import { AdminStorageManager } from '../../utils/adminStorage';
import { FloorPlanViewer } from '../FloorPlanViewer';

interface AdminQuickQuoteWizardProps {
  onSaveToSavedPlans?: (plan: SavedPlanRecord) => void;
  onOpenPointDesigner?: (planId: string) => void;
  onExit?: () => void;
}

export const AdminQuickQuoteWizard: React.FC<AdminQuickQuoteWizardProps> = ({
  onSaveToSavedPlans,
  onOpenPointDesigner,
  onExit,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Info & House Layout & Budget
  const [communityName, setCommunityName] = useState('万科翡翠公园');
  const [cityName, setCityName] = useState('北京');
  const [customerName, setCustomerName] = useState('卫科帆');
  const [customerPhone, setCustomerPhone] = useState('17696180841');
  const [minBudget, setMinBudget] = useState(5);
  const [maxBudget, setMaxBudget] = useState(12);
  const [selectedPresetId, setSelectedPresetId] = useState('layout_3b2l');
  const [floorPlanImageUrl, setFloorPlanImageUrl] = useState<string | null>(SAMPLE_FLOOR_PLAN_SVG);
  const [preferredSeriesId, setPreferredSeriesId] = useState('series_standard_mesh');

  // Step 2: Rooms list
  const [rooms, setRooms] = useState<RoomItem[]>(() => {
    const defaultPreset = LAYOUT_PRESETS.find((p) => p.id === 'layout_3b2l') || LAYOUT_PRESETS[3];
    return defaultPreset.roomNames.map((name) => {
      let cat: RoomItem['category'] = 'other';
      if (name.includes('客厅')) cat = 'living';
      else if (name.includes('卧') || name.includes('房')) cat = 'bedroom';
      else if (name.includes('餐')) cat = 'dining';
      else if (name.includes('厨')) cat = 'kitchen';
      else if (name.includes('卫')) cat = 'bathroom';
      else if (name.includes('书')) cat = 'study';
      else if (name.includes('阳')) cat = 'balcony';
      else if (name.includes('玄')) cat = 'entrance';
      return createDefaultRoom(name, cat);
    });
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => rooms[0]?.id || '');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<RoomItem['category']>('bedroom');

  // Step 3: Pricing Adjustments & Discount
  const [overallDiscount, setOverallDiscount] = useState<number>(1.0);
  const [installationFee, setInstallationFee] = useState<number>(1800);
  const [debuggingFee, setDebuggingFee] = useState<number>(1200);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handlers for preset switch
  const handleSelectPreset = (preset: LayoutPreset) => {
    setSelectedPresetId(preset.id);
    setMinBudget(preset.suggestedMinBudget);
    setMaxBudget(preset.suggestedMaxBudget);

    const generatedRooms = preset.roomNames.map((name) => {
      let cat: RoomItem['category'] = 'other';
      if (name.includes('客厅')) cat = 'living';
      else if (name.includes('卧') || name.includes('房')) cat = 'bedroom';
      else if (name.includes('餐')) cat = 'dining';
      else if (name.includes('厨')) cat = 'kitchen';
      else if (name.includes('卫')) cat = 'bathroom';
      else if (name.includes('书')) cat = 'study';
      else if (name.includes('阳')) cat = 'balcony';
      else if (name.includes('玄')) cat = 'entrance';
      return createDefaultRoom(name, cat);
    });
    setRooms(generatedRooms);
    setActiveRoomId(generatedRooms[0]?.id || '');
  };

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    const newRoom = createDefaultRoom(newRoomName.trim(), newRoomCategory);
    setRooms([...rooms, newRoom]);
    setActiveRoomId(newRoom.id);
    setNewRoomName('');
    showToast(`已添加空间「${newRoom.name}」`);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (rooms.length <= 1) {
      alert('至少需要保留一个房间空间');
      return;
    }
    const updated = rooms.filter((r) => r.id !== roomId);
    setRooms(updated);
    if (activeRoomId === roomId) {
      setActiveRoomId(updated[0].id);
    }
  };

  const handleUpdateRoom = (updatedRoom: RoomItem) => {
    setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Calculations
  const currentProject: RenovationProject = {
    communityName,
    cityName,
    minBudget,
    maxBudget,
    selectedPresetId,
    floorPlanImageUrl,
    floorPlanPins: [],
    rooms,
  };

  const costBreakdown = calculateProjectCost(currentProject);
  const rawTotalYuan = costBreakdown.totalCostYuan;
  const discountedTotalYuan = Math.round(rawTotalYuan * overallDiscount) + installationFee + debuggingFee;
  const discountedTotalTenThousand = Number((discountedTotalYuan / 10000).toFixed(2));

  // Save to saved plans
  const handleSaveQuotationPlan = () => {
    const newPlan: SavedPlanRecord = {
      id: `plan_qq_${Date.now()}`,
      title: `${communityName} · ${rooms.length}空间全屋智能快速报价`,
      communityName,
      cityName,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      presetId: selectedPresetId,
      presetTitle: LAYOUT_PRESETS.find((p) => p.id === selectedPresetId)?.title || '标准户型',
      roomsCount: rooms.length,
      totalCostTenThousand: discountedTotalTenThousand,
      totalCostYuan: discountedTotalYuan,
      deviceCount: costBreakdown.totalLightCircuits + costBreakdown.totalCurtains + 8,
      tags: ['快速报价', '全屋选配', '后台生成'],
      notes: `客户：${customerName} (${customerPhone})，涵盖 ${rooms.map((r) => r.name).join('、')}`,
      status: '已确认方案',
      project: currentProject,
    };

    const existingPlans = AdminStorageManager.getSavedPlans();
    const updatedPlans = [newPlan, ...existingPlans];
    AdminStorageManager.saveSavedPlans(updatedPlans);

    if (onSaveToSavedPlans) {
      onSaveToSavedPlans(newPlan);
    }
    showToast('快速报价方案已成功保存到系统方案库！');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden select-none">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 border border-slate-700 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Breadcrumb & Wizard Stepper Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-extrabold text-slate-900">快速报价设计向导</h2>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
                小程序标准流程
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              步骤化快捷配置全屋空间智能设备与灯光窗帘，毫秒级测算工程BOM造价
            </p>
          </div>
        </div>

        {/* Wizard Stepper Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              step === 1
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>1. 基础信息与户型</span>
          </button>
          <div className="w-4 h-px bg-slate-300 mx-1" />
          <button
            onClick={() => setStep(2)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              step === 2
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>2. 空间智能选配</span>
          </button>
          <div className="w-4 h-px bg-slate-300 mx-1" />
          <button
            onClick={() => setStep(3)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              step === 3
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>3. 报价汇总与交付</span>
          </button>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-2">
          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
            >
              返回后台
            </button>
          )}
        </div>
      </div>

      {/* Step Content Stage */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {/* ================= STEP 1: BASIC INFO & HOUSE PRESET ================= */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left Form: Community, Customer, Budget */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>项目基本信息</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      所在城市
                    </label>
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      placeholder="如：北京 / 厦门"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      小区/楼盘名称 *
                    </label>
                    <input
                      type="text"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      placeholder="如：万科翡翠公园"
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      客户姓名
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      联系电话
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>业主意向预算区间 (万元)</span>
                    </label>
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      ¥ {minBudget}万 ~ ¥ {maxBudget}万
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500">预算下限 (万元)</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={minBudget}
                        onChange={(e) => setMinBudget(Number(e.target.value))}
                        className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">预算上限 (万元)</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(Number(e.target.value))}
                        className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Series */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">首选硬件设备档位</label>
                  <select
                    value={preferredSeriesId}
                    onChange={(e) => setPreferredSeriesId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    {DEVICE_SERIES_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.brandTag})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Floor Plan Upload Component */}
              <FloorPlanViewer
                imageUrl={floorPlanImageUrl}
                onImageUpload={(url) => setFloorPlanImageUrl(url)}
              />
            </div>

            {/* Right: Layout Preset Selection */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>快捷选择经典户型模板</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    已选：{rooms.length} 个空间房间
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {LAYOUT_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {preset.categoryLabel || '标准户型'}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {preset.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {preset.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {preset.roomNames.map((rName, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              {rName}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">建议造价:</span>
                          <span className="font-bold text-blue-700 font-mono">
                            ¥{preset.suggestedMinBudget}万 ~ {preset.suggestedMaxBudget}万
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Step Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>下一步：配置各房间智能设备</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ROOM SELECTION & CONFIGURATION ================= */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left: Rooms List & Room Manager */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>全屋空间列表 ({rooms.length})</span>
                  </h3>
                </div>

                {/* Add new room inline */}
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    placeholder="输入新房间名 (如 衣帽间)"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                  <button
                    onClick={handleAddRoom}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  >
                    + 添加
                  </button>
                </div>

                {/* Room items list */}
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                  {rooms.map((room) => {
                    const isCurrent = room.id === activeRoomId;
                    const rCost = calculateRoomCost(room);
                    return (
                      <div
                        key={room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-slate-900">{room.name}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {room.scheme.isCustom ? '自定义' : '默认标准'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {room.scheme.enableLighting ? `${room.scheme.lighting?.circuitsCount || 0}路灯` : '无灯'}
                            {' · '}
                            {room.scheme.enableCurtain ? '智能窗帘' : '无窗帘'}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-blue-700">
                            ¥{rCost.totalCost}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoom(room.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="删除空间"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Active Room Detailed Parameter Tuning */}
            <div className="lg:col-span-8 space-y-4">
              {activeRoom && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        【{activeRoom.name}】智能方案配置
                      </h3>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        当前预估: ¥{calculateRoomCost(activeRoom).totalCost}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        onClick={() => {
                          const updated = {
                            ...activeRoom,
                            scheme: {
                              ...activeRoom.scheme,
                              isCustom: !activeRoom.scheme.isCustom,
                            },
                          };
                          handleUpdateRoom(updated);
                        }}
                        className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors cursor-pointer ${
                          activeRoom.scheme.isCustom
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {activeRoom.scheme.isCustom ? '✓ 自定义调节中' : '使用标准模板'}
                      </button>
                    </div>
                  </div>

                  {/* 1. Lighting Control */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>灯光照明控制</span>
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeRoom.scheme.enableLighting}
                          onChange={(e) => {
                            const updated = {
                              ...activeRoom,
                              scheme: {
                                ...activeRoom.scheme,
                                isCustom: true,
                                enableLighting: e.target.checked,
                              },
                            };
                            handleUpdateRoom(updated);
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-700">启用灯控</span>
                      </label>
                    </div>

                    {activeRoom.scheme.enableLighting && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                            灯光总回路数量 (路)
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const current = activeRoom.scheme.lighting?.circuitsCount || 2;
                                if (current > 1) {
                                  handleUpdateRoom({
                                    ...activeRoom,
                                    scheme: {
                                      ...activeRoom.scheme,
                                      isCustom: true,
                                      lighting: {
                                        circuitsCount: current - 1,
                                        dimmableCount: Math.min(activeRoom.scheme.lighting?.dimmableCount || 0, current - 1),
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-7 h-7 bg-white border border-slate-200 rounded font-bold hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm w-8 text-center">
                              {activeRoom.scheme.lighting?.circuitsCount || 2}
                            </span>
                            <button
                              onClick={() => {
                                const current = activeRoom.scheme.lighting?.circuitsCount || 2;
                                handleUpdateRoom({
                                  ...activeRoom,
                                  scheme: {
                                    ...activeRoom.scheme,
                                    isCustom: true,
                                    lighting: {
                                      circuitsCount: current + 1,
                                      dimmableCount: activeRoom.scheme.lighting?.dimmableCount || 0,
                                    },
                                  },
                                });
                              }}
                              className="w-7 h-7 bg-white border border-slate-200 rounded font-bold hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                            其中调光深度回路 (无极调光调色)
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const current = activeRoom.scheme.lighting?.dimmableCount || 0;
                                if (current > 0) {
                                  handleUpdateRoom({
                                    ...activeRoom,
                                    scheme: {
                                      ...activeRoom.scheme,
                                      isCustom: true,
                                      lighting: {
                                        circuitsCount: activeRoom.scheme.lighting?.circuitsCount || 2,
                                        dimmableCount: current - 1,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-7 h-7 bg-white border border-slate-200 rounded font-bold hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-sm w-8 text-center text-indigo-700">
                              {activeRoom.scheme.lighting?.dimmableCount || 0}
                            </span>
                            <button
                              onClick={() => {
                                const current = activeRoom.scheme.lighting?.dimmableCount || 0;
                                const maxC = activeRoom.scheme.lighting?.circuitsCount || 2;
                                if (current < maxC) {
                                  handleUpdateRoom({
                                    ...activeRoom,
                                    scheme: {
                                      ...activeRoom.scheme,
                                      isCustom: true,
                                      lighting: {
                                        circuitsCount: maxC,
                                        dimmableCount: current + 1,
                                      },
                                    },
                                  });
                                }
                              }}
                              className="w-7 h-7 bg-white border border-slate-200 rounded font-bold hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Curtain Control */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                        <Sliders className="w-4 h-4 text-emerald-500" />
                        <span>智能窗帘电机</span>
                      </div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeRoom.scheme.enableCurtain}
                          onChange={(e) => {
                            handleUpdateRoom({
                              ...activeRoom,
                              scheme: {
                                ...activeRoom.scheme,
                                isCustom: true,
                                enableCurtain: e.target.checked,
                              },
                            });
                          }}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="text-xs font-semibold text-slate-700">启用电动窗帘</span>
                      </label>
                    </div>

                    {activeRoom.scheme.enableCurtain && (
                      <div className="flex items-center space-x-4 pt-2 border-t border-slate-200 text-xs">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`curtainType_${activeRoom.id}`}
                            checked={activeRoom.scheme.curtain?.curtainType === 'open_close'}
                            onChange={() => {
                              handleUpdateRoom({
                                ...activeRoom,
                                scheme: {
                                  ...activeRoom.scheme,
                                  isCustom: true,
                                  curtain: {
                                    curtainType: 'open_close',
                                    curtainLayer: 'double',
                                  },
                                },
                              });
                            }}
                          />
                          <span className="font-semibold text-slate-700">开合帘 (双轨布纱)</span>
                        </label>

                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`curtainType_${activeRoom.id}`}
                            checked={activeRoom.scheme.curtain?.curtainType === 'roller'}
                            onChange={() => {
                              handleUpdateRoom({
                                ...activeRoom,
                                scheme: {
                                  ...activeRoom.scheme,
                                  isCustom: true,
                                  curtain: {
                                    curtainType: 'roller',
                                  },
                                },
                              });
                            }}
                          />
                          <span className="font-semibold text-slate-700">升降卷帘 / 蜂巢帘</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* 3. Sensors, Thermostat, Lock, BGM */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-bold text-xs text-slate-900">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>传感环境与智能周边</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200 text-xs">
                      {[
                        { key: 'smartSensors', label: '人体微动存在雷达' },
                        { key: 'thermostatControl', label: '温控空调/地暖屏' },
                        { key: 'bgMusic', label: '吸顶高保真背景音乐' },
                        { key: 'smartLock', label: '智能门锁联动' },
                        { key: 'freshAirPanel', label: '新风环境面板' },
                      ].map((item) => {
                        const checked = !!activeRoom.scheme.otherRequirements?.[item.key as keyof typeof activeRoom.scheme.otherRequirements];
                        return (
                          <label
                            key={item.key}
                            className={`p-2 rounded-lg border flex items-center space-x-2 cursor-pointer transition-all ${
                              checked
                                ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                handleUpdateRoom({
                                  ...activeRoom,
                                  scheme: {
                                    ...activeRoom.scheme,
                                    isCustom: true,
                                    enableOther: true,
                                    otherRequirements: {
                                      ...activeRoom.scheme.otherRequirements,
                                      [item.key]: e.target.checked,
                                    },
                                  },
                                });
                              }}
                              className="rounded text-purple-600 focus:ring-0"
                            />
                            <span className="text-[11px]">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>返回上一步</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>下一步：生成报价单汇总</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: SUMMARY & EXPORT ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Totals Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  工程造价测算单
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  {communityName} · 全屋智能系统工程报价
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  客户：{customerName} ({customerPhone}) | 空间数量：{rooms.length} 间 | 总设备回路：{costBreakdown.totalLightCircuits} 路
                </p>
              </div>

              <div className="flex items-center space-x-6 text-right">
                <div>
                  <span className="text-[11px] text-slate-400 block">设备清单原价</span>
                  <span className="text-sm font-mono text-slate-500 line-through">
                    ¥{rawTotalYuan.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">测算最终总报价 (含安装调试)</span>
                  <span className="text-2xl font-mono font-extrabold text-rose-600">
                    ¥{discountedTotalYuan.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    (约 {discountedTotalTenThousand} 万元)
                  </span>
                </div>
              </div>
            </div>

            {/* Room Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {costBreakdown.roomBreakdowns.map((rb) => (
                <div
                  key={rb.roomId}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-900">{rb.roomName}</span>
                    <span className="font-mono font-extrabold text-xs text-blue-700">
                      ¥{rb.totalCost}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">照明回路费用:</span>
                      <span className="font-mono">¥{rb.lightingCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">电动窗帘费用:</span>
                      <span className="font-mono">¥{rb.curtainCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">传感器与周边:</span>
                      <span className="font-mono">¥{rb.otherCost}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Fees & Discount Adjuster */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>商务折扣与工程安装费用调节</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    整单折扣率 ({Math.round(overallDiscount * 100)}%)
                  </label>
                  <select
                    value={overallDiscount}
                    onChange={(e) => setOverallDiscount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value={1.0}>100% (原价无折扣)</option>
                    <option value={0.95}>95折 (优惠 5%)</option>
                    <option value={0.9}>90折 (优惠 10%)</option>
                    <option value={0.85}>85折 (优惠 15%)</option>
                    <option value={0.8}>80折 (VIP 8折)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    全屋工程安装与布线服务费 (元)
                  </label>
                  <input
                    type="number"
                    value={installationFee}
                    onChange={(e) => setInstallationFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    全屋场景联调与编程交付费 (元)
                  </label>
                  <input
                    type="number"
                    value={debuggingFee}
                    onChange={(e) => setDebuggingFee(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="text-xs">
                <span className="text-slate-400">已完成快速报价生成：</span>
                <span className="font-bold text-white ml-1">
                  总金额 ¥{discountedTotalYuan.toLocaleString()} (含调试安装)
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>打印报价单</span>
                </button>

                <button
                  onClick={handleSaveQuotationPlan}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>保存至方案库</span>
                </button>

                {onOpenPointDesigner && (
                  <button
                    onClick={() => {
                      handleSaveQuotationPlan();
                      onOpenPointDesigner('plan_rec_001');
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>前往点位图排布</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
