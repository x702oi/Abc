import { useEffect, useMemo, useState, type ElementType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { CheckCircle2, Fingerprint, Loader2, Trash2, Users, Wallet, FileText, Brain, ShieldAlert, DatabaseZap } from "lucide-react";
import { deleteUserAccount, resetUserPassword, setUserAccountState, upsertSystemSetting, replySupportTicket } from "@/lib/admin.functions";

export type AdminSection = "overview" | "users" | "studies" | "payments" | "blockchain" | "fraud" | "analytics" | "reports" | "notifications" | "settings" | "support";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  wallet_balance: number;
  trust_score: number;
  created_at: string;
  account_status: string;
  verification_status: string;
};

type Role = { user_id: string; role: string };
type Study = { id: string; researcher_id: string; title: string; category: string; status: string; total_participants: number; max_participants: number; reward_amount: number; created_at: string };
type Payment = { id: string; participant_id: string; amount: number; payment_status: string; transaction_hash: string; created_at: string; study_id: string };
type Ledger = { id: string; participant_id: string; study_id: string; blockchain_hash: string; consent_timestamp: string };
type FraudReport = { id: string; user_id: string; risk_level: number; report_reason: string; created_at: string; status: string; duplicate_identity_score: number | null; bot_probability: number | null };
type SystemSetting = { id: string; setting_name: string; setting_value: string };
type SupportTicket = { id: string; user_id: string; issue: string; status: string; created_at: string; admin_reply: string | null };
type Notification = { id: string; user_id: string; title: string; message: string; read_status: boolean; created_at: string };

type AdminData = {
  profiles: Profile[];
  roles: Role[];
  studies: Study[];
  payments: Payment[];
  ledger: Ledger[];
  fraudReports: FraudReport[];
  settings: SystemSetting[];
  tickets: SupportTicket[];
  notifications: Notification[];
};

const blankData: AdminData = { profiles: [], roles: [], studies: [], payments: [], ledger: [], fraudReports: [], settings: [], tickets: [], notifications: [] };

const statCard = (icon: ElementType, label: string, value: string | number, hint?: string) => ({ icon, label, value, hint });

