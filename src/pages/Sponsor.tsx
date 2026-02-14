import { Heart, Coffee, Server, Globe, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function Sponsor() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto space-y-8">
        {/* 标题区 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            支持本站 · 传承中医
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            您的每一份支持，都是我们继续前行的动力
          </p>
        </div>

        {/* 开发者心声 */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              开发者的话
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-base">
              您好，我是一名热爱中医文化的开发者。作为五运六气的学习者，深感这门古老智慧的博大精深，
              却也发现市面上缺少一款真正好用、系统化的学习工具。
            </p>
            <p className="text-base">
              于是，我利用业余时间，独立开发了这个五运六气学习平台。从需求设计、界面设计、代码编写、
              到服务器部署，每一行代码都倾注了对中医文化的热爱与敬意。
            </p>
            <p className="text-base">
              这是一个<span className="font-semibold text-foreground">完全免费</span>的公益项目，
              没有任何广告，不收取任何费用。所有的域名费用、服务器费用、维护成本，
              以及大量的开发时间，都是我个人的投入。
            </p>
            <p className="text-base font-semibold text-foreground">
              但我相信，真正有价值的知识应该被更多人看见。如果这个平台对您的学习有所帮助，
              您的自愿赞助将是对我最大的鼓励，也能帮助这个项目走得更远。
            </p>
          </CardContent>
        </Card>

        {/* 资金用途 */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Server className="w-5 h-5 text-accent" />
              您的赞助将用于
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-foreground">域名续费</div>
                  <div className="text-sm text-muted-foreground">保持网站长期稳定访问</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Server className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-foreground">服务器费用</div>
                  <div className="text-sm text-muted-foreground">提供更快的访问速度</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-foreground">功能维护</div>
                  <div className="text-sm text-muted-foreground">持续优化和修复问题</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-foreground">内容扩充</div>
                  <div className="text-sm text-muted-foreground">添加更多学习资料</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 风险告知 */}
        <Alert variant="destructive" className="border-2">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base space-y-2">
            <div className="font-bold text-lg mb-2">重要声明（请仔细阅读）</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><span className="font-semibold">自愿赞助性质：</span>本页面提供的是自愿赞助功能，<span className="underline font-semibold">非商品交易或服务购买</span>。</li>
              <li><span className="font-semibold">无任何承诺：</span>赞助后不提供任何商品、服务或权益，网站所有功能对所有用户完全免费开放。</li>
              <li><span className="font-semibold">不可退款：</span>赞助为单向赠与行为，一经完成<span className="underline font-semibold">不支持退款</span>。</li>
              <li><span className="font-semibold">金额自定：</span>您可以根据个人意愿选择任意金额，没有最低限制。</li>
              <li><span className="font-semibold">透明使用：</span>所有赞助将100%用于网站运营维护，不涉及任何商业盈利。</li>
              <li><span className="font-semibold">风险提示：</span>请在充分理解以上声明的前提下，自愿决定是否赞助。</li>
            </ul>
            <div className="mt-3 text-center font-bold text-base">
              如果您不同意以上条款，请勿进行赞助操作
            </div>
          </AlertDescription>
        </Alert>

        {/* 收款码 */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="font-serif text-center flex items-center justify-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              扫码赞助 · 心意相传
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">
              请使用微信或支付宝扫描下方二维码 · 金额随心
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* 微信收款码 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-semibold mb-3">
                    微信支付
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img 
                    src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003222/d5e3.jpg" 
                    alt="微信收款码" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-muted-foreground">推荐使用微信支付</p>
              </div>

              {/* 支付宝收款码 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold mb-3">
                    支付宝
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img 
                    src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003222/85ef.jpg" 
                    alt="支付宝收款码" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-muted-foreground">支持信用卡/花呗付款</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 温馨提示 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center space-y-2">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">温馨提示：</span>
                扫码后请备注"五运六气"，让我知道您的支持来自哪里
              </p>
              <p className="text-xs text-amber-700">
                每一份心意都会被珍惜 · 感恩有您同行
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 感谢名单预留 */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              感谢支持
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">🙏</div>
              <p className="text-muted-foreground">
                感谢每一位赞助者的支持
              </p>
              <p className="text-sm text-muted-foreground">
                您的每一份心意，都让中医文化的传承之路更加明亮
              </p>
              <div className="pt-4 text-xs text-muted-foreground italic">
                "上医治未病，中医治欲病，下医治已病" —《黄帝内经》
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 返回按钮 */}
        <div className="text-center pb-8">
          <a 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
