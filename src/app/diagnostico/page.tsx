"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizNav } from "@/components/quiz/QuizNav";
import { QuizOption } from "@/components/quiz/QuizOption";
import { MultiSelectOption } from "@/components/quiz/MultiSelectOption";
import { ScaleButton } from "@/components/quiz/ScaleButton";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "@/hooks/useSession";
import { buildProtocol } from "@/lib/peptides";
import { OM, DM, NM, EM } from "@/lib/peptides";
import type { Objetivo, Nivel, Atividade, Estresse, Duracao, Plano, DiagnosticoData } from "@/types";

const TOTAL = 10;

type Screen =
  | "welcome"
  | "s1" | "s2" | "s3" | "s3b" | "s4" | "s5"
  | "s6" | "s7" | "s8" | "s9" | "s10"
  | "result" | "pricing";

export default function DiagnosticoPage() {
  const router = useRouter();
  const { saveDiagnostico } = useSession();

  const [screen, setScreen] = useState<Screen>("welcome");
  const [answers, setAnswers] = useState<Partial<DiagnosticoData>>({ q3: [] });
  const [emailModal, setEmailModal] = useState(false);
  const [codeModal, setCodeModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plano>("free");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [emailError, setEmailError] = useState("");

  // ── Progresso ────────────────────────────────────
  const screenNum: Record<Screen, number> = {
    welcome: 0, s1: 1, s2: 2, s3: 3, s3b: 3,
    s4: 4, s5: 5, s6: 6, s7: 7, s8: 8, s9: 9, s10: 10,
    result: 10, pricing: 10,
  };
  const progress = screen === "result" || screen === "pricing"
    ? 100
    : Math.round((screenNum[screen] / TOTAL) * 100);

  const label =
    screen === "welcome" ? "Diagnóstico"
    : screen === "result" ? "Protocolo pronto"
    : screen === "pricing" ? "Planos"
    : `${screenNum[screen]} de ${TOTAL}`;

  // ── Navegação ────────────────────────────────────
  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  }, []);

  const next: Record<Screen, Screen | null> = {
    welcome: "s1", s1: "s2", s2: "s3", s3: "s4", s3b: "s4",
    s4: "s5", s5: "s6", s6: "s7", s7: "s8", s8: "s9", s9: "s10",
    s10: "result", result: "pricing", pricing: null,
  };
  const prev: Record<Screen, Screen | null> = {
    welcome: null, s1: "welcome", s2: "s1", s3: "s2", s3b: "s3",
    s4: "s3", s5: "s4", s6: "s5", s7: "s6", s8: "s7",
    s9: "s8", s10: "s9", result: "s10", pricing: "result",
  };

  function nx() {
    if (screen === "s3") {
      if (!answers.q3?.length) return;
      go(answers.q3.includes("pele") ? "s3b" : "s4");
      return;
    }
    const n = next[screen];
    if (n) go(n);
  }

  function pv() {
    const p = prev[screen];
    if (p) go(p);
  }

  // ── Helpers ───────────────────────────────────────
  const set = (key: keyof DiagnosticoData, val: unknown) =>
    setAnswers((a) => ({ ...a, [key]: val }));

  const toggleObj = (obj: Objetivo) => {
    const cur = answers.q3 || [];
    set("q3", cur.includes(obj) ? cur.filter((o) => o !== obj) : [...cur, obj]);
  };

  // ── Resultado ─────────────────────────────────────
  const peso = answers.peso || 75;
  const objs = answers.q3 || ["gordura"];
  const protocolo = screen === "result" || screen === "pricing"
    ? buildProtocol(objs as Objetivo[], peso)
    : [];

  // ── Email / Código ────────────────────────────────
  function openPlan(plan: Plano) {
    setPendingPlan(plan);
    setEmailModal(true);
  }

  function submitEmail() {
    if (!email.includes("@")) { setEmailError("E-mail inválido"); return; }
    setEmailError("");
    setAnswers((a) => ({ ...a, email, plano: pendingPlan }));
    setEmailModal(false);
    setCodeModal(true);
  }

  function handleCode(idx: number, val: string) {
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) {
      document.getElementById(`ci-${idx + 1}`)?.focus();
    }
  }

  function verifyCode() {
    if (code.join("").length < 6) return;
    setCodeModal(false);
    const diag: DiagnosticoData = {
      ...answers,
      email,
      plano: pendingPlan,
      q3: (answers.q3 || []) as Objetivo[],
    };
    saveDiagnostico(diag);
    router.push("/revisao");
  }

  // ── IMC ───────────────────────────────────────────
  const imc = answers.peso && answers.altura
    ? (answers.peso / Math.pow(answers.altura / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <QuizNav progress={progress} label={label} />

      <div className="max-w-[1216px] mx-auto px-8 py-12 pb-20">

        {/* ── WELCOME ─────────────────────────────── */}
        {screen === "welcome" && (
          <div className="screen-enter grid grid-cols-1 lg:grid-cols-2 gap-16 items-start pt-8">
            <div>
              <Badge dot className="mb-6">Diagnóstico personalizado</Badge>
              <h1 className="text-5xl lg:text-6xl font-medium tracking-[-0.05em] leading-[1.04] mb-4">
                Protocolos com clareza e método para todos.
              </h1>
              <p className="text-base text-[var(--tm)] leading-[1.7] mb-8 max-w-[440px]">
                10 perguntas para montar um protocolo real de peptídeos adaptado ao seu perfil e objetivos.
              </p>
              <div className="flex gap-4 mb-8 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ts)]">
                  🔒 Dados seguros
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--ts)]">
                  ⏱ ~4 minutos
                </span>
              </div>
              <Button size="lg" onClick={() => go("s1")}>
                Iniciar diagnóstico
              </Button>
            </div>

            <div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[["10", "Perguntas"], ["4min", "Duração"], ["100%", "Seu perfil"]].map(
                  ([v, l]) => (
                    <div key={l} className="bg-[var(--gp)] rounded-xl p-4 text-center">
                      <div className="text-[1.7rem] font-medium tracking-[-0.05em] text-[var(--dark)]">{v}</div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--gm)] mt-0.5">{l}</div>
                    </div>
                  )
                )}
              </div>
              <div className="bg-[var(--bg2)] rounded-xl p-4">
                {[
                  "Responda sobre seu perfil e objetivos",
                  "Veja seu protocolo real personalizado",
                  "Escolha um plano e acesse a plataforma",
                  "Acompanhe cada dia do ciclo com IA",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-b border-[var(--border)] last:border-0 text-sm text-[var(--tm)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--gp)] flex items-center justify-center text-[10px] font-medium text-[var(--gm)] flex-shrink-0">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── S1: NOME ─────────────────────────────── */}
        {screen === "s1" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 1 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Como você se chama?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Vamos personalizar toda a experiência com o seu nome.</p>
            <Input
              placeholder="Seu primeiro nome"
              value={answers.nome || ""}
              onChange={(e) => set("nome", e.target.value)}
              className="mb-7"
              autoFocus
            />
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.nome?.trim()}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S2: SEXO ─────────────────────────────── */}
        {screen === "s2" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 2 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Qual é o seu sexo biológico?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Influencia na dosagem e nos compostos indicados.</p>
            <div className="flex flex-col gap-2 mb-7">
              {[
                { val: "masculino", icon: "♂", label: "Masculino" },
                { val: "feminino", icon: "♀", label: "Feminino" },
                { val: "ni", icon: "○", label: "Prefiro não informar" },
              ].map((opt) => (
                <QuizOption
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.label}
                  selected={answers.sexo === opt.val}
                  onClick={() => set("sexo", opt.val)}
                />
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.sexo}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S3: OBJETIVOS (multi) ─────────────────── */}
        {screen === "s3" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 3 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Quais são os seus objetivos?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Selecione todos que se aplicam.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
              {[
                { val: "gordura", icon: "🔥", title: "Perda de gordura", desc: "Lipólise seletiva, controle de apetite" },
                { val: "massa", icon: "💪", title: "Ganho de massa", desc: "Anabolismo, síntese proteica, GH" },
                { val: "recuperacao", icon: "🔄", title: "Recuperação e lesões", desc: "Tecidos, tendões, cartilagem" },
                { val: "sono", icon: "🌙", title: "Sono e descanso", desc: "Qualidade do sono, circadiano" },
                { val: "pele", icon: "✨", title: "Saúde e estética da pele", desc: "Colágeno, antienvelhecimento, GHK-Cu" },
                { val: "longevidade", icon: "🌟", title: "Longevidade e vitalidade", desc: "Telômeros, imunidade, antienvelhecimento" },
                { val: "cognitivo", icon: "🧠", title: "Performance cognitiva", desc: "Foco, memória, redução de estresse" },
                { val: "hormonal", icon: "⚗️", title: "Equilíbrio hormonal", desc: "Testosterona, GH, eixo HPA" },
              ].map((opt) => (
                <MultiSelectOption
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.title}
                  description={opt.desc}
                  selected={(answers.q3 || []).includes(opt.val as Objetivo)}
                  onClick={() => toggleObj(opt.val as Objetivo)}
                />
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.q3?.length}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S3b: PELE ────────────────────────────── */}
        {screen === "s3b" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 3b de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Qual é o seu principal problema de pele?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Isso nos permite montar um protocolo dérmico muito mais certeiro.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-7">
              {[
                { val: "envelhecimento", label: "✨ Envelhecimento e linhas finas" },
                { val: "acne", label: "🔴 Acne e pele inflamatória" },
                { val: "cicatrizes", label: "🩹 Cicatrizes e manchas" },
                { val: "firmeza", label: "💪 Firmeza e elasticidade" },
                { val: "ressecamento", label: "💧 Ressecamento e barreira cutânea" },
                { val: "geral", label: "🌿 Saúde geral da pele" },
              ].map((opt) => (
                <div
                  key={opt.val}
                  onClick={() => set("peleProblema", opt.val)}
                  className={[
                    "p-4 rounded-xl cursor-pointer text-sm font-medium transition-all border-2",
                    answers.peleProblema === opt.val
                      ? "border-[var(--green)] bg-[#F2FCF7] text-[var(--dark)]"
                      : "border-transparent bg-[var(--bg2)] text-[var(--tm)] hover:text-[var(--tx)]",
                  ].join(" ")}
                >
                  {opt.label}
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={() => go("s3")}>Voltar</Button>
              <Button onClick={() => go("s4")} disabled={!answers.peleProblema}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S4: NÍVEL ────────────────────────────── */}
        {screen === "s4" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 4 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Qual é a sua experiência com peptídeos?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Calibra a complexidade e os compostos do seu protocolo.</p>
            <div className="flex flex-col gap-2 mb-7">
              {[
                { val: "iniciante", icon: "🌱", title: "Nunca usei peptídeos", desc: "Começando agora, quero entender do zero" },
                { val: "intermediario", icon: "🧪", title: "Já usei antes", desc: "Tenho experiência, mas sem protocolo estruturado" },
                { val: "avancado", icon: "⚗️", title: "Uso regular", desc: "Já uso peptídeos e quero otimizar" },
              ].map((opt) => (
                <QuizOption
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.title}
                  description={opt.desc}
                  selected={answers.nivel === opt.val}
                  onClick={() => set("nivel", opt.val as Nivel)}
                />
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.nivel}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S5: PESO/ALTURA ──────────────────────── */}
        {screen === "s5" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 5 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Qual é o seu perfil físico?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Usado para calcular as dosagens com precisão.</p>
            <div className="mb-5">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm font-medium text-[var(--tm)]">Peso</span>
                <span className="text-lg font-medium tracking-[-0.04em]">{answers.peso || 75} <span className="text-[var(--ts)] text-sm">kg</span></span>
              </div>
              <input type="range" min={45} max={150} value={answers.peso || 75}
                onChange={(e) => set("peso", Number(e.target.value))} />
            </div>
            <div className="mb-5">
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-sm font-medium text-[var(--tm)]">Altura</span>
                <span className="text-lg font-medium tracking-[-0.04em]">{answers.altura || 170} <span className="text-[var(--ts)] text-sm">cm</span></span>
              </div>
              <input type="range" min={150} max={210} value={answers.altura || 170}
                onChange={(e) => set("altura", Number(e.target.value))} />
            </div>
            {imc && (
              <p className="text-sm text-[var(--tm)] mb-7">
                IMC: <strong>{imc}</strong>{" "}
                <span className="text-[var(--gm)]">
                  —{" "}{Number(imc) < 18.5 ? "Abaixo do peso" : Number(imc) < 25 ? "Normal" : Number(imc) < 30 ? "Sobrepeso" : "Obesidade"}
                </span>
              </p>
            )}
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S6: ATIVIDADE ────────────────────────── */}
        {screen === "s6" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 6 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Como é a sua rotina de atividade física?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Influencia o timing e os compostos recomendados.</p>
            <div className="flex flex-col gap-2 mb-4">
              {[
                { val: "sedentario", icon: "🪑", title: "Sedentário", desc: "Pouca ou nenhuma atividade física regular" },
                { val: "moderado", icon: "🚶", title: "Moderado", desc: "1–3 vezes por semana" },
                { val: "ativo", icon: "🏃", title: "Ativo", desc: "4–5 vezes por semana, treinos regulares" },
                { val: "atleta", icon: "🏋️", title: "Atleta", desc: "Treino diário ou duplo, alto desempenho" },
              ].map((opt) => (
                <QuizOption
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.title}
                  description={opt.desc}
                  selected={answers.atividade === opt.val}
                  onClick={() => set("atividade", opt.val as Atividade)}
                />
              ))}
            </div>
            {answers.atividade === "sedentario" && (
              <div className="flex gap-2.5 p-4 bg-[var(--ab)] rounded-xl mb-4 text-sm text-[var(--am)]">
                ⚠️ Sedentarismo é um fator de risco real — seu protocolo incluirá compostos para ajudar.
              </div>
            )}
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.atividade}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S7: SONO ─────────────────────────────── */}
        {screen === "s7" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 7 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Como você avalia a qualidade do seu sono?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">O sono afeta diretamente a produção hormonal.</p>
            <div className="flex gap-2 mb-7">
              {[
                { val: "1", emoji: "😔", label: "Péssimo" },
                { val: "2", emoji: "😕", label: "Ruim" },
                { val: "3", emoji: "😐", label: "Regular" },
                { val: "4", emoji: "😊", label: "Bom" },
                { val: "5", emoji: "😄", label: "Ótimo" },
              ].map((opt) => (
                <ScaleButton
                  key={opt.val}
                  emoji={opt.emoji}
                  label={opt.label}
                  selected={answers.sono === opt.val}
                  onClick={() => set("sono", opt.val)}
                />
              ))}
            </div>
            {["1", "2"].includes(answers.sono || "") && (
              <div className="flex gap-2.5 p-4 bg-[var(--ab)] rounded-xl mb-4 text-sm text-[var(--am)]">
                ⚠️ Sono ruim compromete tudo — 70% da liberação de GH ocorre durante o sono profundo.
              </div>
            )}
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.sono}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S8: ESTRESSE ─────────────────────────── */}
        {screen === "s8" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 8 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Qual é o seu nível de estresse no dia a dia?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Estresse crônico eleva cortisol e altera a resposta aos peptídeos.</p>
            <div className="flex flex-col gap-2 mb-7">
              {[
                { val: "baixo", icon: "😌", title: "Baixo", desc: "Vida tranquila, consigo descansar bem" },
                { val: "moderado", icon: "😐", title: "Moderado", desc: "Estresse presente mas controlável" },
                { val: "alto", icon: "😤", title: "Alto", desc: "Muita pressão, dificuldade de desligar" },
              ].map((opt) => (
                <QuizOption
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.title}
                  description={opt.desc}
                  selected={answers.estresse === opt.val}
                  onClick={() => set("estresse", opt.val as Estresse)}
                />
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.estresse}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S9: DURAÇÃO ──────────────────────────── */}
        {screen === "s9" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 9 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Por quanto tempo quer seguir o protocolo?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">A duração define as fases de uso e descanso.</p>
            <div className="grid grid-cols-2 gap-2 mb-7">
              {[
                { val: "4sem", icon: "📅", title: "4 semanas", desc: "Ciclo introdutório" },
                { val: "8sem", icon: "📆", title: "8 semanas", desc: "Protocolo padrão" },
                { val: "12sem", icon: "🗓️", title: "12 semanas", desc: "Ciclo completo" },
                { val: "continuo", icon: "♾️", title: "Uso contínuo", desc: "Manutenção de longo prazo" },
              ].map((opt) => (
                <QuizOption
                  key={opt.val}
                  icon={opt.icon}
                  title={opt.title}
                  description={opt.desc}
                  selected={answers.duracao === opt.val}
                  onClick={() => set("duracao", opt.val as Duracao)}
                />
              ))}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.duracao}>Continuar</Button>
            </div>
          </div>
        )}

        {/* ── S10: CONDIÇÕES ────────────────────────── */}
        {screen === "s10" && (
          <div className="screen-enter max-w-[660px]">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--ts)] mb-3">Pergunta 10 de 10</div>
            <h2 className="text-3xl font-medium tracking-[-0.05em] mb-2">Alguma consideração de saúde?</h2>
            <p className="text-sm text-[var(--tm)] mb-7">Garante um protocolo seguro e adequado ao seu histórico.</p>
            <div className="flex flex-wrap gap-2 mb-7">
              {["Diabetes", "Hipertensão", "Tireoide", "Histórico de câncer", "Grávida ou amamentando", "Problemas renais", "Medicação contínua", "Nenhuma das anteriores"].map(
                (cond) => {
                  const val = cond.toLowerCase().replace(/ /g, "_");
                  const cur = answers.condicoes || [];
                  const sel = cond === "Nenhuma das anteriores"
                    ? cur.includes("nenhuma")
                    : cur.includes(val);
                  return (
                    <button
                      key={cond}
                      onClick={() => {
                        if (cond === "Nenhuma das anteriores") {
                          set("condicoes", ["nenhuma"]);
                        } else {
                          const without = cur.filter((c) => c !== "nenhuma");
                          set("condicoes", sel
                            ? without.filter((c) => c !== val)
                            : [...without, val]);
                        }
                      }}
                      className={[
                        "px-4 py-2 rounded-full text-sm border transition-all",
                        sel
                          ? "bg-[#F2FCF7] border-[var(--green)] text-[var(--dark)] font-medium"
                          : "bg-[var(--bg2)] border-[var(--border)] text-[var(--tm)] hover:border-[var(--border2)]",
                      ].join(" ")}
                    >
                      {cond}
                    </button>
                  );
                }
              )}
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" onClick={pv}>Voltar</Button>
              <Button onClick={nx} disabled={!answers.condicoes?.length}>Ver meu protocolo</Button>
            </div>
          </div>
        )}

        {/* ── RESULT ───────────────────────────────── */}
        {screen === "result" && (
          <div className="screen-enter max-w-[660px]">
            {/* Banner CTA */}
            <div className="bg-[var(--dark)] rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
              <div>
                <Badge variant="dark" className="mb-2 !bg-[var(--green)] !text-[var(--dark)]">✦ Protocolo pronto</Badge>
                <div className="text-white font-medium tracking-[-0.03em] mb-1">Seu protocolo está gerado.</div>
                <div className="text-white/55 text-xs">Desbloqueie dosagens, calendário e IA para acompanhar cada dia.</div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                <Button variant="green" onClick={() => go("pricing")}>Ver planos e começar</Button>
                <Button variant="outline" onClick={() => openPlan("free")}
                  className="!text-white/70 !border-white/20 hover:!border-white/40 hover:!text-white/90">
                  Desbloquear grátis
                </Button>
              </div>
            </div>

            <div className="border-b border-[var(--border)] pb-6 mb-6">
              <div className="text-sm font-medium text-[var(--gm)] mb-1">{answers.nome ? `Olá, ${answers.nome}.` : ""}</div>
              <h2 className="text-3xl font-medium tracking-[-0.05em] mb-3">
                Protocolo <span className="text-[var(--gm)]">{objs.map((o) => OM[o]).join(" + ")}</span>
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Objetivos", objs.map((o) => OM[o]).join(", ")],
                  ["Duração", DM[answers.duracao || "8sem"]],
                  ["Perfil", `${EM[answers.atividade || "moderado"]} · ${peso}kg`],
                  ["Nível", NM[answers.nivel || "iniciante"]],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[var(--bg2)] rounded-xl p-3.5">
                    <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--ts)] mb-1">{l}</div>
                    <div className="text-sm font-medium text-[var(--tx)] leading-snug">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--gm)] mb-4">Peptídeos recomendados</div>
              <ul>
                {protocolo.map((item, i) => (
                  <li key={item.n} className={[
                    "flex items-start gap-3 py-3",
                    "border-b border-[var(--border)] last:border-0",
                    i > 0 ? "blur-[5px] pointer-events-none select-none" : "",
                  ].join(" ")}>
                    <span className="text-[11px] font-medium text-[var(--gm)] min-w-[20px] pt-0.5">0{i + 1}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[var(--tx)] mb-0.5">{item.n}</div>
                      <div className="text-xs text-[var(--ts)] leading-snug">{item.m}</div>
                      {item.why && i === 0 && (
                        <div className="text-xs text-[var(--gm)] mt-1 leading-snug">{item.why}</div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-[var(--tx)]">{item.doseStr(peso)}</div>
                      <div className="text-[10px] text-[var(--ts)]">{item.freq}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex gap-2.5">
              <Button variant="outline" onClick={() => go("welcome")}>Refazer diagnóstico</Button>
            </div>
          </div>
        )}

        {/* ── PRICING ──────────────────────────────── */}
        {screen === "pricing" && (
          <div className="screen-enter">
            <div className="text-center mb-10">
              <Badge dot className="mb-4">Simples, justo, sem surpresa</Badge>
              <h2 className="text-4xl font-medium tracking-[-0.05em] mb-3">Escolha como você quer evoluir.</h2>
              <p className="text-sm text-[var(--tm)]">Do protocolo básico ao acompanhamento médico com IA integrada.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              {[
                {
                  plan: "free" as Plano, tag: "Grátis", name: "Nuvita Free", price: "0",
                  desc: "Para quem quer ver o protocolo básico antes de assinar.",
                  features: ["Diagnóstico completo", "Lista de peptídeos recomendados", "Confirmação via e-mail"],
                  featured: false,
                },
                {
                  plan: "essencial" as Plano, tag: "Mais escolhido", name: "Nuvita Essencial", price: "29",
                  desc: "Protocolo completo, dosagens reais, IA Nuvita e acompanhamento.",
                  features: ["Tudo do Free", "Dosagens exatas por peso", "IA Nuvita — assistente", "Check-ins e progresso", "Calculadora de dosagem"],
                  featured: false,
                },
                {
                  plan: "pro" as Plano, tag: "Completo", name: "Nuvita Pro", price: "59",
                  desc: "Tudo do Essencial com médico especialista — consultas inclusas.",
                  features: ["Tudo do Essencial", "Médico parceiro especializado", "Consultas periódicas inclusas", "Ajustes supervisionados", "Prescrição médica"],
                  featured: true,
                },
              ].map(({ plan, tag, name, price, desc, features, featured }) => (
                <div key={plan} className={[
                  "rounded-2xl p-7 transition-shadow hover:shadow-xl",
                  featured ? "bg-[var(--dark)] text-white" : "bg-[var(--bg2)]",
                ].join(" ")}>
                  <Badge variant={featured ? "green" : "green"} className="mb-4">{tag}</Badge>
                  <div className={["text-base font-medium mb-2 tracking-[-0.03em]", featured ? "text-white" : ""].join(" ")}>{name}</div>
                  <div className="flex items-baseline gap-0.5 mb-1">
                    <span className={["text-sm", featured ? "text-white/40" : "text-[var(--ts)]"].join(" ")}>R$</span>
                    <span className={["text-5xl font-medium tracking-[-0.05em] leading-none", featured ? "text-[var(--green)]" : "text-[var(--tx)]"].join(" ")}>{price}</span>
                    {price !== "0" && <span className={["text-xs", featured ? "text-white/35" : "text-[var(--ts)]"].join(" ")}>/mês</span>}
                  </div>
                  <p className={["text-xs leading-snug mb-4 pb-4 border-b", featured ? "text-white/40 border-white/10" : "text-[var(--ts)] border-[var(--border)]"].join(" ")}>{desc}</p>
                  <ul className="flex flex-col gap-2 mb-6">
                    {features.map((f) => (
                      <li key={f} className={["flex items-start gap-2 text-xs", featured ? "text-white/55" : "text-[var(--tm)]"].join(" ")}>
                        <span className={["w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-px", featured ? "bg-white/15" : "bg-[var(--gp)]"].join(" ")}>
                          <svg width="8" height="8" fill="none" viewBox="0 0 8 8"><path d="M1.5 4l2 2L6.5 2" stroke={featured ? "var(--green)" : "var(--gm)"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openPlan(plan)}
                    className={[
                      "w-full py-3 rounded-xl text-sm font-medium transition-all",
                      featured
                        ? "bg-[var(--green)] text-[var(--dark)] hover:opacity-90"
                        : "bg-white border border-[var(--border)] text-[var(--tx)] hover:border-[var(--border2)]",
                    ].join(" ")}
                  >
                    {plan === "free" ? "Desbloquear grátis" : plan === "essencial" ? "Começar — R$29/mês" : "Começar com suporte médico"}
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button variant="outline" onClick={() => go("result")}>← Voltar ao protocolo</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Email ─────────────────────────────── */}
      <Modal open={emailModal} onClose={() => setEmailModal(false)}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-medium tracking-[-0.04em]">Informe seu e-mail</h3>
          <button onClick={() => setEmailModal(false)} className="text-[var(--ts)] text-xl leading-none hover:text-[var(--tx)]">×</button>
        </div>
        <p className="text-sm text-[var(--tm)] mb-5">
          {pendingPlan === "free" ? "Para liberar o acesso gratuito ao seu protocolo."
            : pendingPlan === "essencial" ? "Para criar sua conta no plano Essencial (R$29/mês)."
            : "Para criar sua conta no plano Pro com suporte médico (R$59/mês)."}
        </p>
        <Input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          className="mb-4"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && submitEmail()}
        />
        <div className="flex flex-col gap-2">
          <Button fullWidth onClick={submitEmail}>Continuar</Button>
          <Button variant="outline" fullWidth onClick={() => setEmailModal(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* ── Modal Código ────────────────────────────── */}
      <Modal open={codeModal} onClose={() => setCodeModal(false)}>
        <div className="text-center">
          <h3 className="text-xl font-medium tracking-[-0.04em] mb-2">Confirme seu e-mail</h3>
          <p className="text-sm text-[var(--tm)] mb-6">
            Enviamos um código para <strong>{email}</strong>
          </p>
          <div className="flex gap-2 justify-center mb-5">
            {code.map((v, i) => (
              <input
                key={i}
                id={`ci-${i}`}
                className="ci"
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={v}
                onChange={(e) => handleCode(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !v && i > 0) {
                    document.getElementById(`ci-${i - 1}`)?.focus();
                  }
                }}
              />
            ))}
          </div>
          <Button fullWidth onClick={verifyCode} disabled={code.join("").length < 6}>
            Verificar e entrar
          </Button>
          <p className="text-xs text-[var(--ts)] mt-3">
            Não recebeu?{" "}
            <span
              className="text-[var(--gm)] font-medium cursor-pointer"
              onClick={() => setCode(["", "", "", "", "", ""])}
            >
              Reenviar
            </span>
          </p>
        </div>
      </Modal>
    </div>
  );
}
