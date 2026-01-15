// 阴历转换工具
import { Solar, Lunar } from 'lunar-javascript';

export interface DateInfo {
  // 阳历
  solarYear: number;
  solarMonth: number;
  solarDay: number;
  // 阴历
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarMonthName: string;
  lunarDayName: string;
  isLeapMonth: boolean;
  // 干支
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  // 节气
  jieQi: string | null;
  nextJieQi: { name: string; date: string } | null;
}

// 阳历转阴历
export function solarToLunar(year: number, month: number, day: number): DateInfo {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  
  // 获取下一个节气
  const jieQiTable = lunar.getJieQiTable();
  let nextJieQi: { name: string; date: string } | null = null;
  const jieQiNames = Object.keys(jieQiTable);
  
  for (const name of jieQiNames) {
    const jqSolar = jieQiTable[name];
    if (jqSolar && jqSolar.toYmd() > solar.toYmd()) {
      nextJieQi = { name, date: jqSolar.toYmd() };
      break;
    }
  }

  return {
    solarYear: year,
    solarMonth: month,
    solarDay: day,
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    lunarMonthName: lunar.getMonthInChinese() + '月',
    lunarDayName: lunar.getDayInChinese(),
    isLeapMonth: lunar.getMonth() < 0,
    ganZhiYear: lunar.getYearInGanZhi(),
    ganZhiMonth: lunar.getMonthInGanZhi(),
    ganZhiDay: lunar.getDayInGanZhi(),
    jieQi: lunar.getJieQi(),
    nextJieQi,
  };
}

// 阴历转阳历
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false): DateInfo {
  const lunar = Lunar.fromYmd(year, isLeapMonth ? -month : month, day);
  const solar = lunar.getSolar();
  
  // 获取下一个节气
  const jieQiTable = lunar.getJieQiTable();
  let nextJieQi: { name: string; date: string } | null = null;
  const jieQiNames = Object.keys(jieQiTable);
  
  for (const name of jieQiNames) {
    const jqSolar = jieQiTable[name];
    if (jqSolar && jqSolar.toYmd() > solar.toYmd()) {
      nextJieQi = { name, date: jqSolar.toYmd() };
      break;
    }
  }

  return {
    solarYear: solar.getYear(),
    solarMonth: solar.getMonth(),
    solarDay: solar.getDay(),
    lunarYear: year,
    lunarMonth: month,
    lunarDay: day,
    lunarMonthName: lunar.getMonthInChinese() + '月',
    lunarDayName: lunar.getDayInChinese(),
    isLeapMonth,
    ganZhiYear: lunar.getYearInGanZhi(),
    ganZhiMonth: lunar.getMonthInGanZhi(),
    ganZhiDay: lunar.getDayInGanZhi(),
    jieQi: lunar.getJieQi(),
    nextJieQi,
  };
}

// 获取某年的闰月
export function getLeapMonth(year: number): number {
  const lunar = Lunar.fromYmd(year, 1, 1);
  return lunar.getLeapMonth();
}

// 获取农历月份天数
export function getLunarMonthDays(year: number, month: number, isLeapMonth: boolean = false): number {
  const lunar = Lunar.fromYmd(year, isLeapMonth ? -month : month, 1);
  return lunar.getMonthDays();
}

// 格式化阴历日期显示
export function formatLunarDate(lunarMonth: number, lunarDay: number, lunarMonthName: string, lunarDayName: string): string {
  return `${lunarMonthName}${lunarDayName}`;
}

// 获取年份的干支
export function getYearGanZhi(year: number): string {
  const lunar = Lunar.fromYmd(year, 1, 1);
  return lunar.getYearInGanZhi();
}

// 中文数字
export const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
export const LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
export const LUNAR_DAYS = [
  '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];
