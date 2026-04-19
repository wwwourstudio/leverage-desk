// Static, plausible-looking market data. No specific date; feels live.

const NOW = new Date('2026-04-18T23:14:00Z');

const TICKER = [
  { sport: 'MLB',  label: 'NYY @ BOS',  line: '-138',  move: '+6',  side: 'edge' },
  { sport: 'MLB',  label: 'LAD @ SD',   line: '-168',  move: '-4',  side: 'fade' },
  { sport: 'NBA',  label: 'DEN @ OKC',  line: '+2.5',  move: '+0.5', side: 'edge' },
  { sport: 'NBA',  label: 'BOS @ MIA',  line: '-6.5',  move: '-1.0', side: 'fade' },
  { sport: 'NHL',  label: 'EDM @ VAN',  line: '-120',  move: '-8',  side: 'fade' },
  { sport: 'MLB',  label: 'HOU @ SEA',  line: 'o7.5',  move: '+0.5', side: 'edge' },
  { sport: 'KAL',  label: 'YANKEES ALE', line: '62¢',  move: '+4',  side: 'edge' },
  { sport: 'NBA',  label: 'MIN @ GSW',  line: '+3.0',  move: '+1.5', side: 'edge' },
  { sport: 'MLB',  label: 'ATL @ PHI',  line: '-142',  move: '-11', side: 'fade' },
  { sport: 'UFC',  label: 'Topuria/Makhachev', line: '+118', move: '+22', side: 'edge' },
];

const CHAT_HISTORY = [
  { id: 'c1', title: 'Yankees-Red Sox, exit velo trends', time: '2m',  pinned: true },
  { id: 'c2', title: 'DK MLB main slate — stacks & leverage', time: '18m' },
  { id: 'c3', title: 'Kalshi: Fed cut vs. MLB playoff odds', time: '1h' },
  { id: 'c4', title: 'Sharp money on NBA totals this week', time: '3h' },
  { id: 'c5', title: 'Ohtani props — pitcher matchup dive', time: 'yest' },
  { id: 'c6', title: 'Arbitrage scan · BetMGM vs FanDuel', time: 'yest' },
  { id: 'c7', title: 'NFL draft consensus ADP shifts', time: '2d' },
  { id: 'c8', title: 'Weather model · Wrigley wind shift', time: '3d' },
];

const SAMPLE_QUESTION = "What's the edge on Yankees–Red Sox tonight? Where's the sharp money and should I fade the public?";

// Pre-composed answer the "AI" streams out. Intentional market-desk cadence.
const SAMPLE_ANSWER = [
  { kind: 'kicker', text: 'Dispatch · NYY @ BOS · 19:10 ET' },
  { kind: 'lede',   text: "The book hung NYY -142. It should've been -156. That's your edge." },
  { kind: 'p', text: "Sharp money moved on the Yankees inside the last hour — five of six monitored books shaded 8–12 cents toward New York off a quiet weather shift (wind now out to right, 9–11 mph). Public ticket count still sits 61% Red Sox. That's a textbook reverse-line-move signature." },
  { kind: 'card', card: 'weather' },
  { kind: 'card', card: 'pricing' },
  { kind: 'h',  text: 'Why the model disagrees with the ticket' },
  { kind: 'p', text: "Statcast has Cole at +0.8 run-value per 9 versus the Red Sox top-four hitters in the last 30 days. Houck's xFIP on the road is 4.62, against a Yankees lineup hitting .278 / .357 vs. four-seam fastballs under 96 mph — which is 71% of his arsenal tonight." },
  { kind: 'card', card: 'line' },
  { kind: 'h',  text: "Where the money's hiding" },
  { kind: 'p', text: "Two arbitrage windows are open right now. BetMGM has the Sox at +128 while DraftKings has the Yankees at -132 — a 1.4% risk-free window if you can clear both tickets in the next eleven minutes." },
  { kind: 'card', card: 'arb' },
  { kind: 'h',  text: 'The prop angle' },
  { kind: 'p', text: "Aaron Judge has crushed Houck historically (5-for-11, two barrels). His O 1.5 total bases prop at +142 prices an implied 41%. The VPE 3.0 model calls it at 52%. That's a +11 pts EV line at any number." },
  { kind: 'card', card: 'player' },
  { kind: 'card', card: 'prop' },
  { kind: 'callout', text: "Bottom line: NYY ML at -132 or better, TB prop on Judge, and the arb is live until the books catch up. Don't ride it past 7:02 PM." },
  { kind: 'h',  text: 'Cross-market · Kalshi read' },
  { kind: 'p', text: "Kalshi's AL East contract has Yankees YES at 62¢, up four pennies today — the first time it's cleared 60¢ since opening day. The VPE-to-market spread implies the book is still nine points light of the model. Decent season-long hedge if tonight's ticket hits." },
  { kind: 'card', card: 'kalshi' }
];

