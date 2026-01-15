// 个人健康建议系统
// 基于出生年份与当年运气的关系，提供个性化养生建议

import { getYearInfo, YearInfo, WU_XING_ATTRIBUTES, LIU_QI_ATTRIBUTES } from './wuyun-liuqi';
import { getSiTianZaiQuanByYear, SI_TIAN_FANG, Prescription } from './sanyinsitian-fang';

// 五行生克关系
const WU_XING_SHENG: Record<string, string> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
};

const WU_XING_KE: Record<string, string> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
};

const WU_XING_BEI_KE: Record<string, string> = {
  '木': '金', '火': '水', '土': '木', '金': '火', '水': '土'
};

// 体质类型
export interface ConstitutionType {
  name: string;
  wuXing: string;
  features: string[];
  strengths: string[];
  weaknesses: string[];
  nurture: string[];
}

// 根据出生年运气判断先天体质倾向
export function getBirthConstitution(birthYearInfo: YearInfo): ConstitutionType {
  const wuXing = birthYearInfo.wuXing;
  const taiGuoBuJi = birthYearInfo.taiGuoBuJi;
  
  const constitutions: Record<string, ConstitutionType> = {
    '木': {
      name: '木型体质',
      wuXing: '木',
      features: ['肝胆功能较强', '性格爽朗疏达', '筋骨灵活', '目光有神'],
      strengths: ['应变能力强', '创新思维活跃', '肝气充沛'],
      weaknesses: ['易肝气郁结', '情绪波动大', '易抽筋痉挛'],
      nurture: ['宜疏肝解郁', '忌暴怒伤肝', '宜食酸甘之品', '宜适度运动']
    },
    '火': {
      name: '火型体质',
      wuXing: '火',
      features: ['心脏功能较强', '性格热情开朗', '面色红润', '精力充沛'],
      strengths: ['思维敏捷', '热情洋溢', '心阳充足'],
      weaknesses: ['易心火亢盛', '易失眠多梦', '易口舌生疮'],
      nurture: ['宜清心降火', '忌过度兴奋', '宜食苦寒之品', '宜静心养神']
    },
    '土': {
      name: '土型体质',
      wuXing: '土',
      features: ['脾胃功能较强', '性格稳重厚道', '肌肉丰满', '消化力强'],
      strengths: ['包容性强', '踏实可靠', '脾气健运'],
      weaknesses: ['易脾虚生湿', '易腹胀便溏', '易思虑过度'],
      nurture: ['宜健脾化湿', '忌暴饮暴食', '宜食甘淡之品', '宜规律作息']
    },
    '金': {
      name: '金型体质',
      wuXing: '金',
      features: ['肺脏功能较强', '性格果断坚毅', '皮肤白皙', '呼吸深长'],
      strengths: ['意志坚定', '条理清晰', '肺气充盈'],
      weaknesses: ['易肺燥伤津', '易悲伤忧郁', '易皮肤干燥'],
      nurture: ['宜润肺生津', '忌悲忧伤肺', '宜食辛润之品', '宜保持乐观']
    },
    '水': {
      name: '水型体质',
      wuXing: '水',
      features: ['肾脏功能较强', '性格沉静内敛', '骨骼坚实', '耐力持久'],
      strengths: ['智慧深沉', '意志坚韧', '肾精充足'],
      weaknesses: ['易肾阳不足', '易腰膝酸软', '易恐惧不安'],
      nurture: ['宜补肾益精', '忌房劳过度', '宜食咸温之品', '宜节制欲望']
    }
  };
  
  const constitution = constitutions[wuXing];
  
  // 根据太过不及调整
  if (taiGuoBuJi === '太过') {
    constitution.features.push(`${wuXing}气偏盛，需适当制约`);
    constitution.weaknesses.push(`易${wuXing}气太过克伐他脏`);
  } else {
    constitution.features.push(`${wuXing}气偏弱，需适当扶助`);
    constitution.weaknesses.push(`易${wuXing}气不足而被克伐`);
  }
  
  return constitution;
}

