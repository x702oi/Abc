import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FounderCard } from "@/components/FounderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { aiSuggestStudy } from "@/lib/ai.functions";
import { approveApplication } from "@/lib/study.functions";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Sparkles, Wallet, Users, FlaskConical, TrendingUp, Download, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/researcher")({
  component: ResearcherDash,
  head: () => ({ meta: [{ title: "Researcher Dashboard — ResearchChain Arabia" }] }),
});

type Study = { id: string; title: string; description: string; category: string; reward_amount: number; status: string; total_participants: number; created_at: string; max_participants: number };
type App = { id: string; study_id: string; participant_id: string; application_status: string; submission_date: string; profiles?: { full_name: string; trust_score: number } | null; research_studies?: { title: string } | null };
type Pay = { id: string; amount: number; transaction_hash: string; created_at: string; payment_status: string };

function ResearcherDash() {
  const { user, profile } = useAuth();
  const suggest = useServerFn(aiSuggestStudy);
  const decide = useServerFn(approveApplication);
  const [studies, setStudies] = useState<Study[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Healthcare", reward_amount: "100", max_participants: "50" });

  const load = async () => {
    if (!user) return;
    const [s, a, p] = await Promise.all([
      supabase.from("research_studies").select("*").eq("researcher_id", user.id).order("created_at", { ascending: false }),
      supabase.from("applications").select("*, research_studies!inner(title, researcher_id)").eq("research_studies.researcher_id", user.id).order("submission_date", { ascending: false }),
      supabase.from("payments").select("*, research_studies!inner(researcher_id)").eq("research_studies.researcher_id", user.id).order("created_at", { ascending: false }),
    ]);
    const appsRaw = (a.data ?? []) as unknown as App[];
    const partIds = [...new Set(appsRaw.map(x => x.participant_id))];
    let profMap = new Map<string, { full_name: string; trust_score: number }>();
    if (partIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, trust_score").in("id", partIds);
      profMap = new Map((profs ?? []).map(pr => [pr.id, { full_name: pr.full_name, trust_score: pr.trust_score }]));
    }
    setStudies((s.data as Study[]) ?? []);
    setApps(appsRaw.map(x => ({ ...x, profiles: profMap.get(x.participant_id) ?? null })));
    setPays((p.data as unknown as Pay[]) ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const createStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("research_studies").insert({
      researcher_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      reward_amount: Number(form.reward_amount),
      max_participants: Number(form.max_participants),
      status: "open",
    });
    if (error) return toast.error(error.message);
    toast.success("Study published!");
    setForm({ title: "", description: "", category: "Healthcare", reward_amount: "100", max_participants: "50" });
    load();
  };

  const runAi = async () => {
    if (!aiTopic) return;
    setAiBusy(true);
    try {
      const { suggestion, error } = await suggest({ data: { topic: aiTopic } });
      if (error || !suggestion) throw new Error(error ?? "AI failed");
      setForm({ title: suggestion.title, description: suggestion.description, category: suggestion.category, reward_amount: String(suggestion.reward_amount), max_participants: "50" });
      toast.success("AI suggestion loaded!");
    } catch (e) { toast.error((e as Error).message); }
    setAiBusy(false);
  };

  const decideApp = async (id: string, d: "approved" | "rejected") => {
    try { await decide({ data: { applicationId: id, decision: d } }); toast.success(`Application ${d}`); load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const totalBudget = pays.reduce((s, p) => s + Number(p.amount), 0);
  const pendingApps = apps.filter(a => a.application_status === "pending").length;
  const chartData = studies.slice(0, 6).map(s => ({ name: s.title.slice(0, 12), participants: s.total_participants }));
  const catData = Object.entries(studies.reduce((acc: Record<string, number>, s) => { acc[s.category] = (acc[s.category] ?? 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }));
  const colors = ["#10b981", "#d4af37", "#3b82f6", "#a855f7", "#f97316"];

  const exportCsv = () => {
    const rows = [["Study", "Participant", "Status", "Submitted"], ...apps.map(a => [a.research_studies?.title ?? "", a.profiles?.full_name ?? "", a.application_status, a.submission_date])];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "research-data.csv"; a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Researcher" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, <span className="gradient-text">{profile?.full_name || "Researcher"}</span></h1>
          <p className="text-muted-foreground">Your research command center. Powered by Vision 2030.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { i: FlaskConical, l: "Active Studies", v: studies.filter(s => s.status === "open").length, c: "primary" },
            { i: Users, l: "Total Participants", v: studies.reduce((s, x) => s + x.total_participants, 0), c: "gold" },
            { i: Wallet, l: "Total Paid (SAR)", v: totalBudget.toFixed(0), c: "primary" },
            { i: TrendingUp, l: "Pending Apps", v: pendingApps, c: "gold" },
          ].map(k => (
            <div key={k.l} className="glass rounded-xl p-5">
              <k.i className={`w-5 h-5 mb-2 ${k.c === "gold" ? "text-gold" : "text-primary"}`} />
              <div className="text-xs text-muted-foreground">{k.l}</div>
              <div className="text-2xl font-bold mt-1">{k.v}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create">Create Study</TabsTrigger>
            <TabsTrigger value="manage">Manage Studies</TabsTrigger>
            <TabsTrigger value="applicants">Applicants ({pendingApps})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Recruitment by Study</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="participants" fill="oklch(0.62 0.15 160)" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Studies by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={catData} dataKey="value" nameKey="name" outerRadius={80} label>{catData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-xl p-6 md:col-span-2 border-gold/40">
              <Badge className="bg-gold/20 text-gold border-gold/40 mb-3"><Sparkles className="w-3 h-3 mr-1" /> AI Recommendation</Badge>
              <p className="text-sm">Studies in <strong>Healthcare</strong> and <strong>Sustainability</strong> have the highest participant trust scores in your region. Consider raising rewards by 10–15% for higher conversion.</p>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="glass rounded-xl p-6 max-w-3xl">
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/30">
                <Label className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-gold" /> AI Study Generator</Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. mental health among university students" value={aiTopic} onChange={e => setAiTopic(e.target.value)} />
                  <Button onClick={runAi} disabled={aiBusy} className="bg-gradient-to-r from-primary to-gold">{aiBusy ? "Thinking…" : "Generate"}</Button>
                </div>
              </div>
              <form onSubmit={createStudy} className="space-y-4">
                <div><Label>Title</Label><Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea required rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Healthcare","Education","Technology","Sustainability","Social","Economic"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Reward (SAR)</Label><Input type="number" required value={form.reward_amount} onChange={e => setForm({ ...form, reward_amount: e.target.value })} /></div>
                  <div><Label>Max participants</Label><Input type="number" required value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} /></div>
                </div>
                <Button type="submit" className="bg-gradient-to-r from-primary to-primary/70">Publish study</Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-3">
              {studies.length === 0 ? <p className="text-muted-foreground">No studies yet. Create one!</p> : studies.map(s => (
                <div key={s.id} className="glass rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{s.title}</h3>
                      <Badge variant="outline">{s.category}</Badge>
                      <Badge>{s.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{s.description}</p>
                    <div className="text-xs text-muted-foreground mt-2">{s.total_participants}/{s.max_participants} participants · {s.reward_amount} SAR reward</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applicants">
            <div className="space-y-3">
              {apps.length === 0 ? <p className="text-muted-foreground">No applications yet.</p> : apps.map(a => (
                <div key={a.id} className="glass rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{a.profiles?.full_name || "Anonymous"}</div>
                    <div className="text-xs text-muted-foreground">→ {a.research_studies?.title} · Trust: <span className="text-primary">{a.profiles?.trust_score ?? 50}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.application_status === "pending" ? "outline" : "default"}>{a.application_status}</Badge>
                    {a.application_status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => decideApp(a.id, "rejected")}><X className="w-4 h-4" /></Button>
                        <Button size="sm" className="bg-primary" onClick={() => decideApp(a.id, "approved")}><Check className="w-4 h-4" /></Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="glass rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Research Data Export</h3>
                <Button onClick={exportCsv} variant="outline"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}><XAxis dataKey="name" fontSize={10} /><YAxis fontSize={10} /><Tooltip /><Bar dataKey="participants" fill="oklch(0.80 0.13 85)" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="space-y-2">
              {pays.length === 0 ? <p className="text-muted-foreground">No payments issued yet.</p> : pays.map(p => (
                <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-primary">{p.transaction_hash.slice(0, 24)}…</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gold">{Number(p.amount).toFixed(2)} SAR</div>
                    <Badge variant="outline">{p.payment_status}</Badge>
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
              <div className="text-sm"><span className="text-muted-foreground">Trust score:</span> <span className="text-primary font-bold">{profile?.trust_score}</span></div>
            </div>
            <div className="mt-8"><FounderCard compact /></div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
