"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CadastroContent() {
  const router = useRouter();
  const params = useSearchParams();
  const origem = params.get("origem");

  const [modo, setModo]       = useState<"cadastro"|"login">("cadastro");
  const [email, setEmail]     = useState("");
  const [senha, setSenha]     = useState("");
  const [nome, setNome]       = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState("");

  useEffect(() => {
    // Pré-preenche nome do quiz se vier do diagnóstico
    const quiz = sessionStorage.getItem("nv_quiz");
    if (quiz) {
      try { const d = JSON.parse(quiz); if (d.nome) setNome(d.nome); } catch {}
    }
    // Se já tem sessão, vai direto para planos
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/planos?origem=diagnostico");
    });
  }, []);

  const cadastrar = async () => {
    if (!email || !senha || !nome) { setErro("Preencha todos os campos."); return; }
    if (senha.length < 6) { setErro("Senha deve ter pelo menos 6 caracteres."); return; }
    setLoading(true); setErro("");

    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) { setErro(error.message); setLoading(false); return; }

    // Salva nome no banco
    if (data.user) {
      await supabase.from("usuarios").upsert({
        id: data.user.id,
        nome,
        plano: "free",
        diagnostico: { nome, email },
      });
      // Merge quiz com nome/email
      const quiz = sessionStorage.getItem("nv_quiz");
      if (quiz) {
        try {
          const d = JSON.parse(quiz);
          const merged = { ...d, nome, email };
          sessionStorage.setItem("nv_quiz", JSON.stringify(merged));
        } catch {}
      }
    }
    setLoading(false);
    // Vai para planos
    router.push("/planos?origem=diagnostico");
  };

  const entrar = async () => {
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setLoading(true); setErro("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) { setErro("E-mail ou senha incorretos."); setLoading(false); return; }
    setLoading(false);
    router.push(origem === "diagnostico" ? "/planos?origem=diagnostico" : "/dashboard");
  };

  const entrarGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/planos?origem=diagnostico` }
    });
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F7F7F7", padding:"1rem" }}>
      <div style={{ background:"white", borderRadius:20, padding:"2.5rem", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(0,0,0,.08)" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:24, fontWeight:700, letterSpacing:"-.04em", marginBottom:4 }}>nuvita</div>
          <h2 style={{ fontSize:"1.1rem", fontWeight:500, color:"#111827", marginBottom:4 }}>
            {modo === "cadastro" ? "Crie sua conta" : "Entrar na conta"}
          </h2>
          <p style={{ fontSize:13, color:"#6B7280" }}>
            {modo === "cadastro" ? "e acesse seu protocolo personalizado" : "e continue seu protocolo"}
          </p>
        </div>

        {/* Google */}
        <button onClick={entrarGoogle}
          style={{ width:"100%", padding:"11px", borderRadius:10, border:"1.5px solid #E5E7EB", background:"white", display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:500, color:"#374151", marginBottom:"1rem" }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
            <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
            <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05"/>
            <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
          <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
          <span style={{ fontSize:12, color:"#9CA3AF" }}>ou</span>
          <div style={{ flex:1, height:1, background:"#E5E7EB" }}/>
        </div>

        {/* Formulário */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {modo === "cadastro" && (
            <input value={nome} onChange={e => setNome(e.target.value)}
              style={{ padding:"10px 14px", borderRadius:10, border:"1.5px solid #E5E7EB", fontSize:14, fontFamily:"inherit", outline:"none" }}
              placeholder="Seu primeiro nome"/>
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ padding:"10px 14px", borderRadius:10, border:"1.5px solid #E5E7EB", fontSize:14, fontFamily:"inherit", outline:"none" }}
            placeholder="E-mail"/>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (modo === "cadastro" ? cadastrar() : entrar())}
            style={{ padding:"10px 14px", borderRadius:10, border:"1.5px solid #E5E7EB", fontSize:14, fontFamily:"inherit", outline:"none" }}
            placeholder="Senha (mín. 6 caracteres)"/>
        </div>

        {erro && <div style={{ fontSize:13, color:"#D85A30", marginTop:8, textAlign:"center" }}>{erro}</div>}

        <button onClick={modo === "cadastro" ? cadastrar : entrar} disabled={loading}
          style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:"#111827", color:"white", fontFamily:"inherit", fontSize:15, fontWeight:500, cursor:"pointer", marginTop:"1rem", opacity:loading?0.7:1 }}>
          {loading ? "Aguarde..." : modo === "cadastro" ? "Criar conta e ver planos →" : "Entrar →"}
        </button>

        <div style={{ textAlign:"center", marginTop:"1rem", fontSize:13, color:"#6B7280" }}>
          {modo === "cadastro" ? (
            <>Já tem conta?{" "}
              <button onClick={() => setModo("login")} style={{ background:"none", border:"none", color:"#0F6E56", fontWeight:500, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>Entrar</button>
            </>
          ) : (
            <>Não tem conta?{" "}
              <button onClick={() => setModo("cadastro")} style={{ background:"none", border:"none", color:"#0F6E56", fontWeight:500, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>Criar conta</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#F7F7F7" }}/>}>
      <CadastroContent/>
    </Suspense>
  );
}
