import React, { useState } from 'react';
import {
  FileStack,
  Search,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Zap,
  X,
  Plus,
  Trash2,
  Edit3,
  Check,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import { PlanTemplate, RenovationProject } from '../../types';

interface PlanTemplatesViewProps {
  templates: PlanTemplate[];
  activeProject?: RenovationProject;
  onApplyTemplate: (template: PlanTemplate) => void;
  onCreateTemplate?: (template: PlanTemplate) => void;
  onUpdateTemplate?: (template: PlanTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

export const PlanTemplatesView: React.FC<PlanTemplatesViewProps> = ({
  templates,
  activeProject,
  onApplyTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [keyword, setKeyword] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['tmpl_quality_3b2l']);
  const [inspectingTemplate, setInspectingTemplate] = useState<PlanTemplate | null>(null);

  // Edit / Create Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<PlanTemplate['category']>('quality');
  const [formBudget, setFormBudget] = useState('5.5');
  const [formRecommendedLayout, setFormRecommendedLayout] = useState('三居室/两居室常用户型');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['客厅主卧双调光', '全屋窗帘智能开合']);

  const categories = ['全部', '个人专属', '品质精选', '紧凑小户', '尊享大宅', '科技极客', '适老关怀'];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredTemplates = templates.filter((tmpl) => {
    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      return tmpl.title.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setFormTitle('我的精装三居智能专属模板');
    setFormSubtitle('客厅主卧全调光 + 双层静音开合帘 + 人体存在感应');
    setFormCategory('quality');
    setFormBudget('5.5');
    setFormRecommendedLayout('三居室常用标准户型');
    setFormDescription('为常用三居室户型预置的舒适版智能化方案');
    setFormFeatures(['客厅主卧双调光', '全屋窗帘智能开合', '微波雷达感应']);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (tmpl: PlanTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTemplateId(tmpl.id);
    setFormTitle(tmpl.title);
    setFormSubtitle(tmpl.subtitle || '');
    setFormCategory(tmpl.category);
    setFormBudget(String(tmpl.estimatedCostTenThousand || 5.0));
    setFormRecommendedLayout(tmpl.recommendedLayout || '标准户型');
    setFormDescription(tmpl.description || '');
    setFormFeatures(tmpl.features && tmpl.features.length > 0 ? tmpl.features : ['智能调光', '智能窗帘']);
    setIsEditModalOpen(true);
  };

  const handleSaveModalForm = () => {
    if (!formTitle.trim()) return;

    const categoryLabelMap: Record<string, string> = {
      quality: '品质精选',
      compact: '紧凑小户',
      luxury: '尊享大宅',
      geek: '科技极客',
      elderly: '适老关怀',
      custom: '个人专属',
    };

    if (editingTemplateId) {
      // Update existing template
      const targetTmpl = templates.find((t) => t.id === editingTemplateId);
      if (targetTmpl && onUpdateTemplate) {
        const updated: PlanTemplate = {
          ...targetTmpl,
          title: formTitle.trim(),
          subtitle: formSubtitle.trim() || '方案配置模板',
          category: formCategory,
          categoryLabel: categoryLabelMap[formCategory] || '个人专属',
          estimatedCostTenThousand: parseFloat(formBudget) || targetTmpl.estimatedCostTenThousand,
          recommendedLayout: formRecommendedLayout.trim() || '标准户型',
          description: formDescription.trim() || '',
          features: formFeatures,
        };
        onUpdateTemplate(updated);
      }
    } else {
      // Create new template
      const newTmpl: PlanTemplate = {
        id: 'custom_tmpl_' + Date.now(),
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || '个人自定义配置方案模板',
        category: formCategory,
        categoryLabel: categoryLabelMap[formCategory] || '个人专属',
        priceGrade: '个人自定',
        estimatedCostTenThousand: parseFloat(formBudget) || 5.0,
        roomsCount: activeProject?.rooms?.length || 4,
        deviceCount: 24,
        features: formFeatures,
        highlights: [
          '预置个人最常用的智能设备配比与空间划分',
          '一键导入工作台，无需重新反复配置回路',
        ],
        recommendedLayout: formRecommendedLayout.trim() || '标准户型',
        description: formDescription.trim() || '个人专属配置模板',
        defaultMinBudget: 3,
        defaultMaxBudget: 10,
        isUserCustom: true,
        createdAt: new Date().toLocaleDateString('zh-CN'),
        rooms:
          activeProject?.rooms && activeProject.rooms.length > 0
            ? activeProject.rooms
            : [
                {
                  id: 'cr_1',
                  name: '客厅',
                  category: 'living',
                  scheme: {
                    isCustom: false,
                    enableLighting: true,
                    enableCurtain: true,
                    enableOther: true,
                    lighting: { circuitsCount: 4, dimmableCount: 2 },
                    curtain: { curtainType: 'open_close', curtainLayer: 'double' },
                    otherRequirements: {
                      smartSensors: true,
                      thermostatControl: true,
                      bgMusic: false,
                      smartLock: true,
                      freshAirPanel: false,
                      customNotes: '',
                    },
                  },
                },
                {
                  id: 'cr_2',
                  name: '主卧',
                  category: 'bedroom',
                  scheme: {
                    isCustom: false,
                    enableLighting: true,
                    enableCurtain: true,
                    enableOther: true,
                    lighting: { circuitsCount: 3, dimmableCount: 2 },
                    curtain: { curtainType: 'open_close', curtainLayer: 'double' },
                    otherRequirements: {
                      smartSensors: true,
                      thermostatControl: true,
                      bgMusic: false,
                      smartLock: false,
                      freshAirPanel: false,
                      customNotes: '',
                    },
                  },
                },
              ],
      };

      if (onCreateTemplate) {
        onCreateTemplate(newTmpl);
      }
    }

    setIsEditModalOpen(false);
    setEditingTemplateId(null);
  };

  const handleDeleteWithConfirm = (tmpl: PlanTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm(`确定删除模板【${tmpl.title}】吗？`)) {
      if (onDeleteTemplate) {
        onDeleteTemplate(tmpl.id);
      }
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn pb-10">
      {/* Clean Top Action Bar */}
      <div className="flex items-center justify-between pt-0.5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">方案模板库</h2>
          <p className="text-[11px] text-slate-400">共 {templates.length} 套配置模板，支持一键套用与编辑</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-amber-400 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新建模板</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="搜索模板名称..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full text-xs text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
        />
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Templates List */}
      <div className="space-y-2.5">
        {filteredTemplates.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileStack className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-700">暂无匹配的方案模板</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">点击右上角“新建模板”即可创建专属方案</p>
            </div>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const isBookmarked = bookmarkedIds.includes(template.id);

            return (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:shadow-sm transition-all space-y-2.5"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {template.categoryLabel}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {template.title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 font-mono">
                      ¥{template.estimatedCostTenThousand}万
                    </span>
                    <span className="text-[10px] text-slate-400 block">参考估算</span>
                  </div>
                </div>

                {/* Features & Stats */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-medium text-slate-700 truncate">
                      {template.recommendedLayout}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-700 shrink-0">
                      {template.roomsCount || template.rooms.length}空间
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => toggleBookmark(template.id, e)}
                      className="p-1 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                      title={isBookmarked ? '取消收藏' : '收藏'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center space-x-1.5 pt-0.5">
                  <button
                    onClick={() => onApplyTemplate(template)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-black text-amber-400 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>套用模板</span>
                  </button>

                  <button
                    onClick={() => setInspectingTemplate(template)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    详情
                  </button>

                  <button
                    onClick={(e) => handleOpenEditModal(template, e)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors cursor-pointer"
                    title="编辑模板"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteWithConfirm(template, e)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs transition-colors cursor-pointer"
                    title="删除模板"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Inspect Template Detail Modal */}
      {inspectingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-slate-800">
                  {inspectingTemplate.categoryLabel}
                </span>
                <h3 className="font-extrabold text-sm mt-1">{inspectingTemplate.title}</h3>
              </div>
              <button
                onClick={() => setInspectingTemplate(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block">参考估算</span>
                  <span className="text-xs font-black text-slate-900 font-mono">
                    ¥{inspectingTemplate.estimatedCostTenThousand}万
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">空间数量</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {inspectingTemplate.roomsCount || inspectingTemplate.rooms.length} 间
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">预估设备</span>
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {inspectingTemplate.deviceCount || 24} 件
                  </span>
                </div>
              </div>

              {inspectingTemplate.description && (
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {inspectingTemplate.description}
                </p>
              )}

              {/* Room Breakdown */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 text-xs">包含空间规划</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {inspectingTemplate.rooms.map((r, idx) => (
                    <div
                      key={r.id || idx}
                      className="p-2 bg-white border border-slate-200 rounded-xl text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{r.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {r.category}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex space-x-2">
                        <span>💡 灯光: {r.scheme.enableLighting ? `${r.scheme.lighting?.circuitsCount}路` : '无'}</span>
                        <span>🪟 窗帘: {r.scheme.enableCurtain ? '智能开合' : '无'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2 shrink-0">
              <button
                onClick={() => {
                  handleOpenEditModal(inspectingTemplate);
                  setInspectingTemplate(null);
                }}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                编辑模板
              </button>
              <button
                onClick={() => {
                  onApplyTemplate(inspectingTemplate);
                  setInspectingTemplate(null);
                }}
                className="flex-2 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>套用此模板</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Template Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                {editingTemplateId ? (
                  <Edit3 className="w-4 h-4 text-amber-400" />
                ) : (
                  <Plus className="w-4 h-4 text-amber-400" />
                )}
                <h3 className="font-extrabold text-sm">
                  {editingTemplateId ? '编辑方案模板' : '新建方案模板'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  模板名称
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                  placeholder="如：我的三居精装智能方案"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    方案分类
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                  >
                    <option value="quality">品质精选</option>
                    <option value="compact">紧凑小户</option>
                    <option value="luxury">尊享大宅</option>
                    <option value="geek">科技极客</option>
                    <option value="elderly">适老关怀</option>
                    <option value="custom">个人专属</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    参考预算 (万元)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none font-mono"
                    placeholder="5.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  推荐户型
                </label>
                <input
                  type="text"
                  value={formRecommendedLayout}
                  onChange={(e) => setFormRecommendedLayout(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-slate-900 outline-none"
                  placeholder="如：三居室两厅两卫"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveModalForm}
                className="flex-2 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingTemplateId ? '保存修改' : '确认创建'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
