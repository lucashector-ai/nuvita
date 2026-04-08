export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

// Templates de email em HTML
const templates: Record<string, (data: any) => { subject: string; html: string }> = {

  'boas-vindas': ({ nome, email }) => ({
    subject: 'Bem-vindo à Nuvita 🧬',
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.header { background:#0F6E56; padding:40px 40px 32px; text-align:center; }
.header h1 { color:white; font-size:24px; font-weight:700; margin:0 0 8px; letter-spacing:-.03em; }
.header p { color:rgba(255,255,255,.75); font-size:14px; margin:0; }
.body { padding:32px 40px; }
.body h2 { font-size:18px; font-weight:600; color:#111827; margin:0 0 12px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 16px; }
.btn { display:inline-block; background:#111827; color:white; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:600; margin:8px 0 24px; }
.feature { display:flex; gap:12px; align-items:flex-start; margin-bottom:16px; }
.feature-ico { width:36px; height:36px; border-radius:9px; background:#F0FDF4; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
.feature-text h3 { font-size:14px; font-weight:600; color:#111827; margin:0 0 2px; }
.feature-text p { font-size:13px; color:#6B7280; margin:0; line-height:1.5; }
.footer { border-top:1px solid #F3F4F6; padding:24px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="header">
    <h1>nuvita</h1>
    <p>Sua plataforma de peptídeos personalizados</p>
  </div>
  <div class="body">
    <h2>Olá, ${nome || 'bem-vindo'}! 👋</h2>
    <p>Seu protocolo personalizado de peptídeos está pronto. Criamos uma análise completa baseada no seu diagnóstico para otimizar seus resultados.</p>
    <a href="https://nuvita-l1wk.vercel.app/dashboard" class="btn">Acessar meu protocolo →</a>
    <div class="feature">
      <div class="feature-ico">🧬</div>
      <div class="feature-text"><h3>Protocolo personalizado</h3><p>Peptídeos selecionados por IA com base nos seus objetivos, peso e histórico.</p></div>
    </div>
    <div class="feature">
      <div class="feature-ico">📅</div>
      <div class="feature-text"><h3>Calendário de aplicações</h3><p>Veja cada dia do seu ciclo com os peptídeos, doses e horários.</p></div>
    </div>
    <div class="feature">
      <div class="feature-ico">🤖</div>
      <div class="feature-text"><h3>Coach IA</h3><p>Tire dúvidas sobre seu protocolo com nossa IA especializada a qualquer momento.</p></div>
    </div>
  </div>
  <div class="footer"><p>Nuvita · Você está recebendo este email porque criou uma conta em nuvita-l1wk.vercel.app</p></div>
</div>
</body></html>`
  }),

  'pagamento-confirmado': ({ nome, plano, valor, intervalo }) => ({
    subject: `Pagamento confirmado — Plano ${plano} ✅`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.header { background:#0F6E56; padding:32px 40px; text-align:center; }
.header h1 { color:white; font-size:22px; font-weight:700; margin:0; }
.body { padding:32px 40px; }
.receipt { background:#F9FAFB; border-radius:12px; padding:20px; margin:20px 0; }
.receipt-row { display:flex; justify-content:space-between; font-size:14px; padding:6px 0; border-bottom:1px solid #F3F4F6; }
.receipt-row:last-child { border-bottom:none; font-weight:700; font-size:15px; }
.btn { display:inline-block; background:#111827; color:white; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:600; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="header"><h1>✅ Pagamento confirmado</h1></div>
  <div class="body">
    <p style="font-size:14px;color:#6B7280;line-height:1.7;">Olá ${nome || ''}! Seu pagamento foi processado com sucesso e seu acesso já está ativo.</p>
    <div class="receipt">
      <div class="receipt-row"><span style="color:#6B7280">Plano</span><span>Nuvita ${plano}</span></div>
      <div class="receipt-row"><span style="color:#6B7280">Cobrança</span><span>${intervalo === 'anual' ? 'Anual' : 'Mensal'}</span></div>
      <div class="receipt-row"><span style="color:#6B7280">Total</span><span>R$ ${(valor/100).toFixed(2)}</span></div>
    </div>
    <a href="https://nuvita-l1wk.vercel.app/dashboard" class="btn">Acessar plataforma →</a>
  </div>
  <div class="footer"><p>Nuvita · Para gerenciar sua assinatura acesse Configurações → Cobrança</p></div>
</div>
</body></html>`
  }),

  'pagamento-falhou': ({ nome, plano }) => ({
    subject: `Falha no pagamento — Ação necessária ⚠️`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.header { background:#D85A30; padding:32px 40px; text-align:center; }
.header h1 { color:white; font-size:22px; font-weight:700; margin:0; }
.body { padding:32px 40px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 16px; }
.btn { display:inline-block; background:#D85A30; color:white; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:600; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="header"><h1>⚠️ Falha no pagamento</h1></div>
  <div class="body">
    <p>Olá ${nome || ''}! Tivemos um problema ao processar o pagamento do seu plano <strong>${plano}</strong>.</p>
    <p>Para manter seu acesso ativo, atualize seu método de pagamento o quanto antes.</p>
    <a href="https://nuvita-l1wk.vercel.app/configuracoes" class="btn">Atualizar cartão →</a>
  </div>
  <div class="footer"><p>Nuvita · Acesse Configurações → Cobrança para atualizar seu cartão</p></div>
</div>
</body></html>`
  }),

  'cancelamento': ({ nome, plano, dataFim }) => ({
    subject: `Assinatura cancelada — Até logo 👋`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.header { background:#111827; padding:32px 40px; text-align:center; }
.header h1 { color:white; font-size:22px; font-weight:700; margin:0; }
.body { padding:32px 40px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 16px; }
.info { background:#F9FAFB; border-radius:12px; padding:16px 20px; font-size:14px; color:#374151; margin:16px 0; }
.btn { display:inline-block; background:#0F6E56; color:white; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:600; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="header"><h1>Assinatura cancelada</h1></div>
  <div class="body">
    <p>Olá ${nome || ''}! Confirmamos o cancelamento da sua assinatura <strong>${plano}</strong>.</p>
    <div class="info">📅 Você mantém acesso completo até <strong>${dataFim || 'o fim do período atual'}</strong>.</div>
    <p>Após essa data, sua conta volta automaticamente para o plano gratuito. Você pode reativar a qualquer momento.</p>
    <a href="https://nuvita-l1wk.vercel.app/planos" class="btn">Reativar assinatura →</a>
  </div>
  <div class="footer"><p>Nuvita · Sentiremos sua falta! Sempre que quiser, pode voltar.</p></div>
</div>
</body></html>`
  }),

  'exclusao-conta': ({ nome, email }) => ({
    subject: `Sua conta Nuvita foi excluída`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.body { padding:40px; }
.body h2 { font-size:20px; font-weight:600; color:#111827; margin:0 0 16px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 12px; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="body">
    <h2>Conta excluída</h2>
    <p>Olá ${nome || ''}! Confirmamos que sua conta Nuvita associada ao email <strong>${email}</strong> foi excluída com sucesso.</p>
    <p>Todos os seus dados foram removidos permanentemente de nossos servidores, incluindo diagnóstico, protocolo e histórico.</p>
    <p>Se isso foi um engano ou você mudar de ideia, pode criar uma nova conta a qualquer momento em nuvita-l1wk.vercel.app.</p>
  </div>
  <div class="footer"><p>Nuvita · Obrigado por ter feito parte da nossa comunidade.</p></div>
</div>
</body></html>`
  }),

  'reengajamento': ({ nome, diasSemLogin }) => ({
    subject: `${nome ? nome + ', s' : 'S'}entimos sua falta! 💊`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.header { background:linear-gradient(135deg,#0F6E56,#0a4f3e); padding:40px; text-align:center; }
.header h1 { color:white; font-size:22px; font-weight:700; margin:0 0 8px; }
.header p { color:rgba(255,255,255,.75); font-size:14px; margin:0; }
.body { padding:32px 40px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 16px; }
.btn { display:inline-block; background:#0F6E56; color:white; text-decoration:none; padding:14px 32px; border-radius:10px; font-size:14px; font-weight:600; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="header"><h1>💊 Seu protocolo está esperando</h1><p>Faz ${diasSemLogin || 7} dias que você não registra suas aplicações</p></div>
  <div class="body">
    <p>Olá ${nome || ''}! A consistência é o fator mais importante para obter resultados com peptídeos. Sem registros regulares, é difícil acompanhar seu progresso.</p>
    <p>Volte agora para registrar suas aplicações e manter seu ciclo no trilho.</p>
    <a href="https://nuvita-l1wk.vercel.app/dashboard" class="btn">Retomar meu protocolo →</a>
  </div>
  <div class="footer"><p>Nuvita · Para cancelar emails de lembrete, acesse Configurações → Notificações</p></div>
</div>
</body></html>`
  }),

  'consulta-agendada': ({ nome, data, medico, link }) => ({
    subject: `Consulta agendada para ${data} 📅`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.header { background:#2563EB; padding:32px 40px; text-align:center; }
.header h1 { color:white; font-size:22px; font-weight:700; margin:0; }
.body { padding:32px 40px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 16px; }
.info { background:#EFF6FF; border-radius:12px; padding:20px; margin:16px 0; }
.info-row { display:flex; gap:12px; align-items:center; font-size:14px; color:#1E40AF; margin-bottom:8px; }
.info-row:last-child { margin-bottom:0; }
.btn { display:inline-block; background:#2563EB; color:white; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:600; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="header"><h1>📅 Consulta confirmada</h1></div>
  <div class="body">
    <p>Olá ${nome || ''}! Sua consulta foi agendada com sucesso.</p>
    <div class="info">
      <div class="info-row">📅 <strong>${data}</strong></div>
      <div class="info-row">👨‍⚕️ ${medico || 'Médico parceiro Nuvita'}</div>
      ${link ? `<div class="info-row">🔗 <a href="${link}" style="color:#2563EB">Link da videochamada</a></div>` : ''}
    </div>
    <a href="https://nuvita-l1wk.vercel.app/consultas" class="btn">Ver minhas consultas →</a>
  </div>
  <div class="footer"><p>Nuvita · Para cancelar ou remarcar, acesse a plataforma</p></div>
</div>
</body></html>`
  }),

  'renovacao-lembrete': ({ nome, plano, dataRenovacao, valor }) => ({
    subject: `Sua assinatura renova em 3 dias 💳`,
    html: `
<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#F7F7F7; margin:0; padding:40px 20px; }
.card { background:white; border-radius:16px; max-width:560px; margin:0 auto; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
.body { padding:40px; }
.body h2 { font-size:20px; font-weight:600; color:#111827; margin:0 0 16px; }
.body p { font-size:14px; color:#6B7280; line-height:1.7; margin:0 0 16px; }
.info { background:#FEF3C7; border-radius:12px; padding:16px 20px; font-size:14px; color:#92400E; margin:16px 0; }
.btn { display:inline-block; background:#111827; color:white; text-decoration:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:600; }
.footer { border-top:1px solid #F3F4F6; padding:20px 40px; text-align:center; }
.footer p { font-size:12px; color:#9CA3AF; margin:0; }
</style></head><body>
<div class="card">
  <div class="body">
    <h2>💳 Renovação em 3 dias</h2>
    <p>Olá ${nome || ''}! Lembrando que sua assinatura <strong>${plano}</strong> será renovada automaticamente.</p>
    <div class="info">📅 Data de renovação: <strong>${dataRenovacao}</strong> · Valor: <strong>R$ ${(valor/100).toFixed(2)}</strong></div>
    <p>Se quiser cancelar ou trocar de plano antes da renovação, acesse as configurações de cobrança.</p>
    <a href="https://nuvita-l1wk.vercel.app/configuracoes" class="btn">Gerenciar assinatura →</a>
  </div>
  <div class="footer"><p>Nuvita · Gerenciado com segurança via Stripe</p></div>
</div>
</body></html>`
  }),
};

export async function POST(req: NextRequest) {
  try {
    const { tipo, email, dados } = await req.json();

    if (!tipo || !email) {
      return NextResponse.json({ error: 'tipo e email são obrigatórios' }, { status: 400 });
    }

    const template = templates[tipo];
    if (!template) {
      return NextResponse.json({ error: `Template "${tipo}" não encontrado` }, { status: 400 });
    }

    const { subject, html } = template(dados || {});

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.log('RESEND_API_KEY não configurada — email não enviado:', { tipo, email, subject });
      return NextResponse.json({ ok: true, simulado: true });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nuvita <noreply@nuvita.app>',
        to: email,
        subject,
        html,
      }),
    });

    const result = await res.json();
    if (!res.ok) return NextResponse.json({ error: result }, { status: 500 });

    return NextResponse.json({ ok: true, id: result.id });
  } catch (err: any) {
    console.error('Email error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
