import { useMemo } from 'react';
import { YearInfo, LIU_QI, getCurrentQi } from '@/lib/wuyun-liuqi';
interface LiuQiChartProps {
  yearInfo: YearInfo;
}

// 六气颜色
const LIU_QI_COLORS: Record<string, {
  bg: string;
  text: string;
}> = {
  '厥阴风木': {
    bg: '#A8D8B9',
    text: '#1a5c3a'
  },
  '少阴君火': {
    bg: '#F5B7B1',
    text: '#922b21'
  },
  '少阳相火': {
    bg: '#FADBD8',
    text: '#943126'
  },
  '太阴湿土': {
    bg: '#F9E79F',
    text: '#7d6608'
  },
  '阳明燥金': {
    bg: '#F5CBA7',
    text: '#935116'
  },
  '太阳寒水': {
    bg: '#AED6F1',
    text: '#1a5276'
  }
};

// 主气固定顺序
const ZHU_QI_ORDER = ['厥阴风木', '少阴君火', '少阳相火', '太阴湿土', '阳明燥金', '太阳寒水'];

// 六气简称
const QI_SHORT_NAMES: Record<string, string> = {
  '厥阴风木': '厥阴风木',
  '少阴君火': '少阴君火',
  '少阳相火': '少阳相火',
  '太阴湿土': '太阴湿土',
  '阳明燥金': '阳明燥金',
  '太阳寒水': '太阳寒水'
};

// 24节气对应六气时段
const QI_JIE_QI = [{
  name: '大寒',
  date: '01/20'
}, {
  name: '立春',
  date: '02/04'
}, {
  name: '雨水',
  date: '02/19'
}, {
  name: '惊蛰',
  date: '03/06'
}, {
  name: '春分',
  date: '03/20'
}, {
  name: '清明',
  date: '04/05'
}, {
  name: '谷雨',
  date: '04/20'
}, {
  name: '立夏',
  date: '05/06'
}, {
  name: '小满',
  date: '05/20'
}, {
  name: '芒种',
  date: '06/06'
}, {
  name: '夏至',
  date: '06/21'
}, {
  name: '小暑',
  date: '07/07'
}, {
  name: '大暑',
  date: '07/22'
}, {
  name: '立秋',
  date: '08/08'
}, {
  name: '处暑',
  date: '08/23'
}, {
  name: '白露',
  date: '09/08'
}, {
  name: '秋分',
  date: '09/22'
}, {
  name: '寒露',
  date: '10/08'
}, {
  name: '霜降',
  date: '10/24'
}, {
  name: '立冬',
  date: '11/08'
}, {
  name: '小雪',
  date: '11/22'
}, {
  name: '大雪',
  date: '12/07'
}, {
  name: '冬至',
  date: '12/22'
}, {
  name: '小寒',
  date: '01/06'
}];

