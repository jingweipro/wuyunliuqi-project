import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, MapPin, Eye, Mail, Lock, Loader2, KeyRound } from 'lucide-react';

// 省份列表
const PROVINCES = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南',
  '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
  '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门',
];

type ResetStep = 'email' | 'otp' | 'newPassword' | 'success';

export default function LoginPage() {
  const navigate = useNavigate();
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
  
  // 忘记密码状态 - OTP验证码方式
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [countdown, setCountdown] = useState(0);

  // 生成年份选项 (1900-当前年)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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
        
        // 记录登录活动
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('user_activities').insert({
              user_id: user.id,
              activity_type: 'login',
              activity_data: { method: 'email' },
              user_agent: navigator.userAgent,
            });
          }
        } catch (e) {
          console.log('Activity logging failed:', e);
        }
        
        toast({ title: '登录成功', description: '欢迎回来' });
      }
      navigate('/dashboard');
    } catch (error) {
      toast({ 
        title: isSignUp ? '注册失败' : '登录失败', 
        description: error instanceof Error ? error.message : '请检查邮箱或密码',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 开始倒计时
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 步骤1: 发送OTP验证码到邮箱
  const handleSendOtp = async () => {
    if (!resetEmail) {
      toast({ title: '请输入邮箱地址', variant: 'destructive' });
      return;
    }
    
    setResetLoading(true);
    try {
      // 使用 signInWithOtp 发送验证码邮件
      const { error } = await supabase.auth.signInWithOtp({
        email: resetEmail,
        options: {
          shouldCreateUser: false, // 不创建新用户，只验证已有用户
        },
      });
      
      if (error) {
        // 如果用户不存在
        if (error.message.includes('not found') || error.message.includes('Signups not allowed')) {
          throw new Error('该邮箱未注册，请先注册账号');
        }
        throw error;
      }
      
      setResetStep('otp');
      startCountdown();
      toast({ 
        title: '验证码已发送', 
        description: '请查收邮箱中的6位验证码' 
      });
    } catch (error) {
      toast({ 
        title: '发送失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // 步骤2: 验证OTP并登录
  const handleVerifyOtp = async () => {
    if (!resetOtp || resetOtp.length < 6) {
      toast({ title: '请输入完整的6位验证码', variant: 'destructive' });
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: resetOtp,
        type: 'email',
      });
      
      if (error) throw error;
      
      // OTP验证成功，用户已登录，进入设置新密码步骤
      setResetStep('newPassword');
      toast({ title: '验证成功', description: '请设置新密码' });
    } catch (error) {
      toast({ 
        title: '验证失败', 
        description: error instanceof Error ? error.message : '验证码错误或已过期',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // 步骤3: 设置新密码
  const handleSetNewPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast({ title: '请填写完整信息', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: '两次密码输入不一致', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: '密码长度至少6位', variant: 'destructive' });
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      setResetStep('success');
      toast({ title: '密码重置成功' });
    } catch (error) {
      toast({ 
        title: '重置失败', 
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // 关闭忘记密码弹窗时重置状态
  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetStep('email');
    setCountdown(0);
  };

  // 密码重置成功后跳转
  const handleResetSuccess = () => {
    handleCloseForgotPassword();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-3xl font-serif text-primary-foreground">运</span>
          </div>
          <CardTitle className="font-serif text-2xl">五运六气</CardTitle>
          <CardDescription>探索中医天人合一的智慧</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                邮箱登录
              </TabsTrigger>
              <TabsTrigger value="anonymous" className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                匿名体验
              </TabsTrigger>
            </TabsList>

            {/* 邮箱登录 */}
            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>邮箱地址</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label>昵称 (选填)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="请输入昵称"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>出生日期 (选填)</Label>
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
                    <Label>所在地区 (选填)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="pl-10">
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
                  </div>
                </>
              )}

              <Button 
                className="w-full" 
                onClick={handleEmailAuth}
                disabled={isLoading || authLoading}
              >
                {(isLoading || authLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSignUp ? '注册' : '登录'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-muted-foreground"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? '已有账号？登录' : '没有账号？注册'}
                </Button>
                
                {!isSignUp && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-muted-foreground"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    忘记密码？
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* 匿名登录 */}
            <TabsContent value="anonymous" className="space-y-4 mt-4">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                  <Eye className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">匿名访问</h3>
                <p className="text-sm text-muted-foreground">
                  无需注册，直接体验五运六气系统。您可以随时在个人中心完善信息。
                </p>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleAnonymousLogin}
                  disabled={isLoading || authLoading}
                >
                  {(isLoading || authLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  匿名进入
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 忘记密码弹窗 - OTP验证码方式 */}
      <Dialog open={forgotPasswordOpen} onOpenChange={handleCloseForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              找回密码
            </DialogTitle>
            <DialogDescription>
              {resetStep === 'email' && '输入您的注册邮箱，我们将发送验证码'}
              {resetStep === 'otp' && '请输入邮箱收到的6位验证码'}
              {resetStep === 'newPassword' && '验证成功，请设置新密码'}
              {resetStep === 'success' && '密码已重置成功'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 步骤指示器 */}
            {resetStep !== 'success' && (
              <div className="flex items-center justify-center gap-2 mb-2">
                {(['email', 'otp', 'newPassword'] as const).map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      resetStep === step 
                        ? 'bg-primary text-primary-foreground' 
                        : (['email', 'otp', 'newPassword'].indexOf(resetStep) > i)
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    {i < 2 && <div className={`w-8 h-0.5 ${
                      (['email', 'otp', 'newPassword'].indexOf(resetStep) > i) ? 'bg-primary/40' : 'bg-muted'
                    }`} />}
                  </div>
                ))}
              </div>
            )}

            {/* 步骤1: 输入邮箱 */}
            {resetStep === 'email' && (
              <>
                <div className="space-y-2">
                  <Label>邮箱地址</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="请输入注册邮箱"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSendOtp}
                  disabled={resetLoading}
                >
                  {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  发送验证码
                </Button>
              </>
            )}

            {/* 步骤2: 输入验证码 */}
            {resetStep === 'otp' && (
              <>
                <div className="text-center text-sm text-muted-foreground mb-2">
                  验证码已发送至 <span className="font-medium text-foreground">{resetEmail}</span>
                </div>
                <div className="space-y-2">
                  <Label>验证码</Label>
                  <Input 
                    type="text"
                    placeholder="请输入6位验证码"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-[0.5em] font-mono"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={handleSendOtp}
                    disabled={resetLoading || countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}s后重发` : '重新发送'}
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleVerifyOtp}
                    disabled={resetLoading || resetOtp.length < 6}
                  >
                    {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    验证
                  </Button>
                </div>
              </>
            )}

            {/* 步骤3: 设置新密码 */}
            {resetStep === 'newPassword' && (
              <>
                <div className="space-y-2">
                  <Label>新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="请输入新密码（至少6位）"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="请再次输入新密码"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSetNewPassword}
                  disabled={resetLoading}
                >
                  {resetLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  确认重置密码
                </Button>
              </>
            )}

            {/* 步骤4: 成功 */}
            {resetStep === 'success' && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <KeyRound className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-medium">密码重置成功</p>
                <p className="text-sm text-muted-foreground">
                  您已通过验证并成功设置了新密码，可以直接进入系统
                </p>
                <Button className="w-full" onClick={handleResetSuccess}>
                  进入系统
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
