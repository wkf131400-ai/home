import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Gift,
  RefreshCw,
  SlidersHorizontal,
  FolderPlus,
  Save,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  LayoutGrid,
  List,
  Star,
  DollarSign,
  Share2,
  Check,
  X,
  FileText,
  User,
  Phone,
  Building,
  HelpCircle,
} from 'lucide-react';
import {
  EquipmentProduct,
  CustomQuotationRecord,
  CustomQuoteRoomSection,
  CustomQuoteProductItem,
  CustomQuoteExtraFee,
} from '../../types';
import { AdminStorageManager, INITIAL_EQUIPMENT_PRODUCTS } from '../../utils/adminStorage';

interface ManualProductQuotationProps {
  onSaveQuotation?: (record: CustomQuotationRecord) => void;
  onOpenPointDesigner?: (planId?: string) => void;
  onExit?: () => void;
}

export const ManualProductQuotation: React.FC<ManualProductQuotationProps> = ({
  onSaveQuotation,
  onOpenPointDesigner,
  onExit,
}) => {
  // Product Library state
  const [products, setProducts] = useState<EquipmentProduct[]>(() => {
    return AdminStorageManager.getEquipmentProducts();
  });

  // Quotation Metadata
  const [quoteTitle, setQuoteTitle] = useState('翡翠公园·全屋智能手输选配报价单');
  const [customerName, setCustomerName] = useState('卫科帆');
  const [customerPhone, setCustomerPhone] = useState('17696180841');
  const [communityName, setCommunityName] = useState('万科翡翠公园');

  // Rooms and Selected Items (Seed from Screenshot 1)
  const [rooms, setRooms] = useState<CustomQuoteRoomSection[]>(() => {
    const existingQuotes = AdminStorageManager.getCustomQuotations();
    if (existingQuotes.length > 0 && existingQuotes[0].rooms.length > 0) {
      return existingQuotes[0].rooms;
    }
    return [
      {
        id: 'room_bed_1',
        roomName: '卧室',
        roomCategory: 'bedroom',
        subgroups: ['小米必备'],
        extraFees: [],
        items: [
          {
            id: 'item_init_1',
            productId: 'prod_mi_speaker_pro',
            productName: 'Xiaomi 智能音箱 Pro (雅黑)',
            model: 'Xiaomi 智能音箱 Pro (雅黑) 默认',
            brand: '小米',
            category: '背景音乐/影音',
            unitPrice: 369,
            quantity: 1,
            unit: '台',
            subtotal: 369,
            imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&auto=format&fit=crop&q=60',
            intro: 'DTS专业调音，内置红外遥控与语音控制中心',
            note: '',
            isGift: false,
            subgroup: '小米必备',
          },
        ],
      },
    ];
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => rooms[0]?.id || '');
  const [viewTab, setViewTab] = useState<'room' | 'category'>('room');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'list'>('grid');

  // Left Drawer Search & Filters
  const [categoryFilter, setCategoryFilter] = useState('全部类别');
  const [brandFilter, setBrandFilter] = useState('全部品牌');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecommendOpen, setIsRecommendOpen] = useState(true);

  // Overall Discount & Adjustment
  const [overallDiscount, setOverallDiscount] = useState<number>(1.0);
  const [extraGlobalFee, setExtraGlobalFee] = useState<number>(0);

  // Modals
  const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isExtraFeeModalOpen, setIsExtraFeeModalOpen] = useState(false);
  const [feeTargetRoomId, setFeeTargetRoomId] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states for manual product input
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('自定义品牌');
  const [manualCategory, setManualCategory] = useState('智能面板/开关');
  const [manualPrice, setManualPrice] = useState(199);
  const [manualQty, setManualQty] = useState(1);
  const [manualUnit, setManualUnit] = useState('个');
  const [manualIntro, setManualIntro] = useState('');
  const [manualNote, setManualNote] = useState('');

  // Form state for new room
  const [newRoomNameInput, setNewRoomNameInput] = useState('');

  // Form state for extra fee
  const [feeNameInput, setFeeNameInput] = useState('全屋安装调试费');
  const [feeAmountInput, setFeeAmountInput] = useState(500);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Categories & Brands list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['全部类别', ...Array.from(set)];
  }, [products]);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return ['全部品牌', ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== '全部类别' && p.category !== categoryFilter) return false;
      if (brandFilter !== '全部品牌' && p.brand !== brandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.model.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, categoryFilter, brandFilter, searchQuery]);

  // Target Room
  const currentTargetRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Add Product into Room
  const handleAddProductToRoom = (prod: EquipmentProduct, roomId?: string) => {
    const targetId = roomId || activeRoomId || rooms[0]?.id;
    if (!targetId) {
      alert('请先添加或选择一个房间');
      return;
    }

    if (replacingItemId) {
      // Replace item mode
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          items: r.items.map((item) => {
            if (item.id === replacingItemId) {
              return {
                ...item,
                productId: prod.id,
                productName: prod.model,
                model: `${prod.model} 默认`,
                brand: prod.brand,
                category: prod.category,
                unitPrice: prod.price,
                subtotal: item.isGift ? 0 : prod.price * item.quantity,
                imageUrl: prod.imageUrl,
                intro: prod.description || item.intro,
              };
            }
            return item;
          }),
        }))
      );
      setReplacingItemId(null);
      showToast(`已将设备替换为「${prod.model}」`);
      return;
    }

    const newItem: CustomQuoteProductItem = {
      id: `item_c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productId: prod.id,
      productName: prod.model,
      model: `${prod.model} 默认`,
      brand: prod.brand,
      category: prod.category,
      unitPrice: prod.price,
      quantity: 1,
      unit: prod.unit || '台',
      subtotal: prod.price,
      imageUrl: prod.imageUrl,
      intro: prod.description || '点击修改产品简介',
      note: '',
      isGift: false,
      subgroup: '智能设备',
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === targetId) {
          return {
            ...r,
            items: [...r.items, newItem],
          };
        }
        return r;
      })
    );
    showToast(`已将「${prod.model}」加入【${rooms.find((r) => r.id === targetId)?.roomName}】`);
  };

  // Add Manually Typed Product
  const handleConfirmManualAdd = () => {
    if (!manualName.trim()) {
      alert('请输入产品名称或型号');
      return;
    }

    const targetId = activeRoomId || rooms[0]?.id;
    const newItem: CustomQuoteProductItem = {
      id: `item_manual_${Date.now()}`,
      productId: `prod_custom_${Date.now()}`,
      productName: manualName.trim(),
      model: manualName.trim(),
      brand: manualBrand.trim() || '自定义品牌',
      category: manualCategory,
      unitPrice: manualPrice,
      quantity: manualQty,
      unit: manualUnit.trim() || '个',
      subtotal: manualPrice * manualQty,
      imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
      intro: manualIntro.trim() || '自定义手输产品',
      note: manualNote.trim(),
      isGift: false,
      subgroup: '手动输入',
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === targetId) {
          return {
            ...r,
            items: [...r.items, newItem],
          };
        }
        return r;
      })
    );

    setIsManualAddModalOpen(false);
    setManualName('');
    setManualIntro('');
    setManualNote('');
    showToast(`已成功手输添加「${newItem.productName}」！`);
  };

  // Item Quantity Stepper
  const handleUpdateQty = (roomId: string, itemId: string, delta: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            items: r.items
              .map((it) => {
                if (it.id === itemId) {
                  const nextQty = Math.max(1, it.quantity + delta);
                  return {
                    ...it,
                    quantity: nextQty,
                    subtotal: it.isGift ? 0 : it.unitPrice * nextQty,
                  };
                }
                return it;
              }),
          };
        }
        return r;
      })
    );
  };

  // Item Unit Price Inline Edit
  const handleUpdatePrice = (roomId: string, itemId: string, newPrice: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            items: r.items.map((it) => {
              if (it.id === itemId) {
                return {
                  ...it,
                  unitPrice: newPrice,
                  subtotal: it.isGift ? 0 : newPrice * it.quantity,
                };
              }
              return it;
            }),
          };
        }
        return r;
      })
    );
  };

  // Toggle Gift Status
  const handleToggleGift = (roomId: string, itemId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            items: r.items.map((it) => {
              if (it.id === itemId) {
                const nextGift = !it.isGift;
                return {
                  ...it,
                  isGift: nextGift,
                  subtotal: nextGift ? 0 : it.unitPrice * it.quantity,
                };
              }
              return it;
            }),
          };
        }
        return r;
      })
    );
  };

  // Delete Item
  const handleDeleteItem = (roomId: string, itemId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            items: r.items.filter((it) => it.id !== itemId),
          };
        }
        return r;
      })
    );
  };

  // Inline Note Edit
  const handleUpdateItemField = (
    roomId: string,
    itemId: string,
    field: 'intro' | 'note' | 'model',
    val: string
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            items: r.items.map((it) => {
              if (it.id === itemId) {
                return {
                  ...it,
                  [field]: val,
                };
              }
              return it;
            }),
          };
        }
        return r;
      })
    );
  };

  // Add New Room
  const handleCreateRoom = () => {
    if (!newRoomNameInput.trim()) return;
    const newRoom: CustomQuoteRoomSection = {
      id: `room_c_${Date.now()}`,
      roomName: newRoomNameInput.trim(),
      roomCategory: 'other',
      subgroups: ['基础智能'],
      items: [],
      extraFees: [],
    };
    setRooms([...rooms, newRoom]);
    setActiveRoomId(newRoom.id);
    setNewRoomNameInput('');
    setIsAddRoomModalOpen(false);
    showToast(`已添加新房间「${newRoom.roomName}」`);
  };

  // Delete Room
  const handleDeleteRoom = (roomId: string) => {
    if (rooms.length <= 1) {
      alert('至少需要保留一个房间空间');
      return;
    }
    const updated = rooms.filter((r) => r.id !== roomId);
    setRooms(updated);
    if (activeRoomId === roomId) {
      setActiveRoomId(updated[0].id);
    }
  };

  // Add Extra Fee
  const handleAddExtraFee = () => {
    if (!feeTargetRoomId || !feeNameInput.trim()) return;
    const newFee: CustomQuoteExtraFee = {
      id: `fee_${Date.now()}`,
      name: feeNameInput.trim(),
      amount: feeAmountInput,
    };
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === feeTargetRoomId) {
          return {
            ...r,
            extraFees: [...r.extraFees, newFee],
          };
        }
        return r;
      })
    );
    setIsExtraFeeModalOpen(false);
    showToast(`已添加附加费用「${newFee.name}」¥${newFee.amount}`);
  };

  // Calculations
  const roomCalculations = useMemo(() => {
    return rooms.map((r) => {
      const itemsSum = r.items.reduce((sum, item) => sum + (item.isGift ? 0 : item.subtotal), 0);
      const feesSum = r.extraFees.reduce((sum, fee) => sum + fee.amount, 0);
      const discount = r.discountRate ?? 1.0;
      const roomTotal = Math.round(itemsSum * discount) + feesSum + (r.customAdjustment || 0);
      const totalQty = r.items.reduce((sum, item) => sum + item.quantity, 0);
      return {
        roomId: r.id,
        itemsSum,
        feesSum,
        roomTotal,
        totalQty,
      };
    });
  }, [rooms]);

  const rawGrandTotal = roomCalculations.reduce((sum, rc) => sum + rc.itemsSum + rc.feesSum, 0);
  const discountedGrandTotal = Math.round(rawGrandTotal * overallDiscount) + extraGlobalFee;
  const totalAllDevicesCount = roomCalculations.reduce((sum, rc) => sum + rc.totalQty, 0);

  // Save Quotation Record
  const handleSaveQuotationRecord = () => {
    const newQuotation: CustomQuotationRecord = {
      id: `quote_${Date.now()}`,
      title: quoteTitle,
      customerName,
      customerPhone,
      communityName,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      rooms,
      overallDiscount,
      totalAmount: discountedGrandTotal,
      totalDeviceCount: totalAllDevicesCount,
      status: '已生成报价',
    };

    const existing = AdminStorageManager.getCustomQuotations();
    AdminStorageManager.saveCustomQuotations([newQuotation, ...existing]);

    if (onSaveQuotation) {
      onSaveQuotation(newQuotation);
    }
    showToast('手输选配报价单已成功保存！');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] text-slate-800 overflow-hidden select-none font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl flex items-center space-x-2 border border-slate-700 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Bar (Matching Figure 1 Top Bar) */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center justify-between shadow-2xs shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            快
          </div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-black text-slate-900 tracking-tight">快速报价</h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded">
              完全手输与选配报价
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-2" />

          {/* Project & Customer tags */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 px-1 py-0.5 focus:border-blue-500 focus:outline-hidden"
              />
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 px-1 py-0.5 focus:border-blue-500 focus:outline-hidden w-20"
              />
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsManualAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>+ 完全手输新产品</span>
          </button>

          <button
            onClick={handleSaveQuotationRecord}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存</span>
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
            >
              退出
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Stage: Left Product Drawer + Right Main Table */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT PRODUCT DRAWER (Matching Figure 1 Left Panel) ================= */}
        <div className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-xs">
          {/* Top Tabs in Left Drawer: 模板 / 报价 / 产品 */}
          <div className="flex border-b border-slate-200 text-xs font-bold text-slate-600 bg-slate-50">
            <button className="flex-1 py-2.5 text-center text-slate-400 hover:text-slate-600 border-r border-slate-200">
              模板
            </button>
            <button className="flex-1 py-2.5 text-center text-slate-400 hover:text-slate-600 border-r border-slate-200">
              报价
            </button>
            <button className="flex-1 py-2.5 text-center text-blue-600 bg-white border-b-2 border-blue-600">
              产品
            </button>
          </div>

          {/* Filters: Category & Brand Dropdowns */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
              >
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden"
              >
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input & View Mode Switcher */}
            <div className="flex items-center space-x-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="产品/型号名称"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <button
                onClick={() => setCatalogViewMode(catalogViewMode === 'grid' ? 'list' : 'grid')}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200"
                title="切换展示视图"
              >
                {catalogViewMode === 'grid' ? (
                  <List className="w-4 h-4" />
                ) : (
                  <LayoutGrid className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Target Room Switcher Indicator */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span>当前添加至:</span>
              <select
                value={activeRoomId}
                onChange={(e) => setActiveRoomId(e.target.value)}
                className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    【{r.roomName}】
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Collapsible Recommend Products Section */}
          <div className="border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setIsRecommendOpen(!isRecommendOpen)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>推荐产品 ({filteredProducts.length})</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isRecommendOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Product Items Scrollable List */}
          {isRecommendOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between hover:border-blue-400 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.model}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                        {prod.model}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {prod.brand} · {prod.category}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs font-mono font-extrabold text-blue-700">
                          ¥{prod.price}
                        </span>
                        <span className="text-[10px] text-slate-400">/{prod.unit || '台'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddProductToRoom(prod)}
                    className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer shrink-0 ml-2"
                    title={`添加至【${currentTargetRoom?.roomName || '当前房间'}】`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= CENTER MAIN QUOTATION TABLE (Matching Figure 1 Right Area) ================= */}
        <div className="flex-1 flex flex-col bg-slate-100 overflow-hidden">
          {/* Main Top Header: Tabs (房间 / 分类) + 批量操作 */}
          <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
            {/* View Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewTab('room')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewTab === 'room'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                房间
              </button>
              <button
                onClick={() => setViewTab('category')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewTab === 'category'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                分类
              </button>
            </div>

            {/* Right Tools: Batch action, Add room */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddRoomModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>+ 添加房间</span>
              </button>

              <button
                onClick={() => {
                  alert('批量操作：支持全选批量改价、批量删除、批量转移空间');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                批量操作
              </button>
            </div>
          </div>

          {/* Rooms Table List Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {rooms.map((room) => {
              const rCalc = roomCalculations.find((rc) => rc.roomId === room.id);
              const roomSubtotal = rCalc?.roomTotal || 0;

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Room Header Title Bar */}
                  <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <h3 className="text-sm font-extrabold text-slate-900">{room.roomName}</h3>
                      <span className="text-xs text-slate-400 font-mono">
                        ({room.items.length} 件产品)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setFeeTargetRoomId(room.id);
                          setIsExtraFeeModalOpen(true);
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        + 附加费用
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                      >
                        删除房间
                      </button>
                    </div>
                  </div>

                  {/* Room Items Table */}
                  {room.items.length === 0 ? (
                    <div className="p-8 text-center bg-white">
                      <p className="text-xs text-slate-400">
                        当前房间暂无选配产品，请从左侧产品库点击「+」添加，或点击上方「+ 完全手输新产品」
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5 px-4 w-60">产品</th>
                            <th className="py-2.5 px-3 w-28">品牌</th>
                            <th className="py-2.5 px-3 w-28">单价</th>
                            <th className="py-2.5 px-3 w-32">数量</th>
                            <th className="py-2.5 px-3 w-28">金额</th>
                            <th className="py-2.5 px-4">产品简介</th>
                            <th className="py-2.5 px-3 w-36">备注</th>
                            <th className="py-2.5 px-4 w-32 text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {room.items.map((item) => (
                            <tr
                              key={item.id}
                              className={`hover:bg-blue-50/30 transition-colors ${
                                item.isGift ? 'bg-amber-50/40' : ''
                              }`}
                            >
                              {/* Product Name & Spec */}
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2.5">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                  />
                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-slate-900 text-xs">
                                        {item.productName}
                                      </span>
                                      {item.isGift && (
                                        <span className="bg-rose-100 text-rose-700 font-bold text-[9px] px-1.5 py-0.2 rounded">
                                          赠品
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                      {item.model}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Brand */}
                              <td className="py-3 px-3">
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                                  {item.brand}
                                </span>
                              </td>

                              {/* Unit Price (Editable inline) */}
                              <td className="py-3 px-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-slate-400 font-mono text-xs">¥</span>
                                  <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) =>
                                      handleUpdatePrice(room.id, item.id, Number(e.target.value))
                                    }
                                    className="w-16 font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                                  />
                                  <span className="text-[10px] text-slate-400">
                                    /{item.unit || '台'}
                                  </span>
                                </div>
                              </td>

                              {/* Quantity Stepper */}
                              <td className="py-3 px-3">
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleUpdateQty(room.id, item.id, -1)}
                                    className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-mono font-bold text-xs">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleUpdateQty(room.id, item.id, 1)}
                                    className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Subtotal */}
                              <td className="py-3 px-3 font-mono font-extrabold text-xs text-blue-700">
                                {item.isGift ? (
                                  <span className="text-rose-600">¥0 (赠送)</span>
                                ) : (
                                  `¥${item.subtotal}`
                                )}
                              </td>

                              {/* Intro (Inline Editable) */}
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={item.intro || ''}
                                  placeholder="点击修改产品简介"
                                  onChange={(e) =>
                                    handleUpdateItemField(room.id, item.id, 'intro', e.target.value)
                                  }
                                  className="w-full text-xs text-slate-600 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-400 border border-transparent rounded px-1.5 py-0.5 focus:outline-hidden truncate"
                                />
                              </td>

                              {/* Note (Inline Editable) */}
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  value={item.note || ''}
                                  placeholder="+添加备注"
                                  onChange={(e) =>
                                    handleUpdateItemField(room.id, item.id, 'note', e.target.value)
                                  }
                                  className="w-full text-xs text-slate-500 bg-transparent hover:bg-slate-50 focus:bg-white focus:border-blue-400 border border-transparent rounded px-1.5 py-0.5 focus:outline-hidden"
                                />
                              </td>

                              {/* Actions: Replace, Delete, Gift */}
                              <td className="py-3 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => {
                                    setReplacingItemId(item.id);
                                    showToast(
                                      `请从左侧产品库点击任意产品以替换「${item.productName}」`
                                    );
                                  }}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  替换
                                </button>
                                <button
                                  onClick={() => handleToggleGift(room.id, item.id)}
                                  className={`text-xs font-semibold cursor-pointer ${
                                    item.isGift
                                      ? 'text-amber-600 hover:underline'
                                      : 'text-slate-500 hover:text-amber-600'
                                  }`}
                                >
                                  {item.isGift ? '取消赠送' : '赠送'}
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(room.id, item.id)}
                                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                                >
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Room Extra Fees Section */}
                  {room.extraFees.length > 0 && (
                    <div className="bg-slate-50/60 border-t border-slate-100 px-5 py-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        空间附加费用:
                      </span>
                      {room.extraFees.map((fee) => (
                        <div
                          key={fee.id}
                          className="flex items-center justify-between text-xs text-slate-600"
                        >
                          <span>{fee.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">
                              + ¥{fee.amount}
                            </span>
                            <button
                              onClick={() => {
                                setRooms((prev) =>
                                  prev.map((r) => {
                                    if (r.id === room.id) {
                                      return {
                                        ...r,
                                        extraFees: r.extraFees.filter((f) => f.id !== fee.id),
                                      };
                                    }
                                    return r;
                                  })
                                );
                              }}
                              className="text-rose-500 hover:underline text-[10px]"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Room Footer Action Toolbar (Matching Figure 1 Room Footer) */}
                  <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-4 text-xs font-bold text-slate-800">
                      <span>产品总计:</span>
                      <span className="text-base font-mono font-extrabold text-blue-700">
                        ¥{roomSubtotal}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        onClick={() => {
                          setFeeTargetRoomId(room.id);
                          setIsExtraFeeModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        + 附加费用
                      </button>
                      <button
                        onClick={() => alert('已载入默认标准费用模板')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        费用模板
                      </button>
                      <button
                        onClick={() => {
                          const rateStr = prompt(
                            '输入此房间折扣率 (如 0.9 为9折，1.0为无折扣):',
                            '1.0'
                          );
                          if (rateStr) {
                            const rate = parseFloat(rateStr);
                            if (!isNaN(rate)) {
                              setRooms((prev) =>
                                prev.map((r) =>
                                  r.id === room.id ? { ...r, discountRate: rate } : r
                                )
                              );
                            }
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        调整价格
                      </button>
                      <button
                        onClick={() => {
                          const newName = prompt('输入新的房间空间名称:', room.roomName);
                          if (newName && newName.trim()) {
                            setRooms((prev) =>
                              prev.map((r) =>
                                r.id === room.id ? { ...r, roomName: newName.trim() } : r
                              )
                            );
                          }
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        房间管理
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Add Room Prompt */}
            <div className="text-center py-4">
              <button
                onClick={() => setIsAddRoomModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-700 border-2 border-dashed border-blue-300 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ 添加更多房间空间 (如：客厅、书房、主卫)</span>
              </button>
            </div>
          </div>

          {/* ================= BOTTOM STICKY BAR (Matching Figure 1 Bottom Bar) ================= */}
          <div className="bg-white border-t border-slate-300 px-6 py-3 flex items-center justify-between shadow-lg shrink-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600">总额:</span>
                <span className="text-2xl font-mono font-black text-rose-600">
                  ¥{discountedGrandTotal.toLocaleString()}
                </span>
                {overallDiscount < 1.0 && (
                  <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                    {Math.round(overallDiscount * 100)}折优惠
                  </span>
                )}
              </div>

              <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500">
                <span>总设备数:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {totalAllDevicesCount}
                </span>
                <span>件</span>
              </div>

              <button
                onClick={() => {
                  const rateStr = prompt(
                    '输入全单整单折扣率 (如 0.95 为95折，1.0为无折扣):',
                    String(overallDiscount)
                  );
                  if (rateStr) {
                    const rate = parseFloat(rateStr);
                    if (!isNaN(rate)) {
                      setOverallDiscount(rate);
                    }
                  }
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                调整价格
              </button>
            </div>

            {/* Right Action: Generate Quotation Blue Button */}
            <div className="flex items-center space-x-3">
              {onOpenPointDesigner && (
                <button
                  onClick={() => onOpenPointDesigner('quote_rec_001')}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>前往点位图排布</span>
                </button>
              )}

              <button
                onClick={() => {
                  handleSaveQuotationRecord();
                  setIsPreviewModalOpen(true);
                }}
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>生成报价</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: MANUAL PRODUCT INPUT MODAL ================= */}
      {isManualAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">完全手输添加新产品</h3>
              </div>
              <button
                onClick={() => setIsManualAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  产品名称与型号规格 *
                </label>
                <input
                  type="text"
                  placeholder="如：KNX 四路大功率智能调光执行器 4x300W"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">所属品牌</label>
                  <input
                    type="text"
                    placeholder="如：ABB / 施耐德 / 极客定制"
                    value={manualBrand}
                    onChange={(e) => setManualBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">设备类别</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    {allCategories
                      .filter((c) => c !== '全部类别')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">单价 (元)</label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">数量</label>
                  <input
                    type="number"
                    min={1}
                    value={manualQty}
                    onChange={(e) => setManualQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">计量单位</label>
                  <input
                    type="text"
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">产品功能简介</label>
                <textarea
                  rows={2}
                  placeholder="输入此产品的特色与功能简介，将展示在报价单中..."
                  value={manualIntro}
                  onChange={(e) => setManualIntro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">施工备注</label>
                <input
                  type="text"
                  placeholder="如：需预留 220V 零火线与双绞总线"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsManualAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmManualAdd}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                确认添加进清单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD ROOM MODAL ================= */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <FolderPlus className="w-4 h-4 text-blue-600" />
              <span>添加空间房间</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">房间名称</label>
              <input
                type="text"
                placeholder="如：客厅、主卧、次卧、衣帽间、影音室"
                value={newRoomNameInput}
                onChange={(e) => setNewRoomNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:bg-white focus:border-blue-500 focus:outline-hidden"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['客厅', '主卧', '次卧', '书房', '厨房', '卫生间', '阳台', '玄关'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setNewRoomNameInput(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-md text-[11px] font-medium border border-slate-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsAddRoomModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: EXTRA FEE MODAL ================= */}
      {isExtraFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>添加附加工程/服务费用</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">费用名称</label>
                <input
                  type="text"
                  placeholder="如：安装调试费 / 穿线打孔费 / 运费"
                  value={feeNameInput}
                  onChange={(e) => setFeeNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">金额 (元)</label>
                <input
                  type="number"
                  value={feeAmountInput}
                  onChange={(e) => setFeeAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsExtraFeeModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddExtraFee}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
              >
                确定添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: OFFICIAL QUOTATION PREVIEW & PRINT ================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black">
                  智
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{quoteTitle}</h3>
                  <p className="text-xs text-slate-400">
                    客户：{customerName} ({customerPhone}) | 楼盘：{communityName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>打印/导出PDF</span>
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Quotation Sheet */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
              {/* Summary banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-blue-700 font-bold block">
                    全屋智能工程报价汇总
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    总设备数：{totalAllDevicesCount} 件 | 涵盖空间：{rooms.length} 间
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">工程总造价 (含税)</span>
                  <span className="text-2xl font-mono font-black text-rose-600">
                    ¥{discountedGrandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Room Tables */}
              {rooms.map((room) => (
                <div key={room.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-xs flex justify-between">
                    <span>【{room.roomName}】设备配置清单</span>
                    <span className="font-mono text-blue-700">
                      小计: ¥{roomCalculations.find((rc) => rc.roomId === room.id)?.roomTotal || 0}
                    </span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-500 font-bold">
                        <th className="py-2 px-3">设备名称</th>
                        <th className="py-2 px-2">品牌</th>
                        <th className="py-2 px-2">单价</th>
                        <th className="py-2 px-2">数量</th>
                        <th className="py-2 px-2">小计</th>
                        <th className="py-2 px-3">功能与施工备注</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {room.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-semibold">{item.productName}</td>
                          <td className="py-2 px-2 text-slate-500">{item.brand}</td>
                          <td className="py-2 px-2 font-mono">¥{item.unitPrice}</td>
                          <td className="py-2 px-2 font-mono">{item.quantity}</td>
                          <td className="py-2 px-2 font-mono font-bold text-blue-700">
                            {item.isGift ? '¥0 (赠送)' : `¥${item.subtotal}`}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {item.intro} {item.note ? `(${item.note})` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
