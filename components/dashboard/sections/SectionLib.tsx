// @ts-nocheck
'use client';

import { useState } from 'react';

const PEPTIDEOS = [
  {
    id:'sema', nome:'Semaglutide', emoji:'🔥', categoria:'GLP-1 Agonista', tagline:'O peptídeo mais estudado para perda de gordura',
    nivel:'intermediario', cor:'#1D9E75', bg:'#E1F5EE',
    classificacao:'Análogo do GLP-1', evidencia:'Aprovado (FDA/ANVISA)', meia_vida:'~7 dias', reconstituicao:'Fácil', nomes_alt:['Ozempic','Wegovy','Rybelsus'],
    mecanismo:'O Semaglutide é um análogo do GLP-1, hormônio intestinal que regula o apetite e a glicemia. Liga-se aos receptores GLP-1 no hipotálamo, reduzindo a fome e aumentando a saciedade. Também retarda o esvaziamento gástrico e melhora a sensibilidade à insulina.',
    beneficios:['Redução significativa do apetite e da ingestão calórica','Perda de peso sustentada (média de 10-15% em estudos clínicos)','Melhora da glicemia e resistência à insulina','Redução do risco cardiovascular','Preservação de massa muscular quando combinado com treino'],
    timeline:[
      { fase:'Semana 1-2', desc:'Redução do apetite perceptível. Corpo se adaptando à dose.' },
      { fase:'Semana 3-4', desc:'Saciedade mais pronunciada. Primeiros quilos.' },
      { fase:'Mês 2-3', desc:'Perda de peso consistente. Efeitos colaterais GI diminuem.' },
      { fase:'Mês 3-6', desc:'Perda acelerada. Resultados visíveis na composição corporal.' },
      { fase:'Mês 6+', desc:'Manutenção dos resultados. Avaliação de ajuste de dose.' },
    ],
    protocolo:{ dose:'0.25 mg/sem (início) → 0.5-1 mg/sem (manutenção)', freq:'1x por semana, mesmo dia', via:'SC — abdômen, coxa ou braço', timing:'Qualquer horário, com ou sem alimento', ciclo:'12-24 semanas', pausa:'4-8 semanas entre ciclos' },
    contraindicacoes:['Histórico de carcinoma medular da tireoide','NEM2','Pancreatite aguda','Gravidez e amamentação'],
    efeitos:[
      { nome:'Náusea', tipo:'comum', mitigacao:'Iniciar com dose baixa, aumentar gradualmente' },
      { nome:'Vômito', tipo:'comum', mitigacao:'Refeições menores, evitar alimentos gordurosos' },
      { nome:'Diarreia', tipo:'comum', mitigacao:'Hidratação adequada, cede em 2-4 semanas' },
      { nome:'Pancreatite', tipo:'raro', mitigacao:'Parar imediatamente se dor abdominal severa' },
    ],
    interacoes:['Insulina: risco de hipoglicemia — ajuste de dose','Metformina: potencializa controle glicêmico','Anticoagulantes orais: monitorar INR'],
    evidencias:'Estudos STEP 1-4 demonstraram perda média de 14,9% do peso em 68 semanas. Aprovado FDA e ANVISA. Meta-análises confirmam superioridade vs placebo.',
    faq:[
      { p:'Posso usar sem dieta?', r:'O Semaglutide reduz o apetite, mas os resultados são significativamente maiores com dieta equilibrada.' },
      { p:'Quando começar a sentir efeitos?', r:'Redução do apetite geralmente ocorre na 1ª semana. Perda de peso visível após 4-6 semanas.' },
    ],
  },
  {
    id:'aod', nome:'AOD-9604', emoji:'🏃', categoria:'Fragmento do GH', tagline:'Queima gordura sem os efeitos do HGH completo',
    nivel:'iniciante', cor:'#378ADD', bg:'#E6F1FB',
    classificacao:'Fragmento do HGH (176-191)', evidencia:'Fase II (Clínico)', meia_vida:'~30 min', reconstituicao:'Fácil', nomes_alt:['AOD9604','HGH Fragment 176-191'],
    mecanismo:'AOD-9604 é um fragmento sintético da extremidade C-terminal do HGH (aminoácidos 176-191). Estimula lipólise e inibe lipogênese sem afetar glicemia ou IGF-1. Age diretamente nos adipócitos via receptores beta-3 adrenérgicos.',
    beneficios:['Lipólise direcionada, especialmente gordura visceral','Não eleva IGF-1 nem glicemia','Não causa resistência à insulina','Perfil de segurança superior ao HGH','Sem efeitos sobre crescimento ósseo em adultos'],
    timeline:[
      { fase:'Semana 1-2', desc:'Aumento da lipólise. Corpo se adaptando.' },
      { fase:'Semana 3-4', desc:'Redução perceptível de gordura abdominal.' },
      { fase:'Mês 2', desc:'Perda de gordura localizada mais evidente.' },
      { fase:'Mês 3+', desc:'Resultados consolidados. Avaliação de continuidade.' },
    ],
    protocolo:{ dose:'300-600 mcg/dia', freq:'Diário ou 5x/semana', via:'SC — abdômen em jejum', timing:'Manhã em jejum 30-60 min antes do café', ciclo:'8-12 semanas', pausa:'4-6 semanas' },
    contraindicacoes:['Câncer ativo','Gravidez','Hipersensibilidade a fragmentos peptídicos'],
    efeitos:[
      { nome:'Vermelhidão local', tipo:'comum', mitigacao:'Rodar locais de injeção' },
      { nome:'Leve tontura', tipo:'raro', mitigacao:'Aplicar sentado, ingerir água' },
    ],
    interacoes:['Insulina: aplicar com intervalo mínimo de 30 min','Outros secretagogos de GH: efeito aditivo na lipólise'],
    evidencias:'Estudos pré-clínicos e fase I/II demonstraram eficácia em redução de gordura sem impacto no IGF-1 ou glicemia. Dados publicados na revista Obesity (2001).',
    faq:[
      { p:'É diferente do HGH?', r:'Sim. AOD-9604 é apenas o fragmento responsável pelo efeito lipolítico, sem efeitos de crescimento ou impacto na glicemia.' },
      { p:'Posso combinar com Semaglutide?', r:'Sim. A combinação é sinérgica — Semaglutide reduz apetite e AOD-9604 acelera a queima de gordura.' },
    ],
  },
  {
    id:'ipa', nome:'Ipamorelin', emoji:'🌙', categoria:'Secretagogo de GH', tagline:'Estimula o GH natural com mínimos efeitos colaterais',
    nivel:'iniciante', cor:'#7F77DD', bg:'#EEEDFE',
    classificacao:'GHRP Seletivo', evidencia:'Estudos Clínicos', meia_vida:'~2 horas', reconstituicao:'Fácil', nomes_alt:['NNC 26-0161'],
    mecanismo:'Ipamorelin estimula a glândula pituitária a liberar pulsos fisiológicos de GH sem elevar cortisol, prolactina ou ACTH. O aumento do GH ocorre em pulsos naturais, semelhantes ao padrão fisiológico noturno.',
    beneficios:['Melhora significativa da qualidade do sono','Aumento de GH fisiológico sem supressão do eixo HPA','Recuperação muscular acelerada','Auxílio na perda de gordura','Anti-aging — melhora da pele e composição corporal'],
    timeline:[
      { fase:'Semana 1-2', desc:'Melhora do sono percebida. GH começa a aumentar.' },
      { fase:'Semana 3-4', desc:'Recuperação muscular mais rápida. Energia aumentada.' },
      { fase:'Mês 2-3', desc:'Composição corporal melhorada. Pele com mais viço.' },
      { fase:'Mês 4+', desc:'Benefícios anti-aging evidentes. Manutenção dos resultados.' },
    ],
    protocolo:{ dose:'200-300 mcg/dose', freq:'1-2x ao dia', via:'SC', timing:'Antes de dormir em jejum de 2h (dose principal); manhã em jejum (opcional)', ciclo:'12-16 semanas', pausa:'4-8 semanas' },
    contraindicacoes:['Tumores dependentes de GH ou IGF-1','Retinopatia diabética','Gravidez','Síndrome de Prader-Willi'],
    efeitos:[
      { nome:'Leve flush (calor)', tipo:'comum', mitigacao:'Cede em minutos, injeção lenta' },
      { nome:'Formigamento', tipo:'comum', mitigacao:'Passageiro, cede espontaneamente' },
      { nome:'Retenção de água leve', tipo:'raro', mitigacao:'Geralmente resolve em 2-3 semanas' },
    ],
    interacoes:['CJC-1295: combinação clássica que amplifica o pulso de GH','Insulina: aplicar com intervalo de 30 min'],
    evidencias:'Estudos em humanos demonstraram aumento dose-dependente de GH sem elevação de cortisol ou prolactina. Estudos de sono mostram aumento do sono de ondas lentas.',
    faq:[
      { p:'Por que usar antes de dormir?', r:'O maior pulso natural de GH ocorre nas primeiras horas de sono. O Ipamorelin amplifica esse pulso fisiológico.' },
      { p:'Causa dependência?', r:'Não. O eixo HPA retorna ao normal após a pausa. Não há supressão do GH endógeno com uso responsável.' },
    ],
  },
  {
    id:'bpc', nome:'BPC-157', emoji:'🔄', categoria:'Peptídeo de Recuperação', tagline:'Regeneração de tecidos e recuperação acelerada',
    nivel:'iniciante', cor:'#EF9F27', bg:'#FAEEDA',
    classificacao:'Pentadecapeptídeo', evidencia:'Pré-clínico / Fase I', meia_vida:'~4 horas', reconstituicao:'Fácil', nomes_alt:['Body Protection Compound 157','PL 14736'],
    mecanismo:'BPC-157 é derivado de uma proteína de proteção gástrica humana. Estimula angiogênese, upregula fatores de crescimento (VEGF, EGF), reduz inflamação via inibição de NF-kB e promove migração de fibroblastos para reparação tecidual.',
    beneficios:['Cicatrização acelerada de tendões, ligamentos e músculos','Proteção e regeneração da mucosa gástrica','Ação anti-inflamatória sistêmica','Neuroproteção (em modelos animais)','Melhora da mobilidade articular'],
    timeline:[
      { fase:'Semana 1-2', desc:'Redução de dor e inflamação aguda.' },
      { fase:'Semana 3-4', desc:'Melhora de mobilidade. Cicatrização ativa.' },
      { fase:'Mês 2', desc:'Regeneração tecidual significativa.' },
      { fase:'Mês 2+', desc:'Consolidação da recuperação. Avaliação de continuidade.' },
    ],
    protocolo:{ dose:'250-500 mcg/dia', freq:'1-2x ao dia', via:'SC próximo à área lesionada; oral para efeito sistêmico/GI', timing:'Manhã e/ou noite — não requer jejum', ciclo:'4-8 semanas', pausa:'2-4 semanas' },
    contraindicacoes:['Câncer ativo (promove angiogênese)','Gravidez','Uso em crianças (falta de dados)'],
    efeitos:[
      { nome:'Tontura leve', tipo:'comum', mitigacao:'Injeção lenta, ficar deitado por 5 min' },
      { nome:'Náusea leve (oral)', tipo:'comum', mitigacao:'Tomar com alimento' },
    ],
    interacoes:['AINEs: pode potencializar proteção gástrica','Warfarina: monitorar coagulação','Corticosteroides: podem reduzir eficácia'],
    evidencias:'Mais de 300 estudos pré-clínicos demonstram eficácia em modelos de lesão. Sem efeitos tóxicos observados em doses terapêuticas.',
    faq:[
      { p:'Pode ser tomado por via oral?', r:'Sim. A via oral é eficaz para efeitos sistêmicos e gastrointestinais. Para lesões localizadas, SC próximo à área é mais direcionado.' },
      { p:'Quanto tempo para sentir efeito?', r:'Para lesões agudas, 1-2 semanas. Para condições crônicas, 4-6 semanas.' },
    ],
  },
  {
    id:'cjc', nome:'CJC-1295', emoji:'⚡', categoria:'GHRH Análogo', tagline:'Eleva o GH basal e prolonga seus efeitos',
    nivel:'avancado', cor:'#639922', bg:'#EAF3DE',
    classificacao:'GHRH Análogo (DAC)', evidencia:'Estudos Clínicos', meia_vida:'~8 dias (com DAC)', reconstituicao:'Moderada', nomes_alt:['CJC-1295 DAC','CJC-1295 no DAC','MOD-GRF 1-29'],
    mecanismo:'CJC-1295 é um análogo sintético do GHRH com meia-vida prolongada pela tecnologia DAC. Estimula a pituitária a produzir mais GH de forma sustentada. A versão sem DAC age de forma mais pulsátil e é frequentemente combinada com Ipamorelin.',
    beneficios:['Aumento sustentado dos níveis basais de GH e IGF-1','Melhora da composição corporal','Recuperação muscular acelerada','Anti-aging — pele, cabelo e ossos','Sinergia poderosa com Ipamorelin'],
    timeline:[
      { fase:'Semana 1-2', desc:'GH e IGF-1 começam a elevar. Sono pode melhorar.' },
      { fase:'Semana 3-6', desc:'Composição corporal melhorando. Recuperação mais rápida.' },
      { fase:'Mês 2-3', desc:'Resultados visíveis em massa magra e gordura.' },
      { fase:'Mês 4+', desc:'Benefícios anti-aging evidentes. Consolidação.' },
    ],
    protocolo:{ dose:'100-200 mcg/dose (sem DAC) ou 1-2 mg/semana (com DAC)', freq:'2-3x/semana (com DAC) ou diário (sem DAC)', via:'SC', timing:'Em jejum, preferencialmente à noite', ciclo:'12-16 semanas', pausa:'4-8 semanas' },
    contraindicacoes:['Acromegalia ativa','Câncer dependente de IGF-1','Retinopatia diabética'],
    efeitos:[
      { nome:'Retenção de água leve', tipo:'comum', mitigacao:'Geralmente resolve em 2-3 semanas' },
      { nome:'Dormência nas extremidades', tipo:'raro', mitigacao:'Reduzir dose se persistir' },
    ],
    interacoes:['Ipamorelin: combinação clássica e sinérgica','Insulina: aplicar com 30 min de intervalo','Glicocorticoides: reduzem resposta ao GH'],
    evidencias:'Estudos clínicos demonstram aumento de GH e IGF-1 de 2-10x com CJC-1295 DAC. Publicações em JCEM confirmam farmacocinética favorável.',
    faq:[
      { p:'Qual a diferença com e sem DAC?', r:'Com DAC: meia-vida de ~8 dias, usado 2x/semana. Sem DAC: meia-vida ~30 min, usado diariamente, perfil mais fisiológico.' },
    ],
  },
  {
    id:'mk677', nome:'MK-677 (Ibutamoren)', emoji:'💊', categoria:'Secretagogo Oral de GH', tagline:'O único secretagogo de GH ativo por via oral',
    nivel:'intermediario', cor:'#533AB7', bg:'#EEEDFE',
    classificacao:'Agonista de Ghrelina (Oral)', evidencia:'Fase II/III', meia_vida:'~24 horas', reconstituicao:'Não aplicável (oral)', nomes_alt:['Ibutamoren','Nutrobal','MK0677'],
    mecanismo:'MK-677 é um agonista não-peptídico do receptor de ghrelina (GHS-R1a). Mimetiza o efeito da ghrelina na pituitária, estimulando liberação de GH de forma sustentada. Único oralmente biodisponível em sua classe.',
    beneficios:['Administração oral — sem injeção','Aumento significativo de GH e IGF-1','Melhora dramática da qualidade e duração do sono','Aumento de massa muscular e força','Melhora da densidade óssea'],
    timeline:[
      { fase:'Semana 1', desc:'Melhora notável do sono desde os primeiros dias.' },
      { fase:'Semana 2-4', desc:'Aumento de apetite. GH e IGF-1 elevados.' },
      { fase:'Mês 2-3', desc:'Ganho de massa muscular e redução de gordura.' },
      { fase:'Mês 4+', desc:'Composição corporal otimizada. Benefícios sustentados.' },
    ],
    protocolo:{ dose:'10-25 mg/dia', freq:'1x/dia', via:'Oral (comprimido ou pó)', timing:'À noite antes de dormir', ciclo:'16-24 semanas', pausa:'4-8 semanas' },
    contraindicacoes:['Resistência à insulina severa ou DM2 mal controlado','Câncer ativo','Retenção de líquidos severa ou insuficiência cardíaca'],
    efeitos:[
      { nome:'Aumento de apetite', tipo:'comum', mitigacao:'Controlar ingestão calórica, planejamento alimentar' },
      { nome:'Retenção de água', tipo:'comum', mitigacao:'Reduz em 2-4 semanas. Monitorar PA' },
      { nome:'Leve elevação da glicemia', tipo:'raro', mitigacao:'Monitorar glicemia, especialmente em pré-diabéticos' },
    ],
    interacoes:['Insulina: pode elevar glicemia — ajuste necessário','Anticonvulsivantes: interação farmacocinética possível'],
    evidencias:'Múltiplos ensaios clínicos fase II demonstraram aumento de IGF-1 em 40-90% e GH em 3-5x. Estudos de 2 anos mostraram segurança em idosos.',
    faq:[
      { p:'Causa fome aumentada?', r:'Sim. O MK-677 estimula receptores de ghrelina. Isso pode ser desejável para ganho de massa, mas deve ser considerado em protocolos de perda de gordura.' },
      { p:'Retenção de água é normal?', r:'Sim, especialmente nas primeiras 2-4 semanas. Geralmente se reduz com o tempo.' },
    ],
  },
  {
    id:'tb500', nome:'TB-500', emoji:'🛡️', categoria:'Peptídeo de Recuperação', tagline:'Regeneração sistêmica e flexibilidade tecidual',
    nivel:'intermediario', cor:'#185FA5', bg:'#E6F1FB',
    classificacao:'Timosina Beta-4 Fragmento', evidencia:'Fase I/II (Cardíaco)', meia_vida:'~4-6 horas', reconstituicao:'Fácil', nomes_alt:['Thymosin Beta-4 Fragment','TB500'],
    mecanismo:'TB-500 é a versão sintética da Timosina Beta-4. Regula a actina, reduz inflamação, estimula diferenciação celular e promove migração de células-tronco para tecidos lesionados.',
    beneficios:['Recuperação acelerada de lesões musculares e tendíneas','Redução de fibrose e cicatrizes internas','Melhora da flexibilidade e mobilidade','Ação anti-inflamatória sistêmica potente','Regeneração de cabelo em algumas condições'],
    timeline:[
      { fase:'Semana 1-2', desc:'Redução de inflamação aguda. Dor diminui.' },
      { fase:'Semana 3-4', desc:'Mobilidade melhorada. Cicatrização ativa.' },
      { fase:'Mês 2', desc:'Recuperação significativa. Flexibilidade aumentada.' },
      { fase:'Mês 2+', desc:'Consolidação. Manutenção dos ganhos.' },
    ],
    protocolo:{ dose:'2-2.5 mg/dose', freq:'2x/semana (agudo) → 1x/semana (manutenção)', via:'SC ou IM', timing:'Sem restrição de horário ou jejum', ciclo:'4-6 semanas', pausa:'4-8 semanas' },
    contraindicacoes:['Câncer ativo','Gravidez','Doenças autoimunes ativas'],
    efeitos:[
      { nome:'Fadiga transitória', tipo:'comum', mitigacao:'Geralmente nas primeiras doses, cede' },
      { nome:'Tontura leve', tipo:'raro', mitigacao:'Injeção lenta, ficar deitado' },
    ],
    interacoes:['BPC-157: combinação sinérgica para recuperação','Corticosteroides: podem reduzir eficácia anti-inflamatória'],
    evidencias:'Ampla literatura pré-clínica. Estudos fase II para cardiomiopatia isquêmica. Timosina Beta-4 endógena amplamente estudada em biologia celular.',
    faq:[
      { p:'TB-500 é o mesmo que Timosina Beta-4?', r:'TB-500 é um fragmento ativo da Timosina Beta-4 (aminoácidos 17-23), responsável pelos efeitos reparadores. Mais estável e acessível.' },
    ],
  },
  {
    id:'ghk', nome:'GHK-Cu', emoji:'✨', categoria:'Peptídeo Anti-aging / Pele', tagline:'Regeneração cutânea e estimulação de colágeno',
    nivel:'iniciante', cor:'#BA7517', bg:'#FAEEDA',
    classificacao:'Peptídeo de Cobre', evidencia:'Estudos Clínicos / In Vitro', meia-vida:'~30 min (SC)', reconstituicao:'Fácil', nomes_alt:['Copper Peptide GHK','GHK Copper'],
    mecanismo:'GHK-Cu estimula síntese de colágeno e elastina, ativa genes de reparação celular (mais de 4.000 genes regulados), tem potente ação antioxidante e promove angiogênese local.',
    beneficios:['Regeneração e firmeza da pele','Redução de rugas e melhora da textura','Cicatrização de feridas acelerada','Estimulação do crescimento capilar','Ação antioxidante sistêmica'],
    timeline:[
      { fase:'Semana 1-2', desc:'Pele mais hidratada. Início da ativação de colágeno.' },
      { fase:'Semana 3-6', desc:'Textura melhorada. Rugas finas reduzidas.' },
      { fase:'Mês 2-3', desc:'Firmeza notável. Crescimento capilar visível.' },
      { fase:'Mês 3+', desc:'Resultados consolidados. Pele visivelmente renovada.' },
    ],
    protocolo:{ dose:'1-2 mg/dia (SC) ou uso tópico', freq:'Diário ou dias alternados', via:'SC ou tópico (0.1-1%)', timing:'Manhã ou noite, sem restrição', ciclo:'8-12 semanas', pausa:'4 semanas' },
    contraindicacoes:['Hemocromatose (sobrecarga de cobre)','Doença de Wilson','Gravidez'],
    efeitos:[
      { nome:'Bronzeamento leve', tipo:'comum', mitigacao:'Efeito de melanocortina, geralmente desejado' },
      { nome:'Irritação local (tópico)', tipo:'raro', mitigacao:'Diluir mais ou reduzir frequência' },
    ],
    interacoes:['Zinco em alta dose: competição de absorção — separar por 2h','Vitamina C: potencializa síntese de colágeno'],
    evidencias:'Mais de 50 estudos sobre regeneração cutânea e capilar. Estudos genômicos documentam regulação de mais de 4.000 genes humanos.',
    faq:[
      { p:'Via tópica é eficaz?', r:'Sim para efeitos cutâneos locais. SC tem maior biodisponibilidade sistêmica. Para pele/cabelo, o tópico tem bons resultados.' },
    ],
  },
  {
    id:'semax', nome:'Semax', emoji:'🧠', categoria:'Nootrópico Peptídico', tagline:'Performance cognitiva e neuroproteção',
    nivel:'intermediario', cor:'#D85A30', bg:'#FAECE7',
    classificacao:'Análogo do ACTH', evidencia:'Aprovado (Rússia)', meia_vida:'~20 min (intranasal)', reconstituicao:'Fácil', nomes_alt:['ACTH 4-10 Pro8','Semax Spray'],
    mecanismo:'Semax estimula produção de BDNF, aumenta neurotransmissão dopaminérgica e serotonérgica, e melhora o fluxo cerebral. Desenvolvido na Rússia para tratamento de AVC e déficits cognitivos.',
    beneficios:['Melhora do foco, memória de trabalho e velocidade de processamento','Aumento do BDNF — suporte à neuroplasticidade','Redução do estresse oxidativo cerebral','Ação ansiolítica em doses moderadas','Melhora da motivação e clareza mental'],
    timeline:[
      { fase:'Dia 1-3', desc:'Clareza mental aumentada. Foco melhorado.' },
      { fase:'Semana 1-2', desc:'Memória de trabalho notavelmente melhorada.' },
      { fase:'Semana 3-4', desc:'Capacidade de concentração sustentada. Humor estável.' },
      { fase:'Mês 2+', desc:'Benefícios neuroprotetores acumulados.' },
    ],
    protocolo:{ dose:'300-600 mcg/dia', freq:'5x/semana (ciclado)', via:'Intranasal (spray)', timing:'Manhã, em jejum ou com alimento leve', ciclo:'4-8 semanas', pausa:'2-4 semanas' },
    contraindicacoes:['Epilepsia (pode abaixar limiar)','Transtorno bipolar','Gravidez'],
    efeitos:[
      { nome:'Leve agitação', tipo:'comum', mitigacao:'Reduzir dose, evitar combinação com estimulantes' },
      { nome:'Irritação nasal', tipo:'comum', mitigacao:'Alternar narinas, salina antes da aplicação' },
    ],
    interacoes:['Estimulantes (cafeína, modafinil): potencialização — cuidado com ansiedade','Antidepressivos: monitorar serotonina'],
    evidencias:'Aprovado na Rússia como medicamento para AVC. Múltiplos estudos clínicos com resultados positivos. Pesquisa ocidental crescente sobre BDNF.',
    faq:[
      { p:'Por que via intranasal?', r:'Permite acesso direto ao SNC via nervo olfatório, aumentando significativamente a biodisponibilidade.' },
      { p:'Causa tolerância?', r:'Pode ocorrer com uso contínuo. O protocolo ciclado (5x/sem com pausas) é recomendado.' },
    ],
  },
  {
    id:'tirze', nome:'Tirzepatide', emoji:'⚡', categoria:'GIP/GLP-1 Agonista', tagline:'O mais potente para perda de gordura — duplo agonista',
    nivel:'avancado', cor:'#0F6E56', bg:'#E1F5EE',
    classificacao:'Agonista Dual GIP/GLP-1', evidencia:'Aprovado (FDA/EMA)', meia_vida:'~5 dias', reconstituicao:'Fácil', nomes_alt:['Mounjaro','Zepbound','LY3298176'],
    mecanismo:'Tirzepatide age simultaneamente em dois eixos metabólicos: GLP-1 reduz apetite e retarda esvaziamento gástrico; GIP melhora sensibilidade à insulina e potencializa efeito anorético. Ação dual explica superioridade vs Semaglutide.',
    beneficios:['Perda de peso superior ao Semaglutide (média 22% nos estudos SURMOUNT)','Melhora marcante da resistência à insulina','Redução de triglicerídeos e melhora do perfil lipídico','Maior preservação de massa muscular vs outros GLP-1'],
    timeline:[
      { fase:'Semana 1-2', desc:'Efeitos mínimos; composto se acumulando.' },
      { fase:'Semana 3-4', desc:'Supressão do apetite. Possíveis efeitos GI leves.' },
      { fase:'Mês 2-3', desc:'Perda de peso mais significativa. Efeitos GI diminuem.' },
      { fase:'Mês 3-6', desc:'Perda contínua e controle glicêmico aprimorado.' },
      { fase:'Mês 6+', desc:'Manutenção. Avaliação de ajuste de dosagem.' },
    ],
    protocolo:{ dose:'2.5 mg/sem (início) → 5-15 mg/sem (manutenção)', freq:'1x por semana, mesmo dia', via:'SC — abdômen, coxa ou braço', timing:'Qualquer horário', ciclo:'24-52 semanas', pausa:'8-12 semanas' },
    contraindicacoes:['Carcinoma medular da tireoide','NEM2','Pancreatite aguda','Gastroparesia severa','Gravidez'],
    efeitos:[
      { nome:'Náusea', tipo:'comum', mitigacao:'Escalada lenta de dose, refeições menores' },
      { nome:'Vômito', tipo:'comum', mitigacao:'Evitar alimentos gordurosos, hidratação' },
      { nome:'Diarreia', tipo:'comum', mitigacao:'Cede em 2-4 semanas, hidratação adequada' },
      { nome:'Pancreatite', tipo:'raro', mitigacao:'Parar imediatamente se dor abdominal severa' },
    ],
    interacoes:['Insulina: risco de hipoglicemia — reduzir dose 20-30%','Anticoagulantes: monitorar periodicamente'],
    evidencias:'Estudos SURMOUNT-1 a 4: perda de 22.5% em 72 semanas com 15mg. Superior ao Semaglutide no SURMOUNT-5. Aprovado FDA 2022 (Mounjaro) e 2023 (Zepbound).',
    faq:[
      { p:'É melhor que o Semaglutide?', r:'Em média sim — os estudos mostram maior perda de peso. Porém tolerabilidade varia individualmente.' },
      { p:'Efeitos colaterais são piores?', r:'Perfil similar ao Semaglutide. A escalada lenta minimiza os efeitos GI.' },
    ],
  },
];

