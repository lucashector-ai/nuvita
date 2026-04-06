// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SectionConta({ planoAtual, userId, answers, onNavigate }: any) {
  const [email,    setEmail]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [excluindo,setExcluindo]= useState(false);
  const [confirma, setConfirma] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data:{ user } }) => {
      setEmail(user?.email || '');
      setLoading(false);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div style={{ padding:'2rem', color:'var(--ts)', fontSize:13 }}>Carregando...</div>;

  return (
    <div style={{ maxWidth:560 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Conta</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Configurações da sua conta Nuvita</p>
      </div>

      {/* Info da conta */}
      <div style={{ background:'#FFFFFF', borderRadius:14, padding:'1.25rem', marginBottom:'1rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Informações</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
            <span style={{ color:'var(--ts)' }}>E-mail</span>
            <span style={{ fontWeight:500 }}>{email}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
            <span style={{ color:'var(--ts)' }}>Método de login</span>
            <span style={{ fontWeight:500 }}>Google / E-mail</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
            <span style={{ color:'var(--ts)' }}>Membro desde</span>
            <span style={{ fontWeight:500 }}>Abril 2026</span>
          </div>
        </div>
      </div>

      {/* Sessão */}
      <div style={{ background:'#FFFFFF', borderRadius:14, padding:'1.25rem', marginBottom:'1rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Sessão</div>
        <button onClick={logout}
          style={{ width:'100%', padding:'10px', borderRadius:10, boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', background:'#F7F7F7', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', color:'var(--tx)' }}>
          Sair desta conta
        </button>
      </div>

      {/* Dados */}
      <div style={{ background:'#FFFFFF', borderRadius:14, padding:'1.25rem', marginBottom:'1rem', boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Seus dados</div>
        <p style={{ fontSize:12, color:'var(--ts)', lineHeight:1.6, marginBottom:'1rem' }}>
          Seus dados ficam armazenados com segurança no Supabase (infraestrutura AWS). Você tem direito de exportar ou excluir seus dados a qualquer momento.
        </p>
        <button onClick={async()=>{
            const { data } = await supabase.from('usuarios').select('*').eq('id',userId).single();
            const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href=url; a.download='nuvita-dados.json'; a.click();
          }}
          style={{ padding:'8px 16px', borderRadius:8, boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', background:'#F7F7F7', fontSize:12, cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
          Exportar meus dados
        </button>
      </div>

      {/* Zona de perigo */}
      <div style={{ background:'#FFF5F5', borderRadius:14, padding:'1.25rem', border:'1.5px solid #FECACA' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#D85A30', marginBottom:'1rem' }}>Zona de perigo</div>
        {!excluindo ? (
          <button onClick={()=>setExcluindo(true)}
            style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #FECACA', background:'white', fontSize:12, cursor:'pointer', fontFamily:'inherit', color:'#D85A30', fontWeight:500 }}>
            Excluir minha conta
          </button>
        ) : (
          <div>
            <p style={{ fontSize:12, color:'#D85A30', marginBottom:'1rem' }}>
              Esta ação é irreversível. Digite <strong>EXCLUIR</strong> para confirmar.
            </p>
            <input value={confirma} onChange={e=>setConfirma(e.target.value)}
              placeholder="Digite EXCLUIR para confirmar"
              style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1.5px solid #FECACA', background:'white', fontSize:12, fontFamily:'inherit', color:'var(--tx)', marginBottom:10, outline:'none' }}/>
            <div style={{ display:'flex', gap:8 }}>
              <button disabled={confirma!=='EXCLUIR'}
                onClick={async()=>{
                  if(confirma==='EXCLUIR'){
                    // Apaga todos os dados via RPC
                  const { data: rpcData, error: rpcError } = await supabase.rpc('delete_own_account');
                  if (rpcError) {
                    alert('Erro ao excluir: ' + rpcError.message);
                    return;
                  }
                  if (rpcData?.error) {
                    alert('Erro: ' + rpcData.error);
                    return;
                  }
                  // Faz logout e redireciona
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                  }
                }}
                style={{ padding:'8px 16px', borderRadius:8, border:'none', background:confirma==='EXCLUIR'?'#D85A30':'#FECACA', color:'white', fontSize:12, cursor:confirma==='EXCLUIR'?'pointer':'default', fontFamily:'inherit', fontWeight:500 }}>
                Excluir conta
              </button>
              <button onClick={()=>{setExcluindo(false);setConfirma('');}}
                style={{ padding:'8px 16px', borderRadius:8, boxShadow:'0 1px 2px rgba(0,0,0,.04),0 2px 6px rgba(0,0,0,.03)', background:'white', fontSize:12, cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
