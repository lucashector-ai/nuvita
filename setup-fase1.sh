#!/bin/bash
# ════════════════════════════════════════════════
#  NUVITA — Setup automático Fase 1
#  - Remove links inexistentes do footer
#  - Cria /termos e /privacidade
#  - Adiciona checkbox de aceite em /cadastro
#  - Comita e pusha
# ════════════════════════════════════════════════

set -e  # Para na primeira falha

echo "🔍 Verificando que você está no repo nuvita..."
if [ ! -f "app/page.tsx" ] || [ ! -f "app/cadastro/page.tsx" ]; then
  echo "❌ ERRO: rode esse script de dentro da pasta nuvita/"
  echo "   pwd atual: $(pwd)"
  exit 1
fi
echo "✓ Tá no lugar certo: $(pwd)"
echo ""

# ════════════════════════════════════════════════
# PARTE 1 — Remove FooterCol "Empresa" da landing
# ════════════════════════════════════════════════
echo "📝 Editando app/page.tsx (removendo Sobre/Contato/Blog)..."

python3 <<'PYEOF'
import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove o bloco <FooterCol title="Empresa" ... />
pattern = r'\s*<FooterCol\s+title="Empresa"[\s\S]*?/>\n'
new_content = re.sub(pattern, '\n', content)

# 2. Troca o gridTemplateColumns de 4 colunas pra 3
new_content = new_content.replace(
    "gridTemplateColumns: '1.5fr 1fr 1fr 1fr'",
    "gridTemplateColumns: '1.5fr 1fr 1fr'"
)

if content == new_content:
    print("⚠️  Nada foi alterado — talvez já tenha sido removido antes")
else:
    with open('app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✓ Footer atualizado (3 colunas, sem Empresa)")
PYEOF

echo ""

# ════════════════════════════════════════════════
# PARTE 2 — Cria /termos e /privacidade
# ════════════════════════════════════════════════
echo "📁 Criando pastas app/termos e app/privacidade..."
mkdir -p app/termos app/privacidade

# Procura os arquivos baixados em vários lugares possíveis
TERMOS_SRC=""
PRIV_SRC=""
for dir in . ~/Downloads ~/Desktop; do
  [ -z "$TERMOS_SRC" ] && [ -f "$dir/termos-page.tsx" ] && TERMOS_SRC="$dir/termos-page.tsx"
  [ -z "$PRIV_SRC" ] && [ -f "$dir/privacidade-page.tsx" ] && PRIV_SRC="$dir/privacidade-page.tsx"
done

if [ -z "$TERMOS_SRC" ]; then
  echo "❌ ERRO: não encontrei termos-page.tsx"
  echo "   Procurei em: . ~/Downloads ~/Desktop"
  echo "   Baixa o arquivo do chat e roda esse script de novo"
  exit 1
fi

if [ -z "$PRIV_SRC" ]; then
  echo "❌ ERRO: não encontrei privacidade-page.tsx"
  echo "   Procurei em: . ~/Downloads ~/Desktop"
  echo "   Baixa o arquivo do chat e roda esse script de novo"
  exit 1
fi

mv "$TERMOS_SRC" app/termos/page.tsx
mv "$PRIV_SRC" app/privacidade/page.tsx
echo "✓ /termos e /privacidade criados"
echo ""

# ════════════════════════════════════════════════
# PARTE 3 — Adiciona checkbox de aceite em /cadastro
# ════════════════════════════════════════════════
echo "📝 Editando app/cadastro/page.tsx (checkbox LGPD)..."

# Backup antes de mexer
cp app/cadastro/page.tsx app/cadastro/page.tsx.bak

python3 <<'PYEOF'
import re

with open('app/cadastro/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Detecta se já tem aceiteTermos pra não duplicar
if 'aceiteTermos' in content:
    print("⚠️  Checkbox já parece existir — pulando edição do cadastro")
    exit(0)

# 1. Adiciona o useState do aceite
# Procura o último useState do componente principal
state_pattern = r'(const \[loading, setLoading\] = useState\([^)]*\);)'
if re.search(state_pattern, content):
    content = re.sub(
        state_pattern,
        r'\1\n  const [aceiteTermos, setAceiteTermos] = useState(false);',
        content,
        count=1
    )
else:
    # Fallback: adiciona depois do primeiro useState que encontrar
    content = re.sub(
        r'(const \[\w+, set\w+\] = useState\([^)]*\);)',
        r'\1\n  const [aceiteTermos, setAceiteTermos] = useState(false);',
        content,
        count=1
    )

# 2. Adiciona validação do aceite logo após a validação de senha
content = re.sub(
    r'(if \(senha\.length < 6\) \{ setErro\("Senha deve ter pelo menos 6 caracteres\."\); return; \})',
    r'\1\n    if (!aceiteTermos) { setErro("Você precisa aceitar os Termos e a Política de Privacidade."); return; }',
    content
)

# 3. Adiciona o JSX do checkbox antes do botão "Criar conta..."
checkbox_jsx = '''        {modo === "cadastro" && (
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 16,
              cursor: "pointer",
              fontSize: 13,
              color: "#6B7280",
              lineHeight: 1.5,
            }}
          >
            <input
              type="checkbox"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              style={{
                marginTop: 3,
                width: 16,
                height: 16,
                accentColor: "#22C55E",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span>
              Li e aceito os{" "}
              <a href="/termos" target="_blank" style={{ color: "#15803D", textDecoration: "underline" }}>
                Termos de Uso
              </a>{" "}
              e a{" "}
              <a href="/privacidade" target="_blank" style={{ color: "#15803D", textDecoration: "underline" }}>
                Política de Privacidade
              </a>
              , incluindo o tratamento dos meus dados de saúde para gerar o protocolo personalizado.
            </span>
          </label>
        )}
'''

# Insere o checkbox antes do botão de submit do cadastro
content = re.sub(
    r'(\s*<button onClick=\{modo === "cadastro" \? cadastrar : entrar\})',
    f'\n{checkbox_jsx}\\1',
    content,
    count=1
)

with open('app/cadastro/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Checkbox de aceite adicionado em /cadastro")
PYEOF

echo ""

# ════════════════════════════════════════════════
# PARTE 4 — Limpeza, commit e push
# ════════════════════════════════════════════════
echo "🧹 Limpando backups antigos..."
rm -f app/page.tsx.bak app/cadastro/page.tsx.bak
echo "✓ Backups removidos"
echo ""

echo "📦 Status final:"
git status --short
echo ""

echo "💾 Commitando..."
git add app/page.tsx app/termos app/privacidade app/cadastro/page.tsx
git commit -m "feat: termos, privacidade, checkbox LGPD + remove links inexistentes"

echo ""
echo "🚀 Empurrando pro GitHub (Vercel vai deployar sozinho)..."
git push origin main

echo ""
echo "✅ TUDO PRONTO!"
echo ""
echo "Acompanhe o deploy: https://vercel.com (1-2 min)"
echo "Depois testa em:"
echo "  • https://nuvita-l1wk.vercel.app/"
echo "  • https://nuvita-l1wk.vercel.app/termos"
echo "  • https://nuvita-l1wk.vercel.app/privacidade"
echo "  • https://nuvita-l1wk.vercel.app/cadastro  (deve ter o checkbox)"