const CATEGORIAS = ['Todos', ...Array.from(new Set(PEPTIDEOS.map(p=>p.categoria)))];
const NIVEIS = { iniciante:'Iniciante', intermediario:'Intermediário', avancado:'Avançado' };
const NIVEL_COR = { iniciante:'#1D9E75', intermediario:'#EF9F27', avancado:'#D85A30' };
const NIVEL_BG  = { iniciante:'#E1F5EE', intermediario:'#FAEEDA', avancado:'#FAECE7' };
const EV_COR = { 'Aprovado (FDA/ANVISA)':'#1D9E75', 'Aprovado (FDA/EMA)':'#1D9E75', 'Aprovado (Rússia)':'#378ADD', 'Fase II/III':'#EF9F27', 'Fase II (Clínico)':'#EF9F27', 'Estudos Clínicos':'#EF9F27', 'Pré-clínico / Fase I':'#D85A30', 'Fase I/II (Cardíaco)':'#D85A30', 'Estudos Clínicos / In Vitro':'#EF9F27' };
const EV_BG  = { 'Aprovado (FDA/ANVISA)':'#E1F5EE', 'Aprovado (FDA/EMA)':'#E1F5EE', 'Aprovado (Rússia)':'#E6F1FB', 'Fase II/III':'#FAEEDA', 'Fase II (Clínico)':'#FAEEDA', 'Estudos Clínicos':'#FAEEDA', 'Pré-clínico / Fase I':'#FAECE7', 'Fase I/II (Cardíaco)':'#FAECE7', 'Estudos Clínicos / In Vitro':'#FAEEDA' };

