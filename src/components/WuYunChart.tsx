import { useMemo } from 'react';
import { YearInfo } from '@/lib/wuyun-liuqi';

interface WuYunChartProps {
  yearInfo: YearInfo;
}

const ZHU_YUN_ORDER = ['木', '火', '土', '金', '水'];
const KE_YUN_NAMES: Record<string, string> = {
  '木': '角', '火': '徵', '土': '宫', '金': '商', '水': '羽'
};

const WUXING_COLORS: Record<string, { bg: string; text: string }> = {
  '木': { bg: '#A8D8B9', text: '#1a5c3a' },
  '火': { bg: '#F5B7B1', text: '#922b21' },
  '土': { bg: '#F9E79F', text: '#7d6608' },
  '金': { bg: '#D5D8DC', text: '#515a5a' },
  '水': { bg: '#AED6F1', text: '#1a5276' },
};

// 24节气（从大寒开始）
const JIE_QI = [
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
  { name: '小寒', month: 1, day: 6 },
];

// 五运起始节气索引(每运约4-5个节气 = 73天左右)
// 初运(木):大寒→春分前 (0-3) 4个节气
// 二运(火):春分→小满前 (4-7) 4个节气  
// 三运(土):小满→大暑前 (8-12) 5个节气
// 四运(金):大暑→秋分前 (13-16) 4个节气
// 五运(水):秋分→大寒前 (17-23) 7个节气 → 但实际五运各约73天
const YUN_START_JIEQI = [0, 4, 8, 12, 17];

function getDayOfYear(month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let i = 1; i < month; i++) total += daysInMonth[i];
  return total + day;
}

function getCurrentDateAngle(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const currentDOY = getDayOfYear(month, day);
  
  // 大寒约为DOY 20, 一年360度
  // 大寒是起点(角度0), 按日期在360度上均匀分布
  const daHanDOY = getDayOfYear(1, 20);
  let daysSinceStart = currentDOY - daHanDOY;
  if (daysSinceStart < 0) daysSinceStart += 365;
  
  return (daysSinceStart / 365) * 360 - 90; // -90因为SVG从顶部开始
}

function getCurrentYunIndex(): number {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  
  if ((m === 1 && d >= 20) || m === 2 || (m === 3 && d <= 20)) return 0;
  if ((m === 3 && d >= 21) || m === 4 || (m === 5 && d <= 20)) return 1;
  if ((m === 5 && d >= 21) || m === 6 || (m === 7 && d <= 22)) return 2;
  if ((m === 7 && d >= 23) || m === 8 || (m === 9 && d <= 22)) return 3;
  if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d <= 21)) return 4;
  return 0; // 冬至到大寒前属于前一年终运
}

