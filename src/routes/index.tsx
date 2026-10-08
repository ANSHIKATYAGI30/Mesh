import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MESH — Offline P2P Messaging Prototype" },
      { name: "description", content: "Interactive prototype of MESH, an offline-first peer-to-peer messaging app." },
      { property: "og:title", content: "MESH — Offline P2P Messaging" },
      { property: "og:description", content: "Discover nearby devices and chat without internet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;600;700&display=swap" },
    ],
  }),
  component: App,
});

type Status = "Sending" | "Sent" | "Delivered" | "Failed";
type Msg = { id: number; from: "me" | string; text: string; status: Status; hops: number };
type Peer = { id: string; name: string; rssi: number; connected: boolean };

const MY_ID = "MESH-7F3A-91C2";
const initialPeers: Peer[] = [
  { id: "MESH-A1B2-0C44", name: "Pixel 8", rssi: -48, connected: true },
  { id: "MESH-99DE-71FA", name: "Galaxy S23", rssi: -63, connected: false },
  { id: "MESH-3C0F-22BE", name: "OnePlus 11", rssi: -79, connected: false },
];
const tabs = ["Home", "Nearby", "Chats", "Profile", "Settings"] as const;
type Tab = (typeof tabs)[number];

function App() {
  const [tab, setTab] = useState<Tab>("Home");
  const [peers, setPeers] = useState(initialPeers);
  const [chat, setChat] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({
    "MESH-A1B2-0C44": [{ id: 1, from: "MESH-A1B2-0C44", text: "Hey, you on the mesh?", status: "Delivered", hops: 1 }],
    group: [{ id: 2, from: "MESH-99DE-71FA", text: "Camp group check-in 🏕️", status: "Delivered", hops: 2 }],
  });
  const [log, setLog] = useState<string[]>(["Discovery started", "Connected to Pixel 8"]);
  const [discovery, setDiscovery] = useState(true);
  const addLog = (s: string) => setLog((l) => [s, ...l].slice(0, 8));

  const toggle = (id: string) =>
    setPeers((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        addLog(`${p.connected ? "Disconnected from" : "Connected to"} ${p.name}`);
        return { ...p, connected: !p.connected };
      }),
    );

  const send = (key: string, text: string) => {
    const id = Date.now();
    const online = key === "group" ? peers.some((p) => p.connected) : peers.find((p) => p.id === key)?.connected;
    setMsgs((m) => ({ ...m, [key]: [...(m[key] ?? []), { id, from: "me", text, status: "Sending", hops: 0 }] }));
    const upd = (s: Status) =>
      setMsgs((m) => ({ ...m, [key]: (m[key] ?? []).map((x) => (x.id === id ? { ...x, status: s } : x)) }));
    setTimeout(() => upd(online ? "Sent" : "Failed"), 600);
    if (online) setTimeout(() => upd("Delivered"), 1400);
  };
  const retry = (key: string, id: number) => {
    const m = (msgs[key] ?? []).find((x) => x.id === id);
    if (!m) return;
    setMsgs((all) => ({ ...all, [key]: (all[key] ?? []).filter((x) => x.id !== id) }));
    send(key, m.text);
  };

  const connected = peers.filter((p) => p.connected);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[780px] rounded-[2.5rem] border-4 border-muted bg-background flex flex-col overflow-hidden">
        <header className="px-5 pt-6 pb-3 flex items-center justify-between">
          <span className="font-mono font-semibold tracking-[0.3em] text-primary">MESH</span>
          <span className="font-mono text-xs flex items-center gap-2 text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${connected.length ? "bg-success" : "bg-warning"}`} />
            {connected.length} peers
          </span>
        </header>
        <main className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">
          {tab === "Home" && (
            <>
              <Card>
                <Label>This device</Label>
                <p className="font-mono text-primary text-lg">{MY_ID}</p>
                <p className="text-xs text-muted-foreground">Offline mode · no internet required</p>
              </Card>
              <Card>
                <Label>Network</Label>
                <NetViz peers={peers} />
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Btn onClick={() => setTab("Nearby")}>Scan nearby</Btn>
                <Btn onClick={() => { setTab("Chats"); setChat("group"); }} variant="ghost">Group chat</Btn>
              </div>
              <Card>
                <Label>Activity</Label>
                {log.map((l, i) => <p key={i} className="font-mono text-xs text-muted-foreground py-0.5">› {l}</p>)}
              </Card>
            </>
          )}
          {tab === "Nearby" && (
            <>
              <Label>{discovery ? "Scanning…" : "Discovery paused"}</Label>
              {peers.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.id} · {p.rssi} dBm</p>
                    </div>
                    <Btn variant={p.connected ? "ghost" : "solid"} onClick={() => toggle(p.id)}>
                      {p.connected ? "Disconnect" : "Connect"}
                    </Btn>
                  </div>
                </Card>
              ))}
            </>
          )}
          {tab === "Chats" && !chat && (
            <>
              {[{ id: "group", name: "Group · Everyone" }, ...peers].map((c) => {
                const last = msgs[c.id]?.at(-1);
                return (
                  <button key={c.id} onClick={() => setChat(c.id)} className="w-full text-left">
                    <Card>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{last?.text ?? "No messages yet"}</p>
                    </Card>
                  </button>
                );
              })}
            </>
          )}
          {tab === "Chats" && chat && (
            <ChatView
              title={chat === "group" ? "Group · Everyone" : peers.find((p) => p.id === chat)!.name}
              msgs={msgs[chat] ?? []}
              onBack={() => setChat(null)}
              onSend={(t) => send(chat, t)}
              onRetry={(id) => retry(chat, id)}
            />
          )}
          {tab === "Profile" && (
            <>
              <Card><Label>MESH ID</Label><p className="font-mono text-primary">{MY_ID}</p></Card>
              <div className="grid grid-cols-3 gap-3">
                {[["Sent", Object.values(msgs).flat().filter((m) => m.from === "me").length], ["Peers", connected.length], ["Groups", 1]].map(([k, v]) => (
                  <Card key={k}><p className="text-2xl font-bold text-primary">{v}</p><Label>{k}</Label></Card>
                ))}
              </div>
              <Card><Label>Device</Label><p className="text-sm">Android 14 · Nearby Connections API</p></Card>
            </>
          )}
          {tab === "Settings" && (
            <>
              <Card>
                <div className="flex justify-between items-center">
                  <span>Device discovery</span>
                  <Btn variant={discovery ? "solid" : "ghost"} onClick={() => setDiscovery(!discovery)}>{discovery ? "On" : "Off"}</Btn>
                </div>
              </Card>
              {["Privacy: hide device name", "Messages: max hops = 5", "Theme: Dark", "About: MESH v0.1 — no cloud, no AI"].map((s) => (
                <Card key={s}><p className="text-sm">{s}</p></Card>
              ))}
            </>
          )}
        </main>
        <nav className="grid grid-cols-5 border-t border-border">
          {tabs.map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t !== "Chats") setChat(null); }}
              className={`py-4 text-xs font-mono ${tab === t ? "text-primary" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl bg-card border border-border p-4">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{children}</p>;
}
function Btn({ children, onClick, variant = "solid" }: { children: React.ReactNode; onClick?: () => void; variant?: "solid" | "ghost" }) {
  return (
    <button onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-85 ${variant === "solid" ? "bg-primary text-primary-foreground" : "border border-primary text-primary"}`}>
      {children}
    </button>
  );
}

