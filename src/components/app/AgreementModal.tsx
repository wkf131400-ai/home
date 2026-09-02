import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface AgreementModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const AgreementModal: React.FC<AgreementModalProps> = ({
  isOpen,
  type,
  onClose,
}) => {
  if (!isOpen || !type) return null;

  const isTerms = type === 'terms';

  return (
    <div
      id="agreement-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="agreement-modal-content"
        className="w-[calc(100vw-32px)] max-w-lg bg-white rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            {isTerms ? (
              <FileText className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="font-bold text-sm">
              {isTerms ? '智家全屋定制《用户服务协议》' : '智家全屋定制《隐私保护政策》'}
            </h3>
          </div>
          <button
            id="btn-close-agreement"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-4">
          {isTerms ? (
            <>
              <p className="font-bold text-slate-800">
                欢迎您使用智家全屋智能定制平台与服务！
              </p>
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-800">一、服务范围与定位</h4>
                <p>
                  智家平台为智能家居经销商、室内设计师、工程服务商及终端业主提供全屋智能方案设计、设备选配、BOM清单算量、物流履约及商务对接服务。
                </p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-800">二、账号安全与入驻资质</h4>
                <p>
                  用户需保证所填写的手机号码及入驻资料真实有效。经销商和设计师申请入驻需经平台商务经理核验资质后方可享有专属方案折扣及项目报备保护。
                </p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-800">三、方案版权与知识产权</h4>
                <p>
                  平台提供的预设模板与AI生成方案供方案深化与报价参考。用户在平台生成的私有项目方案数据享有完整使用与导出权限。
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="font-bold text-slate-800">
                智家深知个人隐私及商户信息安全的重要性，我们将严格按照法律法规保护您的数据安全。
              </p>
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-800">一、我们如何收集与使用信息</h4>
                <p>
                  为提供验证码登录、商务对接及物流履约服务，我们需要收集您的手机号码、称呼及项目城市信息。入驻申请时填写的公司与资质信息仅用于商务经理审核与对接。
                </p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-800">二、信息安全保障</h4>
                <p>
                  我们采用金融级传输加密（TLS/HTTPS）及多层权限隔离机制，防止您的项目数据与联系方式发生泄露或非授权访问。
                </p>
              </section>
              <section className="space-y-1.5">
                <h4 className="font-bold text-slate-800">三、您的数据权利</h4>
                <p>
                  您可随时在个人中心查看、修改或注销账户信息，或导出您的方案与报价数据。
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            我已了解
          </button>
        </div>
      </div>
    </div>
  );
};
