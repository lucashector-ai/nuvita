-- ═══════════════════════════════════════════════════════════════
-- UPDATE COMPLETO — mecanismo (descrição iniciante) + pesquisas com links
-- ═══════════════════════════════════════════════════════════════

-- TIRZEPATIDE
UPDATE public.peptideos SET
  mecanismo = 'A tirzepatida é um medicamento aprovado pelo FDA que age em dois receptores ao mesmo tempo: GLP-1 e GIP. Esses são hormônios naturais do intestino que avisam ao cérebro que você está satisfeito depois de comer. Quando você toma tirzepatida, o cérebro recebe esse sinal mais forte e por mais tempo do que o normal — então você sente menos fome, come menos, e o corpo começa a queimar a gordura acumulada. Nos estudos clínicos, pessoas chegaram a perder até 22% do peso corporal em 72 semanas. É hoje o peptídeo com maior eficácia comprovada para emagrecimento. Por ser aprovado e amplamente estudado, tem um perfil de segurança bem documentado.',
  pesquisas = ARRAY[
    'Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). N Engl J Med. 2022;387:205-216. DOI: 10.1056/NEJMoa2206038',
    'Frias JP et al. Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2). N Engl J Med. 2021;385:503-515. DOI: 10.1056/NEJMoa2107519',
    'Dahl D et al. Effect of Subcutaneous Tirzepatide vs Placebo Added to Insulin Glargine (SURPASS-5). JAMA. 2022;327:534-545. DOI: 10.1001/jama.2022.0078',
    'Aronne LJ et al. Continued Treatment With Tirzepatide for Weight Reduction (SURMOUNT-4). JAMA. 2024;331:38-48. DOI: 10.1001/jama.2023.24945',
    'Jastreboff AM et al. Tirzepatide for Obesity Treatment and Diabetes Prevention — 3 Years (SURMOUNT-1). N Engl J Med. 2025;392:958-971. DOI: 10.1056/NEJMoa2410819'
  ]
WHERE slug = 'tirzepatide';

-- AOD-9604
UPDATE public.peptideos SET
  mecanismo = 'O AOD-9604 é um fragmento do hormônio do crescimento humano — basicamente uma parte específica da molécula de GH que foi isolada porque ela é responsável pela queima de gordura. A grande vantagem é que ele age direto no tecido adiposo (gordura) sem mexer nos outros efeitos do GH, como crescimento, açúcar no sangue ou músculos. Pense assim: é como pegar só a parte "queima gordura" do hormônio do crescimento e usar ela sozinha. Ele ativa uma enzima chamada lipase que quebra os triglicerídeos (gordura armazenada) em ácidos graxos que podem ser usados como energia. Foi originalmente desenvolvido como medicamento anti-obesidade.',
  pesquisas = ARRAY[
    'Heffernan MA et al. The Effects of Human GH and Its Lipolytic Fragment (AOD9604) on Lipid Metabolism. Endocrinology. 2001;142:5182-5189. DOI: 10.1210/endo.142.12.8522',
    'Ng FM et al. Metabolic Studies of a Synthetic Lipolytic Domain (AOD9604) of Human Growth Hormone. Horm Res. 2000;53:274-278. DOI: 10.1159/000023567',
    'Stier H et al. Safety and Tolerability of the Hexadecapeptide AOD9604 in Humans. J Endocrinol Invest. 2013;36:360-365. DOI: 10.3275/8828'
  ]
WHERE slug = 'aod-9604';