// 每气起始节气索引
const QI_START_JIEQI = [0, 4, 8, 12, 16, 20];
export default function LiuQiChart({
  yearInfo
}: LiuQiChartProps) {
  const size = 400;
  const center = size / 2;
  const outerRadius = 170;
  const middleRadius = 130;
  const innerRadius = 85;
  const centerRadius = 45;

  // 计算客气顺序（以司天为三之气）
  const keQiOrder = useMemo(() => {
    if (!yearInfo) return ZHU_QI_ORDER;
    const siTianIndex = ZHU_QI_ORDER.indexOf(yearInfo.siTian);
    const order: string[] = [];
    // 三之气是司天，往前推2位得到初之气
    const startIndex = (siTianIndex - 2 + 6) % 6;
    for (let i = 0; i < 6; i++) {
      order.push(ZHU_QI_ORDER[(startIndex + i) % 6]);
    }
    return order;
  }, [yearInfo]);

  // 计算客主关系
  const getKeZhuRelation = (zhuQi: string, keQi: string) => {
    if (zhuQi === keQi) return {
      text: '相得',
      type: 'same'
    };

    // 简化的相生相克判断
    const zhuIndex = ZHU_QI_ORDER.indexOf(zhuQi);
    const keIndex = ZHU_QI_ORDER.indexOf(keQi);
    const diff = (keIndex - zhuIndex + 6) % 6;
    if (diff === 1 || diff === 2) return {
      text: '顺',
      type: 'shun'
    };
    return {
      text: '逆',
      type: 'ni'
    };
  };

  // 获取当前气
  const currentQiInfo = getCurrentQi();
  const currentQiIndex = currentQiInfo.index;
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const radian = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(radian),
      y: cy + r * Math.sin(radian)
    };
  };
  const describeSector = (cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) => {
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
    const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
    const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', outerStart.x, outerStart.y, 'A', outerR, outerR, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y, 'L', innerEnd.x, innerEnd.y, 'A', innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y, 'Z'].join(' ');
  };

  // 空值检查（放在所有hooks之后）
  if (!yearInfo) {
    return <div className="w-full flex items-center justify-center py-20">
        <div className="text-muted-foreground">加载中...</div>
      </div>;
  }
  return <div className="w-full flex flex-col items-center">
      {/* 信息卡片 - 卷轴样式 */}
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

      {/* 六气圆盘图 */}
      <div className="relative" style={{
      width: size + 100,
      height: size + 100
    }}>
        <svg width={size + 100} height={size + 100} className="overflow-visible">
          <defs>
            <radialGradient id="sunGradient2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="40%" stopColor="#fcd34d" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="sunGlow2">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(50, 50)`}>
            {/* 外圈边框 */}
            <circle cx={center} cy={center} r={outerRadius + 2} fill="none" stroke="#d4a574" strokeWidth="3" />
            
            {/* 绘制六气扇形 */}
            {[0, 1, 2, 3, 4, 5].map(i => {
            const startAngle = -90 + i * 60;
            const endAngle = startAngle + 60;
            const midAngle = startAngle + 30;
            const zhuQi = ZHU_QI_ORDER[i];
            const keQi = keQiOrder[i];
            const relation = getKeZhuRelation(zhuQi, keQi);
            const isCurrent = i === currentQiIndex;
            const isSiTian = i === 2; // 三之气为司天
            const isZaiQuan = i === 5; // 终之气为在泉

            return <g key={i}>
                  {/* 客气（外圈） */}
                  <path d={describeSector(center, center, middleRadius, outerRadius, startAngle, endAngle)} fill={LIU_QI_COLORS[keQi].bg} stroke="#fff" strokeWidth="2" opacity={isCurrent ? 1 : 0.85} />
                  {/* 主气（中圈） */}
                  <path d={describeSector(center, center, innerRadius, middleRadius, startAngle, endAngle)} fill={LIU_QI_COLORS[zhuQi].bg} stroke="#fff" strokeWidth="2" opacity={isCurrent ? 1 : 0.85} />
                  {/* 气序（内圈） */}
                  <path d={describeSector(center, center, centerRadius, innerRadius, startAngle, endAngle)} fill={isCurrent ? '#fef3c7' : '#fff'} stroke="#e5e5e5" strokeWidth="1" />
                  
                  {/* 客气文字 */}
                  {(() => {
                const textR = (middleRadius + outerRadius) / 2 - 5;
                const pos = polarToCartesian(center, center, textR, midAngle);
                const rotation = midAngle;
                const adjustedRotation = rotation > 90 && rotation < 270 ? rotation + 180 : rotation;
                return <g>
                        <text x={pos.x} y={pos.y - 8} textAnchor="middle" dominantBaseline="middle" fill={LIU_QI_COLORS[keQi].text} fontSize="11" fontWeight="600" transform={`rotate(${adjustedRotation}, ${pos.x}, ${pos.y - 8})`}>
                          客:{keQi.slice(0, 4)}
                        </text>
                        <text x={pos.x} y={pos.y + 8} textAnchor="middle" dominantBaseline="middle" fill={relation.type === 'ni' ? '#dc2626' : '#16a34a'} fontSize="10" fontWeight="500" transform={`rotate(${adjustedRotation}, ${pos.x}, ${pos.y + 8})`} className="pt-[0px] pr-[1px] pb-[0px] pl-[1px] mt-[0px] mr-[0px] mb-[0px] ml-[0px]">
                          {relation.text},{relation.type === 'ni' ? '逆' : '顺'}
                        </text>
                      </g>;
              })()}
                  
                  {/* 主气文字 */}
                  {(() => {
                const textR = (innerRadius + middleRadius) / 2;
                const pos = polarToCartesian(center, center, textR, midAngle);
                const rotation = midAngle;
                const adjustedRotation = rotation > 90 && rotation < 270 ? rotation + 180 : rotation;
                return <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={LIU_QI_COLORS[zhuQi].text} fontSize="11" fontWeight="600" transform={`rotate(${adjustedRotation}, ${pos.x}, ${pos.y})`}>
                        主:{zhuQi.slice(0, 4)}
                      </text>;
              })()}
                  
                  {/* 气序文字 */}
                  {(() => {
                const textR = (centerRadius + innerRadius) / 2;
                const pos = polarToCartesian(center, center, textR, midAngle);
                const qiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];
                return <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={isCurrent ? '#92400e' : '#666'} fontSize="10" fontWeight={isCurrent ? '700' : '500'}>
                        {qiNames[i]}
                      </text>;
              })()}
                  
                  {/* 司天/在泉标记 */}
                  {(isSiTian || isZaiQuan) && (() => {
                const labelR = outerRadius - 8;
                const pos = polarToCartesian(center, center, labelR, midAngle + 20);
                return <g>
                        <rect x={pos.x - 14} y={pos.y - 10} width="28" height="20" rx="3" fill={isSiTian ? '#fbbf24' : '#a3a3a3'} />
                        <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="11" fontWeight="700">
                          {isSiTian ? '司天' : '在泉'}
                        </text>
                      </g>;
              })()}
                </g>;
          })}
            
            {/* 中心太阳 */}
            <circle cx={center} cy={center} r={centerRadius - 5} fill="url(#sunGradient2)" filter="url(#sunGlow2)" />
            
            {/* 24节气 */}
            {QI_JIE_QI.map((jq, i) => {
            const angle = -90 + i * 15;
            const nameR = outerRadius + 25;
            const dateR = outerRadius + 42;
            const namePos = polarToCartesian(center, center, nameR, angle);
            const datePos = polarToCartesian(center, center, dateR, angle);

            // 判断是否为气的起始节气
            const isQiStart = QI_START_JIEQI.includes(i);
            return <g key={i}>
                  <text x={namePos.x} y={namePos.y} textAnchor="middle" dominantBaseline="middle" fill={isQiStart ? '#92400e' : '#666'} fontSize={isQiStart ? '12' : '11'} fontWeight={isQiStart ? '600' : '400'} transform={`rotate(${angle}, ${namePos.x}, ${namePos.y})`}>
                    {jq.name}
                  </text>
                  {isQiStart && <text x={datePos.x} y={datePos.y} textAnchor="middle" dominantBaseline="middle" fill="#92400e" fontSize="10" transform={`rotate(${angle}, ${datePos.x}, ${datePos.y})`}>
                      {jq.date}
                    </text>}
                </g>;
          })}
            
            {/* 当前气指示点 */}
            {(() => {
            const angle = -90 + currentQiIndex * 60;
            const pos = polarToCartesian(center, center, outerRadius + 8, angle);
            return <circle cx={pos.x} cy={pos.y} r="5" fill="#d97706" stroke="#fff" strokeWidth="2" />;
          })()}
          </g>
        </svg>
      </div>

      {/* 图例说明 */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-sm max-w-md">
        {ZHU_QI_ORDER.map(qi => <div key={qi} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{
          backgroundColor: LIU_QI_COLORS[qi].bg
        }} />
            <span className="text-muted-foreground text-xs">{qi.slice(0, 4)}</span>
          </div>)}
      </div>
    </div>;
}