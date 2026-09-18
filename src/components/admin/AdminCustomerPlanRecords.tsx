import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Search,
  MessageSquare,
  Truck,
  Eye,
  Send,
  User,
  Phone,
  Building2,
  X,
  Clock,
  CheckCircle2,
  Bot,
  FileText,
} from 'lucide-react';
import { SavedPlanRecord, PlanChatMessage, Customer } from '../../types';

interface AdminCustomerPlanRecordsProps {
  plans: SavedPlanRecord[];
  customers: Customer[];
  onUpdatePlan: (plan: SavedPlanRecord) => void;
  onDeletePlan?: (planId: string) => void;
  onConvertToTemplate?: (plan: SavedPlanRecord) => void;
  onNavigateToCustomer?: (customerName: string, customerPhone?: string) => void;
}

export const AdminCustomerPlanRecords: React.FC<AdminCustomerPlanRecordsProps> = ({
  plans,
  onUpdatePlan,
}) => {
  // Search strictly by customer phone and community name
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Plan for Modals
  const [activeChatPlan, setActiveChatPlan] = useState<SavedPlanRecord | null>(null);
  const [activeBomPlan, setActiveBomPlan] = useState<SavedPlanRecord | null>(null);
  const [activeLogisticsPlan, setActiveLogisticsPlan] = useState<SavedPlanRecord | null>(null);

  // New Chat Message Input State (in Chat Drawer)
  const [newChatContent, setNewChatContent] = useState('');

  // Stats: 3 clean metrics
  const stats = useMemo(() => {
    const total = plans.length;
    const withChat = plans.filter((p) => (p.chatHistory || []).length > 0).length;
    const inFulfillment = plans.filter(
      (p) => p.orderStatus === 'shipping' || p.orderStatus === 'delivered' || p.orderStatus === 'reviewing'
    ).length;
    return { total, withChat, inFulfillment };
  }, [plans]);

  // Filtered plans: strictly 客户手机号; 小区名称搜索 (不存在状态筛选)
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const phoneStr = (plan.customerPhone || '17696180841').toLowerCase();
        const matchPhone = phoneStr.includes(q);
        const matchComm = (plan.communityName || '').toLowerCase().includes(q);
        if (!matchPhone && !matchComm) {
          return false;
        }
      }
      return true;
    });
  }, [plans, searchQuery]);

  // Send message in chat drawer (no sender role dropdown)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatPlan || !newChatContent.trim()) return;

    const newMsg: PlanChatMessage = {
      id: `chat_msg_${Date.now()}`,
      role: 'assistant',
      senderName: 'AI 方案架构师',
      content: newChatContent.trim(),
      timestamp: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
    };

    const updatedHistory = [...(activeChatPlan.chatHistory || []), newMsg];
    const updatedPlan: SavedPlanRecord = {
      ...activeChatPlan,
      chatHistory: updatedHistory,
      updatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
    };

    onUpdatePlan(updatedPlan);
    setActiveChatPlan(updatedPlan);
    setNewChatContent('');
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800">
      {/* 1. Page Header & KPI Cards (NO Add/Create button; NO total output value) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <FolderKanban className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    所有客户的方案记录
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                    {plans.length} 份方案
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  集中查阅所有客户提交的全屋智能方案、预算设备清单、与客户的即时对话沟通历史及发货履约进度
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards (Removed 累计方案总产值) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-500">方案记录总数</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{stats.total} 份</div>
          </div>
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>含客户对话记录</span>
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1 font-mono">{stats.withChat} 份</div>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              <span>履约发货中方案</span>
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1 font-mono">{stats.inFulfillment} 份</div>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar (Explicit Search: 客户手机号 / 小区名称) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按客户手机号、小区名称搜索..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Result Count Badge */}
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>共筛选出 <strong className="text-slate-900 font-mono text-sm">{filteredPlans.length}</strong> 份客户方案记录</span>
        </div>
      </div>

      {/* 3. Main Plans Table (Enlarged font structure, spacious padding, comprehensive data) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold select-none text-xs">
                <th className="py-4 px-5 w-72">方案信息 / 小区</th>
                <th className="py-4 px-5 w-52">所属客户</th>
                <th className="py-4 px-5 w-36 text-right">造价预估</th>
                <th className="py-4 px-5 w-36">空间 / 设备</th>
                <th className="py-4 px-5 w-72">客户对话沟通记录</th>
                <th className="py-4 px-5 w-44">履约与物流进度</th>
                <th className="py-4 px-5 w-36 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-base text-slate-600">未找到符合条件的方案记录</p>
                    <p className="text-xs text-slate-400 mt-1">请输入正确的客户手机号或小区名称搜索</p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan) => {
                  const chatCount = (plan.chatHistory || []).length;
                  const lastMessage = chatCount > 0 ? plan.chatHistory![chatCount - 1] : null;

                  return (
                    <tr
                      key={plan.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => setActiveChatPlan(plan)}
                    >
                      {/* 1. Plan Title & Community */}
                      <td className="py-4 px-5">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                            <FolderKanban className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                              {plan.title}
                            </div>
                            <div className="flex items-center space-x-1.5 text-sm text-slate-600 mt-1 font-medium">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{plan.communityName}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">{plan.cityName || '北京'}</span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              户型: {plan.presetTitle || '标准户型'} · {plan.createdAt}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. 所属客户 (Name on top, Mobile Phone below; NO VIP) */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-base">
                            {plan.customerName || '未登记姓名'}
                          </div>
                          <div className="text-sm font-mono text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{plan.customerPhone || '17696180841'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. 造价预估 */}
                      <td className="py-4 px-5 text-right">
                        <div className="font-mono">
                          <span className="text-lg font-black text-blue-600">
                            {plan.totalCostTenThousand}
                          </span>
                          <span className="text-xs font-bold text-slate-500 ml-1">万元</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          ¥{(plan.totalCostYuan || (plan.totalCostTenThousand || 0) * 10000).toLocaleString()}
                        </div>
                      </td>

                      {/* 4. 空间 / 设备 */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 font-mono text-sm">
                          {plan.roomsCount || plan.project?.rooms?.length || 4} 个规划空间
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          共 {plan.deviceCount || 20} 件智能硬件
                        </div>
                      </td>

                      {/* 5. 客户对话沟通记录 (Prominent & Clear) */}
                      <td className="py-4 px-5" onClick={(e) => { e.stopPropagation(); setActiveChatPlan(plan); }}>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/60 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 font-black text-xs text-blue-700">
                              <MessageSquare className="w-4 h-4" />
                              <span>对话沟通记录</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                              chatCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {chatCount} 条消息
                            </span>
                          </div>

                          {lastMessage ? (
                            <div className="mt-1.5 text-xs text-slate-700 leading-relaxed line-clamp-2">
                              <span className="font-bold text-slate-800">{lastMessage.senderName}: </span>
                              <span>{lastMessage.content}</span>
                            </div>
                          ) : (
                            <div className="mt-1.5 text-xs text-slate-400 italic">
                              暂无互动消息，点击打开对话抽屉
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. 履约与物流进度 (No SF tracking string) */}
                      <td className="py-4 px-5" onClick={(e) => { e.stopPropagation(); setActiveLogisticsPlan(plan); }}>
                        <div>
                          {plan.orderStatus === 'delivered' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              <span>已签收验收</span>
                            </span>
                          ) : plan.orderStatus === 'shipping' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Truck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              <span>已发货</span>
                            </span>
                          ) : plan.orderStatus === 'reviewing' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              <span>商务审核中</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>待联系商务</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. 操作 (NO delete button; NO Convert to Template button) */}
                      <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setActiveChatPlan(plan)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="查看与回复客户对话"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveBomPlan(plan)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="查看BOM清单与空间详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActiveLogisticsPlan(plan)}
                            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="查看物流详情"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Customer Chat History Drawer (Full conversation viewer & reply) */}
      {activeChatPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-base text-white">
                      {activeChatPlan.customerName} 的沟通对话记录
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                      {activeChatPlan.communityName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                    <span>手机: {activeChatPlan.customerPhone || '17696180841'}</span>
                    <span>·</span>
                    <span>方案预算: {activeChatPlan.totalCostTenThousand} 万元</span>
                    <span>·</span>
                    <span>设备数: {activeChatPlan.deviceCount || 20} 件</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveChatPlan(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Snapshot Strip */}
            <div className="bg-blue-50/80 border-b border-blue-100 px-5 py-3 flex items-center justify-between text-xs text-blue-900 shrink-0">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-sm">方案: {activeChatPlan.title}</span>
                <span className="text-blue-600 font-mono font-bold text-sm">
                  ¥{(activeChatPlan.totalCostYuan || (activeChatPlan.totalCostTenThousand || 0) * 10000).toLocaleString()}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-white text-blue-700 border border-blue-200">
                {activeChatPlan.orderStatus === 'shipping'
                  ? '已发货'
                  : (activeChatPlan.orderStatusLabel || activeChatPlan.status).replace(/\(顺丰单号:[^)]*\)/g, '').trim()}
              </span>
            </div>

            {/* Chat Messages Stream: 用户在右 (User on right), AI在左 (AI on left) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60">
              {(!activeChatPlan.chatHistory || activeChatPlan.chatHistory.length === 0) ? (
                <div className="py-20 text-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-50" />
                  <p className="font-bold text-base text-slate-600">该方案暂无客户沟通记录</p>
                  <p className="text-xs text-slate-400 mt-1">您可以在下方输入框输入跟进内容并实时保存</p>
                </div>
              ) : (
                activeChatPlan.chatHistory.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isSystem = msg.role === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-3">
                        <div className="px-3.5 py-1 rounded-full bg-slate-200/90 text-slate-600 text-xs font-medium max-w-lg text-center">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar: User on right (Blue), AI/Advisor on left (Dark/Emerald) */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}>
                        {isUser ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      {/* Bubble: User on right, AI on left */}
                      <div className={`max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center space-x-2 text-xs text-slate-400 ${isUser ? 'justify-end' : ''}`}>
                          <span className="font-bold text-slate-600">{msg.senderName}</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>

                          {/* Scheme Summary Card if present */}
                          {msg.schemeSummary && (
                            <div className={`mt-3 p-3 rounded-xl border text-xs ${
                              isUser
                                ? 'bg-blue-700/60 border-blue-400 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            } space-y-2`}>
                              <div className="flex items-center justify-between font-bold text-sm">
                                <span>智能方案概览</span>
                                <span>造价: {msg.schemeSummary.totalCostTenThousand} 万元</span>
                              </div>
                              <div className={isUser ? 'text-blue-100' : 'text-slate-600'}>
                                配置设备: {msg.schemeSummary.deviceCount} 件
                              </div>
                              {msg.schemeSummary.highlights && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {msg.schemeSummary.highlights.map((h, i) => (
                                    <span key={i} className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      isUser ? 'bg-blue-800/80 text-blue-100' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {h}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar (NO sender identity selector) */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newChatContent}
                  onChange={(e) => setNewChatContent(e.target.value)}
                  placeholder="输入沟通回复内容..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 outline-none shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!newChatContent.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl font-bold text-sm flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>发送</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. BOM Details Modal */}
      {activeBomPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">【{activeBomPlan.title}】方案配置详情</h3>
                  <p className="text-xs text-slate-400">客户: {activeBomPlan.customerName} · 造价 {activeBomPlan.totalCostTenThousand} 万</p>
                </div>
              </div>
              <button onClick={() => setActiveBomPlan(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-700">
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                <div>
                  <div className="text-xs text-slate-400">核算总造价</div>
                  <div className="font-bold text-blue-600 text-base">{activeBomPlan.totalCostTenThousand} 万元</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">规划空间</div>
                  <div className="font-bold text-slate-800 text-base">{activeBomPlan.roomsCount || activeBomPlan.project?.rooms?.length || 4} 个</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">智能硬件</div>
                  <div className="font-bold text-slate-800 text-base">{activeBomPlan.deviceCount || 20} 件</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">空间清单与智能系统</h4>
                <div className="space-y-2">
                  {(activeBomPlan.project?.rooms || []).map((r, i) => (
                    <div key={r.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.name}</span>
                      <span className="text-slate-600 font-mono text-xs">
                        {r.scheme.enableLighting ? `${r.scheme.lighting?.circuitsCount || 2}路灯控` : '无灯控'}
                        {r.scheme.enableCurtain ? ' · 电动窗帘' : ''}
                        {r.scheme.otherRequirements?.thermostatControl ? ' · 温控面板' : ''}
                        {r.scheme.otherRequirements?.smartLock ? ' · 智能门锁' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveBomPlan(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Logistics Timeline Modal */}
      {activeLogisticsPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm">履约发货与进度明细</h3>
                  <p className="text-xs text-slate-400">方案: {activeLogisticsPlan.title}</p>
                </div>
              </div>
              <button onClick={() => setActiveLogisticsPlan(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-700">
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                <div className="font-bold text-blue-900">
                  收件人: {activeLogisticsPlan.customerName} ({activeLogisticsPlan.customerPhone || '17696180841'})
                </div>
                <div className="text-blue-700 text-xs">
                  派送地址: {activeLogisticsPlan.logisticsInfo?.shippingAddress || `${activeLogisticsPlan.cityName} ${activeLogisticsPlan.communityName}`}
                </div>
                <div className="text-blue-600 text-xs font-mono">
                  履约状态: {activeLogisticsPlan.orderStatus === 'shipping' ? '已发货' : (activeLogisticsPlan.orderStatusLabel || activeLogisticsPlan.status).replace(/\(顺丰单号:[^)]*\)/g, '').trim()}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-3">履约进度时间轴</h4>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-2">
                  {(activeLogisticsPlan.logisticsInfo?.timeline || [
                    { stepNumber: 1, title: '1. 客户提交采购需求', time: activeLogisticsPlan.createdAt || '已提交', done: true },
                    { stepNumber: 2, title: '2. 商务审核中 · 核验配置报价', time: '审核中', done: true },
                    { stepNumber: 3, title: '3. 设备已出库发货', time: '已装车出库', done: activeLogisticsPlan.orderStatus === 'shipping' || activeLogisticsPlan.orderStatus === 'delivered' },
                    { stepNumber: 4, title: '4. 签收与上门联调', time: '待验收', done: activeLogisticsPlan.orderStatus === 'delivered' },
                  ]).map((t, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 bg-white ${
                        t.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                      }`} />
                      <div className="font-bold text-slate-800 text-sm">{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveLogisticsPlan(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
