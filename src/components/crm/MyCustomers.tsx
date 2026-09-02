import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  Plus,
  Download,
  ChevronDown,
  UserCheck,
  Calendar,
  Settings,
  XCircle,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Customer, CustomerStatus, PriceGrade } from '../../types';
import { NewCustomerModal } from './NewCustomerModal';
import { AssignModal } from './AssignModal';

interface MyCustomersProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: (customer: Customer) => void;
  onBatchAssign: (targetSalesperson: string, selectedIds: string[]) => void;
  onBatchChangeStatus: (status: CustomerStatus, selectedIds: string[]) => void;
  onBatchDelete: (selectedIds: string[]) => void;
  onToggleShare: (customerId: string) => void;
}

export const MyCustomers: React.FC<MyCustomersProps> = ({
  customers,
  onSelectCustomer,
  onAddCustomer,
  onBatchAssign,
  onBatchChangeStatus,
  onBatchDelete,
  onToggleShare,
}) => {
  // Filters
  const [keyword, setKeyword] = useState('');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [updateStartDate, setUpdateStartDate] = useState('');
  const [updateEndDate, setUpdateEndDate] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('全部');
  const [activeTab, setActiveTab] = useState<'全部' | '资源客户' | '意向客户' | '签约客户' | '丢单客户'>('全部');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [priceGradeFilter, setPriceGradeFilter] = useState('全部');

  // Modals & Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isBatchMenuOpen, setIsBatchMenuOpen] = useState(false);

  // Filter My Customers (assigned to salespeople or owned)
  const myCustomerList = customers.filter((c) => {
    // Tab filter
    if (activeTab !== '全部' && c.status !== activeTab) {
      return false;
    }

    // Keyword filter
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      const match =
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.projectName.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Salesperson filter
    if (salespersonFilter !== '全部' && c.salesperson !== salespersonFilter) {
      return false;
    }

    // Price Grade filter
    if (priceGradeFilter !== '全部' && c.priceGrade !== priceGradeFilter) {
      return false;
    }

    return true;
  });

  const handleReset = () => {
    setKeyword('');
    setCreateStartDate('');
    setCreateEndDate('');
    setUpdateStartDate('');
    setUpdateEndDate('');
    setSalespersonFilter('全部');
    setPriceGradeFilter('全部');
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === myCustomerList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(myCustomerList.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedCustomers = customers.filter((c) => selectedIds.includes(c.id));

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      ['序号,客户姓名,项目名称,客户电话,跟进状态,客户状态,交付状态,价格等级,业务员,创建人,创建时间']
        .concat(
          myCustomerList.map(
            (c, i) =>
              `${i + 1},${c.name},${c.projectName},${c.phone},${c.followUpStatus},${c.status},${c.deliveryStatus},${c.priceGrade},${c.salesperson},${c.creator},${c.createdAt}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `我的客户列表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Search & Filter Bar (Matching Image 4) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Keyword Search Input */}
          <div className="w-80 relative">
            <input
              type="text"
              placeholder="请输入客户编号/姓名/手机号码/项目名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 pr-8 text-slate-800 outline-none placeholder:text-slate-400"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date Picker: 创建日期 */}
          <div className="flex items-center space-x-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="创建日期 - 结束日期"
              value={createStartDate}
              onChange={(e) => setCreateStartDate(e.target.value)}
              className="w-36 outline-none text-xs text-slate-800 bg-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Date Picker: 更新日期 */}
          <div className="flex items-center space-x-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="更新日期 - 结束日期"
              value={updateStartDate}
              onChange={(e) => setUpdateStartDate(e.target.value)}
              className="w-36 outline-none text-xs text-slate-800 bg-transparent placeholder:text-slate-400"
            />
          </div>

          {/* Dropdown: 请选择业务员 */}
          <div className="w-40">
            <select
              value={salespersonFilter}
              onChange={(e) => setSalespersonFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer"
            >
              <option value="全部">请选择业务员</option>
              <option value="卫科帆">卫科帆</option>
              <option value="李明">李明</option>
              <option value="王工">王工</option>
              <option value="陈工">陈工</option>
            </select>
          </div>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className="flex items-center space-x-1 text-slate-600 hover:text-blue-600 px-2 py-1.5 rounded text-xs font-medium cursor-pointer"
          >
            <span>更多</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => {}}
              className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>搜索</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>重置</span>
            </button>
          </div>
        </div>

        {/* Expandable More Filters */}
        {showMoreFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">价格等级:</label>
              <select
                value={priceGradeFilter}
                onChange={(e) => setPriceGradeFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none"
              >
                <option value="全部">全部级别</option>
                <option value="普通级别">普通级别</option>
                <option value="高端级别">高端级别</option>
                <option value="尊享级别">尊享级别</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Content Card with Tabs & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Tab Switcher & Right Action Buttons */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white">
          {/* Left Tabs */}
          <div className="flex space-x-6 text-xs font-bold">
            {(['全部', '资源客户', '意向客户', '签约客户', '丢单客户'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === '全部' ? '全部客户' : tab}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center space-x-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>导出</span>
            </button>

            {/* Batch Menu */}
            <div className="relative">
              <button
                onClick={() => setIsBatchMenuOpen(!isBatchMenuOpen)}
                disabled={selectedIds.length === 0}
                className={`flex items-center space-x-1 px-3 py-1.5 border rounded-lg font-medium cursor-pointer transition-all ${
                  selectedIds.length > 0
                    ? 'border-slate-300 hover:bg-slate-50 text-slate-700'
                    : 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                }`}
              >
                <span>批量操作</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isBatchMenuOpen && selectedIds.length > 0 && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setIsBatchMenuOpen(false);
                      setIsAssignModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>批量指派</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsBatchMenuOpen(false);
                      onBatchChangeStatus('意向客户', selectedIds);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>批量转意向</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsBatchMenuOpen(false);
                      onBatchChangeStatus('签约客户', selectedIds);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-600 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>批量转签约</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsBatchMenuOpen(false);
                      onBatchChangeStatus('丢单客户', selectedIds);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>批量丢单</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsBatchMenuOpen(false);
                      onBatchDelete(selectedIds);
                      setSelectedIds([]);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-1.5 border-t border-slate-100 cursor-pointer"
                  >
                    <span>批量删除</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedIds.length > 0) setIsAssignModalOpen(true);
              }}
              disabled={selectedIds.length === 0}
              className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedIds.length > 0
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>分配</span>
            </button>
          </div>
        </div>

        {/* Data Table (Matching Image 4) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={myCustomerList.length > 0 && selectedIds.length === myCustomerList.length}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-12 text-slate-500">序号</th>
                <th className="py-3 px-4 font-bold text-slate-800">客户姓名</th>
                <th className="py-3 px-4 font-bold text-slate-800">项目名称</th>
                <th className="py-3 px-4 text-slate-600">客户电话</th>
                <th className="py-3 px-4 text-slate-600">跟进状态</th>
                <th className="py-3 px-4 text-slate-600">客户状态</th>
                <th className="py-3 px-4 text-slate-600">交付状态</th>
                <th className="py-3 px-4 text-slate-600">价格等级</th>
                <th className="py-3 px-4 text-slate-600">业务员</th>
                <th className="py-3 px-4 text-slate-600">创建人</th>
                <th className="py-3 px-4 text-slate-600">创建时间</th>
                <th className="py-3 px-4 text-center w-24">
                  <Settings className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {myCustomerList.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400">
                    暂无我的客户数据
                  </td>
                </tr>
              ) : (
                myCustomerList.map((cust, idx) => {
                  const isSelected = selectedIds.includes(cust.id);
                  return (
                    <tr
                      key={cust.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(cust.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {cust.name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[180px] truncate" title={cust.projectName}>
                        {cust.projectName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {cust.phone}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="flex items-center space-x-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cust.followUpStatus === '未跟进'
                                ? 'bg-rose-500'
                                : cust.followUpStatus === '已签约'
                                ? 'bg-emerald-500'
                                : cust.followUpStatus === '待签约'
                                ? 'bg-amber-500'
                                : cust.followUpStatus === '丢单'
                                ? 'bg-red-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="text-slate-700">{cust.followUpStatus}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            cust.status === '资源客户'
                              ? 'bg-orange-50 text-orange-600 border-orange-200'
                              : cust.status === '意向客户'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : cust.status === '签约客户'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                          {cust.deliveryStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {cust.priceGrade}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-700 whitespace-nowrap">
                        {cust.salesperson}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {cust.creator}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {cust.createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() => onSelectCustomer(cust)}
                            className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            查看
                          </button>
                          <button
                            onClick={() => onToggleShare(cust.id)}
                            className={`hover:underline cursor-pointer flex items-center space-x-0.5 ${
                              cust.isShared ? 'text-emerald-600 font-bold' : 'text-blue-600'
                            }`}
                          >
                            <span>{cust.isShared ? '已共享' : '共享'}</span>
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

        {/* Pagination Footer (Matching Image 4) */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <div>
            共 <span className="font-bold text-slate-800">{myCustomerList.length}</span> 条
            {selectedIds.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">已选择 {selectedIds.length} 项</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
              &lt; 上一页
            </button>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
              下一页 &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewCustomerModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={onAddCustomer}
        defaultIsPool={false}
      />

      <AssignModal
        isOpen={isAssignModalOpen}
        customers={selectedCustomers}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={(salesperson) => {
          onBatchAssign(salesperson, selectedIds);
          setSelectedIds([]);
        }}
      />
    </div>
  );
};
