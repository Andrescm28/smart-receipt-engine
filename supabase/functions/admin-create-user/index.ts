import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VALID_ROLES = ["admin", "cashier", "inventory", "accountant"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden: admin only" }, 403);

    const body = await req.json();
    const { email, password, full_name, role, supermarket_id } = body ?? {};
    if (!email || !password || !full_name || !role) {
      return json({ error: "Missing required fields" }, 400);
    }
    if (!VALID_ROLES.includes(role)) {
      return json({ error: "Invalid role" }, 400);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role, supermarket_id: supermarket_id ?? "" },
    });
    if (createErr) return json({ error: createErr.message }, 400);

    // Trigger handle_new_user inserts the selected role automatically.
    // For non-cashier roles, also ensure the default 'cashier' insertion is removed if it shouldn't be there.
    if (role !== "cashier") {
      await admin.from("user_roles").delete()
        .eq("user_id", created.user!.id)
        .eq("role", "cashier");
      // Insert requested role in case trigger fallback set a different default
      await admin.from("user_roles")
        .upsert({ user_id: created.user!.id, role }, { onConflict: "user_id,role" });
    }

    return json({ ok: true, user_id: created.user!.id });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
