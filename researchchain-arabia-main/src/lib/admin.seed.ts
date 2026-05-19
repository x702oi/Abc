import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ADMIN_LOGIN_EMAIL, ADMIN_LOGIN_PASSWORD, ADMIN_LOGIN_USERNAME } from "./admin.constants";

let seedPromise: Promise<void> | null = null;

function hasRequiredEnv() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function findAdminUser() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((user) => {
    const username = String(user.user_metadata?.username ?? user.user_metadata?.full_name ?? "");
    return user.email?.toLowerCase() === ADMIN_LOGIN_EMAIL.toLowerCase() || username.toLowerCase() === ADMIN_LOGIN_USERNAME.toLowerCase();
  }) ?? null;
}

export function ensureAdminSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    if (!hasRequiredEnv()) {
      console.warn("[Admin Seed] SUPABASE_SERVICE_ROLE_KEY missing; admin seed skipped.");
      return;
    }

    const existing = await findAdminUser();
    let adminId = existing?.id;

    if (!existing) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email: ADMIN_LOGIN_EMAIL,
        password: ADMIN_LOGIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_LOGIN_USERNAME,
          username: ADMIN_LOGIN_USERNAME,
          role: "admin",
        },
      });
      if (created.error) throw created.error;
      adminId = created.data.user?.id;
    } else {
      const updated = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        email: ADMIN_LOGIN_EMAIL,
        password: ADMIN_LOGIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          ...(existing.user_metadata ?? {}),
          full_name: ADMIN_LOGIN_USERNAME,
          username: ADMIN_LOGIN_USERNAME,
          role: "admin",
        },
      });
      if (updated.error) throw updated.error;
    }

    if (!adminId) return;

    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
      id: adminId,
      full_name: ADMIN_LOGIN_USERNAME,
      email: ADMIN_LOGIN_EMAIL,
      nationality: "Saudi Arabia",
      age: null,
      gender: null,
      wallet_balance: 0,
      trust_score: 100,
      account_status: "active",
      verification_status: "verified",
    });
    if (profileErr) throw profileErr;

    const { error: roleErr } = await supabaseAdmin.from("user_roles").upsert({
      user_id: adminId,
      role: "admin",
    }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    console.info(`[Admin Seed] Admin account ready for ${ADMIN_LOGIN_USERNAME} (${ADMIN_LOGIN_EMAIL}).`);
  })().catch((error) => {
    seedPromise = null;
    console.error("[Admin Seed] Failed:", error);
    throw error;
  });
  return seedPromise;
}
