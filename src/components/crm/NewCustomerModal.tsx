import React, { useState } from 'react';
import { X, Plus, ChevronRight } from 'lucide-react';
import { Customer, CustomerStatus, CustomerLevel, CustomerType, PriceGrade } from '../../types';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  defaultIsPool?: boolean;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultIsPool = true,
}) => {
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('资源客户');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('北京-北京-朝阳');
  const [detailAddress, setDetailAddress] = useState('');
  const [source, setSource] = useState('上门用户');
  const [level, setLevel] = useState<CustomerLevel>('普通客户');
  const [category, setCategory] = useState<CustomerType>('家装客户');
  const [designer, setDesigner] = useState('');
  const [salesperson, setSalesperson] = useState('卫科帆');
  const [firstContactDate, setFirstContactDate] = useState('2026-08-18');
  const [houseArea, setHouseArea] = useState('');
  const [houseLayout, setHouseLayout] = useState('两室两厅');
  const [channel, setChannel] = useState('暂无');
  const [requirement, setRequirement] = useState('');
  const [remark, setRemark] = useState('');
  const [priceGrade, setPriceGrade] = useState<PriceGrade>('普通级别');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectName.trim()) return;

    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      code: `KH${Date.now().toString().slice(-8)}`,
      name: name.trim(),
      projectName: projectName.trim(),
      phone: phone.trim() || '17696180841',
      followUpStatus: '未跟进',
      status,
      deliveryStatus: '未交付',
      priceGrade,
      salesperson,
      creator: '卫科帆',
      createdAt: '08-18 16:28',
      updatedAt: '08-18 16:28',
      isPool: defaultIsPool,
      region,
      detailAddress: detailAddress.trim() || '北京顺义区大槐树镇',
      source,
      level,
      category,
      designer: designer.trim() || '测试',
      firstContactDate,
      houseArea: houseArea.trim() || '120',
      houseLayout,
      channel,
      requirement: requirement.trim() || '全屋智能方案设计',
      remark: remark.trim() || '暂无',
      wechat: `wx_${name}`,
    };

    onSave(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fadeIn">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-sm font-bold text-slate-800">新增客户</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 text-xs space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 基本信息 */}
          <div>
            <div className="flex items-center space-x-1 mb-3">
              <span className="font-bold text-slate-900 border-b-2 border-blue-600 pb-0.5">基本信息</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  <span className="text-rose-500">*</span> 客户姓名:
                </label>
                <input
                  type="text"
                  required
                  placeholder="请输入客户姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  <span className="text-rose-500">*</span> 项目名称:
                </label>
                <input
                  type="text"
                  required
                  placeholder="请输入项目名称"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  <span className="text-rose-500">*</span> 客户状态:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="资源客户">资源客户</option>
                  <option value="意向客户">意向客户</option>
                  <option value="签约客户">签约客户</option>
                  <option value="丢单客户">丢单客户</option>
                </select>
              </div>
            </div>
          </div>

          {/* 补充信息 */}
          <div>
            <div className="flex items-center justify-between mb-3 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900 border-b-2 border-blue-600 pb-0.5">补充信息</span>
              <button type="button" className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer">
                <span>自定义字段</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">客户电话:</label>
                <input
                  type="text"
                  placeholder="请输入客户电话"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">所属地区:</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="北京-北京-朝阳">北京-北京-朝阳</option>
                  <option value="北京-北京-海淀">北京-北京-海淀</option>
                  <option value="上海-上海-浦东">上海-上海-浦东</option>
                  <option value="广东-广州-天河">广东-广州-天河</option>
                  <option value="广东-深圳-南山">广东-深圳-南山</option>
                  <option value="浙江-杭州-滨江">浙江-杭州-滨江</option>
                  <option value="福建-厦门-思明">福建-厦门-思明</option>
                  <option value="江苏-南京-建邺">江苏-南京-建邺</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">详细地址:</label>
                <input
                  type="text"
                  placeholder="请输入详细地址"
                  value={detailAddress}
                  onChange={(e) => setDetailAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">客户来源:</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="上门用户">上门用户</option>
                  <option value="朋友推荐">朋友推荐</option>
                  <option value="广告投放">广告投放</option>
                  <option value="渠道介绍">渠道介绍</option>
                  <option value="装修公司">装修公司</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">客户级别:</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as CustomerLevel)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="普通客户">普通客户</option>
                  <option value="重要客户">重要客户</option>
                  <option value="VIP客户">VIP客户</option>
                  <option value="战略客户">战略客户</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">客户类别:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CustomerType)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="家装客户">家装客户</option>
                  <option value="工装客户">工装客户</option>
                  <option value="别墅项目">别墅项目</option>
                  <option value="大平层">大平层</option>
                  <option value="展示厅">展示厅</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">家装设计师:</label>
                <input
                  type="text"
                  placeholder="请输入家装设计师"
                  value={designer}
                  onChange={(e) => setDesigner(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">销售顾问:</label>
                <select
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="卫科帆">卫科帆</option>
                  <option value="李明">李明</option>
                  <option value="王工">王工</option>
                  <option value="陈工">陈工</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">初次接触时间:</label>
                <input
                  type="date"
                  value={firstContactDate}
                  onChange={(e) => setFirstContactDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">房屋面积 (㎡):</label>
                <input
                  type="number"
                  placeholder="请输入房屋面积"
                  value={houseArea}
                  onChange={(e) => setHouseArea(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">房屋户型:</label>
                <select
                  value={houseLayout}
                  onChange={(e) => setHouseLayout(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="两室两厅">两室两厅</option>
                  <option value="三室两厅">三室两厅</option>
                  <option value="四室两厅">四室两厅</option>
                  <option value="跃层复式">跃层复式</option>
                  <option value="独栋别墅">独栋别墅</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">关联渠道:</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="暂无">暂无</option>
                  <option value="居然之家">居然之家</option>
                  <option value="红星美凯龙">红星美凯龙</option>
                  <option value="圣都家装">圣都家装</option>
                  <option value="独立设计师联盟">独立设计师联盟</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">客户需求:</label>
                <input
                  type="text"
                  placeholder="请输入客户需求"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">备注:</label>
                <input
                  type="text"
                  placeholder="请输入备注"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">价格等级:</label>
                <select
                  value={priceGrade}
                  onChange={(e) => setPriceGrade(e.target.value as PriceGrade)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="普通级别">普通级别</option>
                  <option value="高端级别">高端级别</option>
                  <option value="尊享级别">尊享级别</option>
                </select>
              </div>
            </div>

            {/* 附件 */}
            <div className="mt-4">
              <label className="block text-slate-700 font-medium mb-1.5">附件:</label>
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50">
                <Plus className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
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
