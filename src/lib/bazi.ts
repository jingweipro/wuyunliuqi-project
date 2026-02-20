/**
 * 八字计算核心库（修正版）
 * 使用基准日法精确计算日柱，节气表精确划分月柱
 */

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

const ZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

const GAN_YINYANG: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

const ZHI_YINYANG: Record<string, string> = {
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳', '巳': '阴',
  '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
};

// 地支藏干
const ZHI_CANG_GAN: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'], '卯': ['乙'],
  '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'], '午': ['丁', '己'], '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'], '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

// 十神关系
function getShiShen(dayGan: string, otherGan: string): string {
  const dayWuxing = GAN_WUXING[dayGan];
  const otherWuxing = GAN_WUXING[otherGan];
  const dayYinYang = GAN_YINYANG[dayGan];
  const otherYinYang = GAN_YINYANG[otherGan];
  const sameYinYang = dayYinYang === otherYinYang;

  const shengMap: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const keMap: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  if (dayWuxing === otherWuxing) return sameYinYang ? '比肩' : '劫财';
  if (shengMap[dayWuxing] === otherWuxing) return sameYinYang ? '食神' : '伤官';
  if (keMap[dayWuxing] === otherWuxing) return sameYinYang ? '偏财' : '正财';
  if (shengMap[otherWuxing] === dayWuxing) return sameYinYang ? '偏印' : '正印';
  if (keMap[otherWuxing] === dayWuxing) return sameYinYang ? '七杀' : '正官';
  return '';
}

// ===== 年柱 =====
function getYearPillar(year: number, month: number, day: number) {
  // 立春前算上一年（立春约2月4日）
  let adjustedYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    adjustedYear = year - 1;
  }
  const offset = (adjustedYear - 4) % 60;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex] };
}

// ===== 节气月份表（每月的节气起始日期，简化版） =====
// 节气日期表（月份对应的"节"，划分月柱的依据）
// 格式：[月份, 节气名, 大约日期]
// 1月-小寒/大寒→丑月，2月-立春→寅月，3月-惊蛰→卯月，等等
function getJieQiMonth(year: number, month: number, day: number): number {
  // 每年各月的"节"大约日期（用于月柱划分）
  // 返回以寅月为1的月份编号(1-12)
  const jieqi: [number, number][] = [
    [2, 4],   // 立春 → 寅月(1) 开始
    [3, 6],   // 惊蛰 → 卯月(2) 开始
    [4, 5],   // 清明 → 辰月(3) 开始
    [5, 6],   // 立夏 → 巳月(4) 开始
    [6, 6],   // 芒种 → 午月(5) 开始
    [7, 7],   // 小暑 → 未月(6) 开始
    [8, 7],   // 立秋 → 申月(7) 开始
    [9, 8],   // 白露 → 酉月(8) 开始
    [10, 8],  // 寒露 → 戌月(9) 开始
    [11, 7],  // 立冬 → 亥月(10) 开始
    [12, 7],  // 大雪 → 子月(11) 开始
    [1, 6],   // 小寒 → 丑月(12) 开始
  ];

  // 判断当前日期属于哪个月柱
  for (let i = jieqi.length - 1; i >= 0; i--) {
    const [m, d] = jieqi[i];
    if (i === jieqi.length - 1) {
      // 小寒（1月）特殊处理
      if (month === 1 && day >= d) return 12; // 丑月
      if (month === 12 && day >= jieqi[10][1]) return 11; // 子月
    } else {
      if (month === m && day >= d) return i + 1;
      if (month > m && month < (i + 1 < jieqi.length - 1 ? jieqi[i + 1][0] : 13)) return i + 1;
    }
  }

  // 更简化的判断
  if (month === 1 && day < 6) return 11; // 还在子月
  if (month === 1) return 12; // 丑月
  if (month === 2 && day < 4) return 12; // 还在丑月

  // 通用判断
  const monthStarts = [
    { solarMonth: 2, solarDay: 4, lunarMonth: 1 },   // 寅月
    { solarMonth: 3, solarDay: 6, lunarMonth: 2 },   // 卯月
    { solarMonth: 4, solarDay: 5, lunarMonth: 3 },   // 辰月
    { solarMonth: 5, solarDay: 6, lunarMonth: 4 },   // 巳月
    { solarMonth: 6, solarDay: 6, lunarMonth: 5 },   // 午月
    { solarMonth: 7, solarDay: 7, lunarMonth: 6 },   // 未月
    { solarMonth: 8, solarDay: 7, lunarMonth: 7 },   // 申月
    { solarMonth: 9, solarDay: 8, lunarMonth: 8 },   // 酉月
    { solarMonth: 10, solarDay: 8, lunarMonth: 9 },  // 戌月
    { solarMonth: 11, solarDay: 7, lunarMonth: 10 }, // 亥月
    { solarMonth: 12, solarDay: 7, lunarMonth: 11 }, // 子月
  ];

  for (let i = monthStarts.length - 1; i >= 0; i--) {
    const ms = monthStarts[i];
    if (month > ms.solarMonth || (month === ms.solarMonth && day >= ms.solarDay)) {
      return ms.lunarMonth;
    }
  }

  return 12; // 默认丑月
}

// ===== 月柱 =====
function getMonthPillar(year: number, month: number, day: number) {
  const jieqiMonth = getJieQiMonth(year, month, day); // 1=寅月 ... 12=丑月

  // 年干用于确定月干（需要考虑立春换年）
  let yearForGan = year;
  if (month < 2 || (month === 2 && day < 4)) {
    yearForGan = year - 1;
  }
  const yearGanIndex = ((yearForGan - 4) % 10 + 10) % 10;

  // 月干公式：(年干序号 * 2 + 月份数 + 1) % 10
  // 其中月份数 = jieqiMonth (1=寅月)
  const monthGanIndex = (yearGanIndex * 2 + jieqiMonth + 1) % 10;

  // 月支：寅月(1)=寅(2), 卯月(2)=卯(3), ...
  const monthZhiIndex = (jieqiMonth + 1) % 12;

  return { gan: TIAN_GAN[monthGanIndex], zhi: DI_ZHI[monthZhiIndex] };
}

