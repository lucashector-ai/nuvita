import type { QuizAnswers } from '@/types'
import { apiFetch } from './apiClient'

export interface PeptideoIA {
  nome: string
  emoji: string
  motivo: string
  dose: string
  timing: string
  frequencia: string
  via: string
  ciclo: string
  prioridade: 'essencial' | 'recomendado' | 'opcional'
}

export interface ProtocoloIA {
  resumo: string
  peptideos: PeptideoIA[]
  observacoes: string
  avisoMedico: string
  orientacaoAlimentar: string
  orientacaoTreino: string
}

export async function gerarProtocoloComIA(answers: QuizAnswers): Promise<ProtocoloIA | null> {
  try {
    const contexto = montarContexto(answers)
    const res = await apiFetch('/api/ia', {
      method: 'POST',
      body: JSON.stringify({
        system: `Você é um especialista clínico em peptídeos terapêuticos da Nuvita.

Sua missão: gerar um protocolo CIRÚRGICO, ENXUTO e PERSONALIZADO. Menos é mais. Peptídeos são caros — o usuário precisa do que realmente funciona para o caso dele, não de uma lista.

═══════════════════════════════════════
PROTOCOLO EXATO POR OBJETIVO (siga rigorosamente)
═══════════════════════════════════════

🔥 GORDURA / EMAGRECIMENTO:
- PRINCIPAL OBRIGATÓRIO: Tirzepatide (agonista duplo GIP+GLP-1, mais eficaz disponível)
- OPCIONAL para intermediário/avançado: AOD-9604 (suporte lipolítico, sem impacto glicêmico)
- NUNCA use Retatrutide junto com Tirzepatide (mesmo mecanismo)
- NUNCA use Semaglutide se já tem Tirzepatide

💪 MASSA / COMPOSIÇÃO CORPORAL:
- PRINCIPAL: CJC-1295 + Ipamorelin (stack único — conte como 1 peptídeo)
- OPCIONAL avançado: Tesamorelin (redução de gordura visceral + GH)
- NUNCA liste CJC-1295 e Ipamorelin separados se estão no stack

🔄 RECUPERAÇÃO / LESÕES:
- PRINCIPAL: TB-500 + BPC-157 (stack único — conte como 1 peptídeo)
- NUNCA liste TB-500 e BPC-157 separados

✨ PELE / ANTI-AGING:
- Problema de pele ativo: GLOW (GHK+BPC+TB) — stack completo
- Manutenção/prevenção: GHK-Cu apenas
- NUNCA GHK-Cu + GLOW juntos

🌙 SONO:
- Sono ruim (1-2): Ipamorelin (se não tem no stack de GH, adiciona separado)
- Sono moderado (3): não precisa peptídeo específico, otimize higiene do sono

🌟 LONGEVIDADE:
- NAD+ (oral ou SC)
- SS-31 (mitocondrial, avançado)

🧠 COGNIÇÃO:
- Semax (intranasal, rápido e eficaz)

⚗️ HORMONAL / LIBIDO:
- PT-141 (conforme necessidade, não diário)

═══════════════════════════════════════
QUANTIDADE MÁXIMA (REGRA INVIOLÁVEL)
═══════════════════════════════════════
- Iniciante: MÁXIMO 1 peptídeo (ou 1 stack)
- Intermediário: MÁXIMO 2 peptídeos/stacks
- Avançado: MÁXIMO 3 peptídeos/stacks

Se o usuário tem múltiplos objetivos, priorize o OBJETIVO PRINCIPAL e adicione no máximo 1 peptídeo secundário compatível.

═══════════════════════════════════════
REGRAS DE SEGURANÇA
═══════════════════════════════════════
- Diabetes/pré-diabetes → EVITAR Tirzepatide sem supervisão médica explícita
- Câncer/histórico → EVITAR peptídeos anabólicos (IGF-1, GH secretagogos)
- Gestação/amamentação → NENHUM peptídeo
- Hipotireoidismo → cuidado com GH secretagogos
- Hipertensão → evitar PT-141

═══════════════════════════════════════
FORMATO DE RESPOSTA
═══════════════════════════════════════
Responda APENAS JSON válido. Zero texto fora do JSON.

{
  "resumo": "2-3 frases diretas: por que ESTE protocolo para ESTE perfil específico",
  "peptideos": [
    {
      "nome": "Nome exato conforme lista acima",
      "emoji": "emoji",
      "motivo": "Por que este peptídeo para este usuário — específico, 1-2 frases",
      "dose": "dose inicial conservadora personalizada",
      "timing": "quando aplicar",
      "frequencia": "frequência",
      "via": "SC, oral ou intranasal",
      "ciclo": "duração",
      "prioridade": "essencial|recomendado|opcional"
    }
  ],
  "orientacaoAlimentar": "orientação alimentar específica para o objetivo: proteína alvo, déficit/superávit, janela alimentar",
  "orientacaoTreino": "orientação de treino alinhada ao protocolo e objetivo",
  "observacoes": "o que observar nas primeiras semanas, como saber se está funcionando",
  "avisoMedico": "aviso personalizado para as condições de saúde declaradas"
}`,
        messages: [{ role: 'user', content: contexto }],
      }),
    })

    const data = await res.json()
    const texto = data.text || ''
    const jsonMatch = texto.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    return JSON.parse(jsonMatch[0]) as ProtocoloIA
  } catch (e) {
    console.error('Erro ao gerar protocolo com IA:', e)
    return null
  }
}

