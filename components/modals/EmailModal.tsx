// @ts-nocheck
'use client';

import { useState, useRef } from 'react';
import { signInWithOtp, verifyOtp, upsertUsuario, salvarDiagnostico } from '@/lib/auth';

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
            <h3>Informe seu e-mail</h3>
            <p>{PLAN_SUBS[plan]}</p>
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
