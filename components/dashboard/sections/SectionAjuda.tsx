// @ts-nocheck
'use client';
import { useState } from 'react';

const FAQS = [
  { cat: 'Protocolo', perguntas: [
    { q: 'Como é gerado meu protocolo?', r: 'Seu protocolo é gerado por IA com base nas suas respostas do diagnóstico — objetivos, nível de experiência, peso, altura, sono e estresse. A IA seleciona os peptídeos mais adequados, calcula doses e define frequências.' },
    { q: 'Posso adicionar ou remover peptídeos do meu protocolo?', r: 'Sim! Na seção de Revisão do protocolo você pode aceitar ou remover cada peptídeo individualmente. Também pode refazer o diagnóstico a qualquer momento para atualizar seus objetivos.' },
    { q: 'Com que frequência devo revisar meu protocolo?', r: 'Recomendamos revisar a cada ciclo (4–12 semanas dependendo do protocolo). Use a seção de Análise para ver sua evolução e o Coach IA para ajustes pontuais.' },
    { q: 'O que é o Ajuste Automático?', r: 'O Ajuste Automático analisa seus registros de check-in, diário e consistência para sugerir modificações no protocolo com base na sua evolução real.' },
  ]},
  { cat: 'Peptídeos', perguntas: [
    { q: 'Os peptídeos são seguros?', r: 'Os peptídeos listados na plataforma são amplamente estudados. Porém, sempre consulte um médico antes de iniciar qualquer protocolo. A Nuvita fornece informações educativas, não prescrições médicas.' },
    { q: 'Onde compro os peptídeos?', r: 'A Nuvita não vende peptídeos. Nossa plataforma fornece o protocolo personalizado e o acompanhamento. Para aquisição, recomendamos fornecedores certificados indicados por seu médico.' },
    { q: 'Como calcular a dose correta?', r: 'Use nossa Calculadora de doses disponível no menu lateral. As doses são calculadas com base no seu peso corporal e protocolo específico.' },
    { q: 'O que é a via SC?', r: 'SC significa subcutâneo — aplicação sob a pele com agulha fina. É a via mais comum para peptídeos. Consulte seu médico para aprender a técnica correta.' },
  ]},
  { cat: 'Conta e Planos', perguntas: [
    { q: 'Quais são os planos disponíveis?', r: 'Oferecemos três planos: Gratuito (protocolo básico e biblioteca), Essencial (Coach IA, Tracker, Análises — R$47/mês) e Pro (tudo do Essencial + médico parceiro — R$97/mês).' },
    { q: 'Posso cancelar a qualquer momento?', r: 'Sim! Acesse Configurações → Cobrança → Cancelar assinatura. Você mantém acesso até o fim do período pago. Não há taxa de cancelamento.' },
    { q: 'Como atualizo meu cartão?', r: 'Acesse Configurações → Cobrança → Atualizar cartão. Você será redirecionado ao portal seguro do Stripe para atualizar seus dados de pagamento.' },
    { q: 'O pagamento é seguro?', r: 'Sim. Todos os pagamentos são processados pelo Stripe, um dos sistemas de pagamento mais seguros do mundo. A Nuvita nunca armazena dados do seu cartão.' },
  ]},
  { cat: 'Técnico', perguntas: [
    { q: 'Meus dados são seguros?', r: 'Sim. Seus dados são armazenados com criptografia no Supabase e só você tem acesso ao seu protocolo. Nunca vendemos ou compartilhamos seus dados pessoais.' },
    { q: 'Como exporto meu protocolo para o médico?', r: 'Acesse Exportar no menu lateral. Você pode gerar um PDF completo com todos os peptídeos, doses, frequências e observações para compartilhar com seu médico.' },
    { q: 'A plataforma funciona no celular?', r: 'Sim! A Nuvita é responsiva e funciona em smartphones e tablets. Para a melhor experiência, recomendamos o uso no navegador Chrome ou Safari.' },
  ]},
];

const STATUS_ITEMS = [
  { nome: 'Plataforma web', status: 'ok' },
  { nome: 'API de diagnóstico IA', status: 'ok' },
  { nome: 'Pagamentos Stripe', status: 'ok' },
  { nome: 'Banco de dados', status: 'ok' },
  { nome: 'Emails', status: 'ok' },
];

