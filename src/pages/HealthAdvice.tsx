import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { generateYearHealthAdvice, YearHealthAdvice, QiHealthAdvice } from '@/lib/health-advice';
import { LIU_QI_ATTRIBUTES, WU_XING_ATTRIBUTES } from '@/lib/wuyun-liuqi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft,
  Heart,
  Calendar,
  Sun,
  Leaf,
  Snowflake,
  Cloud,
  Flame,
  Droplets,
  AlertTriangle,
  Shield,
  Utensils,
  Activity,
  BookOpen,
  Pill
} from 'lucide-react';

export default function HealthAdvice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuthContext();
  
  const [selectedYear, setSelectedYear] = useState<number>(
    parseInt(searchParams.get('year') || new Date().getFullYear().toString())
  );
  
  // 检查是否有出生年份
  const birthYear = profile?.birth_year;
  
  // 生成健康建议
  const healthAdvice = useMemo<YearHealthAdvice | null>(() => {
    if (!birthYear) return null;
    return generateYearHealthAdvice(selectedYear, birthYear);
  }, [selectedYear, birthYear]);
  
  // 年份选项
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);
  
  // 获取季节图标
  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return <Leaf className="w-5 h-5 text-green-500" />;
      case 'summer': return <Flame className="w-5 h-5 text-red-500" />;
      case 'longSummer': return <Droplets className="w-5 h-5 text-yellow-600" />;
      case 'autumn': return <Cloud className="w-5 h-5 text-orange-500" />;
      case 'winter': return <Snowflake className="w-5 h-5 text-blue-500" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };
  
  const seasonNames: Record<string, string> = {
    spring: '春季',
    summer: '夏季',
    longSummer: '长夏',
    autumn: '秋季',
    winter: '冬季'
  };

  if (!birthYear) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">需要完善出生信息</h2>
            <p className="text-muted-foreground mb-4">
              请先在个人中心填写您的出生年份，以便生成个性化的健康建议
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              返回完善信息
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-outline-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-serif font-semibold text-foreground">
                  个人健康建议
                </h1>
                <p className="text-sm text-muted-foreground">
                  出生年份：{birthYear}年 · {healthAdvice?.constitution.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {healthAdvice && (
          <div className="space-y-6">
            {/* 总体建议 */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  {selectedYear}年度养生总览
                </CardTitle>
                <CardDescription>
                  {healthAdvice.yearInfo.ganZhi}年 · {healthAdvice.yearInfo.daYun} · 
                  司天{healthAdvice.yearInfo.siTian.slice(0, 2)} · 在泉{healthAdvice.yearInfo.zaiQuan.slice(0, 2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {healthAdvice.overallAdvice}
                </p>
              </CardContent>
            </Card>

            {/* 体质分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  先天体质分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge 
                      className="text-base px-3 py-1"
                      style={{ 
                        backgroundColor: `${WU_XING_ATTRIBUTES[healthAdvice.constitution.wuXing]?.color}20`,
                        color: WU_XING_ATTRIBUTES[healthAdvice.constitution.wuXing]?.color
                      }}
                    >
                      {healthAdvice.constitution.name}
                    </Badge>
                    <span className="text-muted-foreground">
                      出生于{birthYear}年（{healthAdvice.birthYearInfo.ganZhi}年）
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <h4 className="font-medium text-foreground mb-2">体质特点</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {healthAdvice.constitution.features.map((f, i) => (
                          <li key={i}>· {f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/30">
                      <h4 className="font-medium text-foreground mb-2">养护要点</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {healthAdvice.constitution.nurture.map((n, i) => (
                          <li key={i}>· {n}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="seasons" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="seasons">四季养生</TabsTrigger>
                <TabsTrigger value="liuqi">六气详解</TabsTrigger>
                <TabsTrigger value="prescriptions">方药推荐</TabsTrigger>
                <TabsTrigger value="lifestyle">生活指导</TabsTrigger>
              </TabsList>

              {/* 四季养生 */}
              <TabsContent value="seasons">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(healthAdvice.seasonalAdvice).map(([season, advice]) => (
                    <Card key={season}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getSeasonIcon(season)}
                          {seasonNames[season]}养生
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {advice}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* 六气详解 */}
              <TabsContent value="liuqi">
                <Accordion type="single" collapsible className="space-y-2">
                  {healthAdvice.qiAdvices.map((qi) => (
                    <AccordionItem 
                      key={qi.qiIndex} 
                      value={`qi-${qi.qiIndex}`}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{qi.qiName}</Badge>
                          <span className="text-sm text-muted-foreground">{qi.dateRange}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <QiAdviceCard advice={qi} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* 方药推荐 */}
              <TabsContent value="prescriptions">
                <div className="space-y-4">
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Pill className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-foreground mb-1">三因司天方说明</h4>
                          <p className="text-sm text-muted-foreground">
                            以下方药出自宋代陈无择《三因极一病证方论》，结合顾植山教授五运六气理论整理。
                            仅供参考学习，具体用药请咨询专业中医师。
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {healthAdvice.keyPrescriptions.map((prescription, index) => (
                    <PrescriptionCard key={index} prescription={prescription} />
                  ))}

                  {healthAdvice.keyPrescriptions.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center text-muted-foreground">
                        暂无特定方药推荐
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* 生活指导 */}
              <TabsContent value="lifestyle">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-primary" />
                        饮食建议
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {healthAdvice.dietSummary.map((diet, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{diet}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        起居调摄
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {healthAdvice.lifestyleSummary.map((life, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{life}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

// 六气建议卡片组件
function QiAdviceCard({ advice }: { advice: QiHealthAdvice }) {
  return (
    <div className="space-y-4 pb-4">
      {/* 客主气信息 */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">主气：{advice.zhuQi}</Badge>
        <Badge 
          style={{ 
            backgroundColor: `${LIU_QI_ATTRIBUTES[advice.keQi]?.color}20`,
            color: LIU_QI_ATTRIBUTES[advice.keQi]?.color
          }}
        >
          客气：{advice.keQi}
        </Badge>
        <Badge variant="outline">{advice.keZhuRelation}</Badge>
      </div>

      {/* 气候特点 */}
      <div className="p-3 rounded-lg bg-secondary/30">
        <p className="text-sm text-muted-foreground">{advice.climateFeature}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 健康风险 */}
        <div>
          <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            健康风险
          </h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            {advice.healthRisk.map((risk, i) => (
              <li key={i}>· {risk}</li>
            ))}
          </ul>
        </div>

        {/* 预防措施 */}
        <div>
          <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            预防措施
          </h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            {advice.preventionAdvice.map((prev, i) => (
              <li key={i}>· {prev}</li>
            ))}
          </ul>
        </div>
      </div>

      <Separator />

      <div className="grid md:grid-cols-2 gap-4">
        {/* 饮食建议 */}
        <div>
          <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Utensils className="w-4 h-4 text-accent" />
            饮食调养
          </h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            {advice.dietAdvice.map((diet, i) => (
              <li key={i}>· {diet}</li>
            ))}
          </ul>
        </div>

        {/* 穴位建议 */}
        <div>
          <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-accent" />
            保健穴位
          </h5>
          <div className="flex flex-wrap gap-2">
            {advice.acupointAdvice.map((point, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {point}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 推荐方药 */}
      {advice.prescription && (
        <>
          <Separator />
          <div>
            <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-primary" />
              参考方药：{advice.prescription.name}
            </h5>
            <p className="text-xs text-muted-foreground">
              {advice.prescription.composition.join('、')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// 方药卡片组件
function PrescriptionCard({ prescription }: { prescription: { name: string; composition: string[]; dosage: string; usage: string; indication: string; explanation: string } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          {prescription.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h5 className="text-sm font-medium text-foreground mb-1">组成</h5>
          <p className="text-sm text-muted-foreground">
            {prescription.composition.join('、')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-foreground mb-1">用量</h5>
            <p className="text-sm text-muted-foreground">{prescription.dosage}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-foreground mb-1">用法</h5>
            <p className="text-sm text-muted-foreground">{prescription.usage}</p>
          </div>
        </div>
        <div>
          <h5 className="text-sm font-medium text-foreground mb-1">主治</h5>
          <p className="text-sm text-muted-foreground">{prescription.indication}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/30">
          <h5 className="text-sm font-medium text-foreground mb-1">方解</h5>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {prescription.explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
