-- Verifica slugs existentes
SELECT slug FROM public.peptideos WHERE nome ILIKE '%tirzepatid%';

-- Popula estudos_links para tirzepatida (slug pode ser tirzepatida ou tirzepatide)
UPDATE public.peptideos SET
  nivel_evidencia = 'aprovado_fda',
  aprovacoes = ARRAY['FDA (Mounjaro, 2022) para diabetes tipo 2', 'FDA (Zepbound, 2023) para obesidade'],
  estudos_links = '[
    {"titulo":"Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)","autores":"Jastreboff AM et al. SURMOUNT-1 Investigators","journal":"N Engl J Med","ano":2022,"pmid":"35658024","url":"https://pubmed.ncbi.nlm.nih.gov/35658024/","tipo":"ensaio_clinico_fase3","traducao":"Ensaio fase 3, 2.539 adultos com obesidade sem diabetes, 72 semanas. Reduções médias de peso: 15,0% (5mg), 19,5% (10mg) e 20,9% (15mg) vs 3,1% placebo. Na dose de 15mg, 96% atingiram ≥5% de perda de peso e 36,2% ≥25%. Tirzepatida 15mg produziu redução de 33,9% da massa gorda vs 10,9% da massa magra."},
    {"titulo":"Tirzepatide for Obesity Treatment and Diabetes Prevention — 3 years (SURMOUNT-1)","autores":"Jastreboff AM et al.","journal":"N Engl J Med","ano":2025,"pmid":"39536238","url":"https://pubmed.ncbi.nlm.nih.gov/39536238/","tipo":"ensaio_clinico_fase3","traducao":"Análise de 3 anos em 1.032 participantes com pré-diabetes. Tirzepatida reduziu progressão para diabetes tipo 2 em 93% (1,3% vs 13,3% com placebo; HR 0,07; p<0,001). Perda de peso mantida: -19,7% (15mg) vs -1,3% placebo em 176 semanas."},
    {"titulo":"Continued Treatment With Tirzepatide for Maintenance of Weight Reduction (SURMOUNT-4)","autores":"Aronne LJ et al. SURMOUNT-4 Investigators","journal":"JAMA","ano":2024,"pmid":"38078870","url":"https://pubmed.ncbi.nlm.nih.gov/38078870/","tipo":"ensaio_clinico_fase3","traducao":"670 pacientes randomizados após 36 semanas de indução. Redução total de 25,3% com tirzepatida contínua. 89,5% mantiveram ≥80% da perda inicial. Interrupção causou recuperação de 14% do peso em 52 semanas."},
    {"titulo":"Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2)","autores":"Frías JP et al.","journal":"N Engl J Med","ano":2021,"pmid":"34170647","url":"https://pubmed.ncbi.nlm.nih.gov/34170647/","tipo":"ensaio_clinico_fase3","traducao":"1.879 pacientes com DM2. Tirzepatida 15mg foi superior à semaglutida 1mg em redução de HbA1c (-2,01% vs -1,86%) e peso corporal (-11,2kg vs -5,4kg). Todos os endpoints primários e secundários favoreceram tirzepatida."}
  ]'::jsonb
WHERE nome ILIKE '%tirzepatid%';
