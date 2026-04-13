const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';

const btn = (url: string, txt: string) =>
  `<a href="${url}" style="display:inline-block;margin-top:1.5rem;padding:14px 28px;background:#111827;color:white;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">${txt}</a>`;

const wrap = (body: string) =>
  `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:2rem 1rem">
    <div style="text-align:center;margin-bottom:2rem">
      <span style="font-size:1.3rem;font-weight:700;letter-spacing:-.04em">nuvita</span>
    </div>
    <div style="background:white;border-radius:16px;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      ${body}
    </div>
    <p style="text-align:center;margin-top:1.5rem;font-size:11px;color:#9CA3AF">
      Nuvita · <a href="${BASE}/dashboard" style="color:#9CA3AF">Acessar plataforma</a> · 
      <a href="${BASE}/conta" style="color:#9CA3AF">Cancelar emails</a>
    </p>
  </div>
</body></html>`;

export function templateBoasVindas(nome: string, peptideos: string[]) {
  const lista = peptideos.slice(0, 3).map(p =>
    `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#F0FDF4;border-radius:8px;margin-bottom:8px">
      <span style="font-size:1.2rem">💊</span>
      <span style="font-size:14px;font-weight:500;color:#0F6E56">${p}</span>
    </div>`
  ).join('');

  return {
    subject: `🧬 Bem-vindo à Nuvita, ${nome}! Seu protocolo está pronto`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">Olá, ${nome}! 👋</h1>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:1.5rem">
        Seu protocolo personalizado foi gerado com base no seu diagnóstico. 
        Aqui está o que a IA selecionou para você:
      </p>
      ${lista}
      <p style="color:#6B7280;line-height:1.7;margin-top:1.5rem;font-size:13px">
        Acesse a plataforma para ver doses exatas, timing e tudo que precisa para começar com segurança.
      </p>
      ${btn(BASE + '/dashboard', 'Ver meu protocolo completo →')}
    `)
  };
}

export function templateDia3(nome: string, peptideoMain: string) {
  return {
    subject: `⚡ ${nome}, como estão os primeiros dias?`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">Já são 3 dias, ${nome}!</h1>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:1rem">
        Os primeiros dias com <strong>${peptideoMain}</strong> são de adaptação. É normal sentir:
      </p>
      <div style="background:#FEF3C7;border-radius:10px;padding:1rem;margin-bottom:1rem">
        <div style="font-size:13px;color:#92400E;line-height:1.8">
          • Leve náusea no início (Tirzepatide) — passa em 1-2 semanas<br>
          • Mudança no apetite — sinal que está funcionando<br>
          • Mais disposição ou leve cansaço — ambos são normais
        </div>
      </div>
      <p style="color:#6B7280;line-height:1.7;font-size:13px">
        Registre como está se sentindo no check-in diário. Isso ajuda a IA a ajustar seu protocolo.
      </p>
      ${btn(BASE + '/dashboard', 'Fazer check-in de hoje →')}
    `)
  };
}

export function templateSemana1(nome: string, objetivo: string) {
  return {
    subject: `🎯 Semana 1 completa, ${nome}! O que esperar agora`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">Parabéns pela semana 1! 🏆</h1>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:1.5rem">
        Você completou a primeira semana do seu protocolo. Para o objetivo de <strong>${objetivo}</strong>, 
        veja o que acontece no seu corpo nas próximas semanas:
      </p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:1.5rem">
        ${[
          ['Semana 2-3', 'Adaptação celular. O corpo começa a responder ao protocolo.'],
          ['Semana 4', 'Primeiros resultados mensuráveis. Registre seu peso e energia.'],
          ['Semana 6-8', 'Resultados consistentes. Fase mais importante do ciclo.'],
        ].map(([s, d]) => `
          <div style="display:flex;gap:12px;padding:12px;background:#F9FAFB;border-radius:8px">
            <div style="font-size:12px;font-weight:600;color:#0F6E56;min-width:70px">${s}</div>
            <div style="font-size:13px;color:#6B7280">${d}</div>
          </div>
        `).join('')}
      </div>
      <p style="color:#6B7280;font-size:13px;line-height:1.7">
        <strong>Dica da IA:</strong> Consistência é mais importante que perfeição. 
        Uma aplicação por semana que esqueceu não prejudica o ciclo.
      </p>
      ${btn(BASE + '/dashboard', 'Ver minha evolução →')}
    `)
  };
}

export function templateAcompanhamentoSemanal(nome: string, semana: number, insights: string) {
  return {
    subject: `📊 Semana ${semana} — Análise do seu protocolo, ${nome}`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">
        Análise da semana ${semana}, ${nome}
      </h1>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:1.25rem;margin-bottom:1.5rem">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#0F6E56;margin-bottom:.5rem">
          🤖 IA Nuvita analisou seu progresso
        </div>
        <p style="font-size:14px;color:#065F46;line-height:1.7;margin:0">${insights}</p>
      </div>
      <p style="color:#6B7280;font-size:13px;line-height:1.7">
        Continue registrando seu check-in diário para a IA ter mais dados e gerar insights mais precisos.
      </p>
      ${btn(BASE + '/dashboard', 'Ver protocolo completo →')}
    `)
  };
}

