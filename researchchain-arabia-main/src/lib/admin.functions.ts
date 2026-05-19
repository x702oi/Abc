import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "@/integrations/supabase/admin-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { randomBytes } from "crypto";

const logAdminAction = async (adminId: string, action: string, targetUser: string | null = null) => {
  await supabaseAdmin.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_user: targetUser,
    timestamp: new Date().toISOString(),
  });
};

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const tempPassword = `RcA-${randomBytes(4).toString("hex")}-${randomBytes(2).toString("hex")}`;
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: tempPassword });
    if (error) throw error;
    await logAdminAction(context.userId, "reset_password", data.userId);
    return { ok: true, tempPassword };
  });

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw error;
    await logAdminAction(context.userId, "delete_user", data.userId);
    return { ok: true };
  });

export const setUserAccountState = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((d) => z.object({ userId: z.string().uuid(), accountStatus: z.enum(["active", "suspended", "banned"]), verificationStatus: z.enum(["pending", "verified", "rejected"]).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const updates: Record<string, unknown> = { account_status: data.accountStatus };
    if (data.verificationStatus) updates.verification_status = data.verificationStatus;
    const { error } = await supabaseAdmin.from("profiles").update(updates).eq("id", data.userId);
    if (error) throw error;
    await logAdminAction(context.userId, `set_state:${data.accountStatus}`, data.userId);
    return { ok: true };
  });

export const upsertSystemSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((d) => z.object({ settingName: z.string().min(1), settingValue: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("system_settings").upsert({ setting_name: data.settingName, setting_value: data.settingValue }, { onConflict: "setting_name" });
    if (error) throw error;
    await logAdminAction(context.userId, `setting:${data.settingName}`, null);
    return { ok: true };
  });

export const replySupportTicket = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .inputValidator((d) => z.object({ ticketId: z.string().uuid(), reply: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin.from("support_tickets").update({ status: "closed", admin_reply: data.reply, updated_at: new Date().toISOString() }).eq("id", data.ticketId);
    if (error) throw error;
    await logAdminAction(context.userId, "reply_ticket", data.ticketId);
    return { ok: true };
  });
