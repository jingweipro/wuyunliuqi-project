import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  User,
  BookOpen,
  Clock,
  Compass,
  Sparkles,
  Quote,
  Stethoscope,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  LI_YANGBO_BIO,
  SAN_YANG_KAI_HE_SHU,
  SAN_YIN_KAI_HE_SHU,
  LIU_JING_YU_JIE_SHI,
  SAN_YIN_SAN_YANG_QIHUA,
  SHANG_HAN_DUI_ZHAO,
  CORE_THEORIES,
} from '@/lib/liyangbo-data';

// 五行颜色映射
const ELEMENT_COLORS: Record<string, string> = {
  '木': '#22c55e', '火': '#ef4444', '火（君）': '#ef4444', '火（相）': '#f97316',
  '土': '#eab308', '金': '#a3a3a3', '水': '#3b82f6',
};

// 开阖枢颜色
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  '开': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  '阖': { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  '枢': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
};

// 可折叠内容组件
function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-foreground text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 border-t border-border">{children}</div>}
    </div>
  );
}

// 开阖枢SVG可视化
function KaiHeShuDiagram() {
  const cx = 200, cy = 200, r = 150;
  const yangItems = SAN_YANG_KAI_HE_SHU;
  const yinItems = SAN_YIN_KAI_HE_SHU;
  const yangAngles = [-90, 30, 150]; // 太阳上、阳明右下、少阳左下
  const yinAngles = [90, -150, -30]; // 太阴下、厥阴左上、少阴右上

  const getPos = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
      {/* 背景圈 */}
      <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx={cx} cy={cy} r={r - 40} fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="4 4" />

      {/* 中央太极 */}
      <circle cx={cx} cy={cy} r={35} fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="2" />
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-primary font-serif text-sm font-bold">开阖枢</text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground text-xs">三阴三阳</text>

      {/* 阳经 */}
      {yangItems.map((item, i) => {
        const pos = getPos(yangAngles[i], r);
        const rc = ROLE_COLORS[item.role];
        return (
          <g key={`yang-${i}`}>
            <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke="hsl(var(--primary) / 0.2)" strokeWidth="1" />
            <circle cx={pos.x} cy={pos.y} r={32} fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="2" />
            <text x={pos.x} y={pos.y - 8} textAnchor="middle" className="fill-primary font-serif text-sm font-bold">{item.name}</text>
            <text x={pos.x} y={pos.y + 10} textAnchor="middle" className="fill-muted-foreground text-xs">为{item.role} · 阳</text>
          </g>
        );
      })}

      {/* 阴经 */}
      {yinItems.map((item, i) => {
        const pos = getPos(yinAngles[i], r);
        return (
          <g key={`yin-${i}`}>
            <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke="hsl(var(--accent) / 0.2)" strokeWidth="1" />
            <circle cx={pos.x} cy={pos.y} r={32} fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="2" />
            <text x={pos.x} y={pos.y - 8} textAnchor="middle" className="fill-accent font-serif text-sm font-bold">{item.name}</text>
            <text x={pos.x} y={pos.y + 10} textAnchor="middle" className="fill-muted-foreground text-xs">为{item.role} · 阴</text>
          </g>
        );
      })}

      {/* 表里关系连线 */}
      {[0, 1, 2].map(i => {
        const yp = getPos(yangAngles[i], r - 32);
        const ip = getPos(yinAngles[2 - i], r - 32);
        return (
          <line key={`pair-${i}`} x1={yp.x} y1={yp.y} x2={ip.x} y2={ip.y}
            stroke="hsl(var(--muted-foreground) / 0.15)" strokeWidth="1" strokeDasharray="3 3" />
        );
      })}
    </svg>
  );
}

