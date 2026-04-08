// @ts-nocheck
// ════════════════════════════════════════════════
//  NUVITA — components/quiz/QuizShell.tsx
// ════════════════════════════════════════════════

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuiz } from '@/lib/useQuiz';
import { loadQuizPartial, clearSession, saveSession } from '@/lib/session';
import { getSession, salvarDiagnostico } from '@/lib/auth';

import QuizNav        from './QuizNav';
import ScreenWelcome  from './screens/ScreenWelcome';
import ScreenNome     from './screens/ScreenNome';
import ScreenSexo     from './screens/ScreenSexo';
import ScreenObjetivos from './screens/ScreenObjetivos';
import ScreenPeleSub  from './screens/ScreenPeleSub';
import ScreenNivel    from './screens/ScreenNivel';
import ScreenAtividade from './screens/ScreenAtividade';
import ScreenSono     from './screens/ScreenSono';
import ScreenEstresse from './screens/ScreenEstresse';
import ScreenDuracao  from './screens/ScreenDuracao';
import ScreenSaude    from './screens/ScreenSaude';
import ScreenBiometria from './screens/ScreenBiometria';
import ScreenResultado from './screens/ScreenResultado';
import ScreenPricing  from './screens/ScreenPricing';

export default function QuizShell() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [initialAnswers, setInitialAnswers] = useState({});
  const [hasSession,    setHasSession]    = useState(false);
  const [dadosBanco,    setDadosBanco]    = useState<any>(null); // dados originais do banco
  const [showRevisaoModal, setShowRevisaoModal] = useState(false); // modal "deseja revisar?"

  useEffect(() => {
    getSession().then(async session => {
      if (!session) {
        clearSession();
        setInitialAnswers({});
        setHasSession(false);
      } else {
        const { carregarDiagnostico } = await import('@/lib/auth');
        const perfil = await carregarDiagnostico(session.user.id);
        const saved = loadQuizPartial();
        const base = perfil?.diagnostico || {};
        // Pré-preenche TODAS as respostas do banco — usuário só muda o que quiser
        setInitialAnswers({ ...base, ...(saved ?? {}) });
        setDadosBanco(base);
        setHasSession(!!(perfil?.diagnostico?.q3 || perfil?.diagnostico?.nome));
      }
      setSessionChecked(true);
    });
  }, []);

  const { cur, answers, setAnswer, next, prev, reset, progress, goTo } = useQuiz(initialAnswers);

  if (!sessionChecked) return null;

  const handleGoToDashboard = () => router.push('/dashboard');

  const handleGoToRevisao = async () => {
    const session = await getSession();
    if (session) {
      const { supabase } = await import('@/lib/supabase');
      const { data: usuarioAtual } = await supabase
        .from('usuarios').select('diagnostico, nome, plano').eq('id', session.user.id).maybeSingle();
      const diagAtual = usuarioAtual?.diagnostico || dadosBanco || {};

      // MERGE INTELIGENTE: banco é a fonte da verdade
      // Só sobrescreve campos que foram EXPLICITAMENTE alterados nesta sessão
      // Campos sensíveis (nome, sexo, email, plano) nunca são apagados
      const CAMPOS_IDENTIDADE = ['nome', 'sexo', 'email', 'q2'];
      const CAMPOS_BLOQUEADOS = ['_activePlan', 'plano', '_protocoloIA', '_aceitosRevisao', '_removidos', '_protocoloAtivo', '_dataInicioProtocolo'];
      
      const merged: Record<string,any> = { ...diagAtual };
      
      for (const [k, v] of Object.entries(answers as Record<string,any>)) {
        // Nunca sobrescreve campos bloqueados
        if (CAMPOS_BLOQUEADOS.includes(k)) continue;
        // Para campos de identidade: só atualiza se o novo valor é mais completo
        if (CAMPOS_IDENTIDADE.includes(k)) {
          const valorAtual = diagAtual[k];
          const temValorNovo = v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
          const temValorAtual = valorAtual !== undefined && valorAtual !== null && valorAtual !== '';
          // Só substitui se tem valor novo E (não tem valor atual OU o novo é diferente e foi digitado)
          if (temValorNovo && (!temValorAtual || v !== valorAtual)) {
            merged[k] = v;
          }
          continue;
        }
        // Outros campos: sobrescreve se tem valor válido
        if (v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)) {
          merged[k] = v;
        }
      }
      
      // GARANTIAS absolutas — nunca ficam vazios
      merged.nome  = merged.nome  || diagAtual.nome  || usuarioAtual?.nome || '';
      merged.sexo  = merged.sexo  || diagAtual.sexo  || '';
      merged.email = merged.email || diagAtual.email || session.user.email || '';
      
      // Plano nunca regride
      const RANK: Record<string,number> = { free:0, essencial:1, pro:2 };
      const planoAtual = usuarioAtual?.plano || diagAtual._activePlan || diagAtual.plano || 'free';
      merged._activePlan = planoAtual;
      merged.plano = planoAtual;
      
      // Preserva todos campos _ do banco
      for (const k of Object.keys(diagAtual)) {
        if (k.startsWith('_') && !merged[k]) merged[k] = diagAtual[k];
      }

      await salvarDiagnostico(session.user.id, merged);
      saveSession(merged);
      sessionStorage.setItem('nv_diagnostico_atualizado', '1');
    } else {
      // Novo usuário — salva quiz e vai para cadastro
      saveSession(answers);
      router.push('/cadastro?origem=diagnostico');
      return;
    }
    router.push('/revisao');
  };

  // Quando usuário com conta clica no resultado — mostra modal "revisar?"
  const handleResultadoComConta = () => {
    setShowRevisaoModal(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {cur !== 0 && cur !== 'pricing' && (
        <QuizNav progress={progress} onReset={reset} />
      )}

      {cur === 0 && <ScreenWelcome onNext={hasSession ? () => goTo(3) : next} isRediag={hasSession} />}

      {cur !== 0 && cur !== 'result' && cur !== 'pricing' && (
        <div className="q-body">
          <div className="q-col">
            {cur === 1    && <ScreenNome      answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 2    && <ScreenSexo      answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 3    && <ScreenObjetivos answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === '3b' && <ScreenPeleSub   answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 4    && <ScreenNivel     answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 5    && <ScreenAtividade answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 6    && <ScreenSono      answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 7    && <ScreenEstresse  answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 8    && <ScreenDuracao   answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 9    && <ScreenSaude     answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 10   && <ScreenBiometria answers={answers} setAnswer={setAnswer} onNext={() => goTo("result")} onPrev={prev} />}
          </div>
        </div>
      )}

      {cur === 'result' && (
        <div className="q-body">
          <ScreenResultado
            answers={answers}
            setAnswer={setAnswer}
            onUpgrade={() => goTo('pricing')}
            onLogin={hasSession ? handleResultadoComConta : handleGoToDashboard}
            onRevisao={handleGoToRevisao}
          />
        </div>
      )}

      {cur === 'pricing' && (
        <div className="q-body">
          <ScreenPricing
            answers={answers}
            setAnswer={setAnswer}
            onLogin={handleGoToDashboard}
            onRevisao={handleGoToRevisao}
            onBack={() => goTo('result')}
          />
        </div>
      )}

      {/* Modal: Deseja revisar seu protocolo? */}
      {showRevisaoModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.5)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
        }} onClick={() => setShowRevisaoModal(false)}>
          <div style={{
            background:'white', borderRadius:20, padding:'2rem', maxWidth:400, width:'90%',
            boxShadow:'0 8px 32px rgba(0,0,0,.15)', textAlign:'center'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔬</div>
            <h3 style={{ fontSize:'1.15rem', fontWeight:600, marginBottom:'.5rem', letterSpacing:'-.03em' }}>
              Deseja revisar seu protocolo?
            </h3>
            <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.65, marginBottom:'1.5rem' }}>
              Revise os peptídeos um a um — você pode aceitar ou remover cada um antes de entrar na plataforma.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => { setShowRevisaoModal(false); handleGoToDashboard(); }}
                style={{ flex:1, padding:'12px', borderRadius:12, border:'1.5px solid #E5E7EB', background:'white', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:500, color:'#374151' }}>
                Não, entrar direto
              </button>
              <button
                onClick={() => { setShowRevisaoModal(false); handleGoToRevisao(); }}
                style={{ flex:1, padding:'12px', borderRadius:12, border:'none', background:'#111827', color:'white', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:600 }}>
                Sim, revisar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
