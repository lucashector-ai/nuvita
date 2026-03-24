"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { buildProtocol } from "@/lib/peptides";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Objetivo, Peptideo } from "@/types";

export default function RevisaoPage() {
  const router = useRouter();
  const { session, updateSession } = useSession();
  const [items, setItems] = useState<Peptideo[]>([]);
  const [idx, setIdx] = useState(0);
  const [removidos, setRemovidos] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [aiText, setAiText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!session?.email || !session?.q3?.length) {
      router.replace("/diagnostico");
      return;
    }
    const protocolo = buildProtocol(session.q3 as Objetivo[], session.peso || 75);
    setItems(protocolo);
  }, [session, router]);

  const current = items[idx];
  const peso = session?.peso || 75;
  const total = items.length;
  const mantidos = items.filter((i) => !removidos.includes(i.n));
  const isPro = session?.plano === "pro" || session?._activePlan === "pro";

  async function justificarIA() {
    if (!current) return;
    setLoadingAI(true);
    setAiText("Analisando...");
    try {
      const objs = (session?.q3 || ["gordura"]).map((o) => o).join(", ");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          messages: [{
            role: "user",
            content: `Em 2-3 frases diretas, explique para um leigo por que ${current.n} foi incluído em um protocolo com objetivo de ${objs}. Mencione especificamente o que a pessoa perderia ao remover. Português brasileiro, tom empático mas objetivo.`,
          }],
        }),
      });
      const data = await res.json();
      setAiText(data.content?.[0]?.text || `${current.n} foi escolhido especificamente para potencializar seus resultados.`);
    } catch {
      setAiText(`${current.n} foi incluído porque age diretamente no seu objetivo principal.`);
    }
    setLoadingAI(false);
  }

  function aceitar() {
    setShowFeedback(false);
    setFeedbackText("");
    setAiText("");
    if (idx + 1 >= total) { setFinished(true); return; }
    setIdx(idx + 1);
  }

  function mostrarFeedback() {
    setShowFeedback(true);
    justificarIA();
  }

  function remover() {
    setRemovidos((r) => [...r, current.n]);
    setShowFeedback(false);
    setFeedbackText("");
    setAiText("");
    if (idx + 1 >= total) { setFinished(true); return; }
    setIdx(idx + 1);
  }

  function finalizar() {
    updateSession({
      _revItems: mantidos,
      _revRemovidos: removidos,
      _savedAt: Date.now(),
    });
    router.push("/dashboard");
  }

  function finalizarComMedico() {
    updateSession({ _revItems: mantidos, _revRemovidos: removidos, _openMedico: true } as never);
    router.push("/dashboard");
  }

  if (!current && !finished) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--ts)]">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-[520px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge dot className="mb-3">Revisão do protocolo</Badge>
          <h2 className="text-2xl font-medium tracking-[-0.03em] mb-2">Esse protocolo faz sentido para você?</h2>
          <p className="text-sm text-[var(--tm)] leading-relaxed">
            Revise cada peptídeo antes de começar. Se algo não faz sentido, nos diga — vamos ajustar.
          </p>
        </div>

        {/* Progress dots */}
        {!finished && (
          <div className="flex gap-1 mb-8">
            {items.map((_, i) => (
              <div
                key={i}
                className={[
                  "flex-1 h-[3px] rounded-full transition-colors",
                  i < idx ? "bg-[var(--green)]" : i === idx ? "bg-[var(--dark)]" : "bg-[var(--border)]",
                ].join(" ")}
              />
            ))}
            <div className="flex-1 h-[3px] rounded-full bg-[var(--border)]" />
          </div>
        )}

        {/* Card atual */}
        {!finished && current && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.07em] text-[var(--ts)]">
                {idx + 1} de {total}
              </span>
              {removidos.includes(current.n) && (
                <span className="text-[10px] bg-[var(--ab)] text-[var(--am)] px-2.5 py-0.5 rounded-full font-medium">
                  Removido
                </span>
              )}
            </div>

            <div className="w-14 h-14 bg-[var(--gp)] rounded-2xl flex items-center justify-center text-2xl mb-4">
              {current.e}
            </div>
            <h3 className="text-lg font-medium tracking-[-0.03em] mb-1">{current.n}</h3>
            <p className="text-sm text-[var(--tm)] leading-relaxed mb-4">{current.m}</p>

            {current.why && (
              <div className="bg-[var(--gp)] rounded-xl p-4 text-sm text-[var(--gm)] leading-relaxed mb-5 flex gap-2">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14" className="flex-shrink-0 mt-0.5">
                  <circle cx="7" cy="7" r="5.5" stroke="var(--gm)" strokeWidth="1.1"/>
                  <path d="M7 5v3M7 9.5v.3" stroke="var(--gm)" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                {current.why}
              </div>
            )}

            {/* Dose info */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                ["Dose", current.doseStr(peso)],
                ["Frequência", current.freq],
                ["Via", current.route],
              ].map(([l, v]) => (
                <div key={l} className="bg-[var(--bg2)] rounded-xl p-2.5 text-xs">
                  <span className="block font-medium text-[var(--tx)] mb-0.5">{l}</span>
                  <span className="text-[var(--ts)] leading-snug">{v}</span>
                </div>
              ))}
            </div>

            <Button fullWidth variant="green" onClick={aceitar} className="mb-2">
              Faz sentido — incluir no protocolo
            </Button>
            <Button fullWidth variant="outline" onClick={mostrarFeedback}>
              Não vou usar isso
            </Button>

            {/* Feedback box */}
            {showFeedback && (
              <div className="mt-4">
                <textarea
                  className="w-full p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-xl text-sm resize-none outline-none focus:border-[var(--green)] mb-2"
                  rows={2}
                  placeholder="Me conte o motivo (opcional)"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                {aiText && (
                  <div className="bg-[var(--bg2)] rounded-xl p-3 text-xs text-[var(--tm)] leading-relaxed mb-3">
                    {loadingAI ? "Analisando..." : aiText}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button fullWidth variant="outline" onClick={remover}
                    className="!text-[var(--am)] !border-[var(--am)]/30 hover:!border-[var(--am)]">
                    Remover do protocolo
                  </Button>
                  <Button fullWidth variant="outline" onClick={aceitar}>
                    Manter mesmo assim
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tela final */}
        {finished && (
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-medium tracking-[-0.03em] mb-2">Protocolo revisado!</h3>
              <p className="text-sm text-[var(--tm)]">
                {mantidos.length} peptídeo{mantidos.length !== 1 ? "s" : ""} no seu protocolo
                {removidos.length > 0 ? `, ${removidos.length} removido${removidos.length !== 1 ? "s" : ""}` : ""}.
              </p>
            </div>

            <div className="bg-[var(--dark)] rounded-2xl p-5 mb-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.07em] text-white/45 mb-2">
                {isPro ? "Plano Pro ativo" : "Quer ainda mais resultado?"}
              </div>
              <div className="text-sm font-medium text-white mb-1">
                {isPro ? "Seu protocolo foi gerado por IA." : "Este protocolo foi gerado pela IA."}
              </div>
              <div className="text-xs text-white/55 leading-relaxed mb-4">
                {isPro
                  ? "Quer revisar com um médico real? Agende uma consulta para ajustar doses, timing e combinações."
                  : "Quer um protocolo revisado por médico especialista? Assine o Plano Pro."}
              </div>
              <button
                onClick={isPro ? finalizarComMedico : () => router.push("/diagnostico")}
                className="w-full py-2.5 bg-[var(--green)] text-[var(--dark)] text-sm font-medium rounded-full mb-2 hover:opacity-90 transition-opacity"
              >
                {isPro ? "Revisar com médico agora" : "Assinar Plano Pro com médico"}
              </button>
              <button
                onClick={finalizar}
                className="w-full text-xs text-white/45 hover:text-white/70 transition-colors py-1"
              >
                Continuar {isPro ? "com protocolo atual" : "só com IA por agora"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
