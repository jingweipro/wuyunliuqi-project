import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { action, userId, secretKey } = await req.json();

    // 简单的安全检查 - 需要提供正确的密钥
    const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET") || "wuyunliuqi2026";
    
    if (secretKey !== ADMIN_SECRET) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "set-admin") {
      // 设置用户为管理员
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", userId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Admin status set successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "remove-admin") {
      // 移除管理员权限
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: false })
        .eq("id", userId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: "Admin status removed successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list-users") {
      // 列出所有用户（仅管理员功能）
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nickname, is_admin, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, users: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Admin function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
