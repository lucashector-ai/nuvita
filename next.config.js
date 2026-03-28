/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite chamadas à API Anthropic diretamente do browser no dev
  // Em produção, mover para API Routes do Next.js para proteger a chave
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
