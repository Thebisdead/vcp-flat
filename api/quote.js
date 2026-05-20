// Vercel Serverless Function — 代理 Yahoo Finance，绕过 CORS 限制
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: 'symbols 参数必填' });

  const fields = [
    'shortName',
    'regularMarketPrice',
    'fiftyTwoWeekHigh',
    'fiftyTwoWeekLow',
    'fiftyDayAverage',
    'twoHundredDayAverage',
    'regularMarketVolume',
    'averageVolume',
    'regularMarketChangePercent'
  ].join(',');

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${fields}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    // 缓存 30 秒，减少重复请求
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
