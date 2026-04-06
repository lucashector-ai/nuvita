// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const STATUS_LABEL: Record<string,string> = {
  pendente: 'Pendente', confirmado: 'Confirmado', concluido: 'Concluído', cancelado: 'Cancelado'
};
const STATUS_COLOR: Record<string,{bg:string,color:string}> = {
  pendente:   { bg:'#FFF7ED', color:'#C2410C' },
  confirmado: { bg:'#DCFCE7', color:'#15803D' },
  concluido:  { bg:'#F0F9FF', color:'#0369A1' },
  cancelado:  { bg:'#F3F4F6', color:'#6B7280' },
};

export default function SectionConsultas({ userId }: any) {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas'|'futuras'|'passadas'>('futuras');

  useEffect(() => { if (userId) carregar(); }, [userId]);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from('agendamentos').select('*')
      .eq('user_id', userId).order('data', { ascending: false });
    setConsultas(data || []);
    setLoading(false);
  };

  const hoje = new Date().toISOString().split('T')[0];
  const filtradas = consultas.filter(c => {
    if (filtro === 'futuras') return c.data >= hoje && c.status !== 'cancelado';
    if (filtro === 'passadas') return c.data < hoje || c.status === 'concluido';
    return true;
  });

  const CARD = { background:'#FFFFFF', borderRadius:14, padding:'1.25rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', marginBottom:10 };

  if (loading) return <div style={{ padding:'3rem', textAlign:'center', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  return (
    <div style={{ maxWidth:700 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Minhas consultas</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Histórico completo de consultas com o médico parceiro</p>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.5rem' }}>
        {([['futuras','Próximas'],['passadas','Anteriores'],['todas','Todas']] as const).map(([v,l]) => (
          <button key={v} onClick={() => setFiltro(v)}
            style={{ padding:'6px 16px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:500, transition:'all .12s',
              background: filtro===v ? 'var(--dark)' : '#F3F4F6', color: filtro===v ? 'white' : 'var(--tm)' }}>
            {l}
          </button>
        ))}
      </div>

      {filtradas.length === 0 && (
        <div style={{ ...CARD, textAlign:'center', padding:'3rem', color:'var(--ts)' }}>
          <div style={{ fontSize:'2rem', marginBottom:'1rem' }}>📅</div>
          <div style={{ fontSize:13 }}>Nenhuma consulta {filtro === 'futuras' ? 'agendada' : filtro === 'passadas' ? 'anterior' : ''}.</div>
        </div>
      )}

      {filtradas.map(c => {
        const st = STATUS_COLOR[c.status] || STATUS_COLOR.pendente;
        const passada = c.data < hoje;
        return (
          <div key={c.id} style={CARD}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background: passada ? '#F3F4F6' : '#F0FDF4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                {passada ? '📋' : '📅'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{c.tipo_label}</div>
                  <span style={{ fontSize:11, fontWeight:500, padding:'2px 10px', borderRadius:100, background:st.bg, color:st.color }}>
                    {STATUS_LABEL[c.status] || c.status}
                  </span>
                </div>
                <div style={{ fontSize:12, color:'var(--ts)', marginBottom:6 }}>
                  {new Date(c.data+'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })} às {c.horario} · {c.duracao_min}min
                </div>
                {c.notas_medico && (
                  <div style={{ background:'#F0F9FF', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#0369A1', marginBottom:8 }}>
                    <strong>Notas do médico:</strong> {c.notas_medico}
                  </div>
                )}
                {c.observacoes && (
                  <div style={{ fontSize:12, color:'var(--ts)' }}>
                    <strong>Suas observações:</strong> {c.observacoes}
                  </div>
                )}
              </div>
              <div style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                {c.link_videochamada && !passada && (
                  <a href={c.link_videochamada} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:12, fontWeight:600, padding:'6px 14px', borderRadius:8, background:'#0F6E56', color:'white', textDecoration:'none', display:'flex', alignItems:'center', gap:5 }}>
                    📹 Entrar na consulta
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