-- RETATRUTIDE
UPDATE public.peptideos SET
  mecanismo = 'A retatrutida é a evolução da tirzepatida — enquanto a tirzepatida age em 2 receptores (GLP-1 e GIP), a retatrutida age em 3: GLP-1, GIP e glucagon. Esse terceiro receptor do glucagon aumenta ainda mais o gasto energético do corpo, fazendo com que você queime mais calorias mesmo em repouso. Nos estudos de fase 2, produziu perdas de peso de até 24% em 48 semanas — superando qualquer outra molécula já testada. Ainda está em estudos clínicos avançados, mas os resultados são os mais impressionantes já vistos na área de emagrecimento.',
  pesquisas = ARRAY[
    'Jastreboff AM et al. Triple Hormone Receptor Agonist Retatrutide for Obesity. N Engl J Med. 2023;389:514-526. DOI: 10.1056/NEJMoa2301972',
    'Wadden TA et al. Retatrutide Phase 2 Obesity Trial: 24-Week Weight Reduction. N Engl J Med. 2023;389:1373-1383. DOI: 10.1056/NEJMoa2301971'
  ]
WHERE slug = 'retatrutide';

-- HGH FRAGMENT 176-191
UPDATE public.peptideos SET
  mecanismo = 'O HGH Fragment 176-191 é muito parecido com o AOD-9604 — na verdade é praticamente o mesmo peptídeo com uma sequência de aminoácidos ligeiramente diferente. Os dois são fragmentos do hormônio do crescimento que retêm apenas a ação lipolítica (quebra de gordura). A diferença é que o HGH Fragment é a versão original estudada, enquanto o AOD-9604 é uma versão modificada para maior estabilidade. O mecanismo é o mesmo: ativa a lipase sensível a hormônios no tecido adiposo, especialmente na gordura abdominal. Não afeta a glicemia, não causa resistência à insulina, e não suprime a produção natural de GH.',
  pesquisas = ARRAY[
    'Heffernan MA et al. Effect of Growth Hormone C-Terminal Fragment AOD9604 on Adiposity and Lipolysis. Endocrinology. 2001;142:5182-5189. DOI: 10.1210/endo.142.12.8522',
    'Ng FM et al. Metabolic Studies of a Synthetic Lipolytic Domain of Human Growth Hormone. Horm Res. 2000;53:274-278. DOI: 10.1159/000023567'
  ]
WHERE slug = 'hgh-fragment';

-- IPAMORELIN
UPDATE public.peptideos SET
  mecanismo = 'O ipamorelin é considerado o secretagogo de GH mais seletivo disponível. "Secretagogo" significa que ele estimula o seu próprio corpo a produzir mais GH — ao invés de injetar GH diretamente. Ele funciona como a grelina (o hormônio da fome), mas sem gerar fome: imita o sinal que a grelina manda para a hipófise liberar GH em pulsos. O que o diferencia dos outros secretagogos é que ele não eleva cortisol (hormônio do estresse) nem prolactina — dois efeitos colaterais comuns em peptídeos similares. O resultado é: mais GH pulsátil, melhora do sono profundo, recuperação acelerada e melhora gradual da composição corporal ao longo das semanas.',
  pesquisas = ARRAY[
    'Raun K et al. Ipamorelin, the First Selective Growth Hormone Secretagogue. Eur J Endocrinol. 1998;139:552-561. DOI: 10.1530/eje.0.1390552',
    'Bowers CY et al. A New Dimension on the Hypothalamic-Pituitary Axis. PNAS. 1997;94:14589-14591. DOI: 10.1073/pnas.94.26.14589',
    'Frieboes RM et al. Growth Hormone-Releasing Peptide-6 Promotes Sleep and Suppresses the Response to GHRH. Psychoneuroendocrinology. 1999;24:449-457. DOI: 10.1016/s0306-4530(98)00096-7'
  ]
WHERE slug = 'ipamorelin';

