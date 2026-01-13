import { useMemo } from 'react';
import { WU_XING_ATTRIBUTES, LIU_QI_ATTRIBUTES, LIU_QI_ORDER, type LiuQi } from '@/lib/wuyun-liuqi';

interface YearInfo {
  year: number;
  gan: string;
  zhi: string;
  ganZhi: string;
  daYun: string;
  wuXing: string;
  taiGuoBuJi: string;
  siTian: LiuQi;
  zaiQuan: LiuQi;
  zhuQi: LiuQi[];
  keQi: LiuQi[];
}

interface Props {
  yearInfo: YearInfo;
  currentQiIndex: number;
}

export default function WuYunLiuQiChart({ yearInfo, currentQiIndex }: Props) {
  const size = 320;
  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius - 50;
  const centerRadius = 60;

  // 六气扇区
  const sectors = useMemo(() => {
    return LIU_QI_ORDER.map((qi, index) => {
      const startAngle = (index * 60 - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * 60 - 90) * (Math.PI / 180);
      const midAngle = (startAngle + endAngle) / 2;
      
      const element = LIU_QI_ATTRIBUTES[qi].element;
      const color = WU_XING_ATTRIBUTES[element].color;
      
      // 外圈路径
      const outerPath = describeArc(center, center, outerRadius, index * 60 - 90, (index + 1) * 60 - 90);
      
      // 内圈路径
      const innerPath = describeArc(center, center, innerRadius, index * 60 - 90, (index + 1) * 60 - 90);
      
      // 标签位置
      const labelRadius = (outerRadius + innerRadius) / 2;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      
      // 判断是否为司天或在泉
      const isSiTian = qi === yearInfo.siTian;
      const isZaiQuan = qi === yearInfo.zaiQuan;
      
      // 判断是否为当前时令
      const isCurrent = index === currentQiIndex;
      
      return {
        qi,
        index,
        element,
        color,
        outerPath,
        innerPath,
        labelX,
        labelY,
        midAngle,
        isSiTian,
        isZaiQuan,
        isCurrent,
        nature: LIU_QI_ATTRIBUTES[qi].nature,
      };
    });
  }, [yearInfo, currentQiIndex, center, innerRadius, outerRadius]);

  // 五行中心图
  const wuXingElements = useMemo(() => {
    const elements = ['木', '火', '土', '金', '水'] as const;
    return elements.map((xing, index) => {
      const angle = (index * 72 - 90) * (Math.PI / 180);
      const radius = centerRadius - 20;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isActive = xing === yearInfo.wuXing;
      
      return {
        xing,
        x,
        y,
        color: WU_XING_ATTRIBUTES[xing].color,
        isActive,
      };
    });
  }, [yearInfo.wuXing, center, centerRadius]);

  return (
    <div className="flex flex-col items-center">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
        <defs>
          {/* 渐变定义 */}
          {sectors.map((sector) => (
            <radialGradient
              key={`grad-${sector.index}`}
              id={`sector-gradient-${sector.index}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor={sector.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={sector.color} stopOpacity="0.8" />
            </radialGradient>
          ))}
          
          {/* 发光效果 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 外圈背景 */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 六气扇区 */}
        {sectors.map((sector) => (
          <g key={sector.index} className="transition-all duration-300">
            {/* 扇区背景 */}
            <path
              d={sector.outerPath}
              fill={`url(#sector-gradient-${sector.index})`}
              stroke={sector.color}
              strokeWidth={sector.isCurrent ? 3 : 1}
              className={`transition-all duration-300 ${sector.isCurrent ? 'animate-pulse-glow' : ''}`}
              style={{
                filter: sector.isCurrent ? 'url(#glow)' : undefined,
                opacity: sector.isSiTian || sector.isZaiQuan ? 1 : 0.7,
              }}
            />
            
            {/* 六气名称 */}
            <text
              x={sector.labelX}
              y={sector.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif text-xs fill-foreground"
              style={{ fontSize: '11px' }}
            >
              {sector.qi.slice(0, 2)}
            </text>
            
            {/* 司天/在泉标记 */}
            {(sector.isSiTian || sector.isZaiQuan) && (
              <text
                x={sector.labelX}
                y={sector.labelY + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium"
                style={{ 
                  fontSize: '9px',
                  fill: sector.isSiTian ? 'hsl(var(--primary))' : 'hsl(var(--accent))'
                }}
              >
                {sector.isSiTian ? '司天' : '在泉'}
              </text>
            )}
          </g>
        ))}

        {/* 内圈 */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 中心圆 */}
        <circle
          cx={center}
          cy={center}
          r={centerRadius}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 五行元素 */}
        {wuXingElements.map((el) => (
          <g key={el.xing}>
            <circle
              cx={el.x}
              cy={el.y}
              r={el.isActive ? 14 : 10}
              fill={el.color}
              opacity={el.isActive ? 1 : 0.5}
              className={`transition-all duration-300 ${el.isActive ? 'animate-pulse-glow' : ''}`}
            />
            <text
              x={el.x}
              y={el.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif text-xs"
              style={{ 
                fill: el.xing === '金' ? '#333' : '#fff',
                fontSize: el.isActive ? '11px' : '9px'
              }}
            >
              {el.xing}
            </text>
          </g>
        ))}

        {/* 中心干支 */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-serif text-lg fill-foreground"
        >
          {yearInfo.ganZhi}
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-muted-foreground"
        >
          {yearInfo.daYun}
        </text>
      </svg>

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>司天</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span>在泉</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border-2 border-foreground animate-pulse" />
          <span>当前时令</span>
        </div>
      </div>
    </div>
  );
}

// 绘制圆弧路径的辅助函数
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  const innerRadius = radius - 50;
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', innerEnd.x, innerEnd.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
    'Z',
  ].join(' ');
}
