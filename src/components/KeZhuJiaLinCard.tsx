import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  WU_XING_ATTRIBUTES, 
  LIU_QI_ATTRIBUTES,
  QI_PERIODS,
  getCurrentQi,
  type LiuQi 
} from '@/lib/wuyun-liuqi';
import { ArrowRight, Zap, Heart, Shield, ArrowDown } from 'lucide-react';

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

// 关系类型样式映射
function getRelationStyle(relation: string) {
  if (relation.includes('相得')) {
    return { bgColor: 'bg-green-500/15', textColor: 'text-green-700', icon: <Heart className="w-3 h-3" /> };
  }
  if (relation.includes('顺')) {
    return { bgColor: 'bg-blue-500/15', textColor: 'text-blue-700', icon: <Shield className="w-3 h-3" /> };
  }
  if (relation.includes('逆')) {
    return { bgColor: 'bg-red-500/15', textColor: 'text-red-700', icon: <Zap className="w-3 h-3" /> };
  }
  if (relation.includes('泄')) {
    return { bgColor: 'bg-orange-500/15', textColor: 'text-orange-700', icon: <ArrowDown className="w-3 h-3" /> };
  }
  if (relation.includes('胜')) {
    return { bgColor: 'bg-purple-500/15', textColor: 'text-purple-700', icon: <Shield className="w-3 h-3" /> };
  }
  return { bgColor: 'bg-gray-500/15', textColor: 'text-gray-600', icon: <ArrowRight className="w-3 h-3" /> };
}

export default function KeZhuJiaLinCard({ keZhuJiaLin, siTian, zaiQuan }: Props) {
  const currentQiIndex = getCurrentQi();

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
            const style = getRelationStyle(item.relation);

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
                    {period.jieQiStart} - {period.jieQiEnd}（{period.dateRange}）
                  </span>
                  {isCurrent && (
                    <Badge variant="default" className="bg-primary text-xs">当前</Badge>
                  )}
                  {isSiTian && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">司天</Badge>
                  )}
                  {isZaiQuan && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">在泉</Badge>
                  )}
                </div>

                {/* 主客气对比 */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  {/* 主气 */}
                  <div className="flex-1 p-3 rounded-lg bg-secondary/50">
                    <div className="text-xs text-muted-foreground mb-1">主气（固定）</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: WU_XING_ATTRIBUTES[zhuElement].color }}
                      />
                      <span className="font-serif text-sm text-foreground font-medium">{item.zhuQi}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {LIU_QI_ATTRIBUTES[item.zhuQi].nature}气 · {zhuElement}
                    </div>
                  </div>

                  {/* 关系指示 */}
                  <div className="flex flex-col items-center gap-1">
                    <Badge className={`${style.bgColor} ${style.textColor} flex items-center gap-1 text-xs px-2 py-1`}>
                      {style.icon}
                      {item.relation.split('（')[0]}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* 客气 */}
                  <div className="flex-1 p-3 rounded-lg bg-secondary/50">
                    <div className="text-xs text-muted-foreground mb-1">客气（流转）</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: WU_XING_ATTRIBUTES[keElement].color }}
                      />
                      <span className="font-serif text-sm text-foreground font-medium">{item.keQi}</span>
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
          <h4 className="font-medium text-foreground mb-2">客主加临关系说明</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <span className="text-green-700 font-medium">相得</span>：主客同属一个五行，气候偏盛，需防太过。
            </p>
            <p>
              <span className="text-blue-700 font-medium">顺（客生主）</span>：客气五行生主气五行，客来助主，气候和平。
            </p>
            <p>
              <span className="text-red-700 font-medium">逆（客克主）</span>：客气五行克主气五行，客胜主负，当防胜复。
            </p>
            <p>
              <span className="text-orange-700 font-medium">泄（主生客）</span>：主气五行生客气五行，地气外泄，正气耗散。
            </p>
            <p>
              <span className="text-purple-700 font-medium">胜（主克客）</span>：主气五行克客气五行，地气制天，秩序有常。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
