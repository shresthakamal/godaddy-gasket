import https from 'node:https';
import gasket from '@/gasket';

export async function fetchFromApi<T>(path: string): Promise<T> {
  const { apiServiceUrl } = await gasket.actions.getGasketData();

  if (!apiServiceUrl) {
    throw new Error('apiServiceUrl is not configured in gasket-data.ts');
  }

  const url = `${apiServiceUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const isLocalDev = process.env.NODE_ENV === 'development';

  const response = isLocalDev
    ? await fetchWithDevTls(url)
    : await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function fetchWithDevTls(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        resolve(new Response(body, {
          status: res.statusCode ?? 500,
          headers: res.headers as HeadersInit
        }));
      });
    }).on('error', reject);
  });
}
