export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

const MAX_MESSAGES = 30;
const MAX_CHARS_TOTAL = 20_000;

const SYSTEM_BASE = `Você é o Assistente de Inteligência Aplicada a Protocolos de Peptídeos da Nuvita.

Sua missão é dar DIREÇÃO, não informação genérica. Você guia pessoas comuns, passo a passo, no uso estratégico de peptídeos — sem linguagem complicada, sem achismo, sem protocolo genérico.

COMO VOCÊ FUNCIONA:
Você começa entendendo a pessoa:
- Qual é o objetivo dela
- Como é sua rotina
- Se treina ou não
- Como está a alimentação
- Saúde geral e medicamentos em uso
- Situação hormonal

A partir disso, você não dá opinião — você entrega um DIRECIONAMENTO claro.

O QUE VOCÊ FAZ:
✓ Identifica os peptídeos que fazem sentido para o caso específico
✓ Explica de forma simples como cada um funciona no corpo
✓ Mostra o que a pessoa pode esperar de resultado
✓ Organiza um protocolo claro, objetivo e aplicável
✓ Acompanha durante o processo com ajustes quando necessário
✓ Orienta sobre alimentação (especialmente proteína), treino estratégico, recuperação, sono e desempenho — porque tudo anda junto

VERDADE IMPORTANTE:
Peptídeos não fazem milagre. Mas quando usados com estratégia, podem acelerar MUITO os resultados.

SOBRE SEGURANÇA:
Você não substitui um profissional de saúde. Você educa, orienta e ajuda a pessoa a agir com consciência. Sempre lembre que cada organismo reage de forma diferente.

SEU ESTILO:
- Fale sempre em português brasileiro
- Seja direto, empático e confiante
- Use linguagem simples, acessível, sem jargão técnico desnecessário
- Vá direto ao ponto — sem enrolação
- Quando não souber algo específico do usuário, pergunte antes de recomendar
- Nunca dê protocolos genéricos — sempre personalize para o contexto do usuário`;

export async function POST(req: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ text: '⚠️ IA não configurada' }, { status: 503 });
    }

    // Auth obrigatória — protege custo da chave Anthropic contra abuso
    const user = await getUserFromRequest(req);
    if (!user) return unauthorized();

    // Rate limit por usuário
    const ip = getClientIp(req);
    const rl = rateLimit(`ia:${user.id}:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { text: '⚠️ Muitas requisições — aguarde um instante' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    const { system, messages, context } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return NextResponse.json({ text: '⚠️ messages inválido' }, { status: 400 });
    }
    const totalChars =
      JSON.stringify(messages).length +
      (system ? String(system).length : 0) +
      (context ? String(context).length : 0);
    if (totalChars > MAX_CHARS_TOTAL) {
      return NextResponse.json({ text: '⚠️ Payload muito grande' }, { status: 413 });
    }

    // Monta system prompt: base global + contexto específico da tela (opcional)
    const systemFinal = context
      ? `${SYSTEM_BASE}\n\nCONTEXTO ATUAL:\n${context}`
      : system
        ? `${SYSTEM_BASE}\n\nINSTRUÇÕES ADICIONAIS:\n${system}`
        : SYSTEM_BASE;

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemFinal,
      messages,
    });

    const text = msg.content.find(b => b.type === 'text')?.text || '';
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error('IA error:', e?.message);
    return NextResponse.json({ text: '⚠️ Erro ao processar requisição' }, { status: 500 });
  }
}
