import {
  LayoutPreset,
  DefaultRoomTemplate,
  RoomDefaultDeviceItem,
  EquipmentProduct,
  LayoutRoomSchemeConfig,
  RoomItem,
  DeviceSeries,
  Customer,
  FollowUpRecord,
  UserProfile,
  SavedPlanRecord,
  PlanTemplate,
  CustomQuotationRecord,
  FloorPlanDesignProject,
  PlanChatMessage,
} from '../types';
import { LAYOUT_PRESETS, DEFAULT_ROOM_TEMPLATES, DEVICE_SERIES_LIST } from '../data/presetData';
import { INITIAL_PLAN_TEMPLATES } from '../data/planTemplatesData';
import { SAMPLE_CHAT_HISTORIES, generateDefaultChatHistory } from '../data/planChatHistoryData';
import { createDefaultRoom } from './calculator';

const STORAGE_KEYS = {
  LAYOUT_PRESETS: 'zhijia_admin_layout_presets_v2',
  ROOM_TEMPLATES: 'zhijia_admin_room_templates_v2',
  ROOM_DEVICES: 'zhijia_admin_room_devices_v2',
  EQUIPMENT_PRODUCTS: 'zhijia_admin_equipment_products_v2',
  LAYOUT_ROOM_SCHEMES: 'zhijia_admin_layout_room_schemes_v2',
  CUSTOMERS: 'zhijia_admin_customers_v1',
  FOLLOW_UPS: 'zhijia_admin_follow_ups_v1',
  USER_PROFILE: 'zhijia_app_user_profile_v1',
  SAVED_PLANS: 'zhijia_app_saved_plans_v1',
  PLAN_TEMPLATES: 'zhijia_app_plan_templates_v1',
  CUSTOM_QUOTATIONS: 'zhijia_admin_custom_quotations_v1',
  FLOOR_POINT_DESIGNS: 'zhijia_admin_floor_point_designs_v1',
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_001',
  phone: '17696180841',
  name: '卫科帆',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  roleTitle: '智家全屋定制用户',
  city: '北京市 / 朝阳区',
  isLoggedIn: true,
  createdAt: '2026-08-18 10:00',
};

