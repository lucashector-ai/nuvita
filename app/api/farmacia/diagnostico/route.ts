export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { ALL_PEPTIDES, objetivosDoPeptide, findPeptide } from '@/lib/peptides';
import { OBJ_LABEL } from '@/lib/recomendarPeptideos';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

// Catálogo detalhado entregue à IA (conhecimento por peptídeo).
function montarCatalogo(): string {
  return ALL_PEPTIDES.map((p) => {
    const objs = objetivosDoPeptide(p.n).map((o) => OBJ_LABEL[o]).join(', ');
    return `- ${p.n} — ${p.m}
  • Benefício/mecanismo: ${p.why || '—'}
  • Indicado para: ${objs || 'uso geral'}
  • Dose referência (75 kg): ${p.doseStr(75)} · ${p.freq} · ${p.timing} · via ${p.route}
  • Ciclo: ${p.cycle}; descanso: ${p.rest}
  • Aplicação: ${p.how}`;
  }).join('\n');
}

// Base de conhecimento clínico da Nuvita (o "treino" da IA).
const CONHECIMENTO = `CONHECIMENTO CLÍNICO NUVITA (raciocine com base nisto):

Como ler o diagnóstico:
- IMC alto (≥25) ou objetivo emagrecer → priorize agonistas de GLP-1/GIP.
- Idade ≥40 → longevidade, GH e sono ganham peso.
- Treina forte / muito ativo → recuperação e massa magra fazem mais sentido.
- Sono ruim → inclua peptídeo que melhore sono profundo.
- Sedentário → seja conservador na dose e nas expectativas.
- Diferença por sexo: baseie na fisiologia (composição, hormônios, pele), nunca em estereótipo.

Protocolos por objetivo:
- EMAGRECER: Tirzepatide é o principal (duplo GIP+GLP-1, mais eficaz). AOD-9604 apoia a lipólise sem afetar glicemia. NUNCA use dois agonistas GLP-1 juntos (ex.: Tirzepatide + Semaglutide).
- MASSA/COMPOSIÇÃO: stack CJC-1295 + Ipamorelin (sinérgico — amplia pulsos de GH). IGF-1 LR3 para quem treina pesado. MK-677 (oral) pela praticidade e sono.
- RECUPERAÇÃO/LESÕES: BPC-157 + TB-500 (stack sinérgico de reparo).
- PELE/ANTI-IDADE: GHK-Cu (colágeno/elastina). BPC-157 apoia cicatrização.
- SONO: Ipamorelin e/ou DSIP.
- LONGEVIDADE/ENERGIA: Epitalon (telômeros, sono profundo); Timalfasina (imunidade).
- COGNIÇÃO/FOCO: Semax; Selank quando há ansiedade.
- HORMONAL/LIBIDO: PT-141 (conforme necessidade, não diário).

Sinergias e regras:
- Secretagogos de GH combinam bem (CJC-1295 + Ipamorelin). BPC-157 é um "coringa" (recuperação, intestino, apoio geral).
- Evite redundância: não empilhe dois peptídeos com o mesmo mecanismo.
- Para vários objetivos ("para tudo"), monte um stack coerente que cubra os principais sem inflar a lista.

Segurança (invioláveis):
- Diabetes/pré-diabetes → não indique Tirzepatide, Semaglutide nem MK-677 (glicêmicos).
- Histórico de câncer → não indique anabólicos/secretagogos de GH (Ipamorelin, CJC-1295, MK-677, IGF-1 LR3).
- Hipertensão → não indique PT-141.
- Gestação/amamentação → não indique nada.`;

const FORMATO_COMPLETO = `FORMATO (responda APENAS JSON válido, nada fora do JSON):
{
  "resumo": "2-3 frases: o diagnóstico e por que ESTE protocolo para ESTA pessoa (cite sexo/idade/objetivo/IMC quando relevante)",
  "peptideos": [
    {
      "nome": "nome EXATO do catálogo",
      "motivo": "por que ELA deve usar este peptídeo — específico ao perfil, 1-2 frases simples",
      "comoUsar": "como usar na prática, linguagem simples para leigo (quando/como aplicar + dica de adesão), 1-2 frases"
    }
  ],
  "orientacaoAlimentar": "orientação alimentar prática ligada ao objetivo e ao IMC (1-2 frases)",
  "orientacaoTreino": "orientação de atividade física considerando o nível atual (1-2 frases)",
  "observacoes": "o que observar nas primeiras semanas e como saber se está funcionando (1-2 frases)",
  "avisoMedico": "aviso de segurança considerando idade e condições declaradas"
}`;