export default function SectionAjuda({ onNavigate }: any) {
  const [catAtiva, setCatAtiva] = useState('Protocolo');
  const [aberta, setAberta] = useState<string|null>(null);

  const CARD: any = {
    background:'white', borderRadius:14, padding:'1.5rem',
    boxShadow:'0 1px 3px rgba(0,0,0,.06),0 2px 8px rgba(0,0,0,.04)', marginBottom:'1rem',
  };

  return (
    <div style={{ maxWidth:720 }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:600, letterSpacing:'-.04em', marginBottom:'.25rem' }}>Ajuda</h2>
        <p style={{ fontSize:13, color:'#6B7280' }}>Tudo que você precisa saber sobre a Nuvita</p>
      </div>

      {/* Ações rápidas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:'1.5rem' }}>
        {[
          { ico:'🤖', label:'Coach IA', desc:'Tire dúvidas com IA', action:'coach' },
          { ico:'📤', label:'Exportar PDF', desc:'Para seu médico', action:'exportacao' },
          { ico:'🔄', label:'Rediagnosticar', desc:'Atualizar objetivos', action:null, href:'/diagnostico' },
        ].map(item => (
          <button key={item.label}
            onClick={() => item.href ? window.location.href = item.href : onNavigate && onNavigate(item.action)}
            style={{ background:'white', borderRadius:12, padding:'16px', border:'1px solid #E5E7EB', cursor:'pointer', fontFamily:'inherit', textAlign:'left', boxShadow:'0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{item.ico}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#111827', marginBottom:2 }}>{item.label}</div>
            <div style={{ fontSize:11, color:'#9CA3AF' }}>{item.desc}</div>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div style={CARD}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Perguntas frequentes</div>

        {/* Categorias */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1.25rem' }}>
          {FAQS.map(f => (
            <button key={f.cat} onClick={() => { setCatAtiva(f.cat); setAberta(null); }}
              style={{ padding:'6px 14px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:catAtiva===f.cat?600:400,
                background:catAtiva===f.cat?'#111827':'#F3F4F6', color:catAtiva===f.cat?'white':'#6B7280', transition:'all .15s' }}>
              {f.cat}
            </button>
          ))}
        </div>

        {/* Perguntas */}
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {FAQS.find(f => f.cat === catAtiva)?.perguntas.map((p, i) => (
            <div key={i}>
              <div onClick={() => setAberta(aberta === p.q ? null : p.q)}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:10, cursor:'pointer', background: aberta===p.q ? '#F0FDF4' : '#F9FAFB', transition:'background .1s', gap:12 }}>
                <span style={{ fontSize:13, fontWeight:500, color:'#111827', flex:1 }}>{p.q}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ flexShrink:0, transform:aberta===p.q?'rotate(180deg)':'none', transition:'transform .2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
              {aberta === p.q && (
                <div style={{ padding:'10px 14px 14px', background:'#F0FDF4', borderRadius:'0 0 10px 10px', marginTop:-4 }}>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.7, margin:0 }}>{p.r}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status do sistema */}
      <div style={CARD}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#9CA3AF', marginBottom:'1rem' }}>Status do sistema</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {STATUS_ITEMS.map(item => (
            <div key={item.nome} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#374151' }}>{item.nome}</span>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100,
                background: item.status==='ok' ? '#DCFCE7' : '#FEE2E2',
                color: item.status==='ok' ? '#15803D' : '#D85A30' }}>
                {item.status==='ok' ? '● Operacional' : '● Degradado'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contato */}
      <div style={{ ...CARD, background:'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border:'1px solid #BBF7D0' }}>
        <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#15803D', marginBottom:'1rem' }}>Ainda precisa de ajuda?</div>
        <p style={{ fontSize:13, color:'#374151', lineHeight:1.65, margin:'0 0 16px' }}>
          Nosso Coach IA responde perguntas sobre peptídeos e seu protocolo específico 24 horas por dia, 7 dias por semana.
        </p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => onNavigate && onNavigate('coach')}
            style={{ padding:'10px 20px', borderRadius:10, border:'none', background:'#0F6E56', color:'white', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600 }}>
            Falar com Coach IA →
          </button>
          <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer"
            style={{ padding:'10px 20px', borderRadius:10, border:'1px solid #BBF7D0', background:'white', color:'#15803D', textDecoration:'none', fontSize:13, fontWeight:500 }}>
            WhatsApp da comunidade
          </a>
        </div>
      </div>
    </div>
  );
}
