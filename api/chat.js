export const config = { runtime: 'edge' };

const SYSTEM = `You are Leverage, an expert AI analyst for a sports betting and financial market intelligence desk. You specialize in MLB/NBA/NHL/UFC betting lines, sharp money signals, arbitrage windows, player props, Statcast data, and Kalshi prediction markets. Write with concise, authoritative market-desk cadence. Surface the edge, explain the why, give a bottom-line recommendation.`;

function formatLiveData(data) {
  if (!data) return '';
  const lines = ['\n\nLIVE MARKET DATA (fetched this session):'];

  if (Array.isArray(data.mlb_odds) && data.mlb_odds.length) {
    lines.push('\nMLB:');
    data.mlb_odds.slice(0, 8).forEach(g => {
      const bk = g.bookmakers?.[0];
      const h2h = bk?.markets?.find(m => m.key === 'h2h');
      const tot = bk?.markets?.find(m => m.key === 'totals');
      if (!h2h) return;
      const odds = h2h.outcomes.map(o => `${o.name.split(' ').pop()} ${o.price > 0 ? '+' : ''}${o.price}`).join(' / ');
      const ou = tot?.outcomes?.[0] ? ` | O/U ${tot.outcomes[0].point}` : '';
      lines.push(`  ${g.away_team} @ ${g.home_team}: ${odds}${ou}`);
    });
  }

  if (Array.isArray(data.nba_odds) && data.nba_odds.length) {
    lines.push('\nNBA:');
    data.nba_odds.slice(0, 6).forEach(g => {
      const bk = g.bookmakers?.[0];
      const h2h = bk?.markets?.find(m => m.key === 'h2h');
      const sp = bk?.markets?.find(m => m.key === 'spreads');
      if (!h2h) return;
      const odds = h2h.outcomes.map(o => `${o.name.split(' ').pop()} ${o.price > 0 ? '+' : ''}${o.price}`).join(' / ');
      const spread = sp?.outcomes?.[0] ? ` | ${sp.outcomes[0].name.split(' ').pop()} ${sp.outcomes[0].point > 0 ? '+' : ''}${sp.outcomes[0].point}` : '';
      lines.push(`  ${g.away_team} @ ${g.home_team}: ${odds}${spread}`);
    });
  }

  if (data.kalshi_markets?.markets?.length) {
    lines.push('\nKALSHI:');
    data.kalshi_markets.markets.slice(0, 10).forEach(m => {
      const yes = m.yes_bid ?? m.yes_ask ?? '?';
      lines.push(`  ${m.ticker}: YES ${yes}¢ — ${m.title || m.ticker}`);
    });
  }

  return lines.join('\n');
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { messages, liveData } = await req.json();
  const systemContent = SYSTEM + formatLiveData(liveData);

  const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      stream: true,
      messages: [{ role: 'system', content: systemContent }, ...messages],
    }),
  });

  if (!xaiRes.ok) {
    const errText = await xaiRes.text();
    console.error('xAI error', xaiRes.status, errText);
    return new Response(errText, { status: xaiRes.status });
  }

  return new Response(xaiRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
