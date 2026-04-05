// @ts-nocheck
'use client';

import { useState, useRef } from 'react';
import { signInWithOtp, verifyOtp, upsertUsuario, salvarDiagnostico } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Props {
  plan:     'free' | 'essencial' | 'pro';
  answers:  any;
  onSubmit: (email: string) => void;
  onClose:  () => void;
}

const PLAN_SUBS = {
  free:      'Para liberar o acesso gratuito ao seu protocolo.',
  essencial: 'Para criar sua conta no plano Essencial (R$39/mês).',
  pro:       'Para criar sua conta no plano Pro com suporte médico (R$79/mês).',
};

export default function EmailModal({ plan, answers, onSubmit, onClose }: Props) {
  const [step,    setStep]    = useState<'email'|'code'>('email');
  const [email,   setEmail]   = useState('');
  const [code,    setCode]    = useState(['','','','','','']);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement|null)[]>([]);

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) { setError('Informe um e-mail válido.'); return; }
    setError(''); setLoading(true);
    try {
      await signInWithOtp(email);
      setStep('code');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      setError(e.message || 'Erro ao enviar código. Tente novamente.');
    } finally { setLoading(false); }
  };

  const handleCodeInput = (i: number, val: string) => {
    const next = [...code]; next[i] = val.slice(-1); setCode(next);
    if (val && i < 5) inputRefs.current[i+1]?.focus();
  };

  const handleCodeKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i-1]?.focus();
  };

  const handleVerify = async () => {
    const full = code.join('');
    if (full.length < 6) { setError('Digite o código completo.'); return; }
    setError(''); setLoading(true);
    try {
      const data = await verifyOtp(email, full);
      if (data?.session?.user) {
        const userId = data.session.user.id;
        // Cria perfil e salva diagnóstico no banco
        await upsertUsuario(userId, email, answers?.nome);
        await salvarDiagnostico(userId, { ...answers, email, plano: plan, _activePlan: plan });
        onSubmit(email);
      }
    } catch (e: any) {
      setError('Código inválido ou expirado. Tente novamente.');
      setCode(['','','','','','']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    // Salva o plano no sessionStorage antes de redirecionar
    sessionStorage.setItem('nv_plano_pendente', JSON.stringify({ plan }));
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?revisao=1` },
    });
  };

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {step === 'email' ? (
          <>
            <div className="modal-ico">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M2 6l8 5 8-5M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z"
                  stroke="#2E7A58" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Criar conta</h3>
            <p>{PLAN_SUBS[plan]}</p>
            <button onClick={handleGoogle}
              style={{ width:'100%',padding:'11px',borderRadius:10,border:'1.5px solid #E5E7EB',background:'white',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
              <div style={{ flex:1,height:1,background:'#E5E7EB' }}/><span style={{ fontSize:11,color:'#9CA3AF' }}>ou com e-mail</span><div style={{ flex:1,height:1,background:'#E5E7EB' }}/>
            </div>
            <input className="inp" type="email" placeholder="seu@email.com" autoComplete="email"
              style={{ marginBottom:'.875rem' }} value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
              disabled={loading}/>
            {error && <p style={{ color:'var(--am)', fontSize:12, marginBottom:'.5rem' }}>{error}</p>}
            <div className="mstack">
              <button className="btn btn-d fw" onClick={handleEmailSubmit} disabled={loading || !email.includes('@')}>
                {loading ? 'Enviando...' : 'Continuar'}
              </button>
              <button className="btn btn-o fw" onClick={onClose} disabled={loading}>Cancelar</button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-ico">
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4M5 10a7 7 0 1014 0 7 7 0 00-14 0z"
                  stroke="#2E7A58" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Confirme seu e-mail</h3>
            <p>Enviamos um código de 6 dígitos para <strong>{email}</strong>.</p>
            <div className="code-row">
              {code.map((v,i) => (
                <input key={i} ref={el => { inputRefs.current[i] = el; }}
                  className={`ci${v?' filled':''}`} type="text" maxLength={1} inputMode="numeric"
                  value={v} onChange={e => handleCodeInput(i, e.target.value)}
                  onKeyDown={e => handleCodeKey(i, e)} disabled={loading}/>
              ))}
            </div>
            <p style={{ textAlign:'center', marginBottom:'1.1rem', fontSize:13 }}>
              Não recebeu?{' '}
              <span style={{ color:'var(--gm)', fontWeight:500, cursor:'pointer' }}
                onClick={() => { setCode(['','','','','','']); setError(''); handleEmailSubmit(); }}>
                Reenviar
              </span>
            </p>
            {error && <p style={{ color:'var(--am)', fontSize:12, marginBottom:'.5rem', textAlign:'center' }}>{error}</p>}
            <div className="mstack">
              <button className="btn btn-d fw" onClick={handleVerify} disabled={loading || code.join('').length < 6}>
                {loading ? 'Verificando...' : 'Verificar e entrar'}
              </button>
              <button className="btn btn-o fw" onClick={() => setStep('email')} disabled={loading}>Voltar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