// 单个时段的健康建议
export interface QiHealthAdvice {
  qiIndex: number;
  qiName: string;
  dateRange: string;
  zhuQi: string;
  keQi: string;
  keZhuRelation: string;
  climateFeature: string;
  healthRisk: string[];
  preventionAdvice: string[];
  dietAdvice: string[];
  acupointAdvice: string[];
  prescription: Prescription | null;
}

// 年度健康建议
export interface YearHealthAdvice {
  year: number;
  yearInfo: YearInfo;
  birthYearInfo: YearInfo;
  constitution: ConstitutionType;
  overallAdvice: string;
  seasonalAdvice: {
    spring: string;
    summer: string;
    longSummer: string;
    autumn: string;
    winter: string;
  };
  qiAdvices: QiHealthAdvice[];
  keyPrescriptions: Prescription[];
  dietSummary: string[];
  lifestyleSummary: string[];
}

// 生成六气时段的健康建议
function generateQiHealthAdvice(
  yearInfo: YearInfo,
  birthYearInfo: YearInfo,
  constitution: ConstitutionType
): QiHealthAdvice[] {
  const advices: QiHealthAdvice[] = [];
  const qiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];
  const dateRanges = [
    '大寒至春分（约1月20日-3月20日）',
    '春分至小满（约3月21日-5月20日）',
    '小满至大暑（约5月21日-7月22日）',
    '大暑至秋分（约7月23日-9月22日）',
    '秋分至小雪（约9月23日-11月21日）',
    '小雪至大寒（约11月22日-1月19日）'
  ];
  
  for (let i = 0; i < 6; i++) {
    const keQiInfo = yearInfo.keQi[i];
    const zhuQiInfo = yearInfo.zhuQi[i];
    
    // 客主加临关系分析
    let keZhuRelation = '';
    let healthRisk: string[] = [];
    let preventionAdvice: string[] = [];
    let dietAdvice: string[] = [];
    
    const keQiNature = LIU_QI_ATTRIBUTES[keQiInfo.name]?.nature || '';
    const zhuQiNature = LIU_QI_ATTRIBUTES[zhuQiInfo.name]?.nature || '';
    
    // 分析客主关系
    if (keQiInfo.name === zhuQiInfo.name) {
      keZhuRelation = '同气相求，气候正常';
      healthRisk = ['气候平和，无特殊风险'];
      preventionAdvice = ['顺应时令，正常养生即可'];
    } else {
      // 判断相生相克
      const keWuXing = LIU_QI_ATTRIBUTES[keQiInfo.name]?.wuXing || '';
      const zhuWuXing = LIU_QI_ATTRIBUTES[zhuQiInfo.name]?.wuXing || '';
      
      if (WU_XING_SHENG[keWuXing] === zhuWuXing) {
        keZhuRelation = '客生主，气候偏和';
        healthRisk = [`${keQiNature}气偏盛，可能助长${zhuQiNature}气`];
        preventionAdvice = [`适当制约${keQiNature}气，防止太过`];
      } else if (WU_XING_KE[keWuXing] === zhuWuXing) {
        keZhuRelation = '客克主，气候不和';
        healthRisk = [
          `${keQiNature}气偏盛，克制${zhuQiNature}气`,
          `易患${keQiNature}邪所伤之病`
        ];
        preventionAdvice = [
          `重点防范${keQiNature}邪侵袭`,
          `扶助${zhuQiNature}气以固本`
        ];
      } else {
        keZhuRelation = '客主不和，需审慎调养';
        healthRisk = [`${keQiNature}气与${zhuQiNature}气不协调`];
        preventionAdvice = ['注意阴阳平衡，审慎调养'];
      }
    }
    
    // 结合个人体质给出针对性建议
    const constitutionWuXing = constitution.wuXing;
    const keQiWuXing = LIU_QI_ATTRIBUTES[keQiInfo.name]?.wuXing || '';
    
    if (WU_XING_KE[keQiWuXing] === constitutionWuXing) {
      healthRisk.push(`您的${constitutionWuXing}型体质易受${keQiNature}邪克伐，需特别注意`);
      preventionAdvice.push(`此时段是您的易病时期，建议加强${constitution.nurture[0]}`);
    }
    
    if (WU_XING_SHENG[constitutionWuXing] === keQiWuXing) {
      preventionAdvice.push(`您的体质与此时气候相生，适合进补调养`);
    }
    
    // 饮食建议
    const qiDietMap: Record<string, string[]> = {
      '厥阴风木': ['宜食酸甘缓肝之品', '如大枣、蜂蜜、山药', '忌辛辣发散太过'],
      '少阴君火': ['宜食苦寒清心之品', '如苦瓜、莲子心、绿豆', '忌温燥助火'],
      '太阴湿土': ['宜食淡渗利湿之品', '如薏米、扁豆、茯苓', '忌生冷油腻'],
      '少阳相火': ['宜食清泄之品', '如黄瓜、西瓜、苦瓜', '忌辛辣燥热'],
      '阳明燥金': ['宜食滋润之品', '如梨、银耳、百合', '忌辛燥伤津'],
      '太阳寒水': ['宜食温热之品', '如羊肉、生姜、韭菜', '忌生冷寒凉']
    };
    
    dietAdvice = qiDietMap[keQiInfo.name] || ['顺应时令饮食'];
    
    // 穴位建议
    const qiAcupointMap: Record<string, string[]> = {
      '厥阴风木': ['太冲穴', '行间穴', '期门穴'],
      '少阴君火': ['劳宫穴', '神门穴', '少府穴'],
      '太阴湿土': ['足三里', '阴陵泉', '中脘穴'],
      '少阳相火': ['支沟穴', '外关穴', '阳陵泉'],
      '阳明燥金': ['合谷穴', '曲池穴', '太渊穴'],
      '太阳寒水': ['肾俞穴', '关元穴', '命门穴']
    };
    
    // 获取对应方药
    const siTianFang = SI_TIAN_FANG[keQiInfo.name];
    
    advices.push({
      qiIndex: i,
      qiName: qiNames[i],
      dateRange: dateRanges[i],
      zhuQi: zhuQiInfo.name,
      keQi: keQiInfo.name,
      keZhuRelation,
      climateFeature: `${keQiNature}气主令，${zhuQiNature}气为主`,
      healthRisk,
      preventionAdvice,
      dietAdvice,
      acupointAdvice: qiAcupointMap[keQiInfo.name] || [],
      prescription: siTianFang?.prescriptions[0] || null
    });
  }
  
  return advices;
}