const FOLLOWUP_CHIPS = [
  "Show me the Kalshi playoff market",
  "Compare to last time these teams met",
  "What if the wind shifts again?",
  "Build a parlay around this",
];

// Card data
const PRICING_CARD = {
  title: 'Moneyline · Six-book consensus',
  updated: '00:47s ago',
  rows: [
    { book: 'DraftKings', home: '+126', away: '-132', move: '↓ 8', sharp: true },
    { book: 'FanDuel',    home: '+124', away: '-130', move: '↓ 6', sharp: true },
    { book: 'BetMGM',     home: '+128', away: '-134', move: '↓ 11', sharp: false },
    { book: 'Caesars',    home: '+122', away: '-128', move: '↓ 4', sharp: false },
    { book: 'Pinnacle',   home: '+118', away: '-125', move: '↓ 7', sharp: true },
    { book: 'Circa',      home: '+120', away: '-127', move: '↓ 5', sharp: true },
  ],
  consensus: { no_vig_home: 43.1, no_vig_away: 56.9, model: 61.2 }
};

const LINE_CARD = {
  title: 'Line movement · last 6 hours',
  open: -138,
  current: -132,
  close: null,
  data: [
    { t: '13:00', v: -138 },
    { t: '14:00', v: -140 },
    { t: '15:00', v: -141 },
    { t: '16:00', v: -139 },
    { t: '17:00', v: -136 },
    { t: '18:00', v: -134 },
    { t: '18:30', v: -133 },
    { t: '19:00', v: -132 },
  ],
  steam: [
    { t: '16:22', note: 'Pinnacle dropped first -141 → -138' },
    { t: '18:04', note: 'Four-book steam move +3c within 90s' },
    { t: '19:00', note: 'Weather model update · wind 9→11 mph out' },
  ]
};

const ARB_CARD = {
  title: 'Arbitrage window · open',
  legs: [
    { book: 'BetMGM',     side: 'BOS +128', stake: 438.60, pays: 1000.00 },
    { book: 'DraftKings', side: 'NYY -132', stake: 561.40, pays: 986.03 },
  ],
  profit: 14.63,
  margin: 1.46,
  expires_in: '11:24'
};

const PROP_CARD = {
  title: 'Prop · Aaron Judge · O 1.5 total bases',
  line: '+142',
  implied: 41,
  model:   52,
  ev_pts:  11,
  bars: [
    { book: 'DraftKings', price: '+138' },
    { book: 'FanDuel',    price: '+140' },
    { book: 'BetMGM',     price: '+142' },
    { book: 'Caesars',    price: '+135' },
  ],
  history: '5 / 11 career vs. Houck · 2 barrels · 108 avg EV'
};

const PLAYER_CARD = {
  name: 'Aaron Judge',
  team: 'NYY · RF · #99',
  handed: 'R/R · 6\'7" · 282 lb',
  season: [
    { k: 'AVG',   v: '.291' },
    { k: 'OPS',   v: '1.012' },
    { k: 'HR',    v: '11' },
    { k: 'wRC+',  v: '184' },
    { k: 'xwOBA', v: '.438' },
    { k: 'Barrel%', v: '22.4' },
  ],
  last5: [
    { d: 'Apr 17', opp: '@ TOR', line: '2-4, HR, 2B' },
    { d: 'Apr 16', opp: '@ TOR', line: '1-3, 2 BB' },
    { d: 'Apr 15', opp: 'CLE',   line: '3-4, HR, 3 RBI' },
    { d: 'Apr 14', opp: 'CLE',   line: '0-4, K' },
    { d: 'Apr 13', opp: 'CLE',   line: '2-3, BB' },
  ],
  vs_pitcher: {
    who: 'vs. Tanner Houck (career)',
    rows: [
      { k: 'PA',       v: '13' },
      { k: 'AVG',      v: '.455' },
      { k: 'SLG',      v: '.909' },
      { k: 'Barrels',  v: '2' },
      { k: 'Avg EV',   v: '108.2 mph' },
      { k: 'Whiff%',   v: '14.3' },
    ]
  },
  tonight_props: [
    { market: 'HR',           line: '+380',  implied: 21, model: 28, edge: '+7' },
    { market: 'Total bases',  line: 'o1.5 +142', implied: 41, model: 52, edge: '+11' },
    { market: 'Hits',         line: 'o0.5 -185', implied: 65, model: 68, edge: '+3' },
    { market: 'RBI',          line: 'o0.5 +105', implied: 49, model: 55, edge: '+6' },
  ]
};

