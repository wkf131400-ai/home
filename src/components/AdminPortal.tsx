import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Save,
  CheckCircle2,
  Search,
  Smartphone,
  Cpu,
  FolderTree,
  Tag,
  Info,
  X,
  Box,
  Building2,
  Filter,
  Check,
  Layers,
  Wrench,
  Sliders,
  Settings,
  HelpCircle,
  FileText,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  SlidersHorizontal,
  Minus,
  Users,
  UserCheck,
  FolderKanban,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  BookOpen,
  GraduationCap,
  Sparkles,
  Share2,
} from 'lucide-react';
import {
  LayoutPreset,
  EquipmentProduct,
  LayoutRoomSchemeConfig,
  RoomSchemeDeviceItem,
  RoomItem,
  Customer,
  FollowUpRecord,
  CustomerStatus,
} from '../types';
import { AdminStorageManager } from '../utils/adminStorage';
import { CustomerPool } from './crm/CustomerPool';
import { MyCustomers } from './crm/MyCustomers';
import { CustomerDetailView } from './crm/CustomerDetailView';
import { AdminQuickQuoteWizard } from './admin/AdminQuickQuoteWizard';
import { ManualProductQuotation } from './admin/ManualProductQuotation';
import { FloorPlanPointDesigner } from './admin/FloorPlanPointDesigner';
import { CustomerAuditCenter } from './crm/CustomerAuditCenter';

