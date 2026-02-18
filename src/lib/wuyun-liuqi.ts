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
export const LIU_QI_SHORT = ['风木', '君火', '相火', '湿土', '燥金', '寒水'] as const;

// 五运
export const WU_YUN = ['土运', '金运', '水运', '木运', '火运'] as const;
export type WuYunType = typeof WU_YUN[number];

// 五运对应五行
export const WU_YUN_XING: Record<string, WuXing> = {
  '土运': '土',
  '金运': '金',
  '水运': '水',
  '木运': '木',
  '火运': '火',
};

// 24节气
export const JIE_QI = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
] as const;

// 节气对应月份和日期（近似值）
export const JIE_QI_DATES: { name: string; month: number; day: number }[] = [
  { name: '小寒', month: 1, day: 6 },
  { name: '大寒', month: 1, day: 20 },
  { name: '立春', month: 2, day: 4 },
  { name: '雨水', month: 2, day: 19 },
  { name: '惊蛰', month: 3, day: 6 },
  { name: '春分', month: 3, day: 21 },
  { name: '清明', month: 4, day: 5 },
  { name: '谷雨', month: 4, day: 20 },
  { name: '立夏', month: 5, day: 6 },
  { name: '小满', month: 5, day: 21 },
  { name: '芒种', month: 6, day: 6 },
  { name: '夏至', month: 6, day: 21 },
  { name: '小暑', month: 7, day: 7 },
  { name: '大暑', month: 7, day: 23 },
  { name: '立秋', month: 8, day: 8 },
  { name: '处暑', month: 8, day: 23 },
  { name: '白露', month: 9, day: 8 },
  { name: '秋分', month: 9, day: 23 },
  { name: '寒露', month: 10, day: 8 },
  { name: '霜降', month: 10, day: 24 },
  { name: '立冬', month: 11, day: 8 },
  { name: '小雪', month: 11, day: 22 },
  { name: '大雪', month: 12, day: 7 },
  { name: '冬至', month: 12, day: 22 },
];

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
  '金': { color: '#9CA3AF', colorClass: 'element-metal', direction: '西', season: '秋', organ: '肺/大肠', emotion: '悲' },
  '水': { color: '#1E3A52', colorClass: 'element-water', direction: '北', season: '冬', organ: '肾/膀胱', emotion: '恐' },
};

// 六气属性映射
export const LIU_QI_ATTRIBUTES: Record<LiuQi, {
  element: WuXing;
  nature: string;
  period: string;
  jieQiStart: string;
  jieQiEnd: string;
}> = {
  '厥阴风木': { element: '木', nature: '风', period: '初之气', jieQiStart: '大寒', jieQiEnd: '春分' },
  '少阴君火': { element: '火', nature: '热', period: '二之气', jieQiStart: '春分', jieQiEnd: '小满' },
  '少阳相火': { element: '火', nature: '暑', period: '三之气', jieQiStart: '小满', jieQiEnd: '大暑' },
  '太阴湿土': { element: '土', nature: '湿', period: '四之气', jieQiStart: '大暑', jieQiEnd: '秋分' },
  '阳明燥金': { element: '金', nature: '燥', period: '五之气', jieQiStart: '秋分', jieQiEnd: '小雪' },
  '太阳寒水': { element: '水', nature: '寒', period: '终之气', jieQiStart: '小雪', jieQiEnd: '大寒' },
};

// 六气时段信息
export const QI_PERIODS = [
  { name: '初之气', jieQiStart: '大寒', jieQiEnd: '春分', dateRange: '1月20日-3月20日' },
  { name: '二之气', jieQiStart: '春分', jieQiEnd: '小满', dateRange: '3月21日-5月20日' },
  { name: '三之气', jieQiStart: '小满', jieQiEnd: '大暑', dateRange: '5月21日-7月22日' },
  { name: '四之气', jieQiStart: '大暑', jieQiEnd: '秋分', dateRange: '7月23日-9月22日' },
  { name: '五之气', jieQiStart: '秋分', jieQiEnd: '小雪', dateRange: '9月23日-11月21日' },
  { name: '终之气', jieQiStart: '小雪', jieQiEnd: '大寒', dateRange: '11月22日-1月19日' },
];

// 五运时段信息（主运固定）
export const WU_YUN_PERIODS = [
  { name: '初运', xing: '木' as WuXing, jieQiStart: '大寒', jieQiEnd: '春分', dateRange: '1月20日-3月31日约73天' },
  { name: '二运', xing: '火' as WuXing, jieQiStart: '春分', jieQiEnd: '芒种', dateRange: '4月1日-6月12日约73天' },
  { name: '三运', xing: '土' as WuXing, jieQiStart: '芒种', jieQiEnd: '处暑', dateRange: '6月13日-8月24日约73天' },
  { name: '四运', xing: '金' as WuXing, jieQiStart: '处暑', jieQiEnd: '立冬', dateRange: '8月25日-11月6日约73天' },
  { name: '五运', xing: '水' as WuXing, jieQiStart: '立冬', jieQiEnd: '大寒', dateRange: '11月7日-1月19日约73天' },
];

