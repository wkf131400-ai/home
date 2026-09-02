import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Building2,
  Phone,
  User,
  FileEdit,
  Save,
  CheckCircle2,
  Tag,
  Clock,
  Sparkles,
  Layers,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { SavedPlanRecord, UserProfile, Customer } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';

export interface CustomerInfoData {
  id?: string;
  name: string;
  phone: string;
  community?: string;
  customNotes?: string;
  auditStatus?: 'pending' | 'certified' | 'rejected' | 'approved';
  auditFeedback?: string;
  assignedTo?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerRecordInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  activePlan?: SavedPlanRecord | null;
  initialCustomer?: CustomerInfoData;
  planTitle?: string;
  onUpdateCurrentUser?: (updated: UserProfile) => void;
  onUpdatePlan?: (updatedPlan: SavedPlanRecord) => void;
  onSaveSuccess?: (customer: CustomerInfoData) => void;
  onCustomerSaved?: (info: {
    communityName: string;
    phone: string;
    name: string;
    notes: string;
  }) => void;
}

export const CustomerRecordInfoModal: React.FC<CustomerRecordInfoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activePlan,
  initialCustomer,
  planTitle,
  onUpdateCurrentUser,
  onUpdatePlan,
  onSaveSuccess,
  onCustomerSaved,
}) => {
  // Form fields: Customer Name, Customer Phone, Customer Records
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [communityName, setCommunityName] = useState('');

  const [isEditing, setIsEditing] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Initial load
  useEffect(() => {
    if (isOpen) {
      const name =
        initialCustomer?.name ||
        activePlan?.customerName ||
        currentUser?.name ||
        '卫科帆';
      const phone =
        initialCustomer?.phone ||
        activePlan?.customerPhone ||
        currentUser?.phone ||
        '17696180841';
      const notes =
        initialCustomer?.customNotes ||
        activePlan?.customerNotes ||
        currentUser?.customNotes ||
        '客户对全屋智能照明与开合帘调光有强烈意向，关注方案性价比与售后保障，预约下周现场量房。';
      const community =
        initialCustomer?.community ||
        activePlan?.communityName ||
        currentUser?.communityName ||
        '万科翡翠公园';

      setCustomerName(name);
      setCustomerPhone(phone);
      setCustomerNotes(notes);
      setCommunityName(community);
      setShowSuccessToast(false);
    }
  }, [isOpen, activePlan, initialCustomer, currentUser]);

  if (!isOpen) return null;

  const currentPlanTitle =
    planTitle || activePlan?.title || (communityName ? `${communityName} · 专属定制方案` : '全屋智能方案');
  const currentCost = activePlan?.totalCostTenThousand;
  const currentRooms = activePlan?.roomsCount;

  const quickTags = [
    '全屋磁吸调光',
    '中央空调集中控制',
    '双轨电动开合帘',
    '老人起夜微光照明',
    '周末预约现场勘测',
    '预算敏感型',
    '要求顺丰保价发货',
  ];

  const handleQuickInsertTag = (tagText: string) => {
    if (customerNotes.includes(tagText)) return;
    setCustomerNotes((prev) => (prev ? `${prev}；${tagText}` : tagText));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = customerName.trim() || '客户';
    const trimmedPhone = customerPhone.trim() || '17696180841';
    const trimmedNotes = customerNotes.trim();
    const trimmedCommunity = communityName.trim() || '万科翡翠公园';

    const customerData: CustomerInfoData = {
      id: initialCustomer?.id || activePlan?.id || `cust_${Date.now()}`,
      name: trimmedName,
      phone: trimmedPhone,
      community: trimmedCommunity,
      customNotes: trimmedNotes,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
    };

    // 1. Update UserProfile
    if (currentUser) {
      const updatedProfile: UserProfile = {
        ...currentUser,
        name: trimmedName,
        phone: trimmedPhone,
        communityName: trimmedCommunity,
        customNotes: trimmedNotes,
      };
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedProfile);
      }
      AdminStorageManager.saveUserProfile(updatedProfile);
    }

    // 2. If activePlan provided, update it
    if (activePlan && onUpdatePlan) {
      const updatedPlan: SavedPlanRecord = {
        ...activePlan,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
        communityName: trimmedCommunity,
        customerNotes: trimmedNotes,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
      };
      onUpdatePlan(updatedPlan);
    }

    // 3. Sync to CRM Customer Database so Admin Web Portal also sees it
    try {
      const existingCustomers = AdminStorageManager.getCustomers();
      const existingIdx = existingCustomers.findIndex(
        (c) => c.phone === trimmedPhone || c.name === trimmedName
      );

      const nowTime = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16);

      if (existingIdx >= 0) {
        const updatedList = [...existingCustomers];
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          name: trimmedName,
          phone: trimmedPhone,
          projectName: trimmedCommunity,
          detailAddress: `${trimmedCommunity} 专属定制方案`,
          remark: trimmedNotes,
          customNotes: trimmedNotes,
          updatedAt: nowTime,
        };
        AdminStorageManager.saveCustomers(updatedList);
      } else {
        const newCustomer: Customer = {
          id: `cust_${Date.now()}`,
          code: `CUST-${String(existingCustomers.length + 1).padStart(3, '0')}`,
          name: trimmedName,
          projectName: trimmedCommunity,
          phone: trimmedPhone,
          followUpStatus: '已登记客户信息',
          status: '意向客户',
          deliveryStatus: '未交付',
          priceGrade: '高端级别',
          salesperson: '专属商务顾问',
          creator: '方案工作台',
          createdAt: nowTime,
          updatedAt: nowTime,
          isPool: false,
          region: '北京-朝阳',
          detailAddress: `${trimmedCommunity} 现场登记`,
          source: '方案记录登记',
          level: 'VIP客户',
          category: '家装客户',
          remark: trimmedNotes,
          customNotes: trimmedNotes,
        };
        AdminStorageManager.saveCustomers([newCustomer, ...existingCustomers]);
      }
    } catch (err) {
      console.error('Failed to sync customer to CRM', err);
    }

    if (onSaveSuccess) {
      onSaveSuccess(customerData);
    }

    if (onCustomerSaved) {
      onCustomerSaved({
        communityName: trimmedCommunity,
        phone: trimmedPhone,
        name: trimmedName,
        notes: trimmedNotes,
      });
    }

    setToastMsg('客户信息与记录已成功保存！');
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="customer-record-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="customer-record-info-modal-content"
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between relative shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">方案客户信息与记录</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[260px]">
                所属方案: {currentPlanTitle}
              </p>
            </div>
          </div>

          <button
            id="btn-close-customer-modal"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Toast */}
          {showSuccessToast && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center space-x-2 animate-fadeIn font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 方案归属指示卡片 */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <span className="text-[11px] font-extrabold text-slate-800 truncate">
                  {currentPlanTitle}
                </span>
              </div>
              {currentCost !== undefined && (
                <span className="text-[11px] font-black text-blue-600 font-mono shrink-0 ml-2">
                  ¥{currentCost}万
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-[10px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span>{communityName || '定制小区'}</span>
              </span>
              {currentRooms !== undefined && (
                <span className="flex items-center space-x-1">
                  <Layers className="w-3 h-3 text-slate-400" />
                  <span>{currentRooms} 空间</span>
                </span>
              )}
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-700 font-medium">已建档</span>
              </span>
            </div>
          </div>

          {/* Form: 1. 客户名称 2. 客户手机号 3. 客户记录 */}
          <form onSubmit={handleSave} className="space-y-3.5">
            {/* 1. 客户名称 */}
            <div>
              <label
                htmlFor="input-customer-name"
                className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between"
              >
                <span className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>客户名称</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400">业主/方案归属人</span>
              </label>
              <div className="flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-slate-800 transition-colors">
                <input
                  id="input-customer-name"
                  type="text"
                  placeholder="请输入客户名称 (如: 卫科帆 / 张先生)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-transparent outline-none font-medium"
                  required
                />
              </div>
            </div>

            {/* 2. 客户手机号 */}
            <div>
              <label
                htmlFor="input-customer-phone"
                className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between"
              >
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>客户手机号</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">11位联系电话</span>
              </label>
              <div className="flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-slate-800 transition-colors">
                <input
                  id="input-customer-phone"
                  type="tel"
                  placeholder="请输入客户手机号 (如: 17696180841)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs text-slate-900 bg-transparent outline-none font-mono"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            {/* 3. 客户记录 (手输) */}
            <div>
              <label
                htmlFor="textarea-customer-notes"
                className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between"
              >
                <span className="flex items-center space-x-1.5">
                  <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                  <span>客户记录</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {customerNotes.length}/300 字
                </span>
              </label>

              {/* Quick Tags Insertion */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2">
                <span className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  <span>快捷记录:</span>
                </span>
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickInsertTag(tag)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus-within:bg-white focus-within:border-slate-800 transition-colors">
                <textarea
                  id="textarea-customer-notes"
                  rows={4}
                  placeholder="请在此手输记录客户偏好、方案要求、现场勘测细节或商务沟通备忘..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-transparent outline-none resize-none leading-relaxed"
                  maxLength={300}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between space-x-2 shrink-0">
          <button
            id="btn-cancel-customer-modal"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            取消
          </button>

          <button
            id="btn-save-customer-modal"
            type="button"
            onClick={() => handleSave()}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-200" />
            <span>保存客户信息与记录</span>
          </button>
        </div>
      </div>
    </div>
  );
};
