import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { Customer } from '../../types';

interface AssignModalProps {
  isOpen: boolean;
  customers: Customer[];
  onClose: () => void;
  onConfirm: (targetSalesperson: string, note: string) => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  customers,
  onClose,
  onConfirm,
}) => {
  const [salesperson, setSalesperson] = useState('卫科帆');
  const [note, setNote] = useState('');

  if (!isOpen || customers.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(salesperson, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">指派 / 分配客户</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 text-xs space-y-4">
          <div>
            <span className="text-slate-500 block mb-1">待分配客户:</span>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 max-h-24 overflow-y-auto space-y-1">
              {customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between font-medium text-slate-800">
                  <span>{c.name} ({c.projectName})</span>
                  <span className="text-slate-400 font-mono text-[11px]">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">指派给业务员/顾问:</label>
            <select
              value={salesperson}
              onChange={(e) => setSalesperson(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer font-medium"
            >
              <option value="卫科帆">卫科帆 (高级客户顾问)</option>
              <option value="李明">李明 (方案设计师)</option>
              <option value="王工">王工 (智能工程师)</option>
              <option value="陈工">陈工 (项目交付经理)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1">指派备注 (选填):</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="如: 该客户对无主灯调光感兴趣，请尽快跟进"
              className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
            >
              确定分配
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
