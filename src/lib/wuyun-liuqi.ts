/**
 * 五运六气计算核心库
 * 基于顾植山五运六气理论
 */

// 天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

// 地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

// 五行
export const WU_XING = ['木', '火', '土', '金', '水'] as const;
export type WuXing = typeof WU_XING[number];

// 六气
export const LIU_QI = ['厥阴风木', '少阴君火', '少阳相火', '太阴湿土', '阳明燥金', '太阳寒水'] as const;
export type LiuQi = typeof LIU_QI[number];

// 六气简称
export const LIU_QI_SHORT = ['风', '热', '暑', '湿', '燥', '寒'] as const;

// 五运
export const WU_YUN = ['土运', '金运', '水运', '木运', '火运'] as const;

// 天干配五运 (甲己-土, 乙庚-金, 丙辛-水, 丁壬-木, 戊癸-火)
export const TIAN_GAN_WU_YUN: Record<string, { yun: string; xing: WuXing }> = {
  '甲': { yun: '土运', xing: '土' },
  '己': { yun: '土运', xing: '土' },
  '乙': { yun: '金运', xing: '金' },
  '庚': { yun: '金运', xing: '金' },
  '丙': { yun: '水运', xing: '水' },
  '辛': { yun: '水运', xing: '水' },
  '丁': { yun: '木运', xing: '木' },
  '壬': { yun: '木运', xing: '木' },
  '戊': { yun: '火运', xing: '火' },
  '癸': { yun: '火运', xing: '火' },
};

// 地支配六气 (司天之气)
export const DI_ZHI_SI_TIAN: Record<string, LiuQi> = {
  '子': '少阴君火',
  '午': '少阴君火',
  '丑': '太阴湿土',
  '未': '太阴湿土',
  '寅': '少阳相火',
  '申': '少阳相火',
  '卯': '阳明燥金',
  '酉': '阳明燥金',
  '辰': '太阳寒水',
  '戌': '太阳寒水',
  '巳': '厥阴风木',
  '亥': '厥阴风木',
};

// 六气相对 (司天与在泉的对应关系)
export const LIU_QI_OPPOSITE: Record<LiuQi, LiuQi> = {
  '厥阴风木': '少阳相火',
  '少阴君火': '阳明燥金',
  '少阳相火': '厥阴风木',
  '太阴湿土': '太阳寒水',
  '阳明燥金': '少阴君火',
  '太阳寒水': '太阴湿土',
};

// 六气顺序 (用于计算主气、客气)
export const LIU_QI_ORDER: LiuQi[] = [
  '厥阴风木',
  '少阴君火',
  '少阳相火',
  '太阴湿土',
  '阳明燥金',
  '太阳寒水',
];

// 五行属性映射
export const WU_XING_ATTRIBUTES: Record<WuXing, {
  color: string;
  colorClass: string;
  direction: string;
  season: string;
  organ: string;
  emotion: string;
}> = {
  '木': { color: '#1A8A5C', colorClass: 'element-wood', direction: '东', season: '春', organ: '肝/胆', emotion: '怒' },
  '火': { color: '#D4301F', colorClass: 'element-fire', direction: '南', season: '夏', organ: '心/小肠', emotion: '喜' },
  '土': { color: '#C88A2E', colorClass: 'element-earth', direction: '中', season: '长夏', organ: '脾/胃', emotion: '思' },
  '金': { color: '#CDD1D6', colorClass: 'element-metal', direction: '西', season: '秋', organ: '肺/大肠', emotion: '悲' },
  '水': { color: '#1E3A52', colorClass: 'element-water', direction: '北', season: '冬', organ: '肾/膀胱', emotion: '恐' },
};

// 六气属性映射
export const LIU_QI_ATTRIBUTES: Record<LiuQi, {
  element: WuXing;
  nature: string;
  period: string;
}> = {
  '厥阴风木': { element: '木', nature: '风', period: '初之气(大寒-春分)' },
  '少阴君火': { element: '火', nature: '热', period: '二之气(春分-小满)' },
  '少阳相火': { element: '火', nature: '暑', period: '三之气(小满-大暑)' },
  '太阴湿土': { element: '土', nature: '湿', period: '四之气(大暑-秋分)' },
  '阳明燥金': { element: '金', nature: '燥', period: '五之气(秋分-小雪)' },
  '太阳寒水': { element: '水', nature: '寒', period: '终之气(小雪-大寒)' },
};