export default function WuYunChart({ yearInfo }: WuYunChartProps) {
  const size = 600;
  const center = size / 2;
  const outerR = 230;
  const midR = 175;
  const innerR = 120;
  const coreR = 60;

  const currentYunIndex = useMemo(() => getCurrentYunIndex(), []);
  const dateAngle = useMemo(() => getCurrentDateAngle(), []);

  const polarToXY = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const sectorPath = (cx: number, cy: number, r1: number, r2: number, a1: number, a2: number) => {
    const p1 = polarToXY(cx, cy, r2, a2);
    const p2 = polarToXY(cx, cy, r2, a1);
    const p3 = polarToXY(cx, cy, r1, a1);
    const p4 = polarToXY(cx, cy, r1, a2);
    const lg = a2 - a1 > 180 ? 1 : 0;
    return `M${p1.x},${p1.y} A${r2},${r2},0,${lg},0,${p2.x},${p2.y} L${p3.x},${p3.y} A${r1},${r1},0,${lg},1,${p4.x},${p4.y} Z`;
  };

  // 沿弧线排列文字的辅助函数
  const renderArcText = (text: string, cx: number, cy: number, r: number, startAngle: number, endAngle: number, color: string, fontSize: number, fontWeight = '700') => {
    const midAngle = (startAngle + endAngle) / 2;
    const chars = text.split('');
    const totalSpan = Math.min(chars.length * 12, (endAngle - startAngle) * 0.7);
    const charSpan = totalSpan / chars.length;
    const offsetStart = midAngle - totalSpan / 2 + charSpan / 2;

    return chars.map((char, i) => {
      const angle = offsetStart + i * charSpan;
      const pos = polarToXY(cx, cy, r, angle);
      // 旋转文字使其沿径向排列
      const rotation = angle;
      return (
        <text
          key={`${text}-${i}`}
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={fontSize}
          fontWeight={fontWeight}
          transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
        >
          {char}
        </text>
      );
    });
  };

  if (!yearInfo) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const keYun = yearInfo.keYun || [];

  return (
    <div className="w-full flex flex-col items-center">
      {/* 信息卡片 */}
      <div className="w-full max-w-md mb-6 relative">
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-amber-600 to-amber-400 rounded-l-sm" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-amber-600 to-amber-400 rounded-r-sm" />
        <div className="bg-amber-50 border-y-2 border-amber-300 px-6 py-4 mx-2">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">岁运</span>
              <span className="font-semibold text-amber-900">{yearInfo.taiGuoBuJi}{yearInfo.zhongYun}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">{yearInfo.ganZhi}年</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">当前</span>
              <span className="font-semibold text-amber-900">{['初运', '二运', '三运', '四运', '终运'][currentYunIndex]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">五行</span>
              <span className="font-semibold text-amber-900">{yearInfo.wuXing}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 五运圆盘 */}
      <div className="relative w-full overflow-x-auto flex justify-center pb-4">
        <svg width={size + 120} height={size + 120} viewBox={`-60 -60 ${size + 120} ${size + 120}`} className="min-w-[400px] max-w-full">
          <defs>
            <radialGradient id="sunGradW" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="40%" stopColor="#fcd34d" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="sunGlowW">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* 外圈边框 */}
          <circle cx={center} cy={center} r={outerR + 2} fill="none" stroke="#d4a574" strokeWidth="2.5" />

          {/* 五运扇形 */}
          {ZHU_YUN_ORDER.map((xing, i) => {
            const a1 = -90 + i * 72;
            const a2 = a1 + 72;
            const mid = a1 + 36;
            const isCurrent = i === currentYunIndex;
            const keYunItem = keYun[i];
            const keXing = keYunItem?.xing || xing;

            return (
              <g key={i}>
                {/* 客运外圈 */}
                <path d={sectorPath(center, center, midR, outerR, a1, a2)}
                  fill={WUXING_COLORS[keXing].bg} stroke="#fff" strokeWidth="2"
                  opacity={isCurrent ? 1 : 0.8} />
                {/* 主运中圈 */}
                <path d={sectorPath(center, center, innerR, midR, a1, a2)}
                  fill={WUXING_COLORS[xing].bg} stroke="#fff" strokeWidth="2"
                  opacity={isCurrent ? 1 : 0.8} />
                {/* 运序内圈 */}
                <path d={sectorPath(center, center, coreR, innerR, a1, a2)}
                  fill={isCurrent ? '#fef3c7' : '#fafafa'} stroke="#e5e5e5" strokeWidth="1" />

                {/* 客运文字 - 沿弧排列 */}
                {renderArcText(
                  `客:${keYunItem?.taiGuoBuJi === '太过' ? '太' : '少'}${KE_YUN_NAMES[keXing]}`,
                  center, center, (midR + outerR) / 2,
                  a1, a2, WUXING_COLORS[keXing].text, 13
                )}

                {/* 主运文字 - 沿弧排列 */}
                {renderArcText(
                  `主:${xing === '木' ? '太角' : xing === '火' ? '少徵' : xing === '土' ? '太宫' : xing === '金' ? '少商' : '太羽'}`,
                  center, center, (innerR + midR) / 2,
                  a1, a2, WUXING_COLORS[xing].text, 13
                )}

                {/* 运序 */}
                {(() => {
                  const pos = polarToXY(center, center, (coreR + innerR) / 2, mid);
                  const names = ['初运', '二运', '三运', '四运', '终运'];
                  return (
                    <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                      fill={isCurrent ? '#92400e' : '#888'} fontSize="13" fontWeight={isCurrent ? '700' : '500'}>
                      {names[i]}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* 中心太阳 */}
          <circle cx={center} cy={center} r={coreR - 8} fill="url(#sunGradW)" filter="url(#sunGlowW)" />

          {/* 24节气 */}
          {JIE_QI.map((jq, i) => {
            const angle = -90 + i * 15;
            const isYunStart = YUN_START_JIEQI.includes(i);
            const nameR = outerR + 22;
            const pos = polarToXY(center, center, nameR, angle);
            const rotation = angle > 0 && angle < 180 ? angle + 90 : angle - 90;

            return (
              <g key={i}>
                {/* 刻度线 */}
                {(() => {
                  const inner = polarToXY(center, center, outerR, angle);
                  const outer = polarToXY(center, center, outerR + (isYunStart ? 8 : 4), angle);
                  return <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                    stroke={isYunStart ? '#92400e' : '#ccc'} strokeWidth={isYunStart ? 2 : 1} />;
                })()}
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                  fill={isYunStart ? '#92400e' : '#999'} fontSize={isYunStart ? 11 : 9}
                  fontWeight={isYunStart ? '600' : '400'}
                  transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}>
                  {jq.name}
                </text>
                {isYunStart && (() => {
                  const dateR = outerR + 40;
                  const dp = polarToXY(center, center, dateR, angle);
                  return (
                    <text x={dp.x} y={dp.y} textAnchor="middle" dominantBaseline="middle"
                      fill="#92400e" fontSize="9"
                      transform={`rotate(${rotation}, ${dp.x}, ${dp.y})`}>
                      {String(jq.month).padStart(2, '0')}/{String(jq.day).padStart(2, '0')}
                    </text>
                  );
                })()}
              </g>
            );
          })}

          {/* 动态日期指示圆点 */}
          {(() => {
            const pos = polarToXY(center, center, outerR + 12, dateAngle);
            return (
              <g>
                <circle cx={pos.x} cy={pos.y} r="7" fill="#ef4444" opacity="0.3" />
                <circle cx={pos.x} cy={pos.y} r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
              </g>
            );
          })()}
        </svg>
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        {ZHU_YUN_ORDER.map(xing => (
          <div key={xing} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: WUXING_COLORS[xing].bg }} />
            <span className="text-muted-foreground">{xing}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground text-xs">当前日期</span>
        </div>
      </div>
    </div>
  );
}
