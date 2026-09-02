import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  Move,
  MousePointer,
  Type,
  PenTool,
  Square,
  Minus,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  Save,
  FileSpreadsheet,
  Download,
  Share2,
  Plus,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronRight,
  Settings2,
  Sparkles,
  Zap,
  Radio,
  Lock,
  Unlock,
  Sliders,
  Undo2,
  Redo2,
  Printer,
  Copy,
  Info,
  Building,
  Check,
  X,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import {
  EquipmentProduct,
  SavedPlanRecord,
  CanvasPinItem,
  FloorDrawingLayer,
  FloorPlanDesignProject,
  RoomItem,
} from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';
import { SAMPLE_FLOOR_PLAN_SVG } from '../../data/presetData';

interface FloorPlanPointDesignerProps {
  initialPlanId?: string;
  onExit?: () => void;
}

export const FloorPlanPointDesigner: React.FC<FloorPlanPointDesignerProps> = ({
  initialPlanId,
  onExit,
}) => {
  // 1. Data Sources
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>(() => {
    return AdminStorageManager.getSavedPlans();
  });

  const [products, setProducts] = useState<EquipmentProduct[]>(() => {
    return AdminStorageManager.getEquipmentProducts();
  });

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    initialPlanId || savedPlans[0]?.id || 'plan_rec_001'
  );

  // Selected Plan Object
  const selectedPlan = useMemo(() => {
    return savedPlans.find((p) => p.id === selectedPlanId) || savedPlans[0];
  }, [savedPlans, selectedPlanId]);

  // CAD Projects
  const [cadProjects, setCadProjects] = useState<FloorPlanDesignProject[]>(() => {
    return AdminStorageManager.getFloorPointDesigns();
  });

  // Current Floor / Layer State
  const [activeFloorName, setActiveFloorName] = useState<string>('测试 (点位图+灯光图)');
  const [floorPlanImage, setFloorPlanImage] = useState<string>(SAMPLE_FLOOR_PLAN_SVG);
  const [blueprintOpacity, setBlueprintOpacity] = useState<number>(100);

  // Canvas Pins
  const [pins, setPins] = useState<CanvasPinItem[]>(() => {
    const existing = AdminStorageManager.getFloorPointDesigns();
    if (existing.length > 0 && existing[0].layers[0]?.pins?.length > 0) {
      return existing[0].layers[0].pins;
    }
    return [
      {
        id: 'pin_init_1',
        productId: 'prod_mi_central_gateway',
        model: '智能中枢网关',
        brand: '小米',
        category: '智能网关/中控',
        roomName: '弱电箱 / 机房',
        unitPrice: 349,
        xPercentage: 42,
        yPercentage: 48,
        circuitNumber: 'GW-01',
        color: '#2563eb',
        isPlaced: true,
      },
      {
        id: 'pin_init_2',
        productId: 'prod_mi_speaker_pro',
        model: 'Xiaomi 智能音箱 Pro',
        brand: '小米',
        category: '背景音乐/影音',
        roomName: '客厅',
        unitPrice: 369,
        xPercentage: 35,
        yPercentage: 25,
        circuitNumber: 'SP-01',
        color: '#9333ea',
        isPlaced: true,
      },
      {
        id: 'pin_init_3',
        productId: 'prod_mi_switch_pro',
        model: '小米智能开关Pro',
        brand: '小米',
        category: '智能面板/开关',
        roomName: '主卧',
        unitPrice: 129,
        xPercentage: 22,
        yPercentage: 65,
        circuitNumber: 'SW-01',
        color: '#059669',
        isPlaced: true,
      },
      {
        id: 'pin_init_4',
        productId: 'prod_mi_presence_sensor',
        model: '小米人体传感器',
        brand: '小米',
        category: '传感器/雷达',
        roomName: '男卫',
        unitPrice: 149,
        xPercentage: 68,
        yPercentage: 55,
        circuitNumber: 'SN-01',
        color: '#ea580c',
        isPlaced: true,
      },
    ];
  });

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<
    'select' | 'hand' | 'icon' | 'text' | 'pen' | 'shape' | 'line'
  >('select');

  // Canvas Viewport & Zoom
  const [zoomLevel, setZoomLevel] = useState<number>(97); // 97% default matching Figure 2
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showWireLines, setShowWireLines] = useState<boolean>(true);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Left Sidebar Filter & Search
  const [leftTab, setLeftTab] = useState<'product' | 'template' | 'quote'>('product');
  const [categoryFilter, setCategoryFilter] = useState('全部类别');
  const [brandFilter, setBrandFilter] = useState('全部品牌');
  const [searchQuery, setSearchQuery] = useState('');

  // Right Sidebar Tab: 图纸设备 vs 图纸设置
  const [rightTab, setRightTab] = useState<'devices' | 'settings'>('devices');
  const [deviceSubTab, setDeviceSubTab] = useState<'room' | 'category'>('room');
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({
    '未分配': true,
    '客厅': true,
    '主卧': true,
    '男卫': true,
    '弱电箱 / 机房': true,
  });

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Dragging pin on canvas
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);

  // Extract all scheme room items
  const schemeRoomDevices = useMemo(() => {
    if (!selectedPlan?.project?.rooms) {
      return [
        { roomName: '客厅', devices: ['智能网关 M3 Pro', '小米智能音箱 Pro', '四路智能开关', '电动开合帘'] },
        { roomName: '主卧', devices: ['触控调光开关', '电动开合帘', '人体传感器'] },
        { roomName: '男卫', devices: ['人体微波雷达感应器', '单路智能开关'] },
      ];
    }
    return selectedPlan.project.rooms.map((r) => {
      const devList: { model: string; brand: string; category: string; price: number }[] = [];
      if (r.scheme.enableLighting) {
        devList.push({
          model: '智能照明调光开关',
          brand: '小米/绿米',
          category: '智能面板/开关',
          price: 220,
        });
      }
      if (r.scheme.enableCurtain) {
        devList.push({
          model: '智能静音电动窗帘电机',
          brand: '欧瑞博/绿米',
          category: '智能窗帘/电机',
          price: 680,
        });
      }
      if (r.scheme.otherRequirements?.smartSensors) {
        devList.push({
          model: '人体存在毫米波雷达',
          brand: '涂鸦/小米',
          category: '传感器/雷达',
          price: 180,
        });
      }
      if (r.scheme.otherRequirements?.thermostatControl) {
        devList.push({
          model: '智能温控一体化面板',
          brand: '欧瑞博',
          category: '环境控制/温控',
          price: 880,
        });
      }
      if (r.scheme.otherRequirements?.bgMusic) {
        devList.push({
          model: '吸顶背景音乐系统',
          brand: '悠达/小米',
          category: '背景音乐/影音',
          price: 369,
        });
      }
      return {
        roomName: r.name,
        devices: devList,
      };
    });
  }, [selectedPlan]);

  // Categories & Brands list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['全部类别', ...Array.from(set)];
  }, [products]);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return ['全部品牌', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== '全部类别' && p.category !== categoryFilter) return false;
      if (brandFilter !== '全部品牌' && p.brand !== brandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.model.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, categoryFilter, brandFilter, searchQuery]);

  // Handle Drag Start from Left Sidebar or Right Tree
  const handleDragStartFromLibrary = (e: React.DragEvent, prod: EquipmentProduct, roomName?: string) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        productId: prod.id,
        model: prod.model,
        brand: prod.brand,
        category: prod.category,
        unitPrice: prod.price,
        imageUrl: prod.imageUrl,
        roomName: roomName || '客厅',
      })
    );
  };

  // Handle Drop onto Canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const xPct = Math.max(2, Math.min(96, Math.round((clientX / rect.width) * 100)));
    const yPct = Math.max(2, Math.min(96, Math.round((clientY / rect.height) * 100)));

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        let color = '#2563eb';
        let circuitPrefix = 'L';
        if (data.category.includes('网关')) {
          color = '#2563eb';
          circuitPrefix = 'GW';
        } else if (data.category.includes('开关') || data.category.includes('面板')) {
          color = '#059669';
          circuitPrefix = 'SW';
        } else if (data.category.includes('窗帘')) {
          color = '#0891b2';
          circuitPrefix = 'C';
        } else if (data.category.includes('传感器')) {
          color = '#ea580c';
          circuitPrefix = 'SN';
        } else if (data.category.includes('影音') || data.category.includes('音乐')) {
          color = '#9333ea';
          circuitPrefix = 'SP';
        } else if (data.category.includes('门锁')) {
          color = '#dc2626';
          circuitPrefix = 'LK';
        }

        const newPin: CanvasPinItem = {
          id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          productId: data.productId || 'prod_custom',
          model: data.model || '智能设备',
          brand: data.brand || '智家',
          category: data.category || '智能设备',
          roomName: data.roomName || '客厅',
          unitPrice: data.unitPrice || 299,
          imageUrl: data.imageUrl,
          xPercentage: xPct,
          yPercentage: yPct,
          circuitNumber: `${circuitPrefix}-${pins.length + 1}`,
          color,
          isPlaced: true,
          rotation: 0,
        };

        setPins([...pins, newPin]);
        setSelectedPinId(newPin.id);
        showToast(`已成功将「${newPin.model}」布点至户型图 (${xPct}%, ${yPct}%)`);
      }
    } catch (err) {
      console.error('Failed to parse dropped product', err);
    }
  };

  // Handle Drag Pin within Canvas
  const handlePinMouseDown = (e: React.MouseEvent, pinId: string) => {
    e.stopPropagation();
    setSelectedPinId(pinId);
    setDraggingPinId(pinId);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingPinId || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(2, Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const yPct = Math.max(2, Math.min(96, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    setPins((prev) =>
      prev.map((pin) => (pin.id === draggingPinId ? { ...pin, xPercentage: xPct, yPercentage: yPct } : pin))
    );
  };

  const handleCanvasMouseUp = () => {
    setDraggingPinId(null);
  };

  // Rotate Pin
  const handleRotatePin = (pinId: string) => {
    setPins((prev) =>
      prev.map((p) => {
        if (p.id === pinId) {
          const nextRotation = ((p.rotation || 0) + 90) % 360;
          return { ...p, rotation: nextRotation };
        }
        return p;
      })
    );
  };

  // Delete Pin
  const handleDeletePin = (pinId: string) => {
    setPins((prev) => prev.filter((p) => p.id !== pinId));
    if (selectedPinId === pinId) setSelectedPinId(null);
  };

  // Upload Custom Floor Plan Blueprint
  const handleBlueprintUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFloorPlanImage(event.target.result as string);
          showToast('已成功载入自定义户型图！');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto Place Pins
  const handleAutoRecognizeAndPlace = () => {
    const newAutoPins: CanvasPinItem[] = [
      {
        id: `pin_auto_gw_${Date.now()}`,
        productId: 'prod_mi_central_gateway',
        model: '智能中枢网关',
        brand: '小米',
        category: '智能网关/中控',
        roomName: '弱电箱 / 机房',
        unitPrice: 349,
        xPercentage: 45,
        yPercentage: 45,
        circuitNumber: 'GW-01',
        color: '#2563eb',
        isPlaced: true,
      },
      {
        id: `pin_auto_sp_${Date.now()}`,
        productId: 'prod_mi_speaker_pro',
        model: 'Xiaomi 智能音箱 Pro',
        brand: '小米',
        category: '背景音乐/影音',
        roomName: '客厅',
        unitPrice: 369,
        xPercentage: 30,
        yPercentage: 20,
        circuitNumber: 'SP-01',
        color: '#9333ea',
        isPlaced: true,
      },
      {
        id: `pin_auto_sw1_${Date.now()}`,
        productId: 'prod_sw_z1',
        model: '四路触控调光开关',
        brand: '绿米',
        category: '智能面板/开关',
        roomName: '客厅',
        unitPrice: 380,
        xPercentage: 20,
        yPercentage: 32,
        circuitNumber: 'SW-01',
        color: '#059669',
        isPlaced: true,
      },
      {
        id: `pin_auto_cur_${Date.now()}`,
        productId: 'prod_curtain_c1',
        model: '双轨电动窗帘电机',
        brand: '欧瑞博',
        category: '智能窗帘/电机',
        roomName: '客厅',
        unitPrice: 680,
        xPercentage: 58,
        yPercentage: 12,
        circuitNumber: 'C-01',
        color: '#0891b2',
        isPlaced: true,
      },
      {
        id: `pin_auto_sw2_${Date.now()}`,
        productId: 'prod_mi_switch_pro',
        model: '小米智能开关Pro',
        brand: '小米',
        category: '智能面板/开关',
        roomName: '主卧',
        unitPrice: 129,
        xPercentage: 18,
        yPercentage: 70,
        circuitNumber: 'SW-02',
        color: '#059669',
        isPlaced: true,
      },
      {
        id: `pin_auto_sn1_${Date.now()}`,
        productId: 'prod_mi_presence_sensor',
        model: '小米人体传感器',
        brand: '小米',
        category: '传感器/雷达',
        roomName: '男卫',
        unitPrice: 149,
        xPercentage: 72,
        yPercentage: 52,
        circuitNumber: 'SN-01',
        color: '#ea580c',
        isPlaced: true,
      },
      {
        id: `pin_auto_lk_${Date.now()}`,
        productId: 'prod_mi_lock_m30pro',
        model: '智能门锁 M30Pro',
        brand: '小米',
        category: '智能门锁/安防',
        roomName: '玄关',
        unitPrice: 3499,
        xPercentage: 10,
        yPercentage: 35,
        circuitNumber: 'LK-01',
        color: '#dc2626',
        isPlaced: true,
      },
    ];

    setPins(newAutoPins);
    showToast('已根据方案一键智能识别排布 7 个核心点位！');
  };

  // Save CAD Project
  const handleSaveCADProject = () => {
    const newProject: FloorPlanDesignProject = {
      id: `cad_proj_${Date.now()}`,
      title: `麦哲伦CAD · ${selectedPlan?.communityName || '户型'}方案点位设计`,
      associatedPlanId: selectedPlanId,
      communityName: selectedPlan?.communityName || '万科翡翠公园',
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      activeLayerId: 'layer_1',
      layers: [
        {
          id: 'layer_1',
          name: activeFloorName,
          blueprintUrl: floorPlanImage,
          pins,
        },
      ],
    };

    const existing = AdminStorageManager.getFloorPointDesigns();
    AdminStorageManager.saveFloorPointDesigns([newProject, ...existing]);
    showToast('CAD 点位图方案已成功保存！');
  };

  const selectedPin = pins.find((p) => p.id === selectedPinId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e232d] text-slate-200 overflow-hidden select-none font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBlueprintUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center space-x-2 border border-slate-700 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= TOP TOOLBAR (Matching Figure 2 Top Bar) ================= */}
      <div className="bg-[#181b22] border-b border-slate-800 px-4 py-2 flex items-center justify-between shadow-md shrink-0">
        {/* Left: Platform Logo & Tool Group */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-white font-black text-sm tracking-wide mr-2">
            <span className="text-blue-400">麦哲伦平台</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-slate-300 font-semibold text-xs">方案设计</span>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Tool Icon Buttons (Icon, Text, Pen, Shape, Line, Image, Align, Lock, Undo, Redo, Select, Hand, Settings) */}
          <div className="flex items-center space-x-1 text-slate-300 text-xs">
            <button
              onClick={() => setActiveTool('icon')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTool === 'icon' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="图标工具"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="text-[11px]">图标</span>
            </button>

            <button
              onClick={() => setActiveTool('text')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTool === 'text' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="文字标注"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[11px]">文字</span>
            </button>

            <button
              onClick={() => setActiveTool('pen')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTool === 'pen' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="布线连线画笔"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="text-[11px]">画笔</span>
            </button>

            <button
              onClick={() => setActiveTool('shape')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTool === 'shape' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="空间区域框"
            >
              <Square className="w-3.5 h-3.5" />
              <span className="text-[11px]">图形</span>
            </button>

            <button
              onClick={() => setActiveTool('line')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeTool === 'line' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="强弱电走向线"
            >
              <Minus className="w-3.5 h-3.5" />
              <span className="text-[11px]">线条</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1 px-2.5 py-1 hover:bg-slate-800 text-slate-300 rounded transition-colors cursor-pointer"
              title="更换底图图片"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px]">图片</span>
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeTool === 'select' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="选择指针"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTool('hand')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                activeTool === 'hand' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="抓手平移"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                showGrid ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-800 text-slate-400'
              }`}
              title="网格标尺"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAutoRecognizeAndPlace}
              className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[11px] font-bold cursor-pointer"
              title="根据方案智能自动布点"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>自动布点</span>
            </button>
          </div>
        </div>

        {/* Right: Save, BOM, Synthesize, Generate, Exit */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveCADProject}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存</span>
          </button>

          <button
            onClick={() => setIsBOMModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>清单</span>
          </button>

          <button
            onClick={() => {
              window.print();
              showToast('正在合成高精度点位图与图例...');
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>合成</span>
          </button>

          <button
            onClick={() => {
              setIsExportModalOpen(true);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>生成</span>
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-xs transition-colors cursor-pointer"
            >
              退出
            </button>
          )}
        </div>
      </div>

      {/* ================= MAIN 3-COLUMN WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---------------- 1. LEFT PRODUCT DRAWER (Figure 2 Left Panel) ---------------- */}
        <div className="w-72 bg-[#181b22] border-r border-slate-800 flex flex-col shrink-0 shadow-lg">
          {/* Top Tabs: 模板 / 报价 / 产品 */}
          <div className="flex border-b border-slate-800 text-xs font-bold bg-[#14161d]">
            <button
              onClick={() => setLeftTab('template')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                leftTab === 'template'
                  ? 'text-blue-400 bg-[#181b22] border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              模板
            </button>
            <button
              onClick={() => setLeftTab('quote')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                leftTab === 'quote'
                  ? 'text-blue-400 bg-[#181b22] border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              报价
            </button>
            <button
              onClick={() => setLeftTab('product')}
              className={`flex-1 py-2.5 text-center transition-colors ${
                leftTab === 'product'
                  ? 'text-blue-400 bg-[#181b22] border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              产品
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-2.5 border-b border-slate-800 space-y-2 bg-[#181b22]">
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-[11px] px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300 focus:outline-hidden"
              >
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="text-[11px] px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300 focus:outline-hidden"
              >
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
              <input
                type="text"
                placeholder="产品/型号名称"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-7 pr-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Draggable Products Grid */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            <p className="text-[10px] text-slate-500 px-1 font-semibold">
              💡 提示：可直接拖拽下列产品至画布上放置点位
            </p>

            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                draggable
                onDragStart={(e) => handleDragStartFromLibrary(e, prod)}
                className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/80 rounded-lg p-2 flex items-center justify-between hover:bg-slate-800/80 transition-all cursor-grab active:cursor-grabbing group"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <img
                    src={prod.imageUrl}
                    alt={prod.model}
                    className="w-10 h-10 rounded bg-slate-800 object-cover shrink-0 border border-slate-700"
                  />
                  <div className="truncate">
                    <h5 className="text-[11px] font-bold text-slate-200 truncate group-hover:text-blue-400">
                      {prod.model}
                    </h5>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {prod.brand} · {prod.category}
                    </p>
                    <span className="text-[11px] font-mono font-bold text-blue-400">
                      ¥{prod.price}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-500 group-hover:text-blue-400 shrink-0 ml-1">
                  拖动
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- 2. CENTER CAD CANVAS STAGE ---------------- */}
        <div
          className="flex-1 flex flex-col bg-[#111318] relative overflow-hidden"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* Top Info Strip */}
          <div className="bg-[#181b22]/90 border-b border-slate-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold">{activeFloorName}</span>
              <span>·</span>
              <span>已排布点位：{pins.length} 个</span>
              <span>·</span>
              <span className="text-emerald-400">图纸比例 1:1</span>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWireLines}
                  onChange={(e) => setShowWireLines(e.target.checked)}
                  className="rounded text-blue-500 bg-slate-800 border-slate-700"
                />
                <span>显示总线走线</span>
              </label>

              <div className="flex items-center space-x-1">
                <span>底图透明度:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={blueprintOpacity}
                  onChange={(e) => setBlueprintOpacity(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Canvas Stage */}
          <div
            ref={canvasContainerRef}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCanvasDrop}
            className={`flex-1 relative overflow-hidden flex items-center justify-center p-6 cursor-${
              activeTool === 'hand' ? 'grab' : 'crosshair'
            }`}
            style={{
              backgroundImage: showGrid
                ? 'radial-gradient(circle, #334155 1px, transparent 1px)'
                : 'none',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Blueprint Layer Container */}
            <div
              className="relative max-w-4xl w-full h-[520px] bg-slate-900/60 rounded-xl border-2 border-slate-700/80 shadow-2xl overflow-hidden"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease',
              }}
            >
              {/* Floor Plan Background Image */}
              <img
                src={floorPlanImage}
                alt="Floor plan CAD blueprint"
                className="w-full h-full object-contain pointer-events-none select-none"
                style={{ opacity: blueprintOpacity / 100 }}
              />

              {/* Wire Lines Overlay (Visualizing bus connection between pins) */}
              {showWireLines && pins.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {pins.map((p, idx) => {
                    if (idx === 0) return null;
                    const prev = pins[0]; // connect all to central gateway
                    return (
                      <line
                        key={`wire_${idx}`}
                        x1={`${prev.xPercentage}%`}
                        y1={`${prev.yPercentage}%`}
                        x2={`${p.xPercentage}%`}
                        y2={`${p.yPercentage}%`}
                        stroke={p.color || '#3b82f6'}
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.6"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Interactive Placed Device Pins */}
              {pins.map((pin) => {
                const isSelected = pin.id === selectedPinId;
                return (
                  <div
                    key={pin.id}
                    onMouseDown={(e) => handlePinMouseDown(e, pin.id)}
                    style={{
                      left: `${pin.xPercentage}%`,
                      top: `${pin.yPercentage}%`,
                      transform: `translate(-50%, -50%) rotate(${pin.rotation || 0}deg)`,
                    }}
                    className={`absolute z-20 flex flex-col items-center cursor-move select-none group`}
                  >
                    {/* Pin Marker Badge */}
                    <div
                      style={{ backgroundColor: pin.color || '#2563eb' }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all ${
                        isSelected
                          ? 'border-white ring-4 ring-blue-500/50 scale-125'
                          : 'border-slate-900 group-hover:scale-110'
                      }`}
                    >
                      <span className="text-[9px] font-black tracking-tighter">
                        {pin.circuitNumber || 'P'}
                      </span>
                    </div>

                    {/* Pin Label Tag */}
                    <div
                      className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold whitespace-nowrap shadow-md pointer-events-none transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {pin.model}
                    </div>

                    {/* Selected Floating Mini Properties */}
                    {isSelected && (
                      <div
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg flex items-center space-x-1 shadow-2xl z-30"
                      >
                        <button
                          onClick={() => handleRotatePin(pin.id)}
                          className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                          title="旋转90°"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeletePin(pin.id)}
                          className="p-1 hover:bg-rose-900/50 text-rose-400 rounded"
                          title="删除点位"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Zoom & View Controls Toolbar */}
          <div className="bg-[#181b22] border-t border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-slate-200 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(200, prev + 10))}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(97)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-400 rounded"
              >
                适应
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-400 rounded"
              >
                100%
              </button>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span>快捷键：按住空格键可平移画布，按住鼠标拖拽点位</span>
            </div>
          </div>
        </div>

        {/* ---------------- 3. RIGHT SIDEBAR (Figure 2 Right Panel: Scheme Devices & Floor Layers) ---------------- */}
        <div className="w-72 bg-[#181b22] border-l border-slate-800 flex flex-col shrink-0 shadow-lg">
          {/* Top Section: 楼层图纸 (Figure 2 Top Right) */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>楼层图纸</span>
              </span>
              <button
                onClick={() => {
                  const fName = prompt('输入新楼层名称 (如 2F 夹层):', '2F 主卧层');
                  if (fName) setActiveFloorName(fName);
                }}
                className="text-[10px] text-blue-400 hover:underline font-semibold"
              >
                + 新建楼层
              </button>
            </div>

            <div className="bg-slate-900 border border-blue-500/50 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="font-bold text-white">{activeFloorName}</span>
              <span className="text-[10px] text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                {pins.length} 点位
              </span>
            </div>
          </div>

          {/* Scheme Selector: "选择一个方案" Dropdown */}
          <div className="p-3 border-b border-slate-800 bg-[#14161d] space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400">
              📌 选择方案加载设备清单:
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-medium focus:outline-hidden focus:border-blue-500"
            >
              {savedPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs: 图纸设备 (Drawing Devices) vs 图纸设置 (Drawing Settings) */}
          <div className="flex border-b border-slate-800 text-xs font-bold bg-[#14161d]">
            <button
              onClick={() => setRightTab('devices')}
              className={`flex-1 py-2 text-center transition-colors ${
                rightTab === 'devices'
                  ? 'text-blue-400 bg-[#181b22] border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              图纸设备
            </button>
            <button
              onClick={() => setRightTab('settings')}
              className={`flex-1 py-2 text-center transition-colors ${
                rightTab === 'settings'
                  ? 'text-blue-400 bg-[#181b22] border-b-2 border-blue-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              图纸设置
            </button>
          </div>

          {/* Sub-tabs: 房间 / 分类 */}
          {rightTab === 'devices' && (
            <div className="flex px-3 py-1.5 border-b border-slate-800/80 text-[11px] font-semibold space-x-3 text-slate-400 bg-[#181b22]">
              <button
                onClick={() => setDeviceSubTab('room')}
                className={deviceSubTab === 'room' ? 'text-blue-400 font-bold' : 'hover:text-white'}
              >
                房间
              </button>
              <button
                onClick={() => setDeviceSubTab('category')}
                className={deviceSubTab === 'category' ? 'text-blue-400 font-bold' : 'hover:text-white'}
              >
                分类
              </button>
            </div>
          )}

          {/* Devices Tree List */}
          {rightTab === 'devices' ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {/* Unassigned Group */}
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedRooms((prev) => ({ ...prev, '未分配': !prev['未分配'] }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-900/80 flex items-center justify-between text-slate-300 font-bold hover:bg-slate-800"
                >
                  <div className="flex items-center space-x-1.5">
                    <ChevronRight
                      className={`w-3 h-3 text-slate-500 transition-transform ${
                        expandedRooms['未分配'] ? 'rotate-90' : ''
                      }`}
                    />
                    <span>未分配 (0/0)</span>
                  </div>
                </button>
              </div>

              {/* Room Groups matching Figure 2 Tree */}
              {schemeRoomDevices.map((roomGroup, idx) => {
                const isExpanded = expandedRooms[roomGroup.roomName] ?? true;
                const placedInRoom = pins.filter((p) => p.roomName.includes(roomGroup.roomName));
                const totalInRoom = Array.isArray(roomGroup.devices) ? roomGroup.devices.length : 0;

                return (
                  <div
                    key={`rg_${idx}`}
                    className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40"
                  >
                    <button
                      onClick={() =>
                        setExpandedRooms((prev) => ({
                          ...prev,
                          [roomGroup.roomName]: !isExpanded,
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900/90 flex items-center justify-between text-slate-200 font-bold hover:bg-slate-800"
                    >
                      <div className="flex items-center space-x-1.5">
                        <ChevronRight
                          className={`w-3 h-3 text-slate-500 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                        <span>{roomGroup.roomName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({placedInRoom.length}/{totalInRoom})
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-2 space-y-1.5 divide-y divide-slate-800/40">
                        {Array.isArray(roomGroup.devices) &&
                          roomGroup.devices.map((dev: any, dIdx: number) => {
                            const devName = typeof dev === 'string' ? dev : dev.model;
                            const isPlaced = pins.some(
                              (p) => p.model.includes(devName) || devName.includes(p.model)
                            );

                            return (
                              <div
                                key={`d_${dIdx}`}
                                draggable
                                onDragStart={(e) =>
                                  handleDragStartFromLibrary(
                                    e,
                                    {
                                      id: `prod_scheme_${dIdx}`,
                                      model: devName,
                                      brand: dev.brand || '智家',
                                      category: dev.category || '智能设备',
                                      price: dev.price || 380,
                                      unit: dev.unit || '台',
                                      imageUrl: dev.imageUrl || '',
                                      installationNotes: dev.installationNotes || '按标准施工规范安装',
                                      description: dev.description || '方案选配设备',
                                    },
                                    roomGroup.roomName
                                  )
                                }
                                className="pt-1.5 flex items-center justify-between text-[11px] cursor-grab active:cursor-grabbing hover:text-blue-400 group"
                              >
                                <div className="flex items-center space-x-1.5 truncate">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPlaced ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                                  />
                                  <span className="truncate">{devName}</span>
                                </div>

                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                    isPlaced
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {isPlaced ? '已布点' : '待布点'}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">图纸名称</label>
                <input
                  type="text"
                  value={activeFloorName}
                  onChange={(e) => setActiveFloorName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">更换户型底图</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded font-bold hover:bg-blue-600/30"
                >
                  上传本地图纸文件 (JPG/PNG/SVG)
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="font-bold text-slate-300">图纸点位统计</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500 block">总布点数</span>
                    <span className="text-base font-mono font-bold text-blue-400">
                      {pins.length}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <span className="text-slate-500 block">设备总估价</span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      ¥{pins.reduce((sum, p) => sum + p.unitPrice, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL 1: BOM LIST MODAL ================= */}
      {isBOMModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181b22] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 bg-[#14161d] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-extrabold text-white">点位图设备 BOM 清单汇总</h3>
              </div>
              <button
                onClick={() => setIsBOMModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900 text-slate-400 text-[11px] font-bold">
                    <th className="py-2.5 px-3">回路编号</th>
                    <th className="py-2.5 px-3">设备名称</th>
                    <th className="py-2.5 px-3">品牌</th>
                    <th className="py-2.5 px-3">所属空间</th>
                    <th className="py-2.5 px-3">坐标位置</th>
                    <th className="py-2.5 px-3 text-right">单价</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                  {pins.map((pin) => (
                    <tr key={pin.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                        {pin.circuitNumber || 'P'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">{pin.model}</td>
                      <td className="py-2.5 px-3 text-slate-400">{pin.brand}</td>
                      <td className="py-2.5 px-3">{pin.roomName}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        X:{pin.xPercentage}% Y:{pin.yPercentage}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        ¥{pin.unitPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#14161d] border-t border-slate-800 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
              >
                打印清单
              </button>
              <button
                onClick={() => setIsBOMModalOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: GENERATE CAD DELIVERY REPORT ================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">方案点位图施工交底报告已生成</h3>
                  <p className="text-xs text-slate-500">可直接交付水电工长、工程安装团队与业主</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span>项目名称：{selectedPlan?.communityName || '翡翠公园'}全屋智能</span>
                  <span className="text-blue-700">楼层：{activeFloorName}</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  点位总数：{pins.length} 个 | 设备总价值：¥
                  {pins.reduce((sum, p) => sum + p.unitPrice, 0).toLocaleString()}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p>✓ 已包含强电零火线走向预留规范</p>
                <p>✓ 已包含深暗盒 (≥50mm) 及低压磁吸轨道变压器位置标定</p>
                <p>✓ 已包含双轨窗帘电机 220V 电源插座定位点</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print();
                  setIsExportModalOpen(false);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                导出 PDF 施工交底单
              </button>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
