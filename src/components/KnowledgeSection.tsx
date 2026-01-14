import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WU_XING, WU_XING_ATTRIBUTES, TIAN_GAN, DI_ZHI, LIU_QI_ORDER, LIU_QI_ATTRIBUTES, type LiuQi, type WuXing } from '@/lib/wuyun-liuqi';
import { BookOpen, Compass, Flame, Droplets, Wind, Mountain, Sparkles } from 'lucide-react';

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
  zhuYun: { xing: WuXing; name: string }[];
  keYun: { xing: WuXing; name: string; taiGuoBuJi: '太过' | '不及' }[];
  keZhuJiaLin: {
    qiIndex: number;
    qiName: string;
    zhuQi: LiuQi;
    keQi: LiuQi;
    relation: string;
    description: string;
  }[];
}

interface Props {
  yearInfo: YearInfo;
}

export default function KnowledgeSection({ yearInfo }: Props) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics">基础概念</TabsTrigger>
          <TabsTrigger value="wuxing">五行</TabsTrigger>
          <TabsTrigger value="wuyun">五运</TabsTrigger>
          <TabsTrigger value="liuqi">六气</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                什么是五运六气
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 border-l-4 border-l-primary">
                <h4 className="font-serif font-medium text-foreground mb-2">原文</h4>
                <p className="text-sm text-muted-foreground italic">
                  "夫五运阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也。"
                  <span className="block mt-1 text-xs">——《黄帝内经·素问·天元纪大论》</span>
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-medium text-foreground mb-2">白话解读</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  五运六气是中医学的重要理论体系，源自《黄帝内经》。它研究天体运动对自然界气候和人体健康的影响规律。
                  "五运"指木、火、土、金、水五种气运的变化，与天干相配；"六气"指风、寒、暑、湿、燥、火六种气候变化，与地支相配。
                  通过干支纪年，可以推算每年的运气特点，指导养生防病。
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="history">
                  <AccordionTrigger className="font-serif">历史渊源</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      五运六气理论形成于战国至秦汉时期，系统记载于《黄帝内经》中的"七篇大论"。
                      历代医家如唐代王冰、明代张景岳、清代黄元御等都有深入研究。
                      当代顾植山教授在传承基础上，结合临床实践，发展了五运六气的现代应用方法。
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="application">
                  <AccordionTrigger className="font-serif">临床应用</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      五运六气在中医临床中用于：1)预测疾病流行趋势；2)指导时令养生；3)辅助辨证论治；4)选择用药时机。
                      "因时制宜"是中医治疗的重要原则，五运六气提供了时间医学的理论框架。
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-accent" />
                天干地支
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-medium text-foreground mb-3">十天干</h4>
                  <div className="flex flex-wrap gap-2">
                    {TIAN_GAN.map((gan, index) => (
                      <div 
                        key={gan}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-serif text-sm border ${
                          gan === yearInfo.gan 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-card text-foreground border-border'
                        }`}
                      >
                        {gan}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    天干配五运：甲己土、乙庚金、丙辛水、丁壬木、戊癸火
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30">
                  <h4 className="font-medium text-foreground mb-3">十二地支</h4>
                  <div className="flex flex-wrap gap-2">
                    {DI_ZHI.map((zhi) => (
                      <div 
                        key={zhi}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-serif text-sm border ${
                          zhi === yearInfo.zhi 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-card text-foreground border-border'
                        }`}
                      >
                        {zhi}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    地支配六气：子午少阴、丑未太阴、寅申少阳、卯酉阳明、辰戌太阳、巳亥厥阴
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wuxing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">五行详解</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {WU_XING.map((xing) => {
                  const attr = WU_XING_ATTRIBUTES[xing];
                  const isActive = xing === yearInfo.wuXing;
                  const icons: Record<string, React.ReactNode> = {
                    '木': <Wind className="w-5 h-5" />,
                    '火': <Flame className="w-5 h-5" />,
                    '土': <Mountain className="w-5 h-5" />,
                    '金': <Sparkles className="w-5 h-5" />,
                    '水': <Droplets className="w-5 h-5" />,
                  };

                  return (
                    <div 
                      key={xing}
                      className={`p-4 rounded-lg border-l-4 ${
                        isActive ? 'bg-secondary/50' : 'bg-card'
                      }`}
                      style={{ borderLeftColor: attr.color }}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: attr.color, color: xing === '金' ? '#333' : '#fff' }}
                        >
                          {icons[xing]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-serif text-lg text-foreground">{xing}</h4>
                            {isActive && (
                              <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">
                                今年主运
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">方位：</span>
                              <span className="text-foreground">{attr.direction}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">季节：</span>
                              <span className="text-foreground">{attr.season}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">脏腑：</span>
                              <span className="text-foreground">{attr.organ}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">情志：</span>
                              <span className="text-foreground">{attr.emotion}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary/30">
                <h4 className="font-medium text-foreground mb-2">五行生克</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="text-foreground font-medium">相生：</span>木生火，火生土，土生金，金生水，水生木</p>
                  <p><span className="text-foreground font-medium">相克：</span>木克土，土克水，水克火，火克金，金克木</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wuyun" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">五运详解</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 border-l-4 border-l-primary">
                <h4 className="font-serif font-medium text-foreground mb-2">原文</h4>
                <p className="text-sm text-muted-foreground italic">
                  "甲己之岁，土运统之；乙庚之岁，金运统之；丙辛之岁，水运统之；丁壬之岁，木运统之；戊癸之岁，火运统之。"
                  <span className="block mt-1 text-xs">——《黄帝内经·素问·天元纪大论》</span>
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  { gan: ['甲', '己'], yun: '土运', xing: '土' as const },
                  { gan: ['乙', '庚'], yun: '金运', xing: '金' as const },
                  { gan: ['丙', '辛'], yun: '水运', xing: '水' as const },
                  { gan: ['丁', '壬'], yun: '木运', xing: '木' as const },
                  { gan: ['戊', '癸'], yun: '火运', xing: '火' as const },
                ].map((item) => {
                  const isActive = item.gan.includes(yearInfo.gan);
                  const attr = WU_XING_ATTRIBUTES[item.xing];

                  return (
                    <div 
                      key={item.yun}
                      className={`p-4 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-serif"
                          style={{ backgroundColor: attr.color, color: item.xing === '金' ? '#333' : '#fff' }}
                        >
                          {item.xing}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.yun}</span>
                            {isActive && (
                              <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">
                                本年
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.gan[0]}年{item.yun}太过，{item.gan[1]}年{item.yun}不及
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-medium text-foreground mb-2">太过与不及</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  阳干（甲丙戊庚壬）之年为太过，该运之气偏盛；阴干（乙丁己辛癸）之年为不及，该运之气偏弱。
                  太过之年易见该气所主之病，不及之年易见该气所克或被克之病。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liuqi" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">六气详解</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 border-l-4 border-l-primary">
                <h4 className="font-serif font-medium text-foreground mb-2">原文</h4>
                <p className="text-sm text-muted-foreground italic">
                  "厥阴之上，风气主之；少阴之上，热气主之；太阴之上，湿气主之；少阳之上，相火主之；阳明之上，燥气主之；太阳之上，寒气主之。"
                  <span className="block mt-1 text-xs">——《黄帝内经·素问·天元纪大论》</span>
                </p>
              </div>

              <div className="grid gap-4">
                {LIU_QI_ORDER.map((qi) => {
                  const attr = LIU_QI_ATTRIBUTES[qi];
                  const xingAttr = WU_XING_ATTRIBUTES[attr.element];
                  const isSiTian = qi === yearInfo.siTian;
                  const isZaiQuan = qi === yearInfo.zaiQuan;

                  return (
                    <div 
                      key={qi}
                      className={`p-4 rounded-lg border-l-4 ${
                        isSiTian || isZaiQuan ? 'bg-secondary/50' : 'bg-card'
                      }`}
                      style={{ borderLeftColor: xingAttr.color }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm"
                            style={{ 
                              backgroundColor: xingAttr.color, 
                              color: attr.element === '金' ? '#333' : '#fff' 
                            }}
                          >
                            {attr.nature}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-medium text-foreground">{qi}</span>
                              {isSiTian && (
                                <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">司天</span>
                              )}
                              {isZaiQuan && (
                                <span className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">在泉</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{attr.period}</p>
                          </div>
                        </div>
                        <div className="flex-1 text-sm text-muted-foreground">
                          属{attr.element}，主{attr.nature}气
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-lg bg-card border">
                <h4 className="font-medium text-foreground mb-2">司天在泉</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  每年的六气中，三之气称为"司天"，主导上半年气候；终之气称为"在泉"，主导下半年气候。
                  司天在泉根据年支确定：子午少阴、丑未太阴、寅申少阳、卯酉阳明、辰戌太阳、巳亥厥阴。
                  司天与在泉相对，形成六对关系。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