function montarContexto(a: QuizAnswers): string {
  const objs = Array.isArray(a.q3) ? a.q3 : [a.q3 || 'gordura']
  const objLabels: Record<string, string> = {
    gordura: 'Perda de gordura/emagrecimento',
    massa: 'Ganho de massa muscular',
    recuperacao: 'Recuperação e lesões',
    sono: 'Qualidade do sono',
    pele: 'Saúde da pele',
    longevidade: 'Longevidade',
    cognitivo: 'Performance cognitiva',
    hormonal: 'Equilíbrio hormonal/libido',
  }

  const imc = a.peso && a.altura
    ? (Number(a.peso) / Math.pow(Number(a.altura) / 100, 2)).toFixed(1)
    : 'não calculado'

  const imcClass = () => {
    const v = parseFloat(imc)
    if (isNaN(v)) return ''
    if (v < 18.5) return '(abaixo do peso)'
    if (v < 25) return '(peso normal)'
    if (v < 30) return '(sobrepeso)'
    return '(obesidade)'
  }

  const objDescricoes = objs.map(o => objLabels[o] || o).join(', ')
  const objetivoPrincipal = objLabels[objs[0]] || objs[0]

  return `PERFIL DO USUÁRIO:

Nome: ${a.nome || 'não informado'}
Sexo: ${a.q2 || 'não informado'}
Peso: ${a.peso || '?'} kg | Altura: ${a.altura || '?'} cm | IMC: ${imc} ${imcClass()}

OBJETIVO PRINCIPAL: ${objetivoPrincipal}
${objs.length > 1 ? `Objetivos secundários: ${objs.slice(1).map(o => objLabels[o] || o).join(', ')}` : ''}
${a.peleProblema ? `Problema de pele específico: ${a.peleProblema}` : ''}

Nível de experiência com peptídeos: ${a.q4 || 'iniciante'}
Atividade física: ${a.q6 || 'sedentário'}
Qualidade do sono: ${a.q7 || '?'}/5
Nível de estresse: ${a.q8 || 'não informado'}
Duração desejada: ${a.q9 || '8 semanas'}
Condições de saúde: ${Array.isArray(a.q10) ? a.q10.join(', ') : (a.q10 || 'nenhuma declarada')}

INSTRUÇÃO: Gere o protocolo seguindo EXATAMENTE as regras por objetivo. Objetivo principal = ${objetivoPrincipal}. Seja enxuto e preciso.`
}