export default function SectionLib() {
  const [busca,     setBusca]     = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [ativo,     setAtivo]     = useState(null);
  const [aba,       setAba]       = useState("visao");

  const filtrado = PEPTIDEOS.filter(p => {
    const bOk = !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.categoria.toLowerCase().includes(busca.toLowerCase()) || p.tagline.toLowerCase().includes(busca.toLowerCase());
    const cOk = categoria === "Todos" || p.categoria === categoria;
    return bOk && cOk;
  });

  const P = PEPTIDEOS.find(p => p.id === ativo);

  if (P) {
    return (
      <div style={{ maxWidth:900 }}>
        {/* Breadcrumb */}
        <button onClick={()=>setAtivo(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--ts)", fontFamily:"inherit", marginBottom:"1.25rem", padding:0 }}>
          ← Biblioteca
        </button>

        {/* Hero do peptídeo */}
        <div style={{ background:`linear-gradient(135deg, ${P.bg} 0%, var(--bg) 60%)`, border:`1px solid ${P.cor}30`, borderRadius:16, padding:"1.5rem", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
            <div style={{ width:56, height:56, background:"white", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", flexShrink:0, boxShadow:`0 2px 12px ${P.cor}20` }}>
              {P.emoji}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                <span style={{ fontSize:11, padding:"2px 9px", borderRadius:100, background:P.bg, color:P.cor, fontWeight:600, border:`1px solid ${P.cor}30` }}>{P.categoria}</span>
                <span style={{ fontSize:11, padding:"2px 9px", borderRadius:100, background:NIVEL_BG[P.nivel], color:NIVEL_COR[P.nivel], fontWeight:600 }}>{NIVEIS[P.nivel]}</span>
                {P.nomes_alt?.slice(0,2).map(n => (
                  <span key={n} style={{ fontSize:11, padding:"2px 9px", borderRadius:100, background:"var(--bg2)", color:"var(--ts)", border:"1px solid var(--border)" }}>{n}</span>
                ))}
              </div>
              <h2 style={{ fontSize:"1.4rem", fontWeight:500, letterSpacing:"-.04em", color:"var(--tx)", marginBottom:4 }}>{P.nome}</h2>
              <p style={{ fontSize:13, color:P.cor, fontWeight:500, margin:0 }}>{P.tagline}</p>
            </div>
          </div>
        </div>

        {/* Layout 2 colunas: conteúdo + fatos rápidos */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:"1.25rem", alignItems:"start" }}>

          {/* Coluna principal */}
          <div>
            {/* Abas */}
            <div style={{ display:"flex", borderBottom:"1px solid var(--border)", marginBottom:"1.25rem", overflowX:"auto" }}>
              {[["visao","Visão Geral"],["protocolo","Protocolo"],["seguranca","Segurança"],["faq","FAQ"]].map(([v,l]) => (
                <button key={v} onClick={()=>setAba(v)}
                  style={{ padding:"10px 16px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:500, color:aba===v?"var(--tx)":"var(--ts)", borderBottom:aba===v?`2px solid ${P.cor}`:"2px solid transparent", whiteSpace:"nowrap", flexShrink:0 }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Aba: Visão Geral */}
            {aba === "visao" && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"var(--ts)", marginBottom:"1rem" }}>Como funciona</div>
                  <p style={{ fontSize:13, color:"var(--tx)", lineHeight:1.8, margin:0 }}>{P.mecanismo}</p>
                </div>

                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"var(--ts)", marginBottom:"1rem" }}>Benefícios documentados</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {P.beneficios.map((b,i) => (
                      <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:"var(--tx)", lineHeight:1.5 }}>
                        <span style={{ color:P.cor, flexShrink:0 }}>✓</span>{b}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Linha do tempo de resultados */}
                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"var(--ts)", marginBottom:"1rem" }}>Linha do tempo de resultados</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                    {P.timeline.map((t, i) => (
                      <div key={i} style={{ display:"flex", gap:12, paddingBottom: i < P.timeline.length-1 ? "1rem" : 0 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                          <div style={{ width:10, height:10, borderRadius:"50%", background:P.cor, flexShrink:0, marginTop:3 }}/>
                          {i < P.timeline.length-1 && <div style={{ width:2, flex:1, background:`${P.cor}30`, marginTop:4 }}/>}
                        </div>
                        <div style={{ paddingBottom: i < P.timeline.length-1 ? 0 : 0 }}>
                          <div style={{ fontSize:11, fontWeight:600, color:P.cor, marginBottom:2 }}>{t.fase}</div>
                          <div style={{ fontSize:12, color:"var(--tm)", lineHeight:1.6 }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"var(--ts)", marginBottom:".75rem" }}>Base de evidências</div>
                  <p style={{ fontSize:13, color:"var(--tm)", lineHeight:1.7, margin:0 }}>{P.evidencias}</p>
                </div>
              </div>
            )}

            {/* Aba: Protocolo */}
            {aba === "protocolo" && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                  {[["Dose",P.protocolo.dose],["Frequência",P.protocolo.freq],["Via de aplicação",P.protocolo.via],["Timing",P.protocolo.timing],["Duração do ciclo",P.protocolo.ciclo],["Pausa entre ciclos",P.protocolo.pausa]].map(([l,v]) => (
                    <div key={l} className="dc" style={{ marginBottom:0 }}>
                      <div style={{ fontSize:10, fontWeight:600, color:"var(--ts)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:6 }}>{l}</div>
                      <div style={{ fontSize:13, color:"var(--tx)", lineHeight:1.4 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:`${P.cor}10`, border:`1px solid ${P.cor}25`, borderRadius:12, padding:"1rem 1.25rem", fontSize:12, color:P.cor, lineHeight:1.65 }}>
                  ⚠️ Protocolo educativo. Doses individuais variam. Consulte um médico especializado antes de iniciar qualquer protocolo de peptídeos.
                </div>
              </div>
            )}

            {/* Aba: Segurança */}
            {aba === "seguranca" && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                {/* Efeitos colaterais */}
                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"var(--ts)", marginBottom:"1rem" }}>
                    Efeitos colaterais
                    <span style={{ marginLeft:8, fontSize:10, fontWeight:500, color:"var(--ts)" }}>
                      {P.efeitos.filter(e=>e.tipo==="comum").length} comuns · {P.efeitos.filter(e=>e.tipo==="raro").length} raros
                    </span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {P.efeitos.map((e,i) => (
                      <div key={i} style={{ background:"var(--bg2)", borderRadius:10, padding:"10px 12px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:11, fontWeight:600, color:"var(--tx)" }}>{e.nome}</span>
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:100, background:e.tipo==="comum"?"#FAEEDA":"#FAECE7", color:e.tipo==="comum"?"#BA7517":"#993C1D", fontWeight:600 }}>
                            {e.tipo === "comum" ? "Comum" : "Raro"}
                          </span>
                        </div>
                        <div style={{ fontSize:11, color:"var(--ts)", lineHeight:1.5 }}>Mitigação: {e.mitigacao}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"#D85A30", marginBottom:"1rem" }}>Contraindicações</div>
                  {P.contraindicacoes.map((c,i) => (
                    <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:"var(--tx)", marginBottom:8, lineHeight:1.5 }}>
                      <span style={{ color:"#D85A30", flexShrink:0 }}>×</span>{c}
                    </div>
                  ))}
                </div>

                <div className="dc">
                  <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"#EF9F27", marginBottom:"1rem" }}>Interações relevantes</div>
                  {P.interacoes.map((int,i) => (
                    <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:"var(--tx)", marginBottom:8, lineHeight:1.5 }}>
                      <span style={{ color:"#EF9F27", flexShrink:0 }}>⚡</span>{int}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aba: FAQ */}
            {aba === "faq" && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {P.faq.map((item,i) => (
                  <div key={i} className="dc">
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--tx)", marginBottom:".625rem" }}>❓ {item.p}</div>
                    <div style={{ fontSize:13, color:"var(--tm)", lineHeight:1.7 }}>{item.r}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Fatos Rápidos */}
          <div style={{ position:"sticky", top:"1rem" }}>
            <div className="dc" style={{ marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".07em", color:"var(--ts)", marginBottom:"1rem" }}>Fatos Rápidos</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  ["Classificação", P.classificacao, null],
                  ["Nível de evidência", P.evidencia, { bg: EV_BG[P.evidencia]||"#FAEEDA", cor: EV_COR[P.evidencia]||"#EF9F27" }],
                  ["Meia-vida", P.meia_vida, null],
                  ["Reconstituição", P.reconstituicao, null],
                ].map(([l,v,badge]) => (
                  <div key={l} style={{ borderBottom:"0.5px solid var(--border)", paddingBottom:12 }}>
                    <div style={{ fontSize:10, color:"var(--ts)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:4 }}>{l}</div>
                    {badge ? (
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:badge.bg, color:badge.cor, fontWeight:600 }}>{v}</span>
                    ) : (
                      <div style={{ fontSize:12, fontWeight:500, color:"var(--tx)" }}>{v}</div>
                    )}
                  </div>
                ))}

                {P.nomes_alt && P.nomes_alt.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, color:"var(--ts)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Nomes alternativos</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {P.nomes_alt.map(n => (
                        <span key={n} style={{ fontSize:10, padding:"2px 7px", borderRadius:100, background:"var(--bg2)", color:"var(--tm)", border:"1px solid var(--border)" }}>{n}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize:10, color:"var(--ts)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>Categoria</div>
                  <span style={{ fontSize:11, padding:"2px 9px", borderRadius:100, background:P.bg, color:P.cor, fontWeight:600, border:`1px solid ${P.cor}30` }}>{P.categoria}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:"1.25rem" }}>
        <h2 style={{ fontSize:"1.2rem", fontWeight:500, letterSpacing:"-.04em", marginBottom:".25rem" }}>Biblioteca de peptídeos</h2>
        <p style={{ fontSize:13, color:"var(--tm)" }}>Conteúdo educacional completo — mecanismo, protocolo e segurança</p>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:"1rem", flexWrap:"wrap" }}>
        <input className="inp" placeholder="🔍 Buscar peptídeo ou categoria..." value={busca} onChange={e=>setBusca(e.target.value)} style={{ flex:1, minWidth:200, marginBottom:0 }}/>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:"1.25rem", flexWrap:"wrap" }}>
        {CATEGORIAS.map(c => (
          <button key={c} onClick={()=>setCategoria(c)}
            style={{ padding:"5px 12px", borderRadius:100, fontSize:12, fontWeight:500, cursor:"pointer", transition:"all .13s", border:`1px solid ${categoria===c?"var(--green)":"var(--border)"}`, background:categoria===c?"var(--gp)":"var(--bg2)", color:categoria===c?"var(--gm)":"var(--tm)", fontFamily:"inherit" }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:12 }}>
        {filtrado.map(p => (
          <div key={p.id}
            style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"border-color .15s, transform .15s, box-shadow .15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=p.cor; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 20px ${p.cor}15`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            onClick={()=>{ setAtivo(p.id); setAba("visao"); }}>
            <div style={{ height:4, background:p.cor }}/>
            <div style={{ padding:"1.25rem" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:".875rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:40, height:40, background:p.bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0 }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:"var(--tx)", marginBottom:2 }}>{p.nome}</div>
                    <div style={{ fontSize:10, color:p.cor, fontWeight:500 }}>{p.categoria}</div>
                  </div>
                </div>
                <span style={{ fontSize:9, padding:"2px 7px", borderRadius:100, background:NIVEL_BG[p.nivel], color:NIVEL_COR[p.nivel], fontWeight:600, flexShrink:0 }}>
                  {NIVEIS[p.nivel]}
                </span>
              </div>
              <p style={{ fontSize:12, color:"var(--tm)", lineHeight:1.55, margin:"0 0 10px" }}>{p.tagline}</p>
              {p.evidencia && (
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:100, background:EV_BG[p.evidencia]||"#FAEEDA", color:EV_COR[p.evidencia]||"#EF9F27", fontWeight:600 }}>
                  {p.evidencia}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtrado.length === 0 && (
        <div style={{ textAlign:"center", padding:"3rem", color:"var(--ts)", fontSize:13 }}>
          Nenhum peptídeo encontrado para "{busca}"
        </div>
      )}

      <div style={{ marginTop:"1.25rem", fontSize:11, color:"var(--ts)", textAlign:"center" }}>
        {PEPTIDEOS.length} peptídeos documentados · Conteúdo educacional · Não substitui avaliação médica
      </div>
    </div>
  );
}