export const INITIAL_SAVED_PLANS: SavedPlanRecord[] = [
  {
    id: 'plan_rec_001',
    title: '万科翡翠公园·三室两厅全屋智享方案',
    communityName: '万科翡翠公园',
    cityName: '北京',
    customerName: '卫科帆',
    customerPhone: '17696180841',
    customerNotes: '客户对客厅与主卧磁吸调光要求高，需支持色温无级调节与全屋场景联动，已预约下周现场量房。',
    createdAt: '2026-08-19 14:20',
    updatedAt: '2026-08-20 09:30',
    presetId: 'layout_3b2l',
    presetTitle: '标准三室两厅',
    roomsCount: 7,
    totalCostTenThousand: 6.8,
    totalCostYuan: 68000,
    deviceCount: 38,
    tags: ['磁吸调光', '智能温控', '双层开合帘', '重点推荐'],
    notes: '客厅主卧磁吸轨道灯深度调光，中央空调多联机集中控制，双卫生间微波雷达感应。',
    status: '已确认方案',
    orderStatus: 'shipping',
    orderStatusLabel: '已发货',
    contactedBusinessAt: '2026-08-19 15:30',
    logisticsInfo: {
      orderNumber: 'ORD20260819001',
      carrier: '顺丰速运 (SF-Express)',
      trackingNumber: 'SF138982847294',
      shippingDate: '2026-08-20 08:30',
      estimatedArrivalDate: '2026-08-21 16:00',
      recipientName: '卫科帆',
      recipientPhone: '17696180841',
      shippingAddress: '北京市朝阳区万科翡翠公园 6号楼2单元1201室',
      businessManagerName: '王浩 (专属商务经理)',
      businessManagerPhone: '186-0010-8899',
      businessManagerWechat: 'zhijia_wanghao',
      notes: '贵重智能设备，请务必当面拆箱验货，外包装均贴有防拆原厂封条',
      currentStepIndex: 2, // 0: 联系商务, 1: 商务审核中, 2: 已发货, 3: 签收
      timeline: [
        {
          status: 'contact_sales',
          stepNumber: 1,
          title: '1. 联系商务 · 提交采购需求',
          description: '客户已完成 7 空间 38 件智能设备定制清单并提交专属商务对接',
          time: '2026-08-19 15:30',
          done: true,
        },
        {
          status: 'reviewing',
          stepNumber: 2,
          title: '2. 商务审核中 · 图纸核算与排期',
          description: '商务经理 王浩 (186-0010-8899) 已完成方案图纸复核与出库签约',
          time: '2026-08-19 17:00',
          done: true,
        },
        {
          status: 'shipping',
          stepNumber: 3,
          title: '3. 已发货 (订单号: ORD20260819001)',
          description: '顺丰快递【SF138982847294】已从北京顺义总仓发出，正在派送中',
          time: '2026-08-20 09:40',
          done: true,
          active: true,
        },
        {
          status: 'delivered',
          stepNumber: 4,
          title: '4. 签收 · 现场开箱与交付验收',
          description: '顺丰专送快递员预计今日送达指定地址，签收后工程师上门联调',
          time: '预计今日 16:00',
          done: false,
        },
      ],
    },
    project: {
      communityName: '万科翡翠公园',
      cityName: '北京',
      minBudget: 5,
      maxBudget: 12,
      selectedPresetId: 'layout_3b2l',
      floorPlanImageUrl: null,
      floorPlanPins: [],
      rooms: [
        { ...createDefaultRoom('客厅', 'living'), id: 'r_rec_1' },
        { ...createDefaultRoom('餐厅', 'dining'), id: 'r_rec_2' },
        { ...createDefaultRoom('主卧', 'bedroom'), id: 'r_rec_3' },
        { ...createDefaultRoom('次卧', 'bedroom'), id: 'r_rec_4' },
        { ...createDefaultRoom('书房', 'study'), id: 'r_rec_5' },
        { ...createDefaultRoom('厨房', 'kitchen'), id: 'r_rec_6' },
        { ...createDefaultRoom('卫生间', 'bathroom'), id: 'r_rec_7' },
      ],
    },
    chatHistory: SAMPLE_CHAT_HISTORIES['plan_rec_001'],
  },
  {
    id: 'plan_rec_002',
    title: '保利天汇·两室一厅精致轻奢智能方案',
    communityName: '保利天汇',
    cityName: '北京',
    customerName: '李明 (业主)',
    customerPhone: '13800138000',
    customerNotes: '精装新房改造，尽量免凿墙布线采用Mesh无线智能，需预留智能窗帘轨道电源插座。',
    createdAt: '2026-08-17 11:05',
    updatedAt: '2026-08-18 16:15',
    presetId: 'layout_2b1l',
    presetTitle: '两室一厅品质小户',
    roomsCount: 4,
    totalCostTenThousand: 3.2,
    totalCostYuan: 32000,
    deviceCount: 20,
    tags: ['无线Mesh', '入户感应', '极简面板'],
    notes: '全屋采用 Mesh 3.0 无线方案，高性价比快速施工交付。',
    status: '已确认方案',
    orderStatus: 'reviewing',
    orderStatusLabel: '商务审核中 · 正在核算采购清单',
    contactedBusinessAt: '2026-08-20 09:10',
    logisticsInfo: {
      orderNumber: 'ORD20260820002',
      carrier: '待分配物流 (顺丰速运)',
      trackingNumber: '待审核出库后生成',
      shippingDate: '待商务审核通过后出库',
      estimatedArrivalDate: '预计审核后 2-3 工作日送达',
      recipientName: '李明',
      recipientPhone: '13800138000',
      shippingAddress: '北京市朝阳区保利天汇 2号楼1单元802室',
      businessManagerName: '李经理 (专属方案顾问)',
      businessManagerPhone: '185-1122-3344',
      businessManagerWechat: 'zhijia_liming',
      notes: '需要加急排期，预留好吊顶窗帘盒尺寸',
      currentStepIndex: 1, // 0: 联系商务, 1: 商务审核中, 2: 已发货, 3: 签收
      timeline: [
        {
          status: 'contact_sales',
          stepNumber: 1,
          title: '1. 联系商务 · 提交采购需求',
          description: '已指派资深方案顾问 李经理 (185-1122-3344) 负责核价与对接',
          time: '2026-08-20 09:10',
          done: true,
        },
        {
          status: 'reviewing',
          stepNumber: 2,
          title: '2. 商务审核中 · 核验配置与原厂直供报价',
          description: '商务经理正审核 20 件设备明细、核实零火线布线要求与专属优惠',
          time: '审核处理中...',
          done: false,
          active: true,
        },
        {
          status: 'shipping',
          stepNumber: 3,
          title: '3. 已发货(订单号)',
          description: '仓库打包扫码出库并生成快递运单号',
          time: '待审核完毕后启动',
          done: false,
        },
        {
          status: 'delivered',
          stepNumber: 4,
          title: '4. 签收',
          description: '客户验收签收完成交付',
          time: '待发货送达',
          done: false,
        },
      ],
    },
    project: {
      communityName: '保利天汇',
      cityName: '北京',
      minBudget: 3,
      maxBudget: 6,
      selectedPresetId: 'layout_2b1l',
      floorPlanImageUrl: null,
      floorPlanPins: [],
      rooms: [
        { ...createDefaultRoom('客厅', 'living'), id: 'r_rec_p2_1' },
        { ...createDefaultRoom('主卧', 'bedroom'), id: 'r_rec_p2_2' },
        { ...createDefaultRoom('次卧', 'bedroom'), id: 'r_rec_p2_3' },
        { ...createDefaultRoom('厨房', 'kitchen'), id: 'r_rec_p2_4' },
      ],
    },
    chatHistory: SAMPLE_CHAT_HISTORIES['plan_rec_002'],
  },
  {
    id: 'plan_rec_003',
    title: '中海首开拾光里·叠拼别墅全景智能方案',
    communityName: '中海首开拾光里',
    cityName: '北京',
    customerName: '张总 (高端别墅业主)',
    customerPhone: '13901018899',
    customerNotes: '别墅分层分区控制，中央机房KNX总线，需要配备家庭影院中控、全景调光与智能水系浇灌。',
    createdAt: '2026-08-16 10:00',
    updatedAt: '2026-08-16 17:20',
    presetId: 'layout_villa_3f',
    presetTitle: '三层叠拼/独栋别墅',
    roomsCount: 8,
    totalCostTenThousand: 12.5,
    totalCostYuan: 125000,
    deviceCount: 56,
    tags: ['KNX总线', '全景调光', '花园灌溉', '家庭影院'],
    notes: '别墅分层分区设计，中央机房有线总线控制。',
    status: '草稿',
    orderStatus: 'contact_sales',
    orderStatusLabel: '1. 联系商务 (待提交)',
    chatHistory: SAMPLE_CHAT_HISTORIES['plan_rec_003'],
    project: {
      communityName: '中海首开拾光里',
      cityName: '北京',
      minBudget: 10,
      maxBudget: 20,
      selectedPresetId: 'layout_villa_3f',
      floorPlanImageUrl: null,
      floorPlanPins: [],
      rooms: [
        { ...createDefaultRoom('1F 客厅', 'living'), id: 'r_rec_p3_1' },
        { ...createDefaultRoom('1F 餐厅', 'dining'), id: 'r_rec_p3_2' },
        { ...createDefaultRoom('2F 主卧套房', 'bedroom'), id: 'r_rec_p3_3' },
        { ...createDefaultRoom('2F 儿童房', 'bedroom'), id: 'r_rec_p3_4' },
        { ...createDefaultRoom('3F 露台茶室', 'study'), id: 'r_rec_p3_5' },
        { ...createDefaultRoom('-1F 影音室', 'living'), id: 'r_rec_p3_6' },
      ],
    },
  },
  {
    id: 'plan_rec_004',
    title: '西山壹号院·四室两厅大平层定制方案',
    communityName: '西山壹号院',
    cityName: '北京',
    customerName: '陈女士',
    customerPhone: '13718889900',
    customerNotes: '大平层品质全屋，智能门锁与安防联动，全屋深调光驱动，全部设备已顺丰签收并完成安装调试验收。',
    createdAt: '2026-08-10 11:30',
    updatedAt: '2026-08-15 15:45',
    presetId: 'layout_large_4room',
    presetTitle: '大平层品质全屋',
    roomsCount: 6,
    totalCostTenThousand: 8.5,
    totalCostYuan: 85000,
    deviceCount: 42,
    tags: ['全宅调光', '背景音乐', '已完工交付'],
    notes: '全屋采用深调光驱动，智能门锁与安防联动，全部设备已签收并完成安装联调。',
    status: '施工中',
    orderStatus: 'delivered',
    orderStatusLabel: '4. 已签收 (交付完成)',
    contactedBusinessAt: '2026-08-11 10:00',
    chatHistory: SAMPLE_CHAT_HISTORIES['plan_rec_004'],
    logisticsInfo: {
      orderNumber: 'ORD20260811004',
      carrier: '顺丰速运 (SF-Express)',
      trackingNumber: 'SF110992384721',
      shippingDate: '2026-08-13 09:00',
      estimatedArrivalDate: '2026-08-14 15:00',
      deliveredDate: '2026-08-14 15:20',
      recipientName: '卫科帆',
      recipientPhone: '17696180841',
      shippingAddress: '北京市海淀区西山壹号院 8号楼1单元1602室',
      businessManagerName: '王浩 (专属商务经理)',
      businessManagerPhone: '186-0010-8899',
      businessManagerWechat: 'zhijia_wanghao',
      notes: '全部设备完好签收，封条完整，质保卡已生效',
      currentStepIndex: 3, // 0: 联系商务, 1: 商务审核中, 2: 已发货, 3: 签收
      timeline: [
        {
          status: 'contact_sales',
          stepNumber: 1,
          title: '1. 联系商务 · 提交采购需求',
          description: '已提交 42 件大平层智能设备配置单',
          time: '2026-08-11 10:00',
          done: true,
        },
        {
          status: 'reviewing',
          stepNumber: 2,
          title: '2. 商务审核中 · 审核通过并锁定',
          description: '商务经理 王浩 审核确认图纸与直供价格',
          time: '2026-08-11 16:30',
          done: true,
        },
        {
          status: 'shipping',
          stepNumber: 3,
          title: '3. 已发货 (订单号: ORD20260811004)',
          description: '顺丰速运【SF110992384721】揽收并极速配送',
          time: '2026-08-13 09:00',
          done: true,
        },
        {
          status: 'delivered',
          stepNumber: 4,
          title: '4. 签收 · 客户当面验货并签收完成',
          description: '快件已送达并由业主【卫科帆】本人签收，施工工程师已同步接单',
          time: '2026-08-14 15:20',
          done: true,
          active: true,
        },
      ],
    },
    project: {
      communityName: '西山壹号院',
      cityName: '北京',
      minBudget: 7,
      maxBudget: 15,
      selectedPresetId: 'layout_large_4room',
      floorPlanImageUrl: null,
      floorPlanPins: [],
      rooms: [
        { ...createDefaultRoom('客厅', 'living'), id: 'r_rec_4_1' },
        { ...createDefaultRoom('餐厅', 'dining'), id: 'r_rec_4_2' },
        { ...createDefaultRoom('主卧', 'bedroom'), id: 'r_rec_4_3' },
        { ...createDefaultRoom('次卧1', 'bedroom'), id: 'r_rec_4_4' },
        { ...createDefaultRoom('次卧2', 'bedroom'), id: 'r_rec_4_5' },
        { ...createDefaultRoom('书房', 'study'), id: 'r_rec_4_6' },
      ],
    },
  },
];


