import { useMemo } from 'react';
import { 
  WU_XING_ATTRIBUTES, 
  WU_YUN_PERIODS, 
  JIE_QI,
  getCurrentYun,
  type WuXing 
} from '@/lib/wuyun-liuqi';

interface Props {
  year: number;
  ganZhi: string;
  daYun: string;
  wuXing: string;
  taiGuoBuJi: string;
  zhuYun: { xing: WuXing; name: string }[];
  keYun: { xing: WuXing; name: string; taiGuoBuJi: '太过' | '不及' }[];
}

export default function WuYunChart({ year, ganZhi, daYun, wuXing, taiGuoBuJi, zhuYun, keYun }: Props) {
  const size = 400;
  const center = size / 2;
  const outerRadius = size / 2 - 15;
  const jieQiRadius = outerRadius - 25;
  const yunRadius = jieQiRadius - 30;
  const keYunRadius = yunRadius - 35;
  const centerRadius = 55;

  const currentYunIndex = getCurrentYun();

  // 24节气分布
  const jieQiItems = useMemo(() => {
    return JIE_QI.map((name, index) => {
      const angle = (index * 15 - 90 + 7.5) * (Math.PI / 180); // 每个节气15度
      const x = center + (outerRadius - 12) * Math.cos(angle);
      const y = center + (outerRadius - 12) * Math.sin(angle);
      return { name, x, y, angle: index * 15 - 90 + 7.5 };
    });
  }, [center, outerRadius]);

  // 五运扇区（主运）
  const yunSectors = useMemo(() => {
    return WU_YUN_PERIODS.map((yun, index) => {
      const startAngle = index * 72 - 90;
      const endAngle = (index + 1) * 72 - 90;
      const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      
      const color = WU_XING_ATTRIBUTES[yun.xing].color;
      const isCurrent = index === currentYunIndex;
      
      // 标签位置
      const labelRadius = (yunRadius + keYunRadius) / 2 + 5;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      
      return {
        ...yun,
        index,
        startAngle,
        endAngle,
        midAngle,
        color,
        labelX,
        labelY,
        isCurrent,
        path: describeArc(center, center, yunRadius, keYunRadius, startAngle, endAngle),
      };
    });
  }, [center, yunRadius, keYunRadius, currentYunIndex]);

  // 客运扇区
  const keYunSectors = useMemo(() => {
    return keYun.map((yun, index) => {
      const startAngle = index * 72 - 90;
      const endAngle = (index + 1) * 72 - 90;
      const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
      
      const color = WU_XING_ATTRIBUTES[yun.xing].color;
      
      const labelRadius = (keYunRadius + centerRadius) / 2 + 5;
      const labelX = center + labelRadius * Math.cos(midAngle);
      const labelY = center + labelRadius * Math.sin(midAngle);
      
      return {
        ...yun,
        index,
        startAngle,
        endAngle,
        midAngle,
        color,
        labelX,
        labelY,
        path: describeArc(center, center, keYunRadius, centerRadius + 20, startAngle, endAngle),
      };
    });
  }, [center, keYunRadius, centerRadius, keYun]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="font-serif text-lg mb-4 text-foreground">五运图</h3>
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full h-auto"
      >
        <defs>
          <filter id="wuyun-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 外圈 - 24节气 */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
        
        {/* 24节气刻度 */}
        {jieQiItems.map((jq, index) => {
          const startAngle = index * 15 - 90;
          const rad = startAngle * (Math.PI / 180);
          const x1 = center + outerRadius * Math.cos(rad);
          const y1 = center + outerRadius * Math.sin(rad);
          const x2 = center + jieQiRadius * Math.cos(rad);
          const y2 = center + jieQiRadius * Math.sin(rad);
          
          return (
            <g key={jq.name}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
              <text
                x={jq.x}
                y={jq.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                style={{ fontSize: '8px' }}
                transform={`rotate(${jq.angle + 90}, ${jq.x}, ${jq.y})`}
              >
                {jq.name}
              </text>
            </g>
          );
        })}

        {/* 节气圈 */}
        <circle
          cx={center}
          cy={center}
          r={jieQiRadius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 主运圈 */}
        <circle
          cx={center}
          cy={center}
          r={yunRadius}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 主运扇区 */}
        {yunSectors.map((sector) => (
          <g key={`zhu-${sector.index}`}>
            <path
              d={sector.path}
              fill={sector.color}
              fillOpacity={sector.isCurrent ? 0.9 : 0.6}
              stroke={sector.color}
              strokeWidth={sector.isCurrent ? 2 : 1}
              style={{ filter: sector.isCurrent ? 'url(#wuyun-glow)' : undefined }}
            />
            <text
              x={sector.labelX}
              y={sector.labelY - 6}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif"
              style={{ 
                fontSize: '10px',
                fill: sector.xing === '金' ? '#333' : '#fff'
              }}
            >
              {sector.name}
            </text>
            <text
              x={sector.labelX}
              y={sector.labelY + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                fontSize: '8px',
                fill: sector.xing === '金' ? '#555' : 'rgba(255,255,255,0.8)'
              }}
            >
              主运
            </text>
          </g>
        ))}

        {/* 客运圈 */}
        <circle
          cx={center}
          cy={center}
          r={keYunRadius}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* 客运扇区 */}
        {keYunSectors.map((sector) => (
          <g key={`ke-${sector.index}`}>
            <path
              d={sector.path}
              fill={sector.color}
              fillOpacity={0.5}
              stroke={sector.color}
              strokeWidth="1"
            />
            <text
              x={sector.labelX}
              y={sector.labelY - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-serif"
              style={{ 
                fontSize: '9px',
                fill: sector.xing === '金' ? '#333' : '#fff'
              }}
            >
              {sector.xing}
            </text>
            <text
              x={sector.labelX}
              y={sector.labelY + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                fontSize: '7px',
                fill: sector.xing === '金' ? '#555' : 'rgba(255,255,255,0.8)'
              }}
            >
              {sector.taiGuoBuJi}
            </text>
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
          y={center - 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-serif text-lg fill-foreground"
        >
          {ganZhi}
        </text>
        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-primary font-medium"
          style={{ fontSize: '12px' }}
        >
          {daYun}
        </text>
        <text
          x={center}
          y={center + 22}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '10px' }}
        >
          {taiGuoBuJi}
        </text>
      </svg>

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 rounded opacity-80" style={{ backgroundColor: WU_XING_ATTRIBUTES[wuXing as WuXing].color }} />
          <span className="text-foreground">中运·{wuXing}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <div className="w-3 h-3 rounded-full border-2 border-primary" />
          <span>当前运</span>
        </div>
      </div>

      {/* 时段说明 */}
      <div className="mt-4 w-full max-w-sm text-xs text-muted-foreground">
        <div className="grid grid-cols-5 gap-1 text-center">
          {WU_YUN_PERIODS.map((p, i) => (
            <div key={i} className={`p-1 rounded ${i === currentYunIndex ? 'bg-primary/20 text-primary' : ''}`}>
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
