import crypto from 'crypto';

const KALSHI_HOST = 'https://api.kalshi.com';
const KALSHI_PREFIX = '/trade-api/rest/v2';
const ODDS_BASE = 'https://api.the-odds-api.com/v4';

function kalshiHeaders(method, apiPath) {
  const keyId = process.env.KALSHI_KEY_ID;
  const raw = process.env.KALSHI_PRIVATE_KEY || '';
  const privateKey = raw.replace(/\\n/g, '\n');
  if (!keyId || !privateKey.includes('BEGIN')) return null;

  const ts = Date.now().toString();
  const msg = ts + method.toUpperCase() + KALSHI_PREFIX + apiPath;
  try {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(msg);
    const sig = sign.sign(privateKey, 'base64');
    return {
      'KALSHI-ACCESS-KEY': keyId,
      'KALSHI-ACCESS-SIGNATURE': sig,
      'KALSHI-ACCESS-TIMESTAMP': ts,
    };
  } catch {
    return null;
  }
}

async function fetchOdds(sport) {
  const key = process.env.ODDS_API_KEY;
  if (!key) return null;
  const url = `${ODDS_BASE}/sports/${sport}/odds/?apiKey=${key}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  return res.ok ? res.json() : null;
}

async function fetchKalshi(apiPath) {
  const headers = kalshiHeaders('GET', apiPath);
  if (!headers) return null;
  const res = await fetch(`${KALSHI_HOST}${KALSHI_PREFIX}${apiPath}`, {
    headers,
    signal: AbortSignal.timeout(6000),
  });
  return res.ok ? res.json() : null;
}

export default async function handler(req) {
  const [mlb, nba, kalshi] = await Promise.all([
    fetchOdds('baseball_mlb').catch(() => null),
    fetchOdds('basketball_nba').catch(() => null),
    fetchKalshi('/markets?limit=25&status=open').catch(() => null),
  ]);

  return Response.json(
    { mlb_odds: mlb, nba_odds: nba, kalshi_markets: kalshi, fetched_at: new Date().toISOString() },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=120' } }
  );
}