/**
 * 根据年份计算天干地支
 */
export function getGanZhi(year: number): { gan: string; zhi: string; ganZhi: string } {
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
  const taiGuoGan = ['甲', '丙', '戊', '庚', '壬'];
  return taiGuoGan.includes(gan) ? '太过' : '不及';
}

/**
 * 计算主运（固定不变：木火土金水）
 */
export function getZhuYun(): { xing: WuXing; name: string }[] {
  return [
    { xing: '木', name: '初运·木' },
    { xing: '火', name: '二运·火' },
    { xing: '土', name: '三运·土' },
    { xing: '金', name: '四运·金' },
    { xing: '水', name: '五运·水' },
  ];
}

/**
 * 计算客运（根据中运推算）
 * 关键规则——太少相生反推：
 * 从岁运开始按五行相生顺序排列，太少交替
 * 但当从"水(羽)"过渡到"木(角)"时，太少不反转（保持原样）
 * 参考《素问·六元正纪大论》
 */
export function getKeYun(year: number): { xing: WuXing; name: string; taiGuoBuJi: '太过' | '不及' }[] {
  const { gan } = getGanZhi(year);
  const zhongYunXing = TIAN_GAN_WU_YUN[gan].xing;
  const taiGuoBuJi = getTaiGuoBuJi(gan);
  
  // 五行相生顺序：角(木)→征(火)→宫(土)→商(金)→羽(水)
  const shengOrder: WuXing[] = ['木', '火', '土', '金', '水'];
  const startIndex = shengOrder.indexOf(zhongYunXing);
  
  const keYun: { xing: WuXing; name: string; taiGuoBuJi: '太过' | '不及' }[] = [];
  let currentIsTaiGuo = taiGuoBuJi === '太过';
  
  // 五音名对应
  const wuYin: Record<WuXing, string> = { '木': '角', '火': '征', '土': '宫', '金': '商', '水': '羽' };
  
  for (let i = 0; i < 5; i++) {
    const xingIndex = (startIndex + i) % 5;
    const xing = shengOrder[xingIndex];
    const taiShao = currentIsTaiGuo ? '太' : '少';
    
    keYun.push({
      xing,
      name: `${taiShao}${wuYin[xing]}·${xing}`,
      taiGuoBuJi: currentIsTaiGuo ? '太过' : '不及',
    });
    
    // 判断下一步是否跨越"水→木"（羽→角）边界
    if (i < 4) {
      const nextXingIndex = (startIndex + i + 1) % 5;
      if (xingIndex === 4 && nextXingIndex === 0) {
        // 跨越了"水→木"的边界，太少不反转（反推）
        // currentIsTaiGuo 保持不变
      } else {
        // 正常交替
        currentIsTaiGuo = !currentIsTaiGuo;
      }
    }
  }
  
  return keYun;
}

/**
 * 计算年份的五运
 */
export function getWuYun(year: number) {
  const { gan } = getGanZhi(year);
  const yunInfo = TIAN_GAN_WU_YUN[gan];
  const taiGuoBuJi = getTaiGuoBuJi(gan);
  const zhuYun = getZhuYun();
  const keYun = getKeYun(year);
  
  return {
    daYun: yunInfo.yun,
    wuXing: yunInfo.xing,
    taiGuoBuJi,
    description: `${gan}年${yunInfo.yun}${taiGuoBuJi}`,
    zhuYun,
    keYun,
  };
}

/**
 * 计算年份的六气
 */
export function getLiuQi(year: number) {
  const { zhi } = getGanZhi(year);
  const siTian = DI_ZHI_SI_TIAN[zhi];
  const zaiQuan = LIU_QI_OPPOSITE[siTian];
  
  // 主气固定不变
  const zhuQi = [...LIU_QI_ORDER];
  
  // 客气根据司天确定
  const siTianIndex = LIU_QI_ORDER.indexOf(siTian);
  const keQi: LiuQi[] = [];
  for (let i = 0; i < 6; i++) {
    const index = (siTianIndex - 2 + i + 6) % 6;
    keQi.push(LIU_QI_ORDER[index]);
  }
  
  return {
    siTian,
    zaiQuan,
    zhuQi,
    keQi,
  };
}

/**
 * 获取客主加临分析
 * 
 * 关系判断基于五行属性：
 * - 相得：主客同一五行（如少阳相火与少阴君火均属火）
 * - 顺（客生主）：客气五行生主气五行
 * - 逆（客克主）：客气五行克主气五行
 * - 泄（主生客）：主气五行生客气五行
 * - 胜（主克客）：主气五行克客气五行
 */