// ---------------------------------------------------------------------------
// Initial Customer Database (Seed from Screenshot)
// ---------------------------------------------------------------------------
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    code: 'KH20260818001',
    name: '测试客户',
    projectName: '谷家智能测试',
    phone: '17696180841',
    followUpStatus: '未跟进',
    status: '资源客户',
    deliveryStatus: '未交付',
    priceGrade: '普通级别',
    salesperson: '卫科帆',
    creator: '卫科帆',
    createdAt: '08-18 16:28',
    updatedAt: '08-18 16:28',
    isPool: true,
    region: '北京-北京-朝阳',
    detailAddress: '北京顺义区大槐树镇',
    source: '上门用户',
    level: '普通客户',
    category: '家装客户',
    auditStatus: 'approved',
    designer: '测试',
    firstContactDate: '2026-08-18',
    houseArea: '120',
    houseLayout: '两室两厅',
    channel: '暂无',
    requirement: '暂无',
    remark: '暂无',
    wechat: 'wechat_test',
  },
  {
    id: 'cust_2',
    code: 'KH20260818002',
    name: '卫科帆',
    projectName: '谷家智能',
    phone: '17696180841',
    followUpStatus: '08-18 16:26',
    status: '资源客户',
    deliveryStatus: '未交付',
    priceGrade: '普通级别',
    salesperson: '卫科帆',
    creator: '卫科帆',
    createdAt: '08-18 16:23',
    updatedAt: '08-18 16:27',
    isPool: false,
    region: '北京-北京-朝阳',
    detailAddress: '北京顺义区大槐树镇',
    source: '朋友推荐',
    level: '普通客户',
    category: '家装客户',
    auditStatus: 'approved',
    designer: '测试',
    firstContactDate: '2026-08-18',
    houseArea: '140',
    houseLayout: '三室两厅',
    channel: '暂无',
    requirement: '全屋智能照明与窗帘控制联动',
    remark: '暂无',
    wechat: 'wechat_weikefan',
  },
  {
    id: 'cust_pending',
    code: 'KH20260819008',
    name: '张总 (高端业主)',
    projectName: '首开拾光里高端定制',
    phone: '13901018899',
    followUpStatus: '待商务审核',
    status: '意向客户',
    deliveryStatus: '未交付',
    priceGrade: '尊享级别',
    salesperson: '王浩 (专属商务经理)',
    creator: '商户入驻申请',
    createdAt: '08-19 14:00',
    updatedAt: '08-19 14:00',
    isPool: true,
    region: '北京-朝阳',
    detailAddress: '中海首开拾光里6栋',
    source: '经销商自助入驻申请',
    level: '优质客户',
    category: '工装客户',
    auditStatus: 'pending',
    customNotes: '申请身份：经销商 | 门店/公司：北京极智物联科技有限公司 | 城市：北京-朝阳',
  },
  {
    id: 'cust_rejected',
    code: 'KH20260819009',
    name: '陈女士',
    projectName: '西山壹号院全案设计',
    phone: '13718889900',
    followUpStatus: '资料驳回待修改',
    status: '意向客户',
    deliveryStatus: '未交付',
    priceGrade: '高端级别',
    salesperson: '王浩 (专属商务经理)',
    creator: '商户入驻申请',
    createdAt: '08-18 10:00',
    updatedAt: '08-19 11:30',
    isPool: true,
    region: '北京-海淀',
    detailAddress: '西山壹号院',
    source: '室内设计师自助入驻申请',
    level: '普通客户',
    category: '家装客户',
    auditStatus: 'rejected',
    auditFeedback: '营业执照信息不清晰，请重新提交',
    customNotes: '申请身份：室内设计师 | 门店/公司：陈木空间设计工作室 | 城市：北京-海淀',
  },
  {
    id: 'cust_3',
    code: 'KH20260818003',
    name: '张先生',
    projectName: '万科翡翠公园大平层',
    phone: '13912345678',
    followUpStatus: '08-17 14:30',
    status: '意向客户',
    deliveryStatus: '未交付',
    priceGrade: '高端级别',
    salesperson: '卫科帆',
    creator: '卫科帆',
    createdAt: '08-17 10:15',
    updatedAt: '08-18 14:20',
    isPool: false,
    region: '上海-上海-浦东',
    detailAddress: '翡翠公园7号楼1801',
    source: '渠道介绍',
    level: '重要客户',
    category: '家装客户',
    auditStatus: 'approved',
    designer: '王设计师',
    firstContactDate: '2026-08-17',
    houseArea: '185',
    houseLayout: '四室两厅',
    channel: '红星美凯龙',
    requirement: 'KNX总线调光、全屋环境温控与背景音乐系统',
    remark: '客户对科技感要求高，已看初步方案',
    wechat: 'zhang_vanke',
  },
  {
    id: 'cust_4',
    code: 'KH20260818004',
    name: '李明华',
    projectName: '紫金府复式智能全案',
    phone: '15888889999',
    followUpStatus: '待签约',
    status: '意向客户',
    deliveryStatus: '未交付',
    priceGrade: '尊享级别',
    salesperson: '李明',
    creator: '卫科帆',
    createdAt: '08-15 09:30',
    updatedAt: '08-18 11:00',
    isPool: true,
    region: '浙江-杭州-滨江',
    detailAddress: '紫金府2期5栋302',
    source: '广告投放',
    level: '优质客户',
    category: '别墅项目',
    designer: '陈总监',
    firstContactDate: '2026-08-15',
    houseArea: '260',
    houseLayout: '跃层复式',
    channel: '圣都家装',
    requirement: '全宅总线调光+智能安防+家庭影院联动',
    remark: '方案已确认，本周末到店签合同',
    wechat: 'liminghua_hz',
  },
  {
    id: 'cust_5',
    code: 'KH20260818005',
    name: '刘先生',
    projectName: '融创壹号院样板间',
    phone: '13700001111',
    followUpStatus: '丢单',
    status: '丢单客户',
    deliveryStatus: '未交付',
    priceGrade: '普通级别',
    salesperson: '卫科帆',
    creator: '卫科帆',
    createdAt: '08-10 14:00',
    updatedAt: '08-16 17:30',
    isPool: true,
    region: '广东-深圳-南山',
    detailAddress: '壹号院3栋2202',
    source: '上门用户',
    level: '普通客户',
    category: '工装客户',
    designer: '李工',
    firstContactDate: '2026-08-10',
    houseArea: '95',
    houseLayout: '两室一厅',
    channel: '暂无',
    requirement: '基础开关面板改造',
    remark: '客户因精装已封板完工暂不加装',
    wechat: 'liu_rc',
  },
];

