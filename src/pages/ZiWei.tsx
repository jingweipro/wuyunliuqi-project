import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { calculateZiWei, GONG_NAMES, type GongInfo } from '@/lib/ziwei';
import { useAuth } from '@/hooks/use-auth';

const STAR_COLORS: Record<string, string> = {
  '紫微': '#7C3AED', '天机': '#2563EB', '太阳': '#DC2626', '武曲': '#9CA3AF',
  '天同': '#2563EB', '廉贞': '#DC2626', '天府': '#7C3AED', '太阴': '#2563EB',
  '贪狼': '#059669', '巨门': '#1E3A52', '天相': '#7C3AED', '天梁': '#059669',
  '七杀': '#DC2626', '破军': '#DC2626',
};

const SI_HUA_COLORS: Record<string, string> = {
  '化禄': '#059669', '化权': '#DC2626', '化科': '#2563EB', '化忌': '#1E3A52',
};

// 十二宫位置：按照传统命盘布局（方形，12格）
// 顺序：下(4)→右(4)→上(4)→左(4)
const GONG_LAYOUT: { row: number; col: number }[] = [
  // 底排从右到左：巳(5)午(6)未(7)申(8)
  { row: 3, col: 1 }, // 寅 - 索引0
  { row: 3, col: 0 }, // 丑 - 索引1
  { row: 0, col: 0 }, // 子 - 索引2 实际是左上
  // 修正：按地支子丑寅排列对应的格子位置
];

// 传统命盘方格布局（3x4外框）
// 格子位置对应地支:
//   巳(4,0) 午(4,1) 未(4,2) 申(4,3)
//   辰(3,0)                  酉(3,3)
//   卯(2,0)                  戌(2,3)
//   寅(1,0) 丑(1,1) 子(1,2) 亥(1,3)
const GRID_POS: Record<string, [number, number]> = {
  '巳': [0, 0], '午': [0, 1], '未': [0, 2], '申': [0, 3],
  '辰': [1, 0],                              '酉': [1, 3],
  '卯': [2, 0],                              '戌': [2, 3],
  '寅': [3, 0], '丑': [3, 1], '子': [3, 2], '亥': [3, 3],
};

const DI_ZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function GongCell({ gong, isMing, isShen }: { gong: GongInfo; isMing: boolean; isShen: boolean }) {
  return (
    <div className={`border border-border/50 p-1.5 md:p-2 h-full flex flex-col justify-between text-xs
      ${isMing ? 'bg-purple-50 border-purple-300' : isShen ? 'bg-blue-50 border-blue-300' : 'bg-card'}`}>
      {/* 宫名和地支 */}
      <div className="flex justify-between items-start">
        <span className={`font-bold text-[10px] md:text-xs ${isMing ? 'text-purple-700' : isShen ? 'text-blue-700' : 'text-muted-foreground'}`}>
          {gong.name}{isMing ? '(命)' : isShen ? '(身)' : ''}
        </span>
        <span className="text-[10px] text-muted-foreground">{gong.tianGan}{gong.diZhi}</span>
      </div>
      
      {/* 主星 */}
      <div className="flex-1 flex flex-col justify-center gap-0.5 my-1">
        {gong.stars.map((star, i) => (
          <div key={i} className="font-bold text-[11px] md:text-sm text-center" 
               style={{ color: STAR_COLORS[star] || '#333' }}>
            {star}
            {gong.siHua.filter((_, si) => si < gong.stars.length && si === i).map((sh, j) => (
              <span key={j} className="text-[9px] ml-0.5" style={{ color: SI_HUA_COLORS[sh] || '#666' }}>{sh}</span>
            ))}
          </div>
        ))}
        {gong.stars.length === 0 && (
          <div className="text-center text-muted-foreground text-[10px]">-</div>
        )}
      </div>
      
      {/* 辅星 */}
      <div className="flex flex-wrap gap-0.5 justify-center">
        {gong.fuStars.slice(0, 3).map((star, i) => (
          <span key={i} className="text-[9px] md:text-[10px] text-muted-foreground">{star}</span>
        ))}
      </div>
    </div>
  );
}

