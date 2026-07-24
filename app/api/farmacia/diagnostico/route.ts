export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { ALL_PEPTIDES, objetivosDoPeptide } from '@/lib/peptides';
import { OBJ_LABEL } from '@/lib/recomendarPeptideos';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

// Catálogo textual entregue à IA (nomes EXATOS que ela deve usar).
function montarCatalogo(): string {
  return ALL_PEPTIDES.map((p) => {
    const objs = objetivosDoPeptide(p.n).map((o) => OBJ_LABEL[o]).join(', ');
    return `- ${p.n} — ${p.m}. Via: ${p.route}. Indicado para: ${objs || 'uso geral'}.`;
  }).join('\n');
}

const SYSTEM = `Você é um especialista clínico em peptídeos terapêuticos da Nuvita, fazendo um diagnóstico SÉRIO e PERSONALIZADO no balcão de uma farmácia.

Sua missão: analisar o perfil da pessoa e MONTAR O PROTOCOLO — escolhendo os peptídeos certos, do catálogo abaixo, para o caso específico dela.

═══════════════════════════════════════
CATÁLOGO (use SOMENTE estes nomes, exatamente como escritos)
═══════════════════════════════════════
{{CATALOGO}}

═══════════════════════════════════════
COMO DIAGNOSTICAR
═══════════════════════════════════════
- Considere TUDO: sexo, idade, IMC, nível de atividade, sono, objetivo(s) e condições de saúde.
- Homens e mulheres têm fisiologias diferentes — leve isso em conta (ex.: prioridades hormonais, pele, composição corporal).
- Monte um protocolo COMPLETO e SINÉRGICO: recomende de 3 a 6 peptídeos. Prefira mais de 2 quando fizer sentido clínico, mas NUNCA inclua algo que não ajude o caso.
- Se a pessoa tem vários objetivos ("para tudo"), cubra os principais com um stack coerente.
- Ordene do mais importante (essencial) para o de apoio.

═══════════════════════════════════════
SEGURANÇA (regras invioláveis)
═══════════════════════════════════════
- Diabetes/pré-diabetes → NÃO recomende Tirzepatide, Semaglutide nem MK-677 (afetam glicemia).
- Histórico de câncer → NÃO recomende anabólicos/secretagogos de GH (Ipamorelin, CJC-1295, MK-677, IGF-1 LR3).
- Hipertensão → NÃO recomende PT-141.
- Gestação/amamentação → NÃO recomende nada.
- Na dúvida sobre uma condição, seja conservador e sinalize no aviso médico.

═══════════════════════════════════════
FORMATO (responda APENAS JSON válido, nada fora do JSON)
═══════════════════════════════════════
{
  "resumo": "2-3 frases: o diagnóstico e por que ESTE protocolo para ESTA pessoa (cite sexo/idade/objetivo quando relevante)",
  "peptideos": [
    {
      "nome": "nome EXATO do catálogo",
      "motivo": "por que ELA deve usar este peptídeo — específico ao perfil (sexo, objetivo, idade, IMC, sono, atividade), 1-2 frases simples",
      "comoUsar": "como usar na prática, linguagem simples para leigo (quando/como aplicar + dica de adesão), 1-2 frases"
    }
  ],
  "orientacaoAlimentar": "orientação alimentar prática ligada ao objetivo e ao IMC (1-2 frases)",
  "orientacaoTreino": "orientação de atividade física considerando o nível atual (1-2 frases)",
  "observacoes": "o que observar nas primeiras semanas e como saber se está funcionando (1-2 frases)",
  "avisoMedico": "aviso de segurança considerando idade e condições declaradas"
}`;

export async function POST(req: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ error: 'IA não configurada' }, { status: 503 });
    }

    const ip = getClientIp(req);
    // Uso de balcão (protegido por PIN no cliente) — limite generoso.
    const rl = rateLimit(`farmacia-diag:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições — aguarde um instante' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    const { perfil } = await req.json();
    if (!perfil || typeof perfil !== 'string' || perfil.length > 4000) {
      return NextResponse.json({ error: 'perfil inválido' }, { status: 400 });
    }

    const system = SYSTEM.replace('{{CATALOGO}}', montarCatalogo());

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system,
      messages: [
        {
          role: 'user',
          content: `PERFIL DA PESSOA (atendimento no balcão):\n${perfil}\n\nFaça o diagnóstico e monte o protocolo em JSON.`,
        },
      ],
    });

    const text = msg.content.find((b) => b.type === 'text')?.text || '';
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error('Diagnóstico IA error:', e?.message);
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 });
  }
}
