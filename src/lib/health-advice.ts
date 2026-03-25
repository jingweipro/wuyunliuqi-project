/**
 * 个人健康建议系统
 * 基于出生年份五运六气、当年运气、出生地域
 * 生成深度个性化的养生方案
 */

import { getYearInfo, getCurrentQi, LIU_QI_ATTRIBUTES, WU_XING_ATTRIBUTES, type WuXing, type LiuQi } from './wuyun-liuqi';
import { getSiTianZaiQuanByYear, SI_TIAN_FANG, type Prescription } from './sanyinsitian-fang';
import {
  CONSTITUTION_DATA,
  QI_PERIOD_DETAILS,
  INTERACTION_MATRIX,
  YEAR_DRUG_FOOD,
  getRegionModifier,
  type ConstitutionDetail,
  type QiPeriodDetail,
  type InteractionAdvice,
  type YearDrugFood,
  type RegionModifier
} from './health-advice-data';

// ============================================================
// 导出的类型定义
// ============================================================

export interface EnhancedQiAdvice {
  qiIndex: number;
  qiName: string;
  dateRange: string;
  zhuQi: string;
  keQi: string;
  isCurrent: boolean;          // 是否是当前所在的气
  keZhuRelation: string;
  detail: QiPeriodDetail;      // 详细建议（按客气）
  personalWarnings: string[];  // 个人体质特别提醒
  prescription: Prescription | null;
}

export interface EnhancedHealthAdvice {
  year: number;
  yearGanZhi: string;
  daYun: string;
  taiGuoBuJi: string;
  siTian: string;
  zaiQuan: string;

  // 先天体质
  constitution: ConstitutionDetail;
  birthYearGanZhi: string;

  // 年度总览
  yearDrugFood: YearDrugFood;
  interaction: InteractionAdvice;
  overallAdvice: string;

  // 六气时段
  currentQiIndex: number;
  qiAdvices: EnhancedQiAdvice[];

  // 方药
  keyPrescriptions: Prescription[];

  // 地域
  regionModifier: RegionModifier | null;
}

// ============================================================
// 核心生成函数
// ============================================================

/**
 * 获取先天体质详情
 */
export function getConstitution(birthYear: number): ConstitutionDetail {
  const info = getYearInfo(birthYear);
  const key = `${info.wuXing}_${info.taiGuoBuJi}`;
  return CONSTITUTION_DATA[key] || CONSTITUTION_DATA['木_太过'];
}

/**
 * 生成完整的增强版健康建议
 */
export function generateEnhancedHealthAdvice(
  selectedYear: number,
  birthYear: number,
  province?: string
): EnhancedHealthAdvice {
  const yearInfo = getYearInfo(selectedYear);
  const birthYearInfo = getYearInfo(birthYear);
  const constitution = getConstitution(birthYear);
  const currentQiIndex = getCurrentQi();

  // 年度药食宜忌
  const yearDrugFood = YEAR_DRUG_FOOD[yearInfo.siTian] || YEAR_DRUG_FOOD['少阴君火'];

  // 岁运与体质交互
  const birthWuXing = birthYearInfo.wuXing;
  const yearWuXing = yearInfo.wuXing;
  const interaction = INTERACTION_MATRIX[birthWuXing]?.[yearWuXing] || {
    relation: '中性',
    riskLevel: '低' as const,
    description: '今年运气与您的先天体质关系中性，保持正常养生节律。',
    keyRisks: [],
    protectionStrategy: ['顺应四时，保持正常养生']
  };

  // 总体建议
  const overallAdvice = buildOverallAdvice(yearInfo, birthYearInfo, constitution, interaction);

  // 六气详解
  const qiAdvices = buildQiAdvices(yearInfo, constitution, currentQiIndex);

  // 方药
  const siTianFang = getSiTianZaiQuanByYear(yearInfo.zhi);
  const keyPrescriptions = siTianFang?.prescriptions || [];

  // 地域
  const regionModifier = province ? getRegionModifier(province) : null;

  return {
    year: selectedYear,
    yearGanZhi: yearInfo.ganZhi,
    daYun: yearInfo.daYun,
    taiGuoBuJi: yearInfo.taiGuoBuJi,
    siTian: yearInfo.siTian,
    zaiQuan: yearInfo.zaiQuan,
    constitution,
    birthYearGanZhi: birthYearInfo.ganZhi,
    yearDrugFood,
    interaction,
    overallAdvice,
    currentQiIndex,
    qiAdvices,
    keyPrescriptions,
    regionModifier,
  };
}

// ============================================================
// 内部辅助函数
// ============================================================

