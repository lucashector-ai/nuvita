export type PlanType = 'free' | 'essencial' | 'pro';
export type Route = 'home' | 'diagnostico' | 'revisao' | 'dashboard';

export interface QuizAnswers {
  nome?: string; email?: string;
  q2?: 'masculino' | 'feminino' | 'ni';
  q3?: ObjectiveKey[];
  peleProblema?: PeleProblemKey;
  q4?: NivelKey; q5?: string; q6?: AtividadeKey;
  q7?: string; q8?: EstresseKey; q9?: DuracaoKey;
  q10?: string[]; peso?: string | number; altura?: string | number;
  plano?: PlanType; pendingPlan?: PlanType; _activePlan?: PlanType;
  _revItems?: Peptide[]; _revRemovidos?: string[];
  _protocoloIA?: string;
}

export type ObjectiveKey = 'gordura'|'massa'|'recuperacao'|'sono'|'pele'|'longevidade'|'cognitivo'|'hormonal';

export const OBJECTIVE_LABELS: Record<ObjectiveKey, string> = {
  gordura:'Perda de gordura', massa:'Ganho de massa', recuperacao:'Recuperação e lesões',
  sono:'Sono e descanso', pele:'Saúde da pele', longevidade:'Longevidade',
  cognitivo:'Performance cognitiva', hormonal:'Equilíbrio hormonal',
};

export type PeleProblemKey = 'envelhecimento'|'acne'|'cicatrizes'|'firmeza'|'ressecamento';
export type NivelKey     = 'iniciante'|'intermediario'|'avancado';
export type AtividadeKey = 'sedentario'|'moderado'|'ativo'|'muito_ativo';
export type EstresseKey  = 'baixo'|'moderado'|'alto';
export type DuracaoKey   = '4sem'|'8sem'|'12sem'|'6meses';

export const NIVEL_LABELS: Record<NivelKey, string> = {
  iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado',
};
export const ATIVIDADE_LABELS: Record<AtividadeKey, string> = {
  sedentario:'Sedentário', moderado:'Moderado', ativo:'Ativo', muito_ativo:'Muito ativo',
};
export const DURACAO_LABELS: Record<DuracaoKey, string> = {
  '4sem':'4 semanas', '8sem':'8 semanas', '12sem':'12 semanas', '6meses':'6 meses',
};
export const SEMANAS_LABELS: Record<DuracaoKey, string> = {
  '4sem':'4', '8sem':'8', '12sem':'12', '6meses':'24',
};

export interface Peptide {
  n: string; m: string; e: string; why?: string;
  freq: string; timing: string; route: string;
  cycle: string; rest: string; how: string;
  ck?: boolean;
  doseStr: (peso: number) => string;
}

export interface NuvitaSession extends QuizAnswers {
  _activePlan?: PlanType;
  _protoAtivo?: boolean;
}

export interface Mission {
  id: string; nm: string; sub: string; xp: number; done: boolean;
}
