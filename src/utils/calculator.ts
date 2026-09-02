import { RoomItem, DeviceSeries, DefaultRoomTemplate, RenovationProject } from '../types';
import { DEFAULT_ROOM_TEMPLATES, DEVICE_SERIES_LIST } from '../data/presetData';

function getStoredRoomTemplates(): Record<RoomItem['category'], DefaultRoomTemplate> {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('zhijia_admin_room_templates_v2');
      if (data) return JSON.parse(data);
    } catch (e) {
      // fallback
    }
  }
  return DEFAULT_ROOM_TEMPLATES;
}

function getStoredDeviceSeriesList(): DeviceSeries[] {
  return DEVICE_SERIES_LIST;
}

export interface RoomCostDetails {
  roomId: string;
  roomName: string;
  isCustom: boolean;
  lightingCost: number;
  curtainCost: number;
  otherCost: number;
  totalCost: number;
  details: string[];
}

export interface ProjectCostSummary {
  totalCostYuan: number;
  totalCostTenThousand: number; // in 万元
  roomBreakdowns: RoomCostDetails[];
  totalLightCircuits: number;
  totalDimmableCircuits: number;
  totalCurtains: number;
  totalOtherDevices: number;
  gatewayHubsNeeded: number;
  budgetStatus: 'under' | 'within' | 'exceeded';
  budgetPercent: number; // percentage of maxBudget
}

export function getSeriesById(seriesId?: string): DeviceSeries {
  const seriesList = getStoredDeviceSeriesList();
  const found = seriesList.find((s) => s.id === seriesId);
  return found || seriesList[0]; // fallback to default standard
}