interface AdminPortalProps {
  onSwitchToApp: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onSwitchToApp }) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<
    | 'customerPool'
    | 'myCustomers'
    | 'customerAudit'
    | 'customerDetail'
    | 'quickQuote'
    | 'manualQuote'
    | 'pointConfig'
    | 'layoutPresets'
    | 'roomSmartSchemes'
    | 'equipmentCatalog'
  >('customerPool');

  // Nav Accordion Toggles
  const [customerNavOpen, setCustomerNavOpen] = useState(true);
  const [schemeNavOpen, setSchemeNavOpen] = useState(true);

  // CRM State loaded from Storage Manager
  const [customers, setCustomers] = useState<Customer[]>(() => AdminStorageManager.getCustomers());
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(() => AdminStorageManager.getFollowUps());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(() => customers[0] || null);

  // Scheme Engineering State loaded from Storage Manager
  const [layoutPresets, setLayoutPresets] = useState<LayoutPreset[]>(() => AdminStorageManager.getLayoutPresets());
  const [equipmentProducts, setEquipmentProducts] = useState<EquipmentProduct[]>(() => AdminStorageManager.getEquipmentProducts());
  const [layoutRoomSchemes, setLayoutRoomSchemes] = useState<LayoutRoomSchemeConfig[]>(() => AdminStorageManager.getLayoutRoomSchemes());

  // Search & Filter State
  const [selectedLayoutPresetId, setSelectedLayoutPresetId] = useState<string>(() => layoutPresets[0]?.id || 'preset_medium_3room');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');

  // Toast Notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // CRM Handlers
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setActiveTab('customerDetail');
  };

  const handleAddCustomer = (newCust: Customer) => {
    const updated = [newCust, ...customers];
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);

    const initFu: FollowUpRecord = {
      id: `fu_${Date.now()}`,
      customerId: newCust.id,
      time: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 8)}`,
      method: '创建客户',
      matter: `卫科帆创建客户【${newCust.name}】${newCust.isPool ? '入客户池' : ''}`,
      result: '-',
      type: '日志',
      operator: '卫科帆',
    };
    const updatedFu = [initFu, ...followUps];
    setFollowUps(updatedFu);
    AdminStorageManager.saveFollowUps(updatedFu);

    showToast(`客户【${newCust.name}】已成功添加`);
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    const updated = customers.map((c) => (c.id === updatedCust.id ? updatedCust : c));
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);
    if (selectedCustomer?.id === updatedCust.id) {
      setSelectedCustomer(updatedCust);
    }
    showToast(`客户【${updatedCust.name}】信息已更新`);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const updated = customers.filter((c) => c.id !== customerId);
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(updated[0] || null);
      setActiveTab('customerPool');
    }
    showToast('客户已删除');
  };

  const handleAddFollowUpRecord = (record: FollowUpRecord) => {
    const updatedFu = [record, ...followUps];
    setFollowUps(updatedFu);
    AdminStorageManager.saveFollowUps(updatedFu);

    if (selectedCustomer && selectedCustomer.id === record.customerId) {
      const updatedCust: Customer = {
        ...selectedCustomer,
        followUpStatus: record.method === '更新客户状态' ? record.result : record.time.slice(5, 16),
        updatedAt: record.time.slice(5, 16),
      };
      handleUpdateCustomer(updatedCust);
    }
    showToast('跟进记录已成功添加');
  };

  const handleBatchAssign = (targetSalesperson: string, selectedIds: string[]) => {
    const updated = customers.map((c) => {
      if (selectedIds.includes(c.id)) {
        return {
          ...c,
          salesperson: targetSalesperson,
          isPool: false,
          updatedAt: '08-18 16:30',
        };
      }
      return c;
    });
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);

    const newLogs: FollowUpRecord[] = selectedIds.map((id, idx) => {
      const cust = customers.find((c) => c.id === id);
      return {
        id: `fu_${Date.now()}_${idx}`,
        customerId: id,
        time: '2026-08-18 16:30:00',
        method: '指派客户',
        matter: `卫科帆 将项目客户[${cust?.projectName || '智能方案'}] 指派给 ${targetSalesperson}`,
        result: '-',
        type: '日志',
        operator: '卫科帆',
      };
    });
    const updatedFu = [...newLogs, ...followUps];
    setFollowUps(updatedFu);
    AdminStorageManager.saveFollowUps(updatedFu);

    showToast(`已成功将 ${selectedIds.length} 位客户指派给 ${targetSalesperson}`);
  };

  const handleBatchChangeStatus = (status: CustomerStatus, selectedIds: string[]) => {
    const updated = customers.map((c) => {
      if (selectedIds.includes(c.id)) {
        return {
          ...c,
          status,
          updatedAt: '08-18 16:30',
        };
      }
      return c;
    });
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);
    showToast(`已将 ${selectedIds.length} 位客户状态批量变更为【${status}】`);
  };

  const handleBatchDelete = (selectedIds: string[]) => {
    const updated = customers.filter((c) => !selectedIds.includes(c.id));
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);
    showToast(`已成功删除 ${selectedIds.length} 位客户`);
  };

  const handleToggleShare = (customerId: string) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return { ...c, isShared: !c.isShared };
      }
      return c;
    });
    setCustomers(updated);
    AdminStorageManager.saveCustomers(updated);
    showToast('客户共享状态已切换');
  };

  const categoryNamesMap: Record<RoomItem['category'] | 'weak_box', string> = {
    living: '客厅',
    bedroom: '卧室',
    dining: '餐厅',
    kitchen: '厨房',
    bathroom: '卫生间',
    study: '书房',
    balcony: '阳台',
    entrance: '玄关/入户',
    other: '多功能房/其他',
    weak_box: '弱电箱 / 机房核心',
  };

  const productCategoriesList = [
    '智能网关/中控',
    '智能面板/开关',
    '无线AP/网络',
    '交换机/网络',
    '智能窗帘/电机',
    '智能门锁/安防',
    '传感器/雷达',
    '环境控制/温控',
    '背景音乐/影音',
  ];

  // ---------------------------------------------------------------------------
  // 1. Layout Presets CRUD (No Budget involved)
  // ---------------------------------------------------------------------------
  const [editingPreset, setEditingPreset] = useState<LayoutPreset | null>(null);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPreset) return;

    let updatedList: LayoutPreset[];
    const exists = layoutPresets.some((p) => p.id === editingPreset.id);

    if (exists) {
      updatedList = layoutPresets.map((p) => (p.id === editingPreset.id ? editingPreset : p));
    } else {
      updatedList = [editingPreset, ...layoutPresets];
    }

    setLayoutPresets(updatedList);
    AdminStorageManager.saveLayoutPresets(updatedList);
    setIsPresetModalOpen(false);
    setEditingPreset(null);
    showToast(`户型模板「${editingPreset.title}」配置已保存！`);
  };

  const handleDeletePreset = (id: string, title: string) => {
    if (window.confirm(`确定要删除户型模板「${title}」吗？`)) {
      const updated = layoutPresets.filter((p) => p.id !== id);
      setLayoutPresets(updated);
      AdminStorageManager.saveLayoutPresets(updated);
      showToast(`已删除户型模板「${title}」`);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Equipment Product Catalog CRUD
  // ---------------------------------------------------------------------------
  const [editingProduct, setEditingProduct] = useState<EquipmentProduct | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    let updatedList: EquipmentProduct[];
    const exists = equipmentProducts.some((p) => p.id === editingProduct.id);

    if (exists) {
      updatedList = equipmentProducts.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    } else {
      updatedList = [editingProduct, ...equipmentProducts];
    }

    setEquipmentProducts(updatedList);
    AdminStorageManager.saveEquipmentProducts(updatedList);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast(`设备产品「${editingProduct.model}」保存成功！`);
  };

  const handleDeleteProduct = (id: string, model: string) => {
    if (window.confirm(`确定要从设备库中删除产品「${model}」吗？`)) {
      const updated = equipmentProducts.filter((p) => p.id !== id);
      setEquipmentProducts(updated);
      AdminStorageManager.saveEquipmentProducts(updated);
      showToast(`已删除设备产品「${model}」`);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. Layout Room Smart Schemes & Device Allocation
  // ---------------------------------------------------------------------------
  const [editingRoomScheme, setEditingRoomScheme] = useState<LayoutRoomSchemeConfig | null>(null);
  const [isRoomSchemeModalOpen, setIsRoomSchemeModalOpen] = useState(false);

  // Picker Modal for Adding Equipment to a Room Scheme
  const [pickingForSchemeId, setPickingForSchemeId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState('all');

  const handleAddDeviceToRoomScheme = (schemeId: string, product: EquipmentProduct) => {
    const updatedSchemes = layoutRoomSchemes.map((scheme) => {
      if (scheme.id !== schemeId) return scheme;

      const existingIdx = scheme.devices.findIndex((d) => d.productId === product.id);
      let newDevices = [...scheme.devices];

      if (existingIdx >= 0) {
        newDevices[existingIdx].qty += 1;
      } else {
        newDevices.push({
          id: `dev_inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          brand: product.brand,
          model: product.model,
          category: product.category,
          qty: 1,
          unit: product.unit,
          unitPrice: product.price,
          imageUrl: product.imageUrl,
          installationNotes: product.installationNotes,
        });
      }

      return { ...scheme, devices: newDevices };
    });

    setLayoutRoomSchemes(updatedSchemes);
    AdminStorageManager.saveLayoutRoomSchemes(updatedSchemes);
    showToast(`已将「${product.model}」配置进该空间方案！`);
  };

  const handleUpdateDeviceQty = (schemeId: string, deviceId: string, delta: number) => {
    const updatedSchemes = layoutRoomSchemes.map((scheme) => {
      if (scheme.id !== schemeId) return scheme;

      const newDevices = scheme.devices
        .map((d) => {
          if (d.id !== deviceId) return d;
          const newQty = d.qty + delta;
          return newQty > 0 ? { ...d, qty: newQty } : null;
        })
        .filter(Boolean) as RoomSchemeDeviceItem[];

      return { ...scheme, devices: newDevices };
    });

    setLayoutRoomSchemes(updatedSchemes);
    AdminStorageManager.saveLayoutRoomSchemes(updatedSchemes);
  };

  const handleDeleteDeviceFromScheme = (schemeId: string, deviceId: string) => {
    const updatedSchemes = layoutRoomSchemes.map((scheme) => {
      if (scheme.id !== schemeId) return scheme;
      return {
        ...scheme,
        devices: scheme.devices.filter((d) => d.id !== deviceId),
      };
    });

    setLayoutRoomSchemes(updatedSchemes);
    AdminStorageManager.saveLayoutRoomSchemes(updatedSchemes);
    showToast('已移除该房间项下的设备型号');
  };

  const handleSaveRoomSchemeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoomScheme) return;

    let updatedList: LayoutRoomSchemeConfig[];
    const exists = layoutRoomSchemes.some((s) => s.id === editingRoomScheme.id);

    if (exists) {
      updatedList = layoutRoomSchemes.map((s) => (s.id === editingRoomScheme.id ? editingRoomScheme : s));
    } else {
      updatedList = [editingRoomScheme, ...layoutRoomSchemes];
    }

    setLayoutRoomSchemes(updatedList);
    AdminStorageManager.saveLayoutRoomSchemes(updatedList);
    setIsRoomSchemeModalOpen(false);
    setEditingRoomScheme(null);
    showToast(`房间方案「${editingRoomScheme.roomName}」更新成功！`);
  };

  const handleDeleteRoomScheme = (schemeId: string, roomName: string) => {
    if (window.confirm(`确定要从该户型中移除空间「${roomName}」的默认智能方案吗？`)) {
      const updated = layoutRoomSchemes.filter((s) => s.id !== schemeId);
      setLayoutRoomSchemes(updated);
      AdminStorageManager.saveLayoutRoomSchemes(updated);
      showToast(`已删除空间方案「${roomName}」`);
    }
  };

  // Restore All System Defaults
  const handleRestoreSystemDefaults = () => {
    if (window.confirm('确定要恢复 Web 后台所有模板方案与设备产品库到工程初始默认值吗？')) {
      AdminStorageManager.restoreAllDefaults();
      setLayoutPresets(AdminStorageManager.getLayoutPresets());
      setEquipmentProducts(AdminStorageManager.getEquipmentProducts());
      setLayoutRoomSchemes(AdminStorageManager.getLayoutRoomSchemes());
      showToast('全套配置已恢复为工程系统初始标准！');
    }
  };

  // Filtered room schemes for current active layout preset
  const activeLayoutPreset = layoutPresets.find((p) => p.id === selectedLayoutPresetId) || layoutPresets[0];
  const activeRoomSchemes = layoutRoomSchemes.filter((s) => s.layoutPresetId === selectedLayoutPresetId);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans w-full selection:bg-blue-600 selection:text-white">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 border border-slate-700 animate-fadeIn text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Engineering Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-5 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-sm tracking-tight text-white font-mono">
                智家云平台 · 全屋智能工程后台
              </h1>
              <span className="bg-blue-950 text-blue-300 border border-blue-700/60 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                ERP Pro v3.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              客户池 & 我的客户 CRM 全流程跟进、户型智能方案设计与设备库
            </p>
          </div>
        </div>

        {/* Action Tools & Status */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>试用会员剩余 3 天</span>
          </div>

          <div className="flex items-center space-x-2 text-slate-300 px-2 py-1 bg-slate-800/80 rounded-lg border border-slate-700 text-[11px]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">卫科帆 (老板/管理员)</span>
            <span className="text-slate-400">• 厦门吉物科技</span>
          </div>

          <button
            onClick={handleRestoreSystemDefaults}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="重置恢复初始测试数据"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>重置数据</span>
          </button>

          <button
            onClick={onSwitchToApp}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm border border-blue-500 text-xs font-bold transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>切换至 C 端 App 预览</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full max-w-full">
        {/* Left Professional ERP Navigation Sidebar */}
        <aside className="w-60 bg-white border-r border-slate-200 p-3 shrink-0 flex flex-col justify-between space-y-4 select-none">
          <div className="space-y-3">
            {/* 工作台 (Top Entry) */}
            <button
              onClick={() => setActiveTab('customerPool')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>工作台</span>
            </button>

            {/* 1. 客户管理 (Customer Management Menu) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setCustomerNavOpen(!customerNavOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>客户管理</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${customerNavOpen ? '' : '-rotate-90'}`} />
              </button>

              {customerNavOpen && (
                <div className="pl-3 space-y-0.5 pt-0.5 border-l border-slate-100 ml-4">
                  {/* 客户审核中心 */}
                  <button
                    onClick={() => setActiveTab('customerAudit')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'customerAudit'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>客户审核中心</span>
                    </div>
                    {customers.filter((c) => (c.auditStatus || 'pending') === 'pending').length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono">
                        {customers.filter((c) => (c.auditStatus || 'pending') === 'pending').length}
                      </span>
                    )}
                  </button>

                  {/* 客户池 */}
                  <button
                    onClick={() => setActiveTab('customerPool')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'customerPool'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>客户池</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {customers.filter((c) => c.isPool).length}
                    </span>
                  </button>

                  {/* 我的客户 */}
                  <button
                    onClick={() => setActiveTab('myCustomers')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'myCustomers'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>我的客户</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {customers.filter((c) => !c.isPool).length}
                    </span>
                  </button>

                  {/* Other CRM placeholders */}
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">客户字段</div>
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">搜索字段</div>
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">渠道客户</div>
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">零售客户</div>
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">门店预约</div>
                  <div className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">设置</div>
                </div>
              )}
            </div>

            {/* 2. 方案管理 (Scheme Management Menu) */}
            <div className="space-y-0.5">
              <button
                onClick={() => setSchemeNavOpen(!schemeNavOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-blue-600" />
                  <span>方案管理</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${schemeNavOpen ? '' : '-rotate-90'}`} />
              </button>

              {schemeNavOpen && (
                <div className="pl-3 space-y-0.5 pt-0.5 border-l border-slate-100 ml-4">
                  {/* 1. 快速报价 (整体流程和小程序差不多) */}
                  <button
                    onClick={() => setActiveTab('quickQuote')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'quickQuote'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>快速报价</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                      向导
                    </span>
                  </button>

                  {/* 2. 手输与选配报价 (完全手输选择产品 - 参考图一) */}
                  <button
                    onClick={() => setActiveTab('manualQuote')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'manualQuote'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>手输与选配报价</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                      图一
                    </span>
                  </button>

                  {/* 3. 点位图与灯光CAD (选择方案拖动产品到户型图 - 参考图二) */}
                  <button
                    onClick={() => setActiveTab('pointConfig')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'pointConfig'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>点位图与灯光CAD</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      图二
                    </span>
                  </button>

                  {/* 户型空间模板配置 */}
                  <button
                    onClick={() => setActiveTab('layoutPresets')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'layoutPresets'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>户型空间模板配置</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {layoutPresets.length}
                    </span>
                  </button>

                  {/* 户型 - 房间默认方案 */}
                  <button
                    onClick={() => setActiveTab('roomSmartSchemes')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'roomSmartSchemes'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>房间默认智能方案</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {layoutRoomSchemes.length}
                    </span>
                  </button>

                  {/* 设备产品页 / 产品库 */}
                  <button
                    onClick={() => setActiveTab('equipmentCatalog')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      activeTab === 'equipmentCatalog'
                        ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span>设备产品页 / 产品库</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {equipmentProducts.length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Other System Menus */}
            <div className="space-y-1 pt-1 border-t border-slate-100 text-slate-500 text-xs">
              <div className="px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer">项目管理(新)</div>
              <div className="px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer">项目管理</div>
              <div className="px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer">库存管理</div>
              <div className="px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer">采购管理</div>
              <div className="px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer">售后管理</div>
              <div className="px-3 py-1.5 hover:bg-slate-50 rounded cursor-pointer">产品管理</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 text-slate-500 text-[11px] space-y-1">
            <div className="flex items-center space-x-1 font-bold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>智家工程交付后台</span>
            </div>
            <p className="text-slate-400">已连接本地实时持久化存储</p>
          </div>
        </aside>

        {/* Right Main Engineering Workspace */}
        <main
          className={`flex-1 overflow-y-auto min-h-[calc(100vh-60px)] flex flex-col ${
            activeTab === 'manualQuote' || activeTab === 'pointConfig'
              ? 'p-0 bg-[#1e232d]'
              : 'p-5 space-y-4 bg-slate-100'
          }`}
        >
          {/* TAB: 快速报价 (向导流程和小程序一致) */}
          {activeTab === 'quickQuote' && (
            <AdminQuickQuoteWizard
              onCompleteQuotation={(record) => {
                showToast(`报价方案【${record.title}】已成功生成！`);
                setActiveTab('customerPool');
              }}
              onCancel={() => setActiveTab('customerPool')}
            />
          )}

          {/* TAB: 完全手输与选配报价 (参考图一) */}
          {activeTab === 'manualQuote' && (
            <ManualProductQuotation
              onSaveQuotation={(record) => {
                showToast(`手输报价单【${record.title}】已保存！`);
              }}
              onOpenPointDesigner={(planId) => {
                setActiveTab('pointConfig');
              }}
              onExit={() => setActiveTab('customerPool')}
            />
          )}

          {/* TAB: 点位图与灯光CAD (选择方案拖动产品到户型图 - 参考图二) */}
          {activeTab === 'pointConfig' && (
            <FloorPlanPointDesigner
              onExit={() => setActiveTab('customerPool')}
            />
          )}

          {/* TAB: 客户审核中心 */}
          {activeTab === 'customerAudit' && (
            <CustomerAuditCenter
              customers={customers}
              onUpdateCustomer={handleUpdateCustomer}
              onSelectCustomer={handleSelectCustomer}
              onShowToast={showToast}
            />
          )}

          {/* TAB: 客户池 (Image 1) */}
          {activeTab === 'customerPool' && (
            <CustomerPool
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              onBatchAssign={handleBatchAssign}
              onBatchChangeStatus={handleBatchChangeStatus}
              onBatchDelete={handleBatchDelete}
            />
          )}

          {/* TAB: 我的客户 (Image 4) */}
          {activeTab === 'myCustomers' && (
            <MyCustomers
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              onBatchAssign={handleBatchAssign}
              onBatchChangeStatus={handleBatchChangeStatus}
              onBatchDelete={handleBatchDelete}
              onToggleShare={handleToggleShare}
            />
          )}

          {/* TAB: 客户详情 & 跟进记录 (Image 2 & Image 6) */}
          {activeTab === 'customerDetail' && selectedCustomer && (
            <CustomerDetailView
              customer={selectedCustomer}
              followUps={followUps}
              onBack={() => setActiveTab(selectedCustomer.isPool ? 'customerPool' : 'myCustomers')}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddFollowUp={handleAddFollowUpRecord}
            />
          )}

          {/* TAB 1: 户型空间模板配置 */}
          {activeTab === 'layoutPresets' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-blue-600" />
                    <span>户型 / 空间模板方案配置</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    管理全屋智能推荐的各大户型（如小户型、中户型、大平层、复式别墅）与其默认包含的空间构成列表。（不涉及预算字段）
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingPreset({
                      id: `layout_preset_${Date.now()}`,
                      title: '新建标准户型方案',
                      subtitle: '适合全屋智能标准化设计',
                      categoryTag: 'medium',
                      categoryLabel: '中户型',
                      roomNames: ['玄关', '客厅', '主卧', '次卧', '厨房', '卫生间', '阳台'],
                      suggestedMinBudget: 0,
                      suggestedMaxBudget: 0,
                    });
                    setIsPresetModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加户型模板</span>
                </button>
              </div>

              {/* Grid of Presets */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {layoutPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-2xs space-y-3 relative transition-all group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                            {preset.categoryLabel || preset.categoryTag}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900">{preset.title}</h3>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setEditingPreset({ ...preset });
                              setIsPresetModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="修改编辑"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.id, preset.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="删除模板"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">{preset.subtitle}</p>

                      {/* Room Badges list */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                          <span>包含空间构成清单:</span>
                          <span className="font-mono text-blue-600 text-[10px]">{preset.roomNames.length} 个房间</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {preset.roomNames.map((r, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>户型ID: {preset.id}</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> 方案有效
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 户型与房间默认智能方案 (Bound to Layout + Concrete Models & Quantities) */}
          {activeTab === 'roomSmartSchemes' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                      <span>户型与房间默认智能方案（含具体设备型号与数量）</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      选择对应的户型方案，配置该户型下各个房间的默认智能控制回路与具体设备硬件明细（型号、配图、数量及施工注意点）。
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingRoomScheme({
                        id: `lrs_${Date.now()}`,
                        layoutPresetId: selectedLayoutPresetId,
                        roomCategory: 'living',
                        roomName: '新加房间/空间',
                        title: '新加空间智能方案',
                        description: '智能照明与环境控制方案',
                        lightingCircuits: 2,
                        dimmableCircuits: 1,
                        curtainType: 'open_close',
                        devices: [],
                      });
                      setIsRoomSchemeModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>为该户型新增房间方案</span>
                  </button>
                </div>

                {/* Layout Preset Selector Top Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      切换选择对应户型:
                    </span>
                    <select
                      value={selectedLayoutPresetId}
                      onChange={(e) => setSelectedLayoutPresetId(e.target.value)}
                      className="bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      {layoutPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          【{p.title}】 ({p.categoryLabel || p.categoryTag}) - {p.roomNames.length} 个空间
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeLayoutPreset && (
                    <div className="flex items-center space-x-4 text-xs font-mono text-slate-600">
                      <span>包含空间: <strong className="text-slate-900 font-bold">{activeRoomSchemes.length} 个配置项</strong></span>
                      <span>
                        包含设备总数: {' '}
                        <strong className="text-blue-600 font-bold">
                          {activeRoomSchemes.reduce(
                            (acc, room) => acc + room.devices.reduce((dAcc, d) => dAcc + d.qty, 0),
                            0
                          )}{' '}
                          件
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* List of Rooms inside this Layout Preset */}
              <div className="space-y-4">
                {activeRoomSchemes.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                    <Info className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">该户型暂未配置房间默认智能方案</p>
                    <p className="text-[11px] text-slate-500">点击右上角「为该户型新增房间方案」进行配置</p>
                  </div>
                ) : (
                  activeRoomSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
                    >
                      {/* Room Scheme Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center space-x-3">
                          <span className="font-extrabold text-xs text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                            {categoryNamesMap[scheme.roomCategory] || scheme.roomCategory} · {scheme.roomName}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{scheme.title}</h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingRoomScheme({ ...scheme });
                              setIsRoomSchemeModalOpen(true);
                            }}
                            className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>修改空间参数</span>
                          </button>

                          <button
                            onClick={() => handleDeleteRoomScheme(scheme.id, scheme.roomName)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="移除此空间"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Room Spec Badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span>
                          💡 <b>灯光回路:</b> {scheme.lightingCircuits} 路 (调光 {scheme.dimmableCircuits} 路)
                        </span>
                        <span className="text-slate-300">|</span>
                        <span>
                          🪟 <b>窗帘控制:</b>{' '}
                          {scheme.curtainType === 'open_close' ? '电动开合帘' : scheme.curtainType === 'roller' ? '卷帘/百叶' : '无'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500">{scheme.description}</span>
                      </div>

                      {/* Concrete Equipment Models & Quantities Table */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                            <Box className="w-4 h-4 text-blue-600" />
                            配置的硬件设备型号与数量列表 ({scheme.devices.length} 项):
                          </span>

                          <button
                            onClick={() => {
                              setPickingForSchemeId(scheme.id);
                              setPickerSearch('');
                              setPickerCategoryFilter('all');
                            }}
                            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ 从设备产品库选择添加</span>
                          </button>
                        </div>

                        {scheme.devices.length === 0 ? (
                          <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-500 text-center">
                            未配置任何具体设备型号。请点击「+ 从设备产品库选择添加」为该房间配置硬件。
                          </div>
                        ) : (
                          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                                <tr>
                                  <th className="py-2 px-3">配图</th>
                                  <th className="py-2 px-3">设备型号与品牌</th>
                                  <th className="py-2 px-3">设备类型</th>
                                  <th className="py-2 px-3 text-center">数量</th>
                                  <th className="py-2 px-3 text-right">参考单价</th>
                                  <th className="py-2 px-3 text-right">小计</th>
                                  <th className="py-2 px-3">施工注意点 (现场规范)</th>
                                  <th className="py-2 px-3 text-center">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {scheme.devices.map((device) => (
                                  <tr key={device.id} className="hover:bg-blue-50/30">
                                    <td className="py-2 px-3">
                                      <img
                                        src={device.imageUrl}
                                        alt={device.model}
                                        className="w-8 h-8 rounded object-cover bg-slate-100 border border-slate-200 shrink-0"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <div className="font-bold text-slate-900">{device.model}</div>
                                      <div className="text-[10px] text-blue-700 font-bold">{device.brand}</div>
                                    </td>
                                    <td className="py-2 px-3 text-slate-600">{device.category}</td>
                                    <td className="py-2 px-3 text-center">
                                      <div className="inline-flex items-center space-x-1.5 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono font-bold">
                                        <button
                                          onClick={() => handleUpdateDeviceQty(scheme.id, device.id, -1)}
                                          className="text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-slate-900">
                                          {device.qty} {device.unit}
                                        </span>
                                        <button
                                          onClick={() => handleUpdateDeviceQty(scheme.id, device.id, 1)}
                                          className="text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-slate-900">
                                      ¥{device.unitPrice.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                                      ¥{(device.unitPrice * device.qty).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-3 max-w-xs text-[11px] text-slate-500 truncate" title={device.installationNotes}>
                                      {device.installationNotes || '无特殊注意点'}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <button
                                        onClick={() => handleDeleteDeviceFromScheme(scheme.id, device.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                        title="从该房间移除"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 设备产品页 / 设备产品库 (Equipment Product Page) */}
          {activeTab === 'equipmentCatalog' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-600" />
                    <span>设备产品库管理（型号、配图、参考价格、安装注意点、设备类型）</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    统一录入与管理全屋智能硬件设备字典，用于分配至各大房间智能方案中。
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `prod_${Date.now()}`,
                      model: 'Aqara 智家新一代智能面板',
                      brand: '绿米 Aqara',
                      category: '智能面板/开关',
                      price: 380,
                      unit: '个',
                      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=300&auto=format&fit=crop&q=60',
                      installationNotes: '1. 必须预留 86 型暗盒；\n2. 预留强电零火线(N+L)；\n3. 离地高度推荐 1.3 米。',
                      description: '触控显示，场景联动与无极调光控制。',
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ 新增设备产品</span>
                </button>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="搜索型号、品牌、安装注意点或分类..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white font-medium"
                  />
                </div>

                {/* Category Dropdown Select */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    设备型号分类筛选:
                  </span>
                  <select
                    value={selectedProductCategory}
                    onChange={(e) => setSelectedProductCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">全部分类 ({equipmentProducts.length})</option>
                    {productCategoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({equipmentProducts.filter((p) => p.category === cat).length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Equipment Product Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {equipmentProducts
                  .filter((p) => selectedProductCategory === 'all' || p.category === selectedProductCategory)
                  .filter(
                    (p) =>
                      !productSearchQuery ||
                      p.model.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.brand.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.installationNotes.toLowerCase().includes(productSearchQuery.toLowerCase())
                  )
                  .map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-2xs space-y-3 relative transition-all group flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.imageUrl}
                              alt={product.model}
                              className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
                            />
                            <div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                                {product.category}
                              </span>
                              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 leading-snug">
                                {product.model}
                              </h3>
                              <p className="text-[11px] font-bold text-blue-700">{product.brand}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...product });
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="编辑产品"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.model)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="删除产品"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price & Unit Box */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">参考预算单价:</span>
                          <span className="font-mono text-sm font-extrabold text-slate-900">
                            ¥{product.price.toLocaleString()}{' '}
                            <span className="text-xs font-normal text-slate-500">/ {product.unit}</span>
                          </span>
                        </div>

                        {/* Installation Notes Box (High Priority) */}
                        <div className="bg-amber-50/90 p-2.5 rounded-lg border border-amber-200/90 text-xs text-amber-900 space-y-1">
                          <div className="flex items-center space-x-1 font-bold text-amber-900 text-[11px]">
                            <Wrench className="w-3 h-3 text-amber-700" />
                            <span>施工与安装注意点:</span>
                          </div>
                          <p className="text-[11px] leading-relaxed whitespace-pre-line text-amber-900/90 font-mono">
                            {product.installationNotes || '暂无施工规范要求'}
                          </p>
                        </div>

                        {product.description && (
                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                        <span>编号: {product.id}</span>
                        <span className="text-blue-600 font-bold">可引入方案算量</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------------------------------
          MODAL 1: Edit Layout Preset Modal (No Budget fields)
      --------------------------------------------------------------------------- */}
      {isPresetModalOpen && editingPreset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">配置户型/空间模板方案</h3>
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePreset} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">户型模板名称</label>
                <input
                  type="text"
                  required
                  value={editingPreset.title}
                  onChange={(e) => setEditingPreset({ ...editingPreset, title: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-semibold outline-none"
                  placeholder="如: 三室两厅标准智能户型"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">适用类型 / 副标题描述</label>
                <input
                  type="text"
                  value={editingPreset.subtitle}
                  onChange={(e) => setEditingPreset({ ...editingPreset, subtitle: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-medium outline-none"
                  placeholder="如: 适合 90-120㎡ 标准家庭全屋智能规划"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">分类标签</label>
                <select
                  value={editingPreset.categoryTag}
                  onChange={(e) =>
                    setEditingPreset({
                      ...editingPreset,
                      categoryTag: e.target.value as any,
                      categoryLabel: e.target.options[e.target.selectedIndex].text,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-medium outline-none cursor-pointer"
                >
                  <option value="small">小户型(1-2居)</option>
                  <option value="medium">中户型(3居)</option>
                  <option value="large">大户型(4居+)</option>
                  <option value="villa">复式/别墅</option>
                  <option value="commercial">商业/办公</option>
                </select>
              </div>

              {/* Room Names Tag Editor */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-700 block">包含空间构成列表</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 min-h-[60px]">
                  {editingPreset.roomNames.map((roomName, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-slate-800 border border-slate-300 px-2 py-1 rounded text-xs font-bold flex items-center space-x-1 shadow-2xs"
                    >
                      <span>{roomName}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPreset({
                            ...editingPreset,
                            roomNames: editingPreset.roomNames.filter((_, i) => i !== idx),
                          })
                        }
                        className="hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="输入要加入的空间名称 (如: 影音室)"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (roomNameInput.trim()) {
                        setEditingPreset({
                          ...editingPreset,
                          roomNames: [...editingPreset.roomNames, roomNameInput.trim()],
                        });
                        setRoomNameInput('');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer shrink-0"
                  >
                    添加房间
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>保存户型模板</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          MODAL 2: Equipment Product Modal (Model, Brand, Category, Image, Price, Notes)
      --------------------------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-8">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                <span>配置设备产品明细（设备产品页）</span>
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">设备型号 *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.model}
                    onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-bold outline-none"
                    placeholder="如: Aqara 智能网关 M3 Pro"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">品牌 *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-medium outline-none"
                    placeholder="如: 绿米 Aqara, 华为, 锐捷"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">设备类型 *</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-medium outline-none cursor-pointer"
                  >
                    {productCategoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">参考价格 (元) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">计量单位 *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-medium outline-none"
                    placeholder="台 / 个 / 套 / 把"
                  />
                </div>
              </div>

              {/* Product Image URL & Sample Picker */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">产品配图图片链接 (URL)</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={editingProduct.imageUrl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 text-xs font-mono outline-none"
                    placeholder="https://..."
                  />
                  {editingProduct.imageUrl && (
                    <img
                      src={editingProduct.imageUrl}
                      alt="Preview"
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Installation Notes (Crucial requirement) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>安装注意点与施工规范 (Installation Notes) *</span>
                  <span className="text-[10px] text-amber-700 font-normal">现场工长与电工关注</span>
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.installationNotes}
                  onChange={(e) => setEditingProduct({ ...editingProduct, installationNotes: e.target.value })}
                  className="w-full bg-amber-50/50 border border-amber-300/80 focus:border-amber-600 rounded-lg p-2.5 text-slate-900 font-mono text-xs outline-none leading-relaxed"
                  placeholder="如: 1. 必须预留86深暗盒与强电零火线;&#10;2. 调光驱动电源留天花检修口;&#10;3. 六类网线屏蔽接地。"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">设备功能与规格描述</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg p-2.5 text-slate-900 text-xs outline-none"
                  placeholder="简单描述功能特性与适配场景..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>保存设备产品</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          MODAL 3: Edit Room Smart Scheme Modal (Room parameters)
      --------------------------------------------------------------------------- */}
      {isRoomSchemeModalOpen && editingRoomScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">修改房间默认智能方案参数</h3>
              <button
                onClick={() => setIsRoomSchemeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoomSchemeModal} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">名称 *</label>
                <input
                  type="text"
                  required
                  value={editingRoomScheme.title || editingRoomScheme.roomName}
                  onChange={(e) =>
                    setEditingRoomScheme({
                      ...editingRoomScheme,
                      title: e.target.value,
                      roomName: e.target.value,
                    })
                  }
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 font-bold outline-none"
                  placeholder="如: 客厅智能调光与影音联动方案"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">房间方案描述 *</label>
                <textarea
                  rows={3}
                  required
                  value={editingRoomScheme.description}
                  onChange={(e) => setEditingRoomScheme({ ...editingRoomScheme, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg p-2.5 text-slate-900 text-xs outline-none leading-relaxed"
                  placeholder="输入该房间智能方案的具体功能与控制描述..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRoomSchemeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-2xs cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>保存空间参数</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          MODAL 4: Product Picker Modal (Pick equipment from Catalog to add into room scheme)
      --------------------------------------------------------------------------- */}
      {pickingForSchemeId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Box className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">从设备产品库中选择添加至该空间方案</h3>
              </div>
              <button
                onClick={() => setPickingForSchemeId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search & Filter */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索产品型号、品牌或功能..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <select
                value={pickerCategoryFilter}
                onChange={(e) => setPickerCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-bold outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="all">全部分类 ({equipmentProducts.length})</option>
                {productCategoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Product List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
              {equipmentProducts
                .filter((p) => pickerCategoryFilter === 'all' || p.category === pickerCategoryFilter)
                .filter(
                  (p) =>
                    !pickerSearch ||
                    p.model.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    p.brand.toLowerCase().includes(pickerSearch.toLowerCase())
                )
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.model}
                        className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200 shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">{prod.model}</div>
                        <div className="text-[11px] text-blue-700 font-bold flex items-center space-x-2">
                          <span>{prod.brand}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-normal">{prod.category}</span>
                        </div>
                        {prod.installationNotes && (
                          <div className="text-[10px] text-amber-800 line-clamp-1 font-mono">
                            工序: {prod.installationNotes.split('\n')[0]}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        ¥{prod.price.toLocaleString()} /{prod.unit}
                      </span>
                      <button
                        onClick={() => handleAddDeviceToRoomScheme(pickingForSchemeId, prod)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>加入配置</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setPickingForSchemeId(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs cursor-pointer"
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
