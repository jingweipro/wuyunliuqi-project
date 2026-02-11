import { useMemo } from 'react';
import { YearInfo, WU_XING_COLORS } from '@/lib/wuyun-liuqi';

interface WuYunChartProps {
  yearInfo: YearInfo;
  currentQiIndex?: number;
}

// 主运顺序（固定）
const ZHU_YUN_ORDER = ['木', '火', '土', '金', '水'];
const ZHU_YUN_NAMES = ['太角', '太徵', '太宫', '太商', '太羽'];

// 客运音名
const KE_YUN_NAMES: Record<string, string> = {
  '木': '角', '火': '徵', '土': '宫', '金': '商', '水': '羽'
};

// 五行颜色（更柔和的配色）
const WUXING_COLORS: Record<string, { bg: string; text: string }> = {
  '木': { bg: '#A8D8B9', text: '#1a5c3a' },
  '火': { bg: '#F5B7B1', text: '#922b21' },
  '土': { bg: '#F9E79F', text: '#7d6608' },
  '金': { bg: '#D5D8DC', text: '#515a5a' },
  '水': { bg: '#AED6F1', text: '#1a5276' },
};

// 24节气数据
const JIE_QI_DATA = [
  { name: '大寒', date: '01/20' },
  { name: '立春', date: '02/04' },
  { name: '雨水', date: '02/19' },
  { name: '惊蛰', date: '03/06' },
  { name: '春分', date: '03/21' },
  { name: '清明', date: '04/05' },
  { name: '谷雨', date: '04/20' },
  { name: '立夏', date: '05/06' },
  { name: '小满', date: '05/21' },
  { name: '芒种', date: '06/06' },
  { name: '夏至', date: '06/21' },
  { name: '小暑', date: '07/07' },
  { name: '大暑', date: '07/23' },
  { name: '立秋', date: '08/08' },
  { name: '处暑', date: '08/23' },
  { name: '白露', date: '09/08' },
  { name: '秋分', date: '09/23' },
  { name: '寒露', date: '10/08' },
  { name: '霜降', date: '10/24' },
  { name: '立冬', date: '11/08' },
  { name: '小雪', date: '11/22' },
  { name: '大雪', date: '12/07' },
  { name: '冬至', date: '12/22' },
  { name: '小寒', date: '01/06' },
];

// 五运对应的节气起始索引（每运约73天，对应约5个节气）
const YUN_JIE_QI_START = [0, 5, 10, 14, 19]; // 大寒、清明、夏至后、立秋后、立冬后

