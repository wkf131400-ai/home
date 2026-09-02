import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Check,
  Trash2,
  Move,
  Building,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Search,
  Grid,
  List,
  Layers,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Wifi,
  ToggleLeft,
  Radio,
  Sun,
  Eye,
  Cpu,
  Focus,
  X,
  Plus,
  Crosshair,
  MousePointerClick,
  CheckCheck,
  HelpCircle,
} from 'lucide-react';
import { RenovationProject, CanvasPinItem } from '../types';
import { SAMPLE_FLOOR_PLAN_SVG } from '../data/presetData';

interface InteractiveFloorPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: RenovationProject;
  currentFloorPlanImage: string;
  onUpdateFloorPlanImage: (imageUrl: string) => void;
  pins: CanvasPinItem[];
  onUpdatePins: (pins: CanvasPinItem[]) => void;
}

// Preset room colors for visual distinction
const ROOM_COLOR_MAP: Record<string, { bg: string; text: string; border: string; hex: string; ring: string }> = {
  客厅: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500', hex: '#2563eb', ring: 'ring-blue-500/40' },
  主卧: { bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500', hex: '#9333ea', ring: 'ring-purple-500/40' },
  次卧: { bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500', hex: '#059669', ring: 'ring-emerald-500/40' },
  书房: { bg: 'bg-teal-600', text: 'text-teal-400', border: 'border-teal-500', hex: '#0d9488', ring: 'ring-teal-500/40' },
  餐厅: { bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500', hex: '#d97706', ring: 'ring-amber-500/40' },
  厨房: { bg: 'bg-orange-600', text: 'text-orange-400', border: 'border-orange-500', hex: '#ea580c', ring: 'ring-orange-500/40' },
  卫生间: { bg: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-500', hex: '#0891b2', ring: 'ring-cyan-500/40' },
  主卫: { bg: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-500', hex: '#0891b2', ring: 'ring-cyan-500/40' },
  客卫: { bg: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-500', hex: '#0891b2', ring: 'ring-cyan-500/40' },
  阳台: { bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500', hex: '#e11d48', ring: 'ring-rose-500/40' },
  玄关: { bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500', hex: '#4f46e5', ring: 'ring-indigo-500/40' },
  '弱电箱 / 核心机房': { bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-600', hex: '#334155', ring: 'ring-slate-500/40' },
  '弱电箱 / 默认楼层': { bg: 'bg-slate-700', text: 'text-slate-400', border: 'border-slate-600', hex: '#334155', ring: 'ring-slate-500/40' },
  公共区域: { bg: 'bg-slate-600', text: 'text-slate-400', border: 'border-slate-500', hex: '#475569', ring: 'ring-slate-500/40' },
};

// Category Icon & Badge resolver
const getCategoryMeta = (category?: string, model?: string) => {
  const catStr = (category || '') + (model || '');
  if (catStr.includes('AP') || catStr.includes('Wi-Fi') || catStr.includes('无线') || catStr.includes('吸顶AP')) {
    return { icon: Wifi, label: '无线AP', color: 'text-blue-400', bg: 'bg-blue-600' };
  }
  if (catStr.includes('面板') || catStr.includes('开关') || catStr.includes('触屏') || catStr.includes('旋钮')) {
    return { icon: ToggleLeft, label: '智能面板', color: 'text-purple-400', bg: 'bg-purple-600' };
  }
  if (catStr.includes('网关') || catStr.includes('路由') || catStr.includes('中枢') || catStr.includes('M2') || catStr.includes('M1S')) {
    return { icon: Radio, label: '智能网关', color: 'text-indigo-400', bg: 'bg-indigo-600' };
  }
  if (catStr.includes('灯') || catStr.includes('调光') || catStr.includes('驱动') || catStr.includes('灯带') || catStr.includes('射灯')) {
    return { icon: Sun, label: '照明调光', color: 'text-amber-400', bg: 'bg-amber-600' };
  }
  if (catStr.includes('传感') || catStr.includes('人体') || catStr.includes('存在') || catStr.includes('雷达') || catStr.includes('温湿度')) {
    return { icon: Eye, label: '安防传感', color: 'text-emerald-400', bg: 'bg-emerald-600' };
  }
  if (catStr.includes('窗帘') || catStr.includes('电机') || catStr.includes('轨道') || catStr.includes('开合帘')) {
    return { icon: SlidersHorizontal, label: '窗帘电机', color: 'text-orange-400', bg: 'bg-orange-600' };
  }
  return { icon: Cpu, label: '弱电设备', color: 'text-slate-400', bg: 'bg-slate-700' };
};

export const InteractiveFloorPlanModal: React.FC<InteractiveFloorPlanModalProps> = ({
  isOpen,
  onClose,
  project,
  currentFloorPlanImage,
  onUpdateFloorPlanImage,
  pins,
  onUpdatePins,
}) => {
  // 1. Bottom Device Drawer Expansion State: 'collapsed' (compact bar) | 'expanded' (slide-up sheet)
  const [isDrawerExpanded, setIsDrawerExpanded] = useState<boolean>(false);

  // 2. Active Selected Device ID for Placement or Inspection
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // 3. Pin Visual Density Modes: 'icons' | 'minimal' | 'badge'
  const [pinDensity, setPinDensity] = useState<'icons' | 'minimal' | 'badge'>('icons');

  // 4. Room & Status filters in Drawer
  const [selectedRoomTab, setSelectedRoomTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unplaced' | 'placed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 5. Canvas Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPinId, setIsDraggingPinId] = useState<string | null>(null);

  // 6. Quick placement toast notice
  const [placementToast, setPlacementToast] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const dragStartPosRef = useRef<{ x: number; y: number; pinStartX: number; pinStartY: number } | null>(null);

  // Auto clear toast
  useEffect(() => {
    if (placementToast) {
      const t = setTimeout(() => setPlacementToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [placementToast]);

  // Group all rooms from project and pins
  const roomCategories = useMemo(() => {
    const names = new Set<string>();
    project.rooms.forEach((r) => names.add(r.name));
    pins.forEach((p) => {
      if (p.roomName) names.add(p.roomName);
    });
    return Array.from(names);
  }, [project.rooms, pins]);

  // Counts
  const placedCount = pins.filter((p) => p.isPlaced).length;
  const unplacedCount = pins.length - placedCount;

  // Selected Pin Item
  const activePin = useMemo(() => {
    return pins.find((p) => p.id === selectedPinId) || null;
  }, [pins, selectedPinId]);

  // Filtered devices in drawer
  const filteredPins = useMemo(() => {
    return pins.filter((p) => {
      // Room Tab Filter
      if (selectedRoomTab !== 'all') {
        const matchesRoom = p.roomName === selectedRoomTab || p.roomName?.includes(selectedRoomTab);
        if (!matchesRoom) return false;
      }

      // Status Filter
      if (statusFilter === 'placed' && !p.isPlaced) return false;
      if (statusFilter === 'unplaced' && p.isPlaced) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesModel = p.model.toLowerCase().includes(q);
        const matchesCircuit = p.circuitNumber?.toLowerCase().includes(q);
        const matchesRoom = p.roomName?.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        return matchesModel || matchesCircuit || matchesRoom || matchesCategory;
      }

      return true;
    });
  }, [pins, selectedRoomTab, statusFilter, searchQuery]);

  // Handle blueprint upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateFloorPlanImage(event.target.result as string);
          setPlacementToast({ text: '户型底图上传成功', type: 'success' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1: User selects a device from list to place
  const handleSelectDeviceToPlace = (pinId: string) => {
    setSelectedPinId(pinId);
    // Auto collapse drawer so the user has the FULL floor plan view to place accurately
    setIsDrawerExpanded(false);
    const targetPin = pins.find((p) => p.id === pinId);
    if (targetPin) {
      setPlacementToast({
        text: `已选中「${targetPin.model}」，请在户型图上点击目标位置完成放置`,
        type: 'info',
      });
    }
  };

  // Step 2: User clicks on the Canvas to place or move the selected device
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasContainerRef.current) return;

    // If a device is currently selected for placement:
    if (selectedPinId) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(3, Math.min(97, Math.round(x * 10) / 10));
      const clampedY = Math.max(3, Math.min(97, Math.round(y * 10) / 10));

      const placedPin = pins.find((p) => p.id === selectedPinId);

      onUpdatePins(
        pins.map((p) =>
          p.id === selectedPinId
            ? {
                ...p,
                xPercentage: clampedX,
                yPercentage: clampedY,
                isPlaced: true,
              }
            : p
        )
      );

      setPlacementToast({
        text: `已成功放置「${placedPin?.model || '设备'}」点位`,
        type: 'success',
      });

      // Find next unplaced device if available for seamless continuous manual placement
      const nextUnplaced = pins.find((p) => !p.isPlaced && p.id !== selectedPinId);
      if (nextUnplaced) {
        setSelectedPinId(nextUnplaced.id);
      } else {
        setSelectedPinId(null);
      }
    }
  };

  // Step 3: Touch / Mouse Dragging for fine-tuning placed pins on map
  const handlePinDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    pinId: string,
    currentXPercent: number,
    currentYPercent: number
  ) => {
    e.stopPropagation();
    setSelectedPinId(pinId);
    setIsDraggingPinId(pinId);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPosRef.current = {
      x: clientX,
      y: clientY,
      pinStartX: currentXPercent,
      pinStartY: currentYPercent,
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingPinId || !dragStartPosRef.current || !canvasContainerRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const rect = canvasContainerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStartPosRef.current.x;
      const deltaY = clientY - dragStartPosRef.current.y;

      const deltaPercentX = ((deltaX / rect.width) * 100) / zoomLevel;
      const deltaPercentY = ((deltaY / rect.height) * 100) / zoomLevel;

      const newX = Math.max(3, Math.min(97, dragStartPosRef.current.pinStartX + deltaPercentX));
      const newY = Math.max(3, Math.min(97, dragStartPosRef.current.pinStartY + deltaPercentY));

      onUpdatePins(
        pins.map((pin) => {
          if (pin.id === isDraggingPinId) {
            return {
              ...pin,
              xPercentage: Math.round(newX * 10) / 10,
              yPercentage: Math.round(newY * 10) / 10,
              isPlaced: true,
            };
          }
          return pin;
        })
      );
    };

    const handleEnd = () => {
      setIsDraggingPinId(null);
      dragStartPosRef.current = null;
    };

    if (isDraggingPinId) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDraggingPinId, pins, zoomLevel, onUpdatePins]);

  // Remove pin from blueprint back to unplaced drawer
  const handleRemovePinFromBlueprint = (pinId: string) => {
    onUpdatePins(
      pins.map((p) => (p.id === pinId ? { ...p, isPlaced: false } : p))
    );
    if (selectedPinId === pinId) {
      setSelectedPinId(null);
    }
    setPlacementToast({ text: '已将设备移出图纸', type: 'info' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center animate-fadeIn select-none">
      {/* Mobile-optimized viewport container */}
      <div className="w-full max-w-[430px] h-full flex flex-col bg-slate-950 shadow-2xl relative overflow-hidden">
        
        {/* =========================================================================
            1. TOP NAVBAR: Clean, compact header
           ========================================================================= */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-white shrink-0 z-40 gap-2">
          {/* Back button & Title */}
          <div className="flex items-center space-x-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1 -ml-1 text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer rounded-lg hover:bg-slate-800"
              title="返回方案"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  点位图排布
                </h2>
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  已布点 {placedCount}/{pins.length}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Upload image & Pin style toggle */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="更换户型底图"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>更换底图</span>
            </button>

            {/* Density toggle: Icon vs Minimal vs Badge */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px]">
              <button
                type="button"
                onClick={() => setPinDensity('icons')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  pinDensity === 'icons' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                }`}
                title="图标点位"
              >
                图标
              </button>
              <button
                type="button"
                onClick={() => setPinDensity('minimal')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  pinDensity === 'minimal' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                }`}
                title="极简圆点"
              >
                圆点
              </button>
              <button
                type="button"
                onClick={() => setPinDensity('badge')}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  pinDensity === 'badge' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                }`}
                title="标牌"
              >
                标牌
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. FULL CANVAS FLOOR PLAN STAGE (100% UNRESTRICTED VIEW)
           ========================================================================= */}
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden min-h-0">
          
          {/* Floating Zoom & Pan Controls on Canvas Top */}
          <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
            {/* Zoom Controls */}
            <div className="pointer-events-auto flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 shadow-xl text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                className="p-0.5 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1 font-extrabold text-slate-200 min-w-[32px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-0.5 hover:text-white active:scale-95 transition-all cursor-pointer"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="p-0.5 hover:text-white active:scale-95 transition-all cursor-pointer ml-0.5 border-l border-slate-700 pl-1"
                title="复位全图"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Quick Unplaced Remaining Pill */}
            {unplacedCount > 0 && (
              <button
                type="button"
                onClick={() => setIsDrawerExpanded(true)}
                className="pointer-events-auto px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-extrabold hover:bg-amber-500/30 flex items-center gap-1 shadow-lg cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>待放置: {unplacedCount}台</span>
              </button>
            )}
          </div>

          {/* Interactive Blueprint Canvas */}
          <div
            className={`flex-1 overflow-hidden flex items-center justify-center p-2 relative w-full h-full ${
              selectedPinId ? 'cursor-crosshair' : 'cursor-default'
            }`}
            onClick={handleCanvasClick}
          >
            <div
              ref={canvasContainerRef}
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}%, ${panOffset.y}%)`,
                transformOrigin: 'center center',
                transition: isDraggingPinId ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              className="relative w-full aspect-[4/3] max-h-[82vh] bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden touch-none"
            >
              {/* Floor Plan CAD Blueprint Background */}
              <img
                src={currentFloorPlanImage || SAMPLE_FLOOR_PLAN_SVG}
                alt="House CAD Floor Plan"
                className="w-full h-full object-contain pointer-events-none select-none rounded-xl opacity-90"
              />

              {/* Rendered Device Point Pins Layer */}
              {pins
                .filter((p) => p.isPlaced)
                .map((pin) => {
                  const roomColor = ROOM_COLOR_MAP[pin.roomName || ''] || {
                    bg: 'bg-blue-600',
                    text: 'text-blue-400',
                    border: 'border-blue-500',
                    hex: '#3b82f6',
                    ring: 'ring-blue-500/40',
                  };
                  const catMeta = getCategoryMeta(pin.category, pin.model);
                  const IconComp = catMeta.icon;

                  const isSelected = selectedPinId === pin.id;
                  const isDragging = isDraggingPinId === pin.id;

                  return (
                    <div
                      key={pin.id}
                      onMouseDown={(e) => handlePinDragStart(e, pin.id, pin.xPercentage, pin.yPercentage)}
                      onTouchStart={(e) => handlePinDragStart(e, pin.id, pin.xPercentage, pin.yPercentage)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPinId(pin.id);
                      }}
                      style={{
                        left: `${pin.xPercentage}%`,
                        top: `${pin.yPercentage}%`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: isDragging ? 60 : isSelected ? 50 : 30,
                      }}
                      className={`absolute cursor-grab active:cursor-grabbing group transition-all duration-100 touch-manipulation ${
                        isDragging ? 'scale-125' : isSelected ? 'scale-115' : 'hover:scale-110'
                      }`}
                    >
                      {/* Pulsing indicator ring for selected pin */}
                      {isSelected && (
                        <span className="absolute -inset-2.5 rounded-full bg-amber-400/50 animate-ping pointer-events-none" />
                      )}

                      {/* DENSITY MODE 1: Category Icons */}
                      {pinDensity === 'icons' ? (
                        <div
                          className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white shadow-lg border-2 relative transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-4 ring-amber-400/50 scale-110 bg-amber-600'
                              : `border-white ${roomColor.bg}`
                          }`}
                        >
                          <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                          <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white font-mono text-[7px] sm:text-[8px] font-extrabold px-1 rounded-full border border-slate-700 shadow-xs">
                            {pin.circuitNumber || 'P'}
                          </span>
                        </div>
                      ) : pinDensity === 'minimal' ? (
                        /* DENSITY MODE 2: Minimal Glowing Dot */
                        <div
                          className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white font-extrabold text-[9px] shadow-lg border-2 transition-all ${
                            isSelected
                              ? 'border-amber-400 ring-4 ring-amber-400/50 scale-110 bg-amber-500'
                              : `border-white ${roomColor.bg}`
                          }`}
                        >
                          <span className="font-mono font-black">{pin.circuitNumber || 'P'}</span>
                        </div>
                      ) : (
                        /* DENSITY MODE 3: Compact Pill Badge */
                        <div
                          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full shadow-lg border text-white font-bold text-[9px] transition-all whitespace-nowrap ${
                            isSelected
                              ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 text-amber-300'
                              : `bg-slate-900/90 border-slate-700`
                          }`}
                        >
                          <span className="font-mono text-blue-300 font-extrabold">
                            {pin.circuitNumber || 'P'}
                          </span>
                          <span className="truncate max-w-[50px]">{pin.model}</span>
                        </div>
                      )}

                      {/* Floating Tooltip Card on Selected Pin */}
                      {isSelected && !isDragging && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl bg-slate-900 text-white border border-amber-400/80 z-60 pointer-events-auto space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-amber-300 font-extrabold">
                              {pin.circuitNumber} · {pin.model}
                            </span>
                            <span className="text-[9px] text-slate-400">¥{pin.unitPrice}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="text-[9px] text-slate-300">{pin.roomName}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePinFromBlueprint(pin.id);
                              }}
                              className="text-rose-400 hover:text-rose-300 text-[9px] font-bold underline cursor-pointer"
                            >
                              移出图纸
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Placement Notice / Toast Bar */}
          {placementToast && (
            <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none flex justify-center">
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border flex items-center space-x-1.5 animate-fadeIn ${
                  placementToast.type === 'success'
                    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80'
                    : 'bg-blue-950/90 text-blue-200 border-blue-700/80'
                }`}
              >
                {placementToast.type === 'success' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
                <span>{placementToast.text}</span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            3. COLLAPSIBLE DEVICE SELECTION DRAWER (可收拉设备列表)
           ========================================================================= */}
        <div className="relative z-40 bg-slate-900 border-t border-slate-800 shadow-2xl flex flex-col shrink-0 transition-all duration-300">
          
          {/* --- A. COLLAPSED BAR (Default / Placement Active Mode) --- */}
          {!isDrawerExpanded ? (
            <div className="px-3 py-2.5 flex items-center justify-between gap-2">
              {/* When an active device is chosen for placement */}
              {activePin ? (
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-white truncate">
                      <span className="font-mono text-amber-400 font-black">
                        {activePin.circuitNumber || 'P'}
                      </span>
                      <span className="truncate">{activePin.model}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({activePin.roomName})</span>
                    </div>
                    <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3 text-blue-400" />
                      <span>点击图纸任意位置即可放置点位</span>
                    </div>
                  </div>

                  {/* Cancel / Switch selection */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsDrawerExpanded(true)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 cursor-pointer"
                    >
                      换一个
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPinId(null)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                      title="取消当前选中"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* When no device is selected: Clean summary & expand trigger */
                <div
                  onClick={() => setIsDrawerExpanded(true)}
                  className="flex items-center justify-between w-full cursor-pointer group"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                      <List className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>设备选择清单</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          (未布点: {unplacedCount} / 总计: {pins.length})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 group-hover:text-blue-400 transition-colors">
                        点击展开列表选择设备并放置到图纸 👆
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>展开选设备</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* --- B. EXPANDED SLIDE-UP DRAWER (收拉设备选择列表) --- */
            <div className="h-[360px] max-h-[55vh] flex flex-col">
              {/* Drawer Header & Collapse Toggle */}
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-3.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-extrabold text-white">选择设备放置到图纸</span>
                  <span className="text-[10px] text-slate-400">
                    ({unplacedCount > 0 ? `${unplacedCount} 台待放置` : '全部已布点'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerExpanded(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <span>收起</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status Tabs + Search Input */}
              <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2 shrink-0">
                {/* Status Toggle Pills */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[10px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      statusFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    全部 ({pins.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('unplaced')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      statusFilter === 'unplaced' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    未布点 ({unplacedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('placed')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      statusFilter === 'placed' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    已布点 ({placedCount})
                  </button>
                </div>

                {/* Quick Search */}
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜设备/房间..."
                    className="w-full bg-slate-800 rounded-lg pl-6 pr-2 py-0.5 text-[11px] text-slate-200 placeholder:text-slate-500 outline-none border border-slate-700 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Room Quick Filter Pills */}
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center space-x-1 overflow-x-auto scrollbar-none shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRoomTab('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedRoomTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  全部房间
                </button>
                {roomCategories.map((rm) => {
                  const count = pins.filter((p) => p.roomName === rm || p.roomName?.includes(rm)).length;
                  return (
                    <button
                      key={rm}
                      type="button"
                      onClick={() => setSelectedRoomTab(rm)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer shrink-0 ${
                        selectedRoomTab === rm
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rm} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Device Cards List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 min-h-0 bg-slate-950/40">
                {filteredPins.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    没有找到符合条件的设备
                  </div>
                ) : (
                  filteredPins.map((pin) => {
                    const isSelected = selectedPinId === pin.id;
                    const catMeta = getCategoryMeta(pin.category, pin.model);
                    const IconComp = catMeta.icon;
                    const roomColor = ROOM_COLOR_MAP[pin.roomName || ''] || {
                      bg: 'bg-blue-600',
                      text: 'text-blue-400',
                    };

                    return (
                      <div
                        key={pin.id}
                        onClick={() => handleSelectDeviceToPlace(pin.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs active:scale-[0.99] ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 text-white ring-2 ring-amber-400/40'
                            : 'bg-slate-900 border-slate-800/90 text-slate-200 hover:bg-slate-800/70'
                        }`}
                      >
                        {/* Device Info */}
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                          <div className={`w-8 h-8 rounded-xl ${catMeta.bg} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                            <IconComp className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-[10px] font-extrabold text-blue-400 bg-blue-600/20 px-1 rounded">
                                {pin.circuitNumber || 'P'}
                              </span>
                              <span className="font-bold text-xs truncate text-white">
                                {pin.model}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                              <span className={`font-medium ${roomColor.text}`}>{pin.roomName}</span>
                              <span className="opacity-40">·</span>
                              <span>¥{pin.unitPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Placement Trigger Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDeviceToPlace(pin.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-all cursor-pointer shrink-0 ${
                            pin.isPlaced
                              ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
                          }`}
                        >
                          {pin.isPlaced ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>重设位置</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3 text-amber-300" />
                              <span>点击放置</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