function NetViz({ peers }: { peers: Peer[] }) {
  const [t, setT] = useState(0);
  useEffect(() => { const i = setInterval(() => setT((x) => x + 1), 1200); return () => clearInterval(i); }, []);
  return (
    <svg viewBox="0 0 200 120" className="w-full">
      {peers.map((p, i) => {
        const a = (i / peers.length) * Math.PI * 2 - Math.PI / 2;
        const x = 100 + Math.cos(a) * 70, y = 60 + Math.sin(a) * 45;
        return (
          <g key={p.id}>
            <line x1={100} y1={60} x2={x} y2={y} stroke={p.connected ? "var(--primary)" : "var(--border)"} strokeDasharray={p.connected ? "0" : "3 3"} />
            <circle cx={x} cy={y} r={7} fill={p.connected ? "var(--secondary)" : "var(--muted)"} />
            <text x={x} y={y + 18} fontSize="7" textAnchor="middle" fill="var(--muted-foreground)">{p.name}</text>
          </g>
        );
      })}
      <circle cx={100} cy={60} r={10 + (t % 2) * 2} fill="var(--primary)" />
    </svg>
  );
}

function ChatView({ title, msgs, onBack, onSend, onRetry }: {
  title: string; msgs: Msg[]; onBack: () => void; onSend: (t: string) => void; onRetry: (id: number) => void;
}) {
  const [text, setText] = useState("");
  const color: Record<Status, string> = { Sending: "text-warning", Sent: "text-muted-foreground", Delivered: "text-success", Failed: "text-destructive" };
  return (
    <div className="flex flex-col h-full gap-3">
      <button onClick={onBack} className="text-left text-sm text-primary">‹ {title}</button>
      <div className="flex-1 space-y-2">
        {msgs.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.from === "me" ? "items-end" : "items-start"}`}>
            <div className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>{m.text}</div>
            <span className={`font-mono text-[10px] mt-0.5 ${m.from === "me" ? color[m.status] : "text-muted-foreground"}`}>
              {m.from === "me" ? m.status : `${m.from.slice(0, 9)} · ${m.hops} hop`}
              {m.status === "Failed" && <button onClick={() => onRetry(m.id)} className="ml-2 underline">retry</button>}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text.trim()); setText(""); } }} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…"
          className="flex-1 rounded-xl bg-card border border-border px-3 py-2 text-sm outline-none focus:border-primary" />
        <Btn>Send</Btn>
      </form>
    </div>
  );
}