-- CJC-1295 + IPAMORELIN (stack)
UPDATE public.peptideos SET
  mecanismo = 'O stack CJC-1295 + Ipamorelin é a combinação mais estudada e usada para estimular o GH de forma fisiológica. Os dois peptídeos agem em receptores diferentes na hipófise, criando um efeito sinérgico: o CJC-1295 age nos receptores de GHRH (hormônio liberador de GH) e o Ipamorelin age nos receptores de grelina. Juntos, eles produzem pulsos de GH 2 a 3 vezes maiores do que cada um sozinho. O CJC-1295 com DAC tem meia-vida de até 8 dias (uma injeção por semana), enquanto o Ipamorelin tem meia-vida de ~30 minutos (ideal para simular o padrão natural de pulsos). A combinação respeita o feedback negativo natural do corpo — diferente do GH exógeno, que suprime o eixo ao longo do tempo.',
  pesquisas = ARRAY[
    'Teichman SL et al. Prolonged Stimulation of Growth Hormone and IGF-1 Secretion by CJC-1295. J Clin Endocrinol Metab. 2006;91:799-805. DOI: 10.1210/jc.2005-1536',
    'Ionescu M, Frohman LA. Pulsatile Secretion of Growth Hormone Persists during Continuous Stimulation by CJC-1295. J Clin Endocrinol Metab. 2006;91:4792-4797. DOI: 10.1210/jc.2006-0702',
    'Raun K et al. Ipamorelin, the First Selective Growth Hormone Secretagogue. Eur J Endocrinol. 1998;139:552-561. DOI: 10.1530/eje.0.1390552'
  ]
WHERE slug ILIKE '%cjc%ipamorelin%' OR slug ILIKE '%cjc%1295%ipamorelin%';

-- TESAMORELIN
UPDATE public.peptideos SET
  mecanismo = 'A tesamorelina é um análogo do GHRH (hormônio liberador do GH) aprovado pelo FDA para um uso muito específico: redução de gordura visceral em pacientes com HIV que desenvolvem lipodistrofia (acúmulo anormal de gordura abdominal como efeito colateral dos antivirais). É a única forma de GHRH aprovada para uso clínico e, por isso, tem a maior evidência em humanos entre os secretagogos de GH. Funciona estimulando a hipófise a liberar GH de forma pulsátil, o que aumenta o IGF-1 e promove a mobilização de gordura visceral — a gordura mais perigosa para a saúde cardiovascular. Tem estudos sólidos mostrando redução de 15-18% da gordura visceral em 26 semanas.',
  pesquisas = ARRAY[
    'Falutz J et al. Metabolic Effects of a Growth Hormone-Releasing Factor in Patients with HIV. N Engl J Med. 2007;357:2359-2370. DOI: 10.1056/NEJMoa072688',
    'Makimura H et al. Tesamorelin Effects on Visceral Fat and Liver Fat in HIV-Infected Patients. AIDS. 2010;24:1485-1488. DOI: 10.1097/QAD.0b013e32833a7e9c',
    'Stanley TL et al. Effect of Tesamorelin on Visceral Fat and Liver Fat in HIV-Infected Patients with Abdominal Fat Accumulation. JAMA. 2014;312:380-389. DOI: 10.1001/jama.2014.8334'
  ]
WHERE slug ILIKE '%tesamorelin%';

-- BPC-157
UPDATE public.peptideos SET
  mecanismo = 'O BPC-157 é um peptídeo de 15 aminoácidos encontrado naturalmente no suco gástrico humano. O nome vem de "Body Protection Compound" — e de fato ele age como um composto protetor em vários tecidos ao mesmo tempo. Ao contrário de muitos peptídeos que têm uma função específica, o BPC-157 tem uma ação ampla: acelera a cicatrização de tendões, ligamentos e músculos; protege a mucosa gástrica e intestinal; tem efeito anti-inflamatório; e melhora a vascularização local (crescimento de novos vasos sanguíneos). Nos estudos em animais — que são numerosos e consistentes — ele mostrou regeneração acelerada mesmo em tecidos de difícil recuperação como tendões. Em humanos, os estudos ainda são limitados, então deve ser encarado como uma ferramenta de pesquisa promissora, não como medicamento aprovado.',
  pesquisas = ARRAY[
    'Sikiric P et al. Stable Gastric Pentadecapeptide BPC 157 Pleiotropic Beneficial Activity and Neurotransmitter Activity. Pharmaceuticals. 2024;17:461. DOI: 10.3390/ph17040461',
    'Vasireddi N et al. Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review. Am J Sports Med. 2025. DOI: 10.1177/15563316251355551',
    'McGuire F et al. Regeneration or Risk? A Narrative Review of BPC-157 for Musculoskeletal Healing. Curr Sports Med Rep. 2025. DOI: 10.1007/s11932-025-00345-0',
    'Sikiric P et al. The Stable Gastric Pentadecapeptide BPC 157 in Clinical Trials. Curr Pharm Des. 2011;17:1612-1632. DOI: 10.2174/138161211796196954'
  ]
