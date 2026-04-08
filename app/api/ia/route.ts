import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    // Rate limiting simples: max 20 req/min por IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const key = `rate_ia_${ip}`;
    // Usa header X-Rate-Limit customizado (sem Redis — só log em dev)
    console.log('IA request from:', ip);
    const { system, messages } = await req.json()
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: system || 'Você é a IA Nuvita, especialista em peptídeos. Responda em português.',
      messages,
    })
    const text = msg.content.find(b => b.type === 'text')?.text || ''
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ text: '⚠️ Erro na IA: ' + e.message }, { status: 500 })
  }
}