// 六经欲解时圆盘
function YuJieShiDiagram() {
  const cx = 200, cy = 200;
  const shiChenNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const jingColors = ['#3b82f6', '#f97316', '#22c55e', '#6b7280', '#ef4444', '#8b5cf6'];
  const jingNames = ['太阳', '阳明', '少阳', '太阴', '少阴', '厥阴'];
  // 每个经对应的时辰范围 (index in shiChenNames)
  const jingRanges = [
    [5, 6, 7],   // 太阳: 巳午未
    [8, 9, 10],  // 阳明: 申酉戌
    [2, 3, 4],   // 少阳: 寅卯辰
    [11, 0, 1],  // 太阴: 亥子丑
    [0, 1, 2],   // 少阴: 子丑寅
    [1, 2, 3],   // 厥阴: 丑寅卯
  ];

  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto">
      {/* 外圈时辰 */}
      {shiChenNames.map((name, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = cx + 170 * Math.cos(angle);
        const y = cy + 170 * Math.sin(angle);
        return (
          <g key={`sc-${i}`}>
            <line
              x1={cx + 140 * Math.cos(angle)} y1={cy + 140 * Math.sin(angle)}
              x2={cx + 155 * Math.cos(angle)} y2={cy + 155 * Math.sin(angle)}
              stroke="hsl(var(--border))" strokeWidth="1"
            />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
              className="fill-muted-foreground text-xs">{name}时</text>
          </g>
        );
      })}

      {/* 六经扇区 */}
      {jingNames.map((name, i) => {
        const range = jingRanges[i];
        const startAngle = (range[0] * 30 - 90 - 15) * Math.PI / 180;
        const endAngle = (range[range.length - 1] * 30 - 90 + 15) * Math.PI / 180;
        const outerR = 135;
        const innerR = i < 3 ? 75 : 45; // 阳经外圈，阴经内圈
        const midAngle = (startAngle + endAngle) / 2;

        const x1 = cx + outerR * Math.cos(startAngle);
        const y1 = cy + outerR * Math.sin(startAngle);
        const x2 = cx + outerR * Math.cos(endAngle);
        const y2 = cy + outerR * Math.sin(endAngle);
        const x3 = cx + innerR * Math.cos(endAngle);
        const y3 = cy + innerR * Math.sin(endAngle);
        const x4 = cx + innerR * Math.cos(startAngle);
        const y4 = cy + innerR * Math.sin(startAngle);

        const labelR = (outerR + innerR) / 2;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);

        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        return (
          <g key={`jing-${i}`} opacity={0.7}>
            <path
              d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`}
              fill={jingColors[i]} opacity={0.15} stroke={jingColors[i]} strokeWidth="1"
            />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central"
              fill={jingColors[i]} className="text-xs font-bold">{name}</text>
          </g>
        );
      })}

      {/* 中心 */}
      <circle cx={cx} cy={cy} r={30} fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      <text x={cx} y={cy - 5} textAnchor="middle" className="fill-primary font-serif text-xs font-bold">欲解时</text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: '9px' }}>十二时辰</text>
    </svg>
  );
}

export default function LiYangBoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('intro');
  const [expandedJing, setExpandedJing] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h1 className="font-serif text-lg text-foreground">李阳波学说</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="intro" className="text-xs sm:text-sm">
              <User className="w-4 h-4 mr-1 hidden sm:inline" />简介
            </TabsTrigger>
            <TabsTrigger value="kaiheshu" className="text-xs sm:text-sm">
              <Compass className="w-4 h-4 mr-1 hidden sm:inline" />开阖枢
            </TabsTrigger>
            <TabsTrigger value="yujie" className="text-xs sm:text-sm">
              <Clock className="w-4 h-4 mr-1 hidden sm:inline" />欲解时
            </TabsTrigger>
            <TabsTrigger value="shanghanlun" className="text-xs sm:text-sm">
              <Stethoscope className="w-4 h-4 mr-1 hidden sm:inline" />六经
            </TabsTrigger>
            <TabsTrigger value="theory" className="text-xs sm:text-sm">
              <BookOpen className="w-4 h-4 mr-1 hidden sm:inline" />理论
            </TabsTrigger>
          </TabsList>

          {/* ===== 人物简介 ===== */}
          <TabsContent value="intro" className="space-y-6">
            <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-950/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-serif text-2xl font-bold">李</span>
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">{LI_YANGBO_BIO.name}</h2>
                    <p className="text-sm text-muted-foreground">{LI_YANGBO_BIO.birth} - {LI_YANGBO_BIO.death} | {LI_YANGBO_BIO.birthPlace}</p>
                    <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">{LI_YANGBO_BIO.title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{LI_YANGBO_BIO.overview}</p>
              </CardContent>
            </Card>

            {/* 主要成就 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg">学术贡献</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {LI_YANGBO_BIO.achievements.map((a, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                    <Badge variant="secondary" className="h-6 w-6 rounded-full flex-shrink-0 flex items-center justify-center p-0">{i + 1}</Badge>
                    <p className="text-sm text-foreground">{a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 著作 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg">主要著作</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {LI_YANGBO_BIO.works.map((w, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border">
                    <h4 className="font-serif font-medium text-foreground mb-2">《{w.title}》</h4>
                    <p className="text-sm text-muted-foreground">{w.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 弟子传承 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg">弟子传承</CardTitle></CardHeader>
              <CardContent>
                {LI_YANGBO_BIO.disciples.map((d, i) => (
                  <div key={i} className="p-4 rounded-lg bg-secondary/30">
                    <h4 className="font-medium text-foreground mb-1">{d.name}</h4>
                    <p className="text-sm text-muted-foreground">{d.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 经典语录 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg flex items-center gap-2"><Quote className="w-5 h-5" />经典语录</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {LI_YANGBO_BIO.quotes.map((q, i) => (
                  <div key={i} className="p-4 rounded-lg border-l-4 border-l-teal-500 bg-secondary/20">
                    <p className="text-sm text-foreground italic leading-relaxed">"{q.text}"</p>
                    <p className="text-xs text-muted-foreground mt-2 text-right">—— {q.source}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 开阖枢理论 ===== */}
          <TabsContent value="kaiheshu" className="space-y-6">
            {/* 开阖枢图示 */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">三阴三阳开阖枢</CardTitle>
              </CardHeader>
              <CardContent>
                <KaiHeShuDiagram />
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {Object.entries(ROLE_COLORS).map(([role, colors]) => (
                    <div key={role} className={`text-center p-2 rounded-lg ${colors.bg}`}>
                      <span className={`font-medium text-sm ${colors.text}`}>{role}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role === '开' ? '气之展放散布' : role === '阖' ? '气之收敛闭合' : '气之转化枢纽'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 三阳经详解 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg">三阳经 · 开阖枢</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {SAN_YANG_KAI_HE_SHU.map((item) => (
                  <Collapsible key={item.name} title={`${item.name}（${item.role}）· 阳经`}>
                    <div className="space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">{item.meaning}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">时间定位</p>
                          <p className="text-sm text-foreground">{item.timePosition}</p>
                        </div>
                        <div className="p-3 rounded bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">方位</p>
                          <p className="text-sm text-foreground">{item.direction}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">经脉起止</p>
                        <p className="text-sm text-foreground">{item.meridianRoot}</p>
                      </div>
                      <div className="p-3 rounded bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">脏腑经络</p>
                        <p className="text-sm text-foreground">{item.bodySystem}</p>
                      </div>
                      <div className="p-3 rounded bg-red-50 dark:bg-red-950/20">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">发病特点</p>
                        <p className="text-sm text-foreground">{item.diseaseFeature}</p>
                      </div>
                      <div className="p-3 rounded bg-green-50 dark:bg-green-950/20">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">治法</p>
                        <p className="text-sm text-foreground">{item.treatment}</p>
                      </div>
                      <div className="p-3 rounded border-l-2 border-l-teal-500 bg-secondary/20">
                        <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">经典原文</p>
                        <p className="text-sm text-foreground italic">{item.classicQuote}</p>
                      </div>
                    </div>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* 三阴经详解 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg">三阴经 · 开阖枢</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {SAN_YIN_KAI_HE_SHU.map((item) => (
                  <Collapsible key={item.name} title={`${item.name}（${item.role}）· 阴经`}>
                    <div className="space-y-3">
                      <p className="text-sm text-foreground leading-relaxed">{item.meaning}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">时间定位</p>
                          <p className="text-sm text-foreground">{item.timePosition}</p>
                        </div>
                        <div className="p-3 rounded bg-secondary/30">
                          <p className="text-xs text-muted-foreground mb-1">方位</p>
                          <p className="text-sm text-foreground">{item.direction}</p>
                        </div>
                      </div>
                      <div className="p-3 rounded bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">经脉起止</p>
                        <p className="text-sm text-foreground">{item.meridianRoot}</p>
                      </div>
                      <div className="p-3 rounded bg-secondary/30">
                        <p className="text-xs text-muted-foreground mb-1">脏腑经络</p>
                        <p className="text-sm text-foreground">{item.bodySystem}</p>
                      </div>
                      <div className="p-3 rounded bg-red-50 dark:bg-red-950/20">
                        <p className="text-xs text-red-600 dark:text-red-400 mb-1">发病特点</p>
                        <p className="text-sm text-foreground">{item.diseaseFeature}</p>
                      </div>
                      <div className="p-3 rounded bg-green-50 dark:bg-green-950/20">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">治法</p>
                        <p className="text-sm text-foreground">{item.treatment}</p>
                      </div>
                      <div className="p-3 rounded border-l-2 border-l-teal-500 bg-secondary/20">
                        <p className="text-xs text-teal-600 dark:text-teal-400 mb-1">经典原文</p>
                        <p className="text-sm text-foreground italic">{item.classicQuote}</p>
                      </div>
                    </div>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* 三阴三阳气化 */}
            <Card>
              <CardHeader><CardTitle className="font-serif text-lg">三阴三阳与六气对应</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {SAN_YIN_SAN_YANG_QIHUA.map((item) => (
                    <div key={item.name} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[item.element] || '#888' }} />
                        <span className="font-serif font-medium text-foreground">{item.name}</span>
                        <Badge variant="outline" className="text-xs">{item.qi}</Badge>
                        <Badge variant="secondary" className="text-xs">{item.nature}气</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{item.direction} · {item.season}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.clinicCharacter}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">脏腑：</span>
                        <span className="text-xs text-foreground">{item.organ}</span>
                        <span className="text-xs text-muted-foreground ml-4">代表方：</span>
                        <span className="text-xs text-primary">{item.representFormula}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 六经欲解时 ===== */}
          <TabsContent value="yujie" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg">六经欲解时 · 时间圆盘</CardTitle>
              </CardHeader>
              <CardContent>
                <YuJieShiDiagram />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  注：各色扇区表示该经"欲解"的时辰范围，外圈为三阳经，内圈为三阴经
                </p>
              </CardContent>
            </Card>

            {LIU_JING_YU_JIE_SHI.map((item) => (
              <Card key={item.jing}>
                <CardHeader>
                  <CardTitle className="font-serif text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    {item.jing}经欲解时 · {item.timeRange}
                    <Badge variant="secondary" className="ml-auto font-normal">{item.hours}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">时辰</p>
                    <p className="text-sm text-foreground">{item.shiChen}</p>
                  </div>
                  <div className="p-3 rounded bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">运气学解释</p>
                    <p className="text-sm text-foreground leading-relaxed">{item.explanation}</p>
                  </div>
                  <div className="p-3 rounded bg-primary/5 border border-primary/20">
                    <p className="text-xs text-primary mb-1">临床意义</p>
                    <p className="text-sm text-foreground leading-relaxed">{item.clinicalSignificance}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ===== 伤寒论六经 ===== */}
          <TabsContent value="shanghanlun" className="space-y-6">
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-foreground leading-relaxed font-serif">
                  "《伤寒论》的六经，实质上就是六气，伤寒论就是一部活的运气学。"
                </p>
                <p className="text-xs text-muted-foreground text-right mt-2">—— 李阳波《伤寒论导论》</p>
              </CardContent>
            </Card>

            {SHANG_HAN_DUI_ZHAO.map((item) => (
              <Card key={item.jing}>
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      {item.jing}
                    </span>
                    <Badge variant="outline" className="font-normal text-xs">{item.tiaowenRange}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 提纲证 */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-primary mb-1">提纲证</p>
                    <p className="font-serif text-foreground">{item.mainSymptoms}</p>
                  </div>

                  {/* 病机 */}
                  <div className="p-3 rounded bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">病机（开阖枢解读）</p>
                    <p className="text-sm text-foreground">{item.pathMechanism}</p>
                  </div>

                  {/* 治则 */}
                  <div className="p-3 rounded bg-green-50 dark:bg-green-950/20">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">治则</p>
                    <p className="text-sm text-foreground">{item.treatmentPrinciple}</p>
                  </div>

                  {/* 方剂 */}
                  <Collapsible title={`代表方剂（${item.mainFormulas.length}首）`}>
                    <div className="space-y-3">
                      {item.mainFormulas.map((f, i) => (
                        <div key={i} className="p-3 rounded border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{f.name}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">组成：{f.composition}</p>
                          <p className="text-xs text-foreground">主治：{f.indication}</p>
                        </div>
                      ))}
                    </div>
                  </Collapsible>

                  {/* 辨证要点 */}
                  <Collapsible title="辨证要点">
                    <ul className="space-y-2">
                      {item.bianzhengYaodian.map((point, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground">
                          <span className="text-primary flex-shrink-0">-</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ===== 核心理论 ===== */}
          <TabsContent value="theory" className="space-y-6">
            {CORE_THEORIES.map((theory) => (
              <Card key={theory.id}>
                <CardHeader>
                  <CardTitle className="font-serif text-lg">{theory.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{theory.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {theory.content.map((p, i) => (
                    <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
                  ))}

                  {/* 要点 */}
                  <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                    <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mb-2">核心要点</p>
                    <ul className="space-y-1">
                      {theory.keyPoints.map((kp, i) => (
                        <li key={i} className="text-sm text-foreground flex gap-2">
                          <span className="text-teal-600 flex-shrink-0">-</span>{kp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 经典引用 */}
                  {theory.classicQuotes && theory.classicQuotes.length > 0 && (
                    <div className="space-y-2">
                      {theory.classicQuotes.map((q, i) => (
                        <div key={i} className="p-3 rounded border-l-3 border-l-primary/50 bg-secondary/20">
                          <p className="text-sm text-foreground italic">"{q.text}"</p>
                          <p className="text-xs text-muted-foreground mt-1 text-right">—— {q.source}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