// 生成完整的年度健康建议
export function generateYearHealthAdvice(
  selectedYear: number,
  birthYear: number
): YearHealthAdvice {
  const yearInfo = getYearInfo(selectedYear);
  const birthYearInfo = getYearInfo(birthYear);
  const constitution = getBirthConstitution(birthYearInfo);
  
  // 分析今年运气与先天体质的关系
  let overallAdvice = '';
  const yearWuXing = yearInfo.wuXing;
  const birthWuXing = birthYearInfo.wuXing;
  
  if (yearWuXing === birthWuXing) {
    overallAdvice = `今年${yearInfo.daYun}与您的先天${constitution.name}同气，是调养本脏的好时机。`;
    if (yearInfo.taiGuoBuJi === '太过') {
      overallAdvice += `但${yearWuXing}气太过，需防止过盛，宜适当制约。`;
    } else {
      overallAdvice += `${yearWuXing}气不及，正宜补益${yearWuXing}气，强化本脏功能。`;
    }
  } else if (WU_XING_KE[yearWuXing] === birthWuXing) {
    overallAdvice = `今年${yearInfo.daYun}克制您的先天${constitution.name}，需特别注意防护。${constitution.weaknesses[0]}可能加重，建议${constitution.nurture[0]}。`;
  } else if (WU_XING_SHENG[yearWuXing] === birthWuXing) {
    overallAdvice = `今年${yearInfo.daYun}生助您的先天${constitution.name}，是养生的有利年份。可适当进补，增强${birthWuXing}气。`;
  } else if (WU_XING_BEI_KE[yearWuXing] === birthWuXing) {
    overallAdvice = `您的先天${constitution.name}克制今年${yearInfo.daYun}，体质相对适应。但仍需注意${yearInfo.taiGuoBuJi === '太过' ? '制约太过' : '扶助不足'}。`;
  } else {
    overallAdvice = `今年运气与您的先天体质关系中性，保持正常养生节律即可。`;
  }
  
  // 四季养生建议
  const seasonalAdvice = {
    spring: `春季${yearInfo.siTian}司天，${LIU_QI_ATTRIBUTES[yearInfo.siTian]?.nature || ''}气主令。您的${constitution.name}在此时宜${constitution.nurture[0]}，养肝护目，早睡早起。`,
    summer: `夏季火气当令，${yearInfo.taiGuoBuJi === '太过' ? '运气偏盛' : '运气平和'}。您宜清心养神，${constitution.wuXing === '火' ? '尤需注意制火养阴' : '适当滋养心阳'}。`,
    longSummer: `长夏湿气偏重，脾胃易受困。您的${constitution.name}需注意健脾化湿，饮食清淡，忌生冷油腻。`,
    autumn: `秋季${yearInfo.zaiQuan}在泉，${LIU_QI_ATTRIBUTES[yearInfo.zaiQuan]?.nature || ''}气主令。宜润肺养阴，${constitution.wuXing === '金' ? '正是调养本脏的好时机' : '注意防燥护肺'}。`,
    winter: `冬季寒气当令，宜收藏养肾。您的${constitution.name}在此时应${constitution.wuXing === '水' ? '顺应本气，深藏固密' : '适当温补，助阳御寒'}。`
  };
  
  // 生成六气时段建议
  const qiAdvices = generateQiHealthAdvice(yearInfo, birthYearInfo, constitution);
  
  // 关键方药
  const siTianFang = getSiTianZaiQuanByYear(yearInfo.zhi);
  const keyPrescriptions = siTianFang?.prescriptions || [];
  
  // 饮食总结
  const dietSummary = [
    `根据您的${constitution.name}，${constitution.nurture[2] || '饮食宜均衡'}`,
    `今年${yearInfo.taiGuoBuJi === '太过' ? `宜制约${yearWuXing}气，可多食克${yearWuXing}之品` : `宜扶助${yearWuXing}气，可多食生${yearWuXing}之品`}`,
    `上半年防${LIU_QI_ATTRIBUTES[yearInfo.siTian]?.nature || ''}邪，饮食宜${getOppositeNature(LIU_QI_ATTRIBUTES[yearInfo.siTian]?.nature || '')}`,
    `下半年防${LIU_QI_ATTRIBUTES[yearInfo.zaiQuan]?.nature || ''}邪，饮食宜${getOppositeNature(LIU_QI_ATTRIBUTES[yearInfo.zaiQuan]?.nature || '')}`
  ];
  
  // 生活方式总结
  const lifestyleSummary = [
    constitution.nurture[3] || '规律作息',
    `今年运气${yearInfo.taiGuoBuJi}，${yearInfo.taiGuoBuJi === '太过' ? '宜静养收敛，忌过度操劳' : '宜适度运动，增强体质'}`,
    '顺应四时变化，春夏养阳，秋冬养阴',
    '保持情志舒畅，避免过激情绪'
  ];
  
  return {
    year: selectedYear,
    yearInfo,
    birthYearInfo,
    constitution,
    overallAdvice,
    seasonalAdvice,
    qiAdvices,
    keyPrescriptions,
    dietSummary,
    lifestyleSummary
  };
}

// 获取相反性质的饮食建议
function getOppositeNature(nature: string): string {
  const opposites: Record<string, string> = {
    '风': '酸甘缓肝',
    '热': '苦寒清热',
    '湿': '淡渗利湿',
    '火': '苦寒泻火',
    '燥': '甘润生津',
    '寒': '辛温散寒'
  };
  return opposites[nature] || '平和调养';
}
