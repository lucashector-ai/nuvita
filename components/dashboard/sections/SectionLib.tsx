// @ts-nocheck
'use client';

import { useState } from 'react';

interface Peptideo {
  id: string;
  nome: string;
  emoji: string;
  categoria: string;
  tagline: string;
  mecanismo: string;
  beneficios: string[];
  protocolo: { dose: string; freq: string; via: string; timing: string; ciclo: string; pausa: string };
  contraindicacoes: string[];
  interacoes: string[];
  evidencias: string;
  faq: Array<{ p: string; r: string }>;
  nivel: 'iniciante'|'intermediario'|'avancado';
  cor: string;
  bg: string;
}

const PEPTIDEOS: Peptideo[] = [
  {
    id:'sema', nome:'Semaglutide', emoji:'🔥', categoria:'GLP-1 Agonista', tagline:'O peptídeo mais estudado para perda de gordura',
    nivel:'intermediario', cor:'#1D9E75', bg:'#E1F5EE',
    mecanismo:'O Semaglutide é um análogo do GLP-1 (glucagon-like peptide-1), hormônio intestinal que regula o apetite e a glicemia. Liga-se aos receptores GLP-1 no hipotálamo, reduzindo a fome e aumentando a saciedade. Também retarda o esvaziamento gástrico e melhora a sensibilidade à insulina.',
    beneficios:['Redução significativa do apetite e da ingestão calórica','Perda de peso sustentada (média de 10–15% em estudos clínicos)','Melhora da glicemia e resistência à insulina','Redução do risco cardiovascular','Preservação de massa muscular quando combinado com treino'],
    protocolo:{ dose:'0.25 mg/semana (início) → 0.5–1 mg/semana (manutenção)', freq:'1x por semana, mesmo dia', via:'SC — abdômen, coxa ou braço', timing:'Qualquer horário, com ou sem alimento', ciclo:'12–24 semanas', pausa:'4–8 semanas entre ciclos' },
    contraindicacoes:['Histórico pessoal ou familiar de carcinoma medular da tireoide','Neoplasia endócrina múltipla tipo 2 (NEM2)','Pancreatite aguda','Gravidez e amamentação','Hipersensibilidade conhecida ao Semaglutide'],
    interacoes:['Insulina: risco de hipoglicemia — ajuste de dose necessário','Metformina: potencializa controle glicêmico','Anticoagulantes orais: monitorar INR','Medicamentos de absorção lenta: pode alterar biodisponibilidade'],
    evidencias:'Estudos STEP 1–4 demonstraram perda média de 14,9% do peso corporal em 68 semanas. Aprovado pela FDA e ANVISA para obesidade (Ozempic® e Wegovy®). Meta-análises confirmam superioridade vs placebo e outros GLP-1.',
    faq:[
      { p:'Posso usar sem dieta?', r:'O Semaglutide reduz o apetite, mas os resultados são significativamente maiores com dieta equilibrada. Sem mudança alimentar, a perda de peso ainda ocorre mas em menor escala.' },
      { p:'Quando começar a sentir efeitos?', r:'Redução do apetite geralmente ocorre na 1ª semana. Perda de peso visível costuma aparecer após 4–6 semanas.' },
      { p:'Posso parar abruptamente?', r:'Não é recomendado. A saída gradual (redução da dose) minimiza o risco de rebound. Mantenha hábitos alimentares saudáveis após a descontinuação.' },
    ],
  },
  {
    id:'aod', nome:'AOD-9604', emoji:'🏃', categoria:'Fragmento do GH', tagline:'Queima gordura sem os efeitos do HGH completo',
    nivel:'iniciante', cor:'#378ADD', bg:'#E6F1FB',
    mecanismo:'AOD-9604 é um fragmento sintético da extremidade C-terminal do hormônio do crescimento humano (hGH), especificamente os aminoácidos 176–191. Estimula a lipólise (quebra de gordura) e inibe a lipogênese (formação de nova gordura) sem os efeitos sobre crescimento ou glicemia do HGH completo. Age diretamente nos adipócitos via receptores beta-3 adrenérgicos.',
    beneficios:['Lipólise direcionada, especialmente gordura visceral e abdominal','Não eleva IGF-1 nem glicemia — perfil de segurança superior ao HGH','Não causa resistência à insulina','Pode melhorar a regeneração de cartilagem (estudos em andamento)','Bem tolerado e sem efeitos sobre crescimento ósseo em adultos'],
    protocolo:{ dose:'300–600 mcg/dia', freq:'Diário ou 5x/semana', via:'SC — abdômen em jejum', timing:'Manhã em jejum de 30–60 min antes do café', ciclo:'8–12 semanas', pausa:'4–6 semanas' },
    contraindicacoes:['Câncer ativo (estimula lipólise, impacto em células tumorais não totalmente estudado)','Gravidez','Hipersensibilidade a fragmentos peptídicos'],
    interacoes:['Insulina: aplicar com intervalo mínimo de 30 min','Outros secretagogos de GH: efeito aditivo na lipólise'],
    evidencias:'Estudos pré-clínicos e de fase I/II demonstraram eficácia em redução de gordura sem impacto no IGF-1 ou glicemia. Não aprovado como medicamento, mas amplamente estudado. Dados publicados na revista Obesity (2001) e outros.',
    faq:[
      { p:'É diferente do HGH?', r:'Sim. AOD-9604 é apenas o fragmento responsável pelo efeito lipolítico do HGH, sem os efeitos de crescimento, retenção de água ou impacto na glicemia.' },
      { p:'Posso combinar com Semaglutide?', r:'Sim. A combinação é sinérgica — Semaglutide reduz o apetite e AOD-9604 acelera a queima de gordura armazenada.' },
    ],
  },
  {
    id:'ipa', nome:'Ipamorelin', emoji:'🌙', categoria:'Secretagogo de GH', tagline:'Estimula o GH natural com mínimos efeitos colaterais',
    nivel:'iniciante', cor:'#7F77DD', bg:'#EEEDFE',
    mecanismo:'Ipamorelin é um peptídeo secretagogo seletivo do GH (Growth Hormone Releasing Peptide — GHRP). Estimula a glândula pituitária a liberar pulsos fisiológicos de GH sem elevar cortisol, prolactina ou ACTH — diferencial importante vs outros GHRPs. O aumento do GH ocorre em pulsos naturais, semelhantes ao padrão fisiológico noturno.',
    beneficios:['Melhora significativa da qualidade do sono (especialmente sono profundo/ondas lentas)','Aumento de GH fisiológico sem supressão do eixo HPA','Recuperação muscular acelerada','Auxílio na perda de gordura (via GH)','Anti-aging — melhora da pele e composição corporal','Sem aumento de fome (diferente de GHRP-6)'],
    protocolo:{ dose:'200–300 mcg por dose', freq:'1–2x ao dia (noite é essencial)', via:'SC', timing:'Antes de dormir em jejum de 2h (pico de GH noturno); pode adicionar dose matinal em jejum', ciclo:'12–16 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Tumores dependentes de GH ou IGF-1','Retinopatia diabética','Gravidez','Síndrome de Prader-Willi'],
    interacoes:['CJC-1295: combinação clássica que amplifica e prolonga o pulso de GH','Somatostatina: antagonismo fisiológico (evitar uso conjunto)','Insulina: aplicar com intervalo de 30 min'],
    evidencias:'Estudos em humanos demonstraram aumento dose-dependente de GH sem elevação de cortisol ou prolactina. Estudos de sono mostram aumento do sono de ondas lentas (SWS). Literatura publicada em journals de endocrinologia e medicina do esporte.',
    faq:[
      { p:'Por que usar antes de dormir?', r:'O maior pulso natural de GH ocorre nas primeiras horas de sono. O Ipamorelin amplifica esse pulso fisiológico, maximizando o efeito com a dose noturna.' },
      { p:'Causa dependência?', r:'Não causa dependência. Após a pausa, o eixo HPA retorna ao funcionamento normal. Não há supressão do GH endógeno a longo prazo com uso responsável.' },
    ],
  },
  {
    id:'bpc', nome:'BPC-157', emoji:'🔄', categoria:'Peptídeo de Recuperação', tagline:'Regeneração de tecidos e recuperação acelerada',
    nivel:'iniciante', cor:'#EF9F27', bg:'#FAEEDA',
    mecanismo:'BPC-157 (Body Protection Compound 157) é um pentadecapeptídeo derivado de uma proteína de proteção gástrica humana. Estimula a angiogênese (formação de novos vasos), upregula fatores de crescimento (VEGF, EGF), reduz inflamação via inibição de NF-kB e promove a migração de fibroblastos para reparação tecidual.',
    beneficios:['Cicatrização acelerada de tendões, ligamentos e músculos','Proteção e regeneração da mucosa gástrica e intestinal','Ação anti-inflamatória sistêmica','Neuroproteção (em modelos animais)','Melhora da mobilidade articular','Potencial na síndrome do intestino permeável'],
    protocolo:{ dose:'250–500 mcg/dia', freq:'1–2x ao dia', via:'SC próximo à área lesionada; oral para efeito sistêmico/GI', timing:'Manhã e/ou noite — não requer jejum', ciclo:'4–8 semanas', pausa:'2–4 semanas' },
    contraindicacoes:['Câncer ativo (promove angiogênese, pode estimular crescimento tumoral)','Gravidez','Uso em crianças (falta de dados)'],
    interacoes:['AINEs: pode potencializar proteção gástrica','Warfarina: monitorar — pode alterar coagulação','Corticosteroides: uso conjunto pode reduzir eficácia'],
    evidencias:'Mais de 300 estudos pré-clínicos demonstram eficácia em modelos de lesão. Estudos em humanos limitados, mas dados de segurança favoráveis. Sem efeitos tóxicos observados em doses terapêuticas em modelos animais.',
    faq:[
      { p:'Pode ser tomado por via oral?', r:'Sim. A via oral é eficaz para efeitos sistêmicos e gastrointestinais. Para lesões localizadas, a aplicação subcutânea próxima à área é mais direcionada.' },
      { p:'Quanto tempo para sentir efeito em lesões?', r:'Para lesões agudas, melhoras podem ser percebidas em 1–2 semanas. Para condições crônicas, 4–6 semanas são necessárias para resultados consistentes.' },
    ],
  },
  {
    id:'semax', nome:'Semax', emoji:'🧠', categoria:'Nootrópico Peptídico', tagline:'Performance cognitiva e neuroproteção',
    nivel:'intermediario', cor:'#D85A30', bg:'#FAECE7',
    mecanismo:'Semax é um heptapeptídeo sintético derivado do ACTH (hormônio adrenocorticotrófico). Estimula a produção de BDNF (fator neurotrófico derivado do cérebro), aumenta a neurotransmissão dopaminérgica e serotonérgica, e melhora o fluxo cerebral. Desenvolvido originalmente na Rússia para tratamento de AVC e déficits cognitivos.',
    beneficios:['Melhora do foco, memória de trabalho e velocidade de processamento','Aumento do BDNF — suporte à neuroplasticidade','Redução do estresse oxidativo cerebral','Ação ansiolítica em doses moderadas','Potencial neuroprotetor em lesões cerebrais','Melhora da motivação e clareza mental'],
    protocolo:{ dose:'300–600 mcg/dia', freq:'5x/semana (ciclado)', via:'Intranasal (spray) — mais biodisponível que SC', timing:'Manhã, em jejum ou com alimento leve', ciclo:'4–8 semanas', pausa:'2–4 semanas (evitar tolerância)' },
    contraindicacoes:['Epilepsia ou histórico de convulsões (pode abaixar limiar)','Transtorno bipolar (estimulação dopaminérgica pode desestabilizar)','Gravidez','Uso em crianças'],
    interacoes:['Estimulantes (cafeína, modafinil): potencialização — cuidado com ansiedade','Antidepressivos serotoninérgicos: monitorar síndrome serotoninérgica','Benzodiazepínicos: pode reduzir eficácia ansiolítica'],
    evidencias:'Aprovado na Rússia como medicamento para AVC e doenças cognitivas. Múltiplos estudos clínicos russos com resultados positivos. Crescente pesquisa ocidental sobre BDNF e neuroproteção.',
    faq:[
      { p:'Por que via intranasal?', r:'A via intranasal permite acesso direto ao sistema nervoso central via nervo olfatório, aumentando significativamente a biodisponibilidade comparada à via SC.' },
      { p:'Causa dependência ou tolerância?', r:'Não causa dependência farmacológica. Tolerância pode ocorrer com uso contínuo — por isso o protocolo ciclado (5x/semana com pausas semanais e ciclos de 4–8 semanas) é recomendado.' },
    ],
  },
  {
    id:'cjc', nome:'CJC-1295', emoji:'⚡', categoria:'GHRH Análogo', tagline:'Eleva o GH basal e prolonga seus efeitos',
    nivel:'avancado', cor:'#639922', bg:'#EAF3DE',
    mecanismo:'CJC-1295 é um análogo sintético do GHRH (Growth Hormone Releasing Hormone) com meia-vida prolongada graças à tecnologia DAC (Drug Affinity Complex). Estimula a pituitária a produzir mais GH de forma sustentada, ao contrário dos GHRPs que agem em pulsos. A versão sem DAC (CJC-1295 no DAC) age de forma mais pulsátil e é frequentemente combinada com Ipamorelin.',
    beneficios:['Aumento sustentado dos níveis basais de GH e IGF-1','Melhora da composição corporal (massa magra vs gordura)','Recuperação muscular acelerada','Anti-aging — melhora da pele, cabelo e ossos','Efeito sinérgico poderoso quando combinado com Ipamorelin'],
    protocolo:{ dose:'100–200 mcg/dose (sem DAC) ou 1–2 mg/semana (com DAC)', freq:'2–3x/semana (com DAC) ou diário (sem DAC)', via:'SC', timing:'Em jejum, preferencialmente à noite', ciclo:'12–16 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Acromegalia ativa ou histórico','Câncer dependente de IGF-1','Retinopatia diabética','Síndrome do túnel do carpo severa'],
    interacoes:['Ipamorelin: combinação clássica e sinérgica (GHRH + GHRP)','Insulina: aplicar com 30 min de intervalo','Glicocorticoides: reduzem resposta ao GH'],
    evidencias:'Estudos clínicos demonstram aumento de GH e IGF-1 de 2–10x com CJC-1295 DAC. Publicações em JCEM e outros periódicos de endocrinologia confirmam farmacocinética favorável.',
    faq:[
      { p:'Qual a diferença entre com e sem DAC?', r:'Com DAC: meia-vida de ~8 dias, usado 2x/semana, eleva GH de forma mais constante. Sem DAC: meia-vida curta (~30 min), usado diariamente, perfil mais pulsátil e fisiológico.' },
    ],
  },
  {
    id:'mk677', nome:'MK-677 (Ibutamoren)', emoji:'💊', categoria:'Secretagogo Oral de GH', tagline:'O único secretagogo de GH ativo por via oral',
    nivel:'intermediario', cor:'#533AB7', bg:'#EEEDFE',
    mecanismo:'MK-677 é um agonista não-peptídico do receptor de ghrelina (GHS-R1a), que mimetiza o efeito da ghrelina na pituitária, estimulando a liberação de GH de forma sustentada. Por ser oralmente biodisponível, é único em sua classe. Aumenta IGF-1 significativamente e prolonga os pulsos de GH sem necessidade de injeção.',
    beneficios:['Administração oral — sem necessidade de injeção','Aumento significativo de GH e IGF-1','Melhora dramática da qualidade e duração do sono','Aumento de massa muscular e força','Redução de gordura corporal (longo prazo)','Melhora da densidade óssea'],
    protocolo:{ dose:'10–25 mg/dia', freq:'1x/dia', via:'Oral (comprimido ou pó)','timing':'À noite antes de dormir (sincroniza com pulso noturno de GH)', ciclo:'16–24 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Resistência à insulina severa ou diabetes tipo 2 mal controlado (aumenta glicemia)','Câncer ativo (eleva IGF-1 significativamente)','Retenção de líquidos severa ou insuficiência cardíaca','Síndrome de Prader-Willi'],
    interacoes:['Insulina: pode elevar glicemia — ajuste necessário','Anticonvulsivantes: interação farmacocinética possível','Ciclosporina: inibição do CYP3A4 pode elevar MK-677'],
    evidencias:'Múltiplos ensaios clínicos fase II demonstraram aumento de IGF-1 em 40–90% e GH em 3–5x. Estudos de 2 anos mostraram segurança em idosos. Publicações no NEJM, JCEM e outros.',
    faq:[
      { p:'Causa fome aumentada?', r:'Sim. O MK-677 estimula receptores de ghrelina (hormônio da fome). Isso pode ser desejável para ganho de massa, mas deve ser considerado em protocolos de perda de gordura.' },
      { p:'Retenção de água é normal?', r:'Sim, especialmente nas primeiras 2–4 semanas. Geralmente se reduz com o tempo. Monitorar pressão arterial e edemas.' },
    ],
  },
  {
    id:'tb500', nome:'TB-500', emoji:'🛡️', categoria:'Peptídeo de Recuperação', tagline:'Regeneração sistêmica e flexibilidade tecidual',
    nivel:'intermediario', cor:'#185FA5', bg:'#E6F1FB',
    mecanismo:'TB-500 é a versão sintética da Timosina Beta-4, proteína presente em quase todas as células humanas. Regula a actina (proteína estrutural celular), reduz inflamação, estimula a diferenciação celular e promove a migração de células-tronco para tecidos lesionados. Tem ampla biodistribuição sistêmica.',
    beneficios:['Recuperação acelerada de lesões musculares e tendíneas','Redução de fibrose e cicatrizes internas','Melhora da flexibilidade e mobilidade','Ação anti-inflamatória sistêmica potente','Potencial cardioprotetor (estudos em andamento)','Regeneração de cabelo em algumas condições'],
    protocolo:{ dose:'2–2.5 mg por dose', freq:'2x/semana (fase aguda) → 1x/semana (manutenção)', via:'SC ou IM', timing:'Sem restrição de horário ou jejum', ciclo:'4–6 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Câncer ativo (estimula crescimento e migração celular)','Histórico de crescimento tumoral acelerado','Gravidez','Doenças autoimunes ativas (pode estimular sistema imune)'],
    interacoes:['BPC-157: combinação sinérgica para recuperação (mecanismos complementares)','Corticosteroides: podem reduzir eficácia anti-inflamatória'],
    evidencias:'Ampla literatura pré-clínica. Estudos clínicos em fase II para cardiomiopatia isquêmica (regeneração cardíaca). Timosina Beta-4 endógena amplamente estudada em biologia celular.',
    faq:[
      { p:'TB-500 é o mesmo que Timosina Beta-4?', r:'TB-500 é um fragmento ativo da Timosina Beta-4 (aminoácidos 17–23), responsável pelos efeitos reparadores. É mais estável e acessível que a Timosina Beta-4 completa.' },
    ],
  },
  {
    id:'epitalon', nome:'Epitalon', emoji:'⏳', categoria:'Peptídeo Anti-aging', tagline:'Ativação da telomerase e longevidade celular',
    nivel:'avancado', cor:'#D4537E', bg:'#FBEAF0',
    mecanismo:'Epitalon (Epithalon) é um tetrapeptídeo (Ala-Glu-Asp-Gly) derivado da epitalamina, substância produzida pela glândula pineal. Seu principal mecanismo é a ativação da telomerase, enzima que mantém o comprimento dos telômeros (estruturas protetoras das extremidades dos cromossomos que encurtam com o envelhecimento). Também regula a melatonina e o ritmo circadiano.',
    beneficios:['Ativação da telomerase — potencial antienvelhecimento celular','Regulação do ritmo circadiano e melhora do sono','Antioxidante — redução do estresse oxidativo','Melhora da imunidade em idosos (estudos russos)','Potencial redução do risco oncológico em longo prazo','Regeneração da retina (estudos em modelos animais)'],
    protocolo:{ dose:'5–10 mg/dia', freq:'Diário por 10–20 dias (ciclo concentrado)', via:'SC', timing:'À noite', ciclo:'10–20 dias, 2–3x por ano', pausa:'3–4 meses entre ciclos' },
    contraindicacoes:['Câncer ativo (ativa crescimento celular)', 'Gravidez', 'Doenças autoimunes em atividade', 'Uso em menores de 40 anos (dados insuficientes)'],
    interacoes:['Melatonina: efeito aditivo no sono e circadiano','Antioxidantes: ação complementar'],
    evidencias:'Pesquisa extensa do Instituto de Gerontologia de São Petersburgo (Rússia). Estudos de 15 anos com humanos mostraram redução da mortalidade. Publicações em journals russos e alguns ocidentais sobre telomerase.',
    faq:[
      { p:'Por que ciclos curtos e concentrados?', r:'O Epitalon funciona por picos de exposição, não por uso contínuo. Ciclos de 10–20 dias 2–3x/ano mimicam o ritmo fisiológico da epitalamina endógena.' },
    ],
  },
  {
    id:'ghk', nome:'GHK-Cu', emoji:'✨', categoria:'Peptídeo Anti-aging / Pele', tagline:'Regeneração cutânea e estimulação de colágeno',
    nivel:'iniciante', cor:'#BA7517', bg:'#FAEEDA',
    mecanismo:'GHK-Cu (Glycyl-L-Histidyl-L-Lysine-Copper) é um peptídeo de cobre naturalmente presente no plasma humano que declina com a idade. Estimula a síntese de colágeno e elastina, ativa genes de reparação celular (mais de 4.000 genes regulados segundo estudos recentes), tem potente ação antioxidante e anti-inflamatória, e promove angiogênese local.',
    beneficios:['Regeneração e firmeza da pele (colágeno e elastina)','Redução de rugas e melhora da textura cutânea','Cicatrização de feridas acelerada','Estimulação do crescimento capilar','Ação antioxidante sistêmica','Potencial neuroprotetor (regulação gênica)'],
    protocolo:{ dose:'1–2 mg/dia (SC) ou uso tópico', freq:'Diário ou em dias alternados', via:'SC ou tópico (solução 0,1–1%)', timing:'Manhã ou noite, sem restrição', ciclo:'8–12 semanas', pausa:'4 semanas' },
    contraindicacoes:['Hemocromatose (sobrecarga de cobre)', 'Doença de Wilson', 'Gravidez', 'Hipersensibilidade ao cobre'],
    interacoes:['Zinco em alta dose: competição de absorção — separar por 2h','Vitamina C: potencializa síntese de colágeno de forma sinérgica'],
    evidencias:'Mais de 50 estudos publicados sobre regeneração cutânea e capilar. Estudos genômicos (Pickart et al.) documentam regulação de >4.000 genes humanos. Amplamente usado em cosméticos médicos.',
    faq:[
      { p:'Via tópica é eficaz?', r:'Sim para efeitos cutâneos locais. A via SC tem maior biodisponibilidade sistêmica. Para anti-aging geral, SC é preferida; para efeito focado na pele/cabelo, o tópico tem bons resultados.' },
    ],
  },
  {
    id:'igf', nome:'IGF-1 LR3', emoji:'💪', categoria:'Fator de Crescimento', tagline:'Crescimento muscular e recuperação avançados',
    nivel:'avancado', cor:'#0F6E56', bg:'#E1F5EE',
    mecanismo:'IGF-1 LR3 (Insulin-like Growth Factor-1 Long R3) é uma variante modificada do IGF-1 com meia-vida prolongada de ~20h (vs 5–10min do IGF-1 nativo) graças a uma substituição de aminoácidos que reduz a ligação às proteínas de transporte (IGFBPs). Estimula proliferação e diferenciação de células musculares (mioblastos), ativa mTOR e síntese proteica, e tem efeito hipoglicemiante significativo.',
    beneficios:['Hipertrofia muscular potente (ativação direta de células satélite)','Recuperação muscular muito acelerada','Redução de gordura corporal','Melhora da síntese proteica pós-treino','Potencial terapêutico em deficiências de GH/IGF-1'],
    protocolo:{ dose:'20–100 mcg/dia (começar com 20 mcg)', freq:'Diário ou pós-treino', via:'SC ou IM', timing:'Pós-treino (dentro de 30 min) — requer carboidrato junto para evitar hipoglicemia', ciclo:'4–6 semanas', pausa:'8–12 semanas (receptor downregulation)' },
    contraindicacoes:['Câncer ativo ou histórico (potente mitogênico)', 'Diabetes descompensado', 'Retinopatia diabética', 'Acromegalia', 'Tumores dependentes de IGF-1'],
    interacoes:['Insulina: risco grave de hipoglicemia — não usar juntos sem monitoramento', 'HGH/GH: sinergia mas risco de hipoglicemia aumentado', 'Glicose: ter à mão durante o uso'],
    evidencias:'IGF-1 endógeno amplamente estudado. IGF-1 LR3 tem estudos em modelos animais e uso clínico em pesquisa. Risco de hipoglicemia documentado — monitoramento de glicemia obrigatório.',
    faq:[
      { p:'Por que a pausa longa entre ciclos?', r:'O IGF-1 LR3 causa downregulation (redução) dos receptores de IGF-1 com uso prolongado. A pausa de 8–12 semanas restaura a sensibilidade dos receptores e evita resistência.' },
    ],
  },
  {
    id:'dsip', nome:'DSIP', emoji:'😴', categoria:'Peptídeo do Sono', tagline:'Melhora profunda do sono e redução do cortisol',
    nivel:'intermediario', cor:'#7F77DD', bg:'#EEEDFE',
    mecanismo:'DSIP (Delta Sleep-Inducing Peptide) é um nonapeptídeo que modula o sono de ondas lentas (delta sleep), reduz os níveis de cortisol e ACTH, e tem propriedades antistressoras. Age no hipotálamo regulando os ritmos circadianos e melhorando a arquitetura do sono sem causar sedação farmacológica.',
    beneficios:['Indução e manutenção do sono profundo (ondas delta)', 'Redução do cortisol noturno', 'Melhora da arquitetura geral do sono', 'Ação antistressora e ansiolítica', 'Potencial na síndrome do burnout e estresse crônico', 'Sem sedação ou ressaca matinal'],
    protocolo:{ dose:'200–400 mcg/dose', freq:'3–5x/semana (não diário)', via:'SC ou IV (pesquisa)', timing:'30–60 min antes de dormir', ciclo:'4–6 semanas', pausa:'2–4 semanas' },
    contraindicacoes:['Hipersensibilidade ao peptídeo', 'Gravidez', 'Apneia do sono severa não tratada (dados insuficientes)'],
    interacoes:['Benzodiazepínicos: potencialização sedativa', 'Melatonina: efeito aditivo — reduzir doses de ambos', 'Álcool: evitar — potencialização imprevisível'],
    evidencias:'Isolado originalmente em coelhos durante sono delta. Estudos humanos limitados mas promissores. Pesquisa soviética/russa extensa nas décadas de 1970–90. Literatura crescente em cronobiologia.',
    faq:[
      { p:'É diferente da melatonina?', r:'Sim. A melatonina regula o ritmo circadiano (horário do sono). O DSIP melhora a qualidade e profundidade do sono, especialmente a fase delta, sem depender de escuridão ou horário específico.' },
    ],
  },
  {
    id:'selank', nome:'Selank', emoji:'🧘', categoria:'Ansiolítico Peptídico', tagline:'Ansiedade e estresse sem sedação ou dependência',
    nivel:'intermediario', cor:'#533AB7', bg:'#EEEDFE',
    mecanismo:'Selank é um heptapeptídeo análogo da tuftosina com propriedades ansiolíticas e nootrópicas. Modula o sistema GABAérgico (sem se ligar diretamente ao receptor GABA-A como os benzodiazepínicos), eleva os níveis de BDNF, regula a expressão de genes relacionados à serotonina e dopamina, e tem efeito imunomodulador.',
    beneficios:['Redução da ansiedade sem sedação ou comprometimento cognitivo', 'Melhora do humor e estabilidade emocional', 'Aumento do BDNF — neuroproteção', 'Sem síndrome de abstinência ou dependência', 'Imunomodulação — fortalecimento imunológico', 'Melhora do foco em estados de estresse'],
    protocolo:{ dose:'250–500 mcg/dose', freq:'1–2x/dia em dias de estresse ou ciclos de 5x/semana', via:'Intranasal (spray)', timing:'Manhã ou conforme necessidade', ciclo:'4–8 semanas', pausa:'2–4 semanas' },
    contraindicacoes:['Transtorno bipolar sem controle (pode desestabilizar)', 'Esquizofrenia', 'Gravidez', 'Uso em crianças'],
    interacoes:['Ansiolíticos (benzodiazepínicos): potencialização — reduzir dose', 'Antidepressivos: monitorar interação serotoninérgica', 'Álcool: evitar — efeito imprevisível'],
    evidencias:'Aprovado na Rússia como ansiolítico (Selank®). Múltiplos estudos clínicos russos. Pesquisa ocidental crescente sobre peptídeos ansiolíticos não-benzodiazepínicos.',
    faq:[
      { p:'Pode substituir meu ansiolítico atual?', r:'Não sem supervisão médica. Pode ser usado como adjuvante ou alternativa em casos leves/moderados, mas a retirada de benzodiazepínicos deve ser supervisionada por um médico.' },
    ],
  },
  {
    id:'hexarelin', nome:'Hexarelin', emoji:'🏋️', categoria:'GHRP de Alta Potência', tagline:'O mais potente estimulador de GH da classe',
    nivel:'avancado', cor:'#993C1D', bg:'#FAECE7',
    mecanismo:'Hexarelin é um hexapeptídeo GHRP (Growth Hormone Releasing Peptide) com a maior potência estimuladora de GH entre os GHRPs sintéticos. Age nos receptores GHS-R1a na pituitária e hipotálamo, mas também tem ação direta nos cardiomiócitos (células cardíacas) via receptores independentes de GH — efeito cardioprotetor único em sua classe.',
    beneficios:['Maior pico de GH entre os GHRPs (dose-dependente)', 'Efeito cardioprotetor direto (independente do GH)', 'Anabolismo muscular potente', 'Recuperação acelerada', 'Potencial uso em insuficiência cardíaca (pesquisa)'],
    protocolo:{ dose:'100–200 mcg/dose', freq:'1–3x/dia', via:'SC', timing:'Em jejum (pré-treino ou noite)', ciclo:'4–8 semanas', pausa:'4–8 semanas (dessensibilização rápida)' },
    contraindicacoes:['Elevação de cortisol e prolactina (diferente do Ipamorelin)', 'Acromegalia', 'Câncer ativo', 'Síndrome de Prader-Willi'],
    interacoes:['CJC-1295/GHRH: sinergia potente mas risco de dessensibilização acelerada', 'Somatostatina: antagonismo', 'Glicocorticoides: reduzem resposta'],
    evidencias:'Estudos clínicos demonstram pico de GH superior ao Ipamorelin. Pesquisa cardiovascular promissora. Maior risco de dessensibilização exige ciclagem rigorosa.',
    faq:[
      { p:'Por que não é o padrão se é o mais potente?', r:'Por causa da dessensibilização rápida e dos efeitos sobre cortisol/prolactina. O Ipamorelin tem perfil de segurança superior para uso prolongado, com potência suficiente para a maioria dos objetivos.' },
    ],
  },
  {
    id:'pt141', nome:'PT-141 (Bremelanotide)', emoji:'❤️', categoria:'Peptídeo Sexual', tagline:'Disfunção sexual e libido aumentada',
    nivel:'intermediario', cor:'#D4537E', bg:'#FBEAF0',
    mecanismo:'PT-141 é um análogo cíclico do α-MSH (hormônio estimulador de melanócitos) que age nos receptores de melanocortina (MC3R e MC4R) no sistema nervoso central — diferente dos inibidores de PDE5 (Viagra, Cialis) que agem na vasculatura periférica. Estimula o desejo sexual centralmente, através de vias dopaminérgicas e opioides no hipotálamo.',
    beneficios:['Aumento do desejo sexual em homens e mulheres', 'Melhora da excitação e resposta sexual', 'Eficaz mesmo em ausência de estimulação visual', 'Aprovado pela FDA para disfunção sexual hipoativa em mulheres (Vyleesi®)', 'Efeito independente da função vascular'],
    protocolo:{ dose:'1–2 mg/dose', freq:'Uso conforme necessidade (não diário)', via:'SC', timing:'1–4h antes da atividade sexual', ciclo:'Uso pontual — não ciclar', pausa:'Não aplicável para uso pontual' },
    contraindicacoes:['Hipertensão não controlada (pode elevar PA transitoriamente)', 'Doenças cardiovasculares graves', 'Gravidez', 'Uso junto com inibidores de PDE5 (hipotensão)'],
    interacoes:['Viagra/Cialis: hipotensão — evitar combinação', 'Anti-hipertensivos: potencialização'],
    evidencias:'Aprovado FDA para HSDD em mulheres pré-menopáusicas (Vyleesi®, 2019). Múltiplos ensaios clínicos fase II/III. Mecanismo central único validado.',
    faq:[
      { p:'Funciona igual ao Viagra?', r:'Não. O Viagra age na vasculatura — requer estímulo sexual. O PT-141 age no cérebro estimulando o desejo em si, não apenas a função erétil. São complementares, não equivalentes.' },
    ],
  },
  {
    id:'mod', nome:'MOD-GRF 1-29', emoji:'🔬', categoria:'GHRH Análogo', tagline:'Pulsos fisiológicos de GH com meia-vida otimizada',
    nivel:'avancado', cor:'#3B6D11', bg:'#EAF3DE',
    mecanismo:'MOD-GRF 1-29 (também chamado CJC-1295 sem DAC) é um análogo modificado do GHRH natural com 4 substituições de aminoácidos que prolongam sua meia-vida de ~7 min (GHRH nativo) para ~30 min. Estimula a pituitária a liberar GH em pulsos fisiológicos quando combinado com um GHRP. A ausência do DAC resulta em um perfil de ação mais fisiológico e menos supressivo.',
    beneficios:['Estímulo fisiológico de GH em pulsos naturais', 'Sem elevação sustentada (menor risco de dessensibilização)', 'Sinergismo máximo com GHRPs (Ipamorelin, Hexarelin)', 'Melhora da composição corporal e recuperação', 'Perfil mais fisiológico que CJC-1295 DAC'],
    protocolo:{ dose:'100–200 mcg/dose', freq:'1–3x/dia (semelhante ao GHRP combinado)', via:'SC', timing:'Em jejum, preferencialmente à noite junto com GHRP', ciclo:'12–16 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Acromegalia', 'Câncer ativo', 'Retinopatia diabética'],
    interacoes:['Ipamorelin: combinação padrão e mais usada (1:1 em dose)', 'Hexarelin: combinação mais potente', 'Somatostatina: antagonismo fisiológico'],
    evidencias:'Dados derivados da literatura de GHRH e CJC-1295. A modificação da molécula é bem caracterizada farmacocineticamente. Uso em pesquisa clínica de GH.',
    faq:[
      { p:'É melhor que o CJC-1295 DAC?', r:'Depende do objetivo. O MOD-GRF 1-29 dá pulsos mais fisiológicos (mais seguro a longo prazo). O CJC-1295 DAC eleva o GH basal de forma mais sustentada (mais prático, menos injeções). Para iniciantes: MOD-GRF + Ipamorelin é a combinação padrão.' },
    ],
  },

  {
    id:'tirze', nome:'Tirzepatide', emoji:'⚡', categoria:'GIP/GLP-1 Agonista', tagline:'O mais potente para perda de gordura — duplo agonista',
    nivel:'avancado', cor:'#0F6E56', bg:'#E1F5EE',
    mecanismo:'Tirzepatide é um agonista dual dos receptores GIP (glucose-dependent insulinotropic polypeptide) e GLP-1. Age simultaneamente em dois eixos metabólicos: o GLP-1 reduz o apetite e retarda o esvaziamento gástrico; o GIP melhora a sensibilidade à insulina nos tecidos periféricos e potencializa o efeito anorético. Essa ação dual explica a superioridade vs Semaglutide em estudos head-to-head.',
    beneficios:['Perda de peso superior ao Semaglutide (média 22% em estudos SURMOUNT)','Melhora marcante da resistência à insulina','Redução de triglicerídeos e melhora do perfil lipídico','Preservação maior de massa muscular vs outros GLP-1','Aprovado FDA para diabetes (Mounjaro®) e obesidade (Zepbound®)'],
    protocolo:{ dose:'2.5 mg/semana (início) → 5–15 mg/semana (manutenção)', freq:'1x por semana, mesmo dia', via:'SC — abdômen, coxa ou braço', timing:'Qualquer horário, independente de alimento', ciclo:'24–52 semanas', pausa:'8–12 semanas entre ciclos' },
    contraindicacoes:['Carcinoma medular da tireoide (histórico pessoal/familiar)','NEM2','Pancreatite aguda','Gastroparesia severa','Gravidez e amamentação'],
    interacoes:['Insulina: risco de hipoglicemia — reduzir dose de insulina em 20–30%','Medicamentos de absorção lenta: pode alterar biodisponibilidade','Anticoagulantes: monitorar periodicamente'],
    evidencias:'Estudos SURMOUNT-1 a 4 demonstraram perda de 22.5% do peso em 72 semanas na dose de 15mg. Superior ao Semaglutide no estudo SURMOUNT-5. Aprovado FDA 2022 (Mounjaro) e 2023 (Zepbound).',
    faq:[
      { p:'É melhor que o Semaglutide?', r:'Em média sim — os estudos mostram maior perda de peso com Tirzepatide. Porém a tolerabilidade individual varia. Alguns pacientes respondem melhor ao Semaglutide.' },
      { p:'Efeitos colaterais são piores?', r:'Perfil similar ao Semaglutide: náusea, vômito, diarreia nas primeiras semanas. A escalada lenta de dose minimiza os efeitos gastrointestinais.' },
    ],
  },
  {
    id:'reta', nome:'Retatrutide', emoji:'🚀', categoria:'GLP-1/GIP/Glucagon Agonista', tagline:'Agonista triplo — a fronteira da perda de gordura',
    nivel:'avancado', cor:'#533AB7', bg:'#EEEDFE',
    mecanismo:'Retatrutide é um agonista triplo dos receptores GLP-1, GIP e Glucagon — o único na sua classe. O componente de glucagon adiciona queima direta de gordura hepática e aumento do gasto energético basal, complementando os efeitos anorético do GLP-1 e sensibilizador do GIP. Em fase 2, demonstrou os maiores percentuais de perda de peso já registrados em ensaios clínicos.',
    beneficios:['Maior perda de gordura já documentada em estudos clínicos (média 24% em fase 2)','Redução marcante de gordura hepática (esteatose)','Aumento do gasto energético basal (via glucagon)','Melhora metabólica abrangente: glicemia, lipídeos, pressão','Potencial terapêutico em NASH/esteatohepatite'],
    protocolo:{ dose:'Ainda em fase de pesquisa — 1–12 mg/semana nos estudos', freq:'1x por semana', via:'SC', timing:'Qualquer horário', ciclo:'Em investigação clínica', pausa:'Em investigação' },
    contraindicacoes:['Ainda em investigação clínica (fase 3)','Contraindicações esperadas similares ao Tirzepatide','Não disponível para uso clínico geral ainda'],
    interacoes:['Em investigação — dados de interação limitados','Precauções similares aos outros agonistas de GLP-1'],
    evidencias:'Fase 2 (2023): 24.2% de perda de peso em 48 semanas. Publicado no NEJM. Fase 3 em andamento. Eli Lilly desenvolve como LY3437943.',
    faq:[
      { p:'Está disponível para uso?', r:'Ainda não. O Retatrutide está em fase 3 de estudos clínicos (2024–2025). Expectativa de aprovação FDA a partir de 2026.' },
    ],
  },
  {
    id:'slu', nome:'SLU-PP-332', emoji:'🏃', categoria:'ERR Agonista', tagline:'Simula os efeitos do exercício físico em nível molecular',
    nivel:'avancado', cor:'#3B6D11', bg:'#EAF3DE',
    mecanismo:'SLU-PP-332 é um agonista sintético dos receptores ERRα e ERRγ (Estrogen-Related Receptors), fatores de transcrição que regulam o metabolismo energético mitocondrial. Ao ativar esses receptores, mimetiza os sinais moleculares do exercício aeróbico: aumenta a biogênese mitocondrial, estimula a oxidação de gordura no músculo e melhora a capacidade aeróbica mesmo sem exercício.',
    beneficios:['Aumento da capacidade aeróbica sem exercício (em modelos animais)','Estimulação da biogênese mitocondrial muscular','Queima de gordura aumentada via oxidação mitocondrial','Potencial em doenças metabólicas e sarcopenia','Melhora da função cardíaca em modelos de insuficiência'],
    protocolo:{ dose:'Em investigação pré-clínica — ainda sem protocolo humano estabelecido', freq:'Não definido para humanos', via:'Em investigação', timing:'Em investigação', ciclo:'Em investigação', pausa:'Em investigação' },
    contraindicacoes:['Dados humanos insuficientes — uso experimental','Efeitos de longo prazo desconhecidos','Não disponível comercialmente como fármaco'],
    interacoes:['Dados de interação inexistentes em humanos'],
    evidencias:'Estudos em camundongos (Washington University, 2023) mostraram aumento de 70% na capacidade aeróbica. Publicado em Nature. Ainda em fase pré-clínica para humanos.',
    faq:[
      { p:'Já pode ser usado por humanos?', r:'Não. O SLU-PP-332 está em fase pré-clínica. Os resultados em camundongos são promissores mas dados humanos são inexistentes. Cautela máxima.' },
    ],
  },
  {
    id:'tesa', nome:'Tesamorelin', emoji:'💉', categoria:'GHRH Análogo', tagline:'Redução específica de gordura visceral aprovada pela FDA',
    nivel:'intermediario', cor:'#185FA5', bg:'#E6F1FB',
    mecanismo:'Tesamorelin é um análogo sintético do GHRH (Growth Hormone Releasing Hormone) com meia-vida prolongada. Estimula a secreção endógena de GH de forma fisiológica, sem suprimir o eixo HPA. Tem indicação específica para lipodistrofia em pacientes HIV+ (aprovado FDA como Egrifta®) e demonstra redução significativa de gordura visceral em estudos.',
    beneficios:['Redução comprovada de gordura visceral abdominal','Aumento de GH e IGF-1 fisiológico','Melhora do perfil lipídico (triglicerídeos)','Sem impacto negativo na glicemia (vantagem vs HGH)','Aprovado FDA — maior nível de evidência clínica da classe'],
    protocolo:{ dose:'1–2 mg/dia', freq:'Diário', via:'SC — abdômen', timing:'À noite antes de dormir em jejum', ciclo:'26 semanas', pausa:'8–12 semanas' },
    contraindicacoes:['Hipersensibilidade ao Tesamorelin ou ao manitol','Câncer ativo ou histórico de neoplasia maligna','Gravidez','Complicações cirúrgicas ou traumáticas agudas'],
    interacoes:['Corticosteroides: reduzem resposta ao GH','Insulina: monitorar glicemia','CYP3A4 substrates: possível interação'],
    evidencias:'Aprovado FDA (2010) para lipodistrofia HIV+. Múltiplos ensaios fase 3 publicados no JAMA, NEJM e Lancet HIV. Redução de 15–18% de gordura visceral em 26 semanas.',
    faq:[
      { p:'É diferente do CJC-1295?', r:'Sim. Tesamorelin é um análogo do GHRH nativo com modificações na extremidade N-terminal para maior estabilidade. Tem aprovação FDA — nível de evidência superior. CJC-1295 tem modificações diferentes e maior meia-vida.' },
    ],
  },
  {
    id:'kpv', nome:'KPV', emoji:'🛡️', categoria:'Peptídeo Anti-inflamatório', tagline:'Anti-inflamatório intestinal e sistêmico potente',
    nivel:'iniciante', cor:'#1D9E75', bg:'#E1F5EE',
    mecanismo:'KPV é um tripeptídeo (Lys-Pro-Val) derivado da extremidade C-terminal do α-MSH (hormônio estimulador de melanócitos). Age nos receptores de melanocortina (MC1R, MC3R) presentes em células imunes e células epiteliais intestinais, inibindo vias pró-inflamatórias (NF-kB, IL-6, TNF-α) sem os efeitos do α-MSH completo. Atravessa a barreira epitelial intestinal de forma eficiente.',
    beneficios:['Anti-inflamatório intestinal potente — DII, colite, Crohn','Cicatrização da mucosa intestinal','Redução de permeabilidade intestinal (leaky gut)','Ação anti-inflamatória sistêmica via MC1R','Potencial em psoríase e condições inflamatórias cutâneas','Bem tolerado — sem efeitos hormonais significativos'],
    protocolo:{ dose:'200–500 mcg/dia (oral) ou 100–300 mcg/dia (SC)', freq:'1–2x ao dia', via:'Oral (cápsula) ou SC', timing:'Com ou sem alimento', ciclo:'4–8 semanas', pausa:'2–4 semanas' },
    contraindicacoes:['Hipersensibilidade ao peptídeo','Gravidez (dados insuficientes)','Imunossupressão severa (cautela)'],
    interacoes:['Imunossupressores: monitorar — pode reduzir necessidade de dose','Anti-inflamatórios: efeito aditivo'],
    evidencias:'Estudos em modelos murinos de colite demonstram redução de inflamação comparável a corticosteroides. Estudos in vitro bem documentados. Ensaios clínicos em desenvolvimento para DII.',
    faq:[
      { p:'Pode ser tomado por via oral?', r:'Sim. O KPV tem estabilidade oral surpreendente para um peptídeo, atravessando o epitélio intestinal de forma eficiente. Para efeitos sistêmicos, SC é mais biodisponível.' },
    ],
  },
  {
    id:'nad', nome:'NAD+', emoji:'⚡', categoria:'Coenzima / Anti-aging', tagline:'Combustível celular essencial para energia e longevidade',
    nivel:'iniciante', cor:'#EF9F27', bg:'#FAEEDA',
    mecanismo:'NAD+ (Nicotinamide Adenine Dinucleotide) é uma coenzima essencial presente em todas as células vivas. Participa de mais de 500 reações enzimáticas, incluindo a cadeia respiratória mitocondrial (produção de ATP), reparo de DNA (via PARP), regulação epigenética (via Sirtuínas) e sinalização celular (via CD38). Os níveis de NAD+ declinam ~50% entre os 20 e 50 anos de idade.',
    beneficios:['Aumento da energia celular e redução da fadiga','Ativação das Sirtuínas (proteínas da longevidade)','Reparo de DNA acelerado','Melhora da função mitocondrial','Neuroproteção e melhora cognitiva','Potencial no metabolismo e composição corporal'],
    protocolo:{ dose:'250–500 mg/dia (NMN/NR oral) ou 100–500 mg (IV/IM)', freq:'Diário (oral) ou 1–2x/semana (IV)', via:'Oral (NMN ou NR como precursores) ou IV direto', timing:'Manhã com ou sem alimento', ciclo:'Contínuo ou ciclos de 12 semanas', pausa:'Opcional — 4 semanas a cada 3 meses' },
    contraindicacoes:['Câncer ativo (NAD+ alimenta células tumorais via metabolismo energético)','Hipersensibilidade à niacina (flushing)','Gravidez (dados insuficientes para IV)'],
    interacoes:['Resveratrol: sinergia com Sirtuínas','Metformina: pode antagonizar benefícios mitocondriais — separar uso','Álcool: consome NAD+ — evitar uso conjunto'],
    evidencias:'Extensiva literatura básica sobre biologia do NAD+. Estudos clínicos com NMN e NR publicados no Cell Metabolism, Nature Metabolism. Estudos de longevidade em andamento (Harvard — David Sinclair).',
    faq:[
      { p:'NMN, NR ou NAD+ IV — qual é melhor?', r:'IV: biodisponibilidade máxima mas invasivo e caro. NMN: precursor eficiente, boa absorção oral. NR: mais estudado clinicamente, bem tolerado. Na prática: NMN oral diário + IV ocasional é a combinação mais usada.' },
    ],
  },
  {
    id:'ss31', nome:'SS-31 (Elamipretide)', emoji:'🔋', categoria:'Peptídeo Mitocondrial', tagline:'Proteção mitocondrial e reversão do envelhecimento celular',
    nivel:'avancado', cor:'#D4537E', bg:'#FBEAF0',
    mecanismo:'SS-31 (também conhecido como MTP-131 ou Elamipretide) é um tetrapeptídeo que se concentra seletivamente na membrana interna mitocondrial, onde interage com cardiolipina — fosfolipídeo essencial para a função da cadeia respiratória. Reduz a produção de ROS (espécies reativas de oxigênio), estabiliza os complexos da cadeia respiratória e melhora a produção de ATP. Único peptídeo com ação direta na mitocôndria.',
    beneficios:['Proteção direta contra disfunção mitocondrial','Redução potente de estresse oxidativo mitocondrial','Melhora da função cardíaca (estudos em insuficiência cardíaca)','Potencial em doenças neurodegenerativas','Melhora da função muscular em sarcopenia','Efeito anti-aging celular via proteção mitocondrial'],
    protocolo:{ dose:'0.1–0.5 mg/kg/dia (em estudos clínicos)', freq:'Diário ou em dias alternados', via:'SC ou IV (estudos clínicos IV)','timing':'Manhã', ciclo:'4–12 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Dados clínicos humanos limitados — uso experimental','Insuficiência renal severa (cautela na eliminação)','Gravidez'],
    interacoes:['Antioxidantes: efeito aditivo potencial','Dados de interação muito limitados'],
    evidencias:'Estudos clínicos fase 1/2 em insuficiência cardíaca, doença renal e síndrome de Barth (doenças mitocondriais raras). Publicações no JACC, Circulation e outros. ReCLAIM-2 trial em andamento.',
    faq:[
      { p:'Como o SS-31 difere de outros antioxidantes?', r:'É o único peptídeo que age diretamente na membrana interna mitocondrial, onde os ROS são gerados. Antioxidantes comuns (vitamina C, E) não chegam a esse compartimento. O SS-31 age na fonte do problema.' },
    ],
  },
  {
    id:'glow', nome:'GLOW (GHK+BPC+TB)', emoji:'✨', categoria:'Stack / Combinação', tagline:'O stack de regeneração completa — pele, tecido e recuperação',
    nivel:'intermediario', cor:'#7F77DD', bg:'#EEEDFE',
    mecanismo:'GLOW é um stack combinando GHK-Cu (cobre peptídeo), BPC-157 e TB-500 — três peptídeos com mecanismos complementares de regeneração. GHK-Cu estimula síntese de colágeno e regula mais de 4.000 genes. BPC-157 promove angiogênese e cicatrização via VEGF. TB-500 regula a actina e mobiliza células-tronco. Juntos, cobrem todas as fases da regeneração tecidual: sinalização, vascularização e remodelamento.',
    beneficios:['Regeneração tecidual completa — músculos, tendões, pele e cartilagem','Melhora da aparência da pele (colágeno + elastina)','Cicatrização acelerada de lesões agudas e crônicas','Redução de fibrose e formação de cicatrizes','Crescimento capilar estimulado','Sinergia tripla — cada peptídeo potencializa os outros'],
    protocolo:{ dose:'GHK-Cu: 1 mg + BPC-157: 250 mcg + TB-500: 1 mg por dose', freq:'3–5x/semana', via:'SC — rodar locais de injeção', timing:'Manhã ou noite, sem restrição alimentar', ciclo:'4–8 semanas', pausa:'4 semanas' },
    contraindicacoes:['Câncer ativo (todos três estimulam crescimento celular/angiogênese)','Gravidez','Hemocromatose (componente GHK-Cu)'],
    interacoes:['Sinergia entre os três componentes — doses individuais podem ser menores que uso isolado','BPC-157 + TB-500: já estudados juntos com resultados superiores ao uso individual'],
    evidencias:'Dados individuais de cada componente. Combinação popularizada na comunidade de biohacking e medicina anti-aging. Evidências clínicas da combinação ainda limitadas — cada componente tem literatura própria robusta.',
    faq:[
      { p:'Posso usar separadamente?', r:'Sim. GHK-Cu, BPC-157 e TB-500 têm excelentes resultados individuais. O stack GLOW combina os três para quem busca regeneração completa e maximaliza resultados.' },
      { p:'Qual a diferença de aplicar junto vs separado?', r:'Podem ser aplicados na mesma seringa (compatíveis) ou separados. Locais diferentes são recomendados para lesões específicas (ex: BPC-157 perto da lesão + os outros em abdômen).' },
    ],
  },
  {
    id:'cjc_ipa_combo', nome:'CJC-1295 + Ipamorelin', emoji:'🔗', categoria:'Stack / Combinação', tagline:'O stack clássico de GH — sinérgico e fisiológico',
    nivel:'iniciante', cor:'#1D9E75', bg:'#E1F5EE',
    mecanismo:'A combinação CJC-1295 + Ipamorelin é considerada o gold standard entre os stacks de secretagogos de GH. CJC-1295 (GHRH análogo) estimula a pituitária a produzir GH e prolonga a janela de resposta. Ipamorelin (GHRP) amplifica o pulso de GH e bloqueia a somatostatina. Juntos, criam um pulso de GH maior, mais prolongado e ainda fisiológico — sem elevar cortisol ou prolactina.',
    beneficios:['Pico de GH 3–5x maior que cada peptídeo isolado','Perfil fisiológico — pulso natural sem supressão do eixo','Ipamorelin neutraliza somatostatina (inibidor natural do GH)','Melhora da composição corporal, sono e recuperação','Sem efeitos sobre cortisol, prolactina ou ACTH','Stack mais estudado e documentado da categoria'],
    protocolo:{ dose:'CJC-1295 (sem DAC): 100 mcg + Ipamorelin: 200–300 mcg por dose', freq:'1–3x/dia (noite é essencial)', via:'SC — pode misturar na mesma seringa', timing:'Antes de dormir (dose principal) + manhã em jejum (opcional)', ciclo:'12–16 semanas', pausa:'4–8 semanas' },
    contraindicacoes:['Acromegalia','Câncer ativo','Retinopatia diabética','Síndrome de Prader-Willi'],
    interacoes:['Insulina: aplicar com 30 min de intervalo','Corticosteroides: reduzem resposta ao GH','MK-677: combinação possível mas monitore saturação dos receptores'],
    evidencias:'Amplamente estudado em literatura de secretagogos. Farmacocinética da combinação documentada em múltiplos estudos. Considerado padrão-ouro pelos especialistas em medicina do esporte e anti-aging.',
    faq:[
      { p:'Posso misturar os dois na mesma seringa?', r:'Sim. CJC-1295 sem DAC e Ipamorelin são compatíveis na mesma seringa. Reconstituir separadamente e misturar no momento da aplicação.' },
      { p:'É melhor que usar cada um isolado?', r:'Significativamente. A sinergia GHRH+GHRP produz efeito muito superior ao de cada peptídeo sozinho — é a razão pela qual essa combinação é a mais recomendada para iniciantes em secretagogos.' },
    ],
  },
];

