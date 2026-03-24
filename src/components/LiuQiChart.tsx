import { useMemo } from 'react';
import { YearInfo, getCurrentQi } from '@/lib/wuyun-liuqi';

interface LiuQiChartProps {
  yearInfo: YearInfo;
}

const ZHU_QI_ORDER = ['厥阴风木', '少阴君火', '少阳相火', '太阴湿土', '阳明燥金', '太阳寒水'];

const LIU_QI_COLORS: Record<string, { bg: string; text: string }> = {
  '厥阴风木': { bg: '#A8D8B9', text: '#1a5c3a' },
  '少阴君火': { bg: '#F5B7B1', text: '#922b21' },
  '少阳相火': { bg: '#FADBD8', text: '#943126' },
  '太阴湿土': { bg: '#F9E79F', text: '#7d6608' },
  '阳明燥金': { bg: '#F5CBA7', text: '#935116' },
  '太阳寒水': { bg: '#AED6F1', text: '#1a5276' },
};

const QI_WUXING: Record<string, string> = {
  '厥阴风木': '木', '少阴君火': '火', '少阳相火': '火',
  '太阴湿土': '土', '阳明燥金': '金', '太阳寒水': '水',
};

const SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

// 24节气
const JIE_QI = [
  { name: '大寒', month: 1, day: 20 },
  { name: '立春', month: 2, day: 4 },
  { name: '雨水', month: 2, day: 19 },
  { name: '惊蛰', month: 3, day: 6 },
  { name: '春分', month: 3, day: 20 },
  { name: '清明', month: 4, day: 5 },
  { name: '谷雨', month: 4, day: 20 },
  { name: '立夏', month: 5, day: 6 },
  { name: '小满', month: 5, day: 21 },
  { name: '芒种', month: 6, day: 6 },
  { name: '夏至', month: 6, day: 21 },
  { name: '小暑', month: 7, day: 7 },
  { name: '大暑', month: 7, day: 22 },
  { name: '立秋', month: 8, day: 8 },
  { name: '处暑', month: 8, day: 23 },
  { name: '白露', month: 9, day: 8 },
  { name: '秋分', month: 9, day: 22 },
  { name: '寒露', month: 10, day: 8 },
  { name: '霜降', month: 10, day: 24 },
  { name: '立冬', month: 11, day: 8 },
  { name: '小雪', month: 11, day: 22 },
  { name: '大雪', month: 12, day: 7 },
  { name: '冬至', month: 12, day: 22 },
  { name: '小寒', month: 1, day: 6 },
];

const QI_START_JIEQI = [0, 4, 8, 12, 16, 20]; // 每气起始节气

function getDayOfYear(m: number, d: number): number {
  const dim = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let t = 0;
  for (let i = 1; i < m; i++) t += dim[i];
  return t + d;
}

function getCurrentDateAngle(): number {
  const now = new Date();
  const doy = getDayOfYear(now.getMonth() + 1, now.getDate());
  const daHanDOY = getDayOfYear(1, 20);
  let diff = doy - daHanDOY;
  if (diff < 0) diff += 365;
  return (diff / 365) * 360 - 90;
}

function getRelation(zhu: string, ke: string) {
  const zw = QI_WUXING[zhu], kw = QI_WUXING[ke];
  if (zw === kw) return { text: '相得', color: '#16a34a' };
  if (SHENG[kw] === zw) return { text: '顺', color: '#2563eb' };
  if (KE[kw] === zw) return { text: '逆', color: '#dc2626' };
  if (SHENG[zw] === kw) return { text: '泄', color: '#ea580c' };
  if (KE[zw] === kw) return { text: '胜', color: '#7c3aed' };
  return { text: '和', color: '#64748b' };
}

