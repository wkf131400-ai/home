import React, { useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  X,
} from 'lucide-react';
import { Customer } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';

export interface ApplyFormData {
  phone?: string;
  name?: string;
  notes?: string;
  rejectReason?: string;
}

interface MerchantApplyPageProps {
  initialData?: ApplyFormData | null;
  onBack: () => void;
  onApplySuccess?: () => void;
}

export const MerchantApplyPage: React.FC<MerchantApplyPageProps> = ({
  initialData,
  onBack,
  onApplySuccess,
}) => {
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [code, setCode] = useState('8888');
  const [name, setName] = useState(initialData?.name || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [countdown, setCountdown] = useState(0);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleSendCode = () => {
    if (!phone || phone.length < 11) {
      showToast('请输入11位有效手机号码', 'error');
      return;
    }
    setCountdown(60);
    setCode('8888');
    showToast('验证码已发送 (演示码: 8888)');
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 11) {
      showToast('请输入正确的11位手机号码', 'error');
      return;
    }
    if (!code) {
      showToast('请输入短信验证码', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('请输入您的姓名或称呼', 'error');
      return;
    }

    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16);

    try {
      const existingCustomers = AdminStorageManager.getCustomers();
      const existingIndex = existingCustomers.findIndex((c) => c.phone === phone);

      const customerRecord: Customer = {
        id: existingIndex >= 0 ? existingCustomers[existingIndex].id : `cust_${Date.now()}`,
        code:
          existingIndex >= 0
            ? existingCustomers[existingIndex].code
            : `CUST-${String(existingCustomers.length + 1).padStart(3, '0')}`,
        name: name.trim(),
        projectName: `${name.trim()}的智能项目`,
        phone: phone.trim(),
        followUpStatus: '待商务审核',
        status: '意向客户',
        deliveryStatus: '未交付',
        priceGrade: '高端级别',
        salesperson: '待指派专属商务',
        creator: '商户入驻申请',
        createdAt:
          existingIndex >= 0 ? existingCustomers[existingIndex].createdAt : nowTime,
        updatedAt: nowTime,
        isPool: true,
        region: '北京市 / 朝阳区',
        detailAddress: '待定',
        source: `商户自助入驻申请`,
        level: '普通客户',
        category: '家装客户',
        auditStatus: 'pending',
        auditFeedback: '',
        customNotes: `姓名：${name.trim()} | 手机号：${phone.trim()} | 备注：${notes.trim() || '无'}`,
      };

      if (existingIndex >= 0) {
        existingCustomers[existingIndex] = customerRecord;
        AdminStorageManager.saveCustomers([...existingCustomers]);
      } else {
        AdminStorageManager.saveCustomers([customerRecord, ...existingCustomers]);
      }
    } catch (err) {
      console.error(err);
    }

    // 提示: 将尽快安排商务审核!
    showToast('将尽快安排商务审核!');
    setIsSubmittedSuccess(true);
    if (onApplySuccess) {
      onApplySuccess();
    }
  };

  return (
    <div
      id="merchant-apply-page"
      className="w-full h-full flex flex-col bg-slate-50 overflow-y-auto select-none"
    >
      {/* Top Header */}
      <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-20">
        <button
          id="btn-back-apply-page"
          onClick={onBack}
          className="p-1.5 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">返回</span>
        </button>

        <div className="flex items-center space-x-1.5 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>商户入驻申请</span>
        </div>

        <div className="w-8" />
      </div>

      {/* Floating Toast */}
      {toastMsg && (
        <div
          id="apply-toast"
          className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border animate-fadeIn ${
            toastMsg.type === 'success'
              ? 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/40'
              : 'bg-rose-900/95 text-white border-rose-500/50'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 p-4 sm:p-6 max-w-md w-full mx-auto space-y-4 my-auto">
        {/* Banner Card if any previous reject reason */}
        {initialData?.rejectReason && !isSubmittedSuccess && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs space-y-1 shadow-xs">
            <div className="flex items-center space-x-1.5 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>审核提示</span>
            </div>
            <p className="text-[11px] leading-relaxed pl-5 text-rose-700">
              {initialData.rejectReason}
            </p>
          </div>
        )}

        {isSubmittedSuccess ? (
          /* SUBMITTED SUCCESS VIEW */
          <div className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm text-center space-y-5 animate-fadeIn my-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-slate-900">将尽快安排商务审核!</h2>
              <p className="text-xs text-slate-500 leading-relaxed px-3">
                您的入驻申请资料已提交成功。专属商务经理将在 1 个工作日内与您联系并为您开通全屋定制权限。
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>申请手机号:</span>
                <span className="font-bold font-mono text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>申请姓名:</span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>
              {notes && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>申请备注:</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{notes}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600">
                <span>审核状态:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                  待商务审核
                </span>
              </div>
            </div>

            <button
              id="btn-return-from-success"
              onClick={onBack}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>返回上一页</span>
            </button>
          </div>
        ) : (
          /* APPLICATION FORM: 仅包含 手机号、验证码、姓名、备注 */
          <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-1 pb-1 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">填写商户入驻信息</h2>
              <p className="text-[11px] text-slate-400">
                认证后可解锁全屋方案算量与专属商务对接服务
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 1. 手机号 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>手机号码</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">用于登录与商务对接</span>
                </label>
                <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all shadow-2xs">
                  <span className="text-xs font-bold text-slate-400 font-mono pr-2.5 border-r border-slate-200 shrink-0">
                    +86
                  </span>
                  <input
                    id="input-apply-phone"
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入11位手机号码"
                    className="flex-1 pl-2.5 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                    required
                  />
                  {phone && (
                    <button
                      type="button"
                      onClick={() => setPhone('')}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. 验证码 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>短信验证码</span>
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all shadow-2xs">
                  <input
                    id="input-apply-code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="输入短信验证码"
                    className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                    required
                  />
                  <button
                    id="btn-get-apply-code"
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendCode}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      countdown > 0
                        ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                        : 'text-slate-900 bg-slate-200/80 hover:bg-slate-200'
                    }`}
                  >
                    {countdown > 0 ? `重新获取(${countdown}s)` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* 3. 姓名 / 称呼 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>姓名 / 称呼</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all shadow-2xs">
                  <input
                    id="input-apply-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如：张经理 / 李工"
                    className="flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* 4. 备注 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>备注</span>
                  <span className="text-[10px] text-slate-400 font-normal ml-1">（选填）</span>
                </label>
                <textarea
                  id="textarea-apply-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="可填写主营业务、合作需求或备注说明..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-slate-900 focus:bg-white transition-all resize-none placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-apply"
                  type="submit"
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>提交入驻申请</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
