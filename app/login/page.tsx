// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithOtp, verifyOtp, upsertUsuario, getSession } from '@/lib/auth';
import NuvitaLogo from '@/components/ui/NuvitaLogo';

export default function LoginPage() {
  const router = useRouter();
  const [step,    setStep]    = useState<'email'|'otp'>('email');
  const [email,   setEmail]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [erro,    setErro]    = useState('');

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

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg2)' }}>
      {/* Lado esquerdo — visual */}
      <div style={{ flex:1, background:'linear-gradient(135deg, #0F6E56 0%, #1D9E75 50%, #5EC991 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem' }}>
        <div style={{ color:'white', maxWidth:360 }}>
          <div style={{ marginBottom:'2rem' }}>
            <NuvitaLogo size={36} white/>
          </div>
          <h1 style={{ fontSize:'2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'1rem', lineHeight:1.2 }}>
            Seu protocolo de peptídeos personalizado
          </h1>
          <p style={{ fontSize:14, opacity:.85, lineHeight:1.7, marginBottom:'2rem' }}>
            Diagnóstico por IA, tracker de evolução, calculadora de doses e biblioteca científica completa.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {['✓ Protocolo gerado por IA com base no seu perfil', '✓ Tracker de peso, energia e sono', '✓ Calculadora profissional de doses', '✓ Biblioteca com 25+ peptídeos'].map(item => (
              <div key={item} style={{ fontSize:13, opacity:.9 }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{ width:440, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--bg)' }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <h2 style={{ fontSize:'1.3rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.375rem' }}>
            {step === 'email' ? 'Entrar na Nuvita' : 'Confirmar acesso'}
          </h2>
          <p style={{ fontSize:13, color:'var(--ts)', marginBottom:'1.5rem' }}>
            {step === 'email' ? 'Acesse com seu e-mail' : `Código enviado para ${email}`}
          </p>

          {step === 'email' ? (
            <>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>E-mail</label>
              <input className="inp" type="email" placeholder="seu@email.com" value={email}
                onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&enviarOtp()}
                autoFocus disabled={loading}/>
              {erro && <div style={{ fontSize:12, color:'#D85A30', marginTop:4, marginBottom:8 }}>{erro}</div>}
              <button className="btn btn-d fw" onClick={enviarOtp} disabled={loading||!email.includes('@')}>
                {loading?'Enviando...':'Continuar →'}
              </button>
              <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:13, color:'var(--ts)' }}>
                Não tem conta?{' '}
                <span style={{ color:'var(--gm)', cursor:'pointer', fontWeight:500 }} onClick={()=>router.push('/cadastro')}>
                  Fazer diagnóstico
                </span>
              </div>
            </>
          ) : (
            <>
              <label style={{ fontSize:12, fontWeight:500, color:'var(--tm)', display:'block', marginBottom:5 }}>Código de 6 dígitos</label>
              <input className="inp" type="text" inputMode="numeric" placeholder="000000" value={otp}
                onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                onKeyDown={e=>e.key==='Enter'&&confirmarOtp()} autoFocus disabled={loading}
                style={{ letterSpacing:'.3em', fontSize:20, textAlign:'center' }}/>
              {erro && <div style={{ fontSize:12, color:'#D85A30', marginTop:4 }}>{erro}</div>}
              <button className="btn btn-d fw" onClick={confirmarOtp} disabled={loading||otp.length<6} style={{ marginTop:12 }}>
                {loading?'Verificando...':'Entrar →'}
              </button>
              <button onClick={()=>{setStep('email');setOtp('');setErro('');}}
                style={{ width:'100%', marginTop:8, padding:'8px', background:'none', border:'none', fontSize:12, color:'var(--ts)', cursor:'pointer', fontFamily:'inherit' }}>
                ← Usar outro e-mail
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
