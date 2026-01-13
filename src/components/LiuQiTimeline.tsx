import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WU_XING_ATTRIBUTES, LIU_QI_ATTRIBUTES, getQiPeriodRange, type LiuQi } from '@/lib/wuyun-liuqi';

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

const QI_NAMES = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'];

export default function LiuQiTimeline({ yearInfo, currentQiIndex }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">六气时序详解</CardTitle>
          <p className="text-sm text-muted-foreground">
            {yearInfo.year}年六气运行规律，主气固定不变，客气随年支变化
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {QI_NAMES.map((name, index) => {
              const zhuQi = yearInfo.zhuQi[index];
              const keQi = yearInfo.keQi[index];
              const zhuElement = LIU_QI_ATTRIBUTES[zhuQi].element;
              const keElement = LIU_QI_ATTRIBUTES[keQi].element;
              const isCurrent = index === currentQiIndex;
              const isSiTian = index === 2; // 三之气为司天
              const isZaiQuan = index === 5; // 终之气为在泉

              return (
                <div
                  key={index}
                  className={`relative p-4 rounded-lg border transition-all duration-300 ${
                    isCurrent 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  {/* 时间指示线 */}
                  {index < 5 && (
                    <div className="absolute left-7 top-full w-0.5 h-4 bg-border" />
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* 序号 */}
                    <div 
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm ${
                        isCurrent 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-serif text-foreground">{name}</span>
                        <span className="text-xs text-muted-foreground">
                          {getQiPeriodRange(index)}
                        </span>
                        {isCurrent && (
                          <Badge variant="default" className="bg-primary">当前</Badge>
                        )}
                        {isSiTian && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">司天主气</Badge>
                        )}
                        {isZaiQuan && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">在泉主气</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* 主气 */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">主气(固定)</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: WU_XING_ATTRIBUTES[zhuElement].color }}
                            />
                            <span className="text-sm font-medium text-foreground">{zhuQi}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {LIU_QI_ATTRIBUTES[zhuQi].nature}气 · {zhuElement}
                          </p>
                        </div>

                        {/* 客气 */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">客气(流转)</p>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: WU_XING_ATTRIBUTES[keElement].color }}
                            />
                            <span className="text-sm font-medium text-foreground">{keQi}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {LIU_QI_ATTRIBUTES[keQi].nature}气 · {keElement}
                          </p>
                        </div>
                      </div>

                      {/* 气候特点 */}
                      <div className="mt-3 p-2 rounded bg-secondary/50">
                        <p className="text-xs text-muted-foreground">
                          {getQiDescription(zhuQi, keQi, yearInfo.taiGuoBuJi)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 补充说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">主客加临说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/30">
              <h4 className="font-medium text-foreground mb-2">主气</h4>
              <p className="text-sm text-muted-foreground">
                主气是地球自身的气候规律，每年固定不变，从厥阴风木开始，依次轮转。
                代表地气的基本变化。
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30">
              <h4 className="font-medium text-foreground mb-2">客气</h4>
              <p className="text-sm text-muted-foreground">
                客气随年支变化，代表天气对地气的影响。三之气为司天，终之气为在泉，
                分别主导上下半年的气候特征。
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
            <h4 className="font-medium text-foreground mb-2">本年运气特点</h4>
            <p className="text-sm text-muted-foreground">
              {yearInfo.year}年{yearInfo.ganZhi}，{yearInfo.daYun}{yearInfo.taiGuoBuJi}，
              {yearInfo.siTian}司天，{yearInfo.zaiQuan}在泉。
              上半年以{LIU_QI_ATTRIBUTES[yearInfo.siTian].nature}气为主，
              下半年以{LIU_QI_ATTRIBUTES[yearInfo.zaiQuan].nature}气为主。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 获取主客加临的气候描述
function getQiDescription(zhuQi: LiuQi, keQi: LiuQi, taiGuoBuJi: string): string {
  const zhuNature = LIU_QI_ATTRIBUTES[zhuQi].nature;
  const keNature = LIU_QI_ATTRIBUTES[keQi].nature;
  
  if (zhuQi === keQi) {
    return `主客同气，${zhuNature}气偏盛，易见${zhuNature}邪致病，宜防${zhuNature}气太过。`;
  }
  
  const natureRelation = getNatureRelation(zhuNature, keNature);
  return `主气${zhuNature}，客气${keNature}，${natureRelation}。${taiGuoBuJi === '太过' ? '运气偏盛' : '运气偏弱'}，养生需顺应时令。`;
}

// 获取两种气之间的关系描述
function getNatureRelation(zhu: string, ke: string): string {
  const relations: Record<string, Record<string, string>> = {
    '风': { '热': '风热相搏', '暑': '风暑交蒸', '湿': '风湿相兼', '燥': '风燥并行', '寒': '风寒束表' },
    '热': { '风': '热风上扬', '暑': '暑热同源', '湿': '湿热蕴蒸', '燥': '燥热伤津', '寒': '寒热交争' },
    '暑': { '风': '暑风蒸腾', '热': '暑热交迫', '湿': '暑湿困脾', '燥': '暑燥伤肺', '寒': '暑寒相搏' },
    '湿': { '风': '风湿相搏', '热': '湿热内蕴', '暑': '湿暑困脾', '燥': '燥湿相争', '寒': '寒湿凝滞' },
    '燥': { '风': '风燥伤肺', '热': '燥热伤阴', '暑': '暑燥耗气', '湿': '燥湿相济', '寒': '凉燥犯肺' },
    '寒': { '风': '风寒外袭', '热': '寒热往来', '暑': '寒暑交替', '湿': '寒湿困脾', '燥': '寒燥凝滞' },
  };
  
  return relations[zhu]?.[ke] || '阴阳调和';
}
