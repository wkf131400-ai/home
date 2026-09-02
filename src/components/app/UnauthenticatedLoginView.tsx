import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  User,
  ArrowRight,
  CheckCircle2,
  Building2,
  Phone,
  FileEdit,
  Sparkles,
  Lock,
  UserPlus,
  LogIn,
  BadgeCheck,
  Clock,
  HelpCircle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, Customer } from '../../types';
import { AdminStorageManager } from '../../utils/adminStorage';

interface UnauthenticatedLoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueAsGuest?: () => void;
}

export const UnauthenticatedLoginView: React.FC<UnauthenticatedLoginViewProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('17696180841');
  const [loginCode, setLoginCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginMethod, setLoginMethod] = useState<'sms' | 'password'>('sms');
  const [countdown, setCountdown] = useState(0);

  // Register form state
  const [regPhone, setRegPhone] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regCountdown, setRegCountdown] = useState(0);

  // Status & Error
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Send SMS Code
  const handleSendSms = (type: 'login' | 'reg') => {
    const phone = type === 'login' ? loginPhone : regPhone;
    if (!phone || phone.length < 11) {
      setErrorMsg('请输入11位手机号码');
      return;
    }
    setErrorMsg('');
    if (type === 'login') {
      setCountdown(60);
      setLoginCode('8888');
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setRegCountdown(60);
      setRegCode('8888');
      const timer = setInterval(() => {
        setRegCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || loginPhone.length < 11) {
      setErrorMsg('请输入正确的11位手机号码');
      return;
    }

    const defaultNames: Record<string, string> = {
      '17696180841': '卫科帆',
      '13800138000': '李明 (业主)',
      '13912345678': '陈总',
    };

    const isPendingAccount = loginPhone === '13912345678';

    const profile: UserProfile = {
      id: 'usr_' + loginPhone.slice(-4),
      phone: loginPhone,
      name: defaultNames[loginPhone] || `智家用户_${loginPhone.slice(-4)}`,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleTitle: isPendingAccount ? '新注册客户 (待审核)' : '智家全屋定制用户',
      city: '北京市 / 朝阳区',
      communityName: isPendingAccount ? '西山壹号院' : '万科翡翠公园',
      customNotes: isPendingAccount
        ? '新注册业主，全屋4居室计划下周量房，等待Web端后台审核指派商务。'
        : '老客户深度定制，全屋智能窗帘与磁吸调光已选配完成。',
      isLoggedIn: true,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16),
      auditStatus: isPendingAccount ? 'pending' : 'certified',
      consultantName: isPendingAccount ? '待商务分配' : '王浩 (专属经理)',
      consultantPhone: isPendingAccount ? '-' : '186-0010-8899',
    };

    AdminStorageManager.saveUserProfile(profile);
    setSuccessMsg('登录成功！正在进入工作台...');
    setTimeout(() => {
      onLoginSuccess(profile);
    }, 600);
  };

  // Submit Register
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || regPhone.length < 11) {
      setErrorMsg('请输入11位手机号码');
      return;
    }
    if (!regCode) {
      setErrorMsg('请输入短信验证码 (演示填 8888)');
      return;
    }
    if (!regNotes.trim()) {
      setErrorMsg('请输入审核备注');
      return;
    }

    const nowTime = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16);

    try {
      const existingCustomers = AdminStorageManager.getCustomers();
      const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        code: `CUST-${String(existingCustomers.length + 1).padStart(3, '0')}`,
        name: `申请用户_${regPhone.slice(-4)}`,
        projectName: '全屋智能方案项目',
        phone: regPhone.trim(),
        followUpStatus: '待后台审核',
        status: '意向客户',
        deliveryStatus: '未交付',
        priceGrade: '高端级别',
        salesperson: '待指派商务',
        creator: '客户自助注册',
        createdAt: nowTime,
        updatedAt: nowTime,
        isPool: true,
        region: '北京-朝阳',
        detailAddress: '待定',
        source: '线上注册',
        level: '普通客户',
        category: '家装客户',
        remark: regNotes.trim(),
        customNotes: regNotes.trim(),
        auditStatus: 'pending',
      };

      AdminStorageManager.saveCustomers([newCustomer, ...existingCustomers]);
    } catch (err) {
      console.error('Failed to sync registered customer', err);
    }

    setSuccessMsg('注册申请已提交！需等待后台审核通过后方可登录。');
    setTimeout(() => {
      setAuthMode('login');
      setSuccessMsg('');
    }, 2500);
  };

  // Quick switch role
  const handleQuickSwitch = (
    name: string,
    phoneNum: string,
    community: string,
    audit: 'certified' | 'pending'
  ) => {
    const profile: UserProfile = {
      id: 'usr_' + phoneNum.slice(-4),
      phone: phoneNum,
      name: name,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleTitle: audit === 'certified' ? '智家全屋定制用户' : '新注册客户 (待审核)',
      city: '北京市 / 朝阳区',
      communityName: community,
      customNotes:
        audit === 'pending'
          ? '新提交注册客户，等待 Web 端后台商务核价与审核'
          : '万科翡翠公园 3居室 KNX智能调光方案已确认',
      isLoggedIn: true,
      createdAt: '2026-08-20 10:00',
      auditStatus: audit,
      consultantName: audit === 'certified' ? '王浩 (专属经理)' : '待分配',
      consultantPhone: audit === 'certified' ? '186-0010-8899' : '-',
    };

    AdminStorageManager.saveUserProfile(profile);
    onLoginSuccess(profile);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-8 max-w-lg mx-auto">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-slate-700/80 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black shadow-inner">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">智家方案定制 · 客户中心</h2>
                <p className="text-[11px] text-slate-300">登录或注册即可保存专属全屋方案与跟进进度</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
              未登录
            </span>
          </div>

          <div className="pt-2 text-[11px] text-slate-300 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>新客户注册后，Web 后台商务将实时接收并审核方案需求</span>
          </div>
        </div>
      </div>

      {/* Main Switcher Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>客户登录</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>新客户注册</span>
          </button>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center space-x-1.5 animate-fadeIn font-medium">
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-1.5 animate-fadeIn font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">手机号码</label>
              <div className="flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="请输入11位注册手机号"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-transparent outline-none font-mono"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            {loginMethod === 'sms' ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">短信验证码</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="验证码"
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value)}
                      className="w-full text-xs text-slate-900 bg-transparent outline-none font-mono"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendSms('login')}
                    disabled={countdown > 0}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                      countdown > 0
                        ? 'bg-slate-100 text-slate-400 border border-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
                  </button>
                </div>
                {countdown > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-1">演示默认测试验证码: 8888</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">登录密码</label>
                <div className="flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 transition-colors">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="password"
                    placeholder="请输入密码"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-transparent outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setLoginMethod(loginMethod === 'sms' ? 'password' : 'sms')}
                className="text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
              >
                {loginMethod === 'sms' ? '使用密码登录' : '使用手机验证码登录'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                }}
                className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
              >
                还没有账号？去注册 »
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 mt-2"
            >
              <span>立即登录</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                手机号码 <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 transition-colors">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="请输入11位手机号码"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs text-slate-900 bg-transparent outline-none font-mono"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                短信验证码 <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-2 border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="验证码 (演示填 8888)"
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value)}
                    className="w-full text-xs text-slate-900 bg-transparent outline-none font-mono"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSendSms('reg')}
                  disabled={regCountdown > 0}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                    regCountdown > 0
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer'
                  }`}
                >
                  {regCountdown > 0 ? `${regCountdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>审核备注 <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-400">后台审核依据</span>
              </label>
              <div className="border border-slate-300 rounded-xl p-2 bg-slate-50 focus-within:bg-white focus-within:border-slate-900 transition-colors">
                <textarea
                  rows={3}
                  placeholder="请输入注册审核申请备注（如：所属项目、合作意向、申请开通理由等）"
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  className="w-full text-xs text-slate-800 bg-transparent outline-none resize-none leading-relaxed"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 mt-2"
            >
              <span>提交注册申请 (等待后台审核)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Quick Switch Demo Accounts */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold">快捷一键体验不同客户角色：</span>
            <span>演示模式</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() =>
                handleQuickSwitch('卫科帆', '17696180841', '万科翡翠公园', 'certified')
              }
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-800 block truncate">卫科帆</span>
              <span className="text-[9px] text-emerald-600 font-semibold block truncate">
                已认证业主
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSwitch('李明', '13800138000', '保利天汇', 'certified')
              }
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-800 block truncate">李明</span>
              <span className="text-[9px] text-emerald-600 font-semibold block truncate">
                精装两居
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickSwitch('陈总', '13912345678', '西山壹号院', 'pending')
              }
              className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-800 block truncate">陈总</span>
              <span className="text-[9px] text-amber-600 font-semibold block truncate">
                待Web端审核
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
