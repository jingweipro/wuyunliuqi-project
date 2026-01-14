import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const WECHAT_APP_ID = Deno.env.get("WECHAT_APP_ID");
  const WECHAT_APP_SECRET = Deno.env.get("WECHAT_APP_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
    return new Response(
      JSON.stringify({ error: "WeChat credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // Action 1: Get QR code URL for scanning
    if (action === "get-qr-url") {
      const { redirectUri, state } = await req.json();
      
      const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
      
      return new Response(
        JSON.stringify({ qrUrl, appId: WECHAT_APP_ID }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action 2: Exchange code for access token and user info
    if (action === "callback") {
      const { code } = await req.json();
      
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

      if (tokenData.errcode) {
        console.error("WeChat token error:", tokenData);
        return new Response(
          JSON.stringify({ error: "Failed to get access token", details: tokenData.errmsg }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { access_token, openid, unionid } = tokenData;

      // Step 2: Get user info
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}`;
      
      const userInfoResponse = await fetch(userInfoUrl);
      const userInfo = await userInfoResponse.json();

      if (userInfo.errcode) {
        console.error("WeChat user info error:", userInfo);
        return new Response(
          JSON.stringify({ error: "Failed to get user info", details: userInfo.errmsg }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Step 3: Create or update user in Supabase
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

      // Check if user exists by wechat_openid
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("wechat_openid", openid)
        .maybeSingle();

      let userId: string;

      if (existingProfile) {
        // User exists, update profile
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
        // Create new user
        const email = `wx_${openid}@wechat.placeholder`;
        const password = crypto.randomUUID();

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            provider: "wechat",
            wechat_openid: openid,
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
          },
        });

        if (authError) {
          console.error("Auth create error:", authError);
          return new Response(
            JSON.stringify({ error: "Failed to create user", details: authError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = authData.user.id;

        // Update profile with WeChat info
        await supabase
          .from("profiles")
          .update({
            nickname: userInfo.nickname,
            avatar_url: userInfo.headimgurl,
            wechat_openid: openid,
            wechat_unionid: unionid,
            is_anonymous: false,
          })
          .eq("id", userId);
      }

      // Step 4: Generate session token for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `wx_${openid}@wechat.placeholder`,
      });

      if (sessionError) {
        console.error("Session error:", sessionError);
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
            openid,
          },
          magicLink: sessionData.properties?.action_link,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action 3: Direct login for existing WeChat user
    if (action === "login") {
      const { openid } = await req.json();
      
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

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("WeChat auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
