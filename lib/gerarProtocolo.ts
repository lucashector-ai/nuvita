import type { QuizAnswers } from '@/types'

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
    const res = await fetch('/api/ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: `Você é um especialista em protocolos de peptídeos terapêuticos da plataforma Nuvita.
Sua função é analisar o perfil do usuário e gerar um protocolo personalizado de peptídeos.

REGRAS IMPORTANTES:
- Responda APENAS com JSON válido, sem texto antes ou depois
- Selecione entre 3 a 6 peptídeos adequados ao perfil
- Prioridade: "essencial" (máx 2), "recomendado" (máx 2), "opcional" (máx 2)
- Doses devem ser conservadoras para iniciantes
- Sempre inclua aviso médico
- Base científica real, não invente efeitos

FORMATO DE RESPOSTA (JSON):
{
  "resumo": "2-3 frases sobre o protocolo gerado e por que foi personalizado assim",
  "peptideos": [
    {
      "nome": "Nome do peptídeo",
      "emoji": "emoji relevante",
      "motivo": "Por que este peptídeo foi escolhido para este perfil específico (2 frases)",
      "dose": "dose recomendada",
      "timing": "quando aplicar",
      "frequencia": "quantas vezes por semana",
      "via": "SC ou oral ou intranasal",
      "ciclo": "duração do ciclo",
      "prioridade": "essencial|recomendado|opcional"
    }
  ],
  "observacoes": "orientações específicas para este perfil (sono, alimentação, exercício)",
  "avisoMedico": "aviso personalizado para as condições de saúde declaradas"
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
