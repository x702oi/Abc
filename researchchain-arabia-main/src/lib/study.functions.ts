import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHash, randomBytes } from "crypto";

const hash = (s: string) => "0x" + createHash("sha256").update(s).digest("hex");

export const applyToStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ studyId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const ts = new Date().toISOString();
    const blockchainHash = hash(`${data.studyId}|${userId}|${ts}|${randomBytes(8).toString("hex")}`);

    const { error: appErr } = await supabase.from("applications").insert({
      study_id: data.studyId,
      participant_id: userId,
      application_status: "pending",
    });
    if (appErr) {
      if (appErr.code === "23505") return { ok: false, error: "You have already applied to this study." };
      throw new Error(appErr.message);
    }

    const { error: ledgerErr } = await supabase.from("consent_ledger").insert({
      participant_id: userId,
      study_id: data.studyId,
      blockchain_hash: blockchainHash,
      consent_timestamp: ts,
    });
    if (ledgerErr) throw new Error(ledgerErr.message);

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Application submitted",
      message: `Your consent has been recorded on-chain (${blockchainHash.slice(0, 16)}…). Awaiting researcher review.`,
    });

    return { ok: true, blockchainHash };
  });

export const approveApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      applicationId: z.string().uuid(),
      decision: z.enum(["approved", "rejected"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Fetch app with study
    const { data: app, error } = await supabase
      .from("applications")
      .select("id, study_id, participant_id, research_studies!inner(researcher_id, reward_amount, title)")
      .eq("id", data.applicationId)
      .single();
    if (error || !app) throw new Error("Application not found");
    const study = (app as { research_studies: { researcher_id: string; reward_amount: number; title: string } }).research_studies;
    if (study.researcher_id !== userId) throw new Error("Not your study");

    await supabase.from("applications").update({ application_status: data.decision }).eq("id", data.applicationId);

    if (data.decision === "approved") {
      // Issue reward payment with simulated tx hash
      const txHash = hash(`${app.study_id}|${app.participant_id}|${Date.now()}|${randomBytes(8).toString("hex")}`);
      await supabase.from("payments").insert({
        study_id: app.study_id,
        participant_id: app.participant_id,
        amount: study.reward_amount,
        payment_status: "completed",
        transaction_hash: txHash,
      });
      // Bump participant wallet + trust
      const { data: prof } = await supabase.from("profiles").select("wallet_balance, trust_score").eq("id", app.participant_id).single();
      if (prof) {
        await supabase.from("profiles").update({
          wallet_balance: Number(prof.wallet_balance) + Number(study.reward_amount),
          trust_score: Math.min(100, prof.trust_score + 2),
        }).eq("id", app.participant_id);
      }
      // Bump study participant count
      const { data: s } = await supabase.from("research_studies").select("total_participants").eq("id", app.study_id).single();
      if (s) {
        await supabase.from("research_studies").update({ total_participants: s.total_participants + 1 }).eq("id", app.study_id);
      }
      await supabase.from("notifications").insert({
        user_id: app.participant_id,
        title: "Application approved!",
        message: `You earned ${study.reward_amount} SAR for "${study.title}". Tx: ${txHash.slice(0, 16)}…`,
      });
    } else {
      await supabase.from("notifications").insert({
        user_id: app.participant_id,
        title: "Application update",
        message: `Your application for "${study.title}" was not selected this time.`,
      });
    }
    return { ok: true };
  });
