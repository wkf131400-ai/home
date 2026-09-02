import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CommunityBudgetSetup } from './components/CommunityBudgetSetup';
import { RoomManager } from './components/RoomManager';
import { PlanSummaryBOM } from './components/PlanSummaryBOM';
import { AIDialogPlanGenerator } from './components/AIDialogPlanGenerator';
import { AdminPortal } from './components/AdminPortal';
import {
  RenovationProject,
  RoomItem,
  RoomScheme,
  LayoutPreset,
  FloorPlanPin,
  UserProfile,
  SavedPlanRecord,
  PlanTemplate,
} from './types';
import { LAYOUT_PRESETS, SAMPLE_FLOOR_PLAN_SVG } from './data/presetData';
import { createDefaultRoom, getCategoryFromName, calculateProjectCost } from './utils/calculator';
import { AdminStorageManager } from './utils/adminStorage';
import { AppBottomNav, AppTabType } from './components/app/AppBottomNav';
import { LoginPageView } from './components/app/LoginPageView';
import { MerchantApplyPage, ApplyFormData } from './components/app/MerchantApplyPage';
import { SaveCurrentPlanModal } from './components/app/SaveCurrentPlanModal';
import { SavedPlansView } from './components/app/SavedPlansView';
import { PlanTemplatesView } from './components/app/PlanTemplatesView';
import { UserProfileView } from './components/app/UserProfileView';
import {
  Home,
  RotateCcw,
  Smartphone,
  Maximize2,
  Wifi,
  Battery,
  Signal,
  Sparkles,
  ArrowLeft,
  Settings,
  Save,
  User,
  SlidersHorizontal,
  Bookmark,
  FileStack,
  FolderHeart,
  LogIn,
} from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<'app' | 'admin'>('app');
  const [appTab, setAppTab] = useState<AppTabType>('design');
  const [currentStep, setCurrentStep] = useState<'setup' | 'ai_chat' | 'rooms' | 'summary'>('setup');
  const [viewMode, setViewMode] = useState<'phone' | 'fluid'>('phone');
  const [currentTime, setCurrentTime] = useState('09:41');
  const [bomPageMode, setBomPageMode] = useState<'main' | 'editList'>('main');
  const [bomDeviceCount, setBomDeviceCount] = useState<number>(6);

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    AdminStorageManager.getUserProfile()
  );
  const [isApplyPageOpen, setIsApplyPageOpen] = useState(false);
  const [applyPreFillData, setApplyPreFillData] = useState<ApplyFormData | null>(null);

  const handleOpenApplyPage = (data?: ApplyFormData) => {
    setApplyPreFillData(data || null);
    setIsApplyPageOpen(true);
  };

  // Saved Plans & Templates State
  const [savedPlans, setSavedPlans] = useState<SavedPlanRecord[]>(() =>
    AdminStorageManager.getSavedPlans()
  );
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>(() =>
    AdminStorageManager.getPlanTemplates()
  );
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    AdminStorageManager.saveUserProfile(currentUser);
  }, [currentUser]);

  useEffect(() => {
    AdminStorageManager.saveSavedPlans(savedPlans);
  }, [savedPlans]);

  useEffect(() => {
    AdminStorageManager.savePlanTemplates(planTemplates);
  }, [planTemplates]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Core Project State
  const [communityName, setCommunityName] = useState('万科翡翠公园');
  const [minBudget, setMinBudget] = useState(5);
  const [maxBudget, setMaxBudget] = useState(12);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('layout_3b2l');
  const [floorPlanImageUrl, setFloorPlanImageUrl] = useState<string | null>(SAMPLE_FLOOR_PLAN_SVG);
  const [floorPlanPins, setFloorPlanPins] = useState<FloorPlanPin[]>([
    { id: 'pin_1', roomId: 'init_living', xPercentage: 35, yPercentage: 25 },
    { id: 'pin_2', roomId: 'init_master', xPercentage: 20, yPercentage: 65 },
    { id: 'pin_3', roomId: 'init_bedroom2', xPercentage: 48, yPercentage: 65 },
  ]);

  // Initial Rooms List from 3b2l preset layout
  const [rooms, setRooms] = useState<RoomItem[]>([
    { ...createDefaultRoom('客厅', 'living'), id: 'init_living' },
    { ...createDefaultRoom('餐厅', 'dining'), id: 'init_dining' },
    { ...createDefaultRoom('主卧', 'bedroom'), id: 'init_master' },
    { ...createDefaultRoom('次卧', 'bedroom'), id: 'init_bedroom2' },
    { ...createDefaultRoom('书房', 'study'), id: 'init_study' },
    { ...createDefaultRoom('厨房', 'kitchen'), id: 'init_kitchen' },
    { ...createDefaultRoom('主卫', 'bathroom'), id: 'init_bath1' },
    { ...createDefaultRoom('客卫', 'bathroom'), id: 'init_bath2' },
    { ...createDefaultRoom('阳台', 'balcony'), id: 'init_balcony' },
  ]);

  const [activeRoomId, setActiveRoomId] = useState<string>('init_living');

  // Handle Preset Layout Selection
  const handleSelectPresetLayout = (preset: LayoutPreset) => {
    setSelectedPresetId(preset.id);
    setMinBudget(preset.suggestedMinBudget);
    setMaxBudget(preset.suggestedMaxBudget);

    // Rebuild room list based on preset room names
    const newRooms: RoomItem[] = preset.roomNames.map((name) => {
      const category = getCategoryFromName(name);
      return createDefaultRoom(name, category);
    });

    setRooms(newRooms);
    setFloorPlanPins([]);
    if (newRooms[0]) setActiveRoomId(newRooms[0].id);
  };

  // Handlers for Room Modification
  const handleUpdateRoomScheme = (roomId: string, newScheme: RoomScheme) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, scheme: newScheme } : r))
    );
  };

  const handleRenameRoom = (roomId: string, newName: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, name: newName } : r))
    );
  };

  const handleUpdateRoomImage = (roomId: string, imageUrl: string | null) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, floorPlanImageUrl: imageUrl } : r))
    );
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
    setFloorPlanPins((prev) => prev.filter((p) => p.roomId !== roomId));
  };

  const handleAddRoom = (newRoom: RoomItem) => {
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
  };

  // Reset Project
  const handleReset = () => {
    if (window.confirm('确定要重置当前的所有配置与房间方案吗？')) {
      setCommunityName('万科翡翠公园');
      setMinBudget(5);
      setMaxBudget(12);
      setSelectedPresetId('layout_3b2l');
      const defaultPreset = LAYOUT_PRESETS[1];
      handleSelectPresetLayout(defaultPreset);
      setCurrentStep('setup');
      setAppTab('design');
    }
  };

  const project: RenovationProject = {
    communityName,
    minBudget,
    maxBudget,
    selectedPresetId,
    floorPlanImageUrl,
    floorPlanPins,
    rooms,
  };

  const costSummary = calculateProjectCost(project);

  // Template and Record Integration Handlers
  const handleApplyTemplate = (template: PlanTemplate) => {
    setCommunityName(template.title);
    setMinBudget(template.defaultMinBudget);
    setMaxBudget(template.defaultMaxBudget);
    setRooms(JSON.parse(JSON.stringify(template.rooms)));
    setFloorPlanPins([]);
    setAppTab('design');
    setCurrentStep('rooms');
  };

  const handleCreateTemplate = (newTemplate: PlanTemplate) => {
    setPlanTemplates((prev) => [newTemplate, ...prev]);
  };

  const handleUpdateTemplate = (updatedTemplate: PlanTemplate) => {
    setPlanTemplates((prev) =>
      prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
    );
  };

  const handleDeleteTemplate = (templateId: string) => {
    setPlanTemplates((prev) => prev.filter((t) => t.id !== templateId));
  };

  const handleSaveCurrentAsTemplate = () => {
    const totalDevices =
      costSummary.totalLightCircuits +
      costSummary.totalCurtains +
      costSummary.totalOtherDevices +
      costSummary.gatewayHubsNeeded;
    const newTemplate: PlanTemplate = {
      id: `tmpl_custom_${Date.now()}`,
      title: `${communityName || '定制'}方案模板`,
      subtitle: '',
      category: 'custom',
      categoryLabel: '个人专属',
      priceGrade: '个人自定',
      estimatedCostTenThousand: costSummary.totalCostTenThousand,
      roomsCount: rooms.length,
      deviceCount: totalDevices,
      features: [
        `全屋 ${rooms.length} 间房设备组合`,
        `预算约 ¥${costSummary.totalCostTenThousand}万`,
      ],
      highlights: [
        '一键导入工作台极速套用',
      ],
      recommendedLayout: `${rooms.length}房户型`,
      description: '',
      defaultMinBudget: minBudget,
      defaultMaxBudget: maxBudget,
      isUserCustom: true,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      rooms: JSON.parse(JSON.stringify(rooms)),
    };
    setPlanTemplates((prev) => [newTemplate, ...prev]);
    alert(`成功将【${communityName || '当前方案'}】保存为专属方案模板！可随时在“我的方案模板库”中查看和套用。`);
  };

  const handleSaveRecordAsTemplate = (plan: SavedPlanRecord) => {
    const planRooms = plan.project?.rooms || [];
    const newTemplate: PlanTemplate = {
      id: `tmpl_rec_${Date.now()}`,
      title: `${plan.title} (模板)`,
      subtitle: '',
      category: 'custom',
      categoryLabel: '个人专属',
      priceGrade: '个人自定',
      estimatedCostTenThousand: plan.totalCostTenThousand || 5.0,
      roomsCount: planRooms.length || 4,
      deviceCount: plan.deviceCount || 20,
      features: [
        `基于【${plan.communityName}】历史方案`,
        `全屋 ${planRooms.length || 4} 间房配置`,
      ],
      highlights: [
        '可直接套用至新项目进行微调',
      ],
      recommendedLayout: `${plan.communityName} 相似户型`,
      description: '',
      defaultMinBudget: plan.project?.minBudget || 3,
      defaultMaxBudget: plan.project?.maxBudget || 10,
      isUserCustom: true,
      createdAt: new Date().toLocaleDateString('zh-CN'),
      rooms: JSON.parse(JSON.stringify(planRooms)),
    };
    setPlanTemplates((prev) => [newTemplate, ...prev]);
  };

  const handleLoadPlan = (planRecord: SavedPlanRecord) => {
    setCommunityName(planRecord.communityName);
    setMinBudget(planRecord.project.minBudget);
    setMaxBudget(planRecord.project.maxBudget);
    setSelectedPresetId(planRecord.project.selectedPresetId);
    setFloorPlanImageUrl(planRecord.project.floorPlanImageUrl);
    setFloorPlanPins(planRecord.project.floorPlanPins || []);
    setRooms(JSON.parse(JSON.stringify(planRecord.project.rooms)));
    setAppTab('design');
    setCurrentStep('summary');
  };

  const handleSavePlanRecord = (newPlan: SavedPlanRecord) => {
    setSavedPlans((prev) => [newPlan, ...prev]);
  };

  const handleUpdatePlan = (updatedPlan: SavedPlanRecord) => {
    setSavedPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
  };

  const handleClonePlan = (plan: SavedPlanRecord) => {
    const cloned: SavedPlanRecord = {
      ...plan,
      id: `plan_rec_${Date.now()}`,
      title: `${plan.title} (副本)`,
      createdAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
      updatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
      status: '草稿',
    };
    setSavedPlans((prev) => [cloned, ...prev]);
  };

  const handleDeletePlan = (planId: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const activeOrdersCount = savedPlans.filter(
    (p) =>
      p.orderStatus === 'reviewing' ||
      p.orderStatus === 'shipping' ||
      p.orderStatus === 'delivered' ||
      p.orderStatus === 'submitted'
  ).length;

  if (appMode === 'admin') {
    return <AdminPortal onSwitchToApp={() => setAppMode('app')} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white flex flex-col items-center justify-start py-0 md:py-4">
      {/* Top Viewport Mode Bar (App Preview Controller & Web Admin Entry) */}
      <div className="w-full max-w-[412px] md:max-w-2xl px-3 py-2 flex items-center justify-between text-xs text-slate-300 bg-slate-950/95 backdrop-blur border-b md:border border-slate-800 md:rounded-2xl mb-0 md:mb-3 shadow-md z-50">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">智家全屋方案定制</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">v2.8</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('phone')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
              viewMode === 'phone'
                ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>App手机比例</span>
          </button>

          <button
            onClick={() => setViewMode('fluid')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all ${
              viewMode === 'fluid'
                ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>全屏</span>
          </button>

          <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

          <button
            onClick={() => setAppMode('admin')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-xs"
            title="进入Web后台配置方案与设备"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Web后台</span>
          </button>
        </div>
      </div>

      {/* Main App Container - Smartphone Ratio */}
      <div
        className={`w-full transition-all ${
          viewMode === 'phone'
            ? 'max-w-[412px] w-full my-0 md:my-1 rounded-none md:rounded-[40px] border-0 md:border-[8px] border-slate-800 shadow-2xl overflow-hidden bg-slate-50 relative h-screen md:h-[844px] flex flex-col'
            : 'max-w-xl bg-slate-50 min-h-screen md:min-h-[844px] flex flex-col shadow-xl md:rounded-2xl overflow-hidden relative'
        }`}
      >
        {/* Mobile OS Top Status Bar */}
        <div className="bg-slate-950 text-white px-5 pt-2.5 pb-2 flex items-center justify-between text-[11px] font-semibold tracking-tight select-none border-b border-slate-800 shrink-0">
          <span className="font-mono text-slate-200">{currentTime}</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto hidden md:flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <Signal className="w-3 h-3" />
            <span className="text-[9px] font-mono font-bold text-slate-200">5G</span>
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Main Content Area / Fullscreen Auth / Apply Page or App Views */}
        {isApplyPageOpen ? (
          <MerchantApplyPage
            initialData={applyPreFillData}
            onBack={() => setIsApplyPageOpen(false)}
            onApplySuccess={() => setIsApplyPageOpen(false)}
          />
        ) : !currentUser.isLoggedIn ? (
          <LoginPageView
            currentUser={currentUser}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
            }}
            onOpenApply={handleOpenApplyPage}
          />
        ) : (
          <>
            {/* Mobile App Header Navigation Bar */}
            {appTab === 'design' && currentStep === 'summary' && bomPageMode === 'editList' ? (
              <div className="bg-white px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between shadow-2xs sticky top-0 z-30 shrink-0">
                <button
                  onClick={() => setBomPageMode('main')}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4.5 h-4.5 text-slate-700" />
                  <span className="text-xs font-bold text-slate-700">返回方案</span>
                </button>
                <div className="text-center">
                  <h1 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight leading-none">
                    编辑设备清单
                  </h1>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {communityName || '全屋智家'} · 共 {bomDeviceCount} 件设备
                  </p>
                </div>
                <button
                  onClick={() => setBomPageMode('main')}
                  className="px-3.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  完成
                </button>
              </div>
            ) : appTab === 'design' && currentStep === 'ai_chat' ? null : (
              <div className="bg-white px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between shadow-2xs sticky top-0 z-30 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
                    {appTab === 'design' && <Home className="w-3.5 h-3.5" />}
                    {appTab === 'templates' && <FileStack className="w-3.5 h-3.5" />}
                    {appTab === 'records' && <FolderHeart className="w-3.5 h-3.5" />}
                    {appTab === 'profile' && <User className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <h1 className="font-extrabold text-xs text-slate-900 tracking-tight leading-none">
                      {appTab === 'design' && '方案定制工作台'}
                      {appTab === 'templates' && '我的方案模板库'}
                      {appTab === 'records' && '我的方案记录'}
                      {appTab === 'profile' && '个人中心'}
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px] sm:max-w-[220px]">
                      {appTab === 'design' && (communityName || '全屋智能极速定制')}
                      {appTab === 'templates' && `共 ${planTemplates.length} 套专属方案模板`}
                      {appTab === 'records' && `已保存 ${savedPlans.length} 套方案 · 支持发货追踪`}
                      {appTab === 'profile' && `${currentUser.name} · ${currentUser.phone}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile App Main Content Area */}
            {appTab === 'design' && currentStep === 'ai_chat' ? (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                <AIDialogPlanGenerator
                  project={project}
                  onUpdateRooms={(newRooms) => setRooms(newRooms)}
                  onUpdateBudget={(min, max) => {
                    setMinBudget(min);
                    setMaxBudget(max);
                  }}
                  onPrevStep={() => setCurrentStep('setup')}
                  onNextStep={() => setCurrentStep('summary')}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 pb-6 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-300">
                {/* TAB 1: DESIGN WORKSPACE */}
                {appTab === 'design' && (
                  <>
                    {currentStep === 'setup' && (
                      <CommunityBudgetSetup
                        communityName={communityName}
                        onCommunityNameChange={setCommunityName}
                        minBudget={minBudget}
                        onMinBudgetChange={setMinBudget}
                        maxBudget={maxBudget}
                        onMaxBudgetChange={setMaxBudget}
                        selectedPresetId={selectedPresetId}
                        onSelectPresetLayout={handleSelectPresetLayout}
                        rooms={rooms}
                        onNextStep={() => setCurrentStep('ai_chat')}
                      />
                    )}

                    {currentStep === 'rooms' && (
                      <RoomManager
                        rooms={rooms}
                        onUpdateRoomScheme={handleUpdateRoomScheme}
                        onRenameRoom={handleRenameRoom}
                        onDeleteRoom={handleDeleteRoom}
                        onAddRoom={handleAddRoom}
                        onSelectPresetLayout={handleSelectPresetLayout}
                        onPrevStep={() => setCurrentStep('setup')}
                        onNextStep={() => setCurrentStep('summary')}
                        totalCostTenThousand={costSummary.totalCostTenThousand}
                      />
                    )}

                    {currentStep === 'summary' && (
                      <div className="space-y-3">
                        <PlanSummaryBOM
                          project={project}
                          onPrevStep={() => setCurrentStep('ai_chat')}
                          onGoToSetup={() => setCurrentStep('setup')}
                          onSaveAsTemplate={handleSaveCurrentAsTemplate}
                          onSavePlan={() => setIsSaveModalOpen(true)}
                          pageMode={bomPageMode}
                          onPageModeChange={(mode, count) => {
                            setBomPageMode(mode);
                            if (count !== undefined) setBomDeviceCount(count);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* TAB 2: PLAN TEMPLATES */}
                {appTab === 'templates' && (
                  <PlanTemplatesView
                    templates={planTemplates}
                    activeProject={project}
                    onApplyTemplate={handleApplyTemplate}
                    onCreateTemplate={handleCreateTemplate}
                    onUpdateTemplate={handleUpdateTemplate}
                    onDeleteTemplate={handleDeleteTemplate}
                  />
                )}

                {/* TAB 3: SAVED PLAN RECORDS */}
                {appTab === 'records' && (
                  <SavedPlansView
                    savedPlans={savedPlans}
                    activeProject={project}
                    onLoadPlan={handleLoadPlan}
                    onDeletePlan={handleDeletePlan}
                    onClonePlan={handleClonePlan}
                    onUpdatePlan={handleUpdatePlan}
                    onSaveAsTemplate={handleSaveRecordAsTemplate}
                    onOpenSaveModal={() => setIsSaveModalOpen(true)}
                    onGoToDesign={() => {
                      setAppTab('design');
                      setCurrentStep('rooms');
                    }}
                    onGoToTemplates={() => setAppTab('templates')}
                  />
                )}

                {/* TAB 4: PERSONAL CENTER (PROFILE) */}
                {appTab === 'profile' && (
                  <UserProfileView
                    user={currentUser}
                    savedPlansCount={savedPlans.length}
                    templatesCount={planTemplates.length}
                    activeOrdersCount={activeOrdersCount}
                    onGoToRecords={() => setAppTab('records')}
                    onGoToTemplates={() => setAppTab('templates')}
                    onGoToDesign={() => setAppTab('design')}
                    onResetData={handleReset}
                    onUpdateUser={(updated) => {
                      setCurrentUser(updated);
                    }}
                  />
                )}
              </div>
            )}

            {/* Bottom Navigation Bar */}
            <AppBottomNav
              activeTab={appTab}
              onChangeTab={(tab) => setAppTab(tab)}
              savedPlansCount={savedPlans.length}
              isLoggedIn={currentUser.isLoggedIn}
            />
          </>
        )}
      </div>

      {/* Save Current Plan Modal */}
      <SaveCurrentPlanModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        project={project}
        totalCostTenThousand={costSummary.totalCostTenThousand}
        onSavePlan={handleSavePlanRecord}
      />
    </div>
  );
}
