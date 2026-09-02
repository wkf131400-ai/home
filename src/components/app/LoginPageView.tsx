import React, { useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';
import { AgreementModal } from './AgreementModal';
import { ApplyFormData } from './MerchantApplyPage';

interface LoginPageViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenApply: (initialData?: ApplyFormData) => void;
  currentUser?: UserProfile;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onLoginSuccess,
  onOpenApply,
  currentUser,
}) => {
  const [phone, setPhone] = useState(currentUser?.phone || '17696180841');
  const [code, setCode] = useState('8888');
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(true);

  // Agreement Modal
  const [agreementType, setAgreementType] = useState<'terms' | 'privacy' | null>(null);

  // Toast / Prompt Message
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleSendCode = () => {
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      showToast('请先阅读并同意《用户协议》和《隐私政策》', 'error');
      return;
    }

    const effectivePhone = phone.trim() || '17696180841';

    // Lookup CRM customer database
    const customers = AdminStorageManager.getCustomers();
    const customer = customers.find((c) => c.phone === effectivePhone);

    const userName = customer?.name || (effectivePhone === '17696180841' ? '卫科帆' : `智家用户_${effectivePhone.slice(-4) || '8888'}`);

    // Demo: Directly login without blocking
    const userProfile: UserProfile = {
      id: customer ? customer.id : 'usr_' + (effectivePhone.slice(-4) || '8888'),
      phone: effectivePhone,
      name: userName,
      avatar:
        customer?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleTitle: '智家全屋定制用户',
      city: customer?.region || '北京市 / 朝阳区',
      communityName: customer?.community || '万科翡翠公园',
      customNotes: customer?.customNotes || '全屋智能方案已确认。',
      isLoggedIn: true,
      createdAt:
        customer?.createdAt ||
        new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
      auditStatus: 'approved',
      consultantName: customer?.salesperson || '王浩 (专属商务经理)',
    };

    AdminStorageManager.saveUserProfile(userProfile);
    showToast(`登录成功，欢迎 ${userName}！`);
    setTimeout(() => {
      onLoginSuccess(userProfile);
    }, 300);
  };

  return (
    <div
      id="login-page-view"
      className="relative flex-1 min-h-full w-full flex flex-col justify-between items-center overflow-y-auto bg-cover bg-center select-none py-6 px-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')`,
      }}
    >
      {/* Dark Ambient Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90 backdrop-blur-[2px] z-0" />

      {/* Top Header */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-semibold shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>智家全屋定制</span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          id="login-toast-notification"
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

      {/* Main Container - App proportioned layout */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto space-y-4">
        {/* Brand Welcome Hero Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            欢迎登录智家
          </h1>
          <p className="text-xs text-slate-300 font-medium drop-shadow-sm">
            智能全屋方案定制 · BOM算量与客户管理平台
          </p>
        </div>

        {/* Input Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/40 space-y-4">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* 1. 手机号码输入 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>手机号码</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400">11位手机号码</span>
              </label>
              <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3.5 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all shadow-2xs">
                <span className="text-xs font-bold text-slate-400 font-mono pr-2.5 border-r border-slate-200 shrink-0">
                  +86
                </span>
                <input
                  id="input-login-phone"
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="请输入手机号"
                  className="flex-1 pl-2.5 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
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

            {/* 2. 短信验证码输入 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>短信验证码</span>
                  <span className="text-rose-500">*</span>
                </span>
              </label>
              <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3.5 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all shadow-2xs">
                <input
                  id="input-login-code"
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="输入短信验证码"
                  className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                />
                <button
                  id="btn-get-login-code"
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

            {/* 3. 协议勾选行 */}
            <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-600 select-none">
              <button
                id="checkbox-login-protocol"
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  agreed
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-300 hover:border-slate-400'
                }`}
              >
                {agreed && <Check className="w-3 h-3 stroke-[3]" />}
              </button>

              <span className="leading-none">
                我已阅读并同意
                <button
                  type="button"
                  onClick={() => setAgreementType('terms')}
                  className="text-blue-600 hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  《用户协议》
                </button>
                和
                <button
                  type="button"
                  onClick={() => setAgreementType('privacy')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  《隐私政策》
                </button>
              </span>
            </div>

            {/* 4. 登录按钮 */}
            <div className="pt-2">
              <button
                id="btn-submit-login-view"
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>登 录</span>
              </button>
            </div>

            {/* 5. 申请入驻文字链 */}
            <div className="text-center pt-2">
              <button
                id="btn-link-apply-from-login"
                type="button"
                onClick={() => onOpenApply({ phone })}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center space-x-1 cursor-pointer"
              >
                <span>还没有账号？经销商 / 设计师申请入驻</span>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 text-center text-[10px] text-slate-400 pt-3">
        智家全屋智能定制系统 · 安全加密传输
      </div>

      {/* Full Agreement Text Modal */}
      <AgreementModal
        isOpen={Boolean(agreementType)}
        type={agreementType}
        onClose={() => setAgreementType(null)}
      />
    </div>
  );
};
