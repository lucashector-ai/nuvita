// ════════════════════════════════════════════════
//  NUVITA — Quanto vender (USO DA FARMÁCIA).
//  Só aparece no tablet para o atendente — não vai no PDF do paciente.
//  Simples: por peptídeo, quanto o protocolo usa do começo ao fim e
//  quantos frascos vender. (O cálculo de dose/UI fica na aba Calculadora.)
// ════════════════════════════════════════════════

'use client';

import Icon from '@/components/farmacia/Icon';
import type { Recomendacao } from '@/lib/recomendarPeptideos';
import { tf, type Lang } from '@/lib/farmaciaI18n';
import {
  parseDoseMg,
  aplicacoesPorSemana,
  semanasDoCiclo,
  totalMg,
  frascosNecessarios,
  fmtFaixaMg,
  frascoPadrao,
} from '@/lib/quantidadeProtocolo';

export default function TabelaFarmacia({ rec, lang }: { rec: Recomendacao; lang: Lang }) {
  const t = (pt: string, es: string) => tf(lang, pt, es);

  return (
    <div style={S.wrap}>
      <div style={S.head}>
        <span style={S.headIcon}><Icon name="clipboard" size={16} /></span>
        <div>
          <div style={S.headTitle}>{t('Para a farmácia — quanto vender', 'Para la farmacia — cuánto vender')}</div>
          <div style={S.headSub}>
            {t(
              'Estimativa do total que o protocolo usa e quantos frascos vender. Uso interno — não vai no PDF do paciente.',
              'Estimación del total que usa el protocolo y cuántos frascos vender. Uso interno — no va en el PDF del paciente.',
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {rec.itens.map((it) => {
          const dose = parseDoseMg(it.dose);
          const apps = aplicacoesPorSemana(it.peptide.freq);
          const sem = semanasDoCiclo(it.peptide.cycle);
          const semanas = sem?.min || 8;

          if (!dose || !apps) {
            return (
              <div key={it.peptide.n} style={S.row}>
                <div style={S.nome}>{it.peptide.n}</div>
                <div style={S.semDados}>
                  {t('Dose sob demanda — conferir a quantidade na farmácia.',
                     'Dosis a demanda — verificar la cantidad en la farmacia.')}
                </div>
              </div>
            );
          }

          const tot = totalMg(dose, apps, semanas);
          const vialMg = frascoPadrao(dose);
          // Frascos pela MÉDIA da faixa (doses tituladas não usam o máximo o ciclo todo).
          const frascos = frascosNecessarios((tot.min + tot.max) / 2, vialMg);

          return (
            <div key={it.peptide.n} style={S.row}>
              <div style={S.linha}>
                <div style={{ flex: 1 }}>
                  <div style={S.nome}>{it.peptide.n}</div>
                  <div style={S.usa}>
                    {t('O protocolo usa', 'El protocolo usa')} <b>~{fmtFaixaMg(tot)}</b>{' '}
                    {t('no total', 'en total')} ({semanas} {t('sem', 'sem')} · {it.dose} · {apps}×/{t('sem', 'sem')})
                  </div>
                </div>
                <div style={S.venda}>
                  <div style={S.vendaNum}>{frascos}</div>
                  <div style={S.vendaLbl}>
                    {frascos === 1 ? t('frasco', 'frasco') : t('frascos', 'frascos')}
                    <div style={S.vendaVial}>{t('de', 'de')} {vialMg} mg</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.nota}>
        {t(
          'Estimativa a partir do protocolo. Doses com titulação (ex.: GLP-1) variam ao longo do ciclo. O tamanho do frasco é uma sugestão — ajuste ao que a farmácia tem em estoque.',
          'Estimación a partir del protocolo. Dosis con titulación (ej.: GLP-1) varían durante el ciclo. El tamaño del frasco es una sugerencia — ajuste a lo que la farmacia tiene en stock.',
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { marginTop: 18, border: '1px solid #DCE9DF', borderRadius: 16, background: '#F6FBF7', padding: 16 },
  head: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  headIcon: { width: 34, height: 34, borderRadius: 10, background: '#E4F3E8', color: '#0B7A3B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headTitle: { fontWeight: 700, fontSize: 15, color: '#0B4A26', letterSpacing: '-.01em' },
  headSub: { fontSize: 12.5, color: '#5B7A64', marginTop: 2, lineHeight: 1.4 },
  row: { background: '#fff', border: '1px solid #E6EFE8', borderRadius: 12, padding: '12px 14px' },
  linha: { display: 'flex', alignItems: 'center', gap: 12 },
  nome: { fontWeight: 600, fontSize: 15.5, color: '#0E1113' },
  usa: { fontSize: 12.5, color: '#667085', marginTop: 3, lineHeight: 1.45 },
  venda: { display: 'flex', alignItems: 'center', gap: 8, background: '#EAF7EE', border: '1px solid #CFE9D7', borderRadius: 10, padding: '8px 12px', flexShrink: 0 },
  vendaNum: { fontSize: 26, fontWeight: 800, color: '#0B7A3B', lineHeight: 1 },
  vendaLbl: { fontSize: 12, fontWeight: 700, color: '#0B7A3B', lineHeight: 1.1 },
  vendaVial: { fontSize: 10.5, fontWeight: 500, color: '#5B7A64', marginTop: 2 },
  semDados: { fontSize: 12.5, color: '#98724A', background: '#FFF7ED', borderRadius: 8, padding: '8px 10px', marginTop: 6 },
  nota: { fontSize: 11.5, color: '#5B7A64', marginTop: 12, lineHeight: 1.45 },
};
