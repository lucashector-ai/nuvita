// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const OBJETIVOS_LABEL: Record<string,string> = {
  emagrecimento:'Emagrecimento', composicao:'Composição corporal',
  antiaging:'Anti-aging', performance:'Performance', longevidade:'Longevidade',
  recuperacao:'Recuperação', gut:'Saúde intestinal', hormonal:'Equilíbrio hormonal',
  sexual:'Saúde sexual', cognitivo:'Performance cognitiva',
};
const NIVEL_LABEL: Record<string,string> = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };

export default function SectionPerfil({ answers, plan, onNavigate, userId, onPlanChange }: any) {
  const [nome,     setNome]     = useState(answers?.nome || '');
  const [email,    setEmail]    = useState('');
  const [avatar,   setAvatar]   = useState<string|null>(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo,    setSalvo]    = useState(false);
  const [stats,    setStats]    = useState({ checkins:0, dias:0, semana:0 });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data:{ user } } = await supabase.auth.getUser();
      setEmail(user?.email || '');
      const { data:u } = await supabase.from('usuarios').select('nome,avatar_url').eq('id',userId).single();
      if (u?.nome) setNome(u.nome);
      if (u?.avatar_url) setAvatar(u.avatar_url);
      // Stats
      const { data:t } = await supabase.from('tracker_entries').select('data').eq('user_id',userId);
      const { data:a } = await supabase.from('adesao_diaria').select('data,completo').eq('user_id',userId);
      const dias = new Set((t||[]).map((x:any)=>x.data)).size;
      const semana = (a||[]).filter((x:any)=>{ const d=new Date(x.data); const now=new Date(); return (now.getTime()-d.getTime())<7*24*60*60*1000 && x.completo; }).length;
      setStats({ checkins:(t||[]).length, dias, semana });
    })();
  }, [userId]);

  const salvar = async () => {
    setSalvando(true);
    await supabase.from('usuarios').update({ nome, updated_at: new Date().toISOString() }).eq('id', userId);
    setSalvando(false); setSalvo(true);
    setTimeout(()=>setSalvo(false), 2000);
  };

  const uploadAvatar = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert:true });
    if (!error) {
      const { data:{ publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatar(publicUrl);
      await supabase.from('usuarios').update({ avatar_url: publicUrl }).eq('id', userId);
    }
  };

  const objs = (answers?.objetivo || answers?.q1 || []) as string[];
  const nivel = answers?.q4 || answers?.nivel || '';
  const peso  = answers?.peso || '';
  const idade = answers?.q2 || answers?.idade || '';

  return (
    <div style={{ maxWidth:640 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Meu perfil</h2>
        <p style={{ fontSize:13, color:'var(--ts)' }}>Informações pessoais e estatísticas da sua jornada</p>
      </div>

      {/* Avatar + nome */}
      <div style={{ display:'flex', gap:20, alignItems:'center', background:'var(--bg2)', borderRadius:16, padding:'1.5rem', marginBottom:'1.25rem', border:'1px solid var(--border)' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <div onClick={()=>fileRef.current?.click()}
            style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden', cursor:'pointer', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>
            {avatar ? <img src={avatar} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👤'}
          </div>
          <div onClick={()=>fileRef.current?.click()}
            style={{ position:'absolute', bottom:0, right:0, width:22, height:22, borderRadius:'50%', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:11, color:'white' }}>
            ✏️
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
            onChange={e=>{ if(e.target.files?.[0]) uploadAvatar(e.target.files[0]); }}/>
        </div>
        <div style={{ flex:1 }}>
          <input value={nome} onChange={e=>setNome(e.target.value)}
            placeholder="Seu nome"
            style={{ fontSize:18, fontWeight:600, border:'none', background:'transparent', color:'var(--tx)', fontFamily:'inherit', width:'100%', outline:'none', marginBottom:4 }}/>
          <div style={{ fontSize:13, color:'var(--ts)' }}>{email}</div>
        </div>
        <button onClick={salvar} disabled={salvando} className="btn btn-d" style={{ fontSize:12 }}>
          {salvando?'Salvando...':salvo?'✓ Salvo':'Salvar'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:'1.25rem' }}>
        {[['📊','Check-ins totais',stats.checkins],['📅','Dias com registro',stats.dias],['🔥','Adesão esta semana',stats.semana]].map(([ico,lbl,val])=>(
          <div key={lbl} style={{ background:'var(--bg2)', borderRadius:12, padding:'1rem', border:'1px solid var(--border)', textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem', marginBottom:4 }}>{ico}</div>
            <div style={{ fontSize:20, fontWeight:700 }}>{val}</div>
            <div style={{ fontSize:11, color:'var(--ts)', marginTop:2 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Dados do diagnóstico */}
      <div style={{ background:'var(--bg2)', borderRadius:16, padding:'1.25rem', border:'1px solid var(--border)', marginBottom:'1.25rem' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--ts)', marginBottom:'1rem' }}>Perfil do diagnóstico</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            ['🎯','Objetivos', objs.map((o:string)=>OBJETIVOS_LABEL[o]||o).join(', ')||'—'],
            ['📊','Nível',      NIVEL_LABEL[nivel]||nivel||'—'],
            ['⚖️','Peso',      peso?`${peso} kg`:'—'],
            ['🎂','Idade',     idade?`${idade} anos`:'—'],
          ].map(([ico,lbl,val])=>(
            <div key={lbl} style={{ background:'var(--bg)', borderRadius:10, padding:'10px 12px' }}>
              <div style={{ fontSize:11, color:'var(--ts)', marginBottom:2 }}>{ico} {lbl}</div>
              <div style={{ fontSize:13, fontWeight:500 }}>{val}</div>
            </div>
          ))}
        </div>
        <button style={{ marginTop:'1rem', fontSize:12, padding:'6px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', fontFamily:'inherit', color:'var(--tm)' }}
          onClick={()=>window.location.href='/cadastro'}>
          Refazer diagnóstico
        </button>
      </div>

      {/* Logout */}
      <button onClick={async()=>{ await supabase.auth.signOut(); window.location.href='/login'; }}
        style={{ width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #FECACA', background:'#FFF5F5', color:'#D85A30', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
        Sair da conta
      </button>
    </div>
  );
}