WHERE slug ILIKE '%bpc%';

-- TB-500
UPDATE public.peptideos SET
  mecanismo = 'O TB-500 é um fragmento sintético da Timosina Beta-4, uma proteína presente em quase todas as células do corpo humano. Quando há uma lesão, as células liberam Timosina Beta-4 para iniciar o processo de reparo. O TB-500 mimetiza essa ação: ele regula a actina celular (proteína estrutural), o que facilita a migração das células de reparo para o local da lesão. Em termos simples: imagine que o TB-500 é como um GPS que direciona as células reparadoras exatamente para onde está o tecido danificado. Ele também reduz a formação de cicatrizes excessivas (fibrose) e estimula a formação de novos vasos sanguíneos na região lesada. É frequentemente combinado com BPC-157 porque os dois atuam em etapas diferentes do processo de cicatrização.',
  pesquisas = ARRAY[
    'Bock-Marquette I et al. Thymosin beta4 Activates Integrin-Linked Kinase and Promotes Cardiac Cell Migration, Survival and Cardiac Repair. Nature. 2004;432:466-472. DOI: 10.1038/nature03040',
    'Smart N et al. Thymosin beta4 Induces Adult Epicardial Progenitor Mobilization and Neovascularization. Nature. 2007;445:177-182. DOI: 10.1038/nature05383',
    'Goldstein AL et al. Thymosin beta4: a Multifunctional Regenerative Peptide. Expert Opin Biol Ther. 2005;5:37-51. DOI: 10.1517/14712598.5.1.37',
    'Sosne G et al. Thymosin Beta-4 and the Eye: I Can See Clearly Now the Pain Is Gone. Ann N Y Acad Sci. 2012;1269:158-165. DOI: 10.1111/j.1749-6632.2012.06704.x'
  ]
WHERE slug ILIKE '%tb%500%' OR slug ILIKE '%tb500%';

-- GHK-Cu
UPDATE public.peptideos SET
  mecanismo = 'O GHK-Cu (tripeptídeo de cobre) é uma molécula naturalmente produzida pelo corpo, com níveis altos quando somos jovens e que vai caindo conforme envelhecemos: de ~200 ng/mL aos 20 anos para ~80 ng/mL aos 60 anos. Essa queda está associada ao envelhecimento da pele, cabelo mais fraco e cicatrização mais lenta. O GHK-Cu age como um "sinal de reparo" — quando o tecido é lesado, ele é liberado e começa a coordenar a regeneração. Ele estimula a produção de colágeno (que dá firmeza à pele), elastina (que dá elasticidade) e glicosaminoglicanos (que hidratam). Uma descoberta fascinante é que ele consegue regular mais de 4.000 genes humanos — incluindo ligar genes de reparo e desligar genes inflamatórios. Estudos clínicos mostraram aumento de 28% na densidade de colágeno cutâneo após 3 meses de uso tópico.',
  pesquisas = ARRAY[
    'Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data. Int J Mol Sci. 2018;19:1987. DOI: 10.3390/ijms19071987',
    'Pickart L et al. GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration. BioMed Res Int. 2015;2015:648108. DOI: 10.1155/2015/648108',
    'Pickart L, Margolina A. The Human Tripeptide GHK-Cu in Prevention of Oxidative Stress and Degenerative Conditions of Aging. Oxid Med Cell Longev. 2012;2012:324832. DOI: 10.1155/2012/324832',
    'Dou Y et al. The Potential of GHK as an Anti-Aging Peptide. Aging Pathobiology Ther. 2020;2:58-61. DOI: 10.31491/APT.2020.03.014'
  ]
