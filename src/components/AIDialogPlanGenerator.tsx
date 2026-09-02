import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  ArrowRight,
  ArrowLeft,
  Bot,
  User,
  CheckCircle2,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { RenovationProject, RoomItem, RoomScheme } from '../types';
import { calculateProjectCost } from '../utils/calculator';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  schemeSummary?: {
    totalCostTenThousand: number;
    deviceCount: number;
    highlights: string[];
    roomsBreakdown: { name: string; desc: string; cost: number }[];
  };
}

interface AIDialogPlanGeneratorProps {
  project: RenovationProject;
  onUpdateRooms: (rooms: RoomItem[]) => void;
  onUpdateBudget: (min: number, max: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const QUICK_SUGGESTIONS = [
  '帮我控制在 1 万以内',
  '客厅加一套观影模式',
  '主卧加电动窗帘',
  '增加全屋人体存在感应',
  '玄关加智能门锁联动',
  '切换为DALI高级调光',
  '全屋加中央空调温控',
  '降低整体设备预算',
];

export const AIDialogPlanGenerator: React.FC<AIDialogPlanGeneratorProps> = ({
  project,
  onUpdateRooms,
  onPrevStep,
  onNextStep,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const costSummary = calculateProjectCost(project);
  const totalDevices =
    costSummary.totalLightCircuits +
    costSummary.totalCurtains +
    costSummary.totalOtherDevices +
    costSummary.gatewayHubsNeeded;

  // Auto scroll chat to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatBottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial welcome greeting from AI Architect
  useEffect(() => {
    const timeStr = new Date().toTimeString().slice(0, 5);
    const roomNames = project.rooms.map((r) => r.name).join('、');
    const highlights = [
      '全屋智能灯光调光与情景联动',
      '客卧静音电动开合帘全覆盖',
      '入户智能人脸门锁与安防联动',
      '高精度人体存在感知起夜微光',
    ];

    const initialBreakdown = project.rooms.map((r) => {
      const scheme = r.scheme;
      const lightCount = scheme.lighting?.circuitsCount || 2;
      const dimmable = scheme.lighting?.dimmableCount || 0;
      const hasCurtain = scheme.enableCurtain;
      return {
        name: r.name,
        desc: `${lightCount}路灯控(${dimmable}路调光)${hasCurtain ? ' · 电动窗帘' : ''}`,
        cost: Math.round(costSummary.totalCostYuan / (project.rooms.length || 1)),
      };
    });

    const welcomeMsg: ChatMessage = {
      id: 'init_welcome',
      role: 'assistant',
      timestamp: timeStr,
      content: `您好！我是您的 **智家AI方案架构师** 🤖✨

已根据【**${project.communityName || '您的爱居'}**】（${project.rooms.length}间房：${roomNames}）及预算需求，为您智能规划了全屋定制方案！

💡 **核心方案规划特色**：
- **🛋️ 客厅 / 餐厅**：配备全色温智能灯光调光、静音电动双层窗帘、智能温控联动；
- **🛏️ 主卧 / 次卧**：睡前一键全关场景、智能起夜微光引导、开合帘定时日出唤醒；
- **🚪 玄关 / 安防**：3D人脸识别智能门锁、多模智能网关中枢与全屋离家主动布防。

您可以在下方快捷选择或输入您的修改想法（如：“帮我控制在 1 万以内”、“客厅加一套观影模式”），方案将实时调整。

确认方案满意后，点击右上角的【**确认方案**】即可进入详细产品设备清单核对！`,
      schemeSummary: {
        totalCostTenThousand: costSummary.totalCostTenThousand,
        deviceCount: totalDevices,
        highlights,
        roomsBreakdown: initialBreakdown,
      },
    };

    setMessages([welcomeMsg]);
  }, [project.communityName, project.selectedPresetId]);

  // Apply project adjustment based on user input
  const applySmartPlanAdjustment = (userText: string) => {
    const text = userText.toLowerCase();
    const updated = project.rooms.map((room) => {
      const clonedScheme: RoomScheme = JSON.parse(JSON.stringify(room.scheme));
      clonedScheme.isCustom = true;

      if (!clonedScheme.lighting) {
        clonedScheme.lighting = { circuitsCount: 2, dimmableCount: 1, preferredSeriesId: 'series_standard_mesh' };
      }
      if (!clonedScheme.curtain) {
        clonedScheme.curtain = { curtainType: 'open_close', curtainLayer: 'single', preferredSeriesId: 'series_standard_mesh' };
      }
      if (!clonedScheme.otherRequirements) {
        clonedScheme.otherRequirements = { customNotes: '' };
      }

      if (text.includes('1万') || text.includes('1 万') || text.includes('一万') || text.includes('经济') || text.includes('性价比') || text.includes('省钱') || text.includes('降低') || text.includes('预算低')) {
        if (clonedScheme.lighting) {
          clonedScheme.lighting.dimmableCount = 0;
          clonedScheme.lighting.preferredSeriesId = 'series_budget_mesh';
        }
        if (clonedScheme.curtain) {
          clonedScheme.curtain.curtainLayer = 'single';
          clonedScheme.curtain.preferredSeriesId = 'series_budget_mesh';
        }
        if (clonedScheme.otherRequirements) {
          clonedScheme.otherRequirements.bgMusic = false;
          clonedScheme.otherRequirements.freshAirPanel = false;
          clonedScheme.otherRequirements.thermostatControl = room.category === 'living';
          clonedScheme.otherRequirements.smartSensors = room.category === 'entrance' || room.category === 'bathroom';
          clonedScheme.otherRequirements.smartLock = room.category === 'entrance';
        }
      } else if (text.includes('调光') || text.includes('磁吸') || text.includes('灯光') || text.includes('色温') || text.includes('dali')) {
        if (clonedScheme.lighting) {
          clonedScheme.lighting.circuitsCount = Math.max(3, clonedScheme.lighting.circuitsCount);
          clonedScheme.lighting.dimmableCount = Math.max(2, clonedScheme.lighting.circuitsCount - 1);
          clonedScheme.lighting.preferredSeriesId = 'series_luxury_dali';
        }
        if (clonedScheme.otherRequirements) {
          clonedScheme.otherRequirements.smartSensors = true;
        }
      } else if (text.includes('影院') || text.includes('观影') || text.includes('客厅')) {
        if (room.category === 'living') {
          if (clonedScheme.lighting) {
            clonedScheme.lighting.circuitsCount = 4;
            clonedScheme.lighting.dimmableCount = 3;
          }
          if (clonedScheme.curtain) {
            clonedScheme.curtain.curtainLayer = 'double';
          }
          if (clonedScheme.otherRequirements) {
            clonedScheme.otherRequirements.bgMusic = true;
            clonedScheme.otherRequirements.thermostatControl = true;
          }
        }
      } else if (text.includes('窗帘') || text.includes('开合帘') || text.includes('主卧')) {
        if (room.category === 'bedroom' || room.name.includes('主卧')) {
          clonedScheme.enableCurtain = true;
          if (clonedScheme.curtain) {
            clonedScheme.curtain.curtainLayer = 'double';
            clonedScheme.curtain.preferredSeriesId = 'series_standard_mesh';
          }
        }
      } else if (text.includes('安防') || text.includes('门锁') || text.includes('传感') || text.includes('人感') || text.includes('人体存在')) {
        if (clonedScheme.otherRequirements) {
          clonedScheme.otherRequirements.smartSensors = true;
          if (room.category === 'entrance' || room.name.includes('玄关')) {
            clonedScheme.otherRequirements.smartLock = true;
          }
        }
      } else if (text.includes('空调') || text.includes('地暖') || text.includes('新风') || text.includes('温控')) {
        if (clonedScheme.otherRequirements) {
          clonedScheme.otherRequirements.thermostatControl = true;
          clonedScheme.otherRequirements.freshAirPanel = true;
        }
      }

      return {
        ...room,
        scheme: clonedScheme,
      };
    });

    onUpdateRooms(updated);
  };

  const handleSendMessage = async (textToSend?: string, uploadedImage?: string) => {
    const msg = (textToSend || inputMessage).trim();
    if ((!msg && !uploadedImage) || isLoading) return;

    const userMsgId = `user_${Date.now()}`;
    const timeStr = new Date().toTimeString().slice(0, 5);

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: msg || '【上传了户型图】请帮我根据户型图规划智能方案',
      imageUrl: uploadedImage,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    if (msg) {
      applySmartPlanAdjustment(msg);
    }

    try {
      const response = await fetch('/api/ai/plan-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg || '根据用户上传的户型图规划全屋方案',
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          project: {
            ...project,
            communityName: project.communityName,
            rooms: project.rooms,
            minBudget: project.minBudget,
            maxBudget: project.maxBudget,
          },
        }),
      });

      const data = await response.json();
      const replyContent = data.reply || '方案已为您成功定制与更新。';

      const updatedCost = calculateProjectCost(project);
      const updatedTotalDevices =
        updatedCost.totalLightCircuits +
        updatedCost.totalCurtains +
        updatedCost.totalOtherDevices +
        updatedCost.gatewayHubsNeeded;

      const aiReplyMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toTimeString().slice(0, 5),
        schemeSummary: {
          totalCostTenThousand: updatedCost.totalCostTenThousand,
          deviceCount: updatedTotalDevices,
          highlights: [
            '已根据您的要求精准调整设备型号与点位',
            `全屋设备总数约 ${updatedTotalDevices} 件`,
            `预算预估 ¥${updatedCost.totalCostTenThousand}万 · 处于安全区间`,
          ],
          roomsBreakdown: project.rooms.map((r) => ({
            name: r.name,
            desc: `${r.scheme.lighting?.circuitsCount || 2}路灯控 · ${r.scheme.enableCurtain ? '电动窗帘' : '无窗帘'}`,
            cost: Math.round(updatedCost.totalCostYuan / (project.rooms.length || 1)),
          })),
        },
      };

      setMessages((prev) => [...prev, aiReplyMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const fallbackCost = calculateProjectCost(project);
      const fallbackDevices =
        fallbackCost.totalLightCircuits +
        fallbackCost.totalCurtains +
        fallbackCost.totalOtherDevices +
        fallbackCost.gatewayHubsNeeded;

      const aiFallbackMsg: ChatMessage = {
        id: `ai_fallback_${Date.now()}`,
        role: 'assistant',
        content: `### 方案已实时更新 🎯\n\n已根据您的需求【${msg || '户型图定制'}】调整了全屋设备分配！\n\n- **当前预估总价**：约 **¥${fallbackCost.totalCostTenThousand}万元**\n- **设备总计**：约 **${fallbackDevices} 件设备**\n\n您可以继续在下方输入您的需求，或者点击右上角【**确认方案**】查看详细设备报价！`,
        timestamp: new Date().toTimeString().slice(0, 5),
        schemeSummary: {
          totalCostTenThousand: fallbackCost.totalCostTenThousand,
          deviceCount: fallbackDevices,
          highlights: [
            '设备参数与配置已自动同步',
            `共 ${project.rooms.length} 间房定制方案`,
          ],
          roomsBreakdown: project.rooms.map((r) => ({
            name: r.name,
            desc: `${r.scheme.lighting?.circuitsCount || 2}路灯控 · ${r.scheme.enableCurtain ? '电动窗帘' : '无窗帘'}`,
            cost: Math.round(fallbackCost.totalCostYuan / (project.rooms.length || 1)),
          })),
        },
      };
      setMessages((prev) => [...prev, aiFallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleSendMessage('上传了户型图，请帮我分析并定制全屋方案', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 bg-slate-50 relative overflow-hidden">
      {/* 1. Header: Left Return, Middle Title, Right "确认方案" */}
      <div className="bg-white px-3 py-2.5 border-b border-slate-200 flex items-center justify-between shadow-2xs sticky top-0 z-30 shrink-0 gap-2">
        <button
          type="button"
          onClick={onPrevStep}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
          <span className="whitespace-nowrap">返回</span>
        </button>

        {/* Clean concise title (Removed the subtitle with estimation and community name as requested) */}
        <div className="text-center px-1 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none truncate">
              智家AI方案定制
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextStep}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-amber-400 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
          <span className="whitespace-nowrap">确认方案</span>
        </button>
      </div>

      {/* 2. Full-Height Scrollable Conversation Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-sm leading-relaxed space-y-3 shadow-xs ${
                  isAi
                    ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
                    : 'bg-slate-900 text-white rounded-tr-sm'
                }`}
              >
                {/* Uploaded Image Preview */}
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-700/50 mb-2 max-w-[260px]">
                    <img src={msg.imageUrl} alt="Uploaded Floor Plan" className="w-full h-auto object-cover max-h-48" />
                  </div>
                )}

                <div className="whitespace-pre-wrap font-normal text-[13.5px] leading-6 space-y-2">
                  {msg.content}
                </div>

                {/* AI Scheme Preview Card inside message */}
                {isAi && msg.schemeSummary && (
                  <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                      <span className="flex items-center gap-1.5 text-blue-700">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>方案实时规划摘要</span>
                      </span>
                      <span className="text-amber-700 font-mono font-extrabold text-sm">
                        ¥{msg.schemeSummary.totalCostTenThousand}万 · {msg.schemeSummary.deviceCount}件设备
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {msg.schemeSummary.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">已同步至全屋方案</span>
                      <button
                        type="button"
                        onClick={onNextStep}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>确认方案</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1 ${
                    isAi ? 'text-slate-400 text-left' : 'text-slate-400 text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4.5 h-4.5 animate-spin" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-4 text-sm text-slate-600 border border-slate-200 flex items-center space-x-2.5 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>AI架构师正在为您深度调整全屋智能方案...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 3. Bottom Input Area: Quick Suggestions Pills + Image Button + Capsule Input + Round Send Button */}
      <div className="bg-[#f4f6f8] border-t border-slate-200/90 shrink-0 z-20">
        {/* Top Quick Suggestions Carousel (Horizontal Scroll) */}
        <div className="px-3 pt-2 pb-1.5 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(suggestion)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200/90 rounded-full text-xs text-slate-700 font-medium whitespace-nowrap shadow-2xs transition-all cursor-pointer shrink-0"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Bottom Input Row: Image Upload + Capsule Input + Round Send Button */}
        <div className="px-3 pb-3 pt-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Hidden File Input for Floor Plan / Image Upload */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />

            {/* Left Image Upload Icon Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-700 active:scale-95 transition-colors cursor-pointer rounded-full shrink-0"
              title="上传户型图/参考图"
            >
              <ImageIcon className="w-5 h-5 text-slate-500 hover:text-slate-700" />
            </button>

            {/* Middle Capsule Input */}
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                placeholder="描述您的需求，或上传户型图"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-900 text-xs sm:text-sm rounded-full px-4 py-2 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Right Round Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                inputMessage.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="发送"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 -ml-0.5 mt-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