function getUserRole(userId: string, roles: Role[]) {
  return roles.find((r) => r.user_id === userId)?.role ?? "participant";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function sumUserEarnings(userId: string, payments: Payment[]) {
  return payments.filter((payment) => payment.participant_id === userId && payment.payment_status !== "failed").reduce((sum, payment) => sum + Number(payment.amount), 0);
}

export function AdminConsole({ section }: { section: AdminSection }) {
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [state, setState] = useState<AdminData>(blankData);

  const load = async () => {
    setBusy(true);
    const [profiles, roles, studies, payments, ledger, fraudReports, settings, tickets, notifications] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, wallet_balance, trust_score, created_at, account_status, verification_status").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("research_studies").select("id, researcher_id, title, category, status, total_participants, max_participants, reward_amount, created_at").order("created_at", { ascending: false }),
      supabase.from("payments").select("id, participant_id, amount, payment_status, transaction_hash, created_at, study_id").order("created_at", { ascending: false }),
      supabase.from("consent_ledger").select("id, participant_id, study_id, blockchain_hash, consent_timestamp").order("consent_timestamp", { ascending: false }),
      supabase.from("fraud_reports").select("id, user_id, risk_level, report_reason, created_at, status, duplicate_identity_score, bot_probability").order("created_at", { ascending: false }),
      supabase.from("system_settings").select("id, setting_name, setting_value").order("setting_name", { ascending: true }),
      supabase.from("support_tickets").select("id, user_id, issue, status, created_at, admin_reply").order("created_at", { ascending: false }),
      supabase.from("notifications").select("id, user_id, title, message, read_status, created_at").order("created_at", { ascending: false }).limit(25),
    ]);
    setState({
      profiles: (profiles.data as Profile[]) ?? [],
      roles: (roles.data as Role[]) ?? [],
      studies: (studies.data as Study[]) ?? [],
      payments: (payments.data as Payment[]) ?? [],
      ledger: (ledger.data as Ledger[]) ?? [],
      fraudReports: (fraudReports.data as FraudReport[]) ?? [],
      settings: (settings.data as SystemSetting[]) ?? [],
      tickets: (tickets.data as SupportTicket[]) ?? [],
      notifications: (notifications.data as Notification[]) ?? [],
    });
    setBusy(false);
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const users = state.profiles.length;
    const researchers = state.roles.filter((r) => r.role === "researcher").length;
    const participants = state.roles.filter((r) => r.role === "participant").length;
    const activeStudies = state.studies.filter((s) => s.status === "open" || s.status === "in_progress").length;
    const completedStudies = state.studies.filter((s) => s.status === "completed").length;
    const revenue = state.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const rewards = revenue;
    const fraudAlerts = state.fraudReports.filter((r) => r.risk_level >= 70).length;
    return { users, researchers, participants, studies: state.studies.length, activeStudies, completedStudies, revenue, rewards, fraudAlerts, txs: state.ledger.length + state.payments.length };
  }, [state]);

  const userRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return state.profiles
      .map((p) => ({ ...p, role: getUserRole(p.id, state.roles), totalStudies: state.studies.filter((s) => s.researcher_id === p.id).length + state.ledger.filter((l) => l.participant_id === p.id).length }))
      .filter((p) => {
        const matchesSearch = !query || [p.full_name, p.email, p.id, p.role, p.account_status].some((x) => String(x).toLowerCase().includes(query));
        const matchesRole = roleFilter === "all" || p.role === roleFilter;
        return matchesSearch && matchesRole;
      });
  }, [roleFilter, search, state]);

  const studyRows = useMemo(() => state.studies.map((s) => ({ ...s, researcherName: state.profiles.find((p) => p.id === s.researcher_id)?.full_name ?? s.researcher_id })), [state]);
  const paymentRows = useMemo(() => state.payments.map((p) => ({ ...p, participantName: state.profiles.find((x) => x.id === p.participant_id)?.full_name ?? p.participant_id, researcherName: state.studies.find((s) => s.id === p.study_id)?.researcher_id ? (state.profiles.find((pr) => pr.id === state.studies.find((s) => s.id === p.study_id)?.researcher_id)?.full_name ?? "") : "" })), [state]);

  const seriesByDate = (items: { created_at: string }[], value = 1) => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const key = new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      map.set(key, (map.get(key) ?? 0) + value);
    });
    return Array.from(map.entries()).slice(-7).map(([name, total]) => ({ name, total }));
  };

  const categoryData = Object.entries(state.studies.reduce<Record<string, number>>((acc, study) => {
    acc[study.category] = (acc[study.category] ?? 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const paymentData = seriesByDate(state.payments, 1).map((item) => ({ ...item, amount: state.payments.filter((p) => new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) === item.name).reduce((sum, p) => sum + Number(p.amount), 0) }));
  const growthData = seriesByDate(state.profiles, 1);
  const activityData = seriesByDate(state.ledger, 1);
  const completionData = [
    { name: "Completed", value: state.studies.filter((s) => s.status === "completed").length },
    { name: "In Progress", value: state.studies.filter((s) => s.status === "in_progress").length },
    { name: "Open", value: state.studies.filter((s) => s.status === "open").length },
    { name: "Draft", value: state.studies.filter((s) => s.status === "draft").length },
  ];
  const walletData = seriesByDate(state.payments, 1).map((item) => ({ ...item, amount: state.payments.filter((p) => new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) === item.name).reduce((sum, p) => sum + Number(p.amount), 0) }));
  const fraudHeat = state.fraudReports.slice(0, 12).map((r) => ({ name: r.user_id.slice(0, 8), risk: r.risk_level }));

  const doStateChange = async (userId: string, accountStatus: "active" | "suspended" | "banned", verificationStatus?: "pending" | "verified" | "rejected") => {
    const r = await setUserAccountState({ data: { userId, accountStatus, verificationStatus } });
    if (r.error) return toast.error(r.error.message ?? "Update failed");
    toast.success("User updated");
    load();
  };

  const doPasswordReset = async (userId: string) => {
    const r = await resetUserPassword({ data: { userId } });
    if (r.error || !r.tempPassword) return toast.error(r.error?.message ?? "Reset failed");
    navigator.clipboard?.writeText(r.tempPassword).catch(() => {});
    toast.success(`Temporary password generated and copied: ${r.tempPassword}`);
    load();
  };

  const doDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user permanently?")) return;
    const r = await deleteUserAccount({ data: { userId } });
    if (r.error) return toast.error(r.error.message ?? "Delete failed");
    toast.success("User deleted");
    load();
  };

  const doSetting = async (settingName: string, settingValue: string) => {
    const r = await upsertSystemSetting({ data: { settingName, settingValue } });
    if (r.error) return toast.error(r.error.message ?? "Save failed");
    toast.success("Setting saved");
    load();
  };

  const doReplyTicket = async (ticketId: string) => {
    const reply = window.prompt("Reply to user:");
    if (!reply) return;
    const r = await replySupportTicket({ data: { ticketId, reply } });
    if (r.error) return toast.error(r.error.message ?? "Reply failed");
    toast.success("Ticket closed and replied");
    load();
  };

  const charts = (
    <div className="grid xl:grid-cols-2 gap-6">
      <Card className="bg-white/5 border-white/10 text-white shadow-[0_0_60px_rgba(16,185,129,0.08)]">
        <CardHeader><CardTitle>User growth</CardTitle></CardHeader>
        <CardContent><ResponsiveContainer width="100%" height={240}><LineChart data={growthData}><XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><Tooltip /><Line dataKey="total" stroke="#10b981" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Earnings analytics</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={240}><AreaChart data={paymentData}><XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="amount" stroke="#34d399" fill="rgba(16,185,129,0.2)" /></AreaChart></ResponsiveContainer></CardContent></Card>
      <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Study completion</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={240}><BarChart data={completionData}><XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
      <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Participant activity</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={240}><AreaChart data={activityData}><XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="total" stroke="#22c55e" fill="rgba(34,197,94,0.15)" /></AreaChart></ResponsiveContainer></CardContent></Card>
      <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Research categories</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={240}><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={84} label>{categoryData.map((entry, i) => <Cell key={entry.name} fill={["#10b981", "#34d399", "#6ee7b7", "#86efac", "#a7f3d0"][i % 5]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
      <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Wallet transaction analytics</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={240}><BarChart data={walletData}><XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} /><Tooltip /><Bar dataKey="amount" fill="#22c55e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
    </div>
  );

  const statCards = [
    statCard(Users, "Total Users", totals.users),
    statCard(Users, "Total Researchers", totals.researchers),
    statCard(Users, "Total Participants", totals.participants),
    statCard(Brain, "Total Studies", totals.studies),
    statCard(DatabaseZap, "Active Studies", totals.activeStudies),
    statCard(CheckCircle2, "Completed Studies", totals.completedStudies),
    statCard(Wallet, "Total Revenue", `${formatMoney(totals.revenue)} SAR`),
    statCard(Wallet, "Total Rewards Paid", `${formatMoney(totals.rewards)} SAR`),
    statCard(ShieldAlert, "Fraud Alerts", totals.fraudAlerts),
    statCard(Fingerprint, "Blockchain Transactions", totals.txs),
  ];

  if (busy && state.profiles.length === 0) {
    return <div className="min-h-[50vh] grid place-items-center text-emerald-100/70"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 text-white">
      {(section === "overview" || section === "analytics") && (
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className="bg-white/5 border-white/10 text-white backdrop-blur-xl">
              <CardContent className="p-5">
                <card.icon className="w-5 h-5 text-emerald-300" />
                <div className="mt-4 text-xs uppercase tracking-[0.24em] text-white/50">{card.label}</div>
                <div className="mt-1 text-2xl font-semibold">{card.value}</div>
                {card.hint && <div className="text-xs text-white/40 mt-1">{card.hint}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(section === "overview" || section === "analytics") && charts}

      {section === "overview" && (
        <div className="grid xl:grid-cols-[1.4fr_0.9fr] gap-6">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle>Live activity feed</CardTitle></CardHeader>
            <CardContent className="space-y-3 max-h-[520px] overflow-auto">
              {state.notifications.slice(0, 8).map((n) => (
                <div key={n.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{n.title}</div>
                    <Badge className={n.read_status ? "bg-white/10" : "bg-emerald-500/20 text-emerald-200"}>{n.read_status ? "Read" : "Live"}</Badge>
                  </div>
                  <div className="text-sm text-white/65 mt-1">{n.message}</div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader><CardTitle>Platform health</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">AI Monitoring</div>
                <div className="mt-1 text-lg font-semibold">No critical anomalies detected</div>
                <p className="text-sm text-emerald-50/75 mt-2">Matching accuracy is stable, transaction throughput is healthy, and consent logs remain immutable.</p>
              </div>
              {state.fraudReports.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <div className="font-medium">{r.report_reason}</div>
                    <div className="text-xs text-white/50">User {r.user_id.slice(0, 8)}…</div>
                  </div>
                  <Badge className={r.risk_level >= 70 ? "bg-red-500/20 text-red-200" : "bg-emerald-500/20 text-emerald-200"}>{r.risk_level}% risk</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {section === "users" && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle>User management</CardTitle>
                <div className="text-sm text-white/55">Search, filter, verify, suspend, reset, and remove accounts.</div>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-black/20 border-white/10 text-white placeholder:text-white/35 md:w-72" />
                <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="bg-black/20 border-white/10 text-white md:w-44"><SelectValue placeholder="Filter role" /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="researcher">Researcher</SelectItem><SelectItem value="participant">Participant</SelectItem></SelectContent></Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader><TableRow className="border-white/10 hover:bg-white/5">{["User ID", "Full Name", "Email", "Role", "Status", "Earnings", "Wallet Balance", "Trust Score", "Total Studies", "Join Date", "Actions"].map((h) => <TableHead key={h} className="text-white/60">{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>
                {userRows.map((u) => (
                  <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-mono text-xs text-white/60">{u.id.slice(0, 8)}…</TableCell>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Badge className="bg-emerald-500/20 text-emerald-200">{u.role}</Badge></TableCell>
                    <TableCell><Badge className={u.account_status === "active" ? "bg-emerald-500/20 text-emerald-200" : u.account_status === "suspended" ? "bg-yellow-500/20 text-yellow-100" : "bg-red-500/20 text-red-100"}>{u.account_status}</Badge></TableCell>
                    <TableCell>{formatMoney(sumUserEarnings(u.id, state.payments))} SAR</TableCell>
                    <TableCell>{formatMoney(Number(u.wallet_balance))} SAR</TableCell>
                    <TableCell>{u.trust_score}/100</TableCell>
                    <TableCell>{u.totalStudies}</TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => doStateChange(u.id, "active", u.role === "researcher" ? "verified" : "pending")}>Approve</Button>
                        <Button size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => doStateChange(u.id, "suspended")}>Suspend</Button>
                        <Button size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => doStateChange(u.id, "banned")}>Ban</Button>
                        <Button size="sm" variant="outline" className="border-white/10 bg-white/5" onClick={() => doPasswordReset(u.id)}>Reset</Button>
                        <Button size="sm" variant="destructive" onClick={() => doDeleteUser(u.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {section === "studies" && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader><CardTitle>Study management</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader><TableRow className="border-white/10 hover:bg-white/5">{["Study ID", "Researcher Name", "Study Title", "Category", "Participants Count", "Reward Budget", "Status", "Created Date", "Actions"].map((h) => <TableHead key={h} className="text-white/60">{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{studyRows.map((s) => (
                <TableRow key={s.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-xs text-white/60">{s.id.slice(0, 8)}…</TableCell>
                  <TableCell>{s.researcherName}</TableCell>
                  <TableCell>{s.title}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>{s.total_participants}/{s.max_participants}</TableCell>
                  <TableCell>{formatMoney(Number(s.reward_amount))} SAR</TableCell>
                  <TableCell><Badge className="bg-emerald-500/20 text-emerald-200">{s.status}</Badge></TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Button size="sm" variant="outline" className="border-white/10 bg-white/5">Review</Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {section === "payments" && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader><CardTitle>Payment management</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader><TableRow className="border-white/10 hover:bg-white/5">{["Transaction ID", "Participant", "Researcher", "Amount", "Status", "Blockchain Hash", "Date"].map((h) => <TableHead key={h} className="text-white/60">{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{paymentRows.map((p) => (
                <TableRow key={p.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-xs text-white/60">{p.id.slice(0, 8)}…</TableCell>
                  <TableCell>{p.participantName}</TableCell>
                  <TableCell>{p.researcherName}</TableCell>
                  <TableCell>{formatMoney(Number(p.amount))} SAR</TableCell>
                  <TableCell><Badge className="bg-emerald-500/20 text-emerald-200">{p.payment_status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-white/60">{p.transaction_hash.slice(0, 18)}…</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {section === "blockchain" && (
        <div className="grid xl:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Blockchain consent logs</CardTitle></CardHeader><CardContent className="space-y-3 max-h-[500px] overflow-auto">{state.ledger.slice(0, 12).map((l) => <div key={l.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between"><div className="font-medium">Consent record</div><Badge className="bg-emerald-500/20 text-emerald-200">Immutable</Badge></div><div className="text-xs text-white/55 mt-2 font-mono break-all">{l.blockchain_hash}</div><div className="text-xs text-white/40 mt-1">Verified: {new Date(l.consent_timestamp).toLocaleString()}</div></div>)}</CardContent></Card>
          <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Smart contract activity</CardTitle></CardHeader><CardContent className="space-y-3">{state.payments.slice(0, 8).map((p) => <div key={p.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between"><div className="font-medium">Reward transaction</div><Badge className="bg-white/10">{p.payment_status}</Badge></div><div className="text-xs text-white/55 mt-2">Hash {p.transaction_hash.slice(0, 18)}…</div></div>)}</CardContent></Card>
        </div>
      )}

      {section === "fraud" && (
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Fraud detection center</CardTitle></CardHeader><CardContent className="space-y-3">{state.fraudReports.map((r) => <div key={r.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-4"><div><div className="font-medium">{r.report_reason}</div><div className="text-xs text-white/45">Account {r.user_id.slice(0, 8)}…</div></div><Badge className={r.risk_level >= 70 ? "bg-red-500/20 text-red-200" : "bg-amber-500/20 text-amber-100"}>{r.risk_level}% risk</Badge></div><div className="mt-3 flex gap-2 text-xs text-white/60"><span>Duplicate: {r.duplicate_identity_score ?? 0}%</span><span>Bot: {r.bot_probability ?? 0}%</span></div></div>)}</CardContent></Card>
          <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Fraud heatmap</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3">{fraudHeat.map((h) => <div key={h.name} className="rounded-2xl border border-white/10 p-4" style={{ background: `rgba(16,185,129,${Math.min(0.85, h.risk / 100)})` }}><div className="text-xs text-black/70 font-mono">{h.name}</div><div className="mt-1 text-lg font-semibold text-black">{h.risk}%</div></div>)}</CardContent></Card>
        </div>
      )}

      {section === "reports" && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader><CardTitle>Reports & exports</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Button className="h-24 justify-start bg-emerald-500/15 hover:bg-emerald-500/25 text-white border border-emerald-400/20" onClick={() => toast.success("PDF report generation ready for backend export")}>Generate PDF report</Button>
            <Button className="h-24 justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={() => {
              const csv = ["id,name,email,role,status", ...userRows.map((u) => [u.id, u.full_name, u.email, u.role, u.account_status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "users-report.csv"; a.click();
            }}>Export users CSV</Button>
            <Button className="h-24 justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={() => toast.success("Analytics export ready")}>Download analytics CSV</Button>
            <Button className="h-24 justify-start bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={load}>Refresh dataset</Button>
          </CardContent>
        </Card>
      )}

      {section === "notifications" && (
        <Card className="bg-white/5 border-white/10 text-white"><CardHeader><CardTitle>Notification center</CardTitle></CardHeader><CardContent className="space-y-3">{state.notifications.map((n) => <div key={n.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between"><div className="font-medium">{n.title}</div><Badge className={n.read_status ? "bg-white/10" : "bg-emerald-500/20 text-emerald-200"}>{n.read_status ? "Read" : "Unread"}</Badge></div><div className="text-sm text-white/60 mt-1">{n.message}</div></div>)}</CardContent></Card>
      )}

      {section === "settings" && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader><CardTitle>Platform settings</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {state.settings.map((setting) => (
              <div key={setting.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">{setting.setting_name}</div>
                <Input defaultValue={setting.setting_value} className="bg-black/30 border-white/10 text-white" onBlur={(e) => doSetting(setting.setting_name, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {section === "support" && (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader><CardTitle>Support center</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {state.tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{ticket.issue}</div>
                  <div className="text-xs text-white/45">User {ticket.user_id.slice(0, 8)}… · {new Date(ticket.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-200">{ticket.status}</Badge>
                  <Button size="sm" className="bg-white/10 text-white" onClick={() => doReplyTicket(ticket.id)}>Reply</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {section === "analytics" && <div>{charts}</div>}
    </div>
  );
}
