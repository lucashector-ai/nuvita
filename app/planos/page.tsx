"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
  const origem = params.get("origem");
  const [userId, setUserId] = useState<string|null>(null);
  const [email, setEmail]   = useState("");
  const [anual, setAnual]   = useState(false);
  const [loading, setLoading] = useState<string|null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Sem sessão — vai para cadastro
        router.replace("/cadastro?origem=diagnostico");
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email || "");
    });
  }, []);

  const selecionarPlano = async (planoId: string) => {
    if (!userId) return;
    setLoading(planoId);

    if (planoId === "free") {
      // Plano free — salva e vai para revisão
      await supabase.from("usuarios").upsert({
        id: userId,
        plano: "free",
        diagnostico: { email, _activePlan: "free" },
      }, { onConflict: "id" });
      // Merge com dados do quiz
      const quiz = sessionStorage.getItem("nv_quiz");
      if (quiz) {
        try {
          const d = JSON.parse(quiz);
          await supabase.from("usuarios").update({
            diagnostico: { ...d, email, plano: "free", _activePlan: "free" }
          }).eq("id", userId);
        } catch {}
      }
      sessionStorage.setItem("nv_pos_cadastro", "1");
      setLoading(null);
      router.push("/revisao");
      return;
    }

    // Plano pago — chama AbacatePay
    const quiz = sessionStorage.getItem("nv_quiz");
    let nome = email;
    if (quiz) {
      try { const d = JSON.parse(quiz); if (d.nome) nome = d.nome; } catch {}
    }

    const res = await fetch("/api/pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plano: planoId, userId, nome, email, anual,
        valorMensal: anual
          ? PLANOS.find(p => p.id === planoId)?.precoAnual
          : PLANOS.find(p => p.id === planoId)?.preco,
      }),
    });
    const data = await res.json();
    setLoading(null);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao iniciar pagamento. Tente novamente.");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F7F7F7", padding:"2rem 1rem" }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-.04em", marginBottom:12 }}>nuvita</div>
        <h1 style={{ fontSize:"1.6rem", fontWeight:500, letterSpacing:"-.04em", marginBottom:8 }}>
          Escolha seu plano
        </h1>
        <p style={{ fontSize:14, color:"#6B7280" }}>Comece grátis, evolua quando quiser</p>

        {/* Toggle anual */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginTop:16, background:"white", borderRadius:100, padding:"6px 6px 6px 16px", boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
          <span style={{ fontSize:13, color:"#374151" }}>Mensal</span>
          <div onClick={() => setAnual(!anual)}
            style={{ width:38, height:22, borderRadius:100, background:anual?"#111827":"#D1D5DB", cursor:"pointer", position:"relative", transition:"background .2s" }}>
            <div style={{ position:"absolute", top:3, left:anual?"calc(100% - 19px)":3, width:16, height:16, borderRadius:"50%", background:"white", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }}/>
          </div>
          <span style={{ fontSize:13, color:"#374151", paddingRight:8 }}>
            Anual <span style={{ color:"#0F6E56", fontWeight:600 }}>-20%</span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16, maxWidth:900, margin:"0 auto" }}>
        {PLANOS.map(p => {
          const preco = anual && p.precoAnual ? p.precoAnual : p.preco;
          const isLoading = loading === p.id;
          return (
            <div key={p.id} style={{ borderRadius:20, padding:"1.75rem",
              background: p.destaque ? "#111827" : "white",
              border: p.destaque ? "none" : "1.5px solid #E5E7EB",
              position:"relative", boxShadow:"0 4px 16px rgba(0,0,0,.06)" }}>
              {p.destaque && (
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#22C55E", color:"white", fontSize:11, fontWeight:700, padding:"3px 14px", borderRadius:100 }}>
                  MAIS POPULAR
                </div>
              )}
              <div style={{ fontSize:13, fontWeight:600, color:p.destaque?"rgba(255,255,255,.6)":"#6B7280", marginBottom:6 }}>{p.nome}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:4 }}>
                <span style={{ fontSize:36, fontWeight:700, color:p.destaque?"white":"#111827" }}>
                  {preco === 0 ? "Grátis" : `R$${preco}`}
                </span>
                {preco > 0 && <span style={{ fontSize:13, color:p.destaque?"rgba(255,255,255,.5)":"#9CA3AF" }}>/mês</span>}
              </div>
              {anual && p.precoAnual && (
                <div style={{ fontSize:12, color:p.destaque?"rgba(255,255,255,.4)":"#9CA3AF", marginBottom:8 }}>
                  R${p.precoAnual * 12}/ano — cobrado uma vez
                </div>
              )}
              <div style={{ fontSize:12, color:p.destaque?"rgba(255,255,255,.5)":"#9CA3AF", marginBottom:"1.5rem" }}>{p.desc}</div>

              <button onClick={() => selecionarPlano(p.id)} disabled={!!loading}
                style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, marginBottom:"1.25rem",
                  background: p.destaque ? "white" : p.cor,
                  color: p.destaque ? "#111827" : "white",
                  opacity: loading && !isLoading ? 0.6 : 1,
                  transition:"opacity .15s" }}>
                {isLoading ? "Aguarde..." : preco === 0 ? "Começar grátis →" : `Assinar ${p.nome} →`}
              </button>

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13,
                    color: p.destaque ? "rgba(255,255,255,.8)" : "#374151" }}>
                    <span style={{ color: p.destaque ? "#22C55E" : p.cor, fontSize:14 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign:"center", marginTop:"2rem", fontSize:12, color:"#9CA3AF" }}>
        7 dias de garantia · Cancele quando quiser · Sem taxa de cancelamento
      </div>
    </div>
  );
}

export default function PlanosPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#F7F7F7" }}/>}>
      <PlanosContent/>
    </Suspense>
  );
}
