import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Search,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  X,
  Truck,
  PackageCheck,
  Check,
  Edit3,
  FileStack,
  Package,
  Send,
  MoreHorizontal,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  UserCheck,
  User,
  Building2,
  Phone,
  FileEdit,
} from 'lucide-react';
import {
  SavedPlanRecord,
  RenovationProject,
  ShippingTimelineNode,
  UserProfile,
} from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';
import { CustomerRecordInfoModal } from './CustomerRecordInfoModal';

interface SavedPlansViewProps {
  savedPlans: SavedPlanRecord[];
  activeProject: RenovationProject;
  currentUser?: UserProfile;
  onUpdateCurrentUser?: (user: UserProfile) => void;
  onLoadPlan: (plan: SavedPlanRecord) => void;
  onDeletePlan: (planId: string) => void;
  onClonePlan: (plan: SavedPlanRecord) => void;
  onUpdatePlan: (plan: SavedPlanRecord) => void;
  onSaveAsTemplate?: (plan: SavedPlanRecord) => void;
  onOpenSaveModal: () => void;
  onGoToDesign: () => void;
  onGoToTemplates: () => void;
}

export type StageKey = 'all' | 'contact_sales' | 'reviewing' | 'shipping' | 'delivered';

export interface StageInfo {
  step: 1 | 2 | 3 | 4;
  key: 'contact_sales' | 'reviewing' | 'shipping' | 'delivered';
  label: '待对接' | '审核中' | '已发货' | '已签收';
  color: 'slate' | 'blue' | 'emerald';
  badgeBg: string;
  badgeText: string;
  dotBg: string;
  activeRing: string;
  desc: string;
}

export const STAGE_STEPS: {
  step: 1 | 2 | 3 | 4;
  key: 'contact_sales' | 'reviewing' | 'shipping' | 'delivered';
  label: '待对接' | '审核中' | '已发货' | '已签收';
  color: 'slate' | 'blue' | 'emerald';
}[] = [
  { step: 1, key: 'contact_sales', label: '待对接', color: 'slate' },
  { step: 2, key: 'reviewing', label: '审核中', color: 'blue' },
  { step: 3, key: 'shipping', label: '已发货', color: 'blue' },
  { step: 4, key: 'delivered', label: '已签收', color: 'emerald' },
];

export const getPlanStage = (plan: SavedPlanRecord): StageInfo => {
  const status = plan.orderStatus || 'contact_sales';

  if (status === 'delivered' || status === 'completed') {
    return {
      step: 4,
      key: 'delivered',
      label: '已签收',
      color: 'emerald',
      badgeBg: 'bg-emerald-50 border-emerald-200',
      badgeText: 'text-emerald-700',
      dotBg: 'bg-emerald-500',
      activeRing: 'ring-emerald-200',
      desc: '全部设备已完成当面验货并签收，原厂质保已生效',
    };
  }

  if (status === 'shipping' || status === 'packing') {
    return {
      step: 3,
      key: 'shipping',
      label: '已发货',
      color: 'blue',
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-blue-700',
      dotBg: 'bg-blue-500',
      activeRing: 'ring-blue-200',
      desc: '智能设备中心总仓已扫码出库并交付顺丰速运极速派送',
    };
  }

  if (status === 'reviewing' || status === 'submitted' || status === 'locked') {
    return {
      step: 2,
      key: 'reviewing',
      label: '审核中',
      color: 'blue',
      badgeBg: 'bg-blue-50 border-blue-200',
      badgeText: 'text-blue-700',
      dotBg: 'bg-blue-500',
      activeRing: 'ring-blue-200',
      desc: '专属商务经理正在复核设备点位、工程图纸与原厂直供折扣',
    };
  }

  return {
    step: 1,
    key: 'contact_sales',
    label: '待对接',
    color: 'slate',
    badgeBg: 'bg-slate-100 border-slate-200',
    badgeText: 'text-slate-600',
    dotBg: 'bg-slate-400',
    activeRing: 'ring-slate-200',
    desc: '点击填写收货对接信息并提交专属商务核验报价',
  };
};

// Calculate relative time or format date
const formatRelativeTime = (timeStr?: string): string => {
  if (!timeStr) return '更新于 3 天前';
  try {
    const d = new Date(timeStr.replace(/-/g, '/'));
    if (isNaN(d.getTime())) return `更新于 ${timeStr.slice(0, 10)}`;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return '更新于 今天';
    if (diffDays === 1) return '更新于 1 天前';
    if (diffDays <= 30) return `更新于 ${diffDays} 天前`;
    return `更新于 ${timeStr.slice(0, 10)}`;
  } catch {
    return `更新于 ${timeStr.slice(0, 10)}`;
  }
};

