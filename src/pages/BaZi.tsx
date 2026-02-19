import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { calculateBaZi, GAN_WUXING, GAN_YINYANG } from '@/lib/bazi';
import { useAuth } from '@/hooks/use-auth';

const WUXING_COLORS: Record<string, string> = {
  '木': '#1A8A5C', '火': '#D4301F', '土': '#C88A2E', '金': '#9CA3AF', '水': '#1E3A52'
};

const SHI_CHEN_LABELS = [
  '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)', '卯时 (05:00-07:00)',
  '辰时 (07:00-09:00)', '巳时 (09:00-11:00)', '午时 (11:00-13:00)', '未时 (13:00-15:00)',
  '申时 (15:00-17:00)', '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
];

export default function BaZi() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState(profile?.birth_year?.toString() || currentYear.toString());
  const [birthMonth, setBirthMonth] = useState(profile?.birth_month?.toString() || '1');
  const [birthDay, setBirthDay] = useState(profile?.birth_day?.toString() || '1');
  const [birthHour, setBirthHour] = useState(profile?.birth_hour?.toString() || '12');
  const [showResult, setShowResult] = useState(false);

  const years = Array.from({ length: 150 }, (_, i) => currentYear + 10 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleCalculate = () => {
    setShowResult(true);
  };

  const bazi = showResult ? calculateBaZi(
    parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay), parseInt(birthHour)
  ) : null;

  const pillars = bazi ? [
    { label: '年柱', ...bazi.yearPillar, shiShenGan: bazi.shiShen.yearGan, shiShenZhi: bazi.shiShen.yearZhi, cangGan: bazi.cangGan.year },
    { label: '月柱', ...bazi.monthPillar, shiShenGan: bazi.shiShen.monthGan, shiShenZhi: bazi.shiShen.monthZhi, cangGan: bazi.cangGan.month },
    { label: '日柱', ...bazi.dayPillar, shiShenGan: '日主', shiShenZhi: bazi.shiShen.dayZhi, cangGan: bazi.cangGan.day },
    { label: '时柱', ...bazi.hourPillar, shiShenGan: bazi.shiShen.hourGan, shiShenZhi: bazi.shiShen.hourZhi, cangGan: bazi.cangGan.hour },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-serif font-bold">八字排盘</h1>
            <p className="text-sm text-red-200">四柱八字 · 五行分析 · 十神关系</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 输入区 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg">输入出生信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">出生年</Label>
                <Select value={birthYear} onValueChange={setBirthYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">月</Label>
                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m.toString()}>{m}月</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">日</Label>
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {days.map(d => <SelectItem key={d} value={d.toString()}>{d}日</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">时辰</Label>
                <Select value={birthHour} onValueChange={setBirthHour}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {SHI_CHEN_LABELS.map((label, i) => (
                      <SelectItem key={i} value={(i * 2 + 23) % 24 + ''}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-red-700 hover:bg-red-800" onClick={handleCalculate}>排盘</Button>
          </CardContent>
        </Card>

        {/* 结果展示 */}
        {bazi && (
          <>
            {/* 四柱八字 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-red-600" />
                  四柱八字
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                  {pillars.map((p, idx) => (
                    <div key={idx} className="text-center">
                      {/* 十神 */}
                      <div className="text-xs text-muted-foreground mb-1">{p.shiShenGan}</div>
                      {/* 标签 */}
                      <div className="text-xs font-bold text-red-700 mb-1">{p.label}</div>
                      {/* 天干 */}
                      <div 
                        className="text-2xl md:text-3xl font-serif font-bold py-2 rounded-t-lg border-2 border-b-0"
                        style={{ 
                          color: WUXING_COLORS[GAN_WUXING[p.gan]], 
                          borderColor: WUXING_COLORS[GAN_WUXING[p.gan]] + '40',
                          backgroundColor: WUXING_COLORS[GAN_WUXING[p.gan]] + '10'
                        }}
                      >
                        {p.gan}
                      </div>
                      {/* 地支 */}
                      <div 
                        className="text-2xl md:text-3xl font-serif font-bold py-2 rounded-b-lg border-2 border-t"
                        style={{ 
                          color: '#fff',
                          borderColor: WUXING_COLORS[GAN_WUXING[p.gan]] + '40',
                          backgroundColor: WUXING_COLORS[GAN_WUXING[p.gan]]
                        }}
                      >
                        {p.zhi}
                      </div>
                      {/* 五行 */}
                      <div className="text-xs mt-1 text-muted-foreground">
                        {GAN_WUXING[p.gan]}{GAN_YINYANG[p.gan]}
                      </div>
                      {/* 纳音 */}
                      <div className="text-xs text-muted-foreground">{p.naYin}</div>
                      {/* 十神(地支) */}
                      <div className="text-xs text-muted-foreground mt-1">{p.shiShenZhi}</div>
                      {/* 藏干 */}
                      <div className="text-xs text-muted-foreground mt-1">
                        藏: {p.cangGan.join(' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 五行分析 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">五行力量分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(bazi.wuxingCount).map(([wx, count]) => {
                    const max = Math.max(...Object.values(bazi.wuxingCount));
                    const pct = max > 0 ? (count / max) * 100 : 0;
                    return (
                      <div key={wx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                             style={{ backgroundColor: WUXING_COLORS[wx] }}>
                          {wx}
                        </div>
                        <div className="flex-1">
                          <div className="h-6 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500 flex items-center px-2"
                                 style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: WUXING_COLORS[wx] }}>
                              <span className="text-xs text-white font-bold">{count.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{bazi.wuxingAnalysis}</p>
                </div>
              </CardContent>
            </Card>

            {/* 日主分析 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">日主信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-3xl font-serif font-bold" style={{ color: WUXING_COLORS[bazi.dayMasterWuxing] }}>
                      {bazi.dayMaster}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">日主天干</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold" style={{ color: WUXING_COLORS[bazi.dayMasterWuxing] }}>
                      {bazi.dayMasterWuxing}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">五行属性</div>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-xl font-bold">{bazi.dayMasterYinYang}</div>
                    <div className="text-sm text-muted-foreground mt-1">阴阳属性</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
