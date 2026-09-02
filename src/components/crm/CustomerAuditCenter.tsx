import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  User,
  Building2,
  Phone,
  FileEdit,
  UserCheck,
  Check,
  X,
  AlertCircle,
  Calendar,
  Sparkles,
  Send,
  MessageSquare,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Customer, UserProfile } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';

interface CustomerAuditCenterProps {
  customers: Customer[];
  onUpdateCustomer: (customer: Customer) => void;
  onSelectCustomer: (customer: Customer) => void;
  onShowToast: (msg: string) => void;
}

export const CustomerAuditCenter: React.FC<CustomerAuditCenterProps> = ({
  customers,
  onUpdateCustomer,
  onSelectCustomer,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [keyword, setKeyword] = useState('');
  const [selectedAuditCustomer, setSelectedAuditCustomer] = useState<Customer | null>(null);

  // Modal State for Approval/Rejection
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [assignedConsultant, setAssignedConsultant] = useState('王浩 (高级智能家居顾问)');
  const [auditFeedback, setAuditFeedback] = useState('');

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const status = c.auditStatus || 'pending';
    if (activeTab !== 'all' && status !== activeTab) {
      return false;
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.community && c.community.toLowerCase().includes(q)) ||
        (c.projectName && c.projectName.toLowerCase().includes(q)) ||
        (c.customNotes && c.customNotes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const pendingCount = customers.filter((c) => (c.auditStatus || 'pending') === 'pending').length;
  const approvedCount = customers.filter((c) => c.auditStatus === 'approved').length;
  const rejectedCount = customers.filter((c) => c.auditStatus === 'rejected').length;

  const handleOpenActionModal = (customer: Customer, type: 'approve' | 'reject') => {
    setSelectedAuditCustomer(customer);
    setActionType(type);
    if (type === 'approve') {
      setAssignedConsultant(customer.assignedTo || '王浩 (高级智能家居顾问)');
      setAuditFeedback('客户信息与方案意向初审通过，已指派专业商务经理对接实地勘测。');
    } else {
      setAuditFeedback('客户填写的户型或联系方式有误，请补充完整后重新提交。');
    }
  };

  const handleConfirmAction = () => {
    if (!selectedAuditCustomer || !actionType) return;

    const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
    const updatedCustomer: Customer = {
      ...selectedAuditCustomer,
      auditStatus: newStatus,
      assignedTo: actionType === 'approve' ? assignedConsultant : selectedAuditCustomer.assignedTo,
      auditFeedback: auditFeedback.trim(),
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };

    onUpdateCustomer(updatedCustomer);

    // Also sync to current user profile if phone matches
    try {
      const currentProfile = AdminStorageManager.getUserProfile();
      if (
        currentProfile &&
        (currentProfile.phone === selectedAuditCustomer.phone ||
          currentProfile.name === selectedAuditCustomer.name)
      ) {
        const updatedProfile: UserProfile = {
          ...currentProfile,
          auditStatus: newStatus,
          auditFeedback: auditFeedback.trim(),
          consultantName: actionType === 'approve' ? assignedConsultant : undefined,
        };
        AdminStorageManager.saveUserProfile(updatedProfile);
      }
    } catch {
      // ignore
    }

    onShowToast(
      actionType === 'approve'
        ? `客户【${selectedAuditCustomer.name}】审核已通过，并已指派商务【${assignedConsultant}】`
        : `客户【${selectedAuditCustomer.name}】已驳回审核`
    );

    setActionType(null);
    setSelectedAuditCustomer(null);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-white">客户注册与方案审核中心 (Web端)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            实时审核 App 端新注册的客户档案、小区信息、联系方式与手输需求记录，一键完成资质认证与商务分配。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">待审核客户</span>
            <span className="text-sm font-black text-blue-400 font-mono">{pendingCount} 位</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-medium">已通过客户</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{approvedCount} 位</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { key: 'pending' as const, label: `待审核 (${pendingCount})` },
              { key: 'approved' as const, label: `已通过 (${approvedCount})` },
              { key: 'rejected' as const, label: `已驳回 (${rejectedCount})` },
              { key: 'all' as const, label: `全部客户 (${customers.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索客户名称、电话、小区或手输记录..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Customer Audit List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">暂无符合条件的审核记录</h4>
            <p className="text-xs text-slate-400">客户在 App 端注册或提交方案后将自动同步至此列表</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const auditStatus = cust.auditStatus || 'pending';

            return (
              <div
                key={cust.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-2xs space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Customer Info */}
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={
                        cust.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={cust.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-extrabold text-sm text-slate-900">{cust.name}</span>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {cust.phone}
                        </span>

                        {/* Audit Badge */}
                        {auditStatus === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>待 Web 端商务审核</span>
                          </span>
                        )}
                        {auditStatus === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>审核通过 (已指派商务: {cust.assignedTo || '王浩'})</span>
                          </span>
                        )}
                        {auditStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>已驳回</span>
                          </span>
                        )}
                      </div>

                      {/* Community & Project Info */}
                      <div className="flex items-center space-x-3 text-xs text-slate-600 flex-wrap gap-y-1">
                        <span className="flex items-center space-x-1 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>客户小区: {cust.community || cust.projectName || '万科翡翠公园'}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">登记时间: {cust.createdAt || '刚刚'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    {auditStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOpenActionModal(cust, 'approve')}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>通过并指派商务</span>
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(cust, 'reject')}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>驳回</span>
                        </button>
                      </>
                    )}

                    {auditStatus !== 'pending' && (
                      <button
                        onClick={() => handleOpenActionModal(cust, 'approve')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        重新审核 / 修改指派
                      </button>
                    )}

                    <button
                      onClick={() => onSelectCustomer(cust)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>查看详情</span>
                    </button>
                  </div>
                </div>

                {/* Customer Manual Notes Box (手输记录) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500">
                    <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                    <span>客户手输记录 / 需求备忘:</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {cust.customNotes || cust.memo || '客户注册时暂未填写附加手输记录'}
                  </p>

                  {cust.auditFeedback && (
                    <div className="pt-1.5 mt-1.5 border-t border-slate-200/60 flex items-start space-x-1.5 text-[11px] text-slate-600">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-700">后台审核意见: </span>
                        <span>{cust.auditFeedback}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Approval / Rejection Action Modal */}
      {actionType && selectedAuditCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {actionType === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h3 className="font-extrabold text-sm">
                  {actionType === 'approve' ? '客户审核通过与商务指派' : '驳回客户审核'}
                </h3>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4.5 space-y-3.5 text-xs">
              {/* Customer Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedAuditCustomer.name}
                  </span>
                  <span className="font-mono text-slate-600 font-bold">
                    {selectedAuditCustomer.phone}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  小区: {selectedAuditCustomer.community || selectedAuditCustomer.projectName}
                </p>
                {selectedAuditCustomer.customNotes && (
                  <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                    手输记录: {selectedAuditCustomer.customNotes}
                  </p>
                )}
              </div>

              {actionType === 'approve' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    指派负责商务经理 / 顾问 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={assignedConsultant}
                    onChange={(e) => setAssignedConsultant(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-800"
                  >
                    <option value="王浩 (高级智能家居顾问)">王浩 (高级智能家居顾问)</option>
                    <option value="李雷 (华北区商务经理)">李雷 (华北区商务经理)</option>
                    <option value="韩梅梅 (全屋照明方案专家)">韩梅梅 (全屋照明方案专家)</option>
                    <option value="张伟 (工程交付主管)">张伟 (工程交付主管)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  审核意见与客户反馈说明
                </label>
                <textarea
                  rows={3}
                  value={auditFeedback}
                  onChange={(e) => setAuditFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none resize-none leading-relaxed focus:border-slate-800"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => setActionType(null)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-2 py-2 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1 ${
                  actionType === 'approve'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{actionType === 'approve' ? '确认通过审核' : '确认驳回'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
