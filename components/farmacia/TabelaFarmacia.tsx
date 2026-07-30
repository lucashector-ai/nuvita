// ════════════════════════════════════════════════
//  NUVITA — Tabela de quantidade e preparo (USO DA FARMÁCIA).
//  Só aparece no tablet para o atendente — não vai no PDF do paciente.
//  Calcula, por peptídeo: total de mg no ciclo, dose em UI na seringa
//  (conforme a reconstituição), doses por frasco e frascos a comprar.
// ════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import Icon from '@/components/farmacia/Icon';
import type { Recomendacao } from '@/lib/recomendarPeptideos';
import { tf, type Lang } from '@/lib/farmaciaI18n';
import {
  parseDoseMg,
  aplicacoesPorSemana,
  semanasDoCiclo,
  totalMg,
  doseEmUI,
  dosesPorFrasco,
  frascosNecessarios,
  fmtFaixaMg,
  frascoPadrao,
} from '@/lib/quantidadeProtocolo';

interface Ajuste {
  semanas: number;
  frascoMg: number;
  aguaMl: number;
}

export default function TabelaFarmacia({ rec, lang }: { rec: Recomendacao; lang: Lang }) {
  const t = (pt: string, es: string) => tf(lang, pt, es);

  const inicial: Record<string, Ajuste> = {};
  for (const it of rec.itens) {
    const dose = parseDoseMg(it.dose);
    const sem = semanasDoCiclo(it.peptide.cycle);
    inicial[it.peptide.n] = {
      semanas: sem?.min || 8,
      frascoMg: dose ? frascoPadrao(dose) : 5,
      aguaMl: 2,
    };
  }
  const [aj, setAj] = useState<Record<string, Ajuste>>(inicial);

  const set = (nome: string, campo: keyof Ajuste, valor: number) =>
    setAj((a) => ({ ...a, [nome]: { ...a[nome], [campo]: valor } }));

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <span style={S.headIcon}><Icon name="clipboard" size={16} /></span>
        <div>
          <div style={S.headTitle}>{t('Para a farmácia — quantidade e preparo', 'Para la farmacia — cantidad y preparación')}</div>
          <div style={S.headSub}>
            {t(
              'Uso interno: estimativa de quanto comprar e a dose em UI na seringa. Não vai no PDF do paciente.',
              'Uso interno: estimación de cuánto comprar y la dosis en UI en la jeringa. No va en el PDF del paciente.',
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {rec.itens.map((it) => {
          const a = aj[it.peptide.n];
          const dose = parseDoseMg(it.dose);
          const apps = aplicacoesPorSemana(it.peptide.freq);

          if (!dose || !apps) {
            return (
              <div key={it.peptide.n} style={S.row}>
                <div style={S.rowTitle}>{it.peptide.n}</div>
                <div style={S.semDados}>
                  {t(
                    `Dose "${it.dose}" (${it.peptide.freq}) — conferir manualmente na farmácia.`,
                    `Dosis "${it.dose}" (${it.peptide.freq}) — verificar manualmente en la farmacia.`,
                  )}
                </div>
              </div>
            );
          }

          const tot = totalMg(dose, apps, a.semanas);
          const uiMin = doseEmUI(dose.min, a.frascoMg, a.aguaMl);
          const uiMax = doseEmUI(dose.max, a.frascoMg, a.aguaMl);
          const uiStr = Math.round(uiMin) === Math.round(uiMax)
            ? `${Math.round(uiMin)} UI`
            : `${Math.round(uiMin)}–${Math.round(uiMax)} UI`;
          const dosesFrasco = dosesPorFrasco(a.frascoMg, dose.max);
          const frascos = frascosNecessarios(tot.max, a.frascoMg);

          return (
            <div key={it.peptide.n} style={S.row}>
              <div style={S.rowTitle}>{it.peptide.n}</div>

              <div style={S.metaLine}>
                {t('Dose', 'Dosis')}: <b>{it.dose}</b> · {apps}× {t('por semana', 'por semana')} · {it.peptide.cycle}
              </div>

              {/* Controles editáveis */}
              <div style={S.controls}>
                <Campo label={t('Semanas', 'Semanas')}>
                  <input type="number" min={1} max={52} value={a.semanas}
                    onChange={(e) => set(it.peptide.n, 'semanas', clamp(e.target.value, 1, 52))} style={S.inp} />
                </Campo>
                <Campo label={t('Frasco (mg)', 'Frasco (mg)')}>
                  <input type="number" min={1} max={100} value={a.frascoMg}
                    onChange={(e) => set(it.peptide.n, 'frascoMg', clamp(e.target.value, 1, 100))} style={S.inp} />
                </Campo>
                <Campo label={t('Água (mL)', 'Agua (mL)')}>
                  <input type="number" min={0.5} max={10} step={0.5} value={a.aguaMl}
                    onChange={(e) => set(it.peptide.n, 'aguaMl', clamp(e.target.value, 0.5, 10))} style={S.inp} />
                </Campo>
              </div>

              {/* Resultados */}
              <div style={S.results}>
                <Res label={t('Total no ciclo', 'Total en el ciclo')} valor={fmtFaixaMg(tot)} destaque />
                <Res label={t('Dose na seringa', 'Dosis en la jeringa')} valor={uiStr} destaque />
                <Res label={t('Doses por frasco', 'Dosis por frasco')} valor={dosesFrasco > 0 ? String(dosesFrasco) : '—'} />
                <Res label={t('Frascos p/ comprar', 'Frascos a comprar')} valor={String(frascos)} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.nota}>
        {t(
          'UI calculada para seringa U-100 (1 mL = 100 UI), conforme a reconstituição informada. Doses com titulação (ex.: GLP-1) variam ao longo do ciclo — o total é uma faixa. Confira sempre antes de vender.',
          'UI calculada para jeringa U-100 (1 mL = 100 UI), según la reconstitución indicada. Dosis con titulación (ej.: GLP-1) varían durante el ciclo — el total es un rango. Verifique siempre antes de vender.',
        )}
      </div>
    </div>
  );
}

function clamp(v: string, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={S.campo}>
      <span style={S.campoLabel}>{label}</span>
      {children}
    </label>
  );
}

function Res({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div style={{ ...S.res, ...(destaque ? S.resDestaque : {}) }}>
      <div style={S.resLabel}>{label}</div>
      <div style={{ ...S.resValor, ...(destaque ? { color: '#0B7A3B' } : {}) }}>{valor}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { marginTop: 18, border: '1px solid #DCE9DF', borderRadius: 16, background: '#F6FBF7', padding: 16 },
  head: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  headIcon: { width: 34, height: 34, borderRadius: 10, background: '#E4F3E8', color: '#0B7A3B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headTitle: { fontWeight: 700, fontSize: 15, color: '#0B4A26', letterSpacing: '-.01em' },
  headSub: { fontSize: 12.5, color: '#5B7A64', marginTop: 2, lineHeight: 1.4 },
  row: { background: '#fff', border: '1px solid #E6EFE8', borderRadius: 12, padding: 14 },
  rowTitle: { fontWeight: 600, fontSize: 15, color: '#0E1113' },
  metaLine: { fontSize: 12.5, color: '#667085', marginTop: 3 },
  semDados: { fontSize: 12.5, color: '#98724A', background: '#FFF7ED', borderRadius: 8, padding: '8px 10px', marginTop: 8 },
  controls: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 },
  campo: { display: 'flex', flexDirection: 'column', gap: 4 },
  campoLabel: { fontSize: 11, color: '#5B7A64', fontWeight: 600 },
  inp: { padding: '8px 10px', fontSize: 14, borderRadius: 8, border: '1px solid #D8E5DC', background: '#fff', fontFamily: 'inherit', color: '#0E1113', width: '100%' },
  results: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 12 },
  res: { background: '#F7F9F8', border: '1px solid #ECEFED', borderRadius: 10, padding: '9px 11px' },
  resDestaque: { background: '#EAF7EE', border: '1px solid #CFE9D7' },
  resLabel: { fontSize: 11, color: '#667085', fontWeight: 600 },
  resValor: { fontSize: 15, fontWeight: 700, color: '#0E1113', marginTop: 2 },
  nota: { fontSize: 11.5, color: '#5B7A64', marginTop: 12, lineHeight: 1.45 },
};
