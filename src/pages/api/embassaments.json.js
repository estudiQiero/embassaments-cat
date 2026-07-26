import { fetchLiveData, calculaResum } from '../../lib/embassaments.js';

export const prerender = false;

export async function GET() {
  try {
    const embassaments = await fetchLiveData(fetch);
    const resum = calculaResum(embassaments);
    return new Response(JSON.stringify({ resum, embassaments }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=0, s-maxage=1800',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
