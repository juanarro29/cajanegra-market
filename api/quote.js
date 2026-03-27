export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols requeridos' });

  const API_KEY = 'd7393g9r01qjjol26c20';
  const symList = symbols.split(',').map(s => s.trim());

  try {
    const results = await Promise.all(symList.map(async (sym) => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${API_KEY}`;
        const r = await fetch(url);
        const q = await r.json();
        if (!q || q.c === 0) return { sym, name: sym, price: null, chg: null, open: null, high: null, low: null, vol: 0 };
        const chgPct = q.pc ? ((q.c - q.pc) / q.pc) * 100 : null;
        return {
          sym,
          name: sym,
          price: q.c,
          chg: chgPct,
          open: q.o,
          high: q.h,
          low: q.l,
          vol: 0
        };
      } catch(e) {
        return { sym, name: sym, price: null, chg: null, open: null, high: null, low: null, vol: 0 };
      }
    }));

    res.status(200).json({
      quoteResponse: {
        result: results.map(r => ({
          symbol: r.sym,
          shortName: r.name,
          regularMarketPrice: r.price,
          regularMarketChangePercent: r.chg,
          regularMarketOpen: r.open,
          regularMarketDayHigh: r.high,
          regularMarketDayLow: r.low,
          regularMarketVolume: r.vol
        }))
      }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
