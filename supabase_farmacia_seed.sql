-- Seed das 3 farmácias (USER1/2/3) — senhas numéricas de 6 dígitos.
-- Gerado com o pepper padrão (FARMACIA_ESTOQUE_SECRET NÃO definido).
-- Se você definir FARMACIA_ESTOQUE_SECRET no Vercel, recompute os hashes.
-- Todas começam com o catálogo COMPLETO; edite no painel /farmacia/estoque.

insert into public.farmacia_estoque (codigo_hash, nome, peptideos)
values ('c2a78d52d011e7e3b5b176d58a4785e35ef11809f6471b75aff4173a178318d3', 'USER1', '["BPC-157","TB-500","Ipamorelin","CJC-1295","Tirzepatide","AOD-9604","MK-677 (Ibutamoren)","IGF-1 LR3","Epithalamin (Epitalon)","Timalfasina (Thymosin α1)","GHK-Cu (Tripeptídeo de cobre)","SNAP-8 / Argireline","Semax","Selank","DSIP (Delta Sleep-Inducing Peptide)","PT-141 (Bremelanotida)","Retatrutide","Tesamorelin","SS-31 (Elamipretide)","SLU-PP-332","NAD+","MOTS-c","Melanotan II","KPV","KLOW (blend)","Kisspeptin-10","HGH (Somatropina)","HGH Fragment 176-191","GLOW (blend)","Follistatin-332","CBL-514","5-Amino-1MQ","TB-500 + BPC-157 (blend)"]'::jsonb)
on conflict (codigo_hash) do update set nome = excluded.nome, peptideos = excluded.peptideos, updated_at = now();

insert into public.farmacia_estoque (codigo_hash, nome, peptideos)
values ('d4cb6f8dd5f77634ba86ceacf90957e0ce680076e8d370ab4867639f58d7ae33', 'USER2', '["BPC-157","TB-500","Ipamorelin","CJC-1295","Tirzepatide","AOD-9604","MK-677 (Ibutamoren)","IGF-1 LR3","Epithalamin (Epitalon)","Timalfasina (Thymosin α1)","GHK-Cu (Tripeptídeo de cobre)","SNAP-8 / Argireline","Semax","Selank","DSIP (Delta Sleep-Inducing Peptide)","PT-141 (Bremelanotida)","Retatrutide","Tesamorelin","SS-31 (Elamipretide)","SLU-PP-332","NAD+","MOTS-c","Melanotan II","KPV","KLOW (blend)","Kisspeptin-10","HGH (Somatropina)","HGH Fragment 176-191","GLOW (blend)","Follistatin-332","CBL-514","5-Amino-1MQ","TB-500 + BPC-157 (blend)"]'::jsonb)
on conflict (codigo_hash) do update set nome = excluded.nome, peptideos = excluded.peptideos, updated_at = now();

insert into public.farmacia_estoque (codigo_hash, nome, peptideos)
values ('a73083598cba03234604b65eda9ea572ddff20961ac85f7492cd038273666bce', 'USER3', '["BPC-157","TB-500","Ipamorelin","CJC-1295","Tirzepatide","AOD-9604","MK-677 (Ibutamoren)","IGF-1 LR3","Epithalamin (Epitalon)","Timalfasina (Thymosin α1)","GHK-Cu (Tripeptídeo de cobre)","SNAP-8 / Argireline","Semax","Selank","DSIP (Delta Sleep-Inducing Peptide)","PT-141 (Bremelanotida)","Retatrutide","Tesamorelin","SS-31 (Elamipretide)","SLU-PP-332","NAD+","MOTS-c","Melanotan II","KPV","KLOW (blend)","Kisspeptin-10","HGH (Somatropina)","HGH Fragment 176-191","GLOW (blend)","Follistatin-332","CBL-514","5-Amino-1MQ","TB-500 + BPC-157 (blend)"]'::jsonb)
on conflict (codigo_hash) do update set nome = excluded.nome, peptideos = excluded.peptideos, updated_at = now();


