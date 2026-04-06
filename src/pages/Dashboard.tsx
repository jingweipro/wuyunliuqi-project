import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { getYearInfo, getCurrentQi, WU_XING_ATTRIBUTES, LIU_QI_ATTRIBUTES } from '@/lib/wuyun-liuqi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Calendar, 
  User,
  BookOpen,
  CircleDot,
  Info,
  ChevronRight,
  Settings,
  Layers,
  Wind,
  BookMarked,
  Heart,
  Shield,
  Sparkles
} from 'lucide-react';
import WuYunChart from '@/components/WuYunChart';
import LiuQiChart from '@/components/LiuQiChart';
import KeZhuJiaLinCard from '@/components/KeZhuJiaLinCard';
import KnowledgeSection from '@/components/KnowledgeSection';
import LunarDatePicker from '@/components/LunarDatePicker';
import { CHINA_REGIONS, getCitiesByProvince, getDistrictsByCity } from '@/lib/china-regions';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, updateProfile } = useAuthContext();
  const { toast } = useToast();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('overview');
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  // 编辑资料表单
  const [editNickname, setEditNickname] = useState('');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editBirthMonth, setEditBirthMonth] = useState('');
  const [editBirthDay, setEditBirthDay] = useState('');
  const [editBirthHour, setEditBirthHour] = useState('');
  const [editBirthMinute, setEditBirthMinute] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 150 }, (_, i) => currentYear + 50 - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  
  // 十二时辰对应
  const shiChen = ['子时(23-1)', '丑时(1-3)', '寅时(3-5)', '卯时(5-7)', '辰时(7-9)', '巳时(9-11)', 
                   '午时(11-13)', '未时(13-15)', '申时(15-17)', '酉时(17-19)', '戌时(19-21)', '亥时(21-23)'];
  const getShiChen = (hour: number) => shiChen[Math.floor(((hour + 1) % 24) / 2)];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile?.birth_year) {
      setSelectedYear(profile.birth_year);
    }
  }, [profile]);

  // 初始化编辑表单
  useEffect(() => {
    if (profile) {
      setEditNickname(profile.nickname || '');
      setEditBirthYear(profile.birth_year?.toString() || '');
      setEditBirthMonth(profile.birth_month?.toString() || '');
      setEditBirthDay(profile.birth_day?.toString() || '');
      setEditBirthHour(profile.birth_hour?.toString() ?? '');
      setEditBirthMinute(profile.birth_minute?.toString() ?? '');
      setEditRegion(profile.region || '');
      setEditCity(profile.city || '');
      setEditDistrict(profile.district || '');
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast({
        title: '登出失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        nickname: editNickname || null,
        birth_year: editBirthYear ? parseInt(editBirthYear) : null,
        birth_month: editBirthMonth ? parseInt(editBirthMonth) : null,
        birth_day: editBirthDay ? parseInt(editBirthDay) : null,
        birth_hour: editBirthHour !== '' ? parseInt(editBirthHour) : null,
        birth_minute: editBirthMinute !== '' ? parseInt(editBirthMinute) : null,
        region: editRegion || null,
        city: editCity || null,
        district: editDistrict || null,
      });
      toast({ title: '保存成功', description: '个人信息已更新' });
      setProfileDialogOpen(false);
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const yearInfo = getYearInfo(selectedYear);
  const currentQiIndex = getCurrentQi();

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-900 flex items-center justify-center">
            <span className="text-2xl font-serif text-primary-foreground">运</span>
          </div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.nickname || user.email?.split('@')[0] || '访客';
  const isAnonymous = user.is_anonymous || profile?.is_anonymous;

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
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary text-foreground text-sm">
                      {displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground hidden sm:inline">
                    {displayName}
                  </span>
                  {isAnonymous && (
                    <Badge variant="secondary" className="text-xs">匿名</Badge>
                  )}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-serif flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    个人信息
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>昵称</Label>
                    <Input
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="请输入昵称"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>出生日期（支持阳历/阴历切换）</Label>
                    <LunarDatePicker
                      solarYear={editBirthYear ? parseInt(editBirthYear) : undefined}
                      solarMonth={editBirthMonth ? parseInt(editBirthMonth) : undefined}
                      solarDay={editBirthDay ? parseInt(editBirthDay) : undefined}
                      onChange={(data) => {
                        setEditBirthYear(data.solarYear.toString());
                        setEditBirthMonth(data.solarMonth.toString());
                        setEditBirthDay(data.solarDay.toString());
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>出生时间</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={editBirthHour} onValueChange={setEditBirthHour}>
                        <SelectTrigger>
                          <SelectValue placeholder="时" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {hours.map((h) => (
                            <SelectItem key={h} value={h.toString()}>
                              {h.toString().padStart(2, '0')}时 ({getShiChen(h)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={editBirthMinute} onValueChange={setEditBirthMinute}>
                        <SelectTrigger>
                          <SelectValue placeholder="分" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {minutes.map((m) => (
                            <SelectItem key={m} value={m.toString()}>
                              {m.toString().padStart(2, '0')}分
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editBirthHour !== '' && (
                      <p className="text-xs text-muted-foreground">
                        对应时辰：{getShiChen(parseInt(editBirthHour))}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>所在地区</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={editRegion} onValueChange={(v) => {
                        setEditRegion(v);
                        setEditCity('');
                        setEditDistrict('');
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="省份" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {CHINA_REGIONS.map((p) => (
                            <SelectItem key={p.name} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={editCity} onValueChange={(v) => {
                        setEditCity(v);
                        setEditDistrict('');
                      }} disabled={!editRegion}>
                        <SelectTrigger>
                          <SelectValue placeholder="城市" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {getCitiesByProvince(editRegion).map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={editDistrict} onValueChange={setEditDistrict} disabled={!editCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="区/县" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {getDistrictsByCity(editRegion, editCity).map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* 管理员入口 */}
            {profile?.is_admin && (
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4" />
              </Button>
            )}
            
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
            {profile?.birth_year && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedYear(profile.birth_year!)}
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <CircleDot className="w-4 h-4" />
              <span className="hidden sm:inline">总览</span>
            </TabsTrigger>
            <TabsTrigger value="wuyun" className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">五运图</span>
            </TabsTrigger>
            <TabsTrigger value="liuqi" className="flex items-center gap-1">
              <Wind className="w-4 h-4" />
              <span className="hidden sm:inline">六气图</span>
            </TabsTrigger>
            <TabsTrigger value="kezhu" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">客主加临</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">知识</span>
            </TabsTrigger>
          </TabsList>

          {/* 总览 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 五运图 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    五运总览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WuYunChart yearInfo={yearInfo} />
                </CardContent>
              </Card>

              {/* 六气图 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Wind className="w-5 h-5 text-accent" />
                    六气总览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LiuQiChart yearInfo={yearInfo} />
                </CardContent>
              </Card>
            </div>

            {/* 年运解读 */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
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

                  <Button variant="ghost" className="w-full justify-between" onClick={() => setActiveTab('kezhu')}>
                    查看客主加临详解
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Personal Info Card (if available) */}
              {profile?.birth_year && selectedYear === profile.birth_year ? (
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      个人先天运气
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      您出生于{profile.birth_year}年{profile.birth_month}月{profile.birth_day}日，
                      先天禀赋为<span className="text-primary font-medium">{yearInfo.ganZhi}年</span>的运气特征。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded bg-card">
                        <p className="text-xs text-muted-foreground">主运</p>
                        <p className="font-medium text-foreground">{yearInfo.daYun}</p>
                      </div>
                      <div className="p-3 rounded bg-card">
                        <p className="text-xs text-muted-foreground">司天</p>
                        <p className="font-medium text-foreground">{yearInfo.siTian.slice(0, 4)}</p>
                      </div>
                      <div className="p-3 rounded bg-card">
                        <p className="text-xs text-muted-foreground">在泉</p>
                        <p className="font-medium text-foreground">{yearInfo.zaiQuan.slice(0, 4)}</p>
                      </div>
                      <div className="p-3 rounded bg-card">
                        <p className="text-xs text-muted-foreground">太过/不及</p>
                        <p className="font-medium text-foreground">{yearInfo.taiGuoBuJi}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-accent" />
                      养生提示
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      根据{selectedYear}年运气特点，养生应注意：
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                      <li>
                        {yearInfo.taiGuoBuJi === '太过' 
                          ? `${yearInfo.wuXing}气太过，宜清泻${yearInfo.wuXing}，防止${yearInfo.wuXing}气过盛`
                          : `${yearInfo.wuXing}气不及，宜温补${yearInfo.wuXing}，扶助正气`}
                      </li>
                      <li>上半年防{LIU_QI_ATTRIBUTES[yearInfo.siTian].nature}邪为病</li>
                      <li>下半年防{LIU_QI_ATTRIBUTES[yearInfo.zaiQuan].nature}邪侵袭</li>
                      <li>顺应时令，调和阴阳</li>
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 经典文献入口 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow group border-accent/30 bg-gradient-to-r from-accent/5 to-transparent"
              onClick={() => navigate('/classics')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <BookMarked className="w-6 h-6 text-accent group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                      运气七篇经典
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      阅读《黄帝内经·素问》运气七篇原文及白话解
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* 个人健康建议入口 */}
            {profile?.birth_year && (
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow group border-primary/30 bg-gradient-to-r from-primary/5 to-transparent"
                onClick={() => navigate(`/health-advice?year=${selectedYear}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Heart className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        个人健康建议
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        根据您的出生年份，获取{selectedYear}年个性化养生建议与三因司天方
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 八字排盘入口 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow group border-element-fire/30 bg-gradient-to-r from-red-50/50 to-transparent"
              onClick={() => navigate('/bazi')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-white font-serif font-bold text-lg">八</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-red-700 transition-colors">
                      八字排盘
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      四柱八字排盘、五行分析、十神关系、大运流年
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-red-600 transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* 紫微斗数入口 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow group border-purple-300/50 bg-gradient-to-r from-purple-50/50 to-transparent"
              onClick={() => navigate('/ziwei')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-white font-serif font-bold text-lg">紫</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-purple-700 transition-colors">
                      紫微斗数
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      紫微斗数排盘、十二宫位、命理分析
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* 李阳波学说入口 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow group border-teal-300/50 bg-gradient-to-r from-teal-50/50 to-transparent"
              onClick={() => navigate('/liyangbo')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-teal-700 transition-colors">
                      李阳波学说
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      开阖枢理论、三阴三阳气化、六经时间方位、伤寒论辨证体系
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-teal-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
            
            {/* 赞助支持入口 */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow group border-amber-300/50 bg-gradient-to-r from-amber-50/50 to-transparent"
              onClick={() => navigate('/sponsor')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-amber-700 transition-colors">
                      支持本站 · 传承中医
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      用爱发电不易，您的支持是我们继续前行的动力
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 五运图 */}
          <TabsContent value="wuyun">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <WuYunChart yearInfo={yearInfo} />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">五运说明</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium text-foreground mb-2">主运（固定）</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        主运每年固定不变，从初运到五运依次为：木、火、土、金、水。
                        每运约73天，代表地球自身的五行规律。
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {yearInfo.zhuYun.map((yun, i) => (
                          <Badge 
                            key={i} 
                            variant="secondary"
                            style={{ 
                              backgroundColor: `${WU_XING_ATTRIBUTES[yun.xing].color}20`,
                              color: WU_XING_ATTRIBUTES[yun.xing].color
                            }}
                          >
                            {yun.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium text-foreground mb-2">客运（流转）</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        客运随年干变化，从中运（{yearInfo.daYun}）开始，按五行相生顺序排列。
                        太过不及交替变化，代表天气对地气的影响。
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {yearInfo.keYun.map((yun, i) => (
                          <Badge 
                            key={i} 
                            variant="outline"
                            className="border-current"
                            style={{ color: WU_XING_ATTRIBUTES[yun.xing].color }}
                          >
                            {yun.xing}·{yun.taiGuoBuJi}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <h4 className="font-medium text-foreground mb-2">本年中运</h4>
                      <p className="text-sm text-muted-foreground">
                        {yearInfo.year}年{yearInfo.gan}年，中运为<span className="text-primary font-medium">{yearInfo.daYun}</span>，
                        {yearInfo.taiGuoBuJi === '太过' ? '阳干主岁，运气太过' : '阴干主岁，运气不及'}。
                        全年以{yearInfo.wuXing}气为主导。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 六气图 */}
          <TabsContent value="liuqi">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <LiuQiChart yearInfo={yearInfo} />
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">六气说明</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium text-foreground mb-2">主气（固定）</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        主气每年固定不变，从初之气到终之气依次为：厥阴风木、少阴君火、少阳相火、太阴湿土、阳明燥金、太阳寒水。
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {yearInfo.zhuQi.map((qi, i) => (
                          <div 
                            key={i} 
                            className="text-center p-2 rounded text-xs"
                            style={{ 
                              backgroundColor: `${WU_XING_ATTRIBUTES[LIU_QI_ATTRIBUTES[qi].element].color}15`
                            }}
                          >
                            <div className="font-medium text-foreground">{['初', '二', '三', '四', '五', '终'][i]}之气</div>
                            <div className="text-muted-foreground">{qi.slice(0, 2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium text-foreground mb-2">客气（流转）</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        客气随年支变化。三之气为司天，终之气为在泉。
                        司天主导上半年气候，在泉主导下半年气候。
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {yearInfo.keQi.map((qi, i) => (
                          <div 
                            key={i} 
                            className={`text-center p-2 rounded text-xs ${
                              i === 2 ? 'ring-2 ring-primary' : i === 5 ? 'ring-2 ring-accent' : ''
                            }`}
                            style={{ 
                              backgroundColor: `${WU_XING_ATTRIBUTES[LIU_QI_ATTRIBUTES[qi].element].color}15`
                            }}
                          >
                            <div className="font-medium text-foreground">
                              {i === 2 ? '司天' : i === 5 ? '在泉' : `${['初', '二', '三', '四', '五', '终'][i]}之气`}
                            </div>
                            <div className="text-muted-foreground">{qi.slice(0, 2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <h4 className="font-medium text-foreground mb-2">本年司天在泉</h4>
                      <p className="text-sm text-muted-foreground">
                        {yearInfo.year}年{yearInfo.zhi}年，司天为<span className="text-primary font-medium">{yearInfo.siTian}</span>，
                        在泉为<span className="text-accent font-medium">{yearInfo.zaiQuan}</span>。
                        上半年{LIU_QI_ATTRIBUTES[yearInfo.siTian].nature}气当令，
                        下半年{LIU_QI_ATTRIBUTES[yearInfo.zaiQuan].nature}气主时。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 客主加临 */}
          <TabsContent value="kezhu">
            <KeZhuJiaLinCard 
              keZhuJiaLin={yearInfo.keZhuJiaLin}
              siTian={yearInfo.siTian}
              zaiQuan={yearInfo.zaiQuan}
            />
          </TabsContent>

          {/* 知识详解 */}
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
