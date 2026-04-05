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
import ScreenJaUsou   from './screens/ScreenJaUsou';
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
    getSession().then(session => {
      if (!session) {
        clearSession();
        setInitialAnswers({});
        setHasSession(false);
      } else {
        const saved = loadQuizPartial();
        setInitialAnswers(saved ?? {});
        setHasSession(true);
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
    if (hasSession) {
      const session = await getSession();
      if (session) {
        await salvarDiagnostico(session.user.id, answers);
        // Limpa cache para DashboardShell reler do banco
        sessionStorage.removeItem('nv_quiz');
        sessionStorage.setItem('nv_diagnostico_atualizado', '1');
        router.push('/dashboard');
        return;
      }
    }
    router.push('/revisao');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav superior — só para perguntas (não welcome, não pricing) */}
      {cur !== 0 && cur !== 'pricing' && (
        <QuizNav progress={progress} onReset={reset} />
      )}

      {/* Welcome: tela cheia (tem seu próprio layout) */}
      {cur === 0 && <ScreenWelcome onNext={next} />}

      {/* Perguntas 1–11 dentro do container */}
      {cur !== 0 && cur !== 'result' && cur !== 'pricing' && (
        <div className="q-body">
          <div className="q-col">
            {cur === 1    && <ScreenNome      answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 2    && <ScreenSexo      answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 3    && <ScreenObjetivos answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === '3b' && <ScreenPeleSub   answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 4    && <ScreenNivel     answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 5    && <ScreenJaUsou    answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 6    && <ScreenAtividade answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 7    && <ScreenSono      answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 8    && <ScreenEstresse  answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 9    && <ScreenDuracao   answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 10   && <ScreenSaude     answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
            {cur === 11   && <ScreenBiometria answers={answers} setAnswer={setAnswer} onNext={next} onPrev={prev} />}
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
            onBack={() => goTo('result')}
          />
        </div>
      )}
    </div>
  );
}
