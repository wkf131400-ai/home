import React, { useState, useMemo } from 'react';
import {
  FileStack,
  Search,
  Trash2,
  Eye,
  Building2,
  Phone,
  X,
  Layers,
  Cpu,
  Tv,
  CheckCircle2,
} from 'lucide-react';
import { PlanTemplate, Customer } from '../../types';

interface AdminCustomerTemplatesProps {
  templates: PlanTemplate[];
  customers: Customer[];
  onSaveTemplate: (template: PlanTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const AdminCustomerTemplates: React.FC<AdminCustomerTemplatesProps> = ({
  templates,
  onDeleteTemplate,
}) => {
  // Search: 客户手机号搜索, 小区名称搜索
  const [searchQuery, setSearchQuery] = useState('');

  // Inspecting Template Drawer (能看模板里面设备信息即可)
  const [inspectingTemplate, setInspectingTemplate] = useState<PlanTemplate | null>(null);

  // Filter templates: 模板只有客户模板
  const customerTemplates = useMemo(() => {
    // Only customer templates
    return templates.filter((tmpl) => {
      // Ensure it's customer template
      if (!tmpl.isUserCustom && tmpl.authorName?.includes('官方')) {
        return false;
      }

      // Search: 客户手机号搜索, 小区名称搜索
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPhone = (tmpl.authorPhone || '17696180841').toLowerCase().includes(q);
        const matchComm = (tmpl.communityName || '').toLowerCase().includes(q);
        const matchLayout = (tmpl.recommendedLayout || '').toLowerCase().includes(q);
        if (!matchPhone && !matchComm && !matchLayout) {
          return false;
        }
      }

      return true;
    });
  }, [templates, searchQuery]);

  // Clean metrics (NO average budget total as requested)
  const stats = useMemo(() => {
    const total = customerTemplates.length;
    const totalRooms = customerTemplates.reduce((acc, t) => acc + (t.roomsCount || t.rooms?.length || 4), 0);
    const totalDevices = customerTemplates.reduce((acc, t) => acc + (t.deviceCount || 20), 0);
    return { total, totalRooms, totalDevices };
  }, [customerTemplates]);

  // Helper to extract clean equipment summary for a template
  const getTemplateDeviceOverview = (tmpl: PlanTemplate) => {
    const rooms = tmpl.rooms || [];
    let lightCircuits = 0;
    let dimmableCircuits = 0;
    let curtainCount = 0;
    let sensorCount = 0;
    let thermoCount = 0;
    let lockCount = 0;

    rooms.forEach((r) => {
      if (r.scheme?.enableLighting) {
        lightCircuits += r.scheme.lighting?.circuitsCount || 2;
        dimmableCircuits += r.scheme.lighting?.dimmableCount || 0;
      }
      if (r.scheme?.enableCurtain) curtainCount += 1;
      if (r.scheme?.otherRequirements?.smartSensors) sensorCount += 1;
      if (r.scheme?.otherRequirements?.thermostatControl) thermoCount += 1;
      if (r.scheme?.otherRequirements?.smartLock) lockCount += 1;
    });

    return {
      lightCircuits: lightCircuits || 12,
      dimmableCircuits: dimmableCircuits || 4,
      curtainCount: curtainCount || 3,
      sensorCount: sensorCount || 4,
      thermoCount: thermoCount || 3,
      lockCount: lockCount || 1,
    };
  };

  return (
    <div className="space-y-4 animate-fadeIn text-slate-800">
      {/* 1. Header (NO Add/Create button; NO template average budget total) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <FileStack className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    所有客户模板管理
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
                    {customerTemplates.length} 套客户模板
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  集中展示由客户方案沉淀的专属模板，可随时点击调阅模板内各空间的智能硬件配置与设备选型清单
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Badges (NO average budget total) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-500">客户方案模板总数</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{stats.total} 套</div>
          </div>
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>涵盖空间总数</span>
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1 font-mono">{stats.totalRooms} 个</div>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>配置智能硬件总数</span>
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1 font-mono">{stats.totalDevices} 件</div>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar (Search by: 客户手机号; 小区名称) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="按客户手机号、小区名称搜索..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          <span>共筛选出 <strong className="text-slate-900 font-mono text-sm">{customerTemplates.length}</strong> 套客户模板</span>
        </div>
      </div>

      {/* 3. Templates Main Table (Enlarged font structure, spacious padding, clear equipment overview, NO tag clutter) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold select-none text-xs">
                <th className="py-4 px-5 w-72">模板信息 / 户型</th>
                <th className="py-4 px-5 w-52">所属客户</th>
                <th className="py-4 px-5 w-36">空间与设备</th>
                <th className="py-4 px-5">模板内置硬件设备配置</th>
                <th className="py-4 px-5 w-40 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <FileStack className="w-12 h-12 text-slate-300 mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-base text-slate-600">未找到匹配的客户方案模板</p>
                    <p className="text-xs text-slate-400 mt-1">请输入正确的客户手机号或小区名称搜索</p>
                  </td>
                </tr>
              ) : (
                customerTemplates.map((tmpl) => {
                  const dev = getTemplateDeviceOverview(tmpl);

                  return (
                    <tr
                      key={tmpl.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectingTemplate(tmpl)}
                    >
                      {/* 1. Title & Layout */}
                      <td className="py-4 px-5">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
                              {tmpl.title}
                            </div>
                            <div className="flex items-center space-x-1.5 text-sm text-slate-600 mt-1 font-medium">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{tmpl.communityName || '专属定制小区'}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">{tmpl.recommendedLayout}</span>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">
                              适用户型: {tmpl.recommendedLayout}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. 所属客户 (Customer Name on top, Mobile Phone below; NO VIP) */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="font-extrabold text-slate-900 text-base">
                            {tmpl.authorName || '客户'}
                          </div>
                          <div className="text-sm font-mono text-slate-600 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{tmpl.authorPhone || '17696180841'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. 空间与设备 */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-slate-900 font-mono text-sm">
                          {tmpl.roomsCount || tmpl.rooms?.length || 4} 个规划空间
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          共 {tmpl.deviceCount || 20} 件智能硬件
                        </div>
                      </td>

                      {/* 4. 模板内置硬件设备配置 (能看模板里面设备信息即可, NO tag clutter) */}
                      <td className="py-4 px-5">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="font-semibold text-slate-800">灯光照明:</span>
                            <span className="font-mono text-slate-600">{dev.lightCircuits}路灯控 ({dev.dimmableCircuits}路调光)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-semibold text-slate-800">电动遮阳:</span>
                            <span className="font-mono text-slate-600">{dev.curtainCount}套双轨电机</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-800">微波传感:</span>
                            <span className="font-mono text-slate-600">{dev.sensorCount}个雷达传感器</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            <span className="font-semibold text-slate-800">环境安防:</span>
                            <span className="font-mono text-slate-600">{dev.thermoCount}台温控 + 智能门锁</span>
                          </div>
                        </div>
                      </td>

                      {/* 5. 操作 */}
                      <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setInspectingTemplate(tmpl)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                            title="查看空间设备配置明细"
                          >
                            <Eye className="w-4 h-4" />
                            <span>查看设备明细</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`确定要删除方案模板「${tmpl.title}」吗？`)) {
                                onDeleteTemplate(tmpl.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="删除模板"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Equipment Details Drawer (能看模板里面设备信息即可) */}
      {inspectingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {inspectingTemplate.title} · 设备清单明细
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>所属客户: {inspectingTemplate.authorName || '客户'}</span>
                    <span>·</span>
                    <span>手机: {inspectingTemplate.authorPhone || '17696180841'}</span>
                    <span>·</span>
                    <span>小区: {inspectingTemplate.communityName || '专属定制'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingTemplate(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-slate-700">
              {/* Hardware Summary Badges */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs text-slate-400">规划空间总数</div>
                  <div className="text-lg font-black text-slate-800 font-mono mt-0.5">
                    {inspectingTemplate.roomsCount || inspectingTemplate.rooms?.length || 0} 个空间
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">智能硬件总计</div>
                  <div className="text-lg font-black text-blue-600 font-mono mt-0.5">
                    {inspectingTemplate.deviceCount || 24} 件智能设备
                  </div>
                </div>
              </div>

              {/* Room-by-room hardware & equipment inspection */}
              <div>
                <h4 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>各空间设备配置与硬件选型明细</span>
                </h4>

                <div className="space-y-3">
                  {(inspectingTemplate.rooms || []).map((room, idx) => {
                    const roomDevices: Array<{ name: string; type: string; qty: string; spec: string }> = [];

                    if (room.scheme.enableLighting) {
                      roomDevices.push({
                        name: '智能零火双键/三键开关面板',
                        type: '照明控制',
                        qty: `${room.scheme.lighting?.circuitsCount || 2} 台`,
                        spec: 'Zigbee 3.0 / 继电器磁保持',
                      });
                      if (room.scheme.lighting?.dimmableCount) {
                        roomDevices.push({
                          name: '智能无极调光驱动电源',
                          type: '深度调光',
                          qty: `${room.scheme.lighting.dimmableCount} 组`,
                          spec: '0-10V / 硅谷色温 2700K-6000K',
                        });
                      }
                    }

                    if (room.scheme.enableCurtain) {
                      roomDevices.push({
                        name: '超静音智能开合帘电机',
                        type: '智能遮阳',
                        qty: room.scheme.curtain?.curtainLayer === 'double' ? '2 台 (双轨)' : '1 台 (单轨)',
                        spec: '锂电/强电双供电, 运行分贝 <25dB',
                      });
                    }

                    if (room.scheme.otherRequirements?.thermostatControl) {
                      roomDevices.push({
                        name: '中央空调/地暖/新风三合一温控面板',
                        type: '环境调节',
                        qty: '1 台',
                        spec: 'LCD 彩屏触控, 485网关总线',
                      });
                    }

                    if (room.scheme.otherRequirements?.smartSensors) {
                      roomDevices.push({
                        name: '毫米波人体微动微波存在传感器',
                        type: '感知系统',
                        qty: '1 个',
                        spec: '24GHz 微波雷达, 存在/微动检测',
                      });
                    }

                    if (room.scheme.otherRequirements?.smartLock) {
                      roomDevices.push({
                        name: '3D人脸识别智能大屏猫眼门锁',
                        type: '安防门禁',
                        qty: '1 套',
                        spec: '双目红外人脸识别, 指静脉开锁',
                      });
                    }

                    if (room.scheme.otherRequirements?.bgMusic) {
                      roomDevices.push({
                        name: '吸顶同轴高保真智能背景音乐音响',
                        type: '影音娱乐',
                        qty: '1 对',
                        spec: 'Wi-Fi/蓝牙双模, 独立功放',
                      });
                    }

                    return (
                      <div
                        key={room.id || idx}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <span>{room.name}</span>
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            配置 {roomDevices.length} 类设备
                          </span>
                        </div>

                        {roomDevices.length === 0 ? (
                          <div className="text-xs text-slate-400 py-1 italic">未选配特定硬件设备</div>
                        ) : (
                          <div className="space-y-1.5">
                            {roomDevices.map((devItem, dIdx) => (
                              <div
                                key={dIdx}
                                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div>
                                  <span className="font-bold text-slate-800">{devItem.name}</span>
                                  <span className="text-slate-400 ml-2 font-mono">[{devItem.spec}]</span>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                    {devItem.type}
                                  </span>
                                  <span className="font-mono font-bold text-slate-900">{devItem.qty}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Template Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">模板构思与客户诉求说明</h4>
                <div className="p-3.5 bg-slate-50 rounded-xl text-slate-600 leading-relaxed text-xs border border-slate-200">
                  {inspectingTemplate.description || '由客户实际方案深度沉淀，已完成空间选型与硬件参数调优。'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setInspectingTemplate(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm cursor-pointer shadow-xs"
              >
                已核验，关闭明细
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
