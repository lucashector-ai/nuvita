"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PagamentoSucesso() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const plano = params.get("plano");
    const userId = params.get("userId");
    
    if (plano && userId) {
      // Atualiza o plano localmente também (o webhook já fez no banco)
      supabase.from("usuarios").update({ plano }).eq("id", userId).then(() => {
        setTimeout(() => router.replace("/dashboard"), 3000);
      });
    } else {
      setTimeout(() => router.replace("/dashboard"), 3000);
    }
  }, []);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F7F7F7" }}>
      <div style={{ background:"white", borderRadius:20, padding:"3rem", textAlign:"center", maxWidth:400, boxShadow:"0 4px 24px rgba(0,0,0,.08)" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
        <h2 style={{ fontSize:"1.3rem", fontWeight:500, marginBottom:".5rem" }}>Pagamento confirmado!</h2>
        <p style={{ fontSize:13, color:"#6B7280", marginBottom:"1.5rem" }}>
          Seu plano foi ativado com sucesso. Redirecionando para o dashboard...
        </p>
        <div style={{ width:40, height:4, background:"#22C55E", borderRadius:100, margin:"0 auto", animation:"progress 3s linear forwards" }}/>
      </div>
      <style>{`@keyframes progress { from{width:40px} to{width:400px} }`}</style>
    </div>
  );
}