// Initial Follow-up Records
export const INITIAL_FOLLOW_UPS: FollowUpRecord[] = [
  {
    id: 'fu_1',
    customerId: 'cust_2',
    time: '2026-08-18 16:27:16',
    method: '指派客户',
    matter: '卫科帆 将项目客户[谷家智能] 指派给 卫科帆',
    result: '-',
    type: '日志',
    operator: '卫科帆',
  },
  {
    id: 'fu_2',
    customerId: 'cust_2',
    time: '2026-08-18 16:26:18',
    method: '更新客户状态',
    matter: '测试 查看详情',
    result: '测试',
    type: '跟进',
    operator: '卫科帆',
    contactPerson: '卫科帆',
    contactPhone: '17696180841',
  },
  {
    id: 'fu_3',
    customerId: 'cust_2',
    time: '2026-08-18 16:23:58',
    method: '创建客户',
    matter: '卫科帆创建客户【卫科帆】',
    result: '-',
    type: '日志',
    operator: '卫科帆',
  },
  {
    id: 'fu_4',
    customerId: 'cust_1',
    time: '2026-08-18 16:28:19',
    method: '创建客户',
    matter: '卫科帆创建客户【测试客户】入客户池',
    result: '-',
    type: '日志',
    operator: '卫科帆',
  },
  {
    id: 'fu_5',
    customerId: 'cust_3',
    time: '2026-08-18 14:20:00',
    method: '方案汇报',
    matter: '向张总汇报万科翡翠公园大平层KNX全屋方案及预算清单',
    result: '客户对客厅与主卧场景面板调光很认可，提出增加阳台传感器联动，预计周四二次沟通',
    type: '跟进',
    operator: '卫科帆',
    contactPerson: '张总',
    contactPhone: '13912345678',
    lossStatus: '正常跟进',
    nextFollowUp: '方案深化',
    nextFollowUpTime: '2026-08-20 14:30',
  },
];

