import { useMemo } from 'react';
import { 
  WU_XING_ATTRIBUTES, 
  LIU_QI_ATTRIBUTES, 
  LIU_QI_ORDER,
  QI_PERIODS,
  getCurrentQi,
  type LiuQi 
} from '@/lib/wuyun-liuqi';

interface Props {
  year: number;
  ganZhi: string;
  siTian: LiuQi;
  zaiQuan: LiuQi;
  zhuQi: LiuQi[];
  keQi: LiuQi[];
}

const QI_NAMES = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];

export default function LiuQiChart({ year, ganZhi, siTian, zaiQuan, zhuQi, keQi }: Props) {
  const size = 420;
  const center = size / 2;
  const outerRadius = size / 2 - 15;
  const jieQiRadius = outerRadius - 28;
  const qiNameRadius = jieQiRadius - 22;
  const zhuQiRadius = qiNameRadius - 28;
  const keQiRadius = zhuQiRadius - 32;
  const centerRadius = 50;

  const currentQiIndex = getCurrentQi();

  // 六气时段节气标记
  const jieQiMarks = useMemo(() => {
    return QI_PERIODS.map((period, index) => {
      const startAngle = index * 60 - 90;
      const endAngle = (index + 1) * 60 - 90;
      const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      
      // 起始节气位置
      const startRad = startAngle * (Math.PI / 180);
      const startX = center + (outerRadius - 14) * Math.cos(startRad);
      const startY = center + (outerRadius - 14) * Math.sin(startRad);
      
      // 中间位置（用于显示时段名称）
      const midX = center + qiNameRadius * Math.cos(midAngle);
      const midY = center + qiNameRadius * Math.sin(midAngle);
      
      return {
        ...period,
        index,
        startAngle,
        endAngle,
        startX,
        startY,
        midX,
        midY,
        isCurrent: index === currentQiIndex,
      };
    });
  }, [center, outerRadius, qiNameRadius, currentQiIndex]);

  // 主气扇区
  const zhuQiSectors = useMemo(() => {
    return zhuQi.map((qi, index) => {
      const startAngle = index * 60 - 90;
      const endAngle = (index + 1) * 60 - 90;
      const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      
      const element = LIU_QI_ATTRIBUTES[qi].element;
      const color = WU_XING_ATTRIBUTES[element].color;
      
      const labelRadius = (zhuQiRadius + keQiRadius) / 2 + 8;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      
      const isSiTian = qi === siTian && index === 2;
      const isZaiQuan = qi === zaiQuan && index === 5;
      
      return {
        qi,
        index,
        element,
        color,
        labelX,
        labelY,
        isSiTian,
        isZaiQuan,
        isCurrent: index === currentQiIndex,
        path: describeArc(center, center, zhuQiRadius, keQiRadius, startAngle, endAngle),
      };
    });
  }, [center, zhuQiRadius, keQiRadius, zhuQi, siTian, zaiQuan, currentQiIndex]);

  // 客气扇区
  const keQiSectors = useMemo(() => {
    return keQi.map((qi, index) => {
      const startAngle = index * 60 - 90;
      const endAngle = (index + 1) * 60 - 90;
      const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      
      const element = LIU_QI_ATTRIBUTES[qi].element;
      const color = WU_XING_ATTRIBUTES[element].color;
      
      const labelRadius = (keQiRadius + centerRadius) / 2 + 10;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      
      const isSiTian = index === 2; // 三之气为司天
      const isZaiQuan = index === 5; // 终之气为在泉
      
      return {
        qi,
        index,
        element,
        color,
        labelX,
        labelY,
        isSiTian,
        isZaiQuan,
        path: describeArc(center, center, keQiRadius, centerRadius + 15, startAngle, endAngle),
      };
    });
  }, [center, keQiRadius, centerRadius, keQi]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-serif text-lg mb-4 text-foreground">六气图</h3>
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
        <defs>
          <filter id="liuqi-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* 司天标记渐变 */}
          <linearGradient id="sitian-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          </linearGradient>
          
          {/* 在泉标记渐变 */}
          <linearGradient id="zaiquan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* 外圈 */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 六气时段分隔线和节气标记 */}
        {jieQiMarks.map((mark) => {
          const rad = mark.startAngle * (Math.PI / 180);
          const x1 = center + outerRadius * Math.cos(rad);
          const y1 = center + outerRadius * Math.sin(rad);
          const x2 = center + (centerRadius + 15) * Math.cos(rad);
          const y2 = center + (centerRadius + 15) * Math.sin(rad);
          
          return (
            <g key={mark.index}>
              {/* 分隔线 */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
              
              {/* 起始节气 */}
              <text
                x={mark.startX}
                y={mark.startY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: '9px' }}
              >
                {mark.jieQiStart}
              </text>
              
              {/* 时段名称（初之气 - 终之气） */}
              <text
                x={mark.midX}
                y={mark.midY}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`font-serif ${mark.isCurrent ? 'fill-primary font-medium' : 'fill-foreground'}`}
                style={{ fontSize: mark.isCurrent ? '11px' : '10px' }}
              >
                {mark.name}
              </text>
            </g>
          );
        })}

        {/* 时段名称圈 */}
        <circle
          cx={center}
          cy={center}
          r={qiNameRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {/* 主气圈 */}
        <circle
          cx={center}
          cy={center}
          r={zhuQiRadius}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 主气扇区 */}
        {zhuQiSectors.map((sector) => (
          <g key={`zhu-${sector.index}`}>
            <path
              d={sector.path}
              fill={sector.color}
              fillOpacity={sector.isCurrent ? 0.9 : 0.6}
              stroke={sector.color}
              strokeWidth={sector.isCurrent ? 3 : 1}
              style={{ filter: sector.isCurrent ? 'url(#liuqi-glow)' : undefined }}
            />
            
            {/* 主气名称 */}
            <text
              x={sector.labelX}
              y={sector.labelY - 7}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif"
              style={{ 
                fontSize: '9px',
                fill: sector.element === '金' ? '#333' : '#fff'
              }}
            >
              {sector.qi.slice(0, 2)}
            </text>
            <text
              x={sector.labelX}
              y={sector.labelY + 5}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                fontSize: '8px',
                fill: sector.element === '金' ? '#555' : 'rgba(255,255,255,0.8)'
              }}
            >
              主气
            </text>
          </g>
        ))}

        {/* 客气圈 */}
        <circle
          cx={center}
          cy={center}
          r={keQiRadius}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 客气扇区 */}
        {keQiSectors.map((sector) => (
          <g key={`ke-${sector.index}`}>
            <path
              d={sector.path}
              fill={sector.color}
              fillOpacity={sector.isSiTian || sector.isZaiQuan ? 0.8 : 0.5}
              stroke={sector.isSiTian ? 'hsl(var(--primary))' : sector.isZaiQuan ? 'hsl(var(--accent))' : sector.color}
              strokeWidth={sector.isSiTian || sector.isZaiQuan ? 2 : 1}
            />
            
            {/* 客气名称 */}
            <text
              x={sector.labelX}
              y={sector.labelY - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif"
              style={{ 
                fontSize: '9px',
                fill: sector.element === '金' ? '#333' : '#fff'
              }}
            >
              {sector.qi.slice(0, 2)}
            </text>
            
            {/* 司天/在泉标记 */}
            {sector.isSiTian && (
              <text
                x={sector.labelX}
                y={sector.labelY + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-medium"
                style={{ fontSize: '8px', fill: 'hsl(var(--primary))' }}
              >
                司天
              </text>
            )}
            {sector.isZaiQuan && (
              <text
                x={sector.labelX}
                y={sector.labelY + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-medium"
                style={{ fontSize: '8px', fill: 'hsl(var(--accent))' }}
              >
                在泉
              </text>
            )}
            {!sector.isSiTian && !sector.isZaiQuan && (
              <text
                x={sector.labelX}
                y={sector.labelY + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '7px', fill: sector.element === '金' ? '#555' : 'rgba(255,255,255,0.7)' }}
              >
                客气
              </text>
            )}
          </g>
        ))}

        {/* 中心圆 */}
        <circle
          cx={center}
          cy={center}
          r={centerRadius}
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />

        {/* 中心文字 */}
        <text
          x={center}
          y={center - 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-serif text-lg fill-foreground"
        >
          {ganZhi}
        </text>
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-primary font-medium"
          style={{ fontSize: '10px' }}
        >
          司天·{siTian.slice(0, 2)}
        </text>
        <text
          x={center}
          y={center + 22}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-accent font-medium"
          style={{ fontSize: '10px' }}
        >
          在泉·{zaiQuan.slice(0, 2)}
        </text>
      </svg>

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-foreground">司天（三之气）</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-foreground">在泉（终之气）</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border-2 border-primary animate-pulse" />
          <span className="text-muted-foreground">当前时令</span>
        </div>
      </div>

      {/* 时段说明 */}
      <div className="mt-4 w-full max-w-md text-xs text-muted-foreground">
        <div className="grid grid-cols-3 gap-1 text-center">
          {QI_PERIODS.map((p, i) => (
            <div key={i} className={`p-1 rounded ${i === currentQiIndex ? 'bg-primary/20 text-primary' : ''}`}>
              <div className="font-medium">{p.name}</div>
              <div>{p.jieQiStart}-{p.jieQiEnd}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 绘制环形扇区
function describeArc(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) {
  const startRad = startAngle * (Math.PI / 180);
  const endRad = endAngle * (Math.PI / 180);
  
  const x1 = cx + outerR * Math.cos(startRad);
  const y1 = cy + outerR * Math.sin(startRad);
  const x2 = cx + outerR * Math.cos(endRad);
  const y2 = cy + outerR * Math.sin(endRad);
  const x3 = cx + innerR * Math.cos(endRad);
  const y3 = cy + innerR * Math.sin(endRad);
  const x4 = cx + innerR * Math.cos(startRad);
  const y4 = cy + innerR * Math.sin(startRad);
  
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  
  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}
