"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/apiClient";

const PLANOS = [
  {
    id: "free",
    nome: "Gratuito",
    preco: 0,
    desc: "Para começar",
    features: ["Protocolo personalizado", "Biblioteca de peptídeos", "Diagnóstico por IA"],
    cor: "#6B7280", bg: "#F9FAFB",
  },
  {
    id: "essencial",
    nome: "Essencial",
    preco: 47,
    precoAnual: 38,
    desc: "O mais popular",
    features: ["Tudo do Free", "Coach IA", "Detector de sintomas", "Exportar PDF", "Rotina personalizada"],
    cor: "#0F6E56", bg: "#F0FDF4", destaque: true,
  },
  {
    id: "pro",
    nome: "Pro",
    preco: 97,
    precoAnual: 78,
    desc: "Para quem leva a sério",
    features: ["Tudo do Essencial", "Médico parceiro", "Relatórios avançados", "Simulador de ciclos"],
    cor: "#7C3AED", bg: "#F5F3FF",
  },
];

function PlanosContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [planoAtual, setPlanoAtual] = useState<string>("free");
  const [anual, setAnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/cadastro?origem=diagnostico");
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email || "");

      // Lê plano atual do banco
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("plano")
        .eq("id", session.user.id)
        .single();
      setPlanoAtual(perfil?.plano || "free");
      setReady(true);
    })();
  }, []);

  const selecionarPlano = async (planoId: string) => {
    if (!userId) return;
    setLoading(planoId);

    if (planoId === "free") {
      const quiz = sessionStorage.getItem("nv_quiz");
      let diagData: any = { email };
      if (quiz) {
        try {
          const { plano: _p, _activePlan: _ap, ...rest } = JSON.parse(quiz);
          diagData = { ...rest, email };
        } catch {}
      }
      const { data: perfilAtual } = await supabase
        .from("usuarios").select("diagnostico").eq("id", userId).single();
      const diagFinal = { ...(perfilAtual?.diagnostico || {}), ...diagData };

      await supabase.from("usuarios").upsert({
        id: userId,
        email: email || '',
        diagnostico: diagFinal,
      }, { onConflict: "id" });

      sessionStorage.setItem("nv_quiz", JSON.stringify(diagFinal));
      sessionStorage.setItem("nv_pos_cadastro", "1");
      setLoading(null);
      router.push("/revisao");
      return;
    }

    const res = await apiFetch("/api/pagamento", {
      method: "POST",
      body: JSON.stringify({ plano: planoId, anual }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao iniciar pagamento: " + (data.error || "Tente novamente."));
    }
  };

  if (!ready) {
    return <div style={{ minHeight: "100vh", background: "#F7F7F7" }} />;
  }

  // ═══════════════════════════════════════════════
  // USUÁRIO JÁ É PRO — tela dedicada sem toggle
  // ═══════════════════════════════════════════════
  if (planoAtual === "pro") {
    const proData = PLANOS.find(p => p.id === "pro")!;
    return (
      <div style={{ minHeight: "100vh", background: "#F7F7F7", padding: "3rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.04em", marginBottom: 12 }}>
            nuvita
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#DCFCE7", color: "#15803D",
            padding: "6px 14px", borderRadius: 100,
            fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
            textTransform: "uppercase", marginBottom: 20,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="#15803D">
              <path d="M7 1l1.5 3.5L12 5l-3 3 1 4-3-2-3 2 1-4-3-3 3.5-.5L7 1z" />
            </svg>
            Você é Pro
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 500, letterSpacing: "-.04em", marginBottom: 12 }}>
            Você tem acesso completo à Nuvita
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Todos os recursos avançados estão desbloqueados. Gerencie sua assinatura, pagamentos
            e dados do cartão pelo portal do cliente.
          </p>
        </div>

        {/* Card dedicado Pro */}
        <div style={{ maxWidth: 520, margin: "0 auto 2rem" }}>
          <div style={{
            background: "#111827", color: "white",
            borderRadius: 20, padding: "2rem",
            boxShadow: "0 8px 32px rgba(0,0,0,.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", marginBottom: 4 }}>
                  {proData.nome}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.03em" }}>
                  Plano ativo
                </div>
              </div>
              <div style={{
                padding: "4px 12px", borderRadius: 100,
                background: "#22C55E", color: "white",
                fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase",
              }}>
                ATUAL
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {proData.features.map(f => (
                <div key={f} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 14, color: "rgba(255,255,255,.85)",
                }}>
                  <span style={{ color: "#22C55E", fontSize: 16 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/conta")}
              style={{
                width: "100%", padding: "13px",
                borderRadius: 12, border: "none",
                background: "white", color: "#111827",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Gerenciar minha assinatura →
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none", border: "none",
              color: "#6B7280", fontSize: 13, cursor: "pointer",
              fontFamily: "inherit", textDecoration: "underline",
            }}
          >
            ← Voltar para o painel
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // USUÁRIO NÃO É PRO — mostra os 3 planos com toggle
  // ═══════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F7", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.04em", marginBottom: 12 }}>
          nuvita
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 500, letterSpacing: "-.04em", marginBottom: 8 }}>
          Escolha seu plano
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280" }}>Comece grátis, evolua quando quiser</p>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          marginTop: 16, background: "white",
          borderRadius: 100, padding: "6px 6px 6px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        }}>
          <span style={{ fontSize: 13, color: "#374151" }}>Mensal</span>
          <div
            onClick={() => setAnual(!anual)}
            style={{
              width: 38, height: 22, borderRadius: 100,
              background: anual ? "#111827" : "#D1D5DB",
              cursor: "pointer", position: "relative",
              transition: "background .2s",
            }}
          >
            <div style={{
              position: "absolute", top: 3,
              left: anual ? "calc(100% - 19px)" : 3,
              width: 16, height: 16, borderRadius: "50%",
              background: "white", transition: "left .2s",
              boxShadow: "0 1px 3px rgba(0,0,0,.2)",
            }} />
          </div>
          <span style={{ fontSize: 13, color: "#374151", paddingRight: 8 }}>
            Anual <span style={{ color: "#0F6E56", fontWeight: 600 }}>-20%</span>
          </span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16, maxWidth: 900, margin: "0 auto",
      }}>
        {PLANOS.map(p => {
          const preco = anual && p.precoAnual ? p.precoAnual : p.preco;
          const isLoading = loading === p.id;
          const ehPlanoAtual = p.id === planoAtual;
          return (
            <div key={p.id} style={{
              borderRadius: 20, padding: "1.75rem",
              background: p.destaque ? "#111827" : "white",
              border: ehPlanoAtual
                ? "2px solid #22C55E"
                : p.destaque ? "none" : "1.5px solid #E5E7EB",
              position: "relative",
              boxShadow: "0 4px 16px rgba(0,0,0,.06)",
            }}>
              {p.destaque && !ehPlanoAtual && (
                <div style={{
                  position: "absolute", top: -12, left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22C55E", color: "white",
                  fontSize: 11, fontWeight: 700,
                  padding: "3px 14px", borderRadius: 100,
                }}>
                  MAIS POPULAR
                </div>
              )}
              {ehPlanoAtual && (
                <div style={{
                  position: "absolute", top: -12, left: "50%",
                  transform: "translateX(-50%)",
                  background: "#22C55E", color: "white",
                  fontSize: 11, fontWeight: 700,
                  padding: "3px 14px", borderRadius: 100,
                }}>
                  PLANO ATUAL
                </div>
              )}
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: p.destaque ? "rgba(255,255,255,.6)" : "#6B7280",
                marginBottom: 6,
              }}>{p.nome}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{
                  fontSize: 36, fontWeight: 700,
                  color: p.destaque ? "white" : "#111827",
                }}>
                  {preco === 0 ? "Grátis" : `R$${preco}`}
                </span>
                {preco > 0 && (
                  <span style={{
                    fontSize: 13,
                    color: p.destaque ? "rgba(255,255,255,.5)" : "#9CA3AF",
                  }}>/mês</span>
                )}
              </div>
              {anual && p.precoAnual && (
                <div style={{
                  fontSize: 12,
                  color: p.destaque ? "rgba(255,255,255,.4)" : "#9CA3AF",
                  marginBottom: 8,
                }}>
                  R${p.precoAnual * 12}/ano — cobrado uma vez
                </div>
              )}
              <div style={{
                fontSize: 12,
                color: p.destaque ? "rgba(255,255,255,.5)" : "#9CA3AF",
                marginBottom: "1.5rem",
              }}>{p.desc}</div>

              <button
                onClick={() => !ehPlanoAtual && selecionarPlano(p.id)}
                disabled={!!loading || ehPlanoAtual}
                style={{
                  width: "100%", padding: "12px",
                  borderRadius: 12, border: "none",
                  cursor: (loading || ehPlanoAtual) ? "not-allowed" : "pointer",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 600, marginBottom: "1.25rem",
                  background: ehPlanoAtual
                    ? "#DCFCE7"
                    : p.destaque ? "white" : p.cor,
                  color: ehPlanoAtual
                    ? "#15803D"
                    : p.destaque ? "#111827" : "white",
                  opacity: loading && !isLoading ? 0.6 : 1,
                  transition: "opacity .15s",
                }}
              >
                {isLoading
                  ? "Aguarde..."
                  : ehPlanoAtual
                    ? "Plano atual"
                    : preco === 0
                      ? "Começar grátis →"
                      : `Assinar ${p.nome} →`}
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {p.features.map(f => (
                  <div key={f} style={{
                    display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                    color: p.destaque ? "rgba(255,255,255,.8)" : "#374151",
                  }}>
                    <span style={{ color: p.destaque ? "#22C55E" : p.cor, fontSize: 14 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem", fontSize: 12, color: "#9CA3AF" }}>
        7 dias de garantia · Cancele quando quiser · Sem taxa de cancelamento
      </div>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#F7F7F7" }} />}>
      <PlanosContent />
    </Suspense>
  );
}
