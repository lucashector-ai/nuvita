export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { ALL_PEPTIDES, objetivosDoPeptide, findPeptide } from '@/lib/peptides';
import { OBJ_LABEL } from '@/lib/recomendarPeptideos';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

// Catálogo detalhado entregue à IA (conhecimento por peptídeo).
function montarCatalogo(estoque?: string[] | null): string {
  const lista = estoque && estoque.length ? ALL_PEPTIDES.filter((p) => estoque.includes(p.n)) : ALL_PEPTIDES;
  return lista.map((p) => {
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

═══════════════════════════════════════
GUIA COMPARATIVO — QUANDO ESCOLHER QUAL (efeitos parecidos)
Escolha SEMPRE apenas um de cada grupo e saiba justificar a escolha.
═══════════════════════════════════════

EMAGRECER — incretinas (ordem de potência crescente):
- Semaglutide (GLP-1): mais estabelecido, boa tolerância, menos potente. 1ª linha suave / iniciante sensível.
- Tirzepatide (GIP+GLP-1): mais potente que o Semaglutide, ótimo equilíbrio potência × tolerância. Padrão-ouro para a maioria.
- Retatrutide (GIP+GLP-1+glucagon): o MAIS potente, melhor em gordura visceral e casos resistentes; tende a mais efeitos gastrointestinais no início.
- Como decidir: iniciante / quer suave → Semaglutide ou Tirzepatide. Muito a perder / platô com Tirzepatide / experiente que tolera bem → Retatrutide. NUNCA combine dois. "Forma": os três são SC 1x/semana; a diferença está no nº de receptores (mecanismo) e na potência.

EMAGRECER — apoio não-incretina (geralmente adjuvante, não substituto):
- AOD-9604 e HGH Fragment 176-191: praticamente o MESMO mecanismo (fragmento lipolítico do GH). Escolha um — HGH Frag é um pouco mais "cru"/potente; AOD é mais refinado/estável.
- 5-Amino-1MQ: ORAL (sem agulha), mecanismo diferente (NNMT). Ótimo para quem recusa injeção.
- SLU-PP-332: mimético de exercício — bom para sedentário / suporte metabólico.
- MOTS-c: metabolismo e sensibilidade à insulina — bom no sobrepeso metabólico.
- CBL-514: gordura LOCALIZADA (injeção na área), não sistêmico — para pontos específicos.

GH / MASSA:
- CJC-1295 + Ipamorelin: stack padrão, pulsátil e fisiológico, mais seguro e barato. 1ª escolha de GH.
- MK-677: ORAL, conveniente, eleva IGF-1/GH, apetite e sono; retém água. Bom para quem não quer injetar.
- Tesamorelin: foco em gordura VISCERAL + GH; mais caro.
- HGH (Somatropina): GH exógeno direto, mais potente porém mais caro/arriscado — avançado, com supervisão.
- Como decidir: iniciante/custo → CJC+Ipamorelin ou MK-677; gordura visceral → Tesamorelin; resultado máximo → HGH (supervisão).

RECUPERAÇÃO:
- BPC-157 (coringa: tendão, intestino, sistêmico) e TB-500 (reparo sistêmico, anti-inflamatório). O blend TB-500 + BPC-157 junta os dois num frasco.
- KPV entra quando há inflamação/intestino. GLOW (GHK+BPC+TB) = recuperação + pele; KLOW (+KPV) acrescenta anti-inflamatório.

PELE:
- GHK-Cu (colágeno) é a base; GLOW/KLOW são blends que somam cicatrização; SNAP-8 age diferente (relaxa músculo, rugas de expressão). Melanotan II é bronzeado, não cuidado de pele.

LONGEVIDADE/ENERGIA:
- NAD+ (energia rápida, reparo de DNA) × SS-31 (mitocondrial) × MOTS-c (metabólico) × Epitalon (telômeros/sono, protocolo de carga) × Timalfasina (imunidade). Energia imediata → NAD+; fadiga mitocondrial → SS-31/MOTS-c; longevidade estrutural → Epitalon.

HORMONAL/LIBIDO:
- PT-141 (libido aguda via SNC, conforme necessidade) × Kisspeptin-10 (estimula o eixo LH→testosterona, mais fisiológico/fertilidade) × Melanotan II (libido + bronzeado). Libido pontual → PT-141; eixo hormonal/testosterona → Kisspeptin.

REGRA DE COMPARAÇÃO: quando dois produtos servirem para o mesmo objetivo, escolha o melhor para ESTE perfil e explique a diferença (potência, via/forma, tolerância, experiência necessária, custo) — é isso que faz o atendente entregar o resultado certo.

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
      "motivo": "por que ELA deve usar este peptídeo — o que ele faz no corpo e o que esperar, específico ao perfil (sexo/idade/IMC/atividade/sono), 2-3 frases simples e completas",
      "comoUsar": "passo a passo prático e detalhado em linguagem de leigo: como preparar/reconstituir se precisar, quando e onde aplicar, ritmo de titulação, o que sentir nas primeiras semanas e uma dica de adesão, 3-4 frases",
      "alternativa": "SÓ quando existir um produto de efeito parecido: cite a alternativa e explique em 1 frase a diferença (potência/via/forma/tolerância) e por que escolhemos ESTE para o perfil dela. Deixe \"\" se não houver alternativa relevante."
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
- Quando dois produtos servirem para o mesmo objetivo (ex.: Tirzepatide vs Retatrutide; AOD-9604 vs HGH Fragment; CJC-1295+Ipamorelin vs MK-677 vs HGH), escolha o melhor para ESTE perfil e preencha "alternativa" explicando a diferença e o porquê da escolha.

PRECISÃO E CLAREZA (muito importante):
- Nunca invente peptídeo, dose ou efeito. Se não tiver certeza, seja conservador e sinalize no avisoMedico. É melhor recomendar menos e certo do que mais e errado.
- Explique TUDO "timtim por timtim", em linguagem simples que um leigo entenda — como funciona no corpo, o que a pessoa vai sentir, e cada passo do uso. O atendente vai ler isso em voz alta para o paciente.
- Raciocine com cuidado antes de responder; confira se cada escolha faz sentido para o sexo, idade, IMC, atividade e condições da pessoa.

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
      "comoUsar": "como usar na prática, linguagem simples: quando/como aplicar, o que esperar, dica de adesão, 2-3 frases",
      "alternativa": "SÓ se houver um produto de efeito parecido que valha citar (ex.: quem usa Tirzepatide pode considerar Retatrutide se precisar de mais potência; AOD-9604 tem efeito próximo ao HGH Fragment). Explique a diferença em 1 frase. Deixe \"\" se não houver."
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

    const { perfil, modo, peptideo, estoque, idioma } = await req.json();
    if (!perfil || typeof perfil !== 'string' || perfil.length > 4000) {
      return NextResponse.json({ error: 'perfil inválido' }, { status: 400 });
    }

    // Idioma da resposta (os campos do JSON saem no idioma escolhido).
    const lang = idioma === 'es' ? 'es' : 'pt';
    const IDIOMA_INSTR = lang === 'es'
      ? '\n\nIDIOMA: responda TODO o conteúdo dos campos do JSON em ESPANHOL (español) — resumo, motivo, comoUsar, alternativa, orientações e avisos. Mantenha as CHAVES do JSON e os NOMES dos peptídeos exatamente como no catálogo (não traduza os nomes dos produtos).'
      : '';

    const estoqueArr = Array.isArray(estoque) ? estoque.map((p: any) => String(p)) : null;
    const catalogo = montarCatalogo(estoqueArr);
    let system: string;
    let instrucao: string;

    if (modo === 'unico') {
      const p = findPeptide(String(peptideo || ''));
      if (!p) return NextResponse.json({ error: 'peptídeo inválido' }, { status: 400 });
      system = SYSTEM_UNICO(catalogo, p.n) + IDIOMA_INSTR;
      instrucao = `PERFIL DA PESSOA:\n${perfil}\n\nMonte o protocolo COMPLETO apenas de ${p.n} para esta pessoa, em JSON.`;
    } else {
      system = SYSTEM_COMPLETO(catalogo) + IDIOMA_INSTR;
      instrucao = `PERFIL DA PESSOA (atendimento no balcão):\n${perfil}\n\nFaça o diagnóstico e monte o protocolo em JSON.`;
    }

    // Velocidade do balcão (o atendente não pode esperar):
    //  • Sonnet 5 → bem mais rápido que o Opus, mantendo alta qualidade no
    //    protocolo estruturado com base de conhecimento.
    //  • thinking desligado + esforço baixo → sem latência de raciocínio.
    //  • cache do prompt (cache_control) → o texto grande e fixo (conhecimento +
    //    catálogo + formato) fica em cache; do 2º atendimento em diante a IA
    //    responde muito mais rápido (só processa o perfil da pessoa).
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 6000,
      thinking: { type: 'disabled' },
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: instrucao }],
    });

    // Se o modelo recusar (classificadores de segurança), devolve vazio →
    // o cliente cai no fallback determinístico (nunca quebra o balcão).
    if (msg.stop_reason === 'refusal') {
      return NextResponse.json({ text: '' });
    }
    const text = msg.content.find((b) => b.type === 'text')?.text || '';
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error('Diagnóstico IA error:', e?.message);
    return NextResponse.json({ error: 'Erro ao processar' }, { status: 500 });
  }
}