export function calculateRoomCost(room: RoomItem): RoomCostDetails {
  const details: string[] = [];
  let lightingCost = 0;
  let curtainCost = 0;
  let otherCost = 0;

  const scheme = room.scheme;
  const roomTemplates = getStoredRoomTemplates();

  if (!scheme.isCustom) {
    // Default Scheme
    const tpl: DefaultRoomTemplate = roomTemplates[room.category] || roomTemplates.other;
    const series = getSeriesById(tpl.lighting.preferredSeriesId);
    
    // Calculate with default values
    const lightCircuits = tpl.lighting.circuitsCount || 2;
    const dimmable = Math.min(tpl.lighting.dimmableCount || 0, lightCircuits);
    
    lightingCost = lightCircuits * series.estimatedLightUnitCost + dimmable * series.estimatedDimmerUnitCost;
    details.push(`默认灯光方案: ${lightCircuits}路灯 (${dimmable}路调光), 选系: ${series.name}`);

    if (tpl.enableCurtain && tpl.curtain) {
      const cSeries = getSeriesById(tpl.curtain.preferredSeriesId);
      const isDouble = tpl.curtain.curtainType === 'open_close' && tpl.curtain.curtainLayer === 'double';
      const motorMultiplier = isDouble ? 2 : 1;
      curtainCost = cSeries.estimatedCurtainMotorCost * motorMultiplier;
      details.push(
        `默认窗帘方案: ${tpl.curtain.curtainType === 'open_close' ? '开合帘' : '卷帘'}${
          isDouble ? ' (双层/双电机)' : ' (单层/单电机)'
        }`
      );
    }

    if (tpl.enableOther && tpl.otherRequirements) {
      if (tpl.otherRequirements.smartSensors) {
        otherCost += 180;
        details.push('智能人体感应器');
      }
      if (tpl.otherRequirements.thermostatControl) {
        otherCost += 380;
        details.push('智能温控/空调面板');
      }
      if (tpl.otherRequirements.bgMusic) {
        otherCost += 880;
        details.push('背景音乐控制');
      }
      if (tpl.otherRequirements.smartLock) {
        otherCost += 1280;
        details.push('智能人脸门锁');
      }
      if (tpl.otherRequirements.freshAirPanel) {
        otherCost += 280;
        details.push('新风控制面板');
      }
    }

    return {
      roomId: room.id,
      roomName: room.name,
      isCustom: false,
      lightingCost,
      curtainCost,
      otherCost,
      totalCost: lightingCost + curtainCost + otherCost,
      details,
    };
  }

  // Custom Scheme
  if (scheme.enableLighting && scheme.lighting) {
    const series = getSeriesById(scheme.lighting.preferredSeriesId);
    const circuits = scheme.lighting.circuitsCount || 0;
    const dimmable = Math.min(scheme.lighting.dimmableCount || 0, circuits);

    lightingCost = circuits * series.estimatedLightUnitCost + dimmable * series.estimatedDimmerUnitCost;
    details.push(`自定义灯光: ${circuits}路开关/调光控制 (${dimmable}路调光灯), 使用[${series.name}]`);
  }

  if (scheme.enableCurtain && scheme.curtain) {
    const series = getSeriesById(scheme.curtain.preferredSeriesId);
    const isDouble = scheme.curtain.curtainType === 'open_close' && scheme.curtain.curtainLayer === 'double';
    const motorCount = isDouble ? 2 : 1;

    curtainCost = series.estimatedCurtainMotorCost * motorCount;
    const curtainTypeName = scheme.curtain.curtainType === 'open_close' ? '开合帘' : '卷帘';
    const layerName = scheme.curtain.curtainType === 'open_close' ? (isDouble ? '双层' : '单层') : '标准';
    details.push(`自定义窗帘: ${curtainTypeName} [${layerName}], 电机x${motorCount}, 使用[${series.name}]`);
  }

  if (scheme.enableOther && scheme.otherRequirements) {
    const o = scheme.otherRequirements;
    if (o.smartSensors) {
      otherCost += 180;
      details.push('人感传感器');
    }
    if (o.thermostatControl) {
      otherCost += 380;
      details.push('温控面板');
    }
    if (o.bgMusic) {
      otherCost += 880;
      details.push('背景音乐');
    }
    if (o.smartLock) {
      otherCost += 1280;
      details.push('智能门锁');
    }
    if (o.freshAirPanel) {
      otherCost += 280;
      details.push('新风面板');
    }
    if (o.customNotes && o.customNotes.trim().length > 0) {
      details.push(`特殊需求: ${o.customNotes.trim()}`);
    }
  }

  return {
    roomId: room.id,
    roomName: room.name,
    isCustom: true,
    lightingCost,
    curtainCost,
    otherCost,
    totalCost: lightingCost + curtainCost + otherCost,
    details,
  };
}

