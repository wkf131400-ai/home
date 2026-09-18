import { PlanChatMessage, SavedPlanRecord } from '../types';

export const SAMPLE_CHAT_HISTORIES: Record<string, PlanChatMessage[]> = {
  plan_rec_001: [
    {
      id: 'chat_001_1',
      role: 'user',
      senderName: '卫科帆 (业主)',
      content: '你好！我家是万科翡翠公园6号楼1201，建面约130㎡三室两厅。预算在6到8万之间，主要想做客厅和主卧的磁吸轨道深调光，还有全屋电动窗帘和空调新风集成。',
      timestamp: '2026-08-19 14:02',
    },
    {
      id: 'chat_001_2',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '卫先生您好！为您规划了万科翡翠公园三室两厅专属智享全屋方案：\n1. 客厅及餐厅采用磁吸极速无级调光系统，支持从温馨2700K至明亮5000K无级色温调节；\n2. 主卧配置双层静音开合帘与起夜微光模式；\n3. 双卫生间部署微波人体微动感应雷达，实现人来灯亮、洗澡静坐不误熄；\n4. 空调、地暖、新风三合一集成触控面板 MixPad 统一控制。\n当前包含 7 个空间、38 件高品质智能硬件，总预算约 6.8 万元，完美落在您的预期区间。',
      timestamp: '2026-08-19 14:03',
      schemeSummary: {
        totalCostTenThousand: 6.8,
        deviceCount: 38,
        highlights: ['磁吸轨道深调光', '全屋双层静音窗帘', '空调地暖新风一体屏', '人体存在毫米波雷达'],
      },
    },
    {
      id: 'chat_001_3',
      role: 'user',
      senderName: '卫科帆 (业主)',
      content: '这套磁吸轨道调光是否支持米家/小爱同学全屋语音控制？客厅想加一套一键观影联动模式，可以实现吗？',
      timestamp: '2026-08-19 14:08',
    },
    {
      id: 'chat_001_4',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '完全支持！方案中已为您标配智能中枢网关与 Xiaomi 智能音箱 Pro，支持小爱同学全屋语音与连续免唤醒对话。客厅一键观影场景已为您联动配置：对音箱说「小爱同学，我要看电影」，客厅主灯无级渐暗至10%、双层电动窗帘平滑闭合、背景氛围灯带自动亮起、电视插座供电启动。',
      timestamp: '2026-08-19 14:10',
    },
    {
      id: 'chat_001_5',
      role: 'user',
      senderName: '卫科帆 (业主)',
      content: '太周全了，方案很满意！我已经保存方案并提交采购需求了，什么时候能发货和安排师傅上门？',
      timestamp: '2026-08-19 15:25',
    },
    {
      id: 'chat_001_6',
      role: 'salesperson',
      senderName: '王浩 (专属商务经理)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: '卫先生您好！我是您的专属商务经理王浩 (186-0010-8899)。已收到您确认的 38 件智能硬件采购清单与图纸核算。我们已安排北京顺义总仓加急发货，顺丰单号 SF138982847294，预计明日派送。送达后我将带认证智能工程师上门验货并指导布线联调！',
      timestamp: '2026-08-19 15:35',
    },
    {
      id: 'chat_001_7',
      role: 'user',
      senderName: '卫科帆 (业主)',
      content: '好的收到王经理，设备顺丰到了我联系你。',
      timestamp: '2026-08-19 15:40',
    },
    {
      id: 'chat_001_8',
      role: 'system',
      senderName: '系统物流通知',
      content: '📦 顺丰速运快递【SF138982847294】已完成顺义总仓分拣装车，正在极速派送中，预计今日 16:00 送达指定地址。',
      timestamp: '2026-08-20 09:40',
    },
  ],

  plan_rec_002: [
    {
      id: 'chat_002_1',
      role: 'user',
      senderName: '李明 (业主)',
      content: '你好，我是保利天汇2号楼的李明，两室一厅80平米精装交付。不想大动墙体和打槽布线，预算3到4万以内，想要无线Mesh智能系统，主要解决入户自动灯光和主卧智能窗帘。',
      timestamp: '2026-08-17 10:45',
    },
    {
      id: 'chat_002_2',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '李先生您好！针对保利天汇高坪效两居，为您规划无线 Mesh 3.0 轻奢高性价比方案：\n1. 免破坏墙体布线，直接替换原位 86 底盒为零火智能触控面板；\n2. 玄关配备智能人体传感器与智能门锁联动，开门自动亮灯、离家一键全关；\n3. 主卧配备超静音单轨电动窗帘与定时日出唤醒；\n全套共 4 个空间、20 件硬件，总预算 3.2 万元。',
      timestamp: '2026-08-17 10:47',
      schemeSummary: {
        totalCostTenThousand: 3.2,
        deviceCount: 20,
        highlights: ['无线 Mesh 3.0 免布线', '入户感应联动', '主卧静音窗帘', '极简触控面板'],
      },
    },
    {
      id: 'chat_002_3',
      role: 'user',
      senderName: '李明 (业主)',
      content: '次卧平时父母偶尔来住，开关使用习惯上会不会不适应？',
      timestamp: '2026-08-17 10:52',
    },
    {
      id: 'chat_002_4',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '请放心！面板支持传统物理微动按键触感，老人不借助手机也能像传统开关一样随手按压；床头还增配了一颗磁吸无线情景开关，随手一按就能一键关灯，非常适合长辈使用。',
      timestamp: '2026-08-17 10:55',
    },
    {
      id: 'chat_002_5',
      role: 'salesperson',
      senderName: '李经理 (专属方案顾问)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      content: '李先生您好，我是方案顾问李经理 (185-1122-3344)。我们正在为您核算 20 件设备的原厂直供企业折扣与施工排期，预计今天下午为您出具正式审核单。',
      timestamp: '2026-08-20 09:12',
    },
  ],

  plan_rec_003: [
    {
      id: 'chat_003_1',
      role: 'user',
      senderName: '张总 (业主)',
      content: '我们中海拾光里是下叠带地下室，共三层约320平米。预算在12-15万左右，要求采用KNX工业级有线总线系统保证稳定，地下一层是影音室，室外花园需要智能水系浇灌。',
      timestamp: '2026-08-16 09:30',
    },
    {
      id: 'chat_003_2',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '张总您好！针对拾光里叠拼大宅，为您推荐 KNX 工业级有线总线 + 智能中枢系统：\n1. 楼层分区集中弱电箱总线架构，超强抗干扰，千兆光纤回传；\n2. 负一层影音室专属配置影院中控主机，一键联动星空顶、低音炮电源与幕布升降；\n3. 花园配置智能微喷控制器与土壤湿度传感器，自动判断天气节水浇灌；\n4. 当前配置 8 空间 56 件专业设备，总预算约 12.5 万元。',
      timestamp: '2026-08-16 09:35',
      schemeSummary: {
        totalCostTenThousand: 12.5,
        deviceCount: 56,
        highlights: ['KNX 工业级总线', '全景深度调光', '智能花园微喷灌溉', '负一层专业影音中控'],
      },
    },
    {
      id: 'chat_003_3',
      role: 'user',
      senderName: '张总 (业主)',
      content: '地下室潮气比较大，传感器和面板防潮性能如何？',
      timestamp: '2026-08-16 09:42',
    },
    {
      id: 'chat_003_4',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '负一层所有面板均选用 IP54 等级防潮微动面板，雷达选用防凝露吸顶式微波传感器，同时联动新风除湿系统，当空气湿度超过 65% 时自动启动强效除湿。',
      timestamp: '2026-08-16 09:45',
    },
    {
      id: 'chat_003_5',
      role: 'salesperson',
      senderName: '王浩 (专属商务经理)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: '张总您好！下周四下午我们安排技术总监陈工与您现场复测地下室强弱电走向与花园水管点位，届时携带 KNX 总线实物面板供您试色选款。',
      timestamp: '2026-08-16 17:30',
    },
  ],

  plan_rec_004: [
    {
      id: 'chat_004_1',
      role: 'user',
      senderName: '陈女士 (业主)',
      content: '西山壹号院220平四室两厅大平层，预算8万左右。注重品质感与静音，门锁必须是3D结构光人脸识别款，全屋灯光必须完全无频闪深调光。',
      timestamp: '2026-08-10 11:00',
    },
    {
      id: 'chat_004_2',
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: '陈女士您好，西山壹号院大宅方案已设计完毕：\n1. 采用 DALI-2 协议高显指超深调光芯片，调光深度达 0.1%，RG0 豁免级无蓝光无频闪；\n2. 入户门配备德施曼 3D 结构光人脸猫眼全自动门锁；\n3. 全屋窗帘电机采用超静音直流无刷导轨；\n全套 6 空间 42 件高端设备，总预算 8.5 万元。',
      timestamp: '2026-08-10 11:05',
      schemeSummary: {
        totalCostTenThousand: 8.5,
        deviceCount: 42,
        highlights: ['DALI-2 超深调光', '3D 人脸全自动门锁', '直流静音窗帘', '全宅背景音乐'],
      },
    },
    {
      id: 'chat_004_3',
      role: 'user',
      senderName: '陈女士 (业主)',
      content: '方案很周到，已全额付款，请尽快安排顺丰直发和安装师傅。',
      timestamp: '2026-08-10 11:28',
    },
    {
      id: 'chat_004_4',
      role: 'salesperson',
      senderName: '王浩 (专属商务经理)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: '陈女士，全部 42 件原厂包装设备已于今日上午顺丰派送到府，高级认证调试工程师已于 14:00 上门完成场景验收，灯光及人脸锁联动调试通过，质保卡已在线激活！',
      timestamp: '2026-08-15 15:30',
    },
    {
      id: 'chat_004_5',
      role: 'user',
      senderName: '陈女士 (业主)',
      content: '师傅很专业，灯光调光效果非常高级，家里人都很满意！',
      timestamp: '2026-08-15 15:45',
    },
  ],
};