const CATEGORIAS = ['Todos', ...Array.from(new Set(PEPTIDEOS.map(p=>p.categoria)))];
const NIVEIS = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };
const NIVEL_COR = { iniciante:'#1D9E75', intermediario:'#EF9F27', avancado:'#D85A30' };
const NIVEL_BG  = { iniciante:'#E1F5EE', intermediario:'#FAEEDA', avancado:'#FAECE7' };

export default function SectionLib() {
  const [busca,     setBusca]     = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [ativo,     setAtivo]     = useState<string|null>(null);
  const [abaAtiva,  setAbaAtiva]  = useState<'mecanismo'|'protocolo'|'seguranca'|'faq'>('mecanismo');
  const [compara,   setCompara]   = useState<string[]>([]);

  const filtrado = PEPTIDEOS.filter(p => {
    const buscaOk = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.categoria.toLowerCase().includes(busca.toLowerCase()) || p.tagline.toLowerCase().includes(busca.toLowerCase());
    const catOk   = categoria === 'Todos' || p.categoria === categoria;
    return buscaOk && catOk;
  });

  const peptideoAtivo = PEPTIDEOS.find(p => p.id === ativo);

  const toggleCompara = (id: string) => {
    setCompara(p => p.includes(id) ? p.filter(x=>x!==id) : p.length<3?[...p,id]:p);
  };

  if (peptideoAtivo) {
    return (
      <div>
        {/* Header detalhe */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem', flexWrap:'wrap' }}>
          <button onClick={() => setAtivo(null)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--tm)', fontFamily:'inherit' }}>
            ← Biblioteca
          </button>
          <div style={{ width:1, height:20, background:'var(--border)' }}/>
          <span style={{ fontSize:'1.5rem' }}>{peptideoAtivo.emoji}</span>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:2 }}>{peptideoAtivo.nome}</h2>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:peptideoAtivo.bg, color:peptideoAtivo.cor, fontWeight:500 }}>{peptideoAtivo.categoria}</span>
              <span style={{ fontSize:11, padding:'2px 9px', borderRadius:100, background:NIVEL_BG[peptideoAtivo.nivel], color:NIVEL_COR[peptideoAtivo.nivel], fontWeight:500 }}>{NIVEIS[peptideoAtivo.nivel]}</span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ background:`${peptideoAtivo.cor}15`, border:`1px solid ${peptideoAtivo.cor}30`, borderRadius:12, padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
          <p style={{ fontSize:14, color:peptideoAtivo.cor, fontWeight:500, margin:0 }}>{peptideoAtivo.tagline}</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:'1.25rem', overflowX:'auto' }}>
          {([['mecanismo','🔬 Mecanismo'],['protocolo','💉 Protocolo'],['seguranca','⚠️ Segurança'],['faq','❓ FAQ']] as const).map(([v,l]) => (
            <button key={v} onClick={() => setAbaAtiva(v)}
              style={{ padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:500, color:abaAtiva===v?'var(--tx)':'var(--ts)', borderBottom:abaAtiva===v?`2px solid ${peptideoAtivo.cor}`:'2px solid transparent', whiteSpace:'nowrap', flexShrink:0 }}>
              {l}
            </button>
          ))}
        </div>

        {/* Aba: Mecanismo */}
        {abaAtiva === 'mecanismo' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Como funciona</div>
              <p style={{ fontSize:13, color:'var(--tx)', lineHeight:1.8, margin:0 }}>{peptideoAtivo.mecanismo}</p>
            </div>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'1rem' }}>Benefícios documentados</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {peptideoAtivo.beneficios.map((b,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--tx)', lineHeight:1.5 }}>
                    <span style={{ color:peptideoAtivo.cor, flexShrink:0, marginTop:1 }}>✓</span>
                    {b}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--ts)', marginBottom:'.75rem' }}>Base de evidências</div>
              <p style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7, margin:0 }}>{peptideoAtivo.evidencias}</p>
            </div>
          </div>
        )}

        {/* Aba: Protocolo */}
        {abaAtiva === 'protocolo' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {[
                ['Dose',       peptideoAtivo.protocolo.dose    ],
                ['Frequência', peptideoAtivo.protocolo.freq    ],
                ['Via',        peptideoAtivo.protocolo.via     ],
                ['Timing',     peptideoAtivo.protocolo.timing  ],
                ['Duração',    peptideoAtivo.protocolo.ciclo   ],
                ['Pausa',      peptideoAtivo.protocolo.pausa   ],
              ].map(([l,v])=>(
                <div key={l} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem' }}>
                  <div style={{ fontSize:10, fontWeight:500, color:'var(--ts)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>{l}</div>
                  <div style={{ fontSize:13, color:'var(--tx)', lineHeight:1.4 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:`${peptideoAtivo.cor}10`, border:`1px solid ${peptideoAtivo.cor}25`, borderRadius:12, padding:'1rem 1.25rem', fontSize:12, color:peptideoAtivo.cor, lineHeight:1.65 }}>
              ⚠️ Protocolo educativo. Doses individuais variam. Consulte um médico especializado antes de iniciar qualquer protocolo de peptídeos.
            </div>
          </div>
        )}

        {/* Aba: Segurança */}
        {abaAtiva === 'seguranca' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'#D85A30', marginBottom:'1rem' }}>Contraindicações</div>
              {peptideoAtivo.contraindicacoes.map((c,i)=>(
                <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--tx)', marginBottom:8, lineHeight:1.5 }}>
                  <span style={{ color:'#D85A30', flexShrink:0 }}>×</span>{c}
                </div>
              ))}
            </div>
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em', color:'#EF9F27', marginBottom:'1rem' }}>Interações relevantes</div>
              {peptideoAtivo.interacoes.map((int,i)=>(
                <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--tx)', marginBottom:8, lineHeight:1.5 }}>
                  <span style={{ color:'#EF9F27', flexShrink:0 }}>⚡</span>{int}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aba: FAQ */}
        {abaAtiva === 'faq' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {peptideoAtivo.faq.map((item,i)=>(
              <div key={i} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'1.25rem' }}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--tx)', marginBottom:'.625rem' }}>❓ {item.p}</div>
                <div style={{ fontSize:13, color:'var(--tm)', lineHeight:1.7 }}>{item.r}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h2 style={{ fontSize:'1.2rem', fontWeight:500, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Biblioteca de peptídeos</h2>
        <p style={{ fontSize:13, color:'var(--tm)' }}>Conteúdo educacional completo sobre cada peptídeo do protocolo</p>
      </div>

      {/* Busca + filtros */}
      <div style={{ display:'flex', gap:10, marginBottom:'1.25rem', flexWrap:'wrap' }}>
        <input className="inp" placeholder="🔍 Buscar peptídeo ou categoria..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ flex:1, minWidth:200, marginBottom:0 }}/>
      </div>

      {/* Categorias */}
      <div style={{ display:'flex', gap:6, marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {CATEGORIAS.map(c=>(
          <button key={c} onClick={()=>setCategoria(c)}
            style={{ padding:'5px 12px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', transition:'all .13s', border:`1px solid ${categoria===c?'var(--green)':'var(--border)'}`, background:categoria===c?'var(--gp)':'var(--bg2)', color:categoria===c?'var(--gm)':'var(--tm)', fontFamily:'inherit' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
        {filtrado.map(p=>(
          <div key={p.id} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', cursor:'pointer', transition:'border-color .15s, transform .15s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=p.cor;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none';}}
            onClick={()=>{ setAtivo(p.id); setAbaAtiva('mecanismo'); }}>
            {/* Top bar colorida */}
            <div style={{ height:4, background:p.cor }}/>
            <div style={{ padding:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'.875rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:40, height:40, background:p.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--tx)', marginBottom:2 }}>{p.nome}</div>
                    <div style={{ fontSize:10, color:p.cor, fontWeight:500 }}>{p.categoria}</div>
                  </div>
                </div>
                <span style={{ fontSize:9, padding:'2px 7px', borderRadius:100, background:NIVEL_BG[p.nivel], color:NIVEL_COR[p.nivel], fontWeight:500, flexShrink:0 }}>
                  {NIVEIS[p.nivel]}
                </span>
              </div>
              <p style={{ fontSize:12, color:'var(--tm)', lineHeight:1.55, margin:0 }}>{p.tagline}</p>
            </div>
          </div>
        ))}
      </div>

      {filtrado.length === 0 && (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--ts)', fontSize:13 }}>
          Nenhum peptídeo encontrado para "{busca}"
        </div>
      )}

      <div style={{ marginTop:'1.25rem', fontSize:11, color:'var(--ts)', textAlign:'center' }}>
        {PEPTIDEOS.length} peptídeos documentados · Conteúdo educacional · Não substitui avaliação médica
      </div>
    </div>
  );
}
