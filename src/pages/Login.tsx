import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Calendar, MapPin, Eye, Mail, Lock, Loader2, QrCode, RefreshCw } from 'lucide-react';

// 省份列表
const PROVINCES = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南',
  '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
  '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signInAnonymously, signUpWithEmail, signInWithEmail, updateProfile, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  
  const [birthYear, setBirthYear] = useState<string>('');
  const [birthMonth, setBirthMonth] = useState<string>('');
  const [birthDay, setBirthDay] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // 微信登录状态
  const [wechatDialogOpen, setWechatDialogOpen] = useState(false);
  const [wechatQrUrl, setWechatQrUrl] = useState<string>('');
  const [wechatState, setWechatState] = useState<string>('');
  const [wechatLoading, setWechatLoading] = useState(false);

  // 生成年份选项 (1900-当前年)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 处理微信回调
  const handleWechatCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('wechat-auth', {
        body: { code },
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;

      if (data.success && data.magicLink) {
        // 使用 magic link 登录
        const url = new URL(data.magicLink);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');
        
        if (token && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as 'magiclink',
          });
          
          if (verifyError) throw verifyError;
        }
        
        toast({ title: '登录成功', description: `欢迎，${data.userInfo?.nickname || '用户'}` });
        navigate('/dashboard');
      } else {
        throw new Error(data.error || '微信登录失败');
      }
    } catch (error) {
      console.error('WeChat callback error:', error);
      toast({ 
        title: '微信登录失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // 检查URL中是否有微信回调的code
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // 验证state
      const savedState = sessionStorage.getItem('wechat_state');
      if (state === savedState) {
        sessionStorage.removeItem('wechat_state');
        handleWechatCallback(code);
      }
    }
  }, [searchParams, handleWechatCallback]);

  // 生成微信登录二维码URL
  const generateWechatQr = async () => {
    setWechatLoading(true);
    try {
      const state = Math.random().toString(36).substring(2, 15);
      setWechatState(state);
      sessionStorage.setItem('wechat_state', state);
      
      const redirectUri = `${window.location.origin}/login`;
      
      const { data, error } = await supabase.functions.invoke('wechat-auth', {
        body: { redirectUri, state },
        headers: { 'Content-Type': 'application/json' },
      });

      if (error) throw error;

      if (data.qrUrl) {
        setWechatQrUrl(data.qrUrl);
        setWechatDialogOpen(true);
      } else {
        throw new Error('无法获取二维码');
      }
    } catch (error) {
      console.error('Generate QR error:', error);
      toast({ 
        title: '获取二维码失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setWechatLoading(false);
    }
  };

  // 匿名登录
  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously();
      toast({ title: '登录成功', description: '欢迎使用五运六气系统' });
      navigate('/dashboard');
    } catch (error) {
      toast({ 
        title: '登录失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 邮箱登录/注册
  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({ title: '请填写完整信息', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        
        if (birthYear && birthMonth && birthDay) {
          await updateProfile({
            nickname: nickname || undefined,
            birth_year: parseInt(birthYear),
            birth_month: parseInt(birthMonth),
            birth_day: parseInt(birthDay),
            region: region || undefined,
          });
        }
        
        toast({ title: '注册成功', description: '欢迎使用五运六气系统' });
      } else {
        await signInWithEmail(email, password);
        toast({ title: '登录成功', description: '欢迎回来' });
      }
      navigate('/dashboard');
    } catch (error) {
      toast({ 
        title: isSignUp ? '注册失败' : '登录失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">邮箱</span>
              </TabsTrigger>
              <TabsTrigger value="wechat" className="flex items-center gap-1">
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">微信</span>
              </TabsTrigger>
              <TabsTrigger value="anonymous" className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">匿名</span>
              </TabsTrigger>
            </TabsList>

            {/* 邮箱登录 */}
            <TabsContent value="email" className="space-y-4">
              <div className="flex justify-center gap-4 text-sm">
                <button 
                  onClick={() => setIsSignUp(false)}
                  className={`pb-1 border-b-2 transition-colors ${!isSignUp ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                  登录
                </button>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className={`pb-1 border-b-2 transition-colors ${isSignUp ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                  注册
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  邮箱 <span className="text-primary">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  密码 <span className="text-primary">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isSignUp && (
                <>
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
                      出生日期 (可选)
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
                </>
              )}

              <Button
                className="w-full mt-6"
                onClick={handleEmailAuth}
                disabled={!email || !password || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  isSignUp ? '注册并进入' : '登录'
                )}
              </Button>
            </TabsContent>

            {/* 微信登录 */}
            <TabsContent value="wechat" className="space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#07C160]/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">微信扫码登录</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  使用微信扫描二维码，安全快捷登录
                </p>
                
                <Button
                  className="bg-[#07C160] hover:bg-[#06AD56] text-white"
                  onClick={generateWechatQr}
                  disabled={wechatLoading}
                >
                  {wechatLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      获取二维码...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      获取登录二维码
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* 匿名登录 */}
            <TabsContent value="anonymous" className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">匿名访问模式</h3>
                <p className="text-sm text-muted-foreground">
                  无需提供个人信息，直接浏览五运六气年历。
                  <br />
                  您可以随时在系统内完善个人信息查看个人排盘。
                </p>
              </div>

              <Button
                className="w-full"
                variant="secondary"
                onClick={handleAnonymousLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    正在进入...
                  </>
                ) : (
                  '匿名进入'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 微信二维码弹窗 */}
      <Dialog open={wechatDialogOpen} onOpenChange={setWechatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-serif flex items-center justify-center gap-2">
              <svg className="w-6 h-6 text-[#07C160]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z" />
              </svg>
              微信扫码登录
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            {wechatQrUrl ? (
              <>
                <div className="w-64 h-64 bg-white p-2 rounded-lg shadow-inner mb-4">
                  <iframe
                    src={wechatQrUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    className="rounded"
                    title="微信登录二维码"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  请使用微信扫描上方二维码
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateWechatQr}
                  disabled={wechatLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${wechatLoading ? 'animate-spin' : ''}`} />
                  刷新二维码
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
