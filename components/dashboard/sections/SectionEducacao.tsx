// @ts-nocheck
'use client';
import { useState } from 'react';

// ─── Dados dos módulos educativos ─────────────────────
const MODULOS = [
  {
    id: 'fundamentos',
    nivel: 'Iniciante',
    cor: '#0F6E56',
    bg: '#F0FDF4',
    titulo: 'Fundamentos de Peptídeos',
    descricao: 'O que são peptídeos, como funcionam e por onde começar com segurança.',
    duracao: '~20 min de leitura',
    artigos: [
      {
        id: 'o-que-sao-peptideos',
        titulo: 'O que são peptídeos?',
        subtitulo: 'Definição, estrutura e diferença entre peptídeos, proteínas e hormônios',
        duracao: '5 min',
        conteudo: `
## Definição

Peptídeos são cadeias curtas de aminoácidos ligados por ligações peptídicas. A distinção entre peptídeo e proteína é essencialmente de tamanho: peptídeos contêm menos de 50 aminoácidos; proteínas, mais.

## Estrutura molecular

Cada aminoácido possui um grupo amino (NH₂) e um grupo carboxila (COOH). A ligação peptídica forma-se quando o grupo carboxila de um aminoácido reage com o grupo amino do próximo, liberando água (reação de condensação).

A sequência de aminoácidos — chamada de **sequência primária** — determina completamente a função do peptídeo. Pequenas alterações nessa sequência podem modificar drasticamente a atividade biológica.

## Peptídeos endógenos vs. sintéticos

**Endógenos**: produzidos naturalmente pelo organismo. Exemplos incluem a insulina, os opióides endógenos (endorfinas), o GLP-1 e a ocitocina.

**Sintéticos**: produzidos em laboratório, podem ser idênticos aos naturais (como a semaglutida, análoga ao GLP-1) ou estruturas originais sem equivalente natural.

## Por que peptídeos e não hormônios diretos?

Os peptídeos que estimulam a liberação de GH (como Ipamorelin e CJC-1295) preservam o **feedback negativo fisiológico** do eixo hipotálamo-hipófise. O GH exógeno, ao contrário, suprime esse eixo com uso contínuo. Essa preservação do controle endógeno é uma das vantagens centrais do uso de secretagogos.

## Biodisponibilidade e vias de administração

A maioria dos peptídeos tem biodisponibilidade oral próxima de zero por serem degradados por proteases gastrointestinais. Por isso, a via subcutânea (SC) é padrão. Exceções incluem:

- **BPC-157**: bioativo por via oral (maior resistência enzimática)
- **Selank e Semax**: formulações intranasais permitem absorção pela mucosa olfatória
- **Semaglutida**: formulação oral aprovada (comprimido de 14mg com absorvente especial)
        `
      },
      {
        id: 'vias-de-administracao',
        titulo: 'Vias de administração',
        subtitulo: 'Subcutânea, intramuscular, intranasal e oral — quando usar cada uma',
        duracao: '4 min',
        conteudo: `
## Via subcutânea (SC) — padrão para a maioria dos peptídeos

A injeção subcutânea deposita o peptídeo no tecido adiposo, de onde é absorvido lentamente para a circulação. É a via de eleição para peptídeos como BPC-157, TB-500, Ipamorelin, CJC-1295 e análogos GLP-1.

**Técnica**: agulha de insulina (29-31G, 4-8mm), ângulo de 45-90°, locais de rotação (abdômen, coxa, braço). Limpeza prévia com álcool 70%.

**Absorção**: pico plasmático geralmente em 15-60 minutos, dependendo do peptídeo.

## Via intramuscular (IM) — uso limitado

Raramente indicada para peptídeos. Absorção mais rápida que SC, mas maior risco de dor e hematoma. Usada em protocolos específicos de IGF-1 LR3 (injeção local no músculo trabalhado).

## Via intranasal — conforto e praticidade

Permite absorção pela mucosa olfatória, com passagem parcial pela barreira hematoencefálica. Usada para:
- **Semax**: biodisponibilidade nasal ~40-50%
- **Selank**: formulação nasal aprovada na Rússia
- **PT-141 (Bremelanotida)**: versão nasal em estudos

**Limitação**: variabilidade de absorção e menor biodisponibilidade que SC.

## Via oral — exceções importantes

**BPC-157**: o único peptídeo amplamente usado por via oral com evidência de atividade sistêmica. Estável ao ácido gástrico e absorvido pela mucosa intestinal. Dose oral tipicamente 2-5x maior que SC.

**Semaglutida oral (Rybelsus®)**: formulação com SNAC (agente absorvente) que protege o peptídeo no ambiente gástrico e facilita absorção submucosa. Aprovada pelo FDA em 2019.

## Reconstituição e armazenamento

Peptídeos liofilizados devem ser reconstituídos com água bacteriostática. A reconstituição inativa parcialmente o peptídeo ao longo do tempo:
- Solução em uso: máximo 28-30 dias em refrigeração
- Liofilizado: estável por meses a anos refrigerado, anos a décadas congelado
- Nunca agitar — misturar gentilmente por rotação
        `
      },
      {
        id: 'seguranca-e-contraindicacoes',
        titulo: 'Segurança e contraindicações',
        subtitulo: 'O que considerar antes de iniciar qualquer protocolo',
        duracao: '6 min',
        conteudo: `
## Princípio fundamental: peptídeos não são isentos de riscos

A percepção de que peptídeos são "naturais" e portanto seguros é um equívoco perigoso. Muitos são análogos sintéticos que superam a potência de hormônios endógenos. O uso sem supervisão médica representa risco real.

## Contraindicações gerais universais

**Neoplasias ativas ou histórico recente de câncer**: peptídeos com ação pró-angiogênica (BPC-157, TB-500) ou mitogênica (IGF-1 LR3, GH secretagogos) podem estimular crescimento tumoral. Esta contraindicação é absoluta.

**Gravidez e lactação**: ausência de dados de segurança. Contraindicação universal para todos os peptídeos desta plataforma.

**Doenças autoimunes em atividade**: peptídeos imunomoduladores (LL-37, VIP, Selank) podem alterar imprevidentemente o equilíbrio imunológico.

## Riscos específicos por classe

**Análogos GLP-1 (Semaglutida, Tirzepatida)**:
- Histórico de carcinoma medular de tireoide ou NEM tipo 2 (contraindicação absoluta)
- Pancreatite: interromper imediatamente em caso de dor abdominal intensa
- Retinopatia diabética: pode piorar rapidamente com melhora glicêmica abrupta

**Secretagogos de GH (Ipamorelin, CJC-1295)**:
- Resistência à insulina: GH elevado agrava sensibilidade insulínica
- Hipotiroidismo não tratado: GH não funciona adequadamente sem hormônio tireoidiano
- Síndrome do túnel do carpo: efeito colateral de GH elevado crônico

**Peptídeos pró-angiogênicos (BPC-157, TB-500)**:
- Qualquer histórico de câncer: contraindicação relativa a absoluta dependendo do caso

## Interações medicamentosas relevantes

- **Semaglutida + insulina**: risco de hipoglicemia; ajuste obrigatório
- **Semaglutida + metformina**: monitorar função renal
- **GH secretagogos + corticosteróides**: corticóides suprimem GH
- **Melanotan II + anti-hipertensivos**: potencialização do efeito hipotensor
- **PT-141 + sildenafil**: potencialização cardiovascular perigosa

## A importância do acompanhamento médico

Exames basais recomendados antes de iniciar qualquer protocolo:
- **Hemograma completo** com diferencial
- **Metabolismo: glicemia, insulina, HbA1c** (especialmente antes de GLP-1)
- **Eixo GH-IGF1: IGF-1, GH basal** (antes de secretagogos)
- **Perfil hepático e renal**
- **Painel hormonal completo** (testosterona, estrogênio, LH, FSH, TSH, T4)
- **PSA** (homens acima de 40 anos)
- **Exame de imagem** conforme indicação clínica

Peptídeos alteram marcadores laboratoriais de forma mensurável. Sem exames basais, é impossível avaliar resposta ou detectar efeitos adversos.
        `
      },
      {
        id: 'como-funciona-o-eixo-gh',
        titulo: 'O eixo GH-IGF-1',
        subtitulo: 'Entenda como o hormônio do crescimento é regulado e por que secretagogos são diferentes do GH exógeno',
        duracao: '5 min',
        conteudo: `
## A regulação fisiológica do GH

O hormônio do crescimento não é secretado de forma contínua — ele é liberado em pulsos, com o maior pico ocorrendo nas primeiras horas do sono profundo (fase N3). Esse padrão pulsátil é essencial para seus efeitos biológicos.

**O eixo completo**:
1. Hipotálamo secreta GHRH (estimulador) e somatostatina (inibidor)
2. GHRH alcança a hipófise anterior e estimula células somatotrópicas
3. GH é secretado em pulsos para a circulação
4. No fígado e tecidos periféricos, GH estimula produção de IGF-1
5. IGF-1 e GH elevados inibem o hipotálamo (feedback negativo)

## Por que secretagogos preservam esse eixo

Secretagogos como Ipamorelin e CJC-1295 agem **estimulando** a hipófise a produzir mais GH — eles não substituem o GH endógeno. Isso significa que:

- O feedback negativo permanece intacto
- A secreção permanece pulsátil (fisiológica)
- A hipófise não atrofia por desuso
- Os efeitos cessam quando o uso é interrompido

**Contraste com GH exógeno**: a administração direta de GH suprime o eixo hipotálamo-hipófise ao longo do tempo. Com uso crônico, a hipófise perde a capacidade de produzir GH adequadamente mesmo após a interrupção.

## IGF-1: o mediador dos efeitos anabólicos

A maioria dos efeitos anabólicos do GH é mediada pelo IGF-1 hepático. O IGF-1:
- Estimula síntese proteica muscular
- Promove captação de aminoácidos
- Estimula diferenciação de células satélites musculares
- Age em ossos, cartilagens e outros tecidos

**Monitoramento**: o IGF-1 é o marcador laboratorial padrão para avaliar resposta a secretagogos. Valores elevados crônicos (>350 ng/mL em adultos) indicam necessidade de redução de dose.

## Variáveis que afetam a resposta

- **Idade**: secreção de GH declina ~14% por década a partir dos 30 anos (somatopausa)
- **Composição corporal**: excesso de gordura visceral aumenta somatostatina, suprimindo GH
- **Sono**: privação de sono reduz drasticamente os pulsos noturnos de GH
- **Alimentação**: carboidratos e gorduras em excesso suprimem GH (insulina elevada)
- **Estresse**: cortisol elevado suprime o eixo GH
        `
      },
    ]
  },
  {
    id: 'emagrecimento',
    nivel: 'Iniciante',
    cor: '#D85A30',
    bg: '#FFF5F5',
    titulo: 'Peptídeos para Emagrecimento',
    descricao: 'Mecanismos de ação dos análogos GLP-1, GIP e fragmentos de GH para perda de gordura.',
    duracao: '~25 min de leitura',
    artigos: [
      {
        id: 'glp1-mecanismo',
        titulo: 'Como funcionam os análogos GLP-1',
        subtitulo: 'Semaglutida, Tirzepatida e o mecanismo central de saciedade e perda de gordura',
        duracao: '8 min',
        conteudo: `
## O GLP-1 endógeno

O GLP-1 (Glucagon-like Peptide-1) é uma incretina produzida pelas células L do intestino delgado em resposta à ingestão de alimentos. Sua meia-vida natural é de apenas **1-2 minutos**, pois é rapidamente degradado pela enzima DPP-4.

Os análogos sintéticos foram desenvolvidos para resistir a essa degradação, mantendo a atividade por horas (Liraglutida), dias (Semaglutida) ou semanas.

## Mecanismos de ação múltiplos

**1. Ação hipotalâmica (central — o mais importante para emagrecimento)**
O GLP-1 atravessa a barreira hematoencefálica e age diretamente em receptores GLP-1R no hipotálamo, especificamente nos neurônios POMC/CART do núcleo arqueado. Esses neurônios:
- Suprimem o apetite
- Aumentam a saciedade pós-prandial
- Reduzem o craving por alimentos hipercalóricos
- Diminuem a "recompensa" associada à comida (via sistema dopaminérgico)

**2. Esvaziamento gástrico retardado**
O GLP-1 inibe o esvaziamento gástrico, prolongando a sensação de plenitude após as refeições. Isso tem implicações clínicas importantes — pacientes que usam anestesia geral enquanto em uso de GLP-1 podem aspirar conteúdo gástrico mesmo em jejum padrão.

**3. Efeito insulinotrópico glicose-dependente**
Estimula secreção de insulina pelo pâncreas apenas quando a glicemia está elevada. Isso torna o risco de hipoglicemia muito baixo (diferente de sulfonilureias, que estimulam insulina independentemente da glicose).

**4. Inibição do glucagon**
Suprime a secreção de glucagon após refeições, reduzindo a produção hepática de glicose.

## Tirzepatida: a vantagem do duplo agonismo

A Tirzepatida age em dois receptores simultaneamente: GLP-1R e GIPR.

O GIP (Glucose-dependent Insulinotropic Polypeptide) é a outra incretina intestinal. Quando combinado ao GLP-1, produz:
- Maior redução de gordura visceral
- Melhora adicional de sensibilidade insulínica
- Efeito neurológico direto no sistema de recompensa alimentar
- Redução de lipotoxicidade hepática

Nos estudos SURMOUNT-1 (2022), a Tirzepatida produziu redução média de **22.5% do peso corporal** na dose máxima — o maior resultado já registrado para qualquer medicamento anti-obesidade.

## Perda de peso vs. perda de gordura

Um ponto crítico frequentemente ignorado: análogos GLP-1 causam perda de **massa total**, incluindo massa muscular. Em estudos com Semaglutida, aproximadamente 40% do peso perdido era massa magra.

Estratégias para preservar massa muscular durante uso de GLP-1:
- Ingestão proteica elevada (1.6-2.2g/kg/dia)
- Treinamento resistido regular
- Considerar associação com secretagogos de GH (protocolo avançado)

## Efeitos colaterais e manejo

Os efeitos gastrointestinais (náusea, vômito, constipação/diarreia) são dose-dependentes e tipicamente mais intensos no início. Protocolo de titulação lenta (4 semanas em cada dose) reduz significativamente a incidência.

Náusea severa responde a:
- Refeições menores e mais frequentes
- Evitar alimentos gordurosos e muito condimentados
- Zinco (30mg/dia) — evidência preliminar
- Gengibre
- Em casos severos: domperidona ou ondansetrona
        `
      },
      {
        id: 'aod-fragmento-gh',
        titulo: 'AOD-9604 e fragmentos do GH',
        subtitulo: 'Como o fragmento lipolítico do GH age sem os efeitos de crescimento',
        duracao: '4 min',
        conteudo: `
## A descoberta do fragmento lipolítico

O hormônio do crescimento tem dois domínios funcionais distintos:
- **Domínio N-terminal**: responsável pelos efeitos anabólicos (crescimento, síntese proteica, IGF-1)
- **Domínio C-terminal (aminoácidos 176-191)**: responsável pelos efeitos lipolíticos

O AOD-9604 é o fragmento C-terminal sintético que retém apenas as propriedades lipolíticas.

## Mecanismo de ação específico

O AOD-9604 liga-se a receptores específicos no tecido adiposo (não aos receptores de GH nos tecidos de crescimento), ativando:
- **Lipólise**: ativação de lipase sensível a hormônios (HSL) que quebra triglicerídeos em ácidos graxos livres
- **Inibição da lipogênese**: supressão da síntese de novos ácidos graxos a partir de carboidratos

**O que ele não faz** (diferente do GH completo):
- Não eleva IGF-1
- Não afeta glicemia ou sensibilidade insulínica
- Não estimula crescimento ósseo ou muscular
- Não suprime o eixo GH-IGF1

## Comparação com outros peptídeos de emagrecimento

| Peptídeo | Mecanismo | Efeito muscular | Efeito GH |
|----------|-----------|-----------------|-----------|
| AOD-9604 | Lipólise local | Neutro | Não afeta |
| Semaglutida | Saciedade central | Perda (40% do peso) | Não afeta |
| GH secretagogos | ↑ GH endógeno | Preserva/aumenta | Estimula |

## Combinação AOD-9604 + análogos GLP-1

Uma combinação racional para maximizar a perda de gordura enquanto preserva massa muscular:
- **Semaglutida ou Tirzepatida**: redução de apetite e ingestão calórica
- **AOD-9604**: acelera lipólise no tecido adiposo
- **Secretagogo de GH (Ipamorelin)**: preserva massa muscular e estimula GH

Esta combinação deve ser realizada sob supervisão médica rigorosa com monitoramento laboratorial.
        `
      },
    ]
  },
  {
    id: 'recuperacao',
    nivel: 'Intermediário',
    cor: '#2563EB',
    bg: '#EFF6FF',
    titulo: 'Recuperação e Reparo Tecidual',
    descricao: 'BPC-157, TB-500 e os mecanismos moleculares de regeneração de tecidos moles e articulações.',
    duracao: '~20 min de leitura',
    artigos: [
      {
        id: 'bpc157-mecanismo-profundo',
        titulo: 'BPC-157: mecanismo molecular detalhado',
        subtitulo: 'Como o pentadecapeptídeo gástrico age em múltiplos sistemas simultaneamente',
        duracao: '7 min',
        conteudo: `
## Origem e estrutura

O BPC-157 (Body Protection Compound-157) é um pentadecapeptídeo (15 aminoácidos) isolado do suco gástrico humano por Sikiric e colaboradores nos anos 1990. Sua sequência é: Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val.

A estabilidade incomum ao ácido gástrico (ao contrário da maioria dos peptídeos) é uma das características que torna o BPC-157 único.

## Mecanismos moleculares identificados

**1. Modulação do óxido nítrico (NO)**
O BPC-157 regula a produção de NO, que controla vasodilatação local, inflamação e cicatrização. Em tecidos isquêmicos, normaliza a produção de NO; em tecidos com excesso de NO (estados inflamatórios), reduz sua produção. Essa regulação bidirecional é uma das razões para seu amplo espectro de ação.

**2. Ativação de receptores de fatores de crescimento**
Upregulation de receptores para:
- EGF (Fator de Crescimento Epidérmico): acelera proliferação epitelial e cicatrização
- VEGF (Fator de Crescimento Vascular Endotelial): estimula angiogênese em tecidos lesados
- FGF (Fator de Crescimento de Fibroblastos): proliferação de fibroblastos e síntese de colágeno

**3. Proteção do trato gastrointestinal**
Protege a mucosa gástrica e intestinal via:
- Estimulação de síntese de muco
- Redução de infiltrado inflamatório
- Aceleração de cicatrização de úlceras
- Proteção hepática contra toxinas (incluindo álcool e AINEs)

**4. Modulação do sistema dopaminérgico**
O BPC-157 interfere com receptores dopaminérgicos, o que pode explicar efeitos observados em modelos de depressão, ansiedade e dependência. Esse mecanismo está sendo investigado em transtornos neuropsiquiátricos.

## Evidências em modelos animais vs. humanos

É fundamental distinguir:

**Evidências robustas (modelos animais)**: Dezenas de estudos peer-reviewed mostram regeneração acelerada de tendões, ligamentos, ossos, músculo, mucosa gástrica e nervos periféricos.

**Evidências em humanos**: Atualmente limitadas a estudos preliminares e relatos clínicos. Não há ensaios clínicos randomizados fase III em humanos. O BPC-157 é **pesquisa**, não medicamento aprovado.

Isso não invalida seu uso — mas exige honestidade intelectual sobre o nível de evidência disponível.

## Protocolo e considerações práticas

**Dose**: 250-500mcg/dia SC ou oral
**Frequência**: 1-2x ao dia
**Duração**: 4-12 semanas dependendo da condição
**Via oral**: adequada para condições gastrointestinais; SC para lesões sistêmicas ou ortopédicas

O BPC-157 não requer ciclos rígidos como peptídeos que suprimem eixos hormonais. Seu uso pode ser contínuo enquanto necessário, com interrupção gradual.
        `
      },
      {
        id: 'stacks-recuperacao',
        titulo: 'Stacks para recuperação: combinações racionais',
        subtitulo: 'Como combinar BPC-157, TB-500 e GHK-Cu com base em mecanismos complementares',
        duracao: '5 min',
        conteudo: `
## Princípio do stack: mecanismos complementares, não duplicados

Um stack eficaz combina peptídeos que agem em diferentes etapas do processo de recuperação, não aqueles que fazem a mesma coisa via mecanismos diferentes (adição) mas que atacam diferentes componentes da lesão (sinergia).

## Stack BPC-157 + TB-500: o mais estudado

**BPC-157** age principalmente via:
- Modulação de NO e angiogênese local
- Proteção e regeneração de tecido conjuntivo
- Reparo de tendões e ligamentos

**TB-500** age principalmente via:
- Regulação de actina e migração celular
- Diferenciação de células progenitoras para o local de lesão
- Redução de fibrose

Combinados, cobrem diferentes aspectos da cicatrização:
- BPC-157: ambiente molecular favorável + angiogênese
- TB-500: recrutamento e diferenciação celular + redução de cicatriz

**Protocolo típico de lesão aguda** (músculo, tendão, ligamento):
- BPC-157: 500mcg SC 1x ao dia por 4-8 semanas
- TB-500: 2mg SC 2x por semana nas primeiras 4 semanas, depois 2mg 1x por semana

## Adição do GHK-Cu

O GHK-Cu adiciona uma terceira camada:
- Síntese de colágeno (reorganização da matriz extracelular)
- Reparo do DNA em células lesadas
- Ação antioxidante local

Especialmente útil em lesões com dano tecidual extenso, pós-cirúrgico ou em protocolos de anti-aging associados à recuperação.

## Stack para lesões articulares

Para condropatias, artrose e lesões de cartilagem (tecido avascular com recuperação limitada):
- **BPC-157**: 500mcg SC ao redor da articulação 1x ao dia
- **GHK-Cu**: 1mg SC 1x ao dia
- **Consideração**: Peptídeos não regeneram cartilagem avançadamente destruída; são mais eficazes em lesões incipientes a moderadas.

## Contexto clínico: peptídeos como adjuvantes

Peptídeos de recuperação são mais eficazes quando associados a:
- **Fisioterapia progressiva**: carga mecânica adequada é essencial para remodelação do colágeno
- **Nutrição proteica**: 1.8-2.2g/kg/dia de proteína
- **Micronutrientes**: vitamina C, zinco e magnésio para síntese de colágeno
- **Sono adequado**: a maior parte da recuperação ocorre durante o sono profundo

Peptídeos aceleram o processo biológico — não substituem os pilares fundamentais da recuperação.
        `
      },
    ]
  },
  {
    id: 'longevidade',
    nivel: 'Avançado',
    cor: '#7C3AED',
    bg: '#F5F3FF',
    titulo: 'Longevidade e Anti-aging',
    descricao: 'Telômeros, peptídeos mitocondriais e as fronteiras da ciência do envelhecimento.',
    duracao: '~30 min de leitura',
    artigos: [
      {
        id: 'biologia-do-envelhecimento',
        titulo: 'Biologia do envelhecimento e os hallmarks',
        subtitulo: 'Os 12 marcadores moleculares do envelhecimento e onde os peptídeos interferem',
        duracao: '10 min',
        conteudo: `
## Os Hallmarks of Aging (López-Otín, 2023)

Em 2013, López-Otín e colaboradores publicaram o artigo mais citado na biologia do envelhecimento, identificando os "Hallmarks" — marcadores moleculares universais do envelhecimento. Uma atualização em 2023 expandiu a lista para 12:

**Grupo 1 — Causas primárias:**
1. Instabilidade genômica
2. Desgaste de telômeros
3. Alterações epigenéticas
4. Perda de proteostase

**Grupo 2 — Respostas compensatórias:**
5. Macroautofagia desregulada
6. Detecção nutricional deregulada (mTOR, AMPK, IGF-1)
7. Disfunção mitocondrial
8. Senescência celular

**Grupo 3 — Consequências integradas:**
9. Exaustão de células-tronco
10. Comunicação intercelular alterada
11. Disbiose microbiana crônica
12. Inflamação crônica de baixo grau (inflammaging)

## Onde os peptídeos interferem

**Epitalon → Telômeros (Hallmark 2)**
O Epitalon ativa a telomerase (TERT), enzima que alongar os telômeros. Telômeros encurtados ativam pontos de checagem do ciclo celular, levando à senescência ou apoptose. O Epitalon demonstrou, em cultura celular e modelos animais, capacidade de elongar telômeros e aumentar o número de divisões celulares possíveis.

**GHK-Cu → Epigenética e Proteostase (Hallmarks 3 e 4)**
O GHK-Cu regula a expressão de mais de 4.000 genes via mecanismos epigenéticos, incluindo genes de proteínas de choque térmico (HSPs) que são essenciais para a proteostase — o equilíbrio entre síntese, dobramento e degradação de proteínas.

**MOTS-c e Humanina → Disfunção mitocondrial (Hallmark 7)**
Esses peptídeos codificados pelo genoma mitocondrial (miPEPs) regulam a função mitocondrial, ativando AMPK e reduzindo estresse oxidativo. O declínio de MOTS-c com a idade correlaciona-se com piora da sensibilidade insulínica e capacidade aeróbica.

**Selank/Semax → Inflammaging (Hallmark 12)**
Modulam citocinas pró-inflamatórias (IL-6, TNF-α) e aumentam IL-10, contribuindo para redução da inflamação crônica de baixo grau associada ao envelhecimento.

## O problema da causalidade vs. correlação

Um ponto crítico: todos os estudos com peptídeos de longevidade demonstram correlações — peptídeos que reduzem marcadores de envelhecimento. Nenhum ensaio clínico demonstrou que qualquer intervenção peptídica aumenta a expectativa de vida humana.

A extrapolação de dados de animais para humanos deve ser feita com cautela:
- Camundongos envelhecem de forma biologicamente diferente de humanos
- A maioria dos estudos usa doses muito acima das usadas clinicamente
- O contexto genético e ambiental humano é infinitamente mais complexo

## Abordagem racional para longevidade

Uma abordagem baseada em evidências para longevidade peptídica inclui:

**Alta evidência**: GLP-1 análogos (reduzem risco cardiovascular, metabólico), GHK-Cu (anti-aging cutâneo bem documentado)

**Evidência moderada**: Epitalon (telomerase ativada in vitro e in vivo em animais), MOTS-c (metabolismo mitocondrial em humanos — estudos iniciais)

**Evidência preliminar/especulativa**: Humanina, P21, Kisspeptina para longevidade

**Fundamentos insubstituíveis** (evidência massiva):
- Restrição calórica moderada
- Exercício aeróbico e resistido
- Sono 7-9 horas por noite
- Ausência de tabagismo
- Controle de estresse
        `
      },
    ]
  },
];