const KALSHI_CARD = {
  title: 'Kalshi · Yankees win AL East',
  ticker: 'MLB-YANKEES-ALE-26',
  yes: 62, no: 38,
  yes_change: +4, no_change: -4,
  volume_24h: '$148,220',
  open_interest: '$612,405',
  implied_model: 71,
  orderbook: {
    yes_bids: [
      { price: 61, size: 2400 },
      { price: 60, size: 5800 },
      { price: 59, size: 12100 },
      { price: 58, size: 22600 },
    ],
    no_bids: [
      { price: 38, size: 1850 },
      { price: 37, size: 4920 },
      { price: 36, size: 9340 },
      { price: 35, size: 18200 },
    ]
  },
  history: [
    { t: '00', v: 54 },{ t: '04', v: 56 },{ t: '08', v: 55 },
    { t: '12', v: 58 },{ t: '14', v: 59 },{ t: '16', v: 60 },
    { t: '18', v: 62 },{ t: '19', v: 62 },
  ],
  related: [
    { title: 'Yankees win World Series', yes: 14, chg: +1 },
    { title: 'Red Sox make playoffs',    yes: 47, chg: -3 },
    { title: 'AL East decided before Sep 15', yes: 22, chg: 0 },
  ]
};

const WEATHER_CARD = {
  venue: 'Fenway Park · Boston',
  start: '19:10 ET',
  temp: 58,
  feels: 54,
  conditions: 'Partly cloudy',
  wind: { speed: 11, dir: 'Out to RF', bearing: 65 },
  humidity: 72,
  pressure: 29.94,
  park_factor: { overall: 104, lh: 96, rh: 108 },
  hourly: [
    { t: '19:00', temp: 58, wind: 11, dir: 'out to RF' },
    { t: '20:00', temp: 57, wind: 12, dir: 'out to RF' },
    { t: '21:00', temp: 55, wind: 13, dir: 'out to RF' },
    { t: '22:00', temp: 54, wind: 14, dir: 'out to RF' },
  ],
  impact: {
    runs: '+0.28',
    hr_multiplier: 1.12,
    note: 'Wind shifted 18:00 from in-from-CF to out-to-RF · HR environment favorable for RH pull-power'
  }
};

const CARDS = { pricing: PRICING_CARD, line: LINE_CARD, arb: ARB_CARD, prop: PROP_CARD, player: PLAYER_CARD, weather: WEATHER_CARD, kalshi: KALSHI_CARD };

// live-ish "pulse" tiles shown on the welcome
const PULSE = [
  { tag: 'STEAM',  title: 'HOU @ SEA · o7.5', meta: '4 books moved +0.5 in 3 min', kind: 'edge' },
  { tag: 'FADE',   title: 'Public 71% on BOS', meta: 'Sharps on NYY, handle split inverts', kind: 'fade' },
  { tag: 'ARB',    title: 'BetMGM / DK · 1.46%', meta: 'Window expires ~11 min', kind: 'edge' },
  { tag: 'PROP',   title: 'Judge O 1.5 TB · +11', meta: 'Model 52% vs implied 41%', kind: 'edge' },
  { tag: 'KALSHI', title: 'YANKEES DIV TITLE',  meta: 'YES 62¢ · +4 today', kind: 'info' },
  { tag: 'WEATHER',title: 'Fenway · wind 11 mph', meta: 'Out to right, flipped at 18:00', kind: 'info' },
];

const QUICK_PROMPTS = [
  "Edge scan — all sports, right now",
  "Tonight's sharp-money signals",
  "Where's the arbitrage?",
  "Kalshi markets worth reading",
  "Ohtani props, this week",
  "DK main slate · leverage stacks",
];

export const LVG_DATA = {
  TICKER, CHAT_HISTORY, SAMPLE_QUESTION, SAMPLE_ANSWER, FOLLOWUP_CHIPS,
  CARDS, PULSE, QUICK_PROMPTS, NOW
};
