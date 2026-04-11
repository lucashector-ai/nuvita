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
}

export async function gerarProtocoloComIA(answers: QuizAnswers): Promise<ProtocoloIA | null> {
  try {
    const contexto = montarContexto(answers)
    const res = await apiFetch('/api/ia', {
      method: 'POST',
      body: JSON.stringify({
        system: `Você é especialista em peptídeos terapêuticos da Nuvita. Gere protocolos ENXUTOS e INTELIGENTES. Menos é mais — peptídeos são caros.

PEPTÍDEOS DISPONÍVEIS — use APENAS estes nomes exatos:
EMAGRECIMENTO: Tirzepatide, Retatrutide, AOD-9604, HGH Fragment 176-191, MOTS-C
GH/COMPOSIÇÃO: Ipamorelin, CJC-1295 + Ipamorelin, Tesamorelin
RECUPERAÇÃO: BPC-157, TB-500, TB-500 + BPC-157
ANTI-AGING/PELE: GHK-Cu, GLOW (GHK+BPC+TB), KLOW (GHK+KPV+BPC+TB)
GUT/INFLAMAÇÃO: KPV, BPC-157 + TB-500 + GHK-Cu
LONGEVIDADE: NAD+, SS-31
COGNIÇÃO: Semax
SEXUAL: PT-141
EXPERIMENTAL: SLU-PP-332

REGRAS DE SELEÇÃO (OBRIGATÓRIAS):
1. Emagrecer → Tirzepatide principal. AOD-9604 opcional. NUNCA Tirzepatide + Retatrutide juntos.
2. GH/composição → CJC-1295 + Ipamorelin (stack = 1 item). NUNCA adicione Ipamorelin separado.
3. Recuperação → TB-500 + BPC-157 (stack = 1 item). NUNCA liste os dois separados.
4. Anti-aging pele → GHK-Cu OU GLOW. Nunca os dois.
5. NUNCA dois peptídeos com mesmo mecanismo (dois GLP-1, dois GHRPs, etc).

QUANTIDADE MÁXIMA POR NÍVEL:
- Iniciante: máximo 2 peptídeos
- Intermediário: máximo 3 peptídeos
- Avançado: máximo 4 peptídeos

Responda APENAS JSON válido. Zero texto fora do JSON.

{
  "resumo": "2-3 frases sobre a lógica deste protocolo para ESTE perfil",
  "peptideos": [
    {
      "nome": "Nome EXATO da lista",
      "emoji": "emoji",
      "motivo": "Por que este peptídeo para este perfil — 1-2 frases diretas",
      "dose": "dose conservadora",
      "timing": "quando aplicar",
      "frequencia": "frequência semanal",
      "via": "SC ou oral ou intranasal",
      "ciclo": "duração",
      "prioridade": "essencial|recomendado|opcional"
    }
  ],
  "observacoes": "orientações específicas para o perfil",
  "avisoMedico": "aviso personalizado considerando condições de saúde declaradas"
}`,
        messages: [{
          role: 'user',
          content: contexto,
        }],
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
  const objs = Array.isArray(a.q3) ? a.q3.join(', ') : (a.q3 || 'não informado')
  return `PERFIL DO USUÁRIO PARA GERAÇÃO DE PROTOCOLO:

Nome: ${a.nome || 'não informado'}
Sexo: ${a.q2 || 'não informado'}
Objetivos principais: ${objs}
Nível de experiência com peptídeos: ${a.q4 || 'iniciante'}
Já usou peptídeos antes: ${a.q5 || 'não'}
Nível de atividade física: ${a.q6 || 'não informado'}
Qualidade do sono: ${a.q7 || 'não informado'}
Nível de estresse: ${a.q8 || 'não informado'}
Duração desejada do ciclo: ${a.q9 || '8 semanas'}
Condições de saúde relevantes: ${a.q10 || 'nenhuma declarada'}
Peso: ${a.peso || 'não informado'} kg
Altura: ${a.altura || 'não informada'} cm
IMC estimado: ${a.peso && a.altura ? (Number(a.peso) / Math.pow(Number(a.altura)/100, 2)).toFixed(1) : 'não calculado'}

Com base neste perfil, gere um protocolo de peptídeos personalizado seguindo o formato JSON especificado.`
}