export default function ZiWei() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState(profile?.birth_year?.toString() || currentYear.toString());
  const [lunarMonth, setLunarMonth] = useState('1');
  const [lunarDay, setLunarDay] = useState('1');
  const [birthHour, setBirthHour] = useState('12');
  const [gender, setGender] = useState<'男' | '女'>('男');
  const [showResult, setShowResult] = useState(false);

  const years = Array.from({ length: 150 }, (_, i) => currentYear + 10 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const SHI_CHEN_LABELS = [
    '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)', '卯时 (05:00-07:00)',
    '辰时 (07:00-09:00)', '巳时 (09:00-11:00)', '午时 (11:00-13:00)', '未时 (13:00-15:00)',
    '申时 (15:00-17:00)', '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
  ];

  const result = showResult ? calculateZiWei(
    parseInt(birthYear), parseInt(lunarMonth), parseInt(lunarDay), parseInt(birthHour), gender
  ) : null;

  // 构建格子数据
  const gridCells: (GongInfo | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  
  if (result) {
    result.gongs.forEach((gong) => {
      const pos = GRID_POS[gong.diZhi];
      if (pos) {
        gridCells[pos[0]][pos[1]] = gong;
      }
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-serif font-bold">紫微斗数</h1>
            <p className="text-sm text-purple-200">排盘 · 十二宫位 · 星曜分析</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* 输入区 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg">输入出生信息（阴历）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">出生年（阳历）</Label>
                <Select value={birthYear} onValueChange={setBirthYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">阴历月</Label>
                <Select value={lunarMonth} onValueChange={setLunarMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m} value={m.toString()}>{m}月</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">阴历日</Label>
                <Select value={lunarDay} onValueChange={setLunarDay}>
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
                      <SelectItem key={i} value={((i * 2 + 23) % 24).toString()}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">性别</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as '男' | '女')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full bg-purple-700 hover:bg-purple-800" onClick={() => setShowResult(true)}>排盘</Button>
          </CardContent>
        </Card>

        {/* 命盘 */}
        {result && (
          <>
            {/* 基本信息 */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4 justify-center text-sm">
                  <div className="px-3 py-1 bg-purple-100 rounded-full text-purple-800 font-bold">
                    {result.wuxingJu}
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full">
                    命宫: {DI_ZHI_ORDER[result.mingGong]}
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full">
                    身宫: {DI_ZHI_ORDER[result.shenGong]}
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full">
                    {result.yinYang}{result.gender}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 命盘方格 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg text-center">紫微斗数命盘</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <div className="grid grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden"
                     style={{ minHeight: '500px' }}>
                  {gridCells.map((row, ri) =>
                    row.map((cell, ci) => {
                      // 中间两格（1,1 1,2 2,1 2,2）是空的
                      if ((ri === 1 || ri === 2) && (ci === 1 || ci === 2)) {
                        if (ri === 1 && ci === 1) {
                          return (
                            <div key={`${ri}-${ci}`} className="col-span-2 row-span-2 flex items-center justify-center bg-muted/20 border border-border/30"
                                 style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}>
                              <div className="text-center p-4">
                                <div className="text-2xl font-serif font-bold text-purple-700 mb-2">紫微斗数</div>
                                <div className="text-sm text-muted-foreground">
                                  {birthYear}年 阴历{lunarMonth}月{lunarDay}日
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {SHI_CHEN_LABELS[Math.floor(((parseInt(birthHour) + 1) % 24) / 2)]}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {gender} · {result.wuxingJu}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null; // 被合并的格子
                      }
                      
                      if (!cell) {
                        return <div key={`${ri}-${ci}`} className="border border-border/30 bg-muted/10 min-h-[100px] md:min-h-[125px]" />;
                      }
                      
                      const isMing = DI_ZHI_ORDER.indexOf(cell.diZhi) === result.mingGong;
                      const isShen = DI_ZHI_ORDER.indexOf(cell.diZhi) === result.shenGong;
                      
                      return (
                        <div key={`${ri}-${ci}`} className="min-h-[100px] md:min-h-[125px]">
                          <GongCell gong={cell} isMing={isMing} isShen={isShen} />
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 宫位详解 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">十二宫位详解</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.gongs.map((gong, i) => {
                    const isMing = DI_ZHI_ORDER.indexOf(gong.diZhi) === result.mingGong;
                    const isShen = DI_ZHI_ORDER.indexOf(gong.diZhi) === result.shenGong;
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${isMing ? 'border-purple-300 bg-purple-50' : isShen ? 'border-blue-300 bg-blue-50' : 'border-border bg-muted/20'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm">
                            {gong.name}{isMing ? ' (命宫)' : isShen ? ' (身宫)' : ''}
                          </span>
                          <span className="text-xs text-muted-foreground">{gong.tianGan}{gong.diZhi}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {gong.stars.map((star, j) => (
                            <span key={j} className="px-2 py-0.5 rounded text-xs font-bold text-white"
                                  style={{ backgroundColor: STAR_COLORS[star] || '#666' }}>
                              {star}
                            </span>
                          ))}
                          {gong.fuStars.map((star, j) => (
                            <span key={`fu-${j}`} className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                              {star}
                            </span>
                          ))}
                          {gong.siHua.map((sh, j) => (
                            <span key={`sh-${j}`} className="px-2 py-0.5 rounded text-xs text-white"
                                  style={{ backgroundColor: SI_HUA_COLORS[sh] || '#666' }}>
                              {sh}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
