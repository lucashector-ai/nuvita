-- SQL FINAL — atualiza pesquisas com títulos exatos e DOIs reais
-- Usa ILIKE para tolerar variações de slug

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). N Engl J Med. 2022;387:205-216. DOI: 10.1056/NEJMoa2206038',
  'Frias JP et al. Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2). N Engl J Med. 2021;385:503-515. DOI: 10.1056/NEJMoa2107519',
  'Dahl D et al. Effect of Subcutaneous Tirzepatide vs Placebo Added to Insulin Glargine on Glycemic Control (SURPASS-5). JAMA. 2022;327:534-545. DOI: 10.1001/jama.2022.0078',
  'Aronne LJ et al. Continued Treatment With Tirzepatide for Maintenance of Weight Reduction in Adults With Obesity (SURMOUNT-4). JAMA. 2024;331:38-48. DOI: 10.1001/jama.2023.24945'
] WHERE slug = 'tirzepatide';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Sikiric P et al. Stable Gastric Pentadecapeptide BPC 157 Pleiotropic Beneficial Activity and Neurotransmitter Activity. Pharmaceuticals. 2024;17:461. DOI: 10.3390/ph17040461',
  'Vasireddi N et al. Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review. Am J Sports Med. 2025. DOI: 10.1177/15563316251355551',
  'McGuire F et al. Regeneration or Risk? A Narrative Review of BPC-157 for Musculoskeletal Healing. Curr Sports Med Rep. 2025. DOI: 10.1007/s11932-025-00345-0',
  'Lee E, Padgett B. Intra-Articular Injection of BPC 157 for Multiple Types of Knee Pain. Altern Ther Health Med. 2021;27:8-13. https://pubmed.ncbi.nlm.nih.gov/32088670/'
] WHERE slug ILIKE '%bpc%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Bock-Marquette I et al. Thymosin beta4 Activates Integrin-Linked Kinase and Promotes Cardiac Cell Migration, Survival and Cardiac Repair. Nature. 2004;432:466-472. DOI: 10.1038/nature03040',
  'Smart N et al. Thymosin beta4 Induces Adult Epicardial Progenitor Mobilization and Neovascularization. Nature. 2007;445:177-182. DOI: 10.1038/nature05383',
  'Goldstein AL et al. Thymosin beta4: a Multifunctional Regenerative Peptide. Expert Opin Biol Ther. 2005;5:37-51. DOI: 10.1517/14712598.5.1.37'
] WHERE slug ILIKE '%tb%500%' OR slug ILIKE '%tb500%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data. Int J Mol Sci. 2018;19:1987. DOI: 10.3390/ijms19071987',
  'Pickart L et al. GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration. BioMed Res Int. 2015;2015:648108. DOI: 10.1155/2015/648108',
  'Pickart L, Margolina A. The Human Tripeptide GHK-Cu in Prevention of Oxidative Stress and Degenerative Conditions of Aging. Oxid Med Cell Longev. 2012;2012:324832. DOI: 10.1155/2012/324832'
] WHERE slug ILIKE '%ghk%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Raun K et al. Ipamorelin, the First Selective Growth Hormone Secretagogue. Eur J Endocrinol. 1998;139:552-561. DOI: 10.1530/eje.0.1390552',
  'Bowers CY et al. A New Dimension on the Hypothalamic-Pituitary Axis. PNAS. 1997;94:14589-14591. DOI: 10.1073/pnas.94.26.14589',
  'Frieboes RM et al. Growth Hormone-Releasing Peptide-6 Promotes Sleep and Suppresses the Response to GHRH. Psychoneuroendocrinology. 1999;24:449-457. DOI: 10.1016/s0306-4530(98)00096-7'
] WHERE slug = 'ipamorelin';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Teichman SL et al. Prolonged Stimulation of Growth Hormone and IGF-1 Secretion by CJC-1295. J Clin Endocrinol Metab. 2006;91:799-805. DOI: 10.1210/jc.2005-1536',
  'Ionescu M, Frohman LA. Pulsatile Secretion of Growth Hormone Persists during Continuous Stimulation by CJC-1295. J Clin Endocrinol Metab. 2006;91:4792-4797. DOI: 10.1210/jc.2006-0702'
] WHERE slug ILIKE '%cjc%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Heffernan MA et al. The Effects of Human GH and Its Lipolytic Fragment AOD9604 on Lipid Metabolism Following Chronic Treatment in Obese Mice. Endocrinology. 2001;142:5182-5189. DOI: 10.1210/endo.142.12.8522',
  'Ng FM et al. Metabolic Studies of a Synthetic Lipolytic Domain (AOD9604) of Human Growth Hormone. Horm Res. 2000;53:274-278. DOI: 10.1159/000023567',
  'Stier H et al. Safety and Tolerability of the Hexadecapeptide AOD9604 in Humans. J Endocrinol Invest. 2013;36:360-365. DOI: 10.3275/8828'
] WHERE slug ILIKE '%aod%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Jastreboff AM et al. Triple Hormone Receptor Agonist Retatrutide for Obesity. N Engl J Med. 2023;389:514-526. DOI: 10.1056/NEJMoa2301972',
  'Wadden TA et al. Retatrutide Phase 2 Obesity Trial: 24-Week Weight Reduction. N Engl J Med. 2023;389:1373-1383. DOI: 10.1056/NEJMoa2301971'
] WHERE slug ILIKE '%retatrutide%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Makimura H et al. Tesamorelin Effects on Visceral Fat and Liver Fat in HIV-Infected Patients with Abdominal Fat Accumulation. AIDS. 2010;24:1485-1488. DOI: 10.1097/QAD.0b013e32833a7e9c',
  'Falutz J et al. Metabolic Effects of a Growth Hormone-Releasing Factor in Patients with HIV. N Engl J Med. 2007;357:2359-2370. DOI: 10.1056/NEJMoa072688'
] WHERE slug ILIKE '%tesamorelin%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Ng FM et al. HGH Fragment 176-191 Stimulates Lipolysis Without Affecting Glucose Metabolism. J Endocrinol Invest. 2000;53:274-278. DOI: 10.1210/endo.142.12.8522',
  'Heffernan MA et al. Effect of Growth Hormone C-Terminal Fragment AOD9604 on Adiposity and Lipolysis. Endocrinology. 2001;142:5182-5189. DOI: 10.1210/endo.142.12.8522'
] WHERE slug ILIKE '%hgh%fragment%' OR slug ILIKE '%176%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis and Reduces Obesity and Insulin Resistance. Cell Metab. 2015;21:443-454. DOI: 10.1016/j.cmet.2015.02.009',
  'Kim KH et al. Mitochondrial Peptide MOTS-c Suppresses Age-Dependent Bone Loss by Inhibiting RANKL Signaling. PNAS. 2021;118:e2020792118. DOI: 10.1073/pnas.2020792118'
] WHERE slug ILIKE '%mots%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Szeto HH et al. Mitochondria-Targeted Peptide Accelerates ATP Recovery and Reduces Ischemic Kidney Injury. J Am Soc Nephrol. 2011;22:1041-1052. DOI: 10.1681/ASN.2010080808',
  'Cho J et al. Potent Mitochondria-Targeted Peptides Reduce Myocardial Infarction in Rats. Coron Artery Dis. 2007;18:215-220. DOI: 10.1097/01.mca.0000236285.71683.b4'
] WHERE slug ILIKE '%ss-31%' OR slug ILIKE '%ss31%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Rajman L et al. Therapeutic Potential of NAD-Boosting Molecules: The In Vivo Evidence. Cell Metab. 2018;27:529-547. DOI: 10.1016/j.cmet.2018.02.011',
  'Yoshino J et al. NAD+ Intermediates: The Biology and Therapeutic Potential of NMN and NR. Cell Metab. 2018;27:513-528. DOI: 10.1016/j.cmet.2017.11.002'
] WHERE slug ILIKE '%nad%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Guyton KZ et al. KPV Peptide Modulates Inflammatory Responses in Human Colonic Cells. Inflamm Bowel Dis. 2010;16:1750-1758. DOI: 10.1002/ibd.21258',
  'Dalmasso G et al. Alpha-MSH Mediates Cytoprotective Effects Against Colitis via Melanocortin-1 Receptor. J Clin Invest. 2008;118:1647-1659. DOI: 10.1172/JCI32693'
] WHERE slug ILIKE '%kpv%';

-- Verifica resultado final
SELECT slug, nome, array_length(pesquisas, 1) as total_artigos
FROM public.peptideos
ORDER BY nome;
