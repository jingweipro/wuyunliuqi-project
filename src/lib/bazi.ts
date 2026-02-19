/**
 * 八字计算核心库
 * 四柱八字排盘、五行分析、十神关系
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

// 十二长生
const CHANG_SHENG_ORDER = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
const CHANG_SHENG_START: Record<string, number> = {
  '甲': 0, '丙': 2, '戊': 2, '庚': 8, '壬': 8,  // 阳干
  '乙': 6, '丁': 4, '己': 4, '辛': 0, '癸': 0    // 阴干（逆行，但用简化方式）
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

// 年柱
function getYearPillar(year: number) {
  const offset = (year - 4) % 60;
  const ganIndex = ((offset % 10) + 10) % 10;
  const zhiIndex = ((offset % 12) + 12) % 12;
  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex] };
}

// 月柱（以节气划分月份，这里用简化方式）
function getMonthPillar(year: number, month: number, day: number) {
  // 月份节气边界（简化：5日为界）
  let lunarMonth = month;
  if (day < 5) lunarMonth = month - 1;
  if (lunarMonth <= 0) { lunarMonth = 12; year--; }
  if (lunarMonth > 12) lunarMonth = 1;

  // 月干 = (年干 * 2 + 月数) % 10
  const yearGanIndex = (year - 4) % 10;
  const monthGanIndex = ((yearGanIndex >= 0 ? yearGanIndex : yearGanIndex + 10) * 2 + lunarMonth) % 10;
  // 月支：寅月起（正月=寅）
  const monthZhiIndex = (lunarMonth + 1) % 12;

  return { gan: TIAN_GAN[monthGanIndex], zhi: DI_ZHI[monthZhiIndex] };
}

// 日柱（简化计算，使用公式）
function getDayPillar(year: number, month: number, day: number) {
  // 使用蔡勒公式变种计算日干支
  const y = month <= 2 ? year - 1 : year;
  const m = month <= 2 ? month + 12 : month;
  const C = Math.floor(y / 100);
  const Y = y % 100;

  // 日干支序号（从甲子=0开始）
  let dayNum = Math.floor(y * 365.25) + Math.floor(30.6 * (m + 1)) + day - 621049;
  dayNum = ((dayNum % 60) + 60) % 60;

  const ganIndex = dayNum % 10;
  const zhiIndex = dayNum % 12;

  return { gan: TIAN_GAN[ganIndex], zhi: DI_ZHI[zhiIndex] };
}

// 时柱
function getHourPillar(dayGan: string, hour: number) {
  // 时辰索引（子时=0）
  const shiChenIndex = Math.floor(((hour + 1) % 24) / 2);
  // 时干 = (日干序号 * 2 + 时辰序号) % 10
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
  const yp = getYearPillar(year);
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

  // 藏干五行也计入
  [yp.zhi, mp.zhi, dp.zhi, hp.zhi].forEach(z => {
    ZHI_CANG_GAN[z].forEach(g => wuxingCount[GAN_WUXING[g]] += 0.5);
  });

  // 五行分析
  const maxWuxing = Object.entries(wuxingCount).sort((a, b) => b[1] - a[1])[0][0];
  const minWuxing = Object.entries(wuxingCount).sort((a, b) => a[1] - b[1])[0][0];
  const wuxingAnalysis = `五行中${maxWuxing}最旺，${minWuxing}最弱。日主${dp.gan}属${GAN_WUXING[dp.gan]}，需综合分析旺衰。`;

  // 十神
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
