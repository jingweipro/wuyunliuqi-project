import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  console.log("=== WeChat Auth Function Start ===");
  console.log("Method:", req.method);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WECHAT_APP_ID = Deno.env.get("WECHAT_APP_ID");
    const WECHAT_APP_SECRET = Deno.env.get("WECHAT_APP_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("WECHAT_APP_ID:", WECHAT_APP_ID ? "configured" : "NOT configured");
    console.log("WECHAT_APP_SECRET:", WECHAT_APP_SECRET ? "configured" : "NOT configured");

    if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
      console.error("WeChat credentials missing!");
      return new Response(
        JSON.stringify({ 
          error: "微信登录暂未配置", 
          message: "请联系管理员配置微信 AppID 和 AppSecret" 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    let body;
    try {
      const text = await req.text();
      console.log("Raw body:", text);
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, redirectUri, state, code, openid } = body;
    console.log("Action:", action);

    // Action 1: Get QR code URL for scanning
    if (action === "get-qr-url") {
      console.log("Generating QR URL");
      console.log("redirectUri:", redirectUri);
      console.log("state:", state);
      
      const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
      
      console.log("Generated QR URL successfully");
      
      return new Response(
        JSON.stringify({ qrUrl, appId: WECHAT_APP_ID }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action 2: Exchange code for access token and user info
    if (action === "callback") {
      console.log("Processing callback with code:", code ? "present" : "missing");
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Authorization code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step 1: Exchange code for access token
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`;
      
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();

      console.log("Token response errcode:", tokenData.errcode);

      if (tokenData.errcode) {
        return new Response(
          JSON.stringify({ error: "Failed to get access token", details: tokenData.errmsg }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { access_token, openid: wxOpenid, unionid } = tokenData;

      // Step 2: Get user info
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${wxOpenid}`;
      
      const userInfoResponse = await fetch(userInfoUrl);
      const userInfo = await userInfoResponse.json();

      if (userInfo.errcode) {
        return new Response(
          JSON.stringify({ error: "Failed to get user info", details: userInfo.errmsg }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step 3: Create or update user in Supabase
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("wechat_openid", wxOpenid)
        .maybeSingle();

      let userId: string;

      if (existingProfile) {
        userId = existingProfile.id;
        
        await supabase
          .from("profiles")
          .update({
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
            wechat_unionid: unionid,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      } else {
        const email = `wx_${wxOpenid}@wechat.placeholder`;
        const password = crypto.randomUUID();

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            provider: "wechat",
            wechat_openid: wxOpenid,
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
          },
        });

        if (authError) {
          return new Response(
            JSON.stringify({ error: "Failed to create user", details: authError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = authData.user.id;

        await supabase
          .from("profiles")
          .update({
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
            wechat_openid: wxOpenid,
            wechat_unionid: unionid,
            is_anonymous: false,
          })
          .eq("id", userId);
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `wx_${wxOpenid}@wechat.placeholder`,
      });

      if (sessionError) {
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          userId,
          userInfo: {
            nickname: userInfo.nickname,
            avatar: userInfo.headimgurl,
            openid: wxOpenid,
          },
          magicLink: sessionData.properties?.action_link,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action 3: Direct login
    if (action === "login") {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("wechat_openid", openid)
        .maybeSingle();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `wx_${openid}@wechat.placeholder`,
      });

      if (sessionError) {
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          magicLink: sessionData.properties?.action_link,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error("Invalid action received:", action);
    return new Response(
      JSON.stringify({ error: "Invalid action", received: action }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("WeChat auth error:", error);
    return new Response(
      JSON.stringify({ error: "服务器内部错误", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
