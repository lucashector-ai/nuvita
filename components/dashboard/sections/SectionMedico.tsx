// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Props { plan: string; nome: string; userId?: string | null; }

const HORARIOS = ['09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00'];

export default function SectionMedico({ plan, nome, userId }: Props) {
  const [step,         setStep]         = useState<'form'|'confirmado'>('form');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [form, setForm] = useState({
    nome: nome || '',
    email: '',
    telefone: '',
    objetivo: '',
    horario: '',
    mensagem: '',
  });

  useEffect(() => {
    if (!userId || plan !== 'pro') return;
    supabase.from('agendamentos').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      .then(({ data }) => setAgendamentos(data || []));
  }, [userId, plan]);

  const agendar = async () => {
    if (!form.nome || !form.email || !form.horario) return;
    setLoading(true);
    const { error } = await supabase.from('agendamentos').insert({
      user_id: userId,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || null,
      objetivo: form.objetivo || null,
      mensagem: form.mensagem || null,
      status: 'pendente',
    });
    if (!error) {
      setStep('confirmado');
      // Recarrega agendamentos
      const { data } = await supabase.from('agendamentos').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      setAgendamentos(data || []);
    }
    setLoading(false);
  };

  if (plan !== 'pro') {
    return (
      <div>
        <div style={{ marginBottom:'1.25rem' }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Consulta médica especializada</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Revisão do protocolo por médico especializado em peptídeos</p>
        </div>
        <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:16, padding:'3rem 2rem', textAlign:'center', maxWidth:520, margin:'0 auto' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>👨‍⚕️</div>
          <h3 style={{ fontSize:'1.2rem', fontWeight:500, marginBottom:'.75rem' }}>Disponível no Plano Pro</h3>
          <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7, marginBottom:'1.5rem' }}>
            Com o Plano Pro você tem acesso a consultas com médicos especializados em peptídeos que revisam seu protocolo, ajustam doses e acompanham sua evolução.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:'1.5rem', textAlign:'left', maxWidth:340, margin:'0 auto 1.5rem' }}>
            {['Revisão completa do protocolo','Ajuste personalizado de doses','Acompanhamento da evolução','Resposta em até 48 horas'].map(f => (
              <div key={f} style={{ display:'flex', gap:8, fontSize:13, color:'var(--tm)' }}>
                <span style={{ color:'#7F77DD', flexShrink:0 }}>✓</span>{f}
              </div>
            ))}
          </div>
          <button className="btn btn-d fw" style={{ background:'#7F77DD', fontSize:14, padding:'12px' }}
            onClick={() => window.dispatchEvent(new CustomEvent('nuvita:openPlanos'))}>
            ⚡ Fazer upgrade para Pro — R$79/mês
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Consulta médica especializada</h2>
          <p style={{ fontSize:13, color:'var(--tm)' }}>Revisão do protocolo com médico especializado em peptídeos</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#EEEDFE', borderRadius:100, padding:'5px 12px' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#7F77DD' }}/>
          <span style={{ fontSize:11, fontWeight:500, color:'#3C3489' }}>Plano Pro ativo</span>
        </div>
      </div>

      {step === 'confirmado' ? (
        <div style={{ background:'var(--gp)', border:'1px solid rgba(29,158,117,.2)', borderRadius:16, padding:'2rem', textAlign:'center', maxWidth:480, margin:'0 auto' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>✅</div>
          <h3 style={{ fontSize:'1.2rem', fontWeight:500, marginBottom:'.75rem' }}>Solicitação enviada!</h3>
          <p style={{ fontSize:13, color:'var(--gm)', lineHeight:1.7, marginBottom:'1.5rem' }}>
            Sua solicitação foi recebida pela nossa equipe. Um médico especializado entrará em contato em até <strong>48 horas</strong> para confirmar o horário e enviar o link da consulta.
          </p>
          <div style={{ background:'rgba(29,158,117,.1)', borderRadius:10, padding:'1rem', marginBottom:'1.5rem', fontSize:12, color:'var(--gm)', textAlign:'left' }}>
            <div style={{ fontWeight:500, marginBottom:4 }}>Próximos passos:</div>
            <div>1. Você receberá um e-mail de confirmação</div>
            <div>2. O médico revisará seu protocolo antes da consulta</div>
            <div>3. Receberá o link da videochamada</div>
          </div>
          <button className="btn btn-o" onClick={() => setStep('form')}>
            Fazer nova solicitação
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1.25rem', alignItems:'start' }}>
          <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.5rem' }}>
            <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'1.25rem' }}>Solicitar consulta médica</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Nome completo *</label>
                <input className="inp" value={form.nome} onChange={e=>setForm(p=>({...p,nome:e.target.value}))} style={{ marginBottom:0 }}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>E-mail *</label>
                <input className="inp" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={{ marginBottom:0 }}/>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>WhatsApp (opcional)</label>
                <input className="inp" placeholder="(00) 00000-0000" value={form.telefone} onChange={e=>setForm(p=>({...p,telefone:e.target.value}))} style={{ marginBottom:0 }}/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Horário preferido *</label>
                <select className="inp" value={form.horario} onChange={e=>setForm(p=>({...p,horario:e.target.value}))} style={{ marginBottom:0 }}>
                  <option value="">Selecionar...</option>
                  {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Principal objetivo da consulta</label>
              <select className="inp" value={form.objetivo} onChange={e=>setForm(p=>({...p,objetivo:e.target.value}))} style={{ marginBottom:0 }}>
                <option value="">Selecionar...</option>
                <option>Revisão do protocolo atual</option>
                <option>Ajuste de doses</option>
                <option>Iniciar novo protocolo</option>
                <option>Efeitos colaterais</option>
                <option>Resultados abaixo do esperado</option>
                <option>Outro</option>
              </select>
            </div>

            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ fontSize:11, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:4 }}>Observações adicionais (opcional)</label>
              <textarea className="inp" rows={3} placeholder="Conte um pouco sobre sua situação atual, dúvidas específicas ou qualquer informação relevante para o médico..." value={form.mensagem} onChange={e=>setForm(p=>({...p,mensagem:e.target.value}))} style={{ resize:'none', fontFamily:'inherit', marginBottom:0 }}/>
            </div>

            <button className="btn btn-d fw" onClick={agendar} disabled={loading || !form.nome || !form.email || !form.horario} style={{ background:'#7F77DD', fontSize:14, padding:'12px' }}>
              {loading ? 'Enviando...' : '📅 Solicitar consulta'}
            </button>
          </div>

          {/* Painel lateral */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Como funciona</div>
              {[
                { n:'1', t:'Preencha o formulário', d:'Informe suas preferências e objetivo da consulta' },
                { n:'2', t:'Confirmação em 48h', d:'Nossa equipe confirma o horário por e-mail' },
                { n:'3', t:'Consulta por vídeo', d:'O médico revisa seu protocolo e tira dúvidas' },
                { n:'4', t:'Relatório pós-consulta', d:'Receba um relatório com ajustes recomendados' },
              ].map(s => (
                <div key={s.n} style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'#EEEDFE', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#7F77DD', flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{s.t}</div>
                    <div style={{ fontSize:11, color:'var(--ts)', lineHeight:1.4 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {agendamentos.length > 0 && (
              <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)' }}>Histórico de consultas</div>
                </div>
                {agendamentos.map((a,i) => (
                  <div key={a.id} style={{ padding:'10px 1.25rem', borderBottom:i<agendamentos.length-1?'1px solid var(--border)':'none' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ fontSize:12, color:'var(--tx)' }}>{new Date(a.created_at).toLocaleDateString('pt-BR')}</div>
                      <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, fontWeight:500, background:a.status==='confirmado'?'var(--gp)':'#FAEEDA', color:a.status==='confirmado'?'var(--gm)':'#633806' }}>
                        {a.status === 'pendente' ? 'Aguardando confirmação' : 'Confirmado'}
                      </span>
                    </div>
                    {a.objetivo && <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{a.objetivo}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
