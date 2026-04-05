// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithOtp, verifyOtp, upsertUsuario, getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

export default function LoginPage() {
  const router = useRouter();
  const [step,       setStep]       = useState<'email'|'otp'>('email');
  const [email,      setEmail]      = useState('');
  const [otp,        setOtp]        = useState('');
  const [loading,    setLoading]    = useState(false);
  const [loadingSso, setLoadingSso] = useState<'google'|null>(null);
  const [erro,       setErro]       = useState('');

  useEffect(() => {
    getSession().then(s => { if (s) router.replace('/dashboard'); });
  }, []);

  const enviarOtp = async () => {
    if (!email.includes('@')) { setErro('Digite um e-mail válido'); return; }
    setLoading(true); setErro('');
    try {
      await signInWithOtp(email);
      setStep('otp');
    } catch (e: any) {
      setErro(e.message || 'Erro ao enviar código.');
    } finally { setLoading(false); }
  };

  const confirmarOtp = async () => {
    if (otp.length < 6) { setErro('Digite o código de 6 dígitos'); return; }
    setLoading(true); setErro('');
    try {
      const data = await verifyOtp(email, otp);
      if (data?.session?.user) {
        await upsertUsuario(data.session.user.id, email);
        router.replace('/dashboard');
      }
    } catch {
      setErro('Código inválido ou expirado.');
      setOtp('');
    } finally { setLoading(false); }
  };

  const loginGoogle = async () => {
    setLoadingSso('google'); setErro('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e: any) {
      setErro('Erro ao conectar com Google.');
      setLoadingSso(null);
    }
  };


  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg2)' }}>
      {/* Lado esquerdo — visual */}
      <div style={{
        flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem',
        background:'linear-gradient(135deg, #0a1a0f 0%, #0F6E56 60%, #1D9E75 100%)',
        position:'relative', overflow:'hidden',
      }}>
        {/* Elementos decorativos */}
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,.03)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-50, left:-50, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }}/>

        <div style={{ color:'white', maxWidth:380, position:'relative', zIndex:1 }}>
          <div style={{ marginBottom:'2rem', cursor:'pointer' }} onClick={()=>router.push('/')}>
            <NuvitaLogo size={36} white/>
          </div>
          <h1 style={{ fontSize:'2.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'1rem', lineHeight:1.15 }}>
            Seu protocolo de peptídeos personalizado
          </h1>
          <p style={{ fontSize:14, opacity:.75, lineHeight:1.75, marginBottom:'2.5rem' }}>
            Diagnóstico por IA, tracker de evolução, calculadora de doses e biblioteca científica completa.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              '✦ Protocolo gerado por IA com base no seu perfil',
              '✦ Tracker de peso, energia, sono e fotos',
              '✦ Calendário de aplicações do ciclo',
              '✦ Biblioteca com 20+ peptídeos e pesquisas',
            ].map(item => (
              <div key={item} style={{ fontSize:13, opacity:.8, display:'flex', alignItems:'center', gap:8 }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{ width:460, display:'flex', alignItems:'center', justifyContent:'center', padding:'2.5rem', background:'var(--bg)' }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          {/* Logo mobile */}
          <div style={{ display:'none', marginBottom:'1.5rem', cursor:'pointer' }} onClick={()=>router.push('/')}>
            <NuvitaLogo size={28}/>
          </div>

          <h2 style={{ fontSize:'1.4rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>
            {step === 'email' ? 'Entrar na Nuvita' : 'Confirmar acesso'}
          </h2>
          <p style={{ fontSize:13, color:'var(--ts)', marginBottom:'1.75rem' }}>
            {step === 'email' ? 'Bem-vindo de volta' : `Código enviado para ${email}`}
          </p>

          {step === 'email' ? (<>
            {/* SSO Buttons */}
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'1.25rem' }}>
              {/* Google */}
              <button onClick={loginGoogle} disabled={!!loadingSso}
                style={{
                  width:'100%', padding:'11px 16px', borderRadius:10,
                  border:'1.5px solid var(--border)', background:'var(--bg)',
                  cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                  color:'var(--tx)', transition:'all .15s',
                }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='var(--bg2)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='var(--bg)'}>
                {loadingSso==='google' ? (
                  <span style={{fontSize:12,color:'var(--ts)'}}>Conectando...</span>
                ) : (<>
                  {/* Google icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </>)}
              </button>
            </div>

            {/* Divisor */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
              <div style={{ flex:1, height:1, background:'var(--border)' }}/>
              <span style={{ fontSize:12, color:'var(--ts)' }}>ou entre com e-mail</span>
              <div style={{ flex:1, height:1, background:'var(--border)' }}/>
            </div>

            {/* Email */}
            <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>E-mail</label>
            <input className="inp" type="email" placeholder="seu@email.com" value={email}
              onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&enviarOtp()}
              autoFocus disabled={loading}/>
            {erro && <div style={{ fontSize:12, color:'#D85A30', marginTop:6, marginBottom:4 }}>{erro}</div>}
            <button className="btn btn-d fw" onClick={enviarOtp} disabled={loading||!email.includes('@')}
              style={{ marginTop:10 }}>
              {loading ? 'Enviando código...' : 'Continuar com e-mail →'}
            </button>

            <div style={{ textAlign:'center', marginTop:'1.5rem', fontSize:13, color:'var(--ts)' }}>
              Não tem conta?{' '}
              <span style={{ color:'var(--gm)', cursor:'pointer', fontWeight:500 }}
                onClick={()=>router.push('/cadastro')}>
                Fazer diagnóstico grátis
              </span>
            </div>
          </>) : (<>
            {/* OTP */}
            <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>
              Código de 6 dígitos
            </label>
            <input className="inp" type="text" inputMode="numeric" placeholder="000000" value={otp}
              onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
              onKeyDown={e=>e.key==='Enter'&&confirmarOtp()} autoFocus disabled={loading}
              style={{ letterSpacing:'.3em', fontSize:20, textAlign:'center' }}/>
            {erro && <div style={{ fontSize:12, color:'#D85A30', marginTop:6 }}>{erro}</div>}
            <button className="btn btn-d fw" onClick={confirmarOtp}
              disabled={loading||otp.length<6} style={{ marginTop:12 }}>
              {loading ? 'Verificando...' : 'Entrar →'}
            </button>
            <button onClick={()=>{setStep('email');setOtp('');setErro('');}}
              style={{ width:'100%', marginTop:8, padding:'8px', background:'none', border:'none',
                fontSize:12, color:'var(--ts)', cursor:'pointer', fontFamily:'inherit' }}>
              ← Usar outro e-mail
            </button>
          </>)}
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
