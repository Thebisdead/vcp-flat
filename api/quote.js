module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  // Yahoo Finance v7 — with proper browser-like headers
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=symbol,shortName,regularMarketPrice,regularMarketChangePercent,regularMarketVolume,averageVolume,fiftyTwoWeekHigh,fiftyTwoWeekLow,fiftyDayAverage,twoHundredDayAverage&formatted=false&lang=en-US&region=US&corsDomain=finance.yahoo.com`;

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Origin": "https://finance.yahoo.com",
        "Referer": "https://finance.yahoo.com/",
        "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
      },
    });

    if (!r.ok) {
      // fallback: try v8 endpoint
      const r2 = await fetch(
        `https://query2.finance.yahoo.com/v8/finance/chart/${symbols.split(',')[0]}?interval=1d&range=1d`,
        { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://finance.yahoo.com/" } }
      );
      const fallbackText = await r2.text();
      return res.status(r.status).json({ error: `Yahoo returned ${r.status}`, fallback: fallbackText.slice(0, 300) });
    }

    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