export function calculateProjectCost(project: RenovationProject): ProjectCostSummary {
  let totalCostYuan = 0;
  let totalLightCircuits = 0;
  let totalDimmableCircuits = 0;
  let totalCurtains = 0;
  let totalOtherDevices = 0;

  const roomTemplates = getStoredRoomTemplates();

  const roomBreakdowns: RoomCostDetails[] = project.rooms.map((room) => {
    const roomCost = calculateRoomCost(room);
    totalCostYuan += roomCost.totalCost;

    const scheme = room.scheme;
    if (!scheme.isCustom) {
      const tpl = roomTemplates[room.category] || roomTemplates.other;
      totalLightCircuits += tpl.lighting.circuitsCount;
      totalDimmableCircuits += tpl.lighting.dimmableCount;
      if (tpl.enableCurtain) totalCurtains += tpl.curtain.curtainType === 'open_close' && tpl.curtain.curtainLayer === 'double' ? 2 : 1;
    } else {
      if (scheme.enableLighting && scheme.lighting) {
        totalLightCircuits += scheme.lighting.circuitsCount;
        totalDimmableCircuits += scheme.lighting.dimmableCount;
      }
      if (scheme.enableCurtain && scheme.curtain) {
        const isDouble = scheme.curtain.curtainType === 'open_close' && scheme.curtain.curtainLayer === 'double';
        totalCurtains += isDouble ? 2 : 1;
      }
      if (scheme.enableOther && scheme.otherRequirements) {
        if (scheme.otherRequirements.smartSensors) totalOtherDevices++;
        if (scheme.otherRequirements.thermostatControl) totalOtherDevices++;
        if (scheme.otherRequirements.bgMusic) totalOtherDevices++;
        if (scheme.otherRequirements.smartLock) totalOtherDevices++;
        if (scheme.otherRequirements.freshAirPanel) totalOtherDevices++;
      }
    }

    return roomCost;
  });

  // Smart Hub / Gateway addition (1 gateway per 25 sub-devices)
  const totalSubDevices = totalLightCircuits + totalCurtains + totalOtherDevices;
  const gatewayHubsNeeded = Math.max(1, Math.ceil(totalSubDevices / 25));
  const gatewayCost = gatewayHubsNeeded * 480; // 480 RMB per gateway hub
  totalCostYuan += gatewayCost;

  const totalCostTenThousand = Number((totalCostYuan / 10000).toFixed(2));
  const maxB = project.maxBudget || 10;
  const minB = project.minBudget || 0;

  let budgetStatus: 'under' | 'within' | 'exceeded' = 'within';
  if (totalCostTenThousand < minB) {
    budgetStatus = 'under';
  } else if (totalCostTenThousand > maxB) {
    budgetStatus = 'exceeded';
  }

  const budgetPercent = Math.min(100, Math.round((totalCostTenThousand / (maxB || 1)) * 100));

  return {
    totalCostYuan,
    totalCostTenThousand,
    roomBreakdowns,
    totalLightCircuits,
    totalDimmableCircuits,
    totalCurtains,
    totalOtherDevices,
    gatewayHubsNeeded,
    budgetStatus,
    budgetPercent,
  };
}

export function createDefaultRoom(name: string, category: RoomItem['category'] = 'other'): RoomItem {
  const roomTemplates = getStoredRoomTemplates();
  const defaultTpl = roomTemplates[category] || roomTemplates.other || DEFAULT_ROOM_TEMPLATES[category] || DEFAULT_ROOM_TEMPLATES.other;

  return {
    id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    category,
    scheme: {
      isCustom: false, // Default to default scheme
      defaultTemplateId: defaultTpl.id,
      enableLighting: true,
      enableCurtain: category !== 'kitchen' && category !== 'entrance',
      enableOther: true,
      lighting: {
        circuitsCount: defaultTpl.lighting.circuitsCount,
        dimmableCount: defaultTpl.lighting.dimmableCount,
        preferredSeriesId: defaultTpl.lighting.preferredSeriesId || 'series_standard_mesh',
      },
      curtain: {
        curtainType: defaultTpl.curtain.curtainType,
        curtainLayer: defaultTpl.curtain.curtainLayer || 'single',
        preferredSeriesId: defaultTpl.curtain.preferredSeriesId || 'series_standard_mesh',
      },
      otherRequirements: {
        smartSensors: defaultTpl.otherRequirements.smartSensors,
        thermostatControl: defaultTpl.otherRequirements.thermostatControl,
        bgMusic: defaultTpl.otherRequirements.bgMusic,
        smartLock: defaultTpl.otherRequirements.smartLock,
        freshAirPanel: defaultTpl.otherRequirements.freshAirPanel,
        customNotes: defaultTpl.otherRequirements.customNotes || '',
      },
    },
  };
}


export function getCategoryFromName(roomName: string): RoomItem['category'] {
  if (roomName.includes('卧')) return 'bedroom';
  if (roomName.includes('厅') && !roomName.includes('餐')) return 'living';
  if (roomName.includes('餐')) return 'dining';
  if (roomName.includes('厨')) return 'kitchen';
  if (roomName.includes('卫') || roomName.includes('洗手')) return 'bathroom';
  if (roomName.includes('书')) return 'study';
  if (roomName.includes('阳台')) return 'balcony';
  if (roomName.includes('玄关') || roomName.includes('入户')) return 'entrance';
  return 'other';
}
