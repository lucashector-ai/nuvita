// ─── Dados do usuário / diagnóstico ───────────────────
export type Objetivo =
  | "gordura"
  | "massa"
  | "recuperacao"
  | "sono"
  | "pele"
  | "longevidade"
  | "cognitivo"
  | "hormonal";

export type Nivel = "iniciante" | "intermediario" | "avancado";
export type Atividade = "sedentario" | "moderado" | "ativo" | "atleta";
export type Estresse = "baixo" | "moderado" | "alto";
export type Duracao = "4sem" | "8sem" | "12sem" | "continuo";
export type Plano = "free" | "essencial" | "pro";
export type Sexo = "masculino" | "feminino" | "ni";

export interface DiagnosticoData {
  nome?: string;
  email?: string;
  sexo?: Sexo;
  q3: Objetivo[];
  peleProblema?: string;
  nivel?: Nivel;
  peso?: number;
  altura?: number;
  atividade?: Atividade;
  sono?: string;
  estresse?: Estresse;
  duracao?: Duracao;
  condicoes?: string[];
  plano?: Plano;
  _diagTimestamp?: number;
}

// ─── Peptídeos ─────────────────────────────────────────
export interface Peptideo {
  e: string;
  n: string;
  m: string;
  why?: string;
  base?: number | null;
  unit: string;
  doseStr: (peso: number) => string;
  freq: string;
  timing: string;
  route: string;
  cycle: string;
  rest: string;
  how: string;
  ck: boolean;
}

// ─── Sessão ─────────────────────────────────────────────
export interface Session extends DiagnosticoData {
  _activePlan?: Plano;
  _protoAtivo?: boolean;
  _savedAt?: number;
  _revItems?: Peptideo[];
  _revRemovidos?: string[];
}