// ─── Componente principal ─────────────────────────────
export default function SectionEducacao({ answers, onNavigate }: any) {
  const [moduloAtivo, setModuloAtivo] = useState<string | null>(null);
  const [artigoAtivo, setArtigoAtivo] = useState<any | null>(null);

  const modulo = MODULOS.find(m => m.id === moduloAtivo);

  // ─ View: artigo aberto ─
  if (artigoAtivo && modulo) {
    return (
      <div style={{ maxWidth: 740 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem', fontSize: 13, color: '#9CA3AF' }}>
          <button onClick={() => { setArtigoAtivo(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontFamily: 'inherit', fontSize: 13, padding: 0 }}>
            ← Voltar
          </button>
          <span>/</span>
          <span style={{ color: modulo.cor }}>{modulo.titulo}</span>
          <span>/</span>
          <span style={{ color: '#111827', fontWeight: 500 }}>{artigoAtivo.titulo}</span>
        </div>

        {/* Header do artigo */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, background: modulo.bg, color: modulo.cor }}>
              {modulo.nivel}
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>⏱ {artigoAtivo.duracao} de leitura</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827', letterSpacing: '-.04em', margin: '0 0 8px' }}>
            {artigoAtivo.titulo}
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{artigoAtivo.subtitulo}</p>
        </div>

        {/* Conteúdo do artigo — renderiza markdown simplificado */}
        <div style={{ background: 'white', borderRadius: 16, padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)' }}>
          {artigoAtivo.conteudo.trim().split('\n').map((linha: string, i: number) => {
            if (linha.startsWith('## ')) return (
              <h2 key={i} style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '2rem 0 .75rem', letterSpacing: '-.03em', borderBottom: '2px solid #F3F4F6', paddingBottom: '.5rem' }}>
                {linha.replace('## ', '')}
              </h2>
            );
            if (linha.startsWith('**') && linha.endsWith('**')) return (
              <p key={i} style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '1rem 0 .25rem' }}>
                {linha.replace(/\*\*/g, '')}
              </p>
            );
            if (linha.startsWith('- ')) return (
              <div key={i} style={{ display: 'flex', gap: 10, margin: '.4rem 0', fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                <span style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 2 }}>•</span>
                <span dangerouslySetInnerHTML={{ __html: linha.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            );
            if (linha.startsWith('| ')) return (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 12, background: '#F9FAFB', padding: '4px 8px', color: '#374151' }}>
                {linha}
              </div>
            );
            if (linha === '') return <div key={i} style={{ height: 8 }} />;
            return (
              <p key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '.5rem 0' }}
                dangerouslySetInnerHTML={{ __html: linha.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            );
          })}
        </div>

        {/* Navegar para biblioteca */}
        <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#F0FDF4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F6E56', marginBottom: 2 }}>Quer ver as fichas completas?</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>A Biblioteca tem dados detalhados de cada peptídeo mencionado</div>
          </div>
          <button onClick={() => onNavigate && onNavigate('lib')}
            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#0F6E56', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Ir para Biblioteca →
          </button>
        </div>
      </div>
    );
  }

  // ─ View: lista de artigos do módulo ─
  if (moduloAtivo && modulo) {
    return (
      <div style={{ maxWidth: 740 }}>
        <button onClick={() => setModuloAtivo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontFamily: 'inherit', fontSize: 13, padding: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Todos os módulos
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: modulo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {modulo.nivel === 'Iniciante' ? '📗' : modulo.nivel === 'Intermediário' ? '📘' : '📕'}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: modulo.cor, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{modulo.nivel}</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-.04em' }}>{modulo.titulo}</h2>
          </div>
        </div>

        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: '1.5rem' }}>{modulo.descricao}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modulo.artigos.map((artigo, i) => (
            <button key={artigo.id} onClick={() => setArtigoAtivo(artigo)}
              style={{ background: 'white', borderRadius: 14, padding: '1.25rem 1.5rem', border: '1px solid #E5E7EB', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'box-shadow .15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: modulo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, fontWeight: 700, color: modulo.cor }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 3 }}>{artigo.titulo}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{artigo.subtitulo}</div>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', whiteSpace: 'nowrap', flexShrink: 0 }}>⏱ {artigo.duracao}</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─ View: lista de módulos ─
  return (
    <div style={{ maxWidth: 740 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-.04em', margin: '0 0 6px' }}>Centro de Conhecimento</h2>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          Conteúdo científico estruturado sobre peptídeos — do básico ao avançado, baseado em literatura peer-reviewed.
        </p>
      </div>

      {/* Aviso científico */}
      <div style={{ background: '#FEF3C7', borderRadius: 12, padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.6 }}>
          O conteúdo desta plataforma é <strong>educativo e informativo</strong>. Não constitui prescrição médica. O uso de peptídeos deve ser supervisionado por um profissional de saúde habilitado.
        </p>
      </div>

      {/* Módulos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MODULOS.map(modulo => (
          <button key={modulo.id} onClick={() => setModuloAtivo(modulo.id)}
            style={{ background: 'white', borderRadius: 16, padding: '1.5rem', border: '1px solid #E5E7EB', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)'; e.currentTarget.style.borderColor = modulo.cor; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: modulo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {modulo.nivel === 'Iniciante' ? '📗' : modulo.nivel === 'Intermediário' ? '📘' : '📕'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 100, background: modulo.bg, color: modulo.cor }}>
                  {modulo.nivel}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{modulo.artigos.length} artigos · {modulo.duracao}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4, letterSpacing: '-.02em' }}>{modulo.titulo}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{modulo.descricao}</div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" style={{ flexShrink: 0, marginTop: 4 }}>
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Link para biblioteca */}
      <div style={{ marginTop: '1.5rem', background: '#111827', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>Biblioteca de Peptídeos</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Fichas completas com doses, estudos e contraindicações</div>
        </div>
        <button onClick={() => onNavigate && onNavigate('lib')}
          style={{ padding: '10px 20px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,.2)', background: 'transparent', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Explorar →
        </button>
      </div>
    </div>
  );
}
