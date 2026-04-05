import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { system, messages } = await request.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system,
      messages,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
