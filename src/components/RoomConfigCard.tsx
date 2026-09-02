import React, { useState } from 'react';
import {
  Lightbulb,
  Blinds,
  SlidersHorizontal,
  Check,
  ChevronDown,
  Trash2,
  Sparkles,
  Zap,
  FileText,
  X,
} from 'lucide-react';
import { RoomItem, RoomScheme, LightingConfig, CurtainConfig, OtherRequirements } from '../types';
import { DEVICE_SERIES_LIST, DEFAULT_ROOM_TEMPLATES } from '../data/presetData';
import { calculateRoomCost } from '../utils/calculator';

interface RoomConfigCardProps {
  room: RoomItem;
  onUpdateRoomScheme: (roomId: string, newScheme: RoomScheme) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onDeleteRoom: (roomId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const RoomConfigCard: React.FC<RoomConfigCardProps> = ({
  room,
  onUpdateRoomScheme,
  onRenameRoom,
  onDeleteRoom,
  isExpanded,
  onToggleExpand,
}) => {
  const [isDeviceSelectModalOpen, setIsDeviceSelectModalOpen] = useState(false);

  const scheme = room.scheme;
  const costSummary = calculateRoomCost(room);
  const defaultTemplate = DEFAULT_ROOM_TEMPLATES[room.category] || DEFAULT_ROOM_TEMPLATES.other;

  // Handler to switch scheme mode (Default vs Custom)
  const handleSchemeModeChange = (isCustom: boolean) => {
    if (!isCustom) {
      // Revert to Default Scheme
      onUpdateRoomScheme(room.id, {
        isCustom: false,
        defaultTemplateId: defaultTemplate.id,
        enableLighting: true,
        enableCurtain: room.category !== 'kitchen' && room.category !== 'entrance',
        enableOther: true,
        lighting: { ...defaultTemplate.lighting },
        curtain: { ...defaultTemplate.curtain },
        otherRequirements: { ...defaultTemplate.otherRequirements },
      });
    } else {
      // Switch to Custom Scheme with current/initial values
      onUpdateRoomScheme(room.id, {
        ...scheme,
        isCustom: true,
      });
    }
  };

  // Lighting handlers
  const handleLightingChange = (patch: Partial<LightingConfig>) => {
    const currentLighting = scheme.lighting || {
      circuitsCount: 2,
      dimmableCount: 0,
      preferredSeriesId: 'series_standard_mesh',
    };
    const updated = { ...currentLighting, ...patch };

    // Ensure dimmable <= total circuits
    if (updated.dimmableCount > updated.circuitsCount) {
      updated.dimmableCount = updated.circuitsCount;
    }

    onUpdateRoomScheme(room.id, {
      ...scheme,
      lighting: updated,
    });
  };

  // Curtain handlers
  const handleCurtainChange = (patch: Partial<CurtainConfig>) => {
    const currentCurtain = scheme.curtain || {
      curtainType: 'open_close',
      curtainLayer: 'single',
      preferredSeriesId: 'series_standard_mesh',
    };
    onUpdateRoomScheme(room.id, {
      ...scheme,
      curtain: { ...currentCurtain, ...patch },
    });
  };

  // Other Requirements handlers
  const handleOtherRequirementsChange = (patch: Partial<OtherRequirements>) => {
    onUpdateRoomScheme(room.id, {
      ...scheme,
      otherRequirements: { ...scheme.otherRequirements, ...patch },
    });
  };

  return (
    <div
      className={`bg-white border rounded-2xl transition-all shadow-sm overflow-hidden ${
        isExpanded ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Room Card Header Bar */}
      <div
        onClick={onToggleExpand}
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center space-x-2.5 min-w-0 flex-1 overflow-hidden">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              scheme.isCustom
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {room.name.substring(0, 2)}
          </div>

          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={room.name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onRenameRoom(room.id, e.target.value)}
                className="bg-transparent font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-100 focus:bg-white px-1 py-0.5 rounded border border-transparent focus:border-slate-300 outline-none max-w-[110px] sm:max-w-[160px] truncate"
              />
            </div>

            <div className="flex items-center space-x-1.5 mt-0.5 min-w-0 overflow-hidden">
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border whitespace-nowrap shrink-0 ${
                  scheme.isCustom
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {scheme.isCustom ? '自定义' : '默认推荐'}
              </span>

              <p className="text-[10px] text-slate-500 flex items-center space-x-1 truncate max-w-[120px] sm:max-w-[240px] shrink overflow-hidden">
                <span className="shrink-0">
                  灯光:{scheme.isCustom ? scheme.lighting?.circuitsCount || 0 : defaultTemplate.lighting.circuitsCount}路
                </span>
                <span className="shrink-0 text-slate-300">•</span>
                <span className="truncate">
                  窗帘:{' '}
                  {scheme.isCustom
                    ? scheme.enableCurtain
                      ? scheme.curtain?.curtainType === 'open_close'
                        ? `开合帘(${scheme.curtain.curtainLayer === 'double' ? '双层' : '单层'})`
                        : '卷帘'
                      : '未选'
                    : defaultTemplate.enableCurtain
                    ? `开合帘(${defaultTemplate.curtain.curtainLayer === 'double' ? '双层' : '单层'})`
                    : '无'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 ml-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRoom(room.id);
            }}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="删除此房间"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'transform rotate-180 text-slate-900' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Room Editor */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-4 animate-fadeIn">
          {/* Choice 1: Select Scheme Type (默认方案 vs 自定义方案) */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
            <label className="text-xs font-bold text-slate-600 tracking-wide block">
              方案模式选择
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Default Scheme Card Button */}
              <div
                onClick={() => handleSchemeModeChange(false)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                  !scheme.isCustom
                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    !scheme.isCustom ? 'border-white bg-white text-slate-900' : 'border-slate-400'
                  }`}
                >
                  {!scheme.isCustom && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
                </div>
                <div>
                  <div className={`font-bold text-xs sm:text-sm ${!scheme.isCustom ? 'text-white' : 'text-slate-900'}`}>
                    使用系统默认推荐方案
                  </div>
                  <p className={`text-xs mt-1 ${!scheme.isCustom ? 'text-slate-300' : 'text-slate-500'}`}>
                    {defaultTemplate.title}: {defaultTemplate.lighting.circuitsCount}路灯光 (
                    {defaultTemplate.lighting.dimmableCount}路调光),{' '}
                    {defaultTemplate.enableCurtain
                      ? `${defaultTemplate.curtain.curtainType === 'open_close' ? '开合帘' : '卷帘'}`
                      : '无窗帘'}
                  </p>
                </div>
              </div>

              {/* Custom Scheme Card Button */}
              <div
                onClick={() => handleSchemeModeChange(true)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                  scheme.isCustom
                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center flex-shrink-0 ${
                    scheme.isCustom ? 'border-white bg-white text-slate-900' : 'border-slate-400'
                  }`}
                >
                  {scheme.isCustom && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
                </div>
                <div>
                  <div className={`font-bold text-xs sm:text-sm ${scheme.isCustom ? 'text-white' : 'text-slate-900'}`}>
                    使用自定义方案
                  </div>
                  <p className={`text-xs mt-1 ${scheme.isCustom ? 'text-slate-300' : 'text-slate-500'}`}>
                    自定义灯光回路、调光路数、窗帘及特需参数
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CUSTOM SCHEME EDITOR SECTION */}
          {scheme.isCustom ? (
            <div className="space-y-3.5">
              {/* Custom Header Bar & Currently Selected Devices Badges */}
              <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                {/* Row 1: Title & Button in the same bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-900" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900">自定义配置明细</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDeviceSelectModalOpen(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>选择设备类型</span>
                  </button>
                </div>

                {/* Row 2: Selected device tags placed below */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  {scheme.enableLighting && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-600" /> 智能灯光
                    </span>
                  )}
                  {scheme.enableCurtain && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1">
                      <Blinds className="w-3 h-3 text-sky-600" /> 智能窗帘
                    </span>
                  )}
                  {scheme.enableOther && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-indigo-600" /> 其他
                    </span>
                  )}
                  {!scheme.enableLighting && !scheme.enableCurtain && !scheme.enableOther && (
                    <span className="text-xs text-slate-400 italic">未勾选任何设备</span>
                  )}
                </div>
              </div>

              {/* LIGHTING CONFIG (灯光控制) */}
              {scheme.enableLighting && (
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span>灯光回路与调光配置</span>
                    </h5>
                    <span className="text-xs text-slate-400">设定控制与调光回路</span>
                  </div>

                  <div className="space-y-3">
                    {/* 第一行：两个参数 (总回路数 和 调光回路数) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 有几路灯 */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          总灯光回路数 (路) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={scheme.lighting?.circuitsCount || 1}
                          onChange={(e) =>
                            handleLightingChange({ circuitsCount: Math.max(1, Number(e.target.value)) })
                          }
                          className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-900 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold outline-none shadow-2xs"
                        />
                      </div>

                      {/* 其中有几个是调光灯 */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          其中调光回路数 (路)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={scheme.lighting?.circuitsCount || 1}
                          value={scheme.lighting?.dimmableCount || 0}
                          onChange={(e) =>
                            handleLightingChange({
                              dimmableCount: Math.min(
                                Math.max(0, Number(e.target.value)),
                                scheme.lighting?.circuitsCount || 1
                              ),
                            })
                          }
                          className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-900 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold outline-none shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* 第二行：倾向设备系列 */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        倾向设备系列
                      </label>
                      <select
                        value={scheme.lighting?.preferredSeriesId || ''}
                        onChange={(e) => handleLightingChange({ preferredSeriesId: e.target.value })}
                        className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none shadow-2xs"
                      >
                        <option value="">-- 不限 (默认主流) --</option>
                        {DEVICE_SERIES_LIST.map((series) => (
                          <option key={series.id} value={series.id}>
                            {series.name} [{series.brandTag}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CURTAIN CONFIG (窗帘控制) */}
              {scheme.enableCurtain && (
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <Blinds className="w-4 h-4 text-sky-600" />
                      <span>窗帘电机与轨道</span>
                    </h5>
                    <span className="text-xs text-slate-400">选择类型与电机层数</span>
                  </div>

                  <div className="space-y-3">
                    {/* 第一行：两个参数 (窗帘种类 和 开合帘电机层数) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* 窗帘类型: 开合帘还是卷帘 */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          窗帘种类
                        </label>
                        <div className="flex rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleCurtainChange({ curtainType: 'open_close' })}
                            className={`flex-1 py-1.5 px-2 text-xs font-bold cursor-pointer transition-colors ${
                              scheme.curtain?.curtainType === 'open_close'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            开合帘
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCurtainChange({ curtainType: 'roller' })}
                            className={`flex-1 py-1.5 px-2 text-xs font-bold cursor-pointer transition-colors ${
                              scheme.curtain?.curtainType === 'roller'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            卷帘/百叶
                          </button>
                        </div>
                      </div>

                      {/* 如果是开合帘: 选择是单层还是双层 */}
                      {scheme.curtain?.curtainType === 'open_close' ? (
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            开合帘电机层数
                          </label>
                          <div className="flex rounded-lg overflow-hidden border border-slate-300 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleCurtainChange({ curtainLayer: 'single' })}
                              className={`flex-1 py-1.5 px-2 text-xs font-bold cursor-pointer transition-colors ${
                                scheme.curtain?.curtainLayer === 'single'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              单层 (单电机)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCurtainChange({ curtainLayer: 'double' })}
                              className={`flex-1 py-1.5 px-2 text-xs font-bold cursor-pointer transition-colors ${
                                scheme.curtain?.curtainLayer === 'double'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              双层 (双电机)
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="hidden sm:block"></div>
                      )}
                    </div>

                    {/* 第二行：电机偏好系列 */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        电机偏好系列
                      </label>
                      <select
                        value={scheme.curtain?.preferredSeriesId || ''}
                        onChange={(e) => handleCurtainChange({ preferredSeriesId: e.target.value })}
                        className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-800 rounded-lg px-3 py-1.5 text-xs outline-none shadow-2xs"
                      >
                        <option value="">-- 不限 (默认静音电机) --</option>
                        {DEVICE_SERIES_LIST.map((series) => (
                          <option key={series.id} value={series.id}>
                            {series.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* OTHER MODULE (其他) */}
              {scheme.enableOther && (
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900">其他设备及特殊要求</h5>
                  </div>

                  <textarea
                    rows={3}
                    value={scheme.otherRequirements?.customNotes || ''}
                    onChange={(e) => handleOtherRequirementsChange({ customNotes: e.target.value })}
                    placeholder="请输入房间设备以及要求（例如：智能插座、极米投影仪双控、隐形感应器、特殊安装高度等）"
                    className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-800 rounded-xl p-3 text-xs sm:text-sm placeholder-slate-400 outline-none resize-none shadow-2xs"
                  />
                </div>
              )}

              {!scheme.enableLighting && !scheme.enableCurtain && !scheme.enableOther && (
                <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2 shadow-2xs">
                  <p className="text-xs text-slate-500 font-medium">暂未选择任何设备类型</p>
                  <button
                    type="button"
                    onClick={() => setIsDeviceSelectModalOpen(true)}
                    className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                  >
                    点击弹窗选择设备类型
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* DEFAULT SCHEME PREVIEW DISPLAY */
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>该房间已启用系统默认推荐方案</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                预设配置：<strong className="text-slate-900">{defaultTemplate.lighting.circuitsCount}路灯光</strong> ({defaultTemplate.lighting.dimmableCount}路调光)、
                <strong className="text-slate-900">{defaultTemplate.enableCurtain ? (defaultTemplate.curtain.curtainType === 'open_close' ? '智能开合帘' : '智能卷帘') : '无窗帘'}</strong>，自动匹配智能设备底座。
              </p>
            </div>
          )}
        </div>
      )}

      {/* 设备类型选择弹窗 Modal */}
      {isDeviceSelectModalOpen && (
        <div
          onClick={() => setIsDeviceSelectModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-900" />
                <h4 className="font-bold text-sm text-slate-900">【{room.name}】选择要配置的设备类型</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsDeviceSelectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              请勾选该房间需要配置的设备模块，勾选后将开启对应的详细参数设置：
            </p>

            <div className="space-y-2">
              <label
                onClick={() =>
                  onUpdateRoomScheme(room.id, {
                    ...scheme,
                    enableLighting: !scheme.enableLighting,
                  })
                }
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  scheme.enableLighting
                    ? 'bg-amber-50/60 border-amber-300 text-amber-950'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      scheme.enableLighting ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">智能灯光</span>
                    <span className="text-[10px] text-slate-500">配几路控制/调光回路</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scheme.enableLighting}
                  onChange={() => {}}
                  className="w-4 h-4 rounded accent-slate-900 pointer-events-none"
                />
              </label>

              <label
                onClick={() =>
                  onUpdateRoomScheme(room.id, {
                    ...scheme,
                    enableCurtain: !scheme.enableCurtain,
                  })
                }
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  scheme.enableCurtain
                    ? 'bg-sky-50/60 border-sky-300 text-sky-950'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      scheme.enableCurtain ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Blinds className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">智能窗帘</span>
                    <span className="text-[10px] text-slate-500">开合帘/卷帘/单双层</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scheme.enableCurtain}
                  onChange={() => {}}
                  className="w-4 h-4 rounded accent-slate-900 pointer-events-none"
                />
              </label>

              <label
                onClick={() =>
                  onUpdateRoomScheme(room.id, {
                    ...scheme,
                    enableOther: !scheme.enableOther,
                  })
                }
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  scheme.enableOther
                    ? 'bg-indigo-50/60 border-indigo-300 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      scheme.enableOther ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block">其他</span>
                    <span className="text-[10px] text-slate-500">手输特殊需求或设备要求</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={scheme.enableOther}
                  onChange={() => {}}
                  className="w-4 h-4 rounded accent-slate-900 pointer-events-none"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDeviceSelectModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                确认并关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