export default function LiuQiChart({ yearInfo }: LiuQiChartProps) {
  const size = 600;
  const center = size / 2;
  const outerR = 230;
  const midR = 175;
  const innerR = 120;
  const coreR = 60;

  const keQiOrder = useMemo(() => {
    if (!yearInfo) return ZHU_QI_ORDER;
    const siTianIdx = ZHU_QI_ORDER.indexOf(yearInfo.siTian);
    const start = (siTianIdx - 2 + 6) % 6;
    return Array.from({ length: 6 }, (_, i) => ZHU_QI_ORDER[(start + i) % 6]);
  }, [yearInfo]);

  const currentQiInfo = getCurrentQi();
  const currentQiIndex = currentQiInfo.index;
  const dateAngle = useMemo(() => getCurrentDateAngle(), []);

  const polarToXY = (cx: number, cy: number, r: number, a: number) => {
    const rad = (a - 90) * Math.PI / 180;
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

  // 沿弧线排列文字
  const renderArcText = (text: string, cx: number, cy: number, r: number, a1: number, a2: number, color: string, fs: number, fw = '700') => {
    const mid = (a1 + a2) / 2;
    const chars = text.split('');
    const span = Math.min(chars.length * 11, (a2 - a1) * 0.75);
    const cSpan = span / chars.length;
    const start = mid - span / 2 + cSpan / 2;

    return chars.map((c, i) => {
      const angle = start + i * cSpan;
      const pos = polarToXY(cx, cy, r, angle);
      return (
        <text key={`${text}-${i}`} x={pos.x} y={pos.y}
          textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={fs} fontWeight={fw}
          transform={`rotate(${angle}, ${pos.x}, ${pos.y})`}>
          {c}
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
              <span className="text-amber-800">司天</span>
              <span className="font-semibold text-amber-900">{yearInfo.siTian}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">当前</span>
              <span className="font-semibold text-amber-900">{currentQiInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">在泉</span>
              <span className="font-semibold text-amber-900">{yearInfo.zaiQuan}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">节气</span>
              <span className="font-semibold text-amber-900">{currentQiInfo.jieQiRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 六气圆盘 */}
      <div className="relative w-full overflow-x-auto flex justify-center pb-4">
        <svg width={size + 120} height={size + 120} viewBox={`-60 -60 ${size + 120} ${size + 120}`} className="min-w-[400px] max-w-full">
          <defs>
            <radialGradient id="sunGradQ" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="40%" stopColor="#fcd34d" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="sunGlowQ">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* 外圈边框 */}
          <circle cx={center} cy={center} r={outerR + 2} fill="none" stroke="#d4a574" strokeWidth="2.5" />

          {/* 六气扇形 */}
          {ZHU_QI_ORDER.map((zhuQi, i) => {
            const a1 = -90 + i * 60;
            const a2 = a1 + 60;
            const mid = a1 + 30;
            const keQi = keQiOrder[i];
            const relation = getRelation(zhuQi, keQi);
            const isCurrent = i === currentQiIndex;
            const isSiTian = i === 2;
            const isZaiQuan = i === 5;
            const qiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];

            return (
              <g key={i}>
                {/* 客气外圈 */}
                <path d={sectorPath(center, center, midR, outerR, a1, a2)}
                  fill={LIU_QI_COLORS[keQi].bg} stroke="#fff" strokeWidth="2"
                  opacity={isCurrent ? 1 : 0.8} />
                {/* 主气中圈 */}
                <path d={sectorPath(center, center, innerR, midR, a1, a2)}
                  fill={LIU_QI_COLORS[zhuQi].bg} stroke="#fff" strokeWidth="2"
                  opacity={isCurrent ? 1 : 0.8} />
                {/* 气序内圈 */}
                <path d={sectorPath(center, center, coreR, innerR, a1, a2)}
                  fill={isCurrent ? '#fef3c7' : '#fafafa'} stroke="#e5e5e5" strokeWidth="1" />

                {/* 客气文字 - 沿弧排列 */}
                {renderArcText(
                  `客:${keQi}`,
                  center, center, (midR + outerR) / 2 - 5,
                  a1, a2, LIU_QI_COLORS[keQi].text, 11
                )}

                {/* 客主关系标签 */}
                {(() => {
                  const labelR = (midR + outerR) / 2 + 14;
                  const pos = polarToXY(center, center, labelR, mid);
                  return (
                    <g>
                      <rect x={pos.x - 18} y={pos.y - 8} width="36" height="16" rx="3"
                        fill={relation.color} opacity="0.9" />
                      <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                        fill="#fff" fontSize="10" fontWeight="700">
                        {relation.text}
                      </text>
                    </g>
                  );
                })()}

                {/* 主气文字 - 沿弧排列 */}
                {renderArcText(
                  `主:${zhuQi}`,
                  center, center, (innerR + midR) / 2,
                  a1, a2, LIU_QI_COLORS[zhuQi].text, 12
                )}

                {/* 气序 */}
                {(() => {
                  const pos = polarToXY(center, center, (coreR + innerR) / 2, mid);
                  return (
                    <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                      fill={isCurrent ? '#92400e' : '#888'} fontSize="13"
                      fontWeight={isCurrent ? '700' : '500'}>
                      {qiNames[i]}
                    </text>
                  );
                })()}

                {/* 司天/在泉标记 */}
                {(isSiTian || isZaiQuan) && (() => {
                  const pos = polarToXY(center, center, outerR - 8, mid + 22);
                  return (
                    <g>
                      <rect x={pos.x - 14} y={pos.y - 9} width="28" height="18" rx="4"
                        fill={isSiTian ? '#f59e0b' : '#6b7280'} />
                      <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                        fill="#fff" fontSize="10" fontWeight="700">
                        {isSiTian ? '司天' : '在泉'}
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })}

          {/* 中心太阳 */}
          <circle cx={center} cy={center} r={coreR - 8} fill="url(#sunGradQ)" filter="url(#sunGlowQ)" />

          {/* 24节气 */}
          {JIE_QI.map((jq, i) => {
            const angle = -90 + i * 15;
            const isQiStart = QI_START_JIEQI.includes(i);
            const nameR = outerR + 22;
            const pos = polarToXY(center, center, nameR, angle);
            const rotation = angle > 0 && angle < 180 ? angle + 90 : angle - 90;

            return (
              <g key={i}>
                {/* 刻度线 */}
                {(() => {
                  const p1 = polarToXY(center, center, outerR, angle);
                  const p2 = polarToXY(center, center, outerR + (isQiStart ? 8 : 4), angle);
                  return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke={isQiStart ? '#92400e' : '#ccc'} strokeWidth={isQiStart ? 2 : 1} />;
                })()}
                <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
                  fill={isQiStart ? '#92400e' : '#999'} fontSize={isQiStart ? 11 : 9}
                  fontWeight={isQiStart ? '600' : '400'}
                  transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}>
                  {jq.name}
                </text>
                {isQiStart && (() => {
                  const dp = polarToXY(center, center, outerR + 40, angle);
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
      <div className="space-y-3">
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {ZHU_QI_ORDER.map(qi => (
            <div key={qi} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: LIU_QI_COLORS[qi].bg }} />
              <span className="text-muted-foreground text-xs">{qi}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs border-t pt-2">
          {[
            { text: '相得', color: '#16a34a' },
            { text: '顺', color: '#2563eb' },
            { text: '逆', color: '#dc2626' },
            { text: '泄', color: '#ea580c' },
            { text: '胜', color: '#7c3aed' },
          ].map(r => (
            <div key={r.text} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: r.color }} />
              <span className="text-muted-foreground">{r.text}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-muted-foreground">当前日期</span>
          </div>
        </div>
      </div>
    </div>
  );
}
