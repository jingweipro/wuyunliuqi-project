import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserPlus,
  Activity,
  Clock,
  TrendingUp,
  Calendar,
  Shield,
  RefreshCw,
  Mail,
  MapPin
} from 'lucide-react';

interface Stats {
  total_users: number;
  anonymous_users: number;
  registered_users: number;
  active_users_7d: number;
  active_users_30d: number;
  new_users_24h: number;
  activities_24h: number;
}

interface UserProfile {
  id: string;
  nickname: string | null;
  birth_year: number | null;
  region: string | null;
  is_anonymous: boolean;
  created_at: string;
  last_login_at: string | null;
  login_count: number | null;
}

interface UserActivity {
  id: string;
  user_id: string | null;
  activity_type: string;
  activity_data: Record<string, unknown> | null;
  created_at: string;
  profiles?: {
    nickname: string | null;
  } | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuthContext();
  
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 检查管理员权限
  useEffect(() => {
    if (!authLoading && (!profile || !profile.is_admin)) {
      navigate('/dashboard');
    }
  }, [profile, authLoading, navigate]);

  // 加载数据
  const loadData = async () => {
    try {
      // 获取统计数据
      const { data: statsData } = await supabase
        .rpc('get_admin_stats');
      
      if (statsData) {
        setStats(statsData);
      } else {
        // 如果rpc不存在，手动查询
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        const { count: anonymousUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_anonymous', true);
        
        const { count: activeUsers7d } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_login_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        const { count: newUsers24h } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        setStats({
          total_users: totalUsers || 0,
          anonymous_users: anonymousUsers || 0,
          registered_users: (totalUsers || 0) - (anonymousUsers || 0),
          active_users_7d: activeUsers7d || 0,
          active_users_30d: 0,
          new_users_24h: newUsers24h || 0,
          activities_24h: 0
        });
      }

      // 获取用户列表
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (usersData) {
        setUsers(usersData);
      }

      // 获取活动日志
      const { data: activitiesData } = await supabase
        .from('user_activities')
        .select(`
          *,
          profiles (nickname)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (activitiesData) {
        setActivities(activitiesData as UserActivity[]);
      }
    } catch (error) {
      console.error('Load admin data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.is_admin) {
      loadData();
    }
  }, [profile]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // 格式化时间
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化活动类型
  const formatActivityType = (type: string) => {
    const types: Record<string, string> = {
      'login': '登录',
      'register': '注册',
      'view_dashboard': '查看仪表盘',
      'view_classics': '阅读经典',
      'view_health_advice': '查看健康建议'
    };
    return types[type] || type;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-outline-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-serif font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  管理后台
                </h1>
                <p className="text-sm text-muted-foreground">用户统计与活动日志</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总用户数</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.total_users || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">注册用户</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.registered_users || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                匿名用户：{stats?.anonymous_users || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">7日活跃</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.active_users_7d || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">24h新增</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.new_users_24h || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 详细数据 */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              用户列表
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              活动日志
            </TabsTrigger>
          </TabsList>

          {/* 用户列表 */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>最近注册的100个用户</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div 
                        key={user.id} 
                        className="p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {user.nickname || '未设置昵称'}
                              </span>
                              {user.is_anonymous ? (
                                <Badge variant="secondary" className="text-xs">匿名</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">注册用户</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {user.birth_year && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {user.birth_year}年出生
                                </span>
                              )}
                              {user.region && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {user.region}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              注册：{formatTime(user.created_at)}
                            </div>
                            {user.last_login_at && (
                              <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                最近登录：{formatTime(user.last_login_at)}
                              </div>
                            )}
                            {user.login_count && user.login_count > 0 && (
                              <div className="text-xs mt-1">
                                登录 {user.login_count} 次
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {users.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        暂无用户数据
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 活动日志 */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>活动日志</CardTitle>
                <CardDescription>最近100条用户活动记录</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="p-3 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {formatActivityType(activity.activity_type)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {activity.profiles?.nickname || '匿名用户'}
                                </span>
                              </div>
                              {activity.activity_data && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {JSON.stringify(activity.activity_data)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {activities.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        暂无活动记录
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