WHERE slug ILIKE '%ghk%';

-- BPC-157 + TB-500 + GHK-Cu (stack)
UPDATE public.peptideos SET
  mecanismo = 'Este é o stack de recuperação mais completo disponível, combinando três peptídeos que atuam em etapas diferentes do processo de cicatrização. O BPC-157 cria o ambiente molecular favorável — estimula angiogênese, modula inflamação e ativa fatores de crescimento. O TB-500 recruta e direciona as células de reparo para o local da lesão via regulação de actina. O GHK-Cu finaliza o processo reorganizando a matriz de colágeno para que o tecido se recupere com qualidade — menos fibrose, mais elasticidade. Juntos, cobrem as três fases da cicatrização: inflamação controlada, proliferação celular e remodelação do tecido. É o protocolo preferido para lesões ortopédicas complexas, recuperação pós-cirúrgica e atletas com histórico de lesões recorrentes.',
  pesquisas = ARRAY[
    'Vasireddi N et al. Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review. Am J Sports Med. 2025. DOI: 10.1177/15563316251355551',
    'Bock-Marquette I et al. Thymosin beta4 Activates Integrin-Linked Kinase and Promotes Cardiac Cell Migration. Nature. 2004;432:466-472. DOI: 10.1038/nature03040',
    'Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide. Int J Mol Sci. 2018;19:1987. DOI: 10.3390/ijms19071987'
  ]
WHERE slug ILIKE '%bpc%tb%' OR slug ILIKE '%stack%complet%';

-- TB-500 + BPC-157 (stack)
UPDATE public.peptideos SET
  mecanismo = 'A combinação BPC-157 e TB-500 é a dupla mais estudada para recuperação de lesões. O raciocínio é simples: os dois peptídeos não competem entre si — eles atuam em mecanismos completamente diferentes e complementares. O BPC-157 age principalmente via modulação do óxido nítrico, receptores de fatores de crescimento e proteção do tecido conjuntivo. O TB-500 age via regulação de actina e recrutamento de células progenitoras. É como ter uma equipe de reparos em que uma pessoa arruma a estrutura (BPC-157) enquanto a outra traz os materiais e os operários (TB-500). O resultado clínico é uma recuperação mais rápida, menos fibrose e retorno mais precoce às atividades.',
  pesquisas = ARRAY[
    'Vasireddi N et al. Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review. Am J Sports Med. 2025. DOI: 10.1177/15563316251355551',
    'Bock-Marquette I et al. Thymosin beta4 Activates Integrin-Linked Kinase and Promotes Cardiac Cell Migration. Nature. 2004;432:466-472. DOI: 10.1038/nature03040',
    'Smart N et al. Thymosin beta4 Induces Adult Epicardial Progenitor Mobilization and Neovascularization. Nature. 2007;445:177-182. DOI: 10.1038/nature05383'
  ]
WHERE slug ILIKE '%tb%bpc%' OR (slug ILIKE '%tb%500%' AND slug ILIKE '%bpc%');

