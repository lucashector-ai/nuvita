// @ts-nocheck
'use client';
import { useState } from 'react';

interface Props { answers: any; items: any[]; plan: string; }

export default function SectionExportacao({ answers, items = [], peso = 75, plan }: Props) {
  // Normaliza campos — suporta tanto formato IA (p.n, p.e) quanto formato legado (p.nome, p.emoji)
  const itemsNorm = items.map((p: any) => ({
    nome: p.nome || p.n || '—',
    emoji: p.emoji || p.e || '💊',
    dose_calculada: p.dose_calculada || (p.doseStr ? p.doseStr(peso) : p.dose || '—'),
    frequencia: p.frequencia || p.freq || '—',
    via: p.via || p.route || 'SC',
    timing: p.timing || '',
    porque: p.porque || p.why || p.m || '',
    categoria: p.categoria || p.objetivo || '',
  }));
  const [gerando, setGerando] = useState(false);

  const nome     = answers?.nome || 'Usuário';
  const objetivo = (answers?.objetivo || []).join(', ') || 'Protocolo personalizado';
  const nivel    = answers?.nivel || '';
  const duracao  = answers?.duracao || '';

  const gerarPDF = () => {
    setGerando(true);
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Protocolo Nuvita — ${nome}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .page{max-width:794px;margin:0 auto;padding:56px;}
  
  .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #111;}
  .logo{font-size:24px;font-weight:800;letter-spacing:-.04em;}
  .logo span{color:#0F6E56;}
  .meta{text-align:right;font-size:12px;color:#666;line-height:1.8;}
  
  .hero{background:#0d0d0d;color:white;border-radius:20px;padding:44px;margin-bottom:36px;}
  .hero-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:#0F6E56;margin-bottom:12px;}
  .hero-nome{font-size:32px;font-weight:800;letter-spacing:-.04em;margin-bottom:6px;}
  .hero-obj{font-size:15px;color:rgba(255,255,255,.55);margin-bottom:28px;}
  .hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
  .stat{background:rgba(255,255,255,.07);border-radius:12px;padding:14px 16px;}
  .stat-val{font-size:22px;font-weight:800;}
  .stat-lbl{font-size:10px;color:rgba(255,255,255,.45);margin-top:2px;}
  
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#888;margin:32px 0 16px;}
  
  .card{border:1px solid #eee;border-radius:14px;padding:22px;margin-bottom:14px;break-inside:avoid;}
  .card-header{display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;}
  .card-emoji{width:46px;height:46px;background:#f5f5f5;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
  .card-nome{font-size:16px;font-weight:700;margin-bottom:4px;}
  .card-cat{font-size:10px;color:#666;background:#f5f5f5;padding:2px 10px;border-radius:100px;}
  .card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
  .info-box{background:#f9f9f9;border-radius:10px;padding:12px;}
  .info-lbl{font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:.07em;margin-bottom:3px;}
  .info-val{font-size:13px;font-weight:600;}
  .resumo{font-size:12px;color:#555;line-height:1.7;margin-top:14px;padding-top:14px;border-top:1px solid #f0f0f0;}

  .aviso{background:#FFF8E1;border-left:4px solid #EF9F27;border-radius:0 12px 12px 0;padding:16px 20px;margin-top:36px;}
  .aviso-t{font-size:12px;font-weight:700;color:#B45309;margin-bottom:5px;}
  .aviso-d{font-size:11px;color:#92400E;line-height:1.6;}

  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;}
  .footer-m{font-size:13px;font-weight:700;color:#0F6E56;}
  .footer-d{font-size:11px;color:#aaa;}
  
  @media print{body{padding:0;}@page{margin:0;}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">Nuvi<span>ta</span></div>
    <div class="meta">Protocolo personalizado<br>${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}<br><strong>${nome}</strong></div>
  </div>

  <div class="hero">
    <div class="hero-tag">✦ Protocolo Nuvita · Gerado por IA</div>
    <div class="hero-nome">${nome}</div>
    <div class="hero-obj">${objetivo}</div>
    <div class="hero-stats">
      <div class="stat"><div class="stat-val">${itemsNorm.length}</div><div class="stat-lbl">Peptídeos</div></div>
      <div class="stat"><div class="stat-val">${nivel||'—'}</div><div class="stat-lbl">Nível</div></div>
      <div class="stat"><div class="stat-val">${duracao||'—'}</div><div class="stat-lbl">Ciclo</div></div>
    </div>
  </div>

  <div class="section-title">Peptídeos do protocolo</div>

  ${itemsNorm.map(p => `
  <div class="card">
    <div class="card-header">
      <div class="card-emoji">${p.emoji||'💊'}</div>
      <div>
        <div class="card-nome">${p.nome}</div>
        <span class="card-cat">${p.categoria||p.objetivo||''}</span>
      </div>
    </div>
    <div class="card-grid">
      <div class="info-box"><div class="info-lbl">Dose</div><div class="info-val">${p.dose_calculada||`${p.dose_min||''}–${p.dose_max||''} ${p.unidade||'mcg'}`}</div></div>
      <div class="info-box"><div class="info-lbl">Frequência</div><div class="info-val">${p.frequencia||'—'}</div></div>
      <div class="info-box"><div class="info-lbl">Via</div><div class="info-val">${p.via||'SC'}</div></div>
    </div>
    ${p.timing ? `<div class="resumo"><strong>Timing:</strong> ${p.timing}</div>` : ''}
    ${p.porque ? `<div class="resumo">${p.porque}</div>` : p.resumo ? `<div class="resumo">${p.resumo}</div>` : ''}
  </div>`).join('')}

  <div class="aviso">
    <div class="aviso-t">⚠️ Aviso importante</div>
    <div class="aviso-d">Este protocolo foi gerado por inteligência artificial com base no seu diagnóstico e objetivos. Não substitui orientação médica profissional. Consulte sempre um médico especializado antes de iniciar qualquer protocolo de peptídeos.</div>
  </div>

  <div class="footer">
    <div class="footer-m">Nuvita · Plataforma de Peptídeos</div>
    <div class="footer-d">${new Date().getFullYear()}</div>
  </div>
</div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.focus(); win.print(); }, 800);
    }
    setGerando(false);
  };

  return (
    <div>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.2rem' }}>Exportar protocolo</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Gere um PDF com identidade Nuvita para compartilhar com seu médico</p>
      </div>

      {itemsNorm.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', background:'#FFFFFF', borderRadius:16, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', border:'1.5px dashed var(--border)' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📄</div>
          <div style={{ fontSize:14, fontWeight:500, marginBottom:'.5rem' }}>Nenhum protocolo ativo</div>
          <div style={{ fontSize:13 }}>Gere seu protocolo na seção Protocolo para exportar o PDF.</div>
        </div>
      ) : (
        <>
          {/* Preview */}
          <div style={{ background:'#FFFFFF', borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1.25rem', marginBottom:'1.25rem', border:'none' }}>
            <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--ts)', marginBottom:'1rem' }}>
              Prévia do protocolo
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {itemsNorm.map((p:any, i:number) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'center', background:'#F7F7F7', borderRadius:10, padding:'10px 14px', border:'none' }}>
                  <span style={{ fontSize:'1.2rem' }}>{p.emoji||'💊'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{p.nome}</div>
                    <div style={{ fontSize:11, color:'var(--ts)' }}>
                      {p.dose_calculada||`${p.dose_min||''}–${p.dose_max||''} ${p.unidade||''}`} · {p.frequencia||'—'} · {p.via||'SC'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* O que inclui */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:'1.5rem' }}>
            {[['📋','Protocolo completo','Todos os peptídeos, doses e timings'],
              ['🎨','Design Nuvita','Layout profissional com branding'],
              ['⚠️','Avisos médicos','Orientações de segurança incluídas'],
              ['👤','Personalizado','Nome, objetivo e nível do usuário']
            ].map(([ico,t,d]) => (
              <div key={t} style={{ background:'#FFFFFF', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', padding:'1rem', border:'none' }}>
                <div style={{ fontSize:'1.2rem', marginBottom:5 }}>{ico}</div>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:3 }}>{t}</div>
                <div style={{ fontSize:11, color:'var(--ts)' }}>{d}</div>
              </div>
            ))}
          </div>

          <button onClick={gerarPDF} disabled={gerando} className="btn btn-d"
            style={{ width:'100%', justifyContent:'center', fontSize:14, padding:'14px', borderRadius:12 }}>
            {gerando ? '⏳ Gerando...' : '⬇️ Exportar PDF do protocolo'}
          </button>
          <p style={{ fontSize:11, color:'var(--ts)', textAlign:'center', marginTop:8 }}>
            Uma nova aba será aberta. Use Cmd+P / Ctrl+P para salvar como PDF.
          </p>
        </>
      )}
    </div>
  );
}
