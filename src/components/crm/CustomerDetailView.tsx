import React, { useState } from 'react';
import {
  ChevronLeft,
  Edit,
  UserCheck,
  ArrowRightLeft,
  UserMinus,
  Trash2,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  DollarSign,
  PackageCheck,
  FolderOpen,
  Eye,
} from 'lucide-react';
import { Customer, FollowUpRecord } from '../../types';
import { CustomerInfoModal } from './CustomerInfoModal';
import { NewFollowUpModal } from './NewFollowUpModal';
import { AssignModal } from './AssignModal';

interface CustomerDetailViewProps {
  customer: Customer;
  followUps: FollowUpRecord[];
  onBack: () => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onAddFollowUp: (record: FollowUpRecord) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  followUps,
  onBack,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'followUp' | 'expense' | 'materials' | 'files'>('followUp');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState('全部方式');

  // Filter records for this customer
  const customerFollowUps = followUps.filter((f) => f.customerId === customer.id);
  const filteredRecords = customerFollowUps.filter((f) => {
    if (methodFilter === '全部方式') return true;
    return f.method === methodFilter;
  });

  const latestFollowUp = customerFollowUps.length > 0 ? customerFollowUps[0] : null;

  const handleConvertToIntent = () => {
    const updated: Customer = {
      ...customer,
      status: '意向客户',
      updatedAt: '08-18 16:30',
    };
    onUpdateCustomer(updated);
    // Add log
    onAddFollowUp({
      id: `fu_${Date.now()}`,
      customerId: customer.id,
      time: '2026-08-18 16:30:00',
      method: '更新客户状态',
      matter: `将客户【${customer.name}】状态变更为【意向客户】`,
      result: '客户已有明确全屋智能方案设计意向',
      type: '日志',
      operator: '卫科帆',
    });
  };

  const handleConvertToLost = () => {
    const updated: Customer = {
      ...customer,
      status: '丢单客户',
      followUpStatus: '丢单',
      updatedAt: '08-18 16:30',
    };
    onUpdateCustomer(updated);
    onAddFollowUp({
      id: `fu_${Date.now()}`,
      customerId: customer.id,
      time: '2026-08-18 16:30:00',
      method: '更新客户状态',
      matter: `将客户【${customer.name}】标记为【丢单客户】`,
      result: '客户暂时取消智能装修计划',
      type: '日志',
      operator: '卫科帆',
    });
  };

  const handleTogglePool = () => {
    const nextIsPool = !customer.isPool;
    const updated: Customer = {
      ...customer,
      isPool: nextIsPool,
      updatedAt: '08-18 16:30',
    };
    onUpdateCustomer(updated);
    onAddFollowUp({
      id: `fu_${Date.now()}`,
      customerId: customer.id,
      time: '2026-08-18 16:30:00',
      method: nextIsPool ? '转入客户池' : '转入我的项目',
      matter: `将客户【${customer.name}】${nextIsPool ? '转入公共客户池' : '认领转入我的客户'}`,
      result: '-',
      type: '日志',
      operator: '卫科帆',
    });
  };

