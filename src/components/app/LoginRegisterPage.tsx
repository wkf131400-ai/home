import React, { useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  User,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Customer } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';

export type AuthMode = 'login' | 'register';

interface LoginRegisterPageProps {
  initialMode?: 'login' | 'register';
  onBack?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginRegisterPage: React.FC<LoginRegisterPageProps> = ({
  initialMode = 'login',
  onBack,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(
    initialMode === 'register' ? 'register' : 'login'
  );

  // Login Form States
  const [loginPhone, setLoginPhone] = useState('17696180841');
  const [loginCode, setLoginCode] = useState('8888');
  const [loginCountdown, setLoginCountdown] = useState(0);

  // Register Form States (手机号, 验证码, 名称)
  const [regPhone, setRegPhone] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regName, setRegName] = useState('');
  const [regCountdown, setRegCountdown] = useState(0);

  // Registration Submitted State for Audit Notice
  const [isRegisteredSubmitted, setIsRegisteredSubmitted] = useState(false);
  const [registeredUserData, setRegisteredUserData] = useState<{
    phone: string;
    name: string;
  } | null>(null);

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

  // Send SMS verification code
  const handleSendCode = (isRegister: boolean) => {
    const targetPhone = isRegister ? regPhone : loginPhone;
    if (!targetPhone || targetPhone.length < 11) {
      showToast('请输入11位有效手机号码', 'error');
      return;
    }

    if (isRegister) {
      setRegCountdown(60);
      setRegCode('8888');
      showToast('验证码已发送 (演示验证码: 8888)');
      const timer = setInterval(() => {
        setRegCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setLoginCountdown(60);
      setLoginCode('8888');
      showToast('验证码已发送 (演示验证码: 8888)');
      const timer = setInterval(() => {
        setLoginCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || loginPhone.length < 11) {
      showToast('请输入正确的11位手机号码', 'error');
      return;
    }
    if (!loginCode) {
      showToast('请输入短信验证码', 'error');
      return;
    }

    // Lookup CRM customer database
    const existingCustomers = AdminStorageManager.getCustomers();
    const customer = existingCustomers.find((c) => c.phone === loginPhone);

    const defaultNames: Record<string, string> = {
      '17696180841': '卫科帆',
      '13800138000': '李明 (业主)',
      '13901018899': '张总 (高端业主)',
      '13718889900': '陈女士',
    };

    const userName =
      customer?.name ||
      defaultNames[loginPhone] ||
      (loginPhone === regPhone && regName ? regName : `智家客户_${loginPhone.slice(-4)}`);

    const profile: UserProfile = {
      id: customer ? customer.id : 'usr_' + loginPhone.slice(-4),
      phone: loginPhone,
      name: userName,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleTitle: '智家全屋定制用户',
      city: customer?.region || '北京市 / 朝阳区',
      communityName: customer?.community || '万科翡翠公园',
      customNotes: customer?.customNotes || '全屋智能方案已确认。',
      isLoggedIn: true,
      createdAt:
        customer?.createdAt ||
        new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
      auditStatus: customer?.auditStatus || 'approved',
      consultantName: customer?.salesperson || '王浩 (专属商务经理)',
    };

    AdminStorageManager.saveUserProfile(profile);
    showToast(`登录成功，欢迎 ${userName}！`);
    setTimeout(() => {
      onLoginSuccess(profile);
    }, 400);
  };

  // Handle Register Submit
  // Registered info: 手机号, 验证码, 名称; 点击注册提示: 将尽快安排商务审核!
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!regPhone || regPhone.length < 11) {
      showToast('请输入正确的11位手机号', 'error');
      return;
    }
    if (!regCode) {
      showToast('请输入验证码 (演示填 8888)', 'error');
      return;
    }
    if (!regName.trim()) {
      showToast('请输入您的名称或称呼', 'error');
      return;
    }

    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16);

    // Save to CRM customer database with status pending audit
    try {
      const existingCustomers = AdminStorageManager.getCustomers();
      const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        code: `CUST-${String(existingCustomers.length + 1).padStart(3, '0')}`,
        name: regName.trim(),
        phone: regPhone.trim(),
        community: '全屋智能定制项目',
        customNotes: `客户自助注册申请，称呼：${regName.trim()}，等待商务审核与方案对接。`,
        region: '北京-朝阳',
        detailAddress: '待定',
        source: 'App端自助注册',
        projectName: '全屋智能定制项目',
        isPool: true,
        auditStatus: 'pending',
        status: '意向客户',
        followUpStatus: '待后台商务审核',
        deliveryStatus: '未交付',
        priceGrade: '高端级别',
        salesperson: '待指派商务经理',
        creator: 'App注册',
        level: '普通客户',
        category: '家装客户',
        createdAt: nowTime,
        updatedAt: nowTime,
      };

      AdminStorageManager.saveCustomers([newCustomer, ...existingCustomers]);
    } catch (err) {
      console.error(err);
    }

    // 提示: 将尽快安排商务审核!
    showToast('将尽快安排商务审核!');
    setRegisteredUserData({
      phone: regPhone.trim(),
      name: regName.trim(),
    });
    setIsRegisteredSubmitted(true);
  };

  return (
    <div
      id="login-register-page"
      className="relative flex-1 min-h-full w-full flex flex-col justify-center items-center overflow-y-auto bg-cover bg-center select-none py-8 px-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')`,
      }}
    >
      {/* Dark Ambient Gradient Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90 backdrop-blur-[2px] z-0" />

      {/* Top Header & Back Button */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-3.5 flex items-center justify-between">
        {onBack ? (
          <button
            id="btn-back-auth"
            onClick={onBack}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
            title="返回"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[11px] font-semibold shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>智家全屋定制</span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          id="auth-toast-notification"
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

      {/* Perfectly Centered Interactive Auth Card & Header */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-4 my-auto">
        {/* Brand Welcome Hero Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            {tab === 'register' ? '客户快速注册' : '欢迎登录智家'}
          </h1>
          <p className="text-xs text-slate-300 font-medium drop-shadow-sm">
            {tab === 'register'
              ? '填写基本信息，开启专属全屋智能方案'
              : '登录后即可保存方案、跟踪物流与商务审核'}
          </p>
        </div>

        {/* Clean Centered Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/40 space-y-4">
          {/* Tab Switcher: 登录 | 注册 */}
          {!isRegisteredSubmitted && (
            <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl">
              <button
                id="tab-btn-login"
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tab === 'login'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>登 录</span>
              </button>

              <button
                id="tab-btn-register"
                type="button"
                onClick={() => setTab('register')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  tab === 'register'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>注 册</span>
              </button>
            </div>
          )}

          {/* REGISTER SUBMITTED SUCCESS VIEW */}
          {isRegisteredSubmitted ? (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-7 h-7 text-amber-600 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900">
                  将尽快安排商务审核!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed px-2">
                  您提交的客户信息已送达后台，专属商务经理正在为您核验资质与方案需求。
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>客户名称:</span>
                  <span className="font-bold text-slate-900">{registeredUserData?.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>手机号码:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {registeredUserData?.phone}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>审核状态:</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
                    待商务审核
                  </span>
                </div>
              </div>

              <button
                id="btn-return-to-login"
                type="button"
                onClick={() => {
                  setIsRegisteredSubmitted(false);
                  setTab('login');
                  setLoginPhone(registeredUserData?.phone || '17696180841');
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>返回登录</span>
              </button>
            </div>
          ) : tab === 'register' ? (
            /* REGISTER FORM (手机号; 验证码; 名称) */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* 1. 手机号 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>手机号</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">11位手机号码</span>
                </label>
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                  <span className="text-xs font-bold text-slate-400 font-mono pr-2.5 border-r border-slate-200">
                    +86
                  </span>
                  <input
                    id="input-reg-phone"
                    type="tel"
                    maxLength={11}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入11位手机号码"
                    className="flex-1 pl-2.5 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                    required
                  />
                  {regPhone && (
                    <button
                      type="button"
                      onClick={() => setRegPhone('')}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. 验证码 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>验证码</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">演示验证码: 8888</span>
                </label>
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                  <input
                    id="input-reg-code"
                    type="text"
                    maxLength={6}
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    placeholder="输入验证码"
                    className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                    required
                  />
                  <button
                    id="btn-get-reg-code"
                    type="button"
                    disabled={regCountdown > 0}
                    onClick={() => handleSendCode(true)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      regCountdown > 0
                        ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                        : 'text-slate-900 bg-slate-200/80 hover:bg-slate-200'
                    }`}
                  >
                    {regCountdown > 0 ? `${regCountdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* 3. 名称 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>名称</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400">称呼或公司名</span>
                </label>
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                  <input
                    id="input-reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="请输入您的姓名或称呼"
                    className="flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Submit Register Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-register"
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>立即注册</span>
                </button>
              </div>
            </form>
          ) : (
            /* LOGIN FORM (手机号; 验证码) */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* 手机号 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>手机号码</span>
                  </span>
                  <span className="text-[10px] text-slate-400">已注册账号</span>
                </label>
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                  <span className="text-xs font-bold text-slate-400 font-mono pr-2.5 border-r border-slate-200">
                    +86
                  </span>
                  <input
                    id="input-login-phone"
                    type="tel"
                    maxLength={11}
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="请输入11位手机号"
                    className="flex-1 pl-2.5 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                    required
                  />
                  {loginPhone && (
                    <button
                      type="button"
                      onClick={() => setLoginPhone('')}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 验证码 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>短信验证码</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">演示验证码: 8888</span>
                </label>
                <div className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 flex items-center focus-within:border-slate-900 focus-within:bg-white transition-all">
                  <input
                    id="input-login-code"
                    type="text"
                    maxLength={6}
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    placeholder="输入验证码"
                    className="flex-1 bg-transparent text-xs text-slate-900 outline-none font-mono placeholder:text-slate-400"
                    required
                  />
                  <button
                    id="btn-get-login-code"
                    type="button"
                    disabled={loginCountdown > 0}
                    onClick={() => handleSendCode(false)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                      loginCountdown > 0
                        ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                        : 'text-slate-900 bg-slate-200/80 hover:bg-slate-200'
                    }`}
                  >
                    {loginCountdown > 0 ? `${loginCountdown}s` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* Submit Login Button */}
              <div className="pt-2">
                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>登 录</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