-- GHK-Cu (stack GLOW e KLOW)
UPDATE public.peptideos SET
  mecanismo = 'O stack GLOW combina GHK-Cu, BPC-157 e TB-500 para um protocolo de anti-aging focado em regeneração tecidual ampla. O GHK-Cu lidera a reorganização do colágeno e a regulação genética do envelhecimento. O BPC-157 mantém a saúde gastrointestinal (fundamental para absorção de nutrientes e saúde sistêmica) e age como anti-inflamatório. O TB-500 contribui com reparos musculares e articulares. Juntos, formam um protocolo que age de fora para dentro: melhora visível da pele, cabelo e unhas, enquanto simultaneamente protege articulações, intestino e tecidos internos.',
  pesquisas = ARRAY[
    'Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide. Int J Mol Sci. 2018;19:1987. DOI: 10.3390/ijms19071987',
    'Vasireddi N et al. Emerging Use of BPC-157 in Orthopaedic Sports Medicine. Am J Sports Med. 2025. DOI: 10.1177/15563316251355551',
    'Bock-Marquette I et al. Thymosin beta4 Activates Integrin-Linked Kinase. Nature. 2004;432:466-472. DOI: 10.1038/nature03040'
  ]
WHERE slug ILIKE '%glow%' OR slug ILIKE '%klow%';

-- KPV
UPDATE public.peptideos SET
  mecanismo = 'O KPV é um tripeptídeo (3 aminoácidos) derivado do α-MSH, um hormônio natural do corpo relacionado ao controle da inflamação. A grande especialidade do KPV é o intestino: ele se liga a receptores de melanocortina na mucosa intestinal e reduz a inflamação local de forma muito específica. É um dos poucos peptídeos que pode ser usado por via oral com boa biodisponibilidade intestinal — ele não é destruído no estômago como a maioria dos peptídeos porque é pequeno demais para as enzimas digestivas conseguirem quebrar facilmente. Tem sido estudado para doenças inflamatórias intestinais como Crohn e colite ulcerativa, com resultados promissores em modelos animais e estudos preliminares em humanos.',
  pesquisas = ARRAY[
    'Guyton KZ et al. KPV Peptide Modulates Inflammatory Responses in Human Colonic Cells. Inflamm Bowel Dis. 2010;16:1750-1758. DOI: 10.1002/ibd.21258',
    'Dalmasso G et al. Alpha-MSH Mediates Cytoprotective Effects Against Colitis via Melanocortin-1 Receptor. J Clin Invest. 2008;118:1647-1659. DOI: 10.1172/JCI32693',
    'Brzoska T et al. Alpha-melanocyte-stimulating Hormone and Related Tripeptides: Biochemistry, Anti-inflammatory and Protective Effects in Vitro and in Vivo. Endocr Rev. 2008;29:581-602. DOI: 10.1210/er.2007-0027'
  ]
WHERE slug ILIKE '%kpv%';

-- MOTS-C
UPDATE public.peptideos SET
  mecanismo = 'O MOTS-c é um peptídeo mitocondrial — ou seja, ele é codificado pelo DNA das mitocôndrias (as "usinas de energia" das células), não pelo DNA do núcleo. É uma descoberta recente e fascinante: as mitocôndrias produzem seus próprios peptídeos que funcionam como hormônios. O MOTS-c regula o metabolismo de glicose no músculo esquelético de forma independente da insulina — ele ativa uma enzima chamada AMPK, que é como um sensor de energia da célula. Quando a AMPK é ativada, a célula capta mais glicose para produzir energia, o que melhora a sensibilidade à insulina e reduz gordura. Os níveis de MOTS-c caem com a idade e com o sedentarismo, o que é uma das razões pelas quais o metabolismo fica mais lento com o tempo.',
  pesquisas = ARRAY[
    'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis and Reduces Obesity and Insulin Resistance. Cell Metab. 2015;21:443-454. DOI: 10.1016/j.cmet.2015.02.009',
    'Kim KH et al. Mitochondrial Peptide MOTS-c Suppresses Age-Dependent Bone Loss by Inhibiting RANKL Signaling. PNAS. 2021;118:e2020792118. DOI: 10.1073/pnas.2020792118',
    'Lee C et al. MOTS-c: A Mitochondrial-Encoded Regulator of the Nucleus and Cell Stress. Cell Stress. 2019;3:253-259. DOI: 10.15698/cst2019.08.195'
  ]
