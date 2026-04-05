import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Nuvita — Diagnóstico de Peptídeos',
  description: '10 perguntas para montar um protocolo real de peptídeos adaptado ao seu perfil e objetivos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet" />
        <style>{`
          html, body, #__next, #__next > div { background: #F7F7F7 !important; }
          aside { background: #F7F7F7 !important; border-right: 1px solid #E5E7EB !important; }
          div[style*="min-height: 100vh"] { background: #F7F7F7 !important; }
          div[style*="minHeight: 100vh"] { background: #F7F7F7 !important; }
        `}</style>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var CARD_SHADOW = '0 1px 3px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)';
            var SKIP_TAGS = { ASIDE:1, NAV:1, HEADER:1, BUTTON:1, INPUT:1, A:1 };
            var SKIP_CLASSES = ['overlay','modal','btn','tag','pill','badge'];

            function fix(el) {
              if (!el || !el.style || SKIP_TAGS[el.tagName]) return;
              var cl = el.className || '';
              if (SKIP_CLASSES.some(function(c){ return cl.indexOf(c) > -1; })) return;
              if (el.closest && (el.closest('aside') || el.closest('button') || el.closest('.overlay'))) return;

              var s = el.style;
              var bg = s.background || s.backgroundColor || '';
              var border = s.border || s.borderTop || s.borderBottom || '';

              // Background fixes
              if (s.minHeight === '100vh' || s.minHeight === '100dvh') {
                if (!bg.includes('gradient') && !bg.includes('0F1115') && !bg.includes('F7F7F7')) {
                  s.background = '#F7F7F7';
                }
              }
              if (bg.includes('255, 255, 255') || bg === 'white' || bg === '#fff' || bg === '#ffffff' || bg === '#FFFFFF') {
                // Card? tem borderRadius?
                if (s.borderRadius) {
                  s.background = '#FFFFFF';
                  if (!s.boxShadow || s.boxShadow === 'none') {
                    s.boxShadow = CARD_SHADOW;
                  }
                }
              }

              // Remove card borders (não remover borders de inputs, botões, etc)
              if (border && border.includes('solid') && s.borderRadius &&
                  !border.includes('rgba(255') && !border.includes('transparent') &&
                  !border.includes('none') && !border.includes('var(--green)') &&
                  el.tagName === 'DIV') {
                var br = parseFloat(s.borderRadius);
                if (br >= 8) {
                  s.border = 'none';
                  if (!s.boxShadow || s.boxShadow === 'none') {
                    s.boxShadow = CARD_SHADOW;
                  }
                }
              }
            }

            function scanAll() {
              document.querySelectorAll('div').forEach(fix);
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', scanAll);
            } else {
              setTimeout(scanAll, 100);
            }
            setTimeout(scanAll, 500);
            setTimeout(scanAll, 1500);

            var mo = new MutationObserver(function(muts) {
              muts.forEach(function(m) {
                m.addedNodes.forEach(function(n) {
                  if (n.nodeType === 1) {
                    fix(n);
                    if (n.querySelectorAll) n.querySelectorAll('div').forEach(fix);
                  }
                });
                if (m.type === 'attributes') fix(m.target);
              });
            });
            document.addEventListener('DOMContentLoaded', function() {
              mo.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['style'] });
              scanAll();
            });
          })();
        `}} />
        {children}
      </body>
    </html>
  );
}
