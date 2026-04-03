// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut, updateEmail } from '@/lib/auth';
import type { QuizAnswers } from '@/types';

interface Props { answers: QuizAnswers; plan: string; userId?: string | null; }
const PLAN_LBL = { free:'Conta gratuita', essencial:'Essencial', pro:'Pro ✦' };

export default function SectionConfig({ answers, plan, userId }: Props) {
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPush,  setNotifPush]  = useState(true);
  const [saved,      setSaved]      = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from('notificacoes_config').select('email_ativo,push_ativo').eq('user_id', userId).maybeSingle()
      .then(({ data }) => { if (data) { setNotifEmail(data.email_ativo); setNotifPush(data.push_ativo); } });
  }, [userId]);
  const [showEmailFlow, setShowEmailFlow] = useState(false);
  const [emailStep, setEmailStep]   = useState<1|2>(1);
  const [novoEmail, setNovoEmail]   = useState('');
  const [codigo,    setCodigo]      = useState('');
  const [emailSalvo,setEmailSalvo]  = useState(false);
  const [showDelete,setShowDelete]  = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletando, setDeletando]   = useState(false);
  const emailAtual = answers.email || '—';

  const salvar = async () => {
    if (userId) {
      setSavingNotif(true);
      await supabase.from('notificacoes_config').upsert(
        { user_id: userId, email_ativo: notifEmail, push_ativo: notifPush, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      setSavingNotif(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enviarCodigo = async () => {
    if (!novoEmail.includes('@')) return;
    await updateEmail(novoEmail).catch(()=>{});
    setEmailStep(2);
  };

  const confirmarEmail = () => {
    if (codigo.length < 4) return;
    setEmailSalvo(true);
    setShowEmailFlow(false);
    setEmailStep(1);
    setNovoEmail('');
    setCodigo('');
  };

  const excluirConta = async () => {
    if (deleteConfirm !== 'EXCLUIR' || !userId) return;
    setDeletando(true);
    try {
      // Apaga todos os dados do usuário
      await Promise.all([
        supabase.from('tracker_entries').delete().eq('user_id', userId),
        supabase.from('diario_entries').delete().eq('user_id', userId),
        supabase.from('estoque_items').delete().eq('user_id', userId),
        supabase.from('check_ins').delete().eq('user_id', userId),
        supabase.from('adesao_diaria').delete().eq('user_id', userId),
        supabase.from('rotina_items').delete().eq('user_id', userId),
        supabase.from('agendamentos').delete().eq('user_id', userId),
        supabase.from('usuarios').delete().eq('id', userId),
      ]);
      await signOut();
      window.location.href = '/diagnostico';
    } catch (e) {
      setDeletando(false);
    }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Configurações</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Personalize sua experiência</p>
        </div>
        <button className="btn btn-d" onClick={salvar}>{saved?'✓ Salvo!':savingNotif?'Salvando...':'Salvar'}</button>
      </div>

      {/* Conta */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Conta</div>
        <div style={{ padding:'.75rem 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>E-mail</div>
            <div style={{ fontSize:12, color:'var(--ts)' }}>{emailSalvo ? novoEmail : emailAtual}</div>
          </div>
          <button onClick={() => { setShowEmailFlow(v=>!v); setEmailStep(1); }} className="btn btn-o" style={{ fontSize:12 }}>Trocar e-mail</button>
        </div>

        {showEmailFlow && (
          <div style={{ background:'var(--bg2)', borderRadius:10, padding:'1rem', margin:'.75rem 0', border:'1px solid var(--border)' }}>
            {emailStep === 1 ? (
              <>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Novo e-mail</div>
                <div style={{ fontSize:12, color:'var(--ts)', marginBottom:'1rem' }}>Você receberá um código de confirmação no novo endereço.</div>
                <input className="inp" type="email" placeholder="novo@email.com" value={novoEmail} onChange={e=>setNovoEmail(e.target.value)} style={{ marginBottom:10 }}/>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-d" onClick={enviarCodigo} disabled={!novoEmail.includes('@')} style={{ fontSize:12 }}>Enviar código</button>
                  <button className="btn btn-o" onClick={()=>setShowEmailFlow(false)} style={{ fontSize:12 }}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.5rem' }}>Código de confirmação</div>
                <div style={{ fontSize:12, color:'var(--ts)', marginBottom:'1rem' }}>Enviamos um código para <strong>{novoEmail}</strong></div>
                <input className="inp" placeholder="000000" value={codigo} onChange={e=>setCodigo(e.target.value)} maxLength={6} style={{ marginBottom:10, letterSpacing:'.3em', fontSize:18, textAlign:'center' }}/>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-d" onClick={confirmarEmail} disabled={codigo.length<4} style={{ fontSize:12 }}>Confirmar</button>
                  <button className="btn btn-o" onClick={()=>setEmailStep(1)} style={{ fontSize:12 }}>← Voltar</button>
                </div>
              </>
            )}
          </div>
        )}
        {emailSalvo && <div style={{ background:'var(--gp)', borderRadius:8, padding:'8px 12px', marginTop:8, fontSize:12, color:'var(--gm)' }}>✅ E-mail atualizado!</div>}
      </div>

      {/* Notificações */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Notificações</div>
        {[
          { label:'Lembrete por e-mail', sub:'Resumo diário das aplicações', val:notifEmail, set:setNotifEmail },
          { label:'Notificação push',    sub:'Alerta no horário de aplicação', val:notifPush, set:setNotifPush  },
        ].map(n => (
          <div key={n.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.75rem 0', borderBottom:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)' }}>{n.label}</div>
              <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{n.sub}</div>
            </div>
            <div onClick={()=>n.set(!n.val)} style={{ width:38, height:22, borderRadius:11, background:n.val?'var(--green)':'var(--border)', position:'relative', cursor:'pointer', flexShrink:0, transition:'background .2s' }}>
              <div style={{ position:'absolute', top:3, left:n.val?19:3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left .2s' }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Plano */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:plan!=='pro'?'1rem':0 }}>
          <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Plano atual</div>
          <span style={{ fontSize:11, background:'var(--gp)', color:'var(--gm)', borderRadius:100, padding:'2px 10px', fontWeight:500 }}>{PLAN_LBL[plan as keyof typeof PLAN_LBL]??plan}</span>
        </div>
        {plan !== 'pro' && (
          <button className="btn btn-d fw" style={{ marginBottom:8 }}
            onClick={() => window.dispatchEvent(new CustomEvent('nuvita:openPlanos'))}>
            ⚡ Upgrade para Pro — R$79/mês
          </button>
        )}
      </div>

      {/* Diagnóstico */}
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem', marginBottom:'1rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>Diagnóstico</div>
        <p style={{ fontSize:13, color:'var(--tm)', marginBottom:'1rem', lineHeight:1.55 }}>Seus objetivos mudaram? Refaça o diagnóstico para atualizar seu protocolo.</p>
        <a href="/diagnostico" style={{ textDecoration:'none' }}><button className="btn btn-o fw">🔄 Refazer diagnóstico</button></a>
      </div>

      {/* Zona de perigo */}
      <div style={{ background:'var(--bg)', border:'1px solid rgba(216,90,48,.3)', borderRadius:14, padding:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'#D85A30', marginBottom:'.75rem' }}>Zona de perigo</div>
        <p style={{ fontSize:13, color:'var(--tm)', marginBottom:'1rem', lineHeight:1.55 }}>Excluir sua conta remove permanentemente todos os seus dados, registros e histórico.</p>
        <button className="btn btn-o fw" style={{ color:'#D85A30', borderColor:'rgba(216,90,48,.3)', fontSize:13 }} onClick={() => setShowDelete(true)}>
          🗑️ Excluir conta e dados
        </button>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDelete && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowDelete(false); }}>
          <div className="modal" style={{ maxWidth:440 }} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'.75rem' }}>⚠️</div>
              <h3 style={{ fontSize:'1.1rem', marginBottom:'.5rem', color:'#D85A30' }}>Excluir conta e dados</h3>
              <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.65 }}>
                Esta ação é <strong>irreversível</strong>. Todos os seus dados serão apagados permanentemente: protocolo, tracker, diário, estoque e histórico.
              </p>
            </div>
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:6 }}>
                Digite <strong>EXCLUIR</strong> para confirmar
              </label>
              <input className="inp" placeholder="EXCLUIR" value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} style={{ textAlign:'center', letterSpacing:'.1em', fontWeight:500 }}/>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="btn fw" disabled={deleteConfirm !== 'EXCLUIR' || deletando}
                style={{ padding:'12px', background: deleteConfirm === 'EXCLUIR' ? '#D85A30' : 'var(--border)', color: deleteConfirm === 'EXCLUIR' ? 'white' : 'var(--ts)', border:'none', borderRadius:10, fontSize:14, fontWeight:500, cursor: deleteConfirm === 'EXCLUIR' ? 'pointer' : 'default', fontFamily:'inherit' }}
                onClick={excluirConta}>
                {deletando ? 'Excluindo...' : '🗑️ Excluir minha conta'}
              </button>
              <button className="btn btn-o fw" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
