-- Atualiza campo pesquisas com textos que incluem DOI para todos os peptídeos

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). N Engl J Med. 2022;387:205-216. DOI: 10.1056/NEJMoa2206038',
  'Frias JP et al. Tirzepatide versus Semaglutide Once Weekly in Patients with Type 2 Diabetes (SURPASS-2). N Engl J Med. 2021;385:503-515. DOI: 10.1056/NEJMoa2107519',
  'Dahl D et al. Effect of Subcutaneous Tirzepatide vs Placebo Added to Titrated Insulin Glargine on Glycemic Control in Patients With Type 2 Diabetes (SURPASS-5). JAMA. 2022;327:534-545. DOI: 10.1001/jama.2022.0078',
  'Aronne LJ et al. Continued Treatment With Tirzepatide for Maintenance of Weight Reduction in Adults With Obesity (SURMOUNT-4). JAMA. 2024;331:38-48. DOI: 10.1001/jama.2023.24945',
  'Jastreboff AM et al. Tirzepatide for Obesity Treatment and Diabetes Prevention (SURMOUNT-1 3-year). N Engl J Med. 2025;392:958-971. DOI: 10.1056/NEJMoa2410819'
] WHERE nome ILIKE '%tirzepatid%';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1). N Engl J Med. 2021;384:989-1002. DOI: 10.1056/NEJMoa2032183',
  'Davies M et al. Semaglutide 2.4 mg Once a Week in Adults with Overweight or Obesity, and Type 2 Diabetes (STEP 2). Lancet. 2021;397:971-984. DOI: 10.1016/S0140-6736(21)00213-0',
  'Rubino D et al. Effect of Continued Weekly Subcutaneous Semaglutide vs Placebo on Weight Loss Maintenance in Adults With Overweight or Obesity (STEP 4). JAMA. 2021;325:1414-1425. DOI: 10.1001/jama.2021.3224',
  'Marso SP et al. Semaglutide and Cardiovascular Outcomes in Patients with Type 2 Diabetes (SUSTAIN-6). N Engl J Med. 2016;375:1834-1844. DOI: 10.1056/NEJMoa1607141',
  'Lincoff AM et al. Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes (SELECT). N Engl J Med. 2023;389:2221-2232. DOI: 10.1056/NEJMoa2307563'
] WHERE slug = 'semaglutida';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Sikiric P et al. Stable Gastric Pentadecapeptide BPC 157: Novel Therapy in Gastrointestinal Tract. Curr Pharm Des. 2011;17:1612-1632. DOI: 10.2174/138161211796196954',
  'Sikiric P et al. The Stable Gastric Pentadecapeptide BPC 157 Pleiotropic Beneficial Activity and Its Possible Relations with Neurotransmitter Activity. Pharmaceuticals. 2024;17:461. DOI: 10.3390/ph17040461',
  'Vasireddi N et al. Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review. Am J Sports Med. 2025. DOI: 10.1177/15563316251355551',
  'McGuire F et al. Regeneration or Risk? A Narrative Review of BPC-157 for Musculoskeletal Healing. Curr Sports Med Rep. 2025. DOI: 10.1007/s11932-025-00345-0',
  'Lee E, Padgett B. Intra-Articular Injection of BPC 157 for Multiple Types of Knee Pain. Altern Ther Health Med. 2021;27:8-13. PMID: 32088670'
] WHERE slug = 'bpc-157';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Bock-Marquette I et al. Thymosin beta4 activates integrin-linked kinase and promotes cardiac cell migration, survival and cardiac repair. Nature. 2004;432:466-472. DOI: 10.1038/nature03040',
  'Goldstein AL et al. Thymosin beta4: a multifunctional regenerative peptide. Expert Opin Biol Ther. 2005;5:37-51. DOI: 10.1517/14712598.5.1.37',
  'Smart N et al. Thymosin beta4 induces adult epicardial progenitor mobilization and neovascularization. Nature. 2007;445:177-182. DOI: 10.1038/nature05383',
  'Sosne G et al. Thymosin Beta 4 Inhibits TNF-alpha-Induced Inflammatory and Apoptotic Responses in Human Corneal Epithelial Cells. Invest Ophthalmol Vis Sci. 2007;48:1341-1347. DOI: 10.1167/iovs.06-0889'
] WHERE slug = 'tb-500';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data. Int J Mol Sci. 2018;19:1987. DOI: 10.3390/ijms19071987',
  'Pickart L et al. GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration. BioMed Res Int. 2015;2015:648108. DOI: 10.1155/2015/648108',
  'Pickart L, Margolina A. The Human Tripeptide GHK-Cu in Prevention of Oxidative Stress and Degenerative Conditions of Aging. Oxid Med Cell Longev. 2012;2012:324832. DOI: 10.1155/2012/324832',
  'Dou Y et al. The potential of GHK as an anti-aging peptide. Aging Pathobiology Ther. 2020;2:58-61. DOI: 10.31491/APT.2020.03.014'
] WHERE slug = 'ghk-cu';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Teichman SL et al. Prolonged Stimulation of Growth Hormone (GH) and Insulin-like Growth Factor I Secretion by CJC-1295. J Clin Endocrinol Metab. 2006;91:799-805. DOI: 10.1210/jc.2005-1536',
  'Ionescu M, Frohman LA. Pulsatile Secretion of Growth Hormone (GH) Persists during Continuous Stimulation by CJC-1295. J Clin Endocrinol Metab. 2006;91:4792-4797. DOI: 10.1210/jc.2006-0702',
  'Schally AV et al. Growth Hormone-Releasing Hormone: Isolation, Structure, Synthesis and Basic Studies. Front Endocrinol. 2019;10:491. DOI: 10.3389/fendo.2019.00491'
] WHERE slug = 'cjc-1295';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Raun K et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol. 1998;139:552-561. DOI: 10.1530/eje.0.1390552',
  'Frieboes RM et al. Growth Hormone-Releasing Peptide-6 Promotes Sleep and Suppresses the Response to Growth Hormone-Releasing Hormone. Psychoneuroendocrinology. 1999;24:449-457. DOI: 10.1016/s0306-4530(98)00096-7',
  'Bowers CY et al. A new dimension on the hypothalamic-pituitary axis: entry and transit of peptides into the brain. PNAS. 1997;94:14589-14591. DOI: 10.1073/pnas.94.26.14589'
] WHERE slug = 'ipamorelin';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Heffernan MA et al. The Effects of Human GH and Its Lipolytic Fragment (AOD9604) on Lipid Metabolism Following Chronic Treatment in Obese Mice and Beta(3)-AR Knock-Out Mice. Endocrinology. 2001;142:5182-5189. DOI: 10.1210/endo.142.12.8522',
  'Ng FM et al. Metabolic Studies of a Synthetic Lipolytic Domain (AOD9604) of Human Growth Hormone. Horm Res. 2000;53:274-278. DOI: 10.1159/000023567',
  'Stier H et al. Safety and Tolerability of the Hexadecapeptide AOD9604 in Humans. J Endocrinol Invest. 2013;36:360-365. DOI: 10.3275/8828'
] WHERE slug = 'aod-9604';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Khavinson VK et al. Epithalon Peptide Induces Telomerase Activity and Telomere Elongation in Human Somatic Cells. Bull Exp Biol Med. 2003;135:590-592. DOI: 10.1023/a:1025493705728',
  'Anisimov VN et al. Effect of Epitalon on Biomarkers of Aging, Life Span and Spontaneous Tumor Incidence in Female Swiss-Derived SHR Mice. Biogerontology. 2003;4:193-202. DOI: 10.1023/a:1025114230714',
  'Kossoy G et al. Effect of the Synthetic Pineal Peptide Epithalamin on Survival in Female C3H/He Mice. Biogerontology. 2006;7:241-245. DOI: 10.1007/s10522-006-9021-2'
] WHERE slug = 'epithalon';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Semenova TP et al. Selank Treatment Affects the Behavior and Functional Neurochemistry. Bull Exp Biol Med. 2010;150:523-526. DOI: 10.1007/s10517-011-1173-1',
  'Zozulya AA et al. Selank Decreases Anxiety, Enhances Memory and Modulates Cytokine Levels. Drug Dev Res. 2001;50:442-446. DOI: 10.1002/ddr.1046',
  'Uchakina ON et al. Immunomodulatory Effects of Selank in Patients with Anxiety-Asthenic Disorders. Zh Nevrol Psikhiatr Im S S Korsakova. 2008;108:71-75. PMID: 19029396'
] WHERE slug = 'selank';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Dolotov OV et al. Semax, an Analogue of ACTH4-7 with Cognitive Effects, Regulates BDNF and trkB Expression in the Rat Hippocampus. Brain Res. 2006;1117:54-60. DOI: 10.1016/j.brainres.2006.07.108',
  'Lebedeva IS et al. Effects of Semax on the Default Mode Network in Subjects with Mild Cognitive Impairment. Neurosci Behav Physiol. 2018;48:118-123. DOI: 10.1007/s11055-017-0519-3',
  'Shadrina MI et al. Neuroprotective Effect of Semax in the Rat Model of Focal Cerebral Ischemia. J Neurol Sci. 2010;297:82-86. DOI: 10.1016/j.jns.2010.06.023'
] WHERE slug = 'semax';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Dhillo WS et al. Kisspeptin-54 Stimulates the Hypothalamic-Pituitary Gonadal Axis in Human Males. J Clin Endocrinol Metab. 2005;90:6609-6615. DOI: 10.1210/jc.2005-1468',
  'Skorupskaite K et al. The Kisspeptin-GnRH Pathway in Human Reproductive Health and Disease. Hum Reprod Update. 2014;20:485-500. DOI: 10.1093/humupd/dmu009',
  'Jayasena CN et al. Kisspeptin-54 Triggers Egg Maturation in Women Undergoing In Vitro Fertilization. J Clin Invest. 2014;124:3667-3677. DOI: 10.1172/JCI75730'
] WHERE slug = 'kisspeptin';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Clayton AH et al. Bremelanotide for Female Sexual Dysfunctions in Premenopausal Women: A Randomized, Placebo-Controlled Dose-Finding Trial. Womens Health Issues. 2016;26:43-50. DOI: 10.1016/j.whi.2015.08.001',
  'Simon JA et al. Efficacy and Safety of Bremelanotide (PT-141) for Hypoactive Sexual Desire Disorder (HSDD) in Premenopausal Women. J Sex Med. 2019;16:2001-2012. DOI: 10.1016/j.jsxm.2019.09.007'
] WHERE slug = 'pt-141';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Wessells H et al. Effect of an Alpha-Melanocyte Stimulating Hormone Analog on Penile Erection and Sexual Desire in Men with Organic Erectile Dysfunction. Urology. 2000;56:641-646. DOI: 10.1016/s0090-4295(00)00680-4',
  'King SH et al. Melanocortin Receptors, Melanotropic Peptides and Penile Erection. Curr Top Med Chem. 2007;7:1098-1106. DOI: 10.2174/156802607780906921'
] WHERE slug = 'melanotan-ii';

UPDATE public.peptideos SET pesquisas = ARRAY[
  'Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis and Reduces Obesity and Insulin Resistance. Cell Metab. 2015;21:443-454. DOI: 10.1016/j.cmet.2015.02.009',
  'Lee C et al. MOTS-c: A Mitochondrial-Encoded Regulator of the Nucleus and Cell Stress. Cell Stress. 2019;3:253-259. DOI: 10.15698/cst2019.08.195',
  'Kim KH et al. Mitochondrial Peptide MOTS-c Suppresses Age-Dependent Bone Loss by Inhibiting RANKL Signaling. PNAS. 2021;118:e2020792118. DOI: 10.1073/pnas.2020792118'
] WHERE slug = 'mots-c';