export default function WuYunChart({ yearInfo, currentQiIndex }: WuYunChartProps) {
  const size = 400;
  const center = size / 2;
  const outerRadius = 170;
  const middleRadius = 130;
  const innerRadius = 85;
  const centerRadius = 45;

  // 计算客运顺序
  const keYunOrder = useMemo(() => {
    if (!yearInfo) return ZHU_YUN_ORDER;
    const startXing = yearInfo.wuXing;
    const startIndex = ZHU_YUN_ORDER.indexOf(startXing);
    const order: string[] = [];
    for (let i = 0; i < 5; i++) {
      order.push(ZHU_YUN_ORDER[(startIndex + i) % 5]);
    }
    return order;
  }, [yearInfo]);

  // 获取客运名称（太/少）
  const getKeYunName = (xing: string, index: number) => {
    const yinName = KE_YUN_NAMES[xing];
    // 根据太过不及判断太/少
    const isTaiGuo = yearInfo?.taiGuoBuJi === '太过';
    // 奇数位为太，偶数位为少（或相反）
    const isTai = isTaiGuo ? (index % 2 === 0) : (index % 2 === 1);
    return isTai ? `太${yinName}` : `少${yinName}`;
  };

  // 绘制扇形路径
  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const radian = (angle - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(radian),
      y: cy + r * Math.sin(radian)
    };
  };

  // 绘制扇形区域
  const describeSector = (cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) => {
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
    const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
    const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', outerStart.x, outerStart.y,
      'A', outerR, outerR, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  // 计算当前运的索引
  const currentYunIndex = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // 根据日期判断当前运
    if ((month === 1 && day >= 20) || month === 2 || (month === 3 && day < 21)) return 0;
    if ((month === 3 && day >= 21) || month === 4 || (month === 5 && day < 21)) return 1;
    if ((month === 5 && day >= 21) || month === 6 || (month === 7 && day < 23)) return 2;
    if ((month === 7 && day >= 23) || month === 8 || (month === 9 && day < 23)) return 3;
    if ((month === 9 && day >= 23) || month === 10 || month === 11 || (month === 12 && day < 22)) return 4;
    return 0;
  }, []);

  // 空值检查（放在所有hooks之后）
  if (!yearInfo) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
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
              <span className="font-semibold text-amber-900">{['初', '二', '三', '四', '五'][currentYunIndex]}之运</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">在泉</span>
              <span className="font-semibold text-amber-900">{yearInfo.zaiQuan}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-amber-800">五行</span>
              <span className="font-semibold text-amber-900">{yearInfo.wuXing}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 五运圆盘图 */}
      <div className="relative" style={{ width: size + 100, height: size + 100 }}>
        <svg width={size + 100} height={size + 100} className="overflow-visible">
          <defs>
            {/* 中心太阳渐变 */}
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff7ed" />
              <stop offset="40%" stopColor="#fcd34d" />
              <stop offset="70%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>
            <filter id="sunGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(50, 50)`}>
            {/* 外圈边框 */}
            <circle cx={center} cy={center} r={outerRadius + 2} fill="none" stroke="#d4a574" strokeWidth="3" />
            
            {/* 绘制五运扇形 - 从上方（大寒）开始 */}
            {[0, 1, 2, 3, 4].map((i) => {
              const startAngle = -90 + i * 72;
              const endAngle = startAngle + 72;
              const midAngle = startAngle + 36;
              const zhuXing = ZHU_YUN_ORDER[i];
              const keXing = keYunOrder[i];
              const isCurrent = i === currentYunIndex;
              
              return (
                <g key={i}>
                  {/* 客运（外圈） */}
                  <path
                    d={describeSector(center, center, middleRadius, outerRadius, startAngle, endAngle)}
                    fill={WUXING_COLORS[keXing].bg}
                    stroke="#fff"
                    strokeWidth="2"
                    opacity={isCurrent ? 1 : 0.85}
                  />
                  {/* 主运（中圈） */}
                  <path
                    d={describeSector(center, center, innerRadius, middleRadius, startAngle, endAngle)}
                    fill={WUXING_COLORS[zhuXing].bg}
                    stroke="#fff"
                    strokeWidth="2"
                    opacity={isCurrent ? 1 : 0.85}
                  />
                  {/* 运序（内圈） */}
                  <path
                    d={describeSector(center, center, centerRadius, innerRadius, startAngle, endAngle)}
                    fill={isCurrent ? '#fef3c7' : '#fff'}
                    stroke="#e5e5e5"
                    strokeWidth="1"
                  />
                  
                  {/* 客运文字 */}
                  {(() => {
                    const textR = (middleRadius + outerRadius) / 2;
                    const pos = polarToCartesian(center, center, textR, midAngle);
                    const rotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
                    return (
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={WUXING_COLORS[keXing].text}
                        fontSize="13"
                        fontWeight="600"
                        transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
                      >
                        客:{getKeYunName(keXing, i)}
                      </text>
                    );
                  })()}
                  
                  {/* 主运文字 */}
                  {(() => {
                    const textR = (innerRadius + middleRadius) / 2;
                    const pos = polarToCartesian(center, center, textR, midAngle);
                    const rotation = midAngle > 90 && midAngle < 270 ? midAngle + 180 : midAngle;
                    return (
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={WUXING_COLORS[zhuXing].text}
                        fontSize="13"
                        fontWeight="600"
                        transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
                      >
                        主:{ZHU_YUN_NAMES[i]}
                      </text>
                    );
                  })()}
                  
                  {/* 运序文字 */}
                  {(() => {
                    const textR = (centerRadius + innerRadius) / 2;
                    const pos = polarToCartesian(center, center, textR, midAngle);
                    const yunNames = ['初之运', '二之运', '三之运', '四之运', '五之运'];
                    return (
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={isCurrent ? '#92400e' : '#666'}
                        fontSize="11"
                        fontWeight={isCurrent ? '700' : '500'}
                      >
                        {yunNames[i]}
                      </text>
                    );
                  })()}
                </g>
              );
            })}
            
            {/* 中心太阳 */}
            <circle
              cx={center}
              cy={center}
              r={centerRadius - 5}
              fill="url(#sunGradient)"
              filter="url(#sunGlow)"
            />
            
            {/* 24节气 */}
            {JIE_QI_DATA.map((jq, i) => {
              const angle = -90 + (i * 15);
              const nameR = outerRadius + 25;
              const dateR = outerRadius + 42;
              const namePos = polarToCartesian(center, center, nameR, angle);
              const datePos = polarToCartesian(center, center, dateR, angle);
              
              // 判断是否为运的起始节气
              const isYunStart = [0, 6, 12, 17, 22].includes(i);
              
              return (
                <g key={i}>
                  <text
                    x={namePos.x}
                    y={namePos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isYunStart ? '#92400e' : '#666'}
                    fontSize={isYunStart ? '12' : '11'}
                    fontWeight={isYunStart ? '600' : '400'}
                    transform={`rotate(${angle}, ${namePos.x}, ${namePos.y})`}
                  >
                    {jq.name}
                  </text>
                  {isYunStart && (
                    <text
                      x={datePos.x}
                      y={datePos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#92400e"
                      fontSize="10"
                      transform={`rotate(${angle}, ${datePos.x}, ${datePos.y})`}
                    >
                      {jq.date}
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* 当前运指示点 */}
            {(() => {
              const angle = -90 + currentYunIndex * 72;
              const pos = polarToCartesian(center, center, outerRadius + 8, angle);
              return (
                <circle cx={pos.x} cy={pos.y} r="5" fill="#d97706" stroke="#fff" strokeWidth="2" />
              );
            })()}
          </g>
        </svg>
      </div>

      {/* 图例说明 */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        {ZHU_YUN_ORDER.map((xing) => (
          <div key={xing} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: WUXING_COLORS[xing].bg }}
            />
            <span className="text-muted-foreground">{xing}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
