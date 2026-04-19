export const config = { runtime: 'edge' };

const SYSTEM = `You are Leverage, an expert AI analyst for a sports betting and financial market intelligence desk. You specialize in MLB/NBA/NHL/UFC betting lines, sharp money signals, arbitrage windows, player props, Statcast data, and Kalshi prediction markets. Write with concise, authoritative market-desk cadence. Surface the edge, explain the why, give a bottom-line recommendation.`;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { messages } = await req.json();

  const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      stream: true,
      messages: [{ role: 'system', content: SYSTEM }, ...messages],
    }),
  });

  if (!xaiRes.ok) return new Response(await xaiRes.text(), { status: xaiRes.status });

  return new Response(xaiRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
