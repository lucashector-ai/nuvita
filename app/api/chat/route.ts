import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserFromRequest, unauthorized } from '@/lib/serverAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

const MAX_MESSAGES = 30;
const MAX_CHARS_TOTAL = 20_000;

export async function POST(request: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ message: 'IA não configurada' }, { status: 503 });
    }

    // Auth obrigatória — proteger custo da chave Anthropic
    const user = await getUserFromRequest(request);
    if (!user) return unauthorized();

    // Rate limit por usuário (10 req/min)
    const ip = getClientIp(request);
    const rl = rateLimit(`chat:${user.id}:${ip}`, 15, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: 'Muitas requisições — aguarde um instante' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    const { system, messages } = await request.json();

    // Validação de input
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return NextResponse.json({ message: 'messages inválido' }, { status: 400 });
    }
    const totalChars = JSON.stringify(messages).length + (system ? String(system).length : 0);
    if (totalChars > MAX_CHARS_TOTAL) {
      return NextResponse.json({ message: 'Payload muito grande' }, { status: 413 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system,
      messages,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Chat error:', error?.message);
    return NextResponse.json({ message: 'Erro ao processar requisição' }, { status: 500 });
  }
}