function buildOverallAdvice(
  yearInfo: ReturnType<typeof getYearInfo>,
  birthYearInfo: ReturnType<typeof getYearInfo>,
  constitution: ConstitutionDetail,
  interaction: InteractionAdvice
): string {
  const parts: string[] = [];

  parts.push(`${yearInfo.ganZhi}年，岁运为${yearInfo.daYun}${yearInfo.taiGuoBuJi}，${yearInfo.siTian}司天，${yearInfo.zaiQuan}在泉。`);

  // 岁运影响
  const yunXing = yearInfo.wuXing;
  const organ = WU_XING_ATTRIBUTES[yunXing]?.organ || '';
  if (yearInfo.taiGuoBuJi === '太过') {
    parts.push(`${yunXing}运太过之年，${yunXing}气偏盛，${organ}功能偏亢，需适当制约${yunXing}气。`);
  } else {
    parts.push(`${yunXing}运不及之年，${yunXing}气偏弱，${organ}功能偏弱，需扶助${yunXing}气。`);
  }

  // 体质交互
  parts.push(interaction.description);

  if (interaction.riskLevel === '高') {
    parts.push(`本年对您的${constitution.name}而言需特别注意防护，建议提前做好养生准备。`);
  }

  return parts.join('');
}

function buildQiAdvices(
  yearInfo: ReturnType<typeof getYearInfo>,
  constitution: ConstitutionDetail,
  currentQiIndex: number
): EnhancedQiAdvice[] {
  const qiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];
  const dateRanges = [
    '大寒至春分（约1月20日 - 3月20日）',
    '春分至小满（约3月21日 - 5月20日）',
    '小满至大暑（约5月21日 - 7月22日）',
    '大暑至秋分（约7月23日 - 9月22日）',
    '秋分至小雪（约9月23日 - 11月21日）',
    '小雪至大寒（约11月22日 - 次年1月19日）'
  ];

  const WU_XING_SHENG: Record<string, string> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  };
  const WU_XING_KE: Record<string, string> = {
    '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
  };

  return qiNames.map((name, i) => {
    const keQi = yearInfo.keQi[i] as LiuQi;
    const zhuQi = yearInfo.zhuQi[i] as LiuQi;
    const keElement = LIU_QI_ATTRIBUTES[keQi]?.element || '木';
    const zhuElement = LIU_QI_ATTRIBUTES[zhuQi]?.element || '木';

    // 客主关系
    let keZhuRelation = '';
    if (keElement === zhuElement) {
      keZhuRelation = '相得 - 主客同气，气候偏盛';
    } else if (WU_XING_SHENG[keElement] === zhuElement) {
      keZhuRelation = '顺 - 客生主，气候和平';
    } else if (WU_XING_KE[keElement] === zhuElement) {
      keZhuRelation = '逆 - 客克主，当防胜复';
    } else if (WU_XING_SHENG[zhuElement] === keElement) {
      keZhuRelation = '泄 - 主生客，正气外泄';
    } else {
      keZhuRelation = '胜 - 主克客，秩序有常';
    }

    // 获取客气对应的详细建议
    const detail = QI_PERIOD_DETAILS[keQi] || QI_PERIOD_DETAILS['厥阴风木'];

    // 个人体质特别提醒
    const personalWarnings: string[] = [];
    const constitutionWuXing = constitution.wuXing;

    if (WU_XING_KE[keElement] === constitutionWuXing) {
      personalWarnings.push(
        `注意：您的${constitutionWuXing}型体质易受此时${LIU_QI_ATTRIBUTES[keQi]?.nature || ''}邪克伐，是您的高危时段。需重点加强${constitution.nurturePrinciple}。`
      );
    }
    if (keElement === constitutionWuXing) {
      personalWarnings.push(
        `提示：此时客气五行与您先天体质同属${constitutionWuXing}，${constitutionWuXing}气叠加偏盛，既是调养机会也需防过盛。`
      );
    }
    if (WU_XING_SHENG[keElement] === constitutionWuXing) {
      personalWarnings.push(
        `有利：此时客气生助您的${constitutionWuXing}型体质，是进补调养的好时段。`
      );
    }

    // 高危体质 + 极端气候
    if (constitution.taiGuoBuJi === '不及' && WU_XING_KE[keElement] === constitutionWuXing) {
      personalWarnings.push(
        `高危警示：您先天${constitutionWuXing}气不足，此时又逢克伐之气，建议减少外出、充分休息，必要时咨询中医师。`
      );
    }

    // 方药
    const siTianFang = SI_TIAN_FANG[keQi];
    const prescription = siTianFang?.prescriptions[0] || null;

    return {
      qiIndex: i,
      qiName: name,
      dateRange: dateRanges[i],
      zhuQi: zhuQi,
      keQi: keQi,
      isCurrent: i === currentQiIndex,
      keZhuRelation,
      detail,
      personalWarnings,
      prescription,
    };
  });
}
