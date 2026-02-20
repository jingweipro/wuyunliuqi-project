/**
 * 紫微斗数核心库（修正版）
 * 修正：命宫计算（从寅逆数月、顺数时）、宫干计算
 */

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const GONG_NAMES = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
                           '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫'];

export const ZHU_XING = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞',
                          '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];

// 五行局查表（命宫干支 → 五行局）
const WU_XING_JU_MAP: Record<string, { name: string; num: number }> = {
  '甲子': { name: '水二局', num: 2 }, '乙丑': { name: '水二局', num: 2 },
  '丙寅': { name: '火六局', num: 6 }, '丁卯': { name: '火六局', num: 6 },
  '戊辰': { name: '木三局', num: 3 }, '己巳': { name: '木三局', num: 3 },
  '庚午': { name: '土五局', num: 5 }, '辛未': { name: '土五局', num: 5 },
  '壬申': { name: '金四局', num: 4 }, '癸酉': { name: '金四局', num: 4 },
  '甲戌': { name: '火六局', num: 6 }, '乙亥': { name: '火六局', num: 6 },
  '丙子': { name: '水二局', num: 2 }, '丁丑': { name: '水二局', num: 2 },
  '戊寅': { name: '火六局', num: 6 }, '己卯': { name: '火六局', num: 6 },
  '庚辰': { name: '木三局', num: 3 }, '辛巳': { name: '木三局', num: 3 },
  '壬午': { name: '木三局', num: 3 }, '癸未': { name: '木三局', num: 3 },
  '甲申': { name: '水二局', num: 2 }, '乙酉': { name: '水二局', num: 2 },
  '丙戌': { name: '土五局', num: 5 }, '丁亥': { name: '土五局', num: 5 },
  '戊子': { name: '火六局', num: 6 }, '己丑': { name: '火六局', num: 6 },
  '庚寅': { name: '金四局', num: 4 }, '辛卯': { name: '金四局', num: 4 },
  '壬辰': { name: '水二局', num: 2 }, '癸巳': { name: '水二局', num: 2 },
  '甲午': { name: '金四局', num: 4 }, '乙未': { name: '金四局', num: 4 },
  '丙申': { name: '木三局', num: 3 }, '丁酉': { name: '木三局', num: 3 },
  '戊戌': { name: '木三局', num: 3 }, '己亥': { name: '木三局', num: 3 },
  '庚子': { name: '土五局', num: 5 }, '辛丑': { name: '土五局', num: 5 },
  '壬寅': { name: '金四局', num: 4 }, '癸卯': { name: '金四局', num: 4 },
};

/**
 * 命宫计算（标准算法）
 * 从寅宫起正月，逆数到生月，再从该宫起子时，顺数到生时
 */
function getMingGong(lunarMonth: number, shiChenIndex: number): number {
  // 寅(2)起正月，逆数到生月
  const monthPos = (2 - (lunarMonth - 1) + 12) % 12;
  // 从月宫位置起子时，顺数到生时
  const mingPos = (monthPos + shiChenIndex) % 12;
  return mingPos;
}

/**
 * 身宫计算
 * 从寅宫起正月，顺数到生月，再从该宫起子时，逆数到生时
 */
function getShenGong(lunarMonth: number, shiChenIndex: number): number {
  const monthPos = (2 + (lunarMonth - 1)) % 12;
  const shenPos = (monthPos - shiChenIndex + 12) % 12;
  return shenPos;
}

/**
 * 宫干计算（五虎遁）
 * 根据年干确定寅宫天干，然后顺排
 */
function getGongTianGan(yearGan: string): Record<number, string> {
  const ganIndex = TIAN_GAN.indexOf(yearGan);
  // 五虎遁：甲己→丙寅，乙庚→戊寅，丙辛→庚寅，丁壬→壬寅，戊癸→甲寅
  const yinGanStart = [2, 4, 6, 8, 0][ganIndex % 5];

  const result: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    // i是地支索引(0=子,1=丑,2=寅...)
    // 寅宫(i=2)天干 = yinGanStart
    const ganOffset = (i - 2 + 12) % 12;
    result[i] = TIAN_GAN[(yinGanStart + ganOffset) % 10];
  }
  return result;
}

/**
 * 紫微星定位
 */
function getZiweiPos(lunarDay: number, juNum: number): number {
  // 紫微星位置查表法（简化）
  const quotient = Math.ceil(lunarDay / juNum);
  const remainder = lunarDay % juNum;

  let pos: number;
  if (remainder === 0) {
    pos = quotient + 1;
  } else {
    // 奇数余数顺行，偶数余数逆行
    if (remainder % 2 === 1) {
      pos = quotient + 1 + Math.ceil(remainder / 2);
    } else {
      pos = quotient + 1 - (remainder / 2);
    }
  }
  return ((pos % 12) + 12) % 12;
}

function getTianfuPos(ziweiPos: number): number {
  return (12 - ziweiPos + 4) % 12;
}

export interface GongInfo {
  name: string;
  diZhi: string;
  tianGan: string;
  zhiIndex: number;
  stars: string[];
  fuStars: string[];
  siHua: string[];
}

export interface ZiWeiResult {
  mingGong: number;
  shenGong: number;
  wuxingJu: string;
  juNum: number;
  gongs: GongInfo[];
  gender: string;
  yinYang: string;
}

