export default async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url = new URL(request.url);
  const targetPath = url.pathname.replace('/api', '/wp-json');
  const targetUrl = `https://filamentstore-demo.xo.je${targetPath}${url.search}`;

  const browserHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
  };

  let response = await fetch(targetUrl, {
    method: request.method,
    headers: browserHeaders,
    body: request.method !== 'GET' ? request.body : undefined,
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    const html = await response.text();
    const cookie = await solveInfinityFreeChallenge(html);

    if (cookie) {
      response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...browserHeaders,
          'Cookie': `__test=${cookie}`,
        },
        body: request.method !== 'GET' ? request.body : undefined,
      });
    }
  }

  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

async function solveInfinityFreeChallenge(html: string): Promise<string | null> {
  const matches = [...html.matchAll(/toNumbers\("([a-f0-9]+)"\)/g)];
  if (matches.length < 3) return null;

  const key = hexToBytes(matches[0][1]); // a = key
  const iv  = hexToBytes(matches[1][1]); // b = iv
  const ct  = hexToBytes(matches[2][1]); // c = ciphertext

  try {
    const cryptoKey = await crypto.subtle.importKey(
      'raw', key, { name: 'AES-CBC' }, false, ['decrypt']
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv }, cryptoKey, ct
    );
    return toHex(new Uint8Array(decrypted));
  } catch {
    return null;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const config = { path: '/api/*' };
