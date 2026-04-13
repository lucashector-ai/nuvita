// @ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, signOut, carregarDiagnostico } from '@/lib/auth';
import { buildProtocol } from '@/lib/peptides';
import type { ProtocoloIA } from '@/lib/gerarProtocolo';
import type { QuizAnswers } from '@/types';
import Sidebar             from './Sidebar';
import DashboardNav        from './DashboardNav';
import PlanosModal         from '@/components/modals/PlanosModal';
import SectionInicio       from './sections/SectionInicio';
import SectionProtocolo    from './sections/SectionProtocolo';
import SectionIA           from './sections/SectionIA';
import SectionCalc         from './sections/SectionCalc';
import SectionComparativo from '@/components/dashboard/sections/SectionComparativo';
import SectionMapa from '@/components/dashboard/sections/SectionMapa';
import SectionLib          from './sections/SectionLib';
import SectionConfig       from './sections/SectionConfig';
import SectionConsultas    from './sections/SectionConsultas';
import SectionMedico       from './sections/SectionMedico';
import SectionCalendario   from './sections/SectionCalendario';
import SectionPerfil       from './sections/SectionPerfil';
import SectionTracker      from './sections/SectionTracker';
import SectionDiario       from './sections/SectionDiario';
import SectionHistorico    from './sections/SectionHistorico';
import SectionConsistencia from './sections/SectionConsistencia';
import SectionAnalise      from './sections/SectionAnalise';
import SectionCoach        from './sections/SectionCoach';
import SectionAjuste       from './sections/SectionAjuste';
import SectionDetector     from './sections/SectionDetector';
import SectionSimulador    from './sections/SectionSimulador';
import SectionGeradorCiclo from './sections/SectionGeradorCiclo';
import SectionFases        from './sections/SectionFases';
import SectionRotina       from './sections/SectionRotina';
import SectionEstoque      from './sections/SectionEstoque';
import SectionExportacao   from './sections/SectionExportacao';
import MobileNav           from './MobileNav';
import BoasVindasModal     from './modals/BoasVindasModal';
import SectionPlanos       from './sections/SectionPlanos';
import SectionConta        from './sections/SectionConta';
import SectionEducacao     from './sections/SectionEducacao';
import SectionAjuda        from './sections/SectionAjuda';
import { useNotificacoes } from '@/lib/useNotificacoes';
import PlanLock          from '@/components/ui/PlanLock';

export type DashSection =
  'inicio'|'protocolo'|'ia'|'calc'|'lib'|'config'|
  'medico'|'consultas'|'calendario'|'perfil'|
  'tracker'|'diario'|'historico'|'consistencia'|'analise'|
  'coach'|'ajuste'|'educacao'|'ajuda'|'detector'|
  'simulador'|'rotina'|
  'estoque'|'exportacao'|'planos'|'conta'|'educacao'|'ajuda';

const PLAN_LABEL: Record<string,string> = { free:'Conta gratuita', essencial:'Essencial', pro:'Pro ✦' };