// ---------------------------------------------------------------------------
// 1. Initial Equipment Product Catalog (设备产品库)
// ---------------------------------------------------------------------------
export const INITIAL_EQUIPMENT_PRODUCTS: EquipmentProduct[] = [
  {
    id: 'prod_mi_speaker_pro',
    model: 'Xiaomi 智能音箱 Pro (雅黑)',
    brand: '小米',
    category: '背景音乐/影音',
    price: 369,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 预留 220V 电源五孔插座；\n2. 建议摆放于客厅电视柜或床头柜开阔位置；\n3. 支持小爱同学语音控制全屋智能设备与红外遥控家电。',
    description: 'DTS调音高保真音质，内置红外遥控发射阵列与蓝牙Mesh网关。',
  },
  {
    id: 'prod_mi_speaker_std',
    model: 'Xiaomi 智能音箱',
    brand: '小米',
    category: '背景音乐/影音',
    price: 249,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 220V 供电；\n2. 支持双台立体声配对；\n3. 支持连续对话与就近唤醒。',
    description: '澎湃声浪，小爱语音助手，智能家居控制中心与蓝牙Mesh中继网关。',
  },
  {
    id: 'prod_mi_lock_m30pro',
    model: '智能门锁 M30Pro',
    brand: '小米',
    category: '智能门锁/安防',
    price: 3499,
    unit: '把',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 适用标准防盗门厚度 40-120mm；\n2. 掌静脉+3D结构光双活体人脸识别；\n3. 门内自带高清全彩显示大屏与智能猫眼。',
    description: '旗舰级 AI 掌静脉与双目人脸识别，疾速全自动降噪锁体，全天候逗留抓拍。',
  },
  {
    id: 'prod_mi_home_panel',
    model: '智能家庭面板',
    brand: '小米',
    category: '智能面板/开关',
    price: 349,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 标准单 86 底盒直接嵌入安装；\n2. 需预留强电零火线；\n3. 自带三路物理开关继电器输出。',
    description: '3.22寸高清触控彩屏，内置中枢网关与小爱语音，一屏聚合照明/窗帘/温控与场景。',
  },
  {
    id: 'prod_mi_central_gateway',
    model: '智能中枢网关',
    brand: '小米',
    category: '智能网关/中控',
    price: 349,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 支持 RJ45 千兆有线网口直连与 Wi-Fi 双频连接；\n2. 内置本地自动化处理引擎；\n3. 适合放置于弱电箱或全屋中心位置。',
    description: '全屋智能本地中枢大脑，断网仍可稳定毫秒级执行复杂联动与自动化场景。',
  },
  {
    id: 'prod_mi_multimode_gw2',
    model: '小米智能多模网关2',
    brand: '小米',
    category: '智能网关/中控',
    price: 229,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 支持 Type-C 5V/1A 电源供电；\n2. 支持百兆网口与 2.4G/5G 双频 Wi-Fi；\n3. 建议远离强电磁干扰源。',
    description: '支持 Bluetooth Mesh、Zigbee 3.0 与有线网口，三模协议互通互联。',
  },
  {
    id: 'prod_mi_presence_sensor',
    model: '小米人体传感器',
    brand: '小米',
    category: '传感器/雷达',
    price: 149,
    unit: '个',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 毫米波雷达+红外双重探测；\n2. 磁吸底座支持顶装与墙壁粘贴；\n3. 灵敏度三档可调。',
    description: '微动感应人来灯亮，静坐阅览保持常亮，人走延时自动关灯。',
  },
  {
    id: 'prod_mi_switch_pro',
    model: '小米智能开关Pro',
    brand: '小米',
    category: '智能面板/开关',
    price: 129,
    unit: '个',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 标准 86 底盒安装；\n2. 零火单火兼容设计；\n3. AG磨砂玻璃面板防刮花。',
    description: '高颜值大按键，支持转无线开关模式，智能灯不掉线控制。',
  },
  {
    id: 'prod_gw_m3',
    model: 'Aqara 智能网关 M3 Pro',
    brand: '绿米 Aqara',
    category: '智能网关/中控',
    price: 1280,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 建议置于全屋中心弱电箱或吊顶遮挡处；\n2. 需预留 220V 电源插座与千兆网线接口；\n3. 避免金属箱体完全屏蔽无线信号。',
    description: '全屋智能核心大脑，支持本地断网离线自动化与 Thread/Zigbee/Mesh 协议。',
  },
  {
    id: 'prod_sw_z1',
    model: 'Aqara 零火版四路智能调光触控开关 Z1',
    brand: '绿米 Aqara',
    category: '智能面板/开关',
    price: 380,
    unit: '个',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 必须预留 86 型深暗盒(深度≥50mm)；\n2. 必须布设强电零线(N线)与火线(L线)；\n3. 负载单路功率最大支持 400W LED 灯具。',
    description: '四路无极调光调色，高灵敏触控反馈，支持多场景一键联动。',
  },
  {
    id: 'prod_ap_wifi7',
    model: '华为 Wi-Fi 7 12906M 三频万兆吸顶 AP AirEngine 5771',
    brand: '华为',
    category: '无线AP/网络',
    price: 2800,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 天花板中心开孔或挂墙固定底座；\n2. 需预留 Cat6 六类屏蔽双绞网线直通弱电箱；\n3. 必须由标准 48V PoE 交换机供电。',
    description: 'Wi-Fi 7 极速超大并发，适用客厅影音与高密智能终端无缝无感漫游。',
  },
  {
    id: 'prod_poe_8p',
    model: '锐捷 8口 2.5G PoE+ 智能网管交换机 RG-NIS2100',
    brand: '锐捷网络',
    category: '交换机/网络',
    price: 1500,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 弱电柜或标准 19 英寸机架壁挂固定；\n2. 机箱四周保留≥5cm散热间隙；\n3. 整机最高 PoE 供电输出功率为 120W。',
    description: '8个全 2.5G 速率 PoE+ 电口，满足全屋高带宽 AP 与 IP 摄像头极速供电。',
  },
  {
    id: 'prod_curtain_c1',
    model: '欧瑞博 智能双轨静音电动开合窗帘电机 C1',
    brand: '欧瑞博',
    category: '智能窗帘/电机',
    price: 680,
    unit: '套',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 窗帘盒开槽净宽: 单轨≥15cm, 双轨≥22cm；\n2. 窗帘轨道端部墙角预留 220V 三孔插座；\n3. 吊顶加固需采用双层大芯板受力。',
    description: '超静音高扭矩电机，支持布帘+纱帘双轨智能控制，遇阻即停与手拉即启。',
  },
  {
    id: 'prod_curtain_aqara_c3',
    model: 'Aqara 智能窗帘伴侣/电机 C3',
    brand: '绿米 Aqara',
    category: '智能窗帘/电机',
    price: 699,
    unit: '套',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 窗帘轨道端部预留 220V 电源；\n2. 支持自定义开合比例与日出唤醒。',
    description: '强劲动力静音开合，支持无极变速，支持Apple HomeKit 与米家双生态。',
  },
  {
    id: 'prod_lock_q5',
    model: '德施曼 3D 结构光人脸识别全自动智能防盗门锁 Q5',
    brand: '德施曼',
    category: '智能门锁/安防',
    price: 1680,
    unit: '把',
    imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 确认防盗门厚度 40-120mm ；\n2. 标配 24*240mm 导向板尺寸；\n3. 门前无镜面反光遮挡，摄像头离地 1.3-1.8m 范围。',
    description: '红外人脸秒级识别，全自动锁体，支持防猫眼撬门与离家场景一键联动。',
  },
  {
    id: 'prod_sensor_radar',
    model: '涂鸦人体存在毫米波雷达感应器 (微动识别防潮型)',
    brand: '涂鸦智能',
    category: '传感器/雷达',
    price: 220,
    unit: '个',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 吸顶或墙角斜下 45° 视角安装；\n2. 避开空调出风口、摇摆风扇及植物干扰；\n3. 采用 Type-C 5V/1A 持续供电。',
    description: '微动与呼吸级精确定位识别，洗澡静坐不关灯，防误判防漏判。',
  },
  {
    id: 'prod_thermostat_mp',
    model: '欧瑞博 MixPad S 智能温控一体化触控屏',
    brand: '欧瑞博',
    category: '环境控制/温控',
    price: 880,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 嵌入式 86 暗盒预留 220V 零火线；\n2. 配合中央空调 485 网关通讯板卡总线接线；\n3. 建议离地 1.3 米便于触控操作。',
    description: '集中央空调、新风、地暖与照明场景于一体的高清触控显示面板。',
  },
  {
    id: 'prod_music_yuda',
    model: '悠达 餐厅一体化高保真吸顶背景音乐主机',
    brand: '悠达',
    category: '背景音乐/影音',
    price: 880,
    unit: '套',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 吊顶石膏板开孔 165mm；\n2. 预留 220V 强电电源与两组 100 芯纯铜无氧喇叭线；\n3. 注意金属吊顶龙骨避让。',
    description: '无损蓝牙/AirPlay 2/语音点歌，餐厨一体化背景氛围音乐系统。',
  },
  {
    id: 'prod_panel_ap',
    model: '锐捷 3000M Wi-Fi 6 暗盒入墙面板 AP',
    brand: '锐捷网络',
    category: '无线AP/网络',
    price: 380,
    unit: '台',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 嵌入式标准 86 型墙面暗盒安装；\n2. 必须连接强电弱电隔离的网络 Cat6 网线；\n3. 支持 PoE 远程集约供电。',
    description: '美观隐形入墙，零死角覆盖卧室与书房Wi-Fi网络。',
  },
  {
    id: 'prod_yeelight_spot',
    model: 'Yeelight 易来 M2 智能防眩射灯',
    brand: 'Yeelight',
    category: '智能灯具/照明',
    price: 99,
    unit: '个',
    imageUrl: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 吊顶开孔 75mm；\n2. 深度深杯防眩 45° 遮光角；\n3. 支持凌动开关无极调光调色温。',
    description: '高显色 Ra97，2700K-6500K 宽色温无极调节，护眼健康照明。',
  },
  {
    id: 'prod_yeelight_track',
    model: 'Yeelight 磁吸轨道泛光灯条 (0.6米/12W)',
    brand: 'Yeelight',
    category: '智能灯具/照明',
    price: 189,
    unit: '支',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=60',
    installationNotes: '1. 预埋低压 24V/48V 磁吸嵌入式轨道；\n2. 磁吸按扣自锁固定；\n3. 配合驱动电源接入。',
    description: '无边框嵌入，均匀柔和漫反射出光，极简无主灯设计核心灯具。',
  },
];