const SYSTEM_COMPLETO = (catalogo: string) => `Você é um especialista clínico em peptídeos terapêuticos da Nuvita, fazendo um diagnóstico SÉRIO e PERSONALIZADO no balcão de uma farmácia.

Sua missão: analisar o perfil e MONTAR O PROTOCOLO — escolhendo os peptídeos certos, do catálogo, para o caso específico.
- Recomende de 3 a 6 peptídeos. Prefira mais de 2 quando fizer sentido clínico, mas nunca inclua algo que não ajude.
- Use SOMENTE nomes do catálogo, exatamente como escritos. Ordene do essencial ao de apoio.

═══════ CATÁLOGO ═══════
${catalogo}

═══════ ${CONHECIMENTO} ═══════

${FORMATO_COMPLETO}`;

const SYSTEM_UNICO = (catalogo: string, peptideo: string) => `Você é um especialista clínico em peptídeos terapêuticos da Nuvita, atendendo no balcão de uma farmácia.

A pessoa JÁ USA (ou quer usar) UM peptídeo específico: **${peptideo}**.
Sua missão NÃO é escolher outros — é montar o PROTOCOLO COMPLETO e personalizado APENAS de ${peptideo} para o perfil dela.
- Explique de forma clara e simples: por que/como esse peptídeo funciona para o objetivo dela, como usar na prática, e o que esperar.
- Se ${peptideo} for contraindicado para alguma condição declarada, DIGA isso claramente no avisoMedico e recomende avaliação médica.
- NÃO sugira outros peptídeos. O array "peptideos" deve conter SOMENTE ${peptideo}.

═══════ CATÁLOGO (referência) ═══════
${catalogo}

═══════ ${CONHECIMENTO} ═══════

FORMATO (responda APENAS JSON válido, nada fora do JSON):
{
  "resumo": "2-3 frases: por que/como ${peptideo} se encaixa (ou os cuidados) para ESTA pessoa",
  "peptideos": [
    {
      "nome": "${peptideo}",
      "motivo": "por que este peptídeo faz sentido (ou os cuidados) para o perfil dela, 1-2 frases",
      "comoUsar": "como usar na prática, linguagem simples: quando/como aplicar, o que esperar, dica de adesão, 2-3 frases"
    }
  ],
  "orientacaoAlimentar": "orientação alimentar que potencializa o resultado (1-2 frases)",
  "orientacaoTreino": "orientação de atividade física alinhada (1-2 frases)",
  "observacoes": "o que observar nas primeiras semanas e sinais de que está funcionando (1-2 frases)",
  "avisoMedico": "aviso de segurança considerando idade e condições declaradas"
}`;

export async function POST(req: NextRequest) {
  try {
    if (!client) {
      return NextResponse.json({ error: 'IA não configurada' }, { status: 503 });
    }

    const ip = getClientIp(req);
    const rl = rateLimit(`farmacia-diag:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições — aguarde um instante' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
      );
    }

    const { perfil, modo, peptideo } = await req.json();
    if (!perfil || typeof perfil !== 'string' || perfil.length > 4000) {
      return NextResponse.json({ error: 'perfil inválido' }, { status: 400 });
    }

    const catalogo = montarCatalogo();
    let system: string;
    let instrucao: string;

    if (modo === 'unico') {
      const p = findPeptide(String(peptideo || ''));
      if (!p) return NextResponse.json({ error: 'peptídeo inválido' }, { status: 400 });
      system = SYSTEM_UNICO(catalogo, p.n);
      instrucao = `PERFIL DA PESSOA:\n${perfil}\n\nMonte o protocolo COMPLETO apenas de ${p.n} para esta pessoa, em JSON.`;
    } else {
      system = SYSTEM_COMPLETO(catalogo);
      instrucao = `PERFIL DA PESSOA (atendimento no balcão):\n${perfil}\n\nFaça o diagnóstico e monte o protocolo em JSON.`;
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: instrucao }],
    });

    const text = msg.content.find((b) => b.type === 'text')?.text || '';
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error('Diagnóstico IA error:', e?.message);
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 });
  }
}
