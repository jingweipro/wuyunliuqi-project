import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, clearUser, UserInfo } from '@/lib/user-store';
import { getYearInfo, getCurrentQi, WU_XING_ATTRIBUTES, LIU_QI_ATTRIBUTES } from '@/lib/wuyun-liuqi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  LogOut, 
  Calendar, 
  User,
  BookOpen,
  CircleDot,
  Info,
  ChevronRight
} from 'lucide-react';
import WuYunLiuQiChart from '@/components/WuYunLiuQiChart';
import LiuQiTimeline from '@/components/LiuQiTimeline';
import KnowledgeSection from '@/components/KnowledgeSection';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('overview');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear + 50 - i);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // 如果用户有出生年份，默认显示出生年份
    if (currentUser.birthYear) {
      setSelectedYear(currentUser.birthYear);
    }
  }, [navigate]);

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const yearInfo = getYearInfo(selectedYear);
  const currentQiIndex = getCurrentQi();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-900 flex items-center justify-center">
              <span className="text-lg font-serif text-primary-foreground">运</span>
            </div>
            <div>
              <h1 className="font-serif text-lg text-foreground">五运六气</h1>
              <p className="text-xs text-muted-foreground">传统中医智慧</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-secondary text-foreground text-sm">
                  {user.nickname?.[0] || '访'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground hidden sm:inline">
                {user.nickname || '访客'}
              </span>
              {user.isAnonymous && (
                <Badge variant="secondary" className="text-xs">匿名</Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Year Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              {selectedYear}年 · {yearInfo.ganZhi}年
            </h2>
            <p className="text-muted-foreground mt-1">
              {yearInfo.description} · 司天{yearInfo.siTian.slice(0, 2)} · 在泉{yearInfo.zaiQuan.slice(0, 2)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-32">
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
            {user.birthYear && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedYear(user.birthYear!)}
              >
                我的出生年
              </Button>
            )}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-element-earth">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">大运(中运)</p>
              <p className="font-serif text-lg text-foreground">{yearInfo.daYun}</p>
              <Badge 
                variant="secondary" 
                className={yearInfo.taiGuoBuJi === '太过' ? 'bg-element-fire/10 text-element-fire' : 'bg-element-water/10 text-element-water'}
              >
                {yearInfo.taiGuoBuJi}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: WU_XING_ATTRIBUTES[LIU_QI_ATTRIBUTES[yearInfo.siTian].element].color }}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">司天</p>
              <p className="font-serif text-lg text-foreground">{yearInfo.siTian}</p>
              <p className="text-xs text-muted-foreground">{LIU_QI_ATTRIBUTES[yearInfo.siTian].nature}气主上半年</p>
            </CardContent>
          </Card>

          <Card className="border-l-4" style={{ borderLeftColor: WU_XING_ATTRIBUTES[LIU_QI_ATTRIBUTES[yearInfo.zaiQuan].element].color }}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">在泉</p>
              <p className="font-serif text-lg text-foreground">{yearInfo.zaiQuan}</p>
              <p className="text-xs text-muted-foreground">{LIU_QI_ATTRIBUTES[yearInfo.zaiQuan].nature}气主下半年</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">当前时令</p>
              <p className="font-serif text-lg text-foreground">
                {['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'][currentQiIndex]}
              </p>
              <p className="text-xs text-muted-foreground">
                主气: {yearInfo.zhuQi[currentQiIndex].slice(0, 2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <CircleDot className="w-4 h-4" />
              <span className="hidden sm:inline">总览图</span>
              <span className="sm:hidden">总览</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">六气时序</span>
              <span className="sm:hidden">时序</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">知识详解</span>
              <span className="sm:hidden">详解</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Main Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-primary" />
                    五运六气总览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WuYunLiuQiChart yearInfo={yearInfo} currentQiIndex={currentQiIndex} />
                </CardContent>
              </Card>

              {/* Year Summary */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-accent" />
                      年运解读
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium text-foreground mb-2">干支纪年</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedYear}年为<span className="text-primary font-medium">{yearInfo.ganZhi}年</span>，
                        天干<span className="text-primary">{yearInfo.gan}</span>属{TIAN_GAN_WU_YUN_DESC[yearInfo.gan]}，
                        地支<span className="text-primary">{yearInfo.zhi}</span>配{yearInfo.siTian}司天。
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium text-foreground mb-2">运气特点</h4>
                      <p className="text-sm text-muted-foreground">
                        本年{yearInfo.daYun}{yearInfo.taiGuoBuJi}，
                        {yearInfo.taiGuoBuJi === '太过' 
                          ? `${yearInfo.wuXing}气偏盛，需防${getKeElement(yearInfo.wuXing)}气受克` 
                          : `${yearInfo.wuXing}气不足，宜补${yearInfo.wuXing}养生`}。
                        上半年{LIU_QI_ATTRIBUTES[yearInfo.siTian].nature}气主令，
                        下半年{LIU_QI_ATTRIBUTES[yearInfo.zaiQuan].nature}气当权。
                      </p>
                    </div>

                    <Button variant="ghost" className="w-full justify-between" onClick={() => setActiveTab('knowledge')}>
                      查看完整知识详解
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Personal Info Card (if available) */}
                {user.birthYear && selectedYear === user.birthYear && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-serif text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        个人先天运气
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        您出生于{user.birthYear}年{user.birthMonth}月{user.birthDay}日，
                        先天禀赋为<span className="text-primary font-medium">{yearInfo.ganZhi}年</span>的运气特征，
                        主运{yearInfo.daYun}，司天{yearInfo.siTian}。
                        这影响着您的体质特点和易感疾病倾向。
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline">
            <LiuQiTimeline yearInfo={yearInfo} currentQiIndex={currentQiIndex} />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeSection yearInfo={yearInfo} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// 天干五运描述
const TIAN_GAN_WU_YUN_DESC: Record<string, string> = {
  '甲': '土运太过',
  '乙': '金运不及',
  '丙': '水运太过',
  '丁': '木运不及',
  '戊': '火运太过',
  '己': '土运不及',
  '庚': '金运太过',
  '辛': '水运不及',
  '壬': '木运太过',
  '癸': '火运不及',
};

// 获取被克的五行
function getKeElement(element: string): string {
  const keMap: Record<string, string> = {
    '木': '土',
    '火': '金',
    '土': '水',
    '金': '木',
    '水': '火',
  };
  return keMap[element] || '';
}