export function getKeZhuJiaLin(year: number): {
  qiIndex: number;
  qiName: string;
  zhuQi: LiuQi;
  keQi: LiuQi;
  relation: string;
  description: string;
}[] {
  const { zhuQi, keQi, siTian, zaiQuan } = getLiuQi(year);
  
  const qiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];
  
  return qiNames.map((name, index) => {
    const zhu = zhuQi[index];
    const ke = keQi[index];
    const zhuElement = LIU_QI_ATTRIBUTES[zhu].element;
    const keElement = LIU_QI_ATTRIBUTES[ke].element;
    
    // 用五行属性判断关系（注意少阴君火与少阳相火同属火）
    let relation: string;
    let description: string;
    
    if (zhuElement === keElement) {
      // 同属一个五行即为"相得"（包括少阴君火与少阳相火的情况）
      relation = '相得';
      description = `主客同属${zhuElement}，气候相得，${LIU_QI_ATTRIBUTES[zhu].nature}气偏盛`;
    } else if (isSheng(keElement, zhuElement)) {
      relation = '顺（客生主）';
      description = `客气${ke}(${keElement})生主气${zhu}(${zhuElement})，客来助主，气候和平`;
    } else if (isKe(keElement, zhuElement)) {
      relation = '逆（客克主）';
      description = `客气${ke}(${keElement})克主气${zhu}(${zhuElement})，客胜主负，当防胜复`;
    } else if (isSheng(zhuElement, keElement)) {
      relation = '泄（主生客）';
      description = `主气${zhu}(${zhuElement})生客气${ke}(${keElement})，地气外泄，正气耗散`;
    } else if (isKe(zhuElement, keElement)) {
      relation = '胜（主克客）';
      description = `主气${zhu}(${zhuElement})克客气${ke}(${keElement})，地气制天，秩序有常`;
    } else {
      relation = '和';
      description = `主客各司其政，气候正常`;
    }
    
    // 添加司天在泉标记
    if (index === 2) {
      description += `  【司天 · ${siTian}】主上半年气候。`;
    } else if (index === 5) {
      description += `  【在泉 · ${zaiQuan}】主下半年气候。`;
    }
    
    return {
      qiIndex: index,
      qiName: name,
      zhuQi: zhu,
      keQi: ke,
      relation,
      description,
    };
  });
}

// 判断五行相生
function isSheng(from: WuXing, to: WuXing): boolean {
  const shengMap: Record<WuXing, WuXing> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  };
  return shengMap[from] === to;
}

// 判断五行相克
function isKe(from: WuXing, to: WuXing): boolean {
  const keMap: Record<WuXing, WuXing> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
  };
  return keMap[from] === to;
}

/**
 * 获取完整的年份五运六气信息
 */
export function getYearInfo(year: number) {
  const ganZhi = getGanZhi(year);
  const wuYun = getWuYun(year);
  const liuQi = getLiuQi(year);
  const keZhuJiaLin = getKeZhuJiaLin(year);
  
  return {
    year,
    ...ganZhi,
    ...wuYun,
    ...liuQi,
    keZhuJiaLin,
  };
}

/**
 * 根据日期判断当前处于哪一气
 */
export function getCurrentQi(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if ((month === 1 && day >= 20) || month === 2 || (month === 3 && day < 21)) return 0;
  if ((month === 3 && day >= 21) || month === 4 || (month === 5 && day < 21)) return 1;
  if ((month === 5 && day >= 21) || month === 6 || (month === 7 && day < 23)) return 2;
  if ((month === 7 && day >= 23) || month === 8 || (month === 9 && day < 23)) return 3;
  if ((month === 9 && day >= 23) || month === 10 || (month === 11 && day < 22)) return 4;
  return 5;
}

/**
 * 根据日期判断当前处于哪一运
 */
export function getCurrentYun(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 每运约73天
  if ((month === 1 && day >= 20) || month === 2 || month === 3) return 0; // 初运
  if (month === 4 || month === 5 || (month === 6 && day <= 12)) return 1; // 二运
  if ((month === 6 && day >= 13) || month === 7 || (month === 8 && day <= 24)) return 2; // 三运
  if ((month === 8 && day >= 25) || month === 9 || month === 10 || (month === 11 && day <= 6)) return 3; // 四运
  return 4; // 五运
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
  return QI_PERIODS[index]?.dateRange || '';
}

/**
 * 获取六气时段节气范围
 */
export function getQiJieQiRange(index: number): string {
  const period = QI_PERIODS[index];
  return period ? `${period.jieQiStart} - ${period.jieQiEnd}` : '';
}
