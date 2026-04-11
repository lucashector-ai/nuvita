// ════════════════════════════════════════════════
//  NUVITA — lib/rateLimit.ts
//  Rate limiter em memória (sliding window simples).
//  - Suficiente para mitigar abuso casual / scraping
//  - Para produção em escala, mover para Upstash/Redis
// ════════════════════════════════════════════════

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Cleanup periódico para não vazar memória
let lastCleanup = Date.now();
function cleanup(now: number) {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

/**
 * Aplica rate limit por chave (ex: ip + rota).
 * Retorna { allowed, remaining, retryAfter }.
 *
 * @param key      identificador único do bucket
 * @param limit    máximo de requests por janela
 * @param windowMs janela em milissegundos
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  cleanup(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
}
