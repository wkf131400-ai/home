import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, XCircle } from 'lucide-react';
import { Customer, FollowUpRecord } from '../../types';

interface NewFollowUpModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSave: (record: FollowUpRecord) => void;
}

export const NewFollowUpModal: React.FC<NewFollowUpModalProps> = ({
  isOpen,
  customer,
  onClose,
  onSave,
}) => {
  const [contactPhone, setContactPhone] = useState(customer?.phone || '17696180841');
  const [contactPerson, setContactPerson] = useState(customer?.name || '');
  const [method, setMethod] = useState('微信沟通');
  const [matter, setMatter] = useState('');
  const [result, setResult] = useState('');
  const [lossStatus, setLossStatus] = useState<'正常跟进' | '暂不跟进' | '流失'>('正常跟进');
  const [nextFollowUp, setNextFollowUp] = useState('方案深化');
  const [nextDate, setNextDate] = useState('2026-08-20');
  const [nextTime, setNextTime] = useState('14:30');
  const [notes, setNotes] = useState('');

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !matter.trim() || !result.trim()) return;

    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newRecord: FollowUpRecord = {
      id: `fu_${Date.now()}`,
      customerId: customer.id,
      time: formattedTime,
      method,
      matter: matter.trim(),
      result: result.trim(),
      type: '跟进',
      operator: customer.salesperson || '卫科帆',
      contactPerson: contactPerson.trim() || customer.name,
      contactPhone,
      lossStatus,
      nextFollowUp,
      nextFollowUpTime: nextDate ? `${nextDate} ${nextTime}` : undefined,
      notes: notes.trim(),
    };

    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-sm font-bold text-slate-800">新增跟进</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
          {/* 跟进客户 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-600 text-right pr-2">跟进客户</label>
            <div className="col-span-9">
              <input
                type="text"
                disabled
                value={customer.name}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* 联系电话 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-600 text-right pr-2">联系电话</label>
            <div className="col-span-9 relative">
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="请输入联系电话"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 pr-8 text-slate-900 outline-none"
              />
              {contactPhone && (
                <button
                  type="button"
                  onClick={() => setContactPhone('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 联系人 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-600 text-right pr-2">联系人</label>
            <div className="col-span-9">
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="请填写联系人"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* * 跟进方式 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-700 font-medium text-right pr-2">
              <span className="text-rose-500">*</span> 跟进方式
            </label>
            <div className="col-span-9">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
              >
                <option value="微信沟通">微信沟通</option>
                <option value="电话跟进">电话跟进</option>
                <option value="现场量房">现场量房</option>
                <option value="门店接待">门店接待</option>
                <option value="方案汇报">方案汇报</option>
                <option value="商务洽谈">商务洽谈</option>
                <option value="更新客户状态">更新客户状态</option>
                <option value="售后回访">售后回访</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          {/* * 主要事宜 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-700 font-medium text-right pr-2">
              <span className="text-rose-500">*</span> 主要事宜
            </label>
            <div className="col-span-9">
              <input
                type="text"
                required
                value={matter}
                onChange={(e) => setMatter(e.target.value)}
                placeholder="请填写主要事宜"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* * 跟进结果 */}
          <div className="grid grid-cols-12 gap-3 items-start">
            <label className="col-span-3 text-slate-700 font-medium text-right pr-2 pt-2">
              <span className="text-rose-500">*</span> 跟进结果
            </label>
            <div className="col-span-9 relative">
              <textarea
                required
                rows={3}
                maxLength={100}
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="请填写跟进结果"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg p-2.5 pb-6 text-slate-900 outline-none resize-none leading-relaxed"
              />
              <span className="absolute right-2.5 bottom-2 text-[10px] text-slate-400">
                {result.length}/100
              </span>
            </div>
          </div>

          {/* 上传图片 */}
          <div className="grid grid-cols-12 gap-3 items-start">
            <label className="col-span-3 text-slate-600 text-right pr-2 pt-2">上传图片</label>
            <div className="col-span-9">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50">
                <Plus className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">上传图片</span>
              </div>
            </div>
          </div>

          {/* 是否流失 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-600 text-right pr-2">是否流失</label>
            <div className="col-span-9 flex items-center space-x-5">
              {(['正常跟进', '暂不跟进', '流失'] as const).map((opt) => (
                <label key={opt} className="flex items-center space-x-1.5 cursor-pointer text-slate-700">
                  <input
                    type="radio"
                    name="lossStatus"
                    checked={lossStatus === opt}
                    onChange={() => setLossStatus(opt)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 后续跟进 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-600 text-right pr-2">后续跟进</label>
            <div className="col-span-9">
              <select
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
              >
                <option value="方案深化">方案深化</option>
                <option value="待回访">待回访</option>
                <option value="预约量房">预约量房</option>
                <option value="签订合同">签订合同</option>
                <option value="暂无">暂无</option>
              </select>
            </div>
          </div>

          {/* 具体时间 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <label className="col-span-3 text-slate-600 text-right pr-2">具体时间</label>
            <div className="col-span-9 grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none text-xs"
                />
              </div>
              <div>
                <select
                  value={nextTime}
                  onChange={(e) => setNextTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer text-xs"
                >
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="16:00">16:00</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="grid grid-cols-12 gap-3 items-start">
            <label className="col-span-3 text-slate-600 text-right pr-2 pt-2">备注</label>
            <div className="col-span-9 relative">
              <textarea
                rows={2}
                maxLength={100}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="请输入备注"
                className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg p-2.5 pb-6 text-slate-900 outline-none resize-none leading-relaxed"
              />
              <span className="absolute right-2.5 bottom-2 text-[10px] text-slate-400">
                {notes.length}/100
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
