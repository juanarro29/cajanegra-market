export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols requeridos' });

  const API_KEY = 'HYPOBEIBZA46U7RD';
  const symList = symbols.split(',').map(s => s.trim());

  try {
    const results = await Promise.all(symList.map(async (sym) => {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${sym}&apikey=${API_KEY}`;
        const r = await fetch(url);
        const d = await r.json();
        const q = d['Global Quote'];
        if (!q || !q['05. price']) return { sym, name: sym, price: null, chg: null, open: null, high: null, low: null, vol: 0 };
        return {
          sym,
          name: sym,
          price: parseFloat(q['05. price']),
          chg: parseFloat(q['10. change percent']),
          open: parseFloat(q['02. open']),
          high: parseFloat(q['03. high']),
          low: parseFloat(q['04. low']),
          vol: parseInt(q['06. volume']) || 0
        };
      } catch(e) {
        return { sym, name: sym, price: null, chg: null, open: null, high: null, low: null, vol: 0 };
      }
    }));

    res.status(200).json({
      quoteResponse: { result: results.map(r => ({
        symbol: r.sym,
        shortName: r.name,
        regularMarketPrice: r.price,
        regularMarketChangePercent: r.chg,
        regularMarketOpen: r.open,
        regularMarketDayHigh: r.high,
        regularMarketDayLow: r.low,
        regularMarketVolume: r.vol
      })) }
    });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