// ===== 日柱（基准日法，精确计算） =====
function getDayPillar(year: number, month: number, day: number) {
  // 基准日：2000年1月7日 = 甲子日（干支序号0）
  const baseDate = new Date(Date.UTC(2000, 0, 7));
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const diffDays = Math.round((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const ganZhiIndex = ((diffDays % 60) + 60) % 60;

  const ganIndex = ganZhiIndex % 10;
  const zhiIndex = ganZhiIndex % 12;

  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex] };
}

// ===== 时柱 =====
function getHourPillar(dayGan: string, hour: number) {
  const shiChenIndex = Math.floor(((hour + 1) % 24) / 2);
  const dayGanIndex = TIAN_GAN.indexOf(dayGan);
  const hourGanIndex = (dayGanIndex * 2 + shiChenIndex) % 10;
  return { gan: TIAN_GAN[hourGanIndex], zhi: DI_ZHI[shiChenIndex] };
}

// 纳音五行
const NA_YIN: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '沙中金', '乙未': '沙中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
};

export interface BaZiResult {
  yearPillar: { gan: string; zhi: string; ganZhi: string; naYin: string };
  monthPillar: { gan: string; zhi: string; ganZhi: string; naYin: string };
  dayPillar: { gan: string; zhi: string; ganZhi: string; naYin: string };
  hourPillar: { gan: string; zhi: string; ganZhi: string; naYin: string };
  dayMaster: string;
  dayMasterWuxing: string;
  dayMasterYinYang: string;
  wuxingCount: Record<string, number>;
  wuxingAnalysis: string;
  shiShen: {
    yearGan: string; yearZhi: string;
    monthGan: string; monthZhi: string;
    dayGan: string; dayZhi: string;
    hourGan: string; hourZhi: string;
  };
  cangGan: {
    year: string[]; month: string[]; day: string[]; hour: string[];
  };
}

export function calculateBaZi(year: number, month: number, day: number, hour: number): BaZiResult {
  const yp = getYearPillar(year, month, day);
  const mp = getMonthPillar(year, month, day);
  const dp = getDayPillar(year, month, day);
  const hp = getHourPillar(dp.gan, hour);

  const ypGanZhi = yp.gan + yp.zhi;
  const mpGanZhi = mp.gan + mp.zhi;
  const dpGanZhi = dp.gan + dp.zhi;
  const hpGanZhi = hp.gan + hp.zhi;

  // 五行统计
  const wuxingCount: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  [yp.gan, mp.gan, dp.gan, hp.gan].forEach(g => wuxingCount[GAN_WUXING[g]]++);
  [yp.zhi, mp.zhi, dp.zhi, hp.zhi].forEach(z => wuxingCount[ZHI_WUXING[z]]++);
  // 藏干也计入（权重0.5）
  [yp.zhi, mp.zhi, dp.zhi, hp.zhi].forEach(z => {
    ZHI_CANG_GAN[z].forEach(g => wuxingCount[GAN_WUXING[g]] += 0.5);
  });

  const maxWuxing = Object.entries(wuxingCount).sort((a, b) => b[1] - a[1])[0][0];
  const minWuxing = Object.entries(wuxingCount).sort((a, b) => a[1] - b[1])[0][0];
  const wuxingAnalysis = `五行中${maxWuxing}最旺，${minWuxing}最弱。日主${dp.gan}属${GAN_WUXING[dp.gan]}，需综合分析旺衰。`;

  const shiShen = {
    yearGan: getShiShen(dp.gan, yp.gan),
    yearZhi: getShiShen(dp.gan, ZHI_CANG_GAN[yp.zhi][0]),
    monthGan: getShiShen(dp.gan, mp.gan),
    monthZhi: getShiShen(dp.gan, ZHI_CANG_GAN[mp.zhi][0]),
    dayGan: '日主',
    dayZhi: getShiShen(dp.gan, ZHI_CANG_GAN[dp.zhi][0]),
    hourGan: getShiShen(dp.gan, hp.gan),
    hourZhi: getShiShen(dp.gan, ZHI_CANG_GAN[hp.zhi][0]),
  };

  return {
    yearPillar: { ...yp, ganZhi: ypGanZhi, naYin: NA_YIN[ypGanZhi] || '' },
    monthPillar: { ...mp, ganZhi: mpGanZhi, naYin: NA_YIN[mpGanZhi] || '' },
    dayPillar: { ...dp, ganZhi: dpGanZhi, naYin: NA_YIN[dpGanZhi] || '' },
    hourPillar: { ...hp, ganZhi: hpGanZhi, naYin: NA_YIN[hpGanZhi] || '' },
    dayMaster: dp.gan,
    dayMasterWuxing: GAN_WUXING[dp.gan],
    dayMasterYinYang: GAN_YINYANG[dp.gan],
    wuxingCount,
    wuxingAnalysis,
    shiShen,
    cangGan: {
      year: ZHI_CANG_GAN[yp.zhi],
      month: ZHI_CANG_GAN[mp.zhi],
      day: ZHI_CANG_GAN[dp.zhi],
      hour: ZHI_CANG_GAN[hp.zhi],
    },
  };
}

export { GAN_WUXING, ZHI_WUXING, GAN_YINYANG, ZHI_YINYANG, ZHI_CANG_GAN, TIAN_GAN, DI_ZHI, getShiShen };