export function calculateZiWei(
  year: number, lunarMonth: number, lunarDay: number,
  hour: number, gender: '男' | '女'
): ZiWeiResult {
  const shiChenIndex = Math.floor(((hour + 1) % 24) / 2);

  // 年柱
  const offset = (year - 4) % 60;
  const ganIndex = ((offset % 10) + 10) % 10;
  const yearGan = TIAN_GAN[ganIndex];
  const yinYang = ganIndex % 2 === 0 ? '阳' : '阴';

  // 命宫和身宫
  const mingGong = getMingGong(lunarMonth, shiChenIndex);
  const shenGong = getShenGong(lunarMonth, shiChenIndex);

  // 宫干（按地支索引）
  const gongGanMap = getGongTianGan(yearGan);

  // 五行局
  const mingGanZhi = gongGanMap[mingGong] + DI_ZHI[mingGong];
  const ju = WU_XING_JU_MAP[mingGanZhi] || { name: '水二局', num: 2 };

  // 紫微星系定位
  const ziweiPos = getZiweiPos(lunarDay, ju.num);
  const tianfuPos = getTianfuPos(ziweiPos);

  const starPositions: Record<string, number> = {};

  // 紫微星系
  starPositions['紫微'] = ziweiPos;
  starPositions['天机'] = (ziweiPos - 1 + 12) % 12;
  starPositions['太阳'] = (ziweiPos - 3 + 12) % 12;
  starPositions['武曲'] = (ziweiPos - 4 + 12) % 12;
  starPositions['天同'] = (ziweiPos - 5 + 12) % 12;
  starPositions['廉贞'] = (ziweiPos - 8 + 12) % 12;

  // 天府星系
  starPositions['天府'] = tianfuPos;
  starPositions['太阴'] = (tianfuPos + 1) % 12;
  starPositions['贪狼'] = (tianfuPos + 2) % 12;
  starPositions['巨门'] = (tianfuPos + 3) % 12;
  starPositions['天相'] = (tianfuPos + 4) % 12;
  starPositions['天梁'] = (tianfuPos + 5) % 12;
  starPositions['七杀'] = (tianfuPos + 6) % 12;
  starPositions['破军'] = (tianfuPos + 10) % 12;

  // 辅星
  const fuStarPositions: Record<string, number> = {};
  fuStarPositions['左辅'] = (lunarMonth + 3) % 12;
  fuStarPositions['右弼'] = (11 - lunarMonth + 12) % 12;
  fuStarPositions['文昌'] = (10 - shiChenIndex + 12) % 12;
  fuStarPositions['文曲'] = (shiChenIndex + 4) % 12;
  fuStarPositions['禄存'] = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][ganIndex];
  fuStarPositions['擎羊'] = (fuStarPositions['禄存'] + 1) % 12;
  fuStarPositions['陀罗'] = (fuStarPositions['禄存'] - 1 + 12) % 12;

  // 四化
  const siHuaTable: Record<string, string[]> = {
    '甲': ['廉贞化禄', '破军化权', '武曲化科', '太阳化忌'],
    '乙': ['天机化禄', '天梁化权', '紫微化科', '太阴化忌'],
    '丙': ['天同化禄', '天机化权', '文昌化科', '廉贞化忌'],
    '丁': ['太阴化禄', '天同化权', '天机化科', '巨门化忌'],
    '戊': ['贪狼化禄', '太阴化权', '右弼化科', '天机化忌'],
    '己': ['武曲化禄', '贪狼化权', '天梁化科', '文曲化忌'],
    '庚': ['太阳化禄', '武曲化权', '太阴化科', '天同化忌'],
    '辛': ['巨门化禄', '太阳化权', '文曲化科', '文昌化忌'],
    '壬': ['天梁化禄', '紫微化权', '左辅化科', '武曲化忌'],
    '癸': ['破军化禄', '巨门化权', '太阴化科', '贪狼化忌'],
  };
  const siHua = siHuaTable[yearGan] || [];

  // 组装十二宫
  const gongs: GongInfo[] = [];
  for (let i = 0; i < 12; i++) {
    // 命宫位置开始，逆时针排列宫位
    const gongPos = (mingGong - i + 12) % 12;
    const stars: string[] = [];
    const fuStars: string[] = [];
    const gongSiHua: string[] = [];

    Object.entries(starPositions).forEach(([star, pos]) => {
      if (pos === gongPos) stars.push(star);
    });

    Object.entries(fuStarPositions).forEach(([star, pos]) => {
      if (pos === gongPos) fuStars.push(star);
    });

    siHua.forEach(sh => {
      const starName = sh.replace(/化[禄权科忌]/, '');
      if (starPositions[starName] === gongPos || fuStarPositions[starName] === gongPos) {
        gongSiHua.push(sh.slice(-2));
      }
    });

    gongs.push({
      name: GONG_NAMES[i],
      diZhi: DI_ZHI[gongPos],
      tianGan: gongGanMap[gongPos],
      zhiIndex: gongPos,
      stars,
      fuStars,
      siHua: gongSiHua,
    });
  }

  return {
    mingGong,
    shenGong,
    wuxingJu: ju.name,
    juNum: ju.num,
    gongs,
    gender,
    yinYang,
  };
}
