// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SectionExportacao() {
  const [protocolo, setProtocolo] = useState<any>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: u } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
    setUsuario(u);
    setProtocolo(u?.protocolo_gerado);
    setLoading(false);
  };

  const gerarPDF = async () => {
    setGerando(true);
    const peptideos = protocolo?.peptideos || [];
    const nome = usuario?.nome || 'Usuário';
    const objetivo = usuario?.diagnostico?.objetivo || 'Protocolo personalizado';

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#fff; color:#111; }
  .page { width:794px; min-height:1123px; padding:60px; margin:0 auto; }
  
  /* Header */
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:48px; padding-bottom:24px; border-bottom:2px solid #111; }
  .logo { font-size:28px; font-weight:800; letter-spacing:-.04em; }
  .logo span { color:#0F6E56; }
  .meta { text-align:right; font-size:12px; color:#666; line-height:1.6; }
  
  /* Capa */
  .capa { background:#0d0d0d; color:white; border-radius:20px; padding:48px; margin-bottom:40px; position:relative; overflow:hidden; }
  .capa::before { content:''; position:absolute; top:-50px; right:-50px; width:200px; height:200px; background:radial-gradient(circle, #0F6E5630, transparent); border-radius:50%; }
  .capa-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.15em; color:#0F6E56; margin-bottom:12px; }
  .capa-nome { font-size:36px; font-weight:800; letter-spacing:-.04em; margin-bottom:8px; }
  .capa-objetivo { font-size:16px; color:rgba(255,255,255,.6); margin-bottom:24px; }
  .capa-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:32px; }
  .capa-stat { background:rgba(255,255,255,.06); border-radius:12px; padding:16px; }
  .capa-stat-val { font-size:24px; font-weight:800; color:white; }
  .capa-stat-label { font-size:11px; color:rgba(255,255,255,.5); margin-top:2px; }
  
  /* Peptídeos */
  .section-title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#666; margin-bottom:20px; margin-top:36px; }
  .peptideo-card { border:1px solid #eee; border-radius:14px; padding:24px; margin-bottom:16px; }
  .peptideo-header { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .peptideo-emoji { width:48px; height:48px; background:#f5f5f5; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; }
  .peptideo-nome { font-size:18px; font-weight:700; margin-bottom:4px; }
  .peptideo-cat { font-size:11px; color:#666; background:#f5f5f5; padding:2px 10px; border-radius:100px; display:inline-block; }
  .peptideo-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .peptideo-info { background:#f9f9f9; border-radius:10px; padding:12px; }
  .peptideo-info-label { font-size:10px; color:#999; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .peptideo-info-val { font-size:13px; font-weight:600; color:#111; }
  .peptideo-resumo { font-size:13px; color:#555; line-height:1.7; margin-top:14px; padding-top:14px; border-top:1px solid #f0f0f0; }
  
  /* Avisos */
  .aviso { background:#FFF8E1; border-left:4px solid #EF9F27; border-radius:0 12px 12px 0; padding:16px 20px; margin-top:40px; }
  .aviso-titulo { font-size:13px; font-weight:700; color:#EF9F27; margin-bottom:6px; }
  .aviso-texto { font-size:12px; color:#666; line-height:1.6; }
  
  /* Footer */
  .footer { margin-top:48px; padding-top:24px; border-top:1px solid #eee; display:flex; justify-content:space-between; align-items:center; }
  .footer-marca { font-size:13px; font-weight:700; color:#0F6E56; }
  .footer-data { font-size:11px; color:#999; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">Nuvi<span>ta</span></div>
    <div class="meta">
      Protocolo personalizado<br>
      ${new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}<br>
      <strong>${nome}</strong>
    </div>
  </div>

  <div class="capa">
    <div class="capa-label">✦ Protocolo Personalizado Nuvita</div>
    <div class="capa-nome">${nome}</div>
    <div class="capa-objetivo">${objetivo}</div>
    <div class="capa-stats">
      <div class="capa-stat">
        <div class="capa-stat-val">${peptideos.length}</div>
        <div class="capa-stat-label">Peptídeos</div>
      </div>
      <div class="capa-stat">
        <div class="capa-stat-val">${protocolo?.ciclo_semanas || 8}</div>
        <div class="capa-stat-label">Semanas de ciclo</div>
      </div>
      <div class="capa-stat">
        <div class="capa-stat-val">IA</div>
        <div class="capa-stat-label">Gerado por IA</div>
      </div>
    </div>
  </div>

  <div class="section-title">Peptídeos do protocolo</div>

  ${peptideos.map((p: any) => `
  <div class="peptideo-card">
    <div class="peptideo-header">
      <div class="peptideo-emoji">${p.emoji || '💊'}</div>
      <div>
        <div class="peptideo-nome">${p.nome}</div>
        <span class="peptideo-cat">${p.categoria || ''}</span>
      </div>
    </div>
    <div class="peptideo-grid">
      <div class="peptideo-info">
        <div class="peptideo-info-label">Dose</div>
        <div class="peptideo-info-val">${p.dose_calculada || `${p.dose_min || ''}–${p.dose_max || ''} ${p.unidade || 'mcg'}`}</div>
      </div>
      <div class="peptideo-info">
        <div class="peptideo-info-label">Frequência</div>
        <div class="peptideo-info-val">${p.frequencia || '—'}</div>
      </div>
      <div class="peptideo-info">
        <div class="peptideo-info-label">Timing</div>
        <div class="peptideo-info-val">${p.timing || '—'}</div>
      </div>
      <div class="peptideo-info">
        <div class="peptideo-info-label">Via</div>
        <div class="peptideo-info-val">${p.via || '—'}</div>
      </div>
    </div>
    ${p.resumo ? `<div class="peptideo-resumo">${p.resumo}</div>` : ''}
  </div>
  `).join('')}

  <div class="aviso">
    <div class="aviso-titulo">⚠️ Aviso importante</div>
    <div class="aviso-texto">
      Este protocolo foi gerado por inteligência artificial com base no seu diagnóstico e objetivos. 
      Não substitui orientação médica profissional. Consulte sempre um médico especializado antes de 
      iniciar qualquer protocolo de peptídeos. A Nuvita não se responsabiliza pelo uso sem supervisão médica.
    </div>
  </div>

  <div class="footer">
    <div class="footer-marca">Nuvita — Plataforma de Peptídeos</div>
    <div class="footer-data">nuvita.app · ${new Date().getFullYear()}</div>
  </div>
</div>
</body>
</html>`;

    // Abre em nova janela e imprime
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 500);
    }
    setGerando(false);
  };

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  const peptideos = protocolo?.peptideos || [];

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Exportar protocolo</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Gere um PDF com identidade Nuvita para compartilhar com seu médico</p>
      </div>

      {peptideos.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📄</div>
          <div style={{ fontSize:13 }}>Nenhum protocolo ativo para exportar.</div>
        </div>
      ) : (
        <>
          {/* Preview do protocolo */}
          <div style={{ background:'var(--bg2)', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', border:'1px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ts)', marginBottom:'1rem' }}>
              Prévia do conteúdo
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {peptideos.map((p: any, i: number) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--bg)', borderRadius:10, padding:'10px 14px' }}>
                  <span style={{ fontSize:'1.2rem' }}>{p.emoji || '💊'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{p.nome}</div>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>
                      {p.dose_calculada || `${p.dose_min || ''}–${p.dose_max || ''} ${p.unidade || 'mcg'}`} · {p.frequencia || '—'} · {p.via || '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* O que inclui */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1.5rem' }}>
            {[
              ['📋','Protocolo completo','Todos os peptídeos, doses e timings'],
              ['🎨','Design Nuvita','Layout profissional com identidade visual'],
              ['⚠️','Avisos médicos','Orientações de segurança incluídas'],
              ['📅','Data e paciente','Informações personalizadas do protocolo'],
            ].map(([ico, titulo, desc]) => (
              <div key={titulo} style={{ background:'var(--bg2)', borderRadius:12, padding:'1rem', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'1.2rem', marginBottom:6 }}>{ico}</div>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:3 }}>{titulo}</div>
                <div style={{ fontSize:11, color:'var(--ts)' }}>{desc}</div>
              </div>
            ))}
          </div>

          <button onClick={gerarPDF} disabled={gerando} className="btn btn-d"
            style={{ width:'100%', justifyContent:'center', fontSize:14, padding:'14px' }}>
            {gerando ? '⏳ Gerando PDF...' : '⬇️ Exportar PDF do protocolo'}
          </button>
          <p style={{ fontSize:11, color:'var(--ts)', textAlign:'center', marginTop:'0.75rem' }}>
            O PDF abrirá em nova aba. Use Ctrl+P / Cmd+P para salvar como PDF.
          </p>
        </>
      )}
    </div>
  );
}
