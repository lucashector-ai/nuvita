// ════════════════════════════════════════════════
//  NUVITA — Calculadora de peptídeo (reconstituição).
//  Igual à ideia da nexxuspeptides.com/calculator:
//   seringa + frasco (mg) + água + dose desejada → quantas UNIDADES
//   puxar na seringa (U-100). Mostra uma régua de seringa.
// ════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import { tf, type Lang } from '@/lib/farmaciaI18n';
import { concentracao, doseEmUI, dosesPorFrasco } from '@/lib/quantidadeProtocolo';

const SERINGAS = [0.3, 0.5, 1.0]; // mL (U-100 → 30 / 50 / 100 unidades)
const FRASCOS = [5, 10, 15]; // mg
const AGUAS = [1, 2, 3, 5]; // mL
const DOSES = [50, 100, 250, 500]; // mcg

export default function CalculadoraPeptideo({ lang }: { lang: Lang }) {
  const t = (pt: string, es: string) => tf(lang, pt, es);

  const [seringa, setSeringa] = useState(1.0);
  const [frascoMg, setFrascoMg] = useState(5);
  const [aguaMl, setAguaMl] = useState(1);
  const [doseMcg, setDoseMcg] = useState(250);

  const conc = concentracao(frascoMg, aguaMl); // mg/mL
  const unidades = doseEmUI(doseMcg / 1000, frascoMg, aguaMl); // U-100
  const maxUnid = Math.round(seringa * 100);
  const dosesFrasco = dosesPorFrasco(frascoMg, doseMcg / 1000);
  const excede = unidades > maxUnid + 0.01;
  const unidadesTxt = Number.isInteger(unidades) ? String(unidades) : unidades.toFixed(1).replace('.', ',');

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={S.grid}>
        {/* Seringa */}
        <Bloco titulo={t('Qual o volume total da sua seringa?', '¿Cuál es el volumen total de tu jeringa?')}>
          <div style={{ display: 'grid', gap: 8 }}>
            {SERINGAS.map((s) => (
              <Opcao key={s} ativo={seringa === s} onClick={() => setSeringa(s)}>
                <span style={{ fontWeight: 600 }}>{s.toFixed(1)} ml</span>
                <span style={S.opSub}>{Math.round(s * 100)} {t('unidades', 'unidades')}</span>
              </Opcao>
            ))}
          </div>
        </Bloco>

        <div style={{ display: 'grid', gap: 18 }}>
          {/* Frasco */}
          <Bloco titulo={t('Quantidade do frasco (peptídeo)', 'Cantidad del frasco (péptido)')}>
            <Escolha opcoes={FRASCOS} valor={frascoMg} onPick={setFrascoMg} sufixo="mg"
              min={0.5} max={100} step={0.5} labelOutro={t('Outro', 'Otro')} />
          </Bloco>

          {/* Água */}
          <Bloco titulo={t('Quanta água bacteriostática vai adicionar?', '¿Cuánta agua bacteriostática vas a agregar?')}>
            <Escolha opcoes={AGUAS} valor={aguaMl} onPick={setAguaMl} sufixo="ml"
              min={0.5} max={30} step={0.5} labelOutro={t('Outro', 'Otro')} />
          </Bloco>

          {/* Dose */}
          <Bloco titulo={t('Quanto do peptídeo você quer em cada dose?', '¿Cuánto del péptido quieres en cada dosis?')}>
            <Escolha opcoes={DOSES} valor={doseMcg} onPick={setDoseMcg} sufixo="mcg"
              min={1} max={100000} step={1} labelOutro={t('Outro', 'Otro')} />
          </Bloco>
        </div>
      </div>

      {/* Resultado */}
      <div style={S.resultado}>
        <div style={S.frase}>
          {t('Para uma dose de', 'Para una dosis de')} <b>{doseMcg}</b> mcg,{' '}
          {t('puxe a seringa até', 'jala la jeringa hasta')} <b style={{ color: excede ? '#B91C1C' : '#0B7A3B' }}>{unidadesTxt}</b>{' '}
          {t('unidades', 'unidades')}
        </div>

        <Regua max={maxUnid} valor={unidades} />

        {excede && (
          <div style={S.aviso}>
            {t(
              `Essa dose passa da capacidade da seringa de ${seringa.toFixed(1)} ml (${maxUnid} un.). Use uma seringa maior ou mais água.`,
              `Esa dosis supera la capacidad de la jeringa de ${seringa.toFixed(1)} ml (${maxUnid} un.). Usa una jeringa mayor o más agua.`,
            )}
          </div>
        )}

        <div style={S.stats}>
          <Stat label={t('Concentração', 'Concentración')} valor={`${(Math.round(conc * 100) / 100).toString().replace('.', ',')} mg/ml`} />
          <Stat label={t('Doses por frasco', 'Dosis por frasco')} valor={dosesFrasco > 0 ? String(dosesFrasco) : '—'} />
          <Stat label={t('Volume por dose', 'Volumen por dosis')} valor={`${(Math.round((unidades / 100) * 1000) / 1000).toString().replace('.', ',')} ml`} />
        </div>

        <div style={S.nota}>
          {t(
            'Cálculo para seringa de insulina U-100 (1 ml = 100 unidades). Confira sempre antes de aplicar.',
            'Cálculo para jeringa de insulina U-100 (1 ml = 100 unidades). Verifica siempre antes de aplicar.',
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Régua de seringa ───
function Regua({ max, valor }: { max: number; valor: number }) {
  const larguraPct = Math.max(0, Math.min(100, (valor / max) * 100));
  // marcações: passo menor conforme a escala (para não poluir)
  const passo = max <= 30 ? 1 : max <= 50 ? 2 : 5;
  const ticks: number[] = [];
  for (let u = 0; u <= max; u += passo) ticks.push(u);
  const labelCada = max <= 30 ? 5 : max <= 50 ? 10 : 10;

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', minWidth: 320, height: 64, marginTop: 8 }}>
        {/* preenchimento até o valor */}
        <div style={{ position: 'absolute', left: 0, top: 0, height: 30, width: `${larguraPct}%`, background: '#22B0F0', borderRadius: 3 }} />
        {/* base */}
        <div style={{ position: 'absolute', left: 0, top: 30, width: '100%', height: 1, background: '#98A2B3' }} />
        {ticks.map((u) => {
          const left = (u / max) * 100;
          const maior = u % labelCada === 0;
          return (
            <div key={u} style={{ position: 'absolute', left: `${left}%`, top: 30 }}>
              <div style={{ width: 1, height: maior ? 14 : 8, background: '#667085' }} />
              {maior && u > 0 && (
                <div style={{ position: 'absolute', top: 16, left: 0, transform: 'translateX(-50%)', fontSize: 12, fontWeight: 700, color: '#475467' }}>{u}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subcomponentes ───
function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={S.blocoTitulo}>{titulo}</div>
      {children}
    </div>
  );
}

function Opcao({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ ...S.opcao, ...(ativo ? S.opcaoAtiva : {}) }}>
      {children}
    </button>
  );
}

function Escolha({
  opcoes, valor, onPick, sufixo, min, max, step, labelOutro,
}: {
  opcoes: number[]; valor: number; onPick: (n: number) => void; sufixo: string;
  min: number; max: number; step: number; labelOutro: string;
}) {
  const ehPredef = opcoes.includes(valor);
  const [outro, setOutro] = useState(false);
  const mostrarOutro = outro || !ehPredef;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {opcoes.map((o) => (
        <button key={o} onClick={() => { setOutro(false); onPick(o); }}
          style={{ ...S.pill, ...(valor === o && !outro ? S.pillAtiva : {}) }}>
          {o} {sufixo}
        </button>
      ))}
      <button onClick={() => setOutro(true)} style={{ ...S.pill, ...(mostrarOutro && !ehPredef ? S.pillAtiva : {}) }}>
        {labelOutro}
      </button>
      {mostrarOutro && (
        <input
          type="number" min={min} max={max} step={step}
          value={ehPredef && !outro ? '' : valor}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n) && n >= min && n <= max) onPick(n);
          }}
          placeholder={sufixo}
          style={S.inpOutro}
          autoFocus
        />
      )}
    </div>
  );
}

function Stat({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={S.stat}>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValor}>{valor}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 },
  blocoTitulo: { fontWeight: 700, fontSize: 15, color: '#0E1113', marginBottom: 10 },
  opcao: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, border: '1px solid #E7E7E7', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, color: '#0E1113', textAlign: 'left', width: '100%' },
  opcaoAtiva: { borderColor: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,.12)' },
  opSub: { fontSize: 12.5, color: '#98A2B3', marginLeft: 'auto' },
  pill: { padding: '10px 16px', borderRadius: 10, border: '1px solid #E7E7E7', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#344054' },
  pillAtiva: { borderColor: '#16A34A', color: '#0B7A3B', background: '#F0FAF3', boxShadow: '0 0 0 3px rgba(22,163,74,.12)' },
  inpOutro: { width: 90, padding: '9px 10px', borderRadius: 10, border: '1px solid #16A34A', fontFamily: 'inherit', fontSize: 14, color: '#0E1113' },
  resultado: { border: '1px solid #ECEDEE', borderRadius: 16, padding: '22px 24px', background: '#fff' },
  frase: { fontSize: 20, color: '#0E1113', lineHeight: 1.4 },
  aviso: { marginTop: 12, fontSize: 13, color: '#B91C1C', background: '#FEF2F2', borderRadius: 10, padding: '10px 12px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 },
  stat: { background: '#F7F9F8', border: '1px solid #ECEFED', borderRadius: 10, padding: '10px 12px' },
  statLabel: { fontSize: 11.5, color: '#667085', fontWeight: 600 },
  statValor: { fontSize: 16, fontWeight: 700, color: '#0E1113', marginTop: 2 },
  nota: { fontSize: 11.5, color: '#98A2B3', marginTop: 14, lineHeight: 1.45 },
};