/**
 * 根据年份计算天干地支
 */
export function getGanZhi(year: number): { gan: string; zhi: string; ganZhi: string } {
  // 以公元4年(甲子年)为基准
  const offset = (year - 4) % 60;
  const ganIndex = offset % 10;
  const zhiIndex = offset % 12;
  
  const gan = TIAN_GAN[ganIndex >= 0 ? ganIndex : ganIndex + 10];
  const zhi = DI_ZHI[zhiIndex >= 0 ? zhiIndex : zhiIndex + 12];
  
  return {
    gan,
    zhi,
    ganZhi: `${gan}${zhi}`,
  };
}

/**
 * 判断年份是太过还是不及
 */
export function getTaiGuoBuJi(gan: string): '太过' | '不及' {
  const taiGuoGan = ['甲', '丙', '戊', '庚', '壬']; // 阳干太过
  return taiGuoGan.includes(gan) ? '太过' : '不及';
}

/**
 * 计算年份的五运
 */
export function getWuYun(year: number) {
  const { gan } = getGanZhi(year);
  const yunInfo = TIAN_GAN_WU_YUN[gan];
  const taiGuoBuJi = getTaiGuoBuJi(gan);
  
  return {
    daYun: yunInfo.yun, // 大运(中运)
    wuXing: yunInfo.xing,
    taiGuoBuJi,
    description: `${gan}年${yunInfo.yun}${taiGuoBuJi}`,
  };
}

/**
 * 计算年份的六气
 */
export function getLiuQi(year: number) {
  const { zhi } = getGanZhi(year);
  const siTian = DI_ZHI_SI_TIAN[zhi];
  const zaiQuan = LIU_QI_OPPOSITE[siTian];
  
  // 计算主气 (固定不变，从厥阴风木开始)
  const zhuQi = [...LIU_QI_ORDER];
  
  // 计算客气 (根据司天之气确定)
  const siTianIndex = LIU_QI_ORDER.indexOf(siTian);
  const keQi: LiuQi[] = [];
  for (let i = 0; i < 6; i++) {
    // 三之气为司天，终之气为在泉
    const index = (siTianIndex - 2 + i + 6) % 6;
    keQi.push(LIU_QI_ORDER[index]);
  }
  
  return {
    siTian, // 司天
    zaiQuan, // 在泉
    zhuQi, // 主气
    keQi, // 客气
  };
}

/**
 * 获取完整的年份五运六气信息
 */
export function getYearInfo(year: number) {
  const ganZhi = getGanZhi(year);
  const wuYun = getWuYun(year);
  const liuQi = getLiuQi(year);
  
  return {
    year,
    ...ganZhi,
    ...wuYun,
    ...liuQi,
  };
}

/**
 * 根据日期判断当前处于哪一气
 */
export function getCurrentQi(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 简化版节气判断 (大致日期)
  // 初之气: 大寒(1/20) - 春分(3/20)
  // 二之气: 春分(3/20) - 小满(5/21)
  // 三之气: 小满(5/21) - 大暑(7/22)
  // 四之气: 大暑(7/22) - 秋分(9/23)
  // 五之气: 秋分(9/23) - 小雪(11/22)
  // 终之气: 小雪(11/22) - 大寒(1/20)
  
  if ((month === 1 && day >= 20) || month === 2 || (month === 3 && day < 20)) return 0;
  if ((month === 3 && day >= 20) || month === 4 || (month === 5 && day < 21)) return 1;
  if ((month === 5 && day >= 21) || month === 6 || (month === 7 && day < 22)) return 2;
  if ((month === 7 && day >= 22) || month === 8 || (month === 9 && day < 23)) return 3;
  if ((month === 9 && day >= 23) || month === 10 || (month === 11 && day < 22)) return 4;
  return 5;
}

/**
 * 获取六气时段名称
 */
export function getQiPeriodName(index: number): string {
  const names = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];
  return names[index] || '';
}

/**
 * 获取六气时段日期范围
 */
export function getQiPeriodRange(index: number): string {
  const ranges = [
    '大寒 - 春分',
    '春分 - 小满',
    '小满 - 大暑',
    '大暑 - 秋分',
    '秋分 - 小雪',
    '小雪 - 大寒',
  ];
  return ranges[index] || '';
}
