import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { applyToStudy } from "@/lib/study.functions";
import { aiMatchStudies } from "@/lib/ai.functions";
import { toast } from "sonner";
import { Wallet, Award, FlaskConical, Sparkles, Shield, Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/participant")({
  component: ParticipantDash,
  head: () => ({ meta: [{ title: "Participant Dashboard — ResearchChain Arabia" }] }),
});

type Study = { id: string; title: string; description: string; category: string; reward_amount: number; status: string; researcher_id: string };
type App = { id: string; study_id: string; application_status: string; submission_date: string };
type Pay = { id: string; amount: number; transaction_hash: string; created_at: string; payment_status: string };
type Consent = { id: string; study_id: string; blockchain_hash: string; consent_timestamp: string };
type Notif = { id: string; title: string; message: string; read_status: boolean; created_at: string };

function ParticipantDash() {
  const { user, profile, refresh } = useAuth();
  const apply = useServerFn(applyToStudy);
  const match = useServerFn(aiMatchStudies);
  const [studies, setStudies] = useState<Study[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [recs, setRecs] = useState<string[]>([]);

  const load = async () => {
    if (!user) return;
    const [s, a, p, c, n] = await Promise.all([
      supabase.from("research_studies").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(50),
      supabase.from("applications").select("*").eq("participant_id", user.id),
      supabase.from("payments").select("*").eq("participant_id", user.id).order("created_at", { ascending: false }),
      supabase.from("consent_ledger").select("*").eq("participant_id", user.id).order("consent_timestamp", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setStudies((s.data as Study[]) ?? []);
    setApps((a.data as App[]) ?? []);
    setPays((p.data as Pay[]) ?? []);
    setConsents((c.data as Consent[]) ?? []);
    setNotifs((n.data as Notif[]) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    if (studies.length === 0) return;
    match({ data: { interests: "research and innovation", studies: studies.slice(0, 10).map(s => ({ id: s.id, title: s.title, category: s.category, description: s.description.slice(0, 200) })) } })
      .then(r => setRecs(r.recommendations))
      .catch(() => {});
  }, [studies.length]);

  const appliedIds = new Set(apps.map(a => a.study_id));

  const doApply = async (studyId: string) => {
    try {
      const r = await apply({ data: { studyId } });
      if (!r.ok) return toast.error(r.error);
      toast.success(`Applied! Consent hash: ${r.blockchainHash?.slice(0, 16)}…`);
      load();
    } catch (e) { toast.error((e as Error).message); }
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_status: true }).eq("id", id);
    load();
  };

  const totalEarned = pays.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Participant" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, <span className="gradient-text">{profile?.full_name || "Participant"}</span></h1>
          <p className="text-muted-foreground">Browse studies, contribute, and earn — all on-chain.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-5">
            <Wallet className="w-5 h-5 mb-2 text-primary" />
            <div className="text-xs text-muted-foreground">Wallet Balance</div>
            <div className="text-2xl font-bold mt-1 text-gold">{Number(profile?.wallet_balance ?? 0).toFixed(2)} SAR</div>
          </div>
          <div className="glass rounded-xl p-5">
            <Award className="w-5 h-5 mb-2 text-gold" />
            <div className="text-xs text-muted-foreground">Trust Score</div>
            <div className="text-2xl font-bold mt-1">{profile?.trust_score ?? 50}/100</div>
            <Progress value={profile?.trust_score ?? 50} className="mt-2 h-1" />
          </div>
          <div className="glass rounded-xl p-5">
            <FlaskConical className="w-5 h-5 mb-2 text-primary" />
            <div className="text-xs text-muted-foreground">Studies Joined</div>
            <div className="text-2xl font-bold mt-1">{apps.length}</div>
          </div>
          <div className="glass rounded-xl p-5">
            <Shield className="w-5 h-5 mb-2 text-gold" />
            <div className="text-xs text-muted-foreground">Total Earned</div>
            <div className="text-2xl font-bold mt-1">{totalEarned.toFixed(0)} SAR</div>
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="browse">Browse Studies</TabsTrigger>
            <TabsTrigger value="history">My Studies</TabsTrigger>
            <TabsTrigger value="wallet">Wallet & Rewards</TabsTrigger>
            <TabsTrigger value="ledger">Consent Ledger</TabsTrigger>
            <TabsTrigger value="notifs">Notifications {notifs.filter(n => !n.read_status).length > 0 && <Badge className="ml-1">{notifs.filter(n => !n.read_status).length}</Badge>}</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {recs.length > 0 && (
              <div className="glass rounded-xl p-4 mb-4 border-gold/40">
                <Badge className="bg-gold/20 text-gold border-gold/40 mb-2"><Sparkles className="w-3 h-3 mr-1" /> AI matched for you</Badge>
                <div className="text-xs text-muted-foreground">Top {recs.length} studies based on your profile</div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {studies.length === 0 ? <p className="text-muted-foreground">No open studies right now.</p> :
                [...studies].sort((a,b) => (recs.includes(a.id) ? -1 : 0) - (recs.includes(b.id) ? -1 : 0)).map(s => (
                <div key={s.id} className={`glass rounded-xl p-5 ${recs.includes(s.id) ? "border-gold/40" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold flex-1">{s.title}</h3>
                    {recs.includes(s.id) && <Badge className="bg-gold/20 text-gold border-gold/40"><Sparkles className="w-3 h-3" /></Badge>}
                  </div>
                  <Badge variant="outline" className="mt-2">{s.category}</Badge>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-gold font-bold">{s.reward_amount} SAR</div>
                    {appliedIds.has(s.id) ? <Badge>Applied</Badge> :
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary/70" onClick={() => doApply(s.id)}>Apply</Button>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-3">
              {apps.length === 0 ? <p className="text-muted-foreground">You haven't applied yet.</p> : apps.map(a => {
                const study = studies.find(s => s.id === a.study_id);
                return (
                  <div key={a.id} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{study?.title ?? a.study_id.slice(0,8)}</div>
                      <div className="text-xs text-muted-foreground">Submitted {new Date(a.submission_date).toLocaleDateString()}</div>
                    </div>
                    <Badge variant={a.application_status === "approved" ? "default" : "outline"}>{a.application_status}</Badge>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="space-y-3">
              <div className="glass rounded-xl p-6 bg-gradient-to-br from-primary/10 to-gold/10">
                <div className="text-sm text-muted-foreground">Current balance</div>
                <div className="text-4xl font-bold gradient-text mt-2">{Number(profile?.wallet_balance ?? 0).toFixed(2)} SAR</div>
                <div className="text-xs text-muted-foreground mt-2">Total earned all-time: {totalEarned.toFixed(2)} SAR · {pays.length} payments</div>
              </div>
              {pays.map(p => (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-primary">{p.transaction_hash.slice(0, 28)}…</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gold">+{Number(p.amount).toFixed(2)} SAR</div>
                    <Badge variant="outline">{p.payment_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ledger">
            <div className="glass rounded-xl p-4 mb-4 border-primary/40">
              <Badge className="bg-primary/20 text-primary border-primary/40 mb-2"><Shield className="w-3 h-3 mr-1" /> Immutable on-chain consent records</Badge>
              <p className="text-xs text-muted-foreground">Every consent is SHA-256 hashed and stored permanently. Verifiable forever.</p>
            </div>
            <div className="space-y-2">
              {consents.length === 0 ? <p className="text-muted-foreground">No consent records yet.</p> : consents.map(c => (
                <div key={c.id} className="glass rounded-xl p-4">
                  <div className="font-mono text-xs text-primary break-all">{c.blockchain_hash}</div>
                  <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                    <span>Study {c.study_id.slice(0, 8)}…</span>
                    <span>{new Date(c.consent_timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifs">
            <div className="space-y-2">
              {notifs.length === 0 ? <p className="text-muted-foreground">No notifications.</p> : notifs.map(n => (
                <div key={n.id} className={`glass rounded-xl p-4 ${!n.read_status ? "border-primary/40" : ""}`} onClick={() => !n.read_status && markRead(n.id)}>
                  <div className="flex items-start gap-3">
                    <Bell className={`w-4 h-4 mt-1 ${!n.read_status ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{n.title}</div>
                      <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                      <div className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="glass rounded-xl p-6 max-w-xl space-y-2">
              <h3 className="font-semibold mb-3">Profile</h3>
              <div className="text-sm"><span className="text-muted-foreground">Name:</span> {profile?.full_name}</div>
              <div className="text-sm"><span className="text-muted-foreground">Email:</span> {profile?.email}</div>
              <div className="text-sm"><span className="text-muted-foreground">Nationality:</span> {profile?.nationality || "—"}</div>
              <div className="text-sm"><span className="text-muted-foreground">Age:</span> {profile?.age || "—"}</div>
              <div className="text-sm"><span className="text-muted-foreground">Trust Score:</span> <span className="text-primary font-bold">{profile?.trust_score}/100</span></div>
              <Button onClick={() => refresh()} variant="outline" size="sm" className="mt-3">Refresh</Button>
            </div>
            <p className="mt-6 text-sm"><Link to="/" className="text-primary hover:underline">← Back to home</Link></p>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