// Extract title & clone tag
const parseTitleAndTag = (rawTitle: string): { cleanTitle: string; isClone: boolean } => {
  let cleanTitle = rawTitle;
  let isClone = false;

  if (cleanTitle.includes('(副本)') || cleanTitle.includes('（副本）') || cleanTitle.includes('[副本]')) {
    cleanTitle = cleanTitle.replace(/[\(（\[]副本[\)）\]]/g, '').trim();
    isClone = true;
  } else if (cleanTitle.includes('副本')) {
    cleanTitle = cleanTitle.replace(/副本/g, '').trim();
    isClone = true;
  }

  return { cleanTitle: cleanTitle || rawTitle, isClone };
};

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  savedPlans,
  currentUser = AdminStorageManager.getUserProfile(),
  onUpdateCurrentUser,
  onLoadPlan,
  onDeletePlan,
  onClonePlan,
  onUpdatePlan,
  onSaveAsTemplate,
  onGoToDesign,
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedStage, setSelectedStage] = useState<StageKey>('all');

  // Customer Info Modal State
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);
  const [selectedPlanForCustomerInfo, setSelectedPlanForCustomerInfo] = useState<SavedPlanRecord | null>(null);

  // Menu Dropdown Open State (per plan ID)
  const [activeMenuPlanId, setActiveMenuPlanId] = useState<string | null>(null);

  // Edit / Rename Plan Modal State
  const [editingPlan, setEditingPlan] = useState<SavedPlanRecord | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCommunity, setEditCommunity] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Clone Plan with Custom Name Modal State
  const [cloningPlan, setCloningPlan] = useState<SavedPlanRecord | null>(null);
  const [cloneName, setCloneName] = useState('');

  // Step 1: Contact Sales Modal State
  const [contactSalesPlan, setContactSalesPlan] = useState<SavedPlanRecord | null>(null);
  const [contactName, setContactName] = useState('卫科帆');
  const [contactPhone, setContactPhone] = useState('17696180841');
  const [deliveryAddress, setDeliveryAddress] = useState('北京市朝阳区客户指定收货地址');
  const [orderNotes, setOrderNotes] = useState('需确认双轨窗帘盒尺寸，全套设备顺丰保价发货');

  // Progress Details Modal State (当前进度/物流详情)
  const [trackingPlan, setTrackingPlan] = useState<SavedPlanRecord | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleCopyText = (text: string, label: string = '单号') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(`${label}已复制`);
  };

  // Close 3-dots dropdown when clicked outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuPlanId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter plans based on keyword and stage tab
  const filteredPlans = savedPlans.filter((plan) => {
    const stageInfo = getPlanStage(plan);

    if (selectedStage !== 'all' && stageInfo.key !== selectedStage) {
      return false;
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const match =
        plan.title.toLowerCase().includes(q) ||
        plan.communityName.toLowerCase().includes(q) ||
        (plan.orderStatusLabel && plan.orderStatusLabel.toLowerCase().includes(q)) ||
        (plan.logisticsInfo?.orderNumber && plan.logisticsInfo.orderNumber.toLowerCase().includes(q)) ||
        (plan.logisticsInfo?.trackingNumber && plan.logisticsInfo.trackingNumber.toLowerCase().includes(q)) ||
        (plan.tags && plan.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Open Clone Plan Modal with default name "XXX 副本"
  const handleOpenCloneModal = (plan: SavedPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuPlanId(null);
    setCloningPlan(plan);
    const { cleanTitle } = parseTitleAndTag(plan.title);
    setCloneName(`${cleanTitle} 副本`);
  };

  // Confirm Clone Plan
  const handleConfirmClonePlan = () => {
    if (!cloningPlan || !cloneName.trim()) return;

    const cloned: SavedPlanRecord = {
      ...JSON.parse(JSON.stringify(cloningPlan)),
      id: 'plan_' + Date.now(),
      title: cloneName.trim(),
      createdAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
      updatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
      orderStatus: 'contact_sales',
      orderStatusLabel: '待对接',
      logisticsInfo: undefined,
    };

    onClonePlan(cloned);
    setCloningPlan(null);
    showToast(`已成功创建方案副本【${cloned.title}】`);
  };

  // Open Edit / Rename Modal
  const handleOpenEditPlan = (plan: SavedPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuPlanId(null);
    setEditingPlan(plan);
    setEditTitle(plan.title);
    setEditCommunity(plan.communityName);
    setEditCost(String(plan.totalCostTenThousand));
    setEditNotes(plan.notes || '');
  };

  const handleSaveEditPlan = () => {
    if (!editingPlan || !editTitle.trim()) return;

    const updated: SavedPlanRecord = {
      ...editingPlan,
      title: editTitle.trim(),
      communityName: editCommunity.trim() || editingPlan.communityName,
      totalCostTenThousand: parseFloat(editCost) || editingPlan.totalCostTenThousand,
      notes: editNotes.trim(),
      updatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
    };

    onUpdatePlan(updated);
    setEditingPlan(null);
    showToast('方案信息修改已保存');
  };

  // Save Plan As Template
  const handleSavePlanAsTemplate = (plan: SavedPlanRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onSaveAsTemplate) {
      onSaveAsTemplate(plan);
      showToast(`已将方案【${plan.title}】保存为模板`);
    }
  };

  // Click on entire card -> open tracking/details modal or contact sales
  const handleCardClick = (plan: SavedPlanRecord) => {
    const stage = getPlanStage(plan);
    if (stage.step === 1) {
      setContactSalesPlan(plan);
    } else {
      setTrackingPlan(plan);
    }
  };

  // Confirm Contact Sales
  const handleConfirmContactSales = () => {
    if (!contactSalesPlan) return;

    const generatedOrderNo =
      'ORD' +
      new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      Math.floor(100 + Math.random() * 900);
    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false });

    const timelineNodes: ShippingTimelineNode[] = [
      {
        status: 'contact_sales',
        stepNumber: 1,
        title: '1. 待对接 · 提交采购清单',
        description: `客户【${contactName || '智家用户'}】已提交设备采购清单与对接信息`,
        time: nowTime,
        done: true,
      },
      {
        status: 'reviewing',
        stepNumber: 2,
        title: '2. 审核中 · 商务经理核价与清单确认',
        description: '专属商务 王浩 (186-0010-8899) 已受理，正在核验图纸点位与直供折扣',
        time: '正在审核中...',
        done: false,
        active: true,
      },
      {
        status: 'shipping',
        stepNumber: 3,
        title: '3. 已发货 (待出库分配)',
        description: '智能仓储中心扫码配货并交付顺丰速运极速派送',
        time: '待审核完成后出库',
        done: false,
      },
      {
        status: 'delivered',
        stepNumber: 4,
        title: '4. 已签收 · 派送与当面验货交付',
        description: '送达指定地址，当面开箱清点设备、质保生效',
        time: '待发货派送送达',
        done: false,
      },
    ];

    const updatedPlan: SavedPlanRecord = {
      ...contactSalesPlan,
      status: '已确认方案',
      orderStatus: 'reviewing',
      orderStatusLabel: '审核中',
      contactedBusinessAt: nowTime,
      logisticsInfo: {
        orderNumber: generatedOrderNo,
        carrier: '顺丰速运 (待发货分配)',
        trackingNumber: '待出库分配',
        shippingDate: '预计 1-2 工作日出库',
        estimatedArrivalDate: '预计审核后 2-3 天送达',
        recipientName: contactName || '智家用户',
        recipientPhone: contactPhone || '17696180841',
        shippingAddress: deliveryAddress || '北京市朝阳区客户指定收货地址',
        businessManagerName: '王浩 (专属商务对接经理)',
        businessManagerPhone: '186-0010-8899',
        businessManagerWechat: 'zhijia_wanghao',
        notes: orderNotes,
        currentStepIndex: 1,
        timeline: timelineNodes,
      },
    };

    onUpdatePlan(updatedPlan);
    setContactSalesPlan(null);
    showToast('对接需求已提交，方案进入【审核中】');

    setTimeout(() => {
      setTrackingPlan(updatedPlan);
    }, 250);
  };

  // Step 2 -> Step 3: Approve & Ship
  const handleApproveAndShip = (plan: SavedPlanRecord) => {
    const existingLogistics = plan.logisticsInfo;
    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false });
    const orderNo =
      existingLogistics?.orderNumber ||
      'ORD' +
        new Date().toISOString().slice(0, 10).replace(/-/g, '') +
        Math.floor(100 + Math.random() * 900);
    const sfTrackingNo = 'SF' + Math.floor(100000000000 + Math.random() * 900000000000);

    const timelineNodes: ShippingTimelineNode[] = [
      {
        status: 'contact_sales',
        stepNumber: 1,
        title: '1. 待对接 · 提交采购清单',
        description: `客户【${existingLogistics?.recipientName || '智家用户'}】已提交采购清单`,
        time: existingLogistics?.timeline[0]?.time || nowTime,
        done: true,
      },
      {
        status: 'reviewing',
        stepNumber: 2,
        title: '2. 审核中 · 图纸核算与排期已通过',
        description: '商务经理 王浩 (186-0010-8899) 已完成方案图纸复核与出库签约',
        time: nowTime,
        done: true,
      },
      {
        status: 'shipping',
        stepNumber: 3,
        title: `3. 已发货 (订单号: ${orderNo})`,
        description: `顺丰速运【${sfTrackingNo}】已揽收，正在极速陆运派送中`,
        time: nowTime,
        done: true,
        active: true,
      },
      {
        status: 'delivered',
        stepNumber: 4,
        title: '4. 已签收 · 派送与当面验货交付',
        description: '预计将于明日送达指定地址，请保持电话畅通',
        time: '预计明日 16:00',
        done: false,
      },
    ];

    const updatedPlan: SavedPlanRecord = {
      ...plan,
      status: '施工中',
      orderStatus: 'shipping',
      orderStatusLabel: '已发货',
      logisticsInfo: {
        orderNumber: orderNo,
        carrier: '顺丰速运 (SF-Express)',
        trackingNumber: sfTrackingNo,
        shippingDate: nowTime,
        estimatedArrivalDate: '预计 1-2 日送达',
        recipientName: existingLogistics?.recipientName || '卫科帆',
        recipientPhone: existingLogistics?.recipientPhone || '17696180841',
        shippingAddress: existingLogistics?.shippingAddress || '北京市朝阳区客户指定收货地址',
        businessManagerName: existingLogistics?.businessManagerName || '王浩 (专属商务经理)',
        businessManagerPhone: existingLogistics?.businessManagerPhone || '186-0010-8899',
        businessManagerWechat: existingLogistics?.businessManagerWechat || 'zhijia_wanghao',
        notes: existingLogistics?.notes || '全套智能设备保价发运',
        currentStepIndex: 2,
        timeline: timelineNodes,
      },
    };

    onUpdatePlan(updatedPlan);
    if (trackingPlan?.id === plan.id) {
      setTrackingPlan(updatedPlan);
    }
    showToast(`审核通过！已生成顺丰单号【${sfTrackingNo}】`);
  };

  // Step 3 -> Step 4: Confirm Delivered
  const handleConfirmDelivered = (plan: SavedPlanRecord) => {
    const existingLogistics = plan.logisticsInfo;
    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false });
    const orderNo = existingLogistics?.orderNumber || 'ORD20260819001';
    const sfTrackingNo = existingLogistics?.trackingNumber || 'SF138982847294';

    const timelineNodes: ShippingTimelineNode[] = (existingLogistics?.timeline || []).map((node) => ({
      ...node,
      done: true,
      active: false,
    }));

    const deliveredNodeIndex = timelineNodes.findIndex((n) => n.stepNumber === 4);
    if (deliveredNodeIndex >= 0) {
      timelineNodes[deliveredNodeIndex] = {
        status: 'delivered',
        stepNumber: 4,
        title: '4. 已签收 · 客户当面验货并签收完成',
        description: `快件已送达并由业主【${existingLogistics?.recipientName || '客户'}】本人签收`,
        time: nowTime,
        done: true,
        active: true,
      };
    }

    const updatedPlan: SavedPlanRecord = {
      ...plan,
      status: '施工中',
      orderStatus: 'delivered',
      orderStatusLabel: '已签收',
      logisticsInfo: {
        orderNumber: orderNo,
        carrier: existingLogistics?.carrier || '顺丰速运 (SF-Express)',
        trackingNumber: sfTrackingNo,
        shippingDate: existingLogistics?.shippingDate || '2026-08-20 08:30',
        estimatedArrivalDate: existingLogistics?.estimatedArrivalDate || '已送达',
        deliveredDate: nowTime,
        recipientName: existingLogistics?.recipientName || '卫科帆',
        recipientPhone: existingLogistics?.recipientPhone || '17696180841',
        shippingAddress: existingLogistics?.shippingAddress || '北京市朝阳区客户指定收货地址',
        businessManagerName: existingLogistics?.businessManagerName || '王浩 (专属商务经理)',
        businessManagerPhone: existingLogistics?.businessManagerPhone || '186-0010-8899',
        businessManagerWechat: existingLogistics?.businessManagerWechat || 'zhijia_wanghao',
        notes: existingLogistics?.notes || '全部设备已签收完好',
        currentStepIndex: 3,
        timeline: timelineNodes,
      },
    };

    onUpdatePlan(updatedPlan);
    if (trackingPlan?.id === plan.id) {
      setTrackingPlan(updatedPlan);
    }
    showToast('已确认签收！设备顺利交付');
  };

  return (
    <div className="space-y-3.5 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 7. 搜索框 + 客户信息登记按钮 */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 h-10 bg-white border border-slate-200 rounded-[20px] px-3.5 flex items-center space-x-2 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="搜索方案名称、小区或单号..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full text-xs text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 客户信息按钮 */}
        <button
          onClick={() => {
            setSelectedPlanForCustomerInfo(null);
            setIsCustomerInfoModalOpen(true);
          }}
          className="h-10 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-[20px] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center space-x-1.5 shrink-0"
          title="点击展示和编辑登记客户信息 (小区、联系方式、名称、手输记录)"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>客户信息</span>
        </button>
      </div>

      {/* 3. 筛选 Tab 重构 (全部 / 待对接 / 审核中 / 已发货 / 已签收) - 横向滚动 */}
      <div className="overflow-x-auto no-scrollbar py-0.5 flex items-center space-x-2">
        {[
          { key: 'all' as const, label: '全部' },
          { key: 'contact_sales' as const, label: '待对接' },
          { key: 'reviewing' as const, label: '审核中' },
          { key: 'shipping' as const, label: '已发货' },
          { key: 'delivered' as const, label: '已签收' },
        ].map((tab) => {
          const isActive = selectedStage === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStage(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          /* 空状态：无方案时显示插画 + 文案"还没有方案记录" + 经典深色主按钮 */
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3.5 shadow-2xs my-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mx-auto shadow-2xs">
              <FolderHeart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">还没有方案记录</h4>
              <p className="text-xs text-slate-400">
                {selectedStage !== 'all'
                  ? `暂无处于【${
                      selectedStage === 'contact_sales'
                        ? '待对接'
                        : selectedStage === 'reviewing'
                        ? '审核中'
                        : selectedStage === 'shipping'
                        ? '已发货'
                        : '已签收'
                    }】阶段的方案`
                  : '在工作台完成房间与设备规划后即可保存方案'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-2">
              {selectedStage !== 'all' && (
                <button
                  onClick={() => setSelectedStage('all')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  查看全部
                </button>
              )}
              <button
                onClick={onGoToDesign}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>去定制第一套方案</span>
              </button>
            </div>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const stage = getPlanStage(plan);
            const { cleanTitle, isClone } = parseTitleAndTag(plan.title);
            const isMenuOpen = activeMenuPlanId === plan.id;

            return (
              /* 1. 卡片整体可点击 */
              <div
                key={plan.id}
                onClick={() => handleCardClick(plan)}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-3.5 shadow-2xs hover:shadow-sm transition-all space-y-3 cursor-pointer relative"
              >
                {/* Header Row: Title + Clone Tag + More Menu & Price */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2 space-y-1">
                    {/* Title + 5. 副本标记优化 (从标题中拆出，改为浅灰底圆角11px小Tag) */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <h3 className="text-xs font-extrabold text-slate-900 truncate max-w-[200px]">
                        {cleanTitle}
                      </h3>
                      {isClone && (
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 border border-slate-200/80 rounded-md text-[11px] font-medium leading-none shrink-0">
                          副本
                        </span>
                      )}
                      {/* 9. 状态颜色统一 Tag (无黄色) */}
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border shrink-0 ${stage.badgeBg} ${stage.badgeText}`}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {/* Room & Device Summary */}
                    <p className="text-[11px] text-slate-500 flex items-center space-x-1.5 truncate">
                      <span>📍 {plan.communityName}</span>
                      <span>·</span>
                      <span>{plan.roomsCount} 空间</span>
                      <span>·</span>
                      <span>{plan.deviceCount || 20} 件设备</span>
                    </p>

                    {/* 4. 卡片增加时间信息 (更新于 3 天前，灰色 12px，放在户型信息下方) */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(plan.updatedAt || plan.createdAt)}
                      </p>
                      {/* Customer Info Quick Preview Tag */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanForCustomerInfo(plan);
                          setIsCustomerInfoModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer border border-slate-200/60"
                        title="点击查看/编辑登记客户信息"
                      >
                        <User className="w-2.5 h-2.5 text-slate-500" />
                        <span>客户: {plan.customerName || currentUser?.name || '卫科帆'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Price + 6. 右上角 "⋯" 更多菜单 */}
                  <div className="text-right shrink-0 flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ¥{plan.totalCostTenThousand}万
                        </span>
                        {/* 10. "设备预算"文案改为"方案预估" */}
                        <span className="text-[10px] text-slate-400 block leading-tight">
                          方案预估
                        </span>
                      </div>

                      {/* 6. 右上角 "⋯" 更多菜单按钮 */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuPlanId(isMenuOpen ? null : plan.id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="更多操作"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-fadeIn text-xs">
                            <button
                              onClick={(e) => handleOpenCloneModal(plan, e)}
                              className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>复制方案</span>
                            </button>
                            <button
                              onClick={(e) => handleOpenEditPlan(plan, e)}
                              className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer font-medium"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>重命名/编辑</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 进度改为 4 段迷你横向步骤条 (待对接 → 审核中 → 已发货 → 已签收) */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-150 space-y-1.5">
                  <div className="flex items-center justify-between">
                    {STAGE_STEPS.map((s, sIdx) => {
                      const isCompleted = stage.step > s.step;
                      const isCurrent = stage.step === s.step;

                      return (
                        <React.Fragment key={s.step}>
                          {/* Step Node */}
                          <div className="flex flex-col items-center space-y-1 shrink-0">
                            <div
                              className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                isCompleted
                                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-100'
                                  : isCurrent
                                  ? 'bg-slate-600 text-white ring-2 ring-slate-200'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 stroke-[3]" />
                              ) : isCurrent ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" />
                              ) : (
                                <span>{s.step}</span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-medium whitespace-nowrap ${
                                isCurrent
                                  ? 'font-bold text-slate-700'
                                  : isCompleted
                                  ? 'text-emerald-700 font-semibold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>

                          {/* Connector Line */}
                          {sIdx < STAGE_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-[2px] mx-1 rounded transition-all ${
                                stage.step > s.step ? 'bg-emerald-400' : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* 8. 已发货状态增强 (支持点击复制单号 + 物流详情 >) */}
                  {stage.step >= 3 && plan.logisticsInfo?.trackingNumber && (
                    <div
                      className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>顺丰速运:</span>
                        <span className="font-mono font-bold text-blue-700">
                          {plan.logisticsInfo.trackingNumber}
                        </span>
                        {plan.logisticsInfo.trackingNumber !== '待出库分配' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(plan.logisticsInfo?.trackingNumber || '', '顺丰单号');
                            }}
                            className="p-0.5 text-slate-400 hover:text-blue-700 cursor-pointer"
                            title="复制快递单号"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackingPlan(plan);
                        }}
                        className="text-blue-600 font-bold hover:text-blue-700 flex items-center space-x-0.5 cursor-pointer"
                      >
                        <span>物流详情 &gt;</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. 操作区：同一行展示 导入定制、编辑、删除、复制 (去掉存为模板) */}
                <div
                  className="flex items-center justify-between pt-1.5 border-t border-slate-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {/* 导入定制：小按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadPlan(plan);
                      }}
                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 border border-slate-200/80 shrink-0"
                      title="导入该方案到工作台继续定制"
                    >
                      <SlidersHorizontal className="w-3 h-3 text-slate-700" />
                      <span>导入定制</span>
                    </button>

                    {/* 编辑按钮 */}
                    <button
                      onClick={(e) => handleOpenEditPlan(plan, e)}
                      className="py-1 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
                      title="编辑方案名称与预算"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>编辑</span>
                    </button>

                    {/* 客户信息按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanForCustomerInfo(plan);
                        setIsCustomerInfoModalOpen(true);
                      }}
                      className="py-1 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
                      title="展示与编辑登记客户信息 (客户名称、客户手机号、客户手输记录)"
                    >
                      <UserCheck className="w-3 h-3 text-slate-500" />
                      <span>客户信息</span>
                    </button>
                  </div>

                  {/* 复制方案 */}
                  <button
                    onClick={(e) => handleOpenCloneModal(plan, e)}
                    className="py-1 px-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1 shrink-0"
                    title="复制方案副本"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>复制</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. 复制方案重命名弹窗 (ClonePlanModal) */}
      {cloningPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Copy className="w-4 h-4 text-slate-300" />
                <h3 className="font-extrabold text-sm">创建方案副本</h3>
              </div>
              <button
                onClick={() => setCloningPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  副本方案名称
                </label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="例如：万科翡翠公园 3室2厅 副本"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  将完整复制该方案的空间设备点位与配置，生成独立的新记录。
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => setCloningPlan(null)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmClonePlan}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / RENAME PLAN MODAL */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-slate-300" />
                <h3 className="font-extrabold text-sm">编辑方案记录</h3>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  方案名称
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  所属小区 / 户型
                </label>
                <input
                  type="text"
                  value={editCommunity}
                  onChange={(e) => setEditCommunity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  方案预估 (万元)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editCost}
                  onChange={(e) => setEditCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  需求与备注说明
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none resize-none"
                  placeholder="点位要求或特殊说明..."
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveEditPlan}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: CONTACT SALES MODAL (待对接) */}
      {contactSalesPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200 font-bold rounded text-[10px] border border-slate-700">
                    待对接
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">提交商务对接与核价</span>
                </div>
                <h3 className="font-extrabold text-sm mt-0.5 text-white">{contactSalesPlan.title}</h3>
              </div>
              <button
                onClick={() => setContactSalesPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              {/* Product Breakdown List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-slate-700" />
                    <span>方案产品与设备清单</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    方案预估: <strong className="text-slate-900 font-mono">¥{contactSalesPlan.totalCostTenThousand}万</strong>
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200 max-h-36 overflow-y-auto">
                  <div className="p-2 flex items-center justify-between text-[11px]">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center space-x-1">
                        <span className="px-1 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">弱电核心</span>
                        <span className="font-bold text-slate-900">全屋智能多模中枢网关 Hub</span>
                      </div>
                      <p className="text-[10px] text-slate-400">PoE/有线双频智能主机</p>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">x1</span>
                  </div>

                  <div className="p-2 flex items-center justify-between text-[11px]">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center space-x-1">
                        <span className="px-1 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">全屋照明</span>
                        <span className="font-bold text-slate-900">智能开关面板与调光驱动模块</span>
                      </div>
                      <p className="text-[10px] text-slate-400">零火控制 / 0.1%深调光</p>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">x{contactSalesPlan.roomsCount * 2}</span>
                  </div>

                  <div className="p-2 flex items-center justify-between text-[11px]">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center space-x-1">
                        <span className="px-1 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">窗帘遮阳</span>
                        <span className="font-bold text-slate-900">超静音智能开合帘电机套装</span>
                      </div>
                      <p className="text-[10px] text-slate-400">直流静音电机与定制导轨</p>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">x3</span>
                  </div>
                </div>
              </div>

              {/* Contact Info Form */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <h4 className="font-extrabold text-xs text-slate-900">收货与对接信息</h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">联系人</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">手机号码</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none font-mono focus:bg-white focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">收货详细地址</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">对接需求备注 (选填)</label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 outline-none resize-none focus:bg-white focus:border-slate-900"
                    placeholder="如：双轨窗帘盒尺寸、特定安装时间等..."
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2 shrink-0">
              <button
                onClick={() => setContactSalesPlan(null)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmContactSales}
                className="flex-2 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center justify-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>确认提交商务对接</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS / LOGISTICS DETAILS MODAL */}
      {trackingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPlanStage(trackingPlan).badgeBg} ${getPlanStage(trackingPlan).badgeText}`}>
                    {getPlanStage(trackingPlan).label}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">方案交付与物流详情</span>
                </div>
                <h3 className="font-extrabold text-sm text-white mt-0.5">{trackingPlan.title}</h3>
              </div>
              <button
                onClick={() => setTrackingPlan(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Step Progress Bar in Modal */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-4 gap-1.5">
                {STAGE_STEPS.map((s) => {
                  const currentStep = getPlanStage(trackingPlan).step;
                  const isDone = currentStep >= s.step;
                  const isCurrent = currentStep === s.step;

                  return (
                    <div
                      key={s.step}
                      className={`text-center py-1.5 px-1 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-700 text-white font-bold border-slate-700 shadow-2xs'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-200'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] block truncate">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 text-xs overflow-y-auto flex-1">
              {/* Key Credentials Card */}
              {trackingPlan.logisticsInfo && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">订单编号</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 font-mono">
                        {trackingPlan.logisticsInfo.orderNumber}
                      </span>
                      <button
                        onClick={() =>
                          handleCopyText(trackingPlan.logisticsInfo?.orderNumber || '', '订单号')
                        }
                        className="p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
                        title="复制订单号"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {getPlanStage(trackingPlan).step >= 3 && (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">承运快递</span>
                        <span className="font-bold text-slate-900">
                          {trackingPlan.logisticsInfo.carrier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">顺丰快递单号</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-blue-700 font-mono">
                            {trackingPlan.logisticsInfo.trackingNumber}
                          </span>
                          {trackingPlan.logisticsInfo.trackingNumber !== '待出库分配' && (
                            <button
                              onClick={() =>
                                handleCopyText(
                                  trackingPlan.logisticsInfo?.trackingNumber || '',
                                  '顺丰单号'
                                )
                              }
                              className="p-1 text-slate-400 hover:text-blue-700 cursor-pointer"
                              title="复制快递单号"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">专属商务</span>
                    <span className="text-slate-800 font-medium">
                      {trackingPlan.logisticsInfo.businessManagerName} (
                      {trackingPlan.logisticsInfo.businessManagerPhone})
                    </span>
                  </div>

                  <div className="flex items-start justify-between text-[11px]">
                    <span className="text-slate-500 font-medium shrink-0 mr-2">收货信息</span>
                    <span className="text-slate-800 text-right">
                      {trackingPlan.logisticsInfo.recipientName} (
                      {trackingPlan.logisticsInfo.recipientPhone})<br />
                      {trackingPlan.logisticsInfo.shippingAddress}
                    </span>
                  </div>
                </div>
              )}

              {/* Timeline Nodes */}
              {trackingPlan.logisticsInfo?.timeline && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>进度节点记录</span>
                  </h4>

                  <div className="space-y-3 pl-1 border-l-2 border-slate-200 ml-2.5">
                    {trackingPlan.logisticsInfo.timeline.map((node, idx) => (
                      <div key={idx} className="relative pl-4 space-y-0.5">
                        <div
                          className={`absolute -left-[9px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                            node.done
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : node.active
                              ? 'bg-blue-500 ring-2 ring-blue-200 animate-pulse'
                              : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-xs ${
                              node.done
                                ? 'text-slate-900'
                                : node.active
                                ? 'text-blue-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {node.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{node.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {node.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2 shrink-0">
              {getPlanStage(trackingPlan).step === 2 && (
                <button
                  onClick={() => handleApproveAndShip(trackingPlan)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>审核通过并生成顺丰单号发货</span>
                </button>
              )}

              {getPlanStage(trackingPlan).step === 3 && (
                <button
                  onClick={() => handleConfirmDelivered(trackingPlan)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>确认客户已验货签收</span>
                </button>
              )}

              <button
                onClick={() => setTrackingPlan(null)}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 客户信息展示与登记弹窗 (CustomerRecordInfoModal) */}
      <CustomerRecordInfoModal
        isOpen={isCustomerInfoModalOpen}
        onClose={() => {
          setIsCustomerInfoModalOpen(false);
          setSelectedPlanForCustomerInfo(null);
        }}
        initialCustomer={
          selectedPlanForCustomerInfo
            ? {
                id: selectedPlanForCustomerInfo.id,
                name: selectedPlanForCustomerInfo.customerName || currentUser?.name || '卫科帆',
                phone: selectedPlanForCustomerInfo.customerPhone || currentUser?.phone || '17696180841',
                community: selectedPlanForCustomerInfo.communityName || currentUser?.communityName || '万科翡翠公园',
                customNotes: selectedPlanForCustomerInfo.customerNotes || currentUser?.customNotes || '',
                auditStatus: currentUser?.auditStatus || 'pending',
                auditFeedback: currentUser?.auditFeedback,
                assignedTo: currentUser?.consultantName,
                avatar: currentUser?.avatar,
                createdAt: selectedPlanForCustomerInfo.createdAt,
                updatedAt: selectedPlanForCustomerInfo.updatedAt,
              }
            : undefined
        }
        planTitle={selectedPlanForCustomerInfo?.title}
        onSaveSuccess={(updatedCustomer) => {
          // If we edited for a specific plan, update the plan's fields too
          if (selectedPlanForCustomerInfo) {
            const updatedPlan: SavedPlanRecord = {
              ...selectedPlanForCustomerInfo,
              customerName: updatedCustomer.name,
              customerPhone: updatedCustomer.phone,
              communityName: updatedCustomer.community || selectedPlanForCustomerInfo.communityName,
              customerNotes: updatedCustomer.customNotes,
              updatedAt: new Date().toISOString(),
            };
            onUpdatePlan(updatedPlan);
          }

          // If current user callback exists, update user profile as well
          if (onUpdateCurrentUser && currentUser) {
            onUpdateCurrentUser({
              ...currentUser,
              name: updatedCustomer.name,
              phone: updatedCustomer.phone,
              communityName: updatedCustomer.community,
              customNotes: updatedCustomer.customNotes,
            });
          }

          showToast('客户信息已同步并保存至后台');
        }}
      />
    </div>
  );
};
