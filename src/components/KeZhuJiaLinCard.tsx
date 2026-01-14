import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  WU_XING_ATTRIBUTES, 
  LIU_QI_ATTRIBUTES,
  QI_PERIODS,
  getCurrentQi,
  type LiuQi 
} from '@/lib/wuyun-liuqi';
import { ArrowRight, Zap, Heart, Shield } from 'lucide-react';

interface KeZhuJiaLinItem {
  qiIndex: number;
  qiName: string;
  zhuQi: LiuQi;
  keQi: LiuQi;
  relation: string;
  description: string;
}

interface Props {
  keZhuJiaLin: KeZhuJiaLinItem[];
  siTian: LiuQi;
  zaiQuan: LiuQi;
}

export default function KeZhuJiaLinCard({ keZhuJiaLin, siTian, zaiQuan }: Props) {
  const currentQiIndex = getCurrentQi();

  // 关系类型对应的样式
  const relationStyles: Record<string, { color: string; icon: React.ReactNode }> = {
    '同气': { color: 'bg-amber-500/20 text-amber-600', icon: <Zap className="w-3 h-3" /> },
    '客生主·顺': { color: 'bg-green-500/20 text-green-600', icon: <Heart className="w-3 h-3" /> },
    '主生客·逆': { color: 'bg-orange-500/20 text-orange-600', icon: <ArrowRight className="w-3 h-3" /> },
    '客克主·逆': { color: 'bg-red-500/20 text-red-600', icon: <Zap className="w-3 h-3" /> },
    '主克客·顺': { color: 'bg-blue-500/20 text-blue-600', icon: <Shield className="w-3 h-3" /> },
    '相离': { color: 'bg-gray-500/20 text-gray-600', icon: <ArrowRight className="w-3 h-3" /> },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">客主加临分析</CardTitle>
        <p className="text-sm text-muted-foreground">
          主气固定不变，客气随年支变化。三之气为司天（{siTian}），终之气为在泉（{zaiQuan}）。
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keZhuJiaLin.map((item) => {
            const zhuElement = LIU_QI_ATTRIBUTES[item.zhuQi].element;
            const keElement = LIU_QI_ATTRIBUTES[item.keQi].element;
            const isCurrent = item.qiIndex === currentQiIndex;
            const isSiTian = item.qiIndex === 2;
            const isZaiQuan = item.qiIndex === 5;
            const period = QI_PERIODS[item.qiIndex];
            const relationStyle = relationStyles[item.relation] || relationStyles['相离'];

            return (
              <div
                key={item.qiIndex}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {/* 头部 */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`font-serif text-base ${isCurrent ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {item.qiName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {period.jieQiStart} - {period.jieQiEnd}
                  </span>
                  {isCurrent && (
                    <Badge variant="default" className="bg-primary text-xs">当前</Badge>
                  )}
                  {isSiTian && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">司天主气</Badge>
                  )}
                  {isZaiQuan && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent-foreground text-xs">在泉主气</Badge>
                  )}
                </div>

                {/* 主客气对比 */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  {/* 主气 */}
                  <div className="flex-1 p-3 rounded-lg bg-secondary/50">
                    <div className="text-xs text-muted-foreground mb-1">主气（固定）</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: WU_XING_ATTRIBUTES[zhuElement].color }}
                      />
                      <span className="font-serif text-sm text-foreground">{item.zhuQi}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {LIU_QI_ATTRIBUTES[item.zhuQi].nature}气 · {zhuElement}
                    </div>
                  </div>

                  {/* 关系指示 */}
                  <div className="flex flex-col items-center">
                    <Badge className={`${relationStyle.color} flex items-center gap-1 text-xs`}>
                      {relationStyle.icon}
                      {item.relation}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground my-1" />
                  </div>

                  {/* 客气 */}
                  <div className="flex-1 p-3 rounded-lg bg-secondary/50">
                    <div className="text-xs text-muted-foreground mb-1">客气（流转）</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: WU_XING_ATTRIBUTES[keElement].color }}
                      />
                      <span className="font-serif text-sm text-foreground">{item.keQi}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {LIU_QI_ATTRIBUTES[item.keQi].nature}气 · {keElement}
                    </div>
                  </div>
                </div>

                {/* 解读 */}
                <div className="p-3 rounded bg-card border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 补充说明 */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
          <h4 className="font-medium text-foreground mb-2">客主加临说明</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <span className="text-green-600 font-medium">顺</span>：客生主、主克客为顺，气候和平，万物安泰。
            </p>
            <p>
              <span className="text-red-600 font-medium">逆</span>：客克主、主生客为逆，气候失常，易生疾病。
            </p>
            <p>
              <span className="text-amber-600 font-medium">同气</span>：主客相同，该气偏盛，需防太过。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