export function templateReengajamento(nome: string, diasSem: number) {
  return {
    subject: `👋 ${nome}, sentimos sua falta na Nuvita`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">
        Tudo bem, ${nome}?
      </h1>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:1.5rem">
        Faz ${diasSem} dias que você não acessa a plataforma. Seu protocolo está esperando por você.
      </p>
      <div style="background:#FEF3C7;border-radius:10px;padding:1rem;margin-bottom:1.5rem">
        <p style="font-size:13px;color:#92400E;line-height:1.7;margin:0">
          ⚠️ Interrupções no protocolo reduzem a eficácia. 
          Se precisar ajustar o ciclo, a IA pode te ajudar.
        </p>
      </div>
      <p style="color:#6B7280;font-size:13px;line-height:1.7">
        Voltando agora, a IA analisa o que aconteceu e sugere como retomar da melhor forma.
      </p>
      ${btn(BASE + '/dashboard', 'Retomar meu protocolo →')}
    `)
  };
}

export function templateFimCiclo(nome: string, peptideos: string[], diasPausa: number) {
  return {
    subject: `🎉 Ciclo completo, ${nome}! Hora de fazer pausa`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">
        Parabéns, ${nome}! Ciclo finalizado 🏆
      </h1>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:1.5rem">
        Você completou seu ciclo de ${peptideos.join(', ')}. Agora é hora da pausa obrigatória.
      </p>
      <div style="background:#EDE9FE;border-radius:10px;padding:1.25rem;margin-bottom:1.5rem">
        <div style="font-size:14px;font-weight:600;color:#7C3AED;margin-bottom:.5rem">
          ⏸ Pausa recomendada: ${diasPausa} dias
        </div>
        <p style="font-size:13px;color:#5B21B6;line-height:1.7;margin:0">
          A pausa é essencial para o corpo manter a sensibilidade aos peptídeos. 
          Não pule esta etapa.
        </p>
      </div>
      <p style="color:#6B7280;font-size:13px;line-height:1.7">
        Durante a pausa, continue acompanhando no app. A IA vai te avisar quando for hora de recomeçar.
      </p>
      ${btn(BASE + '/dashboard', 'Planejar próximo ciclo →')}
    `)
  };
}

export function templateRelatorioMensal(nome: string, dados: {
  score: number; streak: number; totalCheckins: number;
  pesoInicial?: number; pesoAtual?: number; semanas: number; insights: string;
}) {
  const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://nuvita-l1wk.vercel.app';
  const btn = (url: string, txt: string) =>
    `<a href="${url}" style="display:inline-block;margin-top:1.5rem;padding:14px 28px;background:#111827;color:white;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">${txt}</a>`;
  const wrap = (body: string) =>
    `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F7F7;font-family:Inter,-apple-system,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:2rem 1rem">
      <div style="text-align:center;margin-bottom:2rem"><span style="font-size:1.3rem;font-weight:700;letter-spacing:-.04em">nuvita</span></div>
      <div style="background:white;border-radius:16px;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,.06)">${body}</div>
      <p style="text-align:center;margin-top:1.5rem;font-size:11px;color:#9CA3AF">Nuvita · <a href="${BASE}/dashboard" style="color:#9CA3AF">Acessar plataforma</a></p>
    </div></body></html>`;

  const cor = dados.score >= 70 ? '#1D9E75' : dados.score >= 40 ? '#F59E0B' : '#EF4444';
  const variacao = dados.pesoInicial && dados.pesoAtual ? (dados.pesoAtual - dados.pesoInicial).toFixed(1) : null;

  return {
    subject: `📊 Relatório do mês, ${nome} — semana ${dados.semanas} do seu protocolo`,
    html: wrap(`
      <h1 style="font-size:1.3rem;font-weight:600;color:#111827;margin-bottom:.5rem">Seu relatório mensal, ${nome} 📊</h1>
      <p style="color:#6B7280;line-height:1.7;margin-bottom:1.5rem">Aqui está um resumo do seu mês na Nuvita:</p>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:1.5rem">
        ${[
          ['Score', `${dados.score}%`, cor],
          ['Check-ins', dados.totalCheckins.toString(), '#111827'],
          ['Streak', `${dados.streak} dias`, dados.streak >= 7 ? '#D97706' : '#6B7280'],
        ].map(([l, v, c]) => `
          <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:${c}">${v}</div>
            <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.05em;margin-top:2px">${l}</div>
          </div>`).join('')}
      </div>

      ${variacao ? `
      <div style="background:#F0FDF4;border-radius:10px;padding:1rem;margin-bottom:1.5rem">
        <div style="font-size:12px;color:#0F6E56;font-weight:600;margin-bottom:4px">⚖️ Evolução de peso</div>
        <div style="font-size:20px;font-weight:700;color:${Number(variacao) < 0 ? '#1D9E75' : '#EF4444'}">
          ${Number(variacao) > 0 ? '+' : ''}${variacao} kg
        </div>
        <div style="font-size:12px;color:#6B7280">${dados.pesoInicial}kg → ${dados.pesoAtual}kg</div>
      </div>` : ''}

      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:1.25rem;margin-bottom:1.5rem">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#0F6E56;margin-bottom:.5rem">
          🤖 Análise da IA Nuvita
        </div>
        <p style="font-size:14px;color:#065F46;line-height:1.7;margin:0">${dados.insights}</p>
      </div>
      ${btn(BASE + '/dashboard', 'Ver minha evolução completa →')}
    `)
  };
}