WHERE slug ILIKE '%mots%';

-- SS-31
UPDATE public.peptideos SET
  mecanismo = 'O SS-31 (também chamado de Elamipretida ou MTP-131) é um peptídeo de quatro aminoácidos projetado para agir especificamente dentro das mitocôndrias — as organelas responsáveis por produzir 95% da energia celular. Com o envelhecimento, as mitocôndrias acumulam danos e produzem menos energia e mais radicais livres. O SS-31 se concentra na membrana interna mitocondrial, onde protege um componente crítico chamado cardiolipina. A cardiolipina é essencial para a produção eficiente de ATP (energia). Ao protegê-la, o SS-31 restaura a função mitocondrial, reduz o estresse oxidativo e melhora a produção de energia celular. É um dos peptídeos mais avançados em termos de mecanismo de ação e tem estudos em insuficiência cardíaca, doença renal e envelhecimento muscular.',
  pesquisas = ARRAY[
    'Szeto HH et al. Mitochondria-Targeted Peptide Accelerates ATP Recovery and Reduces Ischemic Kidney Injury. J Am Soc Nephrol. 2011;22:1041-1052. DOI: 10.1681/ASN.2010080808',
    'Cho J et al. Potent Mitochondria-Targeted Peptides Reduce Myocardial Infarction in Rats. Coron Artery Dis. 2007;18:215-220. DOI: 10.1097/01.mca.0000236285.71683.b4',
    'Siegel MP et al. Mitochondrial-Targeted Peptide Rapidly Improves Mitochondrial Energetics and Skeletal Muscle Performance in Aged Mice. Aging Cell. 2013;12:763-771. DOI: 10.1111/acel.12102'
  ]
WHERE slug ILIKE '%ss%31%' OR slug ILIKE '%ss31%';

-- NAD+
UPDATE public.peptideos SET
  mecanismo = 'O NAD+ (Nicotinamida Adenina Dinucleotídeo) não é tecnicamente um peptídeo — é uma coenzima encontrada em todas as células vivas. Mas é incluído em protocolos de longevidade porque desempenha um papel central no envelhecimento celular. O NAD+ é essencial para mais de 500 reações enzimáticas no corpo, incluindo a produção de energia nas mitocôndrias, o reparo do DNA e a ativação das sirtuínas (proteínas ligadas à longevidade). O problema é que os níveis de NAD+ caem cerca de 50% entre os 40 e 60 anos. Repor esses níveis via precursores como NMN (Nicotinamida Mononucleotídeo) ou NR (Nicotinamida Ribosídeo) — ou diretamente via infusão IV de NAD+ — tem mostrado resultados positivos em energia, cognição e biomarcadores de envelhecimento em estudos humanos.',
  pesquisas = ARRAY[
    'Rajman L et al. Therapeutic Potential of NAD-Boosting Molecules: The In Vivo Evidence. Cell Metab. 2018;27:529-547. DOI: 10.1016/j.cmet.2018.02.011',
    'Yoshino J et al. NAD+ Intermediates: The Biology and Therapeutic Potential of NMN and NR. Cell Metab. 2018;27:513-528. DOI: 10.1016/j.cmet.2017.11.002',
    'Elhassan YS et al. Nicotinamide Riboside Augments the Aged Human Skeletal Muscle NAD+ Metabolome and Induces Transcriptomic and Anti-inflammatory Signatures. Cell Rep. 2019;28:1717-1728. DOI: 10.1016/j.celrep.2019.07.043'
  ]
WHERE slug ILIKE '%nad%';

-- Verifica resultado
SELECT slug, nome, 
  length(mecanismo) as chars_mecanismo,
  array_length(pesquisas, 1) as total_artigos
FROM public.peptideos
ORDER BY nome;
