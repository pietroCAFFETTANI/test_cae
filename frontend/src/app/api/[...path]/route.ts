import { NextRequest } from 'next/server';

// Garante que essa rota nao seja pre-renderizada: precisa rodar em runtime
// pra ler process.env.BACKEND_URL a cada request.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Proxy server-side de /api/* para o backend definido em BACKEND_URL.
 *
 * Como funciona:
 *   - Toda chamada do navegador para /api/algo cai aqui.
 *   - Esse handler le process.env.BACKEND_URL EM TEMPO DE EXECUCAO (nao em
 *     build), monta a URL final e repassa o request.
 *   - A resposta volta intacta para o navegador.
 *
 * Vantagens vs rewrite hardcoded:
 *   - Mesma imagem serve qualquer ambiente.
 *   - Trocar de backend = mudar a env e reiniciar (sem rebuild).
 *   - Frontend e backend continuam tendo origens diferentes do ponto de
 *     vista do navegador, mas como o proxy roda no servidor Next, nao ha
 *     CORS no caminho.
 */

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return new Response(
      JSON.stringify({ error: 'BACKEND_URL nao configurada no servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { path } = await ctx.params;
  const subPath = (path ?? []).join('/');
  const search = req.nextUrl.search; // mantem ?param=value
  const target = `${backendUrl.replace(/\/$/, '')}/api/${subPath}${search}`;

  // Reproduz headers, removendo os que nao fazem sentido no proxy
  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');

  // Repassa o corpo se houver
  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: 'manual',
  };
  if (!['GET', 'HEAD'].includes(req.method)) {
    init.body = await req.arrayBuffer();
  }

  try {
    const upstream = await fetch(target, init);
    // Repassa a resposta intacta
    const respHeaders = new Headers(upstream.headers);
    respHeaders.delete('content-encoding'); // evita double-encoding
    respHeaders.delete('transfer-encoding');
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: 'Falha ao chamar o backend', detail: msg, target }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Exporta um handler por verbo - todos delegam pro mesmo proxy
export const GET     = handle;
export const POST    = handle;
export const PUT     = handle;
export const PATCH   = handle;
export const DELETE  = handle;
export const OPTIONS = handle;
export const HEAD    = handle;
