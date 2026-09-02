import React from 'react';
import { X, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { Customer } from '../../types';

interface CustomerInfoModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
}

export const CustomerInfoModal: React.FC<CustomerInfoModalProps> = ({
  isOpen,
  customer,
  onClose,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-sm font-bold text-slate-800">客户信息</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-xs space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Top Key Info */}
          <div className="grid grid-cols-3 gap-y-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-orange-50 text-orange-600 border border-orange-200">
                  {customer.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">创建时间: {customer.createdAt}</div>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-800">{customer.projectName}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-500">
                  {customer.deliveryStatus}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">更新时间: {customer.updatedAt}</div>
            </div>

            <div>
              <div className="text-slate-700">客户电话: <span className="font-mono text-slate-900">{customer.phone || '暂无'}</span></div>
              <div className="text-[11px] text-slate-500 mt-1">跟进状态: <span className="text-rose-600 font-bold">{customer.followUpStatus}</span></div>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-slate-700">
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">客户小区:</span>
              <span className="text-slate-900 font-bold">{customer.community || customer.projectName || '万科翡翠公园'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">审核状态:</span>
              <span className="font-bold text-slate-800">
                {customer.auditStatus === 'approved'
                  ? '已审核通过'
                  : customer.auditStatus === 'rejected'
                  ? '已驳回'
                  : '待 Web 端商务审核'}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">所属地区:</span>
              <span className="text-slate-800 font-medium">{customer.region || '北京-北京-朝阳'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">详细地址:</span>
              <span className="text-slate-800 font-medium truncate" title={customer.detailAddress}>
                {customer.detailAddress || '北京顺义区大槐树镇'}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">客户来源:</span>
              <span className="text-slate-800">{customer.source || '上门用户'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">客户级别:</span>
              <span className="text-slate-800">{customer.level || '普通客户'}</span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">客户类别:</span>
              <span className="text-slate-800">{customer.category || '家装客户'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">家装设计师:</span>
              <span className="text-slate-800">{customer.designer || '测试'}</span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">销售顾问:</span>
              <span className="text-slate-800 font-medium">{customer.salesperson || '卫科帆'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">初次接触时间:</span>
              <span className="text-slate-800 font-mono">{customer.firstContactDate || '2026-08-18'}</span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">房屋面积:</span>
              <span className="text-slate-800 font-mono">{customer.houseArea || '120'} ㎡</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">房屋户型:</span>
              <span className="text-slate-800">{customer.houseLayout || '两室两厅'}</span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">关联渠道:</span>
              <span className="text-slate-800">{customer.channel || '暂无'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">客户需求:</span>
              <span className="text-slate-800 truncate" title={customer.requirement}>
                {customer.requirement || '暂无'}
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">备注:</span>
              <span className="text-slate-800">{customer.remark || '暂无'}</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">价格等级:</span>
              <span className="text-slate-800">{customer.priceGrade || '普通级别'}</span>
            </div>

            <div className="flex items-center">
              <span className="text-slate-400 w-24 shrink-0">附件:</span>
              <span className="text-slate-400">暂无附件</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 w-24 shrink-0">微信:</span>
              <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono text-[11px]">
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                {customer.wechat || '已关联微信'}
              </span>
            </div>
          </div>

          {/* 客户手输记录 / 需求备忘 */}
          {customer.customNotes && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-bold block mb-1">客户手输记录 / 需求备忘:</span>
              <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                {customer.customNotes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
