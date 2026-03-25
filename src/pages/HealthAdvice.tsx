import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { generateEnhancedHealthAdvice, type EnhancedHealthAdvice, type EnhancedQiAdvice } from '@/lib/health-advice';
import { LIU_QI_ATTRIBUTES, WU_XING_ATTRIBUTES } from '@/lib/wuyun-liuqi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft, Heart, Calendar, Leaf, Snowflake, Cloud, Flame, Droplets,
  AlertTriangle, Shield, Utensils, Activity, BookOpen, Pill, MapPin,
  Brain, Zap, CircleDot, Coffee, HandMetal, Moon, Dumbbell, Smile, TreePine
} from 'lucide-react';

export default function HealthAdvice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuthContext();

  const selectedYear = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const birthYear = profile?.birth_year;
  const province = profile?.region || '';

  const advice = useMemo<EnhancedHealthAdvice | null>(() => {
    if (!birthYear) return null;
    return generateEnhancedHealthAdvice(selectedYear, birthYear, province);
  }, [selectedYear, birthYear, province]);

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

  const handleYearChange = (v: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('year', v);
    navigate(`/health-advice?year=${v}`);
  };

  if (!birthYear) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">需要完善出生信息</h2>
            <p className="text-muted-foreground mb-4">请先在个人中心填写您的出生年份，以便生成个性化的健康建议</p>
            <Button onClick={() => navigate('/dashboard')}>返回完善信息</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!advice) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-outline-subtle">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-serif font-semibold text-foreground">个人健康建议</h1>
                <p className="text-xs text-muted-foreground">
                  {birthYear}年生 ({advice.birthYearGanZhi}年) · {advice.constitution.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        {/* Current Qi Banner */}
        <CurrentQiBanner advice={advice} />

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 text-xs">
            <TabsTrigger value="overview">总览</TabsTrigger>
            <TabsTrigger value="constitution">体质</TabsTrigger>
            <TabsTrigger value="liuqi">六气</TabsTrigger>
            <TabsTrigger value="prescriptions">方药</TabsTrigger>
            <TabsTrigger value="lifestyle">生活</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab advice={advice} /></TabsContent>
          <TabsContent value="constitution"><ConstitutionTab advice={advice} /></TabsContent>
          <TabsContent value="liuqi"><LiuQiTab advice={advice} /></TabsContent>
          <TabsContent value="prescriptions"><PrescriptionTab advice={advice} /></TabsContent>
          <TabsContent value="lifestyle"><LifestyleTab advice={advice} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ============================================================
// Current Qi Banner
// ============================================================
function CurrentQiBanner({ advice }: { advice: EnhancedHealthAdvice }) {
  const currentQi = advice.qiAdvices.find(q => q.isCurrent);
  if (!currentQi) return null;

  const keQiColor = LIU_QI_ATTRIBUTES[currentQi.keQi as keyof typeof LIU_QI_ATTRIBUTES]?.element;
  const color = keQiColor ? WU_XING_ATTRIBUTES[keQiColor]?.color : '#c88a2e';

  return (
    <Card className="border-primary/40 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: color, filter: 'blur(40px)' }} />
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CircleDot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif font-semibold text-foreground">当前时令：{currentQi.qiName}</span>
              <Badge variant="outline" className="text-xs">{currentQi.dateRange.split('（')[0]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              客气 <span className="font-medium text-foreground">{currentQi.keQi}</span> 加临主气 <span className="font-medium text-foreground">{currentQi.zhuQi}</span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentQi.detail.climate}
            </p>
            {currentQi.personalWarnings.length > 0 && (
              <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
                {currentQi.personalWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-destructive flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Overview Tab
// ============================================================
function OverviewTab({ advice }: { advice: EnhancedHealthAdvice }) {
  const riskColors = { '低': 'bg-green-100 text-green-800', '中': 'bg-yellow-100 text-yellow-800', '高': 'bg-red-100 text-red-800' };

  return (
    <div className="space-y-4">
      {/* Year Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            {advice.year}年度养生总览
          </CardTitle>
          <CardDescription>
            {advice.yearGanZhi}年 · {advice.daYun}{advice.taiGuoBuJi} · 司天{advice.siTian.slice(0, 2)} · 在泉{advice.zaiQuan.slice(0, 2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{advice.overallAdvice}</p>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            体质与运气交互分析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">关系：</span>
            <Badge variant="secondary">{advice.interaction.relation}</Badge>
            <span className="text-sm text-muted-foreground">风险：</span>
            <Badge className={riskColors[advice.interaction.riskLevel]}>{advice.interaction.riskLevel}风险</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{advice.interaction.description}</p>
          {advice.interaction.keyRisks.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-sm font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />重点风险
              </h5>
              <ul className="text-sm text-muted-foreground space-y-0.5 ml-5">
                {advice.interaction.keyRisks.map((r, i) => <li key={i}>· {r}</li>)}
              </ul>
            </div>
          )}
          {advice.interaction.protectionStrategy.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-sm font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />防护策略
              </h5>
              <ul className="text-sm text-muted-foreground space-y-0.5 ml-5">
                {advice.interaction.protectionStrategy.map((s, i) => <li key={i}>· {s}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NeiJing Quote */}
      <Card className="border-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            经典依据与药食原则
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <blockquote className="border-l-2 border-accent/50 pl-3 py-1 text-sm text-muted-foreground italic font-serif leading-relaxed">
            {advice.yearDrugFood.neiJingQuote}
          </blockquote>
          <div className="grid gap-2">
            <InfoRow label="总则" value={advice.yearDrugFood.drugFoodPrinciple} />
            <InfoRow label="上（司天）" value={advice.yearDrugFood.upperAdvice} />
            <InfoRow label="中（岁运）" value={advice.yearDrugFood.middleAdvice} />
            <InfoRow label="下（在泉）" value={advice.yearDrugFood.lowerAdvice} />
          </div>
          <Separator />
          <p className="text-sm text-foreground leading-relaxed">{advice.yearDrugFood.overallSummary}</p>
        </CardContent>
      </Card>

      {/* Region */}
      {advice.regionModifier && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              地域养生调整 · {advice.regionModifier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{advice.regionModifier.climate}</p>
            <div className="space-y-1">
              <h5 className="text-sm font-medium">五运六气地域修正</h5>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {advice.regionModifier.modifier.map((m, i) => <li key={i}>· {m}</li>)}
              </ul>
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-medium">饮食调整</h5>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {advice.regionModifier.dietAdjust.map((d, i) => <li key={i}>· {d}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Constitution Tab
// ============================================================
function ConstitutionTab({ advice }: { advice: EnhancedHealthAdvice }) {
  const c = advice.constitution;
  const color = WU_XING_ATTRIBUTES[c.wuXing]?.color || '#666';

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg" style={{ backgroundColor: color }}>
              {c.wuXing}
            </div>
            <div>
              <h3 className="font-serif font-semibold text-lg text-foreground">{c.name}</h3>
              <p className="text-sm text-muted-foreground">
                出生于{advice.birthYearGanZhi}年 · {c.taiGuoBuJi === '太过' ? `${c.wuXing}气偏盛` : `${c.wuXing}气偏弱`}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground bg-primary/5 rounded-lg p-3 font-medium">
            养护总则：{c.nurturePrinciple}
          </p>
        </CardContent>
      </Card>

      {/* Body Features */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />形体特征</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            {c.bodyFeatures.map((f, i) => <li key={i}>· {f}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Organ Strength */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />脏腑强弱</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <h5 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1.5">偏强脏腑</h5>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {c.organStrength.strong.map((s, i) => <li key={i}>· {s}</li>)}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <h5 className="text-xs font-medium text-red-700 dark:text-red-400 mb-1.5">偏弱脏腑</h5>
              <ul className="text-sm text-muted-foreground space-y-0.5">
                {c.organStrength.weak.map((w, i) => <li key={i}>· {w}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disease Tendencies */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />易患疾病</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            {c.diseases.map((d, i) => <li key={i} className="leading-relaxed">· {d}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Emotions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4 text-primary" />情志特点</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            {c.emotions.map((e, i) => <li key={i}>· {e}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Nurture Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />养护要点</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm text-muted-foreground space-y-1.5">
            {c.nurtureDetails.map((n, i) => <li key={i} className="leading-relaxed">· {n}</li>)}
          </ul>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-secondary/30">
              <h5 className="text-xs font-medium text-foreground mb-1">有利时节</h5>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {c.favorableSeasons.map((s, i) => <li key={i}>· {s}</li>)}
              </ul>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/30">
              <h5 className="text-xs font-medium text-foreground mb-1">风险时节</h5>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {c.riskySeasons.map((s, i) => <li key={i}>· {s}</li>)}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tea */}
      <Card className="border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Coffee className="w-4 h-4 text-accent" />日常代茶饮推荐</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-accent/5">
            <h5 className="font-medium text-foreground mb-1">{c.dailyTea.name}</h5>
            <p className="text-sm text-muted-foreground">配方：{c.dailyTea.ingredients}</p>
            <p className="text-sm text-muted-foreground mt-1">功效：{c.dailyTea.effect}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// LiuQi Tab
// ============================================================
function LiuQiTab({ advice }: { advice: EnhancedHealthAdvice }) {
  return (
    <div className="space-y-2">
      <Accordion type="single" collapsible defaultValue={`qi-${advice.currentQiIndex}`}>
        {advice.qiAdvices.map((qi) => (
          <AccordionItem key={qi.qiIndex} value={`qi-${qi.qiIndex}`} className={`border rounded-lg px-3 mb-2 ${qi.isCurrent ? 'border-primary/40 bg-primary/5' : ''}`}>
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2 text-left">
                {qi.isCurrent && <CircleDot className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                <Badge variant={qi.isCurrent ? 'default' : 'outline'} className="text-xs">{qi.qiName}</Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">{qi.dateRange.split('（')[0]}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <QiDetailCard qi={qi} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function QiDetailCard({ qi }: { qi: EnhancedQiAdvice }) {
  const d = qi.detail;

  return (
    <div className="space-y-4 pb-3">
      {/* Qi Info */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary" className="text-xs">主气：{qi.zhuQi}</Badge>
        <Badge className="text-xs" style={{
          backgroundColor: `${LIU_QI_ATTRIBUTES[qi.keQi as keyof typeof LIU_QI_ATTRIBUTES]?.element ? WU_XING_ATTRIBUTES[LIU_QI_ATTRIBUTES[qi.keQi as keyof typeof LIU_QI_ATTRIBUTES].element]?.color : '#666'}20`,
          color: LIU_QI_ATTRIBUTES[qi.keQi as keyof typeof LIU_QI_ATTRIBUTES]?.element ? WU_XING_ATTRIBUTES[LIU_QI_ATTRIBUTES[qi.keQi as keyof typeof LIU_QI_ATTRIBUTES].element]?.color : '#666'
        }}>客气：{qi.keQi}</Badge>
        <Badge variant="outline" className="text-xs">{qi.keZhuRelation}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{qi.dateRange}</p>

      {/* Personal Warnings */}
      {qi.personalWarnings.length > 0 && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
          {qi.personalWarnings.map((w, i) => (
            <p key={i} className="text-xs text-destructive flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      {/* Climate */}
      <Section icon={<Cloud className="w-3.5 h-3.5" />} title="气候特征">
        <p className="text-sm text-muted-foreground leading-relaxed">{d.climate}</p>
      </Section>

      {/* Diseases */}
      <Section icon={<AlertTriangle className="w-3.5 h-3.5 text-destructive" />} title="易发疾病">
        <ul className="text-sm text-muted-foreground space-y-1">
          {d.diseases.map((dis, i) => <li key={i} className="leading-relaxed">· {dis}</li>)}
        </ul>
      </Section>

      {/* Food Therapy */}
      <Section icon={<Utensils className="w-3.5 h-3.5 text-green-600" />} title="食疗方案">
        <div className="space-y-2">
          <div>
            <h6 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">推荐食疗</h6>
            <ul className="text-sm text-muted-foreground space-y-0.5">
              {d.foodTherapy.recommended.map((f, i) => <li key={i}>· {f}</li>)}
            </ul>
          </div>
          <div>
            <h6 className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">忌口食物</h6>
            <ul className="text-sm text-muted-foreground space-y-0.5">
              {d.foodTherapy.forbidden.map((f, i) => <li key={i}>· {f}</li>)}
            </ul>
          </div>
        </div>
      </Section>

      {/* Tea */}
      <Section icon={<Coffee className="w-3.5 h-3.5 text-accent" />} title="代茶饮推荐">
        <div className="p-2.5 rounded-lg bg-accent/5">
          <h6 className="font-medium text-foreground text-sm">{d.teaFormula.name}</h6>
          <p className="text-xs text-muted-foreground mt-0.5">配方：{d.teaFormula.ingredients}</p>
          <p className="text-xs text-muted-foreground">用法：{d.teaFormula.method}</p>
          <p className="text-xs text-muted-foreground">功效：{d.teaFormula.effect}</p>
        </div>
      </Section>

      {/* Acupoints */}
      <Section icon={<HandMetal className="w-3.5 h-3.5 text-primary" />} title="穴位保健">
        <div className="space-y-2">
          {d.acupoints.map((a, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-medium text-sm text-foreground">{a.name}</span>
                <Badge variant="outline" className="text-[10px] h-4">{a.meridian}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">定位：{a.location}</p>
              <p className="text-xs text-muted-foreground">手法：{a.method}</p>
              <p className="text-xs text-muted-foreground">功效：{a.effect}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Lifestyle & Exercise & Emotional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <h6 className="text-xs font-medium flex items-center gap-1.5 mb-1">
            <Moon className="w-3 h-3" />起居调摄
          </h6>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {d.lifestyle.map((l, i) => <li key={i}>· {l}</li>)}
          </ul>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <h6 className="text-xs font-medium flex items-center gap-1.5 mb-1">
            <Dumbbell className="w-3 h-3" />运动建议
          </h6>
          <p className="text-xs text-muted-foreground leading-relaxed">{d.exercise}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary/30">
          <h6 className="text-xs font-medium flex items-center gap-1.5 mb-1">
            <Smile className="w-3 h-3" />情志调养
          </h6>
          <p className="text-xs text-muted-foreground leading-relaxed">{d.emotional}</p>
        </div>
      </div>

      {/* Prescription */}
      {qi.prescription && (
        <Section icon={<Pill className="w-3.5 h-3.5 text-primary" />} title={`参考方药：${qi.prescription.name}`}>
          <p className="text-xs text-muted-foreground">组成：{qi.prescription.composition.join('、')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">主治：{qi.prescription.indication}</p>
        </Section>
      )}
    </div>
  );
}

// ============================================================
// Prescription Tab
// ============================================================
function PrescriptionTab({ advice }: { advice: EnhancedHealthAdvice }) {
  return (
    <div className="space-y-4">
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2">
            <Pill className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">三因司天方说明</h4>
              <p className="text-xs text-muted-foreground">
                以下方药出自宋代陈无择《三因极一病证方论》，结合顾植山教授五运六气理论整理。
                仅供学习参考，具体用药请咨询专业中医师，切勿自行配药服用。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {advice.keyPrescriptions.map((p, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />{p.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h5 className="text-xs font-medium text-foreground mb-0.5">组成</h5>
              <p className="text-sm text-muted-foreground">{p.composition.join('、')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h5 className="text-xs font-medium text-foreground mb-0.5">用量</h5>
                <p className="text-sm text-muted-foreground">{p.dosage}</p>
              </div>
              <div>
                <h5 className="text-xs font-medium text-foreground mb-0.5">用法</h5>
                <p className="text-sm text-muted-foreground">{p.usage}</p>
              </div>
            </div>
            <div>
              <h5 className="text-xs font-medium text-foreground mb-0.5">主治</h5>
              <p className="text-sm text-muted-foreground">{p.indication}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-secondary/30">
              <h5 className="text-xs font-medium text-foreground mb-0.5">方解</h5>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.explanation}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Per-qi prescriptions */}
      <h3 className="font-serif font-medium text-foreground pt-2">各气推荐方药</h3>
      {advice.qiAdvices.filter(q => q.prescription).map((qi) => (
        <Card key={qi.qiIndex} className={qi.isCurrent ? 'border-primary/30' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {qi.isCurrent && <CircleDot className="w-3 h-3 text-primary" />}
              {qi.qiName} · {qi.prescription!.name}
            </CardTitle>
            <CardDescription className="text-xs">客气：{qi.keQi}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">组成：{qi.prescription!.composition.join('、')}</p>
            <p className="text-xs text-muted-foreground mt-1">功效：{qi.prescription!.explanation.slice(0, 80)}...</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================
// Lifestyle Tab
// ============================================================
function LifestyleTab({ advice }: { advice: EnhancedHealthAdvice }) {
  const c = advice.constitution;
  const currentQi = advice.qiAdvices.find(q => q.isCurrent);

  // Seasonal icons
  const seasonData = [
    { icon: <Leaf className="w-4 h-4 text-green-500" />, name: '春季', months: '2-4月', advice: getSeasonAdvice('spring', advice) },
    { icon: <Flame className="w-4 h-4 text-red-500" />, name: '夏季', months: '5-7月', advice: getSeasonAdvice('summer', advice) },
    { icon: <Droplets className="w-4 h-4 text-yellow-600" />, name: '长夏', months: '7-8月', advice: getSeasonAdvice('longSummer', advice) },
    { icon: <Cloud className="w-4 h-4 text-orange-500" />, name: '秋季', months: '8-10月', advice: getSeasonAdvice('autumn', advice) },
    { icon: <Snowflake className="w-4 h-4 text-blue-500" />, name: '冬季', months: '11-1月', advice: getSeasonAdvice('winter', advice) },
  ];

  return (
    <div className="space-y-4">
      {/* Daily Tea */}
      <Card className="border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Coffee className="w-4 h-4 text-accent" />
            体质日常代茶饮
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-accent/5">
            <h5 className="font-medium text-foreground">{c.dailyTea.name}</h5>
            <p className="text-sm text-muted-foreground mt-1">配方：{c.dailyTea.ingredients}</p>
            <p className="text-sm text-muted-foreground">功效：{c.dailyTea.effect}</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Tea */}
      {currentQi && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Coffee className="w-4 h-4 text-primary" />
              当前时令代茶饮 · {currentQi.qiName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 rounded-lg bg-primary/5">
              <h5 className="font-medium text-foreground">{currentQi.detail.teaFormula.name}</h5>
              <p className="text-sm text-muted-foreground mt-1">配方：{currentQi.detail.teaFormula.ingredients}</p>
              <p className="text-sm text-muted-foreground">用法：{currentQi.detail.teaFormula.method}</p>
              <p className="text-sm text-muted-foreground">功效：{currentQi.detail.teaFormula.effect}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nurture Points */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TreePine className="w-4 h-4 text-primary" />
            {c.name}养护要点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            {c.nurtureDetails.map((n, i) => <li key={i} className="leading-relaxed">· {n}</li>)}
          </ul>
        </CardContent>
      </Card>

      {/* Seasonal Guide */}
      <h3 className="font-serif font-medium text-foreground">四季养生指南</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {seasonData.map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {s.icon}{s.name}
                <span className="text-xs text-muted-foreground font-normal">{s.months}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.advice}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Lifestyle */}
      {currentQi && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-primary" />
              当前时令起居指导 · {currentQi.qiName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-secondary/30">
                <h6 className="text-xs font-medium flex items-center gap-1.5 mb-1"><Moon className="w-3 h-3" />起居</h6>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {currentQi.detail.lifestyle.map((l, i) => <li key={i}>· {l}</li>)}
                </ul>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary/30">
                <h6 className="text-xs font-medium flex items-center gap-1.5 mb-1"><Dumbbell className="w-3 h-3" />运动</h6>
                <p className="text-xs text-muted-foreground">{currentQi.detail.exercise}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-secondary/30">
                <h6 className="text-xs font-medium flex items-center gap-1.5 mb-1"><Smile className="w-3 h-3" />情志</h6>
                <p className="text-xs text-muted-foreground">{currentQi.detail.emotional}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Shared Components
// ============================================================
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h5 className="text-sm font-medium flex items-center gap-1.5">{icon}{title}</h5>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground w-20 flex-shrink-0">{label}：</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

// ============================================================
// Season Advice Helper
// ============================================================
function getSeasonAdvice(season: string, advice: EnhancedHealthAdvice): string {
  const c = advice.constitution;
  const organ = WU_XING_ATTRIBUTES[c.wuXing]?.organ || '';

  switch (season) {
    case 'spring':
      return `春季木气生发，肝气旺盛。${c.wuXing === '木' ? '您的木型体质此时宜柔肝缓急，防止肝气太过。' : `您的${c.name}此时宜顺应春气舒展，${c.nurturePrinciple}。`}早睡早起，多到户外踏青。饮食宜甘缓养脾，忌酸收太过。司天${advice.siTian.slice(0, 2)}对春季气候有影响，注意气候变化。`;
    case 'summer':
      return `夏季火气当令，心气旺盛。${c.wuXing === '火' ? '您的火型体质此时需特别注意清心降火。' : `注意养心安神，${c.wuXing === '金' ? '火克金，需保护肺气' : '保持心态平和'}。`}午间宜小憩养心，饮食宜苦味清心。避免暴晒过劳，汗后及时补水。`;
    case 'longSummer':
      return `长夏湿气偏重，脾胃易困。${c.wuXing === '土' ? '您的土型体质此时湿气影响最大，重点祛湿。' : `脾胃为后天之本，需重点保护${organ}。`}饮食清淡忌油腻，多食薏米、扁豆化湿。居住环境注意除湿通风。`;
    case 'autumn':
      return `秋季金气肃降，燥气偏盛。${c.wuXing === '金' ? '您的金型体质此时燥气叠加，重点润燥。' : `注意润肺养阴，保护${organ}。`}在泉${advice.zaiQuan.slice(0, 2)}影响下半年气候。饮食宜甘润，多食百合、银耳、梨。早卧早起，与鸡俱兴。`;
    case 'winter':
      return `冬季水气主令，寒气偏盛。${c.wuXing === '水' ? '您的水型体质此时同气叠加，需温阳御寒。' : `注意保暖防寒，保护${organ}。`}早卧晚起，必待日光。饮食宜温补，可食羊肉、核桃、桂圆。避免剧烈运动，宜收藏养肾。`;
    default:
      return '';
  }
}
