// ════════════════════════════════════════════════
//  NUVITA — components/quiz/QuizShell.tsx
//  Orquestrador principal do quiz
//  Substitui o <div id="qw"> e toda a lógica JS
// ════════════════════════════════════════════════

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuiz } from '@/lib/useQuiz';
import { loadQuizPartial, clearSession } from '@/lib/session';
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

  useEffect(() => {
    getSession().then(async session => {
      if (!session) {
        clearSession();
        setInitialAnswers({});
        setHasSession(false);
      } else {
        // Tem sessão: carrega dados existentes para pré-preencher nome e sexo
        const { carregarDiagnostico } = await import('@/lib/auth');
        const perfil = await carregarDiagnostico(session.user.id);
        const saved = loadQuizPartial();
        // Pré-preenche com dados do banco para não precisar redigitar nome/sexo
        const base = perfil?.diagnostico || {};
        setInitialAnswers({ ...base, ...(saved ?? {}) });
        // hasSession só é true se já tem diagnóstico preenchido antes
        setHasSession(!!(perfil?.diagnostico?.q3 || perfil?.diagnostico?.nome));
      }
      setSessionChecked(true);
    });
  }, []);

  const { cur, answers, setAnswer, next, prev, reset, progress, goTo } = useQuiz(
    initialAnswers,
  );

  if (!sessionChecked) return null;

  // Callback para ir ao dashboard (após login)
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Callback para finalizar diagnóstico
  // Se já tem conta: salva e vai direto ao dashboard (sem pricing)
  // Se não tem conta: vai para revisão/pricing
  const handleGoToRevisao = async () => {
    const session = await getSession();
    if (session) {
      // Merge com dados existentes — preserva campos especiais
      const { supabase } = await import('@/lib/supabase');
      const { data: usuarioAtual } = await supabase
        .from('usuarios').select('diagnostico').eq('id', session.user.id).single();
      const diagAtual = usuarioAtual?.diagnostico || {};
      const merged: Record<string,any> = { ...diagAtual, ...answers };
      // Preserva campos especiais do banco
      for (const k of Object.keys(diagAtual)) {
        if (k.startsWith('_')) merged[k] = diagAtual[k];
      }
      // Preserva nome, sexo e email se não respondidos agora
      if (!(answers as any).nome && diagAtual.nome) merged.nome = diagAtual.nome;
      if (!(answers as any).sexo && diagAtual.sexo) merged.sexo = diagAtual.sexo;
      if (!(answers as any).email && diagAtual.email) merged.email = diagAtual.email;
      await salvarDiagnostico(session.user.id, merged);
      sessionStorage.removeItem('nv_quiz');
      sessionStorage.setItem('nv_diagnostico_atualizado', '1');
    }
    // Sempre vai para revisão — usuário novo ou refazendo
    router.push('/revisao');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav superior — só para perguntas (não welcome, não pricing) */}
      {cur !== 0 && cur !== 'pricing' && (
        <QuizNav progress={progress} onReset={reset} />
      )}

      {/* Welcome: tela cheia (tem seu próprio layout) */}
      {cur === 0 && <ScreenWelcome onNext={hasSession ? () => goTo(3) : next} isRediag={hasSession} />}

      {/* Perguntas 1–11 dentro do container */}
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
            {cur === 9   && <ScreenSaude     answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 10   && <ScreenBiometria answers={answers} setAnswer={setAnswer} onNext={() => goTo("result")} onPrev={prev} />}
          </div>
        </div>
      )}

      {/* Resultado — container próprio */}
      {cur === 'result' && (
        <div className="q-body">
          <ScreenResultado
            answers={answers}
            setAnswer={setAnswer}
            onUpgrade={() => goTo('pricing')}
            onLogin={handleGoToDashboard}
            onRevisao={handleGoToRevisao}
          />
        </div>
      )}

      {/* Pricing — container próprio */}
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
    </div>
  );
}
