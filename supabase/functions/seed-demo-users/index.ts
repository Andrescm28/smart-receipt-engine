import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEMO_USERS = [
  { email: "admin@demo.com",      password: "Admin123!",      full_name: "Administrador Demo", role: "admin" },
  { email: "cajero@demo.com",     password: "Cajero123!",     full_name: "Cajero Demo",        role: "cashier" },
  { email: "inventario@demo.com", password: "Inventario123!", full_name: "Inventario Demo",    role: "inventory" },
  { email: "contador@demo.com",   password: "Contador123!",   full_name: "Contador Demo",      role: "accountant" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const results: any[] = [];
  for (const u of DEMO_USERS) {
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users.find((x) => x.email === u.email);
    let userId = existing?.id;

    if (!existing) {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name, role: u.role },
      });
      if (error) { results.push({ email: u.email, error: error.message }); continue; }
      userId = created.user!.id;
    } else {
      await admin.auth.admin.updateUserById(existing.id, { password: u.password });
    }

    // ensure role
    await admin.from("user_roles").delete().eq("user_id", userId!);
    await admin.from("user_roles").insert({ user_id: userId!, role: u.role });
    await admin.from("profiles").upsert({ id: userId!, full_name: u.full_name, email: u.email });

    results.push({ email: u.email, password: u.password, role: u.role, ok: true });
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
