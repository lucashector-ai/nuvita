"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { buildProtocol, OM, DM, SM, NM, EM } from "@/lib/peptides";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { Objetivo } from "@/types";

type Section = "inicio" | "protocolo" | "ia" | "calc" | "lib" | "calendario" | "historico" | "config";

export default function DashboardPage() {
  const router = useRouter();
  const { session, logout, updateSession } = useSession();
  const [section, setSection] = useState<Section>("inicio");
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkinVal, setCheckinVal] = useState(0);

  useEffect(() => {
    if (!session?.email || !session?.q3?.length) {
      router.replace("/diagnostico");
    }
  }, [session, router]);

  useEffect(() => {
    if (section === "ia" && aiMessages.length === 0) initAI();
  }, [section]);

  if (!session?.email) return null;

  const objs = (session.q3 || ["gordura"]) as Objetivo[];
  const peso = session.peso || 75;
  const nivel = session.nivel || "iniciante";
  const dur = session.duracao || "8sem";
  const nome = session.nome || "você";
  const plano = session.plano || "free";
  const activePlan = session._activePlan || plano;
  const initial = nome.charAt(0).toUpperCase();
  const planLabel = { free: "Conta gratuita", essencial: "Essencial", pro: "Pro ✦" }[activePlan] || "Conta gratuita";
  const protocolo = buildProtocol(objs, peso);
  const a = session.altura || 170;
  const imc = (peso / Math.pow(a / 100, 2)).toFixed(1);

  // ── Sidebar items ──────────────────────────────────
  const navItems = [
    { id: "inicio", label: "Início", icon: <HomeIcon />, active: section === "inicio", onClick: () => setSection("inicio") },
    { id: "protocolo", label: "Protocolo", icon: <DocIcon />, active: section === "protocolo", onClick: () => setSection("protocolo") },
    { id: "ia", label: "IA Nuvita", icon: <AIIcon />, active: section === "ia", onClick: () => setSection("ia") },
    { id: "calendario", label: "Calendário", icon: <CalIcon />, active: section === "calendario", onClick: () => setSection("calendario") },
    { id: "historico", label: "Histórico", icon: <ClockIcon />, active: section === "historico", onClick: () => setSection("historico") },
    { id: "calc", label: "Calculadora", icon: <CalcIcon />, active: section === "calc", onClick: () => setSection("calc") },
    { id: "lib", label: "Biblioteca", icon: <LibIcon />, active: section === "lib", onClick: () => setSection("lib") },
    { id: "config", label: "Configurações", icon: <CogIcon />, active: section === "config", onClick: () => setSection("config") },
  ];

  // ── IA ─────────────────────────────────────────────
  function initAI() {
    setAiMessages([{
      role: "ai",
      text: `Olá, ${nome}! Sou a IA Nuvita, sua especialista em protocolos de peptídeos.\n\nSeu protocolo foi montado para: **${objs.map(o => OM[o]).join(", ")}** — ${DM[dur]} de ciclo, nível ${NM[nivel]}.\n\nComo posso ajudar?`,
    }]);
  }

  async function sendAI() {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput("");
    setAiMessages((m) => [...m, { role: "user", text: msg }]);
    setAiLoading(true);

    const history = aiMessages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
    history.push({ role: "user", content: msg });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: `Você é a IA Nuvita, assistente especialista em protocolos de peptídeos terapêuticos. Ajuda ${nome} com seu protocolo. Objetivos: ${objs.map(o => OM[o]).join(", ")}. Peso: ${peso}kg. Nível: ${NM[nivel]}. Duração: ${DM[dur]}. Responda sempre em português brasileiro, seja preciso e prático.`,
          messages: history,
        }),
      });
      const data = await res.json();
      setAiMessages((m) => [...m, { role: "ai", text: data.content?.[0]?.text || "Não consegui processar. Tente novamente." }]);
    } catch {
      setAiMessages((m) => [...m, { role: "ai", text: "Não foi possível conectar ao serviço de IA. Tente novamente." }]);
    }
    setAiLoading(false);
  }

  function doLogout() {
    logout();
    router.push("/diagnostico");
  }

  return (
    <div className="min-h-screen bg-[var(--bg2)]">
      <Sidebar
        items={navItems}
        userName={nome}
        planLabel={planLabel}
        onProfile={() => setProfileOpen(true)}
        onLogout={doLogout}
      />

      {/* Main content — offset pela sidebar */}
      <div
        className="transition-all duration-[220ms]"
        style={{ marginLeft: "var(--sb-w)" }}
      >
        {/* Topbar */}
        <nav className="bg-white border-b border-[var(--border)] sticky top-0 z-50">
          <div className="max-w-[1216px] mx-auto px-8 h-[58px] flex items-center justify-between">
            <button onClick={() => setSection("inicio")} className="cursor-pointer">
              <span className="text-lg font-medium tracking-[-0.04em] text-[var(--dark)]">nuvita</span>
            </button>
            <div className="flex items-center gap-2.5">
              <span
                onClick={() => setProfileOpen(true)}
                className="text-xs font-medium bg-[var(--gp)] text-[var(--gm)] px-3 py-1 rounded-full cursor-pointer"
              >
                {planLabel}
              </span>
            </div>
          </div>
        </nav>

        {/* Body */}
        <div className="max-w-[1216px] mx-auto px-8 py-6 pb-16">

          {/* ── INÍCIO ──────────────────────────────── */}
          {section === "inicio" && (
            <div>
              {/* Banner */}
              <div
                className="rounded-2xl p-7 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap"
                style={{ background: "radial-gradient(ellipse 90% 120% at 70% 0%, #B0EDD8 0%, var(--gp) 22%, #E4F9F2 45%, #F7FDFB 70%)", border: "1px solid #C0EAE0" }}
              >
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--gm)] mb-1">Bem-vindo(a) de volta</div>
                  <div className="text-2xl font-medium tracking-[-0.05em] text-[var(--dark)] mb-1">
                    Olá, <span className="text-[var(--gm)]">{nome}</span>. Protocolo ativo.
                  </div>
                  <div className="text-sm text-[var(--tm)]">Semana 1 — {DM[dur]} de ciclo</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    ["—", "Adesão"],
                    ["1", "Semana"],
                    [SM[dur], "Ciclo"],
                  ].map(([v, l]) => (
                    <div key={l} className="bg-white/70 border border-white/90 rounded-xl px-4 py-2.5 text-center min-w-[70px]">
                      <div className="text-xl font-medium tracking-[-0.05em] text-[var(--dark)] leading-none">{v}</div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--tm)] mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
                {/* Coluna esquerda */}
                <div>
                  {/* CTA iniciar */}
                  <div className="bg-white rounded-xl p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
                    <div>
                      <Badge dot className="mb-2">Protocolo pronto</Badge>
                      <div className="text-base font-medium tracking-[-0.03em] mb-1">Seu protocolo está configurado e aguardando.</div>
                      <div className="text-sm text-[var(--tm)]">Quando tiver os peptídeos em mãos, dê o start.</div>
                    </div>
                    <Button onClick={() => setSection("protocolo")}>Ver protocolo completo</Button>
                  </div>

                  {/* Tarefas do dia */}
                  <div className="bg-white rounded-xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)]">Tarefas de hoje</span>
                      <Badge dot>Dia 1</Badge>
                    </div>
                    <div className="flex flex-col gap-2">
                      {protocolo.filter((p) => p.ck).map((item) => (
                        <div key={item.n} className="flex items-center gap-2.5 p-3 bg-[var(--bg2)] rounded-xl text-sm">
                          <div className="w-5 h-5 rounded-full border border-[var(--border2)] flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-[var(--tx)]">{item.e} {item.n}</div>
                            <div className="text-xs text-[var(--ts)]">{item.timing}</div>
                          </div>
                          <div className="text-xs font-medium text-[var(--tx)]">{item.doseStr(peso)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="bg-white rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)]">Progresso do ciclo</span>
                      <span className="text-xs text-[var(--ts)]">Semana 1</span>
                    </div>
                    {[
                      ["Adesão ao protocolo", 0],
                      ["Duração do ciclo", 12],
                      ["Check-ins realizados", 0],
                    ].map(([label, pct]) => (
                      <div key={label as string} className="mb-3 last:mb-0">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-[var(--tx)] tracking-[-0.02em]">{label}</span>
                          <span className="font-medium text-[var(--gm)]">{pct}%</span>
                        </div>
                        <div className="h-[5px] bg-[var(--border)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--green)] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coluna direita */}
                <div>
                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      ["Objetivos", objs.map((o) => OM[o]).join(", ")],
                      ["Ciclo", SM[dur]],
                      ["Peso", `${peso}kg`],
                      ["IMC", imc],
                    ].map(([l, v]) => (
                      <div key={l as string} className="bg-[var(--bg2)] rounded-xl p-3.5">
                        <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--ts)] mb-1">{l}</div>
                        <div className="text-lg font-medium tracking-[-0.05em] leading-none">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Check-in */}
                  <div className="bg-[var(--dark)] rounded-xl p-5">
                    <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-white/45 mb-2">Check-in diário</div>
                    <div className="text-base font-medium text-white mb-4 leading-snug tracking-[-0.03em]">
                      Como você está se sentindo hoje?
                    </div>
                    <div className="flex gap-1.5 mb-4">
                      {[
                        { v: 1, e: "😔" }, { v: 2, e: "😕" }, { v: 3, e: "😐" },
                        { v: 4, e: "😊" }, { v: 5, e: "😄" },
                      ].map(({ v, e }) => (
                        <button
                          key={v}
                          onClick={() => setCheckinVal(v)}
                          className={[
                            "flex-1 aspect-square rounded-xl flex items-center justify-center text-xl",
                            "border transition-all",
                            checkinVal === v
                              ? "bg-white/15 border-white/30"
                              : "bg-white/7 border-white/7 hover:bg-white/12",
                          ].join(" ")}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { if (checkinVal) setCheckinDone(true); }}
                      className={[
                        "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
                        checkinDone
                          ? "bg-white/15 text-[var(--green)]"
                          : "bg-[var(--green)] text-[var(--dark)] hover:opacity-90",
                      ].join(" ")}
                      disabled={checkinDone}
                    >
                      {checkinDone ? "✓ Check-in registrado" : "Registrar check-in"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PROTOCOLO ───────────────────────────── */}
          {section === "protocolo" && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm text-[var(--ts)]">
                <button onClick={() => setSection("inicio")} className="hover:text-[var(--tx)]">← Início</button>
                <span>·</span>
                <span className="text-[var(--tx)] font-medium">Protocolo</span>
              </div>
              <div className="bg-white rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)]">Protocolo ativo completo</span>
                  <span className="text-xs font-medium bg-[var(--gp)] text-[var(--gm)] px-2.5 py-1 rounded-full">{NM[nivel]}</span>
                </div>
                {protocolo.map((item, i) => (
                  <div key={item.n} className="flex items-start gap-2.5 py-3 border-b border-[var(--border)] last:border-0">
                    <div className="w-9 h-9 bg-[var(--gp)] rounded-xl flex items-center justify-center text-base flex-shrink-0">{item.e}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--tx)] mb-0.5">{item.n}</div>
                      <div className="text-xs text-[var(--ts)] mb-1">{item.m}</div>
                      {item.why && (
                        <div className="text-xs text-[var(--gm)] bg-[var(--gp)] px-2.5 py-1.5 rounded-lg mb-1 leading-snug">{item.why}</div>
                      )}
                      <div className="text-xs text-[var(--gm)] font-medium">{item.freq} · {item.timing}</div>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[80px]">
                      <div className="text-xs font-medium text-[var(--tx)]">{item.doseStr(peso)}</div>
                      <div className="text-[10px] text-[var(--ts)]">{item.route}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── IA NUVITA ────────────────────────────── */}
          {section === "ia" && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm text-[var(--ts)]">
                <button onClick={() => setSection("inicio")} className="hover:text-[var(--tx)]">← Início</button>
                <span>·</span>
                <span className="text-[var(--tx)] font-medium">IA Nuvita</span>
              </div>
              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[var(--border)]">
                  <div className="w-9 h-9 bg-[var(--gp)] rounded-xl flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <div className="text-sm font-medium text-[var(--tx)]">IA Nuvita</div>
                    <div className="text-xs text-[var(--ts)]">Assistente de protocolo personalizado</div>
                  </div>
                </div>

                {/* Sugestões */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Como aplicar os peptídeos?", "Qual o melhor timing?", "Posso combinar esses peptídeos?", "Quais os efeitos colaterais?"].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setAiInput(s); }}
                      className="px-3 py-1.5 bg-[var(--bg2)] border border-[var(--border)] rounded-full text-xs font-medium text-[var(--tm)] hover:border-[var(--green)] hover:text-[var(--gm)] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Mensagens */}
                <div className="flex flex-col gap-3 min-h-[300px] max-h-[400px] overflow-y-auto mb-4">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={["flex", msg.role === "user" ? "justify-end" : "justify-start"].join(" ")}>
                      <div
                        className={[
                          "max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-[var(--dark)] text-white rounded-br-sm"
                            : "bg-[var(--bg2)] border border-[var(--border)] text-[var(--tx)] rounded-bl-sm",
                        ].join(" ")}
                        dangerouslySetInnerHTML={{
                          __html: msg.text
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n/g, "<br>"),
                        }}
                      />
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--bg2)] border border-[var(--border)] px-4 py-2.5 rounded-xl text-sm text-[var(--ts)] rounded-bl-sm">
                        Analisando seu protocolo...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <textarea
                    className="flex-1 p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl text-sm resize-none outline-none focus:border-[var(--green)] h-10"
                    placeholder="Pergunte sobre seu protocolo..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); } }}
                  />
                  <button
                    onClick={sendAI}
                    disabled={aiLoading || !aiInput.trim()}
                    className="w-10 h-10 bg-[var(--dark)] rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-[var(--dark2)] disabled:opacity-35 transition-all self-end"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                      <path d="M2 8l12-5-5 12-2-4.5L2 8z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIG ──────────────────────────────── */}
          {section === "config" && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm text-[var(--ts)]">
                <button onClick={() => setSection("inicio")} className="hover:text-[var(--tx)]">← Início</button>
                <span>·</span>
                <span className="text-[var(--tx)] font-medium">Configurações</span>
              </div>
              <div className="bg-white rounded-xl p-5 mb-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)] mb-4">Perfil e conta</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Nome", nome],
                    ["E-mail", session.email || "—"],
                    ["Plano", planLabel],
                    ["Membro desde", new Date().toLocaleDateString("pt-BR")],
                  ].map(([l, v]) => (
                    <div key={l as string} className="bg-[var(--bg3)] rounded-xl p-3.5">
                      <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--ts)] mb-1">{l}</div>
                      <div className="text-sm font-medium text-[var(--tx)]">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)] mb-2">Diagnóstico</div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    ["Objetivos", objs.map((o) => OM[o]).join(", ")],
                    ["Nível", NM[nivel]],
                    ["Atividade", EM[session.atividade || "moderado"]],
                    ["Duração", DM[dur]],
                  ].map(([l, v]) => (
                    <div key={l as string} className="bg-[var(--bg3)] rounded-xl p-3.5 text-sm">
                      <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--ts)] mb-1">{l}</div>
                      <div className="font-medium text-[var(--tx)]">{v}</div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={() => router.push("/diagnostico")}>
                  Refazer diagnóstico
                </Button>
              </div>
            </div>
          )}

          {/* Placeholder para seções em construção */}
          {["calc", "lib", "calendario", "historico"].includes(section) && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-sm text-[var(--ts)]">
                <button onClick={() => setSection("inicio")} className="hover:text-[var(--tx)]">← Início</button>
              </div>
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="text-4xl mb-4">🚧</div>
                <div className="text-lg font-medium tracking-[-0.03em] mb-2">Em breve</div>
                <div className="text-sm text-[var(--tm)]">Esta seção está sendo desenvolvida.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Perfil ──────────────────────────────── */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} maxWidth="420px">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-medium tracking-[-0.04em]">Meu perfil</h3>
          <button onClick={() => setProfileOpen(false)} className="text-[var(--ts)] text-xl leading-none hover:text-[var(--tx)]">×</button>
        </div>
        <div className="flex items-center gap-3 p-4 bg-[var(--bg2)] rounded-xl mb-5">
          <div className="w-12 h-12 rounded-full bg-[var(--gp)] flex items-center justify-center text-lg font-medium text-[var(--gm)]">
            {initial}
          </div>
          <div>
            <div className="font-medium text-[var(--tx)]">{nome}</div>
            <div className="text-xs text-[var(--ts)]">{planLabel}</div>
          </div>
        </div>
        <div className="mb-5">
          {[["Nome", nome], ["E-mail", session.email || "—"], ["Plano", planLabel]].map(([l, v]) => (
            <div key={l as string} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
              <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)]">{l}</span>
              <span className="text-sm font-medium text-[var(--tx)]">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={() => { setProfileOpen(false); setSection("config"); }}>
            Configurações do diagnóstico
          </Button>
          <Button fullWidth variant="outline" onClick={() => { setProfileOpen(false); doLogout(); }}
            className="!text-[var(--am)] !border-[var(--am)]/30 hover:!border-[var(--am)]">
            Sair da conta
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Ícones SVG ────────────────────────────────────────
function HomeIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M2 8L8 2.5 14 8V14H10.5V10.5H5.5V14H2V8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>; }
function DocIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2.5" y="2" width="11" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function AIIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 14.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CalIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function ClockIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CalcIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 6.5h2M9 6.5h2M5 9h2M9 9h2M5 11.5h2M9 11.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function LibIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M3 2.5h10a.5.5 0 01.5.5v10a.5.5 0 01-.5.5H3a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 2.5v11M6 6.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function CogIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
