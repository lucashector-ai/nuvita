import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
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