export default function DashboardShell() {
  const router = useRouter();
  const [ready,           setReady]           = useState(false);
  const [userId,          setUserId]          = useState<string|null>(null);
  const [answers,         setAnswers]         = useState<QuizAnswers>({});
  const [section,         setSection]         = useState<DashSection>(() => {
    if (typeof window === 'undefined') return 'inicio';
    const URL_MAP: Record<string,DashSection> = {
      '/dashboard':'inicio', '/protocolo':'protocolo', '/diario':'diario',
      '/analise':'analise', '/historico':'historico', '/detector':'detector',
      '/consistencia':'consistencia', '/coach':'coach', '/ajuste':'ajuste',
      '/simulador':'simulador', '/biblioteca':'lib', '/estoque':'estoque',
      '/rotina':'rotina', '/calendario':'calendario', '/exportacao':'exportacao',
      '/configuracoes':'config', '/planos':'planos', '/perfil':'perfil',
      '/mapa':'mapa', '/medico':'medico', '/conta':'conta',
      '/ia':'ia', '/calculadora':'calc', '/educacao':'educacao', '/ajuda':'ajuda',
    };
    return URL_MAP[window.location.pathname] || 'inicio';
  });

  // Lê pathname na montagem para setar section correta
  useEffect(() => {
    const MAP: Record<string,DashSection> = {
      '/dashboard':'inicio', '/protocolo':'protocolo', '/diario':'diario',
      '/analise':'analise', '/historico':'historico', '/detector':'detector',
      '/consistencia':'consistencia', '/coach':'coach', '/ajuste':'ajuste',
      '/simulador':'simulador', '/biblioteca':'lib', '/estoque':'estoque',
      '/rotina':'rotina', '/calendario':'calendario', '/exportacao':'exportacao',
      '/configuracoes':'config', '/planos':'planos', '/perfil':'perfil',
      '/mapa':'mapa', '/medico':'medico', '/conta':'conta',
      '/ia':'ia', '/calculadora':'calc', '/educacao':'educacao', '/ajuda':'ajuda',
    };
    const s = MAP[window.location.pathname];
    if (s) setSection(s);
  }, []);

  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [protoAtivo,      setProtoAtivo]      = useState(false);
  const [planAtivo,       setPlanAtivo]       = useState<string>('free');
  const [showBoasVindas,  setShowBoasVindas]  = useState(false);
  const [protocoloIA,    setProtocoloIA]    = useState<ProtocoloIA|null>(null);

  // Preferências de notificação do banco
  const [notifEmailAtivo, setNotifEmailAtivo] = useState(true);
  const [notifPushAtivo,  setNotifPushAtivo]  = useState(true);

  // Hook de notificações automáticas
  useNotificacoes({
    userId,
    email: answers.email || '',
    nome: answers.nome?.toString().split(' ')[0] || '',
    emailAtivo: notifEmailAtivo,
    pushAtivo: notifPushAtivo,
  });

  // Relê do banco quando tab volta para foco (ex: após rediagnóstico)
  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      if (!session) {
        router.replace('/cadastro');
        return;
      }
      // Detecta troca de usuário e limpa storage antigo
      const storedUserId = localStorage.getItem('nv_current_user');
      if (storedUserId && storedUserId !== session.user.id) {
        sessionStorage.clear();
        Object.keys(localStorage)
          .filter(k => k.startsWith('nv_') && k !== 'nv_current_user')
          .forEach(k => localStorage.removeItem(k));
      }
      localStorage.setItem('nv_current_user', session.user.id);
      setUserId(session.user.id);

      const perfil = await carregarDiagnostico(session.user.id);

      // Verifica se o usuário ainda existe no banco
      // (pode ter sido deletado pelo admin)
      if (!perfil && !sessionStorage.getItem('nv_quiz')) {
        await signOut();
        router.replace('/cadastro');
        return;
      }

      if (perfil?.diagnostico) {
        setAnswers({ ...perfil.diagnostico, _activePlan: perfil.plano });
        setPlanAtivo(perfil.plano ?? 'free');
        if (perfil.diagnostico._protocoloAtivo) setProtoAtivo(true);
        if (perfil.diagnostico._protocoloIA) {
          try { setProtocoloIA(JSON.parse(perfil.diagnostico._protocoloIA)); } catch(e) {}
        }
      } else {
        const raw = sessionStorage.getItem('nv_quiz');
        if (!raw) { router.replace('/diagnostico'); return; }
        try {
          const parsed = JSON.parse(raw);
          if (!parsed?.q3?.length) { router.replace('/diagnostico'); return; }
          const { supabase } = await import('@/lib/supabase');
          // SEGURANÇA: NÃO escrever `plano` — coluna controlada pelo webhook.
          const { plano: _p, _activePlan: _ap, ...diagSeguro } = parsed as any;
          await supabase.from('usuarios').upsert({
            id: session.user.id,
            email: session.user.email || parsed.email || '',
            nome: parsed.nome || '',
            diagnostico: diagSeguro,
          }, { onConflict: 'id' });
          setAnswers({ ...parsed, _activePlan: parsed._activePlan || 'free' });
          setPlanAtivo(parsed._activePlan || parsed.plano || 'free');
          if (parsed._protocoloIA) {
            try { setProtocoloIA(JSON.parse(parsed._protocoloIA)); } catch(e) {}
          }
        } catch(e) { router.replace('/diagnostico'); return; }
      }

      // Modal só aparece UMA vez por conta (localStorage persiste entre sessões)
      const boasVindasVisto = localStorage.getItem('nv_boas_vindas_' + session.user.id);
      if (!boasVindasVisto) setShowBoasVindas(true);
      setReady(true);
    };

    const handleFocus = () => {
      const flag = sessionStorage.getItem('nv_diagnostico_atualizado');
      if (flag) {
        sessionStorage.removeItem('nv_diagnostico_atualizado');
        init();
      }
    };

    init();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [router]);



  if (!ready) return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F7F7F7' }}>
      {/* Sidebar skeleton */}
      <div style={{ width:'var(--sb-w)', background:'#F7F7F7', borderRight:'1px solid #E5E7EB', flexShrink:0 }}/>
      {/* Content skeleton */}
      <div style={{ flex:1, padding:'20px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <style>{`@keyframes skeleton-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
          {/* Nav skeleton */}
          <div style={{ height:56, marginBottom:24, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)', backgroundSize:'200% 100%', animation:'skeleton-shimmer 1.5s infinite' }}/>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)', backgroundSize:'200% 100%', animation:'skeleton-shimmer 1.5s infinite' }}/>
          </div>
          {[['60%', 22], ['40%', 13], ['100%', 80], ['100%', 120]].map(([w, h], i) => (
            <div key={i} style={{ background:'white', borderRadius:14, padding:'1.5rem', marginBottom:'1rem', boxShadow:'0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ width:w, height:h, borderRadius:8, background:'linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)', backgroundSize:'200% 100%', animation:'skeleton-shimmer 1.5s infinite' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const objs  = answers.q3 ?? ['gordura'];
  const peso  = Number(answers.peso ?? 75);
  const nivel = answers.q4 ?? 'iniciante';
  const dur   = answers.q9 ?? '8sem';
  const plan  = planAtivo;
  const nome  = answers.nome?.toString() ?? '—';
  const { items: allItems } = buildProtocol(objs, peso, 999, true);

  // Converte PeptideoIA para formato Peptide quando temos protocolo da IA
  const itemsIA = protocoloIA?.peptideos?.map(p => ({
    n: p.nome, e: p.emoji || '💊', m: p.motivo,
    why: p.motivo, freq: p.frequencia, timing: p.timing,
    route: p.via, cycle: p.ciclo, rest: '4 semanas',
    how: '', ck: true,
    doseStr: (_peso: number) => p.dose,
    prioridade: p.prioridade,
  })) || null;
  // Filtra peptídeos removidos na revisão
  const aceitosRevisao = answers._aceitosRevisao as string[] | undefined;
  const removidos = answers._removidos as string[] | undefined;

  // Aplica filtro tanto em allItems quanto em itemsIA
  const filtrarPeptideos = (lista: any[]) => {
    if (aceitosRevisao && aceitosRevisao.length > 0) {
      return lista.filter(item => aceitosRevisao.includes(item.n || item.nome));
    }
    if (removidos && removidos.length > 0) {
      return lista.filter(item => !removidos.includes(item.n || item.nome));
    }
    return lista;
  };

  const items = filtrarPeptideos(allItems);
  // Também filtra itemsIA se existir
  const itemsIAFiltrado = itemsIA ? filtrarPeptideos(itemsIA) : null;

  // Mapa seção → URL e URL → seção
  const SECTION_TO_URL: Record<string,string> = {
    inicio:'/dashboard', protocolo:'/protocolo', diario:'/diario',
    analise:'/analise', historico:'/historico', detector:'/detector',
    consistencia:'/consistencia', coach:'/coach', ajuste:'/ajuste',
    simulador:'/simulador', lib:'/biblioteca', estoque:'/estoque',
    rotina:'/rotina', calendario:'/calendario', exportacao:'/exportacao',
    config:'/configuracoes', planos:'/planos', perfil:'/perfil', educacao:'/educacao', ajuda:'/ajuda',
    mapa:'/mapa', medico:'/medico', conta:'/conta',
    ia:'/ia', calc:'/calculadora', educacao:'/educacao', ajuda:'/ajuda',
  };
  const URL_TO_SECTION: Record<string,DashSection> = {
    '/dashboard':'inicio', '/protocolo':'protocolo', '/diario':'diario',
    '/analise':'analise', '/historico':'historico', '/detector':'detector',
    '/consistencia':'consistencia', '/coach':'coach', '/ajuste':'ajuste',
    '/simulador':'simulador', '/biblioteca':'lib', '/estoque':'estoque',
    '/rotina':'rotina', '/calendario':'calendario', '/exportacao':'exportacao',
    '/configuracoes':'config', '/planos':'planos', '/perfil':'perfil',
    '/mapa':'mapa', '/medico':'medico', '/conta':'conta',
    '/ia':'ia', '/calculadora':'calc', '/educacao':'educacao', '/ajuda':'ajuda', '/educacao':'educacao', '/ajuda':'ajuda',
  };

  const nav      = (s: DashSection) => {
    setSection(s);
    setSidebarOpen(false);
    const url = SECTION_TO_URL[s] || '/dashboard';
    window.history.pushState(null, '', url);
  };



  const ml       = sidebarExpanded ? 'var(--sb-wx)' : 'var(--sb-w)';
  const doLogout = async () => { await signOut(); router.replace('/cadastro'); };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F7F7F7' }}>
      <Sidebar
        active={section} onNavigate={nav}
        mobileOpen={sidebarOpen} onMobileClose={()=>setSidebarOpen(false)}
        expanded={sidebarExpanded} onToggleExpand={()=>setSidebarExpanded(v=>!v)}
        nome={nome} planLabel={PLAN_LABEL[plan]??'Conta gratuita'} plan={plan}
        onLogout={doLogout}
      />
      {sidebarOpen && <div className="sidebar-overlay show" onClick={()=>setSidebarOpen(false)}/>}

      <div style={{ flex:1, minWidth:0, minHeight:'100vh', background:'#F7F7F7' }}>
        <DashboardNav section={section}
          planLabel={PLAN_LABEL[plan]??'Conta gratuita'}
          section={section} nome={nome} planId={plan}
          onMenuOpen={()=>setSidebarOpen(true)}
          onNavigate={nav} onLogout={doLogout}
          onOpenPerfil={()=>nav('perfil')} onOpenConfig={()=>nav('config')} onOpenPlanos={()=>nav('planos')}
          userId={userId} answers={answers}
        />
        <div className="d-body">
          {section==='inicio' && (
            <ScoreConsistencia userId={userId} semanas={semanas} onNavigate={nav}/>
          )}
          {section==='inicio'       && <SectionInicio answers={answers} items={itemsIAFiltrado || items} peso={peso} objs={objs} dur={dur} nivel={nivel} plan={plan} protoAtivo={protoAtivo} onStartProto={async()=>{ setProtoAtivo(true); const { supabase } = await import('@/lib/supabase'); await supabase.from('usuarios').update({ diagnostico: { ...answers, _protocoloAtivo: true, _dataInicioProtocolo: new Date().toISOString().split('T')[0] } }).eq('id', userId); }} onNavigate={nav}/>}
          {section==='protocolo'    && <SectionProtocolo answers={answers} items={itemsIAFiltrado || items} peso={peso} objs={objs} dur={dur} nivel={nivel} plan={plan}/>}
          {section==='ia'           && <SectionIA answers={answers} objs={objs}/>}
          {section==='calc'         && <SectionCalc peso={peso}/>}
          {section==='comparativo'  && <SectionComparativo onNavigate={nav}/>}
          {section==='mapa'         && <SectionMapa/>}
          {section==='lib'          && <SectionLib plano={plan}/>}
          {section==='config'       && <SectionConfig answers={answers} plan={plan} userId={userId}/>}
          {section==='consultas'       && <SectionConsultas userId={userId}/>}
          {section==='medico'       && <SectionMedico plan={plan} nome={nome} userId={userId} answers={answers} onNavigate={nav}/>}
          {section==='calendario'   && <SectionCalendario items={itemsIAFiltrado || items} peso={peso} protoAtivo={protoAtivo}/>}
          {section==='perfil'       && <SectionPerfil answers={answers} plan={plan} onNavigate={nav} userId={userId} onPlanChange={setPlanAtivo}/>}
          {section==='diario' || section==='tracker'      && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Tracker de evolução' descricao='Registre peso, energia e sono ao longo do ciclo. Disponível a partir do Essencial.'><SectionTracker userId={userId}/></PlanLock>}
          {section==='diario'       && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Diário de sintomas' descricao='Registre os efeitos percebidos em cada aplicação. Disponível a partir do Essencial.'><SectionDiario userId={userId}/></PlanLock>}
          {section==='historico'    && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Histórico de ciclos' descricao='Veja todos os seus ciclos anteriores e evolução. Disponível a partir do Essencial.'><SectionHistorico userId={userId} answers={answers}/></PlanLock>}
          {section==='consistencia' && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Pontuação de consistência' descricao='Acompanhe sua adesão semanal ao protocolo. Disponível a partir do Essencial.'><SectionConsistencia userId={userId}/></PlanLock>}
          {section==='analise'      && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Análise de evolução' descricao='Insights e gráficos sobre sua evolução. Disponível a partir do Essencial.'><SectionAnalise userId={userId} answers={answers} objs={objs}/></PlanLock>}
          {section==='coach'        && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Coach IA' descricao='Chat com IA especializada em peptídeos para tirar dúvidas do seu protocolo. Disponível a partir do Essencial.'><SectionCoach answers={answers} items={itemsIAFiltrado || items} userId={userId}/></PlanLock>}
          {section==='ajuste'       && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Ajuste automático' descricao='Solicite reajustes no protocolo com base na sua evolução. Disponível a partir do Essencial.'><SectionAjuste answers={answers} userId={userId}/></PlanLock>}
          {section==='detector'     && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Detector de inconsistência' descricao='Identifica padrões de falha e ativa reativação automática. Disponível a partir do Essencial.'><SectionDetector userId={userId} answers={answers}/></PlanLock>}
          {section==='simulador'    && <SectionSimulador answers={answers}/>}
          {section==='geradorciclo' && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Gerador de ciclo' descricao='Crie ciclos personalizados com base nos seus objetivos. Disponível a partir do Essencial.'><SectionGeradorCiclo answers={answers}/></PlanLock>}
          {section==='fases'        && <SectionFases/>}
          {section==='rotina'       && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Rotina complementar' descricao='Planner semanal de sono, hidratação, alimentação e exercício. Disponível a partir do Essencial.'><SectionRotina answers={answers} userId={userId}/></PlanLock>}
          {section==='estoque'      && <PlanLock planoNecessario='essencial' planoAtual={plan} recurso='Controle de estoque' descricao='Cadastre seus frascos e a IA calcula quanto tempo vai durar. Disponível a partir do Essencial.'><SectionEstoque userId={userId} items={itemsIAFiltrado || items} answers={answers}/></PlanLock>}
          {section==='exportacao'   && <SectionExportacao answers={answers} items={itemsIAFiltrado || items} peso={peso} plan={plan}/>}
          {section==='planos'        && <SectionPlanos planoAtual={plan} userId={userId} onPlanChange={setPlanAtivo} onNavigate={nav}/>}
          {section==='conta'         && <SectionConta planoAtual={plan} userId={userId} answers={answers} onNavigate={nav}/>}
          {section==='educacao' && <SectionEducacao answers={answers} onNavigate={nav} plano={plan}/>}
          {section==='ajuda' && <SectionAjuda onNavigate={nav}/>}
        </div>
      </div>
      {showBoasVindas && (
        <BoasVindasModal
          nome={nome}
          onClose={(temPeptideo) => {
            sessionStorage.setItem('nv_boas_vindas', '1');
            setShowBoasVindas(false);
            if (temPeptideo) setProtoAtivo(true);
          }}
        />
      )}

      {/* Mobile bottom nav */}
      <div className="mobile-nav-wrapper">
        <MobileNav active={section} onNavigate={nav} plan={plan}/>
      </div>
    </div>
  );
}
