"use client";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";

// SEGURANÇA: esta página NÃO atualiza mais o plano no banco.
// Antes lia `plano` e `userId` da query string e fazia update direto via
// supabase anon — qualquer um podia visitar /pagamento/sucesso?plano=pro&userId=X
// e ganhar upgrade gratuito. Agora o plano só muda via webhook do Stripe
// (verificado por assinatura HMAC em /api/pagamento/webhook).
function SucessoContent() {
  const router = useRouter();

  useEffect(() => {
    const retorno = sessionStorage.getItem('nv_retorno_pos_plano');
    sessionStorage.removeItem('nv_retorno_pos_plano');
    setTimeout(() => router.replace(retorno === 'dashboard' ? '/dashboard' : '/revisao'), 3000);
  }, [router]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F7F7F7" }}>
      <div style={{ background:"white", borderRadius:20, padding:"3rem", textAlign:"center", maxWidth:400, boxShadow:"0 4px 24px rgba(0,0,0,.08)" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>✅</div>
        <h2 style={{ fontSize:"1.3rem", fontWeight:500, marginBottom:".5rem" }}>Pagamento confirmado!</h2>
        <p style={{ fontSize:13, color:"#6B7280", marginBottom:"1.5rem" }}>
          Seu plano foi ativado. Redirecionando para revisar seu protocolo...
        </p>
      </div>
    </div>
  );
}

export default function PagamentoSucesso() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#F7F7F7" }}/>}>
      <SucessoContent/>
    </Suspense>
  );
}