export function generateDefaultChatHistory(plan: Partial<SavedPlanRecord>): PlanChatMessage[] {
  const customerName = plan.customerName || '客户';
  const community = plan.communityName || '智家全屋定制';
  const cost = plan.totalCostTenThousand || 5.0;
  const roomsCount = plan.roomsCount || 4;
  const deviceCount = plan.deviceCount || 20;

  return [
    {
      id: `gen_chat_1_${Date.now()}`,
      role: 'user',
      senderName: `${customerName} (业主)`,
      content: `你好，我想给【${community}】这套房子做一套全屋智能方案，包含约 ${roomsCount} 个空间，预算想控制在 ${cost} 万元左右，需要包含核心灯控、电动窗帘和传感器联动。`,
      timestamp: plan.createdAt || '2026-08-18 10:00',
    },
    {
      id: `gen_chat_2_${Date.now()}`,
      role: 'assistant',
      senderName: 'AI 智家方案架构师',
      content: `您好！已为您根据【${community}】的户型特点智能规划定制方案：\n1. 覆盖全屋 ${roomsCount} 个核心空间，配置多路调光与情景联动触控面板；\n2. 主动感应与起夜微光照明，全屋门窗安防联动；\n3. 规划共 ${deviceCount} 件高集成智能设备，总核算造价为 ${cost} 万元，贴合您的预算标准。`,
      timestamp: plan.createdAt || '2026-08-18 10:02',
      schemeSummary: {
        totalCostTenThousand: cost,
        deviceCount: deviceCount,
        highlights: ['全宅智能调光', '主动微光感应', '安防门锁联动', '原厂正品直供'],
      },
    },
    {
      id: `gen_chat_3_${Date.now()}`,
      role: 'user',
      senderName: `${customerName} (业主)`,
      content: plan.customerNotes
        ? `需求备忘：${plan.customerNotes}`
        : '方案整体看起来很合理，请帮我保存清单，并安排商务经理跟进图纸复核与配送排期。',
      timestamp: plan.updatedAt || '2026-08-18 10:15',
    },
    {
      id: `gen_chat_4_${Date.now()}`,
      role: 'salesperson',
      senderName: '王浩 (专属商务经理)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: `您好，我是您的专属商务经理王浩 (186-0010-8899)。您的方案【${plan.title || community}】已进入系统，我们将为您提供从图纸审核、设备原厂顺丰直发到工程师上门联调的一站式交付服务。`,
      timestamp: plan.updatedAt || '2026-08-18 11:00',
    },
  ];
}