// ---------------------------------------------------------------------------
// 2. Initial Layout Room Default Smart Schemes (户型与房间默认智能方案)
// ---------------------------------------------------------------------------
export const INITIAL_LAYOUT_ROOM_SCHEMES: LayoutRoomSchemeConfig[] = [
  // ---------------- 三室两厅精装户型 (preset_medium_3room) ----------------
  {
    id: 'lrs_3r_weakbox',
    layoutPresetId: 'preset_medium_3room',
    roomCategory: 'weak_box',
    roomName: '弱电箱 / 核心机房',
    title: '全屋核心通信与控制网关中心',
    description: '集中管理全屋智能网关、PoE 交换机与主光猫路由器',
    lightingCircuits: 0,
    dimmableCircuits: 0,
    curtainType: 'none',
    devices: [
      {
        id: 'd_3r_wb_1',
        productId: 'prod_gw_m3',
        brand: '绿米 Aqara',
        model: 'Aqara 智能网关 M3 Pro',
        category: '智能网关/中控',
        qty: 1,
        unit: '台',
        unitPrice: 1280,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
        installationNotes: '需预留 220V 电源与千兆网线；防金属箱体完全屏蔽遮挡',
      },
      {
        id: 'd_3r_wb_2',
        productId: 'prod_poe_8p',
        brand: '锐捷网络',
        model: '锐捷 8口 2.5G PoE+ 智能网管交换机 RG-NIS2100',
        category: '交换机/网络',
        qty: 1,
        unit: '台',
        unitPrice: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&auto=format&fit=crop&q=60',
        installationNotes: '机箱四周保留散热间隙，PoE 供电总输出上限 120W',
      },
    ],
  },
  {
    id: 'lrs_3r_living',
    layoutPresetId: 'preset_medium_3room',
    roomCategory: 'living',
    roomName: '客厅',
    title: '客厅多场景智能调光与影音联动方案',
    description: '4路无极调光调色，双轨电动窗帘，三频 Wi-Fi 7 万兆 AP 覆盖',
    lightingCircuits: 4,
    dimmableCircuits: 2,
    curtainType: 'open_close',
    devices: [
      {
        id: 'd_3r_liv_1',
        productId: 'prod_sw_z1',
        brand: '绿米 Aqara',
        model: 'Aqara 零火版四路智能调光触控开关 Z1',
        category: '智能面板/开关',
        qty: 2,
        unit: '个',
        unitPrice: 380,
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
        installationNotes: '必须预留 86 深暗盒与强电零火线',
      },
      {
        id: 'd_3r_liv_2',
        productId: 'prod_curtain_c1',
        brand: '欧瑞博',
        model: '欧瑞博 智能双轨静音电动开合窗帘电机 C1',
        category: '智能窗帘/电机',
        qty: 1,
        unit: '套',
        unitPrice: 680,
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=60',
        installationNotes: '窗帘盒净宽≥22cm，端部预留 220V 三孔插座',
      },
      {
        id: 'd_3r_liv_3',
        productId: 'prod_ap_wifi7',
        brand: '华为',
        model: '华为 Wi-Fi 7 12906M 三频万兆吸顶 AP AirEngine 5771',
        category: '无线AP/网络',
        qty: 1,
        unit: '台',
        unitPrice: 2800,
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60',
        installationNotes: '需由 PoE 交换机供电，预留六类屏蔽网线',
      },
    ],
  },
  {
    id: 'lrs_3r_bedroom',
    layoutPresetId: 'preset_medium_3room',
    roomCategory: 'bedroom',
    roomName: '主卧',
    title: '主卧舒适起夜与氛围照明方案',
    description: '微光双控起夜灯，暗盒面板 AP 覆盖，单轨开合窗帘',
    lightingCircuits: 3,
    dimmableCircuits: 1,
    curtainType: 'open_close',
    devices: [
      {
        id: 'd_3r_bed_1',
        productId: 'prod_sw_z1',
        brand: '绿米 Aqara',
        model: 'Aqara 零火版四路智能调光触控开关 Z1',
        category: '智能面板/开关',
        qty: 1,
        unit: '个',
        unitPrice: 380,
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
        installationNotes: '床头暗盒预留零火线',
      },
      {
        id: 'd_3r_bed_2',
        productId: 'prod_panel_ap',
        brand: '锐捷网络',
        model: '锐捷 3000M Wi-Fi 6 暗盒入墙面板 AP',
        category: '无线AP/网络',
        qty: 1,
        unit: '台',
        unitPrice: 380,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
        installationNotes: '嵌入 86 型暗盒，网络六类线接头',
      },
    ],
  },
  {
    id: 'lrs_3r_entrance',
    layoutPresetId: 'preset_medium_3room',
    roomCategory: 'entrance',
    roomName: '玄关',
    title: '玄关刷脸安防与离家一键控方案',
    description: '人脸识别门锁，离家模式场景触控面板',
    lightingCircuits: 2,
    dimmableCircuits: 0,
    curtainType: 'none',
    devices: [
      {
        id: 'd_3r_ent_1',
        productId: 'prod_lock_q5',
        brand: '德施曼',
        model: '德施曼 3D 结构光人脸识别全自动智能防盗门锁 Q5',
        category: '智能门锁/安防',
        qty: 1,
        unit: '把',
        unitPrice: 1680,
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
        installationNotes: '确认门厚 40-120mm，镜头安装高度 1.3-1.8m',
      },
    ],
  },
  {
    id: 'lrs_3r_bathroom',
    layoutPresetId: 'preset_medium_3room',
    roomCategory: 'bathroom',
    roomName: '卫生间',
    title: '卫生间人感雷达自动化方案',
    description: '毫米波雷达感应，洗澡静坐不误关灯，防潮吸顶',
    lightingCircuits: 2,
    dimmableCircuits: 0,
    curtainType: 'none',
    devices: [
      {
        id: 'd_3r_bath_1',
        productId: 'prod_sensor_radar',
        brand: '涂鸦智能',
        model: '涂鸦人体存在毫米波雷达感应器 (微动识别防潮型)',
        category: '传感器/雷达',
        qty: 1,
        unit: '个',
        unitPrice: 220,
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=60',
        installationNotes: '吸顶安装，避开风扇与热源抖动',
      },
    ],
  },

  // ---------------- 两室一厅小户型 (preset_small_1room) ----------------
  {
    id: 'lrs_small_living',
    layoutPresetId: 'preset_small_1room',
    roomCategory: 'living',
    roomName: '客厅',
    title: '小户型精简智能客厅方案',
    description: '基础智能网关与调光面板，高性价比',
    lightingCircuits: 3,
    dimmableCircuits: 1,
    curtainType: 'open_close',
    devices: [
      {
        id: 'd_sm_liv_1',
        productId: 'prod_gw_m3',
        brand: '绿米 Aqara',
        model: 'Aqara 智能网关 M3 Pro',
        category: '智能网关/中控',
        qty: 1,
        unit: '台',
        unitPrice: 1280,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=60',
        installationNotes: '电视柜或客厅中心摆放',
      },
      {
        id: 'd_sm_liv_2',
        productId: 'prod_sw_z1',
        brand: '绿米 Aqara',
        model: 'Aqara 零火版四路智能调光触控开关 Z1',
        category: '智能面板/开关',
        qty: 1,
        unit: '个',
        unitPrice: 380,
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&auto=format&fit=crop&q=60',
        installationNotes: '预留零火线与 86 底盒',
      },
    ],
  },

  // ---------------- 四室两厅大平层 (preset_large_4room) ----------------
  {
    id: 'lrs_large_living',
    layoutPresetId: 'preset_large_4room',
    roomCategory: 'living',
    roomName: '客厅',
    title: '大平层奢华全智能客厅中控系统',
    description: '包含环境触控屏 MixPad S，万兆 Wi-Fi 7 AP，背景音乐与双轨窗帘',
    lightingCircuits: 6,
    dimmableCircuits: 4,
    curtainType: 'open_close',
    devices: [
      {
        id: 'd_lg_liv_1',
        productId: 'prod_thermostat_mp',
        brand: '欧瑞博',
        model: '欧瑞博 MixPad S 智能温控一体化触控屏',
        category: '环境控制/温控',
        qty: 1,
        unit: '台',
        unitPrice: 880,
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&auto=format&fit=crop&q=60',
        installationNotes: '485 通讯接口连接中央空调与新风',
      },
      {
        id: 'd_lg_liv_2',
        productId: 'prod_ap_wifi7',
        brand: '华为',
        model: '华为 Wi-Fi 7 12906M 三频万兆吸顶 AP AirEngine 5771',
        category: '无线AP/网络',
        qty: 1,
        unit: '台',
        unitPrice: 2800,
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=60',
        installationNotes: '需由 48V PoE 交换机供电',
      },
      {
        id: 'd_lg_liv_3',
        productId: 'prod_curtain_c1',
        brand: '欧瑞博',
        model: '欧瑞博 智能双轨静音电动开合窗帘电机 C1',
        category: '智能窗帘/电机',
        qty: 2,
        unit: '套',
        unitPrice: 680,
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=60',
        installationNotes: '双开阳台与观景窗帘',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. Admin Storage Manager Class
// ---------------------------------------------------------------------------
export class AdminStorageManager {
  // Layout Presets
  static getLayoutPresets(): LayoutPreset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_PRESETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse admin layout presets', e);
    }
    return LAYOUT_PRESETS;
  }

  static saveLayoutPresets(presets: LayoutPreset[]): void {
    localStorage.setItem(STORAGE_KEYS.LAYOUT_PRESETS, JSON.stringify(presets));
  }

  // Equipment Product Catalog (设备产品库)
  static getEquipmentProducts(): EquipmentProduct[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT_PRODUCTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse equipment products', e);
    }
    return INITIAL_EQUIPMENT_PRODUCTS;
  }

  static saveEquipmentProducts(products: EquipmentProduct[]): void {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT_PRODUCTS, JSON.stringify(products));
  }

  // Layout Room Default Smart Schemes (户型与房间默认智能方案)
  static getLayoutRoomSchemes(): LayoutRoomSchemeConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_ROOM_SCHEMES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse layout room schemes', e);
    }
    return INITIAL_LAYOUT_ROOM_SCHEMES;
  }

  static saveLayoutRoomSchemes(schemes: LayoutRoomSchemeConfig[]): void {
    localStorage.setItem(STORAGE_KEYS.LAYOUT_ROOM_SCHEMES, JSON.stringify(schemes));
  }

  // Legacy Default Room Templates Map (fallback)
  static getRoomTemplates(): Record<RoomItem['category'], DefaultRoomTemplate> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROOM_TEMPLATES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse admin room templates', e);
    }
    return DEFAULT_ROOM_TEMPLATES;
  }

  static saveRoomTemplates(templates: Record<RoomItem['category'], DefaultRoomTemplate>): void {
    localStorage.setItem(STORAGE_KEYS.ROOM_TEMPLATES, JSON.stringify(templates));
  }

  // Legacy Room Default Devices
  static getRoomDefaultDevices(): RoomDefaultDeviceItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROOM_DEVICES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse room default devices', e);
    }
    return [];
  }

  static saveRoomDefaultDevices(devices: RoomDefaultDeviceItem[]): void {
    localStorage.setItem(STORAGE_KEYS.ROOM_DEVICES, JSON.stringify(devices));
  }

  // Device Series List
  static getDeviceSeriesList(): DeviceSeries[] {
    return DEVICE_SERIES_LIST;
  }

  // CRM Customer Management
  static getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse customers', e);
    }
    return INITIAL_CUSTOMERS;
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  // CRM Follow-up Records
  static getFollowUps(): FollowUpRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOLLOW_UPS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse follow ups', e);
    }
    return INITIAL_FOLLOW_UPS;
  }

  static saveFollowUps(records: FollowUpRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(records));
  }

  // User Profile & Authentication
  static getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse user profile', e);
    }
    return INITIAL_USER_PROFILE;
  }

  static saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  // App Saved Plans (方案记录)
  static getSavedPlans(): SavedPlanRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_PLANS);
      if (data) {
        const parsed: SavedPlanRecord[] = JSON.parse(data);
        return parsed.map((p) => {
          const sanitizedPhone = p.customerPhone && p.customerPhone.trim() ? p.customerPhone : '17696180841';
          const sanitizedStatusLabel = p.orderStatus === 'shipping' ? '已发货' : (p.orderStatusLabel?.replace(/\(顺丰单号:[^)]*\)/g, '').trim() || p.status);
          let chat = p.chatHistory;
          if (!chat || chat.length === 0) {
            const sample = SAMPLE_CHAT_HISTORIES[p.id];
            chat = sample ? sample : generateDefaultChatHistory(p);
          }
          return {
            ...p,
            customerPhone: sanitizedPhone,
            orderStatusLabel: sanitizedStatusLabel,
            chatHistory: chat,
          };
        });
      }
    } catch (e) {
      console.error('Failed to parse saved plans', e);
    }
    return INITIAL_SAVED_PLANS.map((p) => ({
      ...p,
      customerPhone: p.customerPhone && p.customerPhone.trim() ? p.customerPhone : '17696180841',
      orderStatusLabel: p.orderStatus === 'shipping' ? '已发货' : (p.orderStatusLabel?.replace(/\(顺丰单号:[^)]*\)/g, '').trim() || p.status),
    }));
  }

  static saveSavedPlans(plans: SavedPlanRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(plans));
  }

  static saveSingleSavedPlan(plan: SavedPlanRecord): void {
    const plans = this.getSavedPlans();
    const exists = plans.some((p) => p.id === plan.id);
    const updated = exists ? plans.map((p) => (p.id === plan.id ? plan : p)) : [plan, ...plans];
    this.saveSavedPlans(updated);
  }

  static deleteSavedPlan(planId: string): void {
    const plans = this.getSavedPlans();
    const updated = plans.filter((p) => p.id !== planId);
    this.saveSavedPlans(updated);
  }

  static appendPlanChatMessage(planId: string, message: PlanChatMessage): void {
    const plans = this.getSavedPlans();
    const updated = plans.map((p) => {
      if (p.id === planId) {
        const history = p.chatHistory || [];
        return {
          ...p,
          chatHistory: [...history, message],
          updatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`,
        };
      }
      return p;
    });
    this.saveSavedPlans(updated);
  }

  // App Plan Templates (方案模板)
  static getPlanTemplates(): PlanTemplate[] {
    const customerSeedMeta = [
      { authorName: '卫科帆', authorPhone: '17696180841', communityName: '万科翡翠公园' },
      { authorName: '张建国', authorPhone: '13812345678', communityName: '保利天汇' },
      { authorName: '李明华', authorPhone: '13911223344', communityName: '华润幸福里' },
      { authorName: '王芳', authorPhone: '13700112233', communityName: '中海甲叁號院' },
      { authorName: '赵文博', authorPhone: '13688990011', communityName: '龙湖天境' },
      { authorName: '刘静', authorPhone: '13566778899', communityName: '汤臣一品' },
    ];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAN_TEMPLATES);
      if (data) {
        const parsed: PlanTemplate[] = JSON.parse(data);
        return parsed.map((t, idx) => {
          const meta = customerSeedMeta[idx % customerSeedMeta.length];
          return {
            ...t,
            isUserCustom: true,
            authorName: t.authorName && !t.authorName.includes('VIP') && !t.authorName.includes('官方') ? t.authorName : meta.authorName,
            authorPhone: t.authorPhone && t.authorPhone !== '400-800-8899' ? t.authorPhone : meta.authorPhone,
            communityName: t.communityName || meta.communityName,
            status: t.status || 'published',
            usageCount: t.usageCount ?? (18 - idx * 2),
          };
        });
      }
    } catch (e) {
      console.error('Failed to parse plan templates', e);
    }
    return INITIAL_PLAN_TEMPLATES.map((t, idx) => {
      const meta = customerSeedMeta[idx % customerSeedMeta.length];
      return {
        ...t,
        isUserCustom: true,
        authorName: meta.authorName,
        authorPhone: meta.authorPhone,
        communityName: meta.communityName,
        status: t.status || 'published',
        usageCount: t.usageCount ?? (24 - idx * 3),
      };
    });
  }

  static savePlanTemplates(templates: PlanTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.PLAN_TEMPLATES, JSON.stringify(templates));
  }

  static saveSinglePlanTemplate(template: PlanTemplate): void {
    const templates = this.getPlanTemplates();
    const exists = templates.some((t) => t.id === template.id);
    const updated = exists ? templates.map((t) => (t.id === template.id ? template : t)) : [template, ...templates];
    this.savePlanTemplates(updated);
  }

  static deletePlanTemplate(templateId: string): void {
    const templates = this.getPlanTemplates();
    const updated = templates.filter((t) => t.id !== templateId);
    this.savePlanTemplates(updated);
  }

  // Custom Product Quotations (完全手输与选配产品报价 - 图一)
  static getCustomQuotations(): CustomQuotationRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUOTATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse custom quotations', e);
    }
    return INITIAL_CUSTOM_QUOTATIONS;
  }

  static saveCustomQuotations(quotations: CustomQuotationRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUOTATIONS, JSON.stringify(quotations));
  }

  // CAD Floor Point Placement Designs (点位图配置 - 图二)
  static getFloorPointDesigns(): FloorPlanDesignProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLOOR_POINT_DESIGNS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse floor point designs', e);
    }
    return INITIAL_FLOOR_DESIGNS;
  }

  static saveFloorPointDesigns(projects: FloorPlanDesignProject[]): void {
    localStorage.setItem(STORAGE_KEYS.FLOOR_POINT_DESIGNS, JSON.stringify(projects));
  }

  // Restore Factory Defaults
  static restoreAllDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.LAYOUT_PRESETS);
    localStorage.removeItem(STORAGE_KEYS.ROOM_TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.ROOM_DEVICES);
    localStorage.removeItem(STORAGE_KEYS.EQUIPMENT_PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.LAYOUT_ROOM_SCHEMES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.FOLLOW_UPS);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SAVED_PLANS);
    localStorage.removeItem(STORAGE_KEYS.PLAN_TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.FLOOR_POINT_DESIGNS);
  }
}

// ---------------------------------------------------------------------------
// Initial Custom Quotations (Seed from Screenshot 1)
// ---------------------------------------------------------------------------
export const INITIAL_CUSTOM_QUOTATIONS: CustomQuotationRecord[] = [
  {
    id: 'quote_rec_001',
    title: '万科翡翠公园 - 卧室智能选配快速报价',
    customerName: '卫科帆',
    customerPhone: '17696180841',
    communityName: '万科翡翠公园',
    createdAt: '2026-08-20 10:15',
    updatedAt: '2026-08-20 10:15',
    totalAmount: 369,
    totalDeviceCount: 1,
    status: '已生成报价',
    rooms: [
      {
        id: 'room_sec_bed_1',
        roomName: '卧室',
        roomCategory: 'bedroom',
        subgroups: ['小米必备'],
        extraFees: [],
        items: [
          {
            id: 'item_quote_1',
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
    ],
  },
];

// ---------------------------------------------------------------------------
// Initial Floor CAD Point Designs (Seed from Screenshot 2)
// ---------------------------------------------------------------------------
export const INITIAL_FLOOR_DESIGNS: FloorPlanDesignProject[] = [
  {
    id: 'cad_proj_001',
    title: '麦哲伦平台 · 翡翠公园3号楼方案设计',
    associatedPlanId: 'plan_rec_001',
    communityName: '万科翡翠公园',
    updatedAt: '2026-08-20 10:30',
    activeLayerId: 'layer_1f',
    layers: [
      {
        id: 'layer_1f',
        name: '测试 (点位图+灯光图)',
        blueprintUrl: '', // Will use default SVG or custom blueprint
        pins: [
          {
            id: 'pin_cad_1',
            productId: 'prod_mi_central_gateway',
            model: '智能中枢网关',
            brand: '小米',
            category: '智能网关/中控',
            roomName: '弱电箱 / 机房',
            unitPrice: 349,
            xPercentage: 42,
            yPercentage: 48,
            circuitNumber: 'GW-01',
            color: '#2563eb',
            isPlaced: true,
          },
          {
            id: 'pin_cad_2',
            productId: 'prod_mi_speaker_pro',
            model: 'Xiaomi 智能音箱 Pro',
            brand: '小米',
            category: '背景音乐/影音',
            roomName: '客厅',
            unitPrice: 369,
            xPercentage: 35,
            yPercentage: 25,
            circuitNumber: 'SP-01',
            color: '#9333ea',
            isPlaced: true,
          },
          {
            id: 'pin_cad_3',
            productId: 'prod_mi_switch_pro',
            model: '小米智能开关Pro',
            brand: '小米',
            category: '智能面板/开关',
            roomName: '主卧',
            unitPrice: 129,
            xPercentage: 22,
            yPercentage: 65,
            circuitNumber: 'SW-01',
            color: '#059669',
            isPlaced: true,
          },
          {
            id: 'pin_cad_4',
            productId: 'prod_mi_presence_sensor',
            model: '小米人体传感器',
            brand: '小米',
            category: '传感器/雷达',
            roomName: '男卫',
            unitPrice: 149,
            xPercentage: 68,
            yPercentage: 55,
            circuitNumber: 'SN-01',
            color: '#ea580c',
            isPlaced: true,
          },
        ],
      },
    ],
  },
];

