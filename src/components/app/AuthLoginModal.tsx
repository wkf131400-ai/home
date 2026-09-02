import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  RotateCcw,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { UserProfile, Customer } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';
import { AgreementModal } from './AgreementModal';
import { ApplyFormData } from './MerchantApplyPage';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenApply: (initialData?: ApplyFormData) => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onOpenApply,
}) => {
  const [phone, setPhone] = useState(currentUser?.phone || '17696180841');
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(true);

  // Agreement full text modal
  const [agreementType, setAgreementType] = useState<'terms' | 'privacy' | null>(null);

  // Toast message
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Interception states
  const [unregisteredPrompt, setUnregisteredPrompt] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState(false);
  const [rejectedInfo, setRejectedInfo] = useState<{
    phone: string;
    name: string;
    reason: string;
    role?: string;
    company?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUnregisteredPrompt(false);
      setPendingPrompt(false);
      setRejectedInfo(null);
      if (currentUser?.phone) {
        setPhone(currentUser.phone);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const handleSendSms = () => {
    if (!phone || phone.length < 11) {
      showToast('请输入11位有效手机号码', 'error');
      return;
    }
    setCountdown(60);
    setSmsCode('8888');
    showToast('短信验证码已发送');
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

    // 1. Phone check
    if (!phone || phone.length < 11) {
      showToast('请输入正确的11位手机号码', 'error');
      return;
    }

    // 2. SMS code check
    if (!smsCode) {
      showToast('请输入短信验证码', 'error');
      return;
    }

    // 3. Agreement check
    if (!agreed) {
      showToast('请先阅读并同意协议', 'error');
      return;
    }

    // Lookup customer & merchant database
    const customers = AdminStorageManager.getCustomers();
    const customer = customers.find((c) => c.phone === phone);

    // Fallback predefined recognized numbers
    const predefinedAccounts: Record<
      string,
      { name: string; status: 'approved' | 'pending' | 'rejected'; feedback?: string }
    > = {
      '17696180841': { name: '卫科帆', status: 'approved' },
      '13800138000': { name: '李明 (业主)', status: 'approved' },
      '13912345678': { name: '张先生', status: 'approved' },
      '13901018899': { name: '张总 (高端业主)', status: 'pending' },
      '13718889900': {
        name: '陈女士',
        status: 'rejected',
        feedback: '营业执照信息不清晰，请重新提交',
      },
    };

    const predefined = predefinedAccounts[phone];

    // CASE 1: UNREGISTERED PHONE INTERCEPTION
    if (!customer && !predefined) {
      setUnregisteredPrompt(true);
      return;
    }

    const auditStatus = customer?.auditStatus || predefined?.status || 'approved';
    const auditFeedback =
      customer?.auditFeedback ||
      predefined?.feedback ||
      '营业执照信息不清晰，请重新提交';
    const userName = customer?.name || predefined?.name || `智家用户_${phone.slice(-4)}`;

    // CASE 2: PENDING AUDIT INTERCEPTION
    if (auditStatus === 'pending') {
      setPendingPrompt(true);
      return;
    }

    // CASE 3: REJECTED AUDIT INTERCEPTION
    if (auditStatus === 'rejected') {
      setRejectedInfo({
        phone,
        name: userName,
        reason: auditFeedback,
        role: customer?.category === '家装客户' ? '室内设计师' : '经销商',
        company: customer?.projectName || '',
      });
      return;
    }

    // CASE 4: APPROVED / NORMAL LOGIN SUCCESS
    const userProfile: UserProfile = {
      id: customer ? customer.id : 'usr_' + phone.slice(-4),
      phone,
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
      onClose();
    }, 400);
  };

  return (
    <>
      <div
        id="auth-login-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none"
        onClick={onClose}
      >
        <div
          id="auth-login-modal-card"
          className="w-[calc(100vw-32px)] max-w-sm sm:max-w-md bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative animate-scaleUp border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Compact Brand Area (高度约 100px) */}
          <div
            className="h-[100px] relative overflow-hidden shrink-0 flex flex-col justify-center px-6 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')`,
            }}
          >
            {/* Dark Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90 z-0" />

            {/* Close Button Top-Left */}
            <button
              id="btn-close-login-modal"
              type="button"
              onClick={onClose}
              className="absolute top-3 left-3 z-20 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/90 border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
              title="关闭"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Header */}
            <div className="relative z-10 space-y-0.5 text-center">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-semibold mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>智家全屋定制</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight drop-shadow-md">
                欢迎登录智家
              </h2>
            </div>
          </div>

          {/* Form / Notice Area (纯白色表单区，左右内边距 24px，上下 20px) */}
          <div className="px-6 py-5 flex-1 overflow-y-auto flex flex-col justify-between">
            {/* Floating Toast Notification inside modal */}
            {toastMsg && (
              <div
                id="modal-toast"
                className={`fixed top-12 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl shadow-xl flex items-center space-x-1.5 text-xs font-bold border animate-fadeIn ${
                  toastMsg.type === 'success'
                    ? 'bg-slate-900 text-white border-emerald-500/50'
                    : 'bg-rose-900 text-white border-rose-500/50'
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

            {/* INTERCEPTION STATE 1: UNREGISTERED PHONE */}
            {unregisteredPrompt ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn my-auto">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">该手机号尚未申请入驻</h3>
                  <p className="text-xs text-slate-500 leading-relaxed px-2">
                    手机号 <span className="font-mono font-bold text-slate-800">{phone}</span>{' '}
                    未在平台登记，请先提交经销商 / 设计师入驻申请。
                  </p>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    id="btn-go-apply-unregistered"
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenApply({ phone });
                    }}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>去申请入驻</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnregisteredPrompt(false)}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    返回更换手机号
                  </button>
                </div>
              </div>
            ) : pendingPrompt ? (
              /* INTERCEPTION STATE 2: PENDING AUDIT */
              <div className="space-y-4 text-center py-2 animate-fadeIn my-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                  <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-slate-900">账号审核中</h3>
                  <p className="text-xs text-slate-600 leading-relaxed px-3">
                    账号审核中，预计 1 个工作日内完成，请耐心等待。
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-left text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>申请手机号:</span>
                    <span className="font-bold font-mono text-slate-900">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>当前状态:</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      商务核验中
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    id="btn-dismiss-pending"
                    type="button"
                    onClick={() => setPendingPrompt(false)}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center"
                  >
                    <span>我知道了</span>
                  </button>
                </div>
              </div>
            ) : rejectedInfo ? (
              /* INTERCEPTION STATE 3: REJECTED AUDIT */
              <div className="space-y-4 text-center py-2 animate-fadeIn my-auto">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">入驻审核未通过</h3>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-left mt-2 space-y-1">
                    <span className="text-[10px] font-bold text-rose-600 block">驳回原因：</span>
                    <p className="text-xs font-semibold text-rose-900 leading-relaxed">
                      {rejectedInfo.reason}
                    </p>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <button
                    id="btn-reapply-rejected"
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenApply({
                        phone: rejectedInfo.phone,
                        name: rejectedInfo.name,
                        role: rejectedInfo.role || '经销商',
                        companyName: rejectedInfo.company || '',
                        rejectReason: rejectedInfo.reason,
                      });
                    }}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重新提交资料</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectedInfo(null)}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    返回更换账号
                  </button>
                </div>
              </div>
            ) : (
              /* NORMAL LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="flex flex-col justify-between h-full">
                {/* Inputs Group (间距 16px, 高度 48px) */}
                <div className="space-y-4">
                  {/* 1. 手机号输入框 */}
                  <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3.5 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                    <span className="text-xs font-bold text-slate-400 font-mono pr-2.5 border-r border-slate-200 shrink-0">
                      +86
                    </span>
                    <input
                      id="input-login-phone"
                      type="tel"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="请输入11位手机号"
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

                  {/* 2. 短信验证码输入框 */}
                  <div className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-3.5 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                    <input
                      id="input-login-code"
                      type="text"
                      maxLength={6}
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="输入短信验证码"
                      className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                      required
                    />
                    <button
                      id="btn-get-login-code"
                      type="button"
                      disabled={countdown > 0}
                      onClick={handleSendSms}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                        countdown > 0
                          ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                          : 'text-slate-900 bg-slate-200/80 hover:bg-slate-200'
                      }`}
                    >
                      {countdown > 0 ? `重新获取(${countdown}s)` : '获取验证码'}
                    </button>
                  </div>

                  {/* 3. 协议勾选行 (在登录按钮上方) */}
                  <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-600 select-none">
                    <button
                      id="checkbox-protocol"
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
                </div>

                {/* Actions: 登录按钮 (间距 24px) + 底部申请入驻文字链 (间距 16px, 底部留 20px) */}
                <div className="mt-6 space-y-4 pb-1">
                  {/* 登录按钮 (高度 48px) */}
                  <button
                    id="btn-submit-login"
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>登 录</span>
                  </button>

                  {/* 底部唯一注册入口文字链 */}
                  <div className="text-center">
                    <button
                      id="btn-link-apply-merchant"
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenApply({ phone });
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>还没有账号？经销商 / 设计师申请入驻</span>
                      <span className="text-slate-400">→</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Full Agreement Text Modal */}
      <AgreementModal
        isOpen={Boolean(agreementType)}
        type={agreementType}
        onClose={() => setAgreementType(null)}
      />
    </>
  );
};