  const handleAssignConfirm = (targetSalesperson: string, note: string) => {
    const updated: Customer = {
      ...customer,
      salesperson: targetSalesperson,
      isPool: false,
      updatedAt: '08-18 16:30',
    };
    onUpdateCustomer(updated);
    onAddFollowUp({
      id: `fu_${Date.now()}`,
      customerId: customer.id,
      time: '2026-08-18 16:30:00',
      method: '指派客户',
      matter: `卫科帆 将项目客户[${customer.projectName}] 指派给 ${targetSalesperson}${note ? ` (${note})` : ''}`,
      result: '-',
      type: '日志',
      operator: '卫科帆',
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header / Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>返回列表</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>客户详情: {customer.name}</span>
            <span className="text-xs font-normal text-slate-400">({customer.projectName})</span>
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>编辑</span>
          </button>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>指派</span>
          </button>

          <button
            onClick={handleTogglePool}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            <span>{customer.isPool ? '转我的项目' : '转入客户池'}</span>
          </button>

          {customer.status !== '意向客户' && (
            <button
              onClick={handleConvertToIntent}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg font-bold cursor-pointer"
            >
              转意向
            </button>
          )}

          {customer.status !== '丢单客户' && (
            <button
              onClick={handleConvertToLost}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold cursor-pointer"
            >
              丢单
            </button>
          )}

          <button
            onClick={() => onDeleteCustomer(customer.id)}
            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除</span>
          </button>
        </div>
      </div>

      {/* Customer Basic Info Summary Card (Matching Image 2) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs text-xs space-y-4">
        {/* Top title and badges */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <span className="font-extrabold text-base text-slate-900">{customer.name}</span>
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-orange-50 text-orange-600 border border-orange-200">
                {customer.status}
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="font-bold text-slate-700 text-sm">{customer.projectName}</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600 border border-slate-200">
                {customer.deliveryStatus}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-slate-500 text-[11px]">
              <div>创建人: <span className="text-slate-700 font-medium">{customer.creator}</span></div>
              <div>创建时间: <span className="text-slate-700 font-mono">{customer.createdAt}</span></div>
              <div>更新时间: <span className="text-slate-700 font-mono">{customer.updatedAt}</span></div>
            </div>
          </div>

          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-bold hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>查看更多 &gt;</span>
          </button>
        </div>

        {/* Info Grid (4 columns) */}
        <div className="grid grid-cols-4 gap-y-3.5 gap-x-6 text-slate-600">
          <div>
            <span className="text-slate-400 block mb-0.5">客户电话:</span>
            <span className="text-slate-900 font-mono font-bold">{customer.phone || '暂无'}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">客户小区:</span>
            <span className="text-slate-900 font-bold">{customer.community || customer.projectName || '万科翡翠公园'}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">审核状态:</span>
            <span className="font-bold text-slate-900">
              {customer.auditStatus === 'approved'
                ? '已审核通过'
                : customer.auditStatus === 'rejected'
                ? '已驳回'
                : '待 Web 端商务审核'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">销售顾问/商务:</span>
            <span className="text-blue-700 font-bold">{customer.assignedTo || customer.salesperson || '王浩'}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">所属地区:</span>
            <span className="text-slate-900 font-medium">{customer.region || '北京-北京-朝阳'}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">详细地址:</span>
            <span className="text-slate-900 truncate block font-medium" title={customer.detailAddress}>
              {customer.detailAddress || '北京顺义区大槐树镇'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">客户来源:</span>
            <span className="text-slate-900 font-medium">{customer.source || '上门用户'}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">价格等级:</span>
            <span className="text-slate-900 font-medium">{customer.priceGrade || '普通级别'}</span>
          </div>
        </div>

        {/* Customer Custom Notes */}
        {customer.customNotes && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-500 font-bold block mb-1">客户手输记录 / 需求备忘:</span>
            <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
              {customer.customNotes}
            </p>
          </div>
        )}
      </div>

      {/* Tabs Navigation (跟进记录 / 支出记录 / 领料单 / 客户文件) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('followUp')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'followUp'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              跟进记录 ({customerFollowUps.length})
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'expense'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              支出记录 (0)
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              领料单 (0)
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'files'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              客户文件 (0)
            </button>
          </div>
        </div>

        {/* Tab 1: 跟进记录 */}
        {activeTab === 'followUp' && (
          <div className="p-5 space-y-4">
            {/* Filter and Top Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">跟进方式:</span>
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="全部方式">全部方式</option>
                    <option value="微信沟通">微信沟通</option>
                    <option value="电话跟进">电话跟进</option>
                    <option value="方案汇报">方案汇报</option>
                    <option value="现场量房">现场量房</option>
                    <option value="门店接待">门店接待</option>
                    <option value="更新客户状态">更新客户状态</option>
                    <option value="指派客户">指派客户</option>
                    <option value="创建客户">创建客户</option>
                  </select>
                </div>

                <div className="text-slate-500 text-[11px]">
                  最近跟进:{' '}
                  <span className="font-mono text-slate-800 font-bold">
                    {latestFollowUp ? latestFollowUp.time : '-'}
                  </span>
                </div>

                <div className="text-slate-500 text-[11px]">
                  下次跟进:{' '}
                  <span className="font-mono text-slate-800 font-bold">
                    {latestFollowUp?.nextFollowUpTime || '-'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsFollowUpModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>新增跟进</span>
              </button>
            </div>

            {/* Follow-up Records Table (Matching Image 2 / Image 6) */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">跟进时间</th>
                    <th className="py-2.5 px-4">跟进方式</th>
                    <th className="py-2.5 px-4">主要事宜</th>
                    <th className="py-2.5 px-4">跟进结果</th>
                    <th className="py-2.5 px-4">类型</th>
                    <th className="py-2.5 px-4">操作人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        暂无跟进记录
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {record.time}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                          {record.method}
                        </td>
                        <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={record.matter}>
                          {record.matter}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={record.result}>
                          {record.result}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              record.type === '跟进'
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {record.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                          {record.operator}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: 支出记录 */}
        {activeTab === 'expense' && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>暂无工程支出记录</p>
          </div>
        )}

        {/* Tab 3: 领料单 */}
        {activeTab === 'materials' && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>暂无施工领料单记录</p>
          </div>
        )}

        {/* Tab 4: 客户文件 */}
        {activeTab === 'files' && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>暂无设计图纸或合同附件</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerInfoModal
        isOpen={isInfoModalOpen}
        customer={customer}
        onClose={() => setIsInfoModalOpen(false)}
      />

      <NewFollowUpModal
        isOpen={isFollowUpModalOpen}
        customer={customer}
        onClose={() => setIsFollowUpModalOpen(false)}
        onSave={onAddFollowUp}
      />

      <AssignModal
        isOpen={isAssignModalOpen}
        customers={[customer]}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleAssignConfirm}
      />
    </div>
  );
};
