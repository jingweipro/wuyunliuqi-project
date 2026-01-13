import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createAnonymousUser, createUserWithBirthInfo } from '@/lib/user-store';
import { User, Calendar, MapPin, Eye } from 'lucide-react';

// 省份列表
const PROVINCES = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南',
  '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
  '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 生成年份选项 (1900-当前年)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  
  // 生成月份选项
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 生成日期选项
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleBirthInfoLogin = async () => {
    if (!birthYear || !birthMonth || !birthDay) {
      return;
    }
    
    setIsLoading(true);
    try {
      createUserWithBirthInfo(
        parseInt(birthYear),
        parseInt(birthMonth),
        parseInt(birthDay),
        region,
        nickname
      );
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
      createAnonymousUser();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/30">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-accent/10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-element-wood/5 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-900 flex items-center justify-center animate-pulse-glow">
            <span className="text-3xl font-serif text-primary-foreground">运</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-serif text-foreground">五运六气</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              探索中医天人合一的智慧
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="birth" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="birth" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                出生信息
              </TabsTrigger>
              <TabsTrigger value="anonymous" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                匿名访问
              </TabsTrigger>
            </TabsList>

            <TabsContent value="birth" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  昵称 (可选)
                </Label>
                <Input
                  id="nickname"
                  placeholder="请输入您的昵称"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  出生日期 <span className="text-primary">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={birthYear} onValueChange={setBirthYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="年" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={birthMonth} onValueChange={setBirthMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="月" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={birthDay} onValueChange={setBirthDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="日" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {days.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}日
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  所在地区 (可选)
                </Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择地区" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {PROVINCES.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full mt-6"
                onClick={handleBirthInfoLogin}
                disabled={!birthYear || !birthMonth || !birthDay || isLoading}
              >
                {isLoading ? '正在进入...' : '开始探索'}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                输入出生信息后，系统将为您展示个人五运六气配置
              </p>
            </TabsContent>

            <TabsContent value="anonymous" className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">匿名访问模式</h3>
                <p className="text-sm text-muted-foreground">
                  无需提供个人信息，直接浏览五运六气年历。
                  <br />
                  您可以随时在系统内添加个人信息查看个人排盘。
                </p>
              </div>

              <Button
                className="w-full"
                variant="secondary"
                onClick={handleAnonymousLogin}
                disabled={isLoading}
              >
                {isLoading ? '正在进入...' : '匿名进入'}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">更多登录方式</span>
            </div>
          </div>

          {/* WeChat Login Placeholder */}
          <Button
            variant="outline"
            className="w-full"
            disabled
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
            </svg>
            微信扫码登录 (即将推出)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
