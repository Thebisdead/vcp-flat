const yahooFinance = require("yahoo-finance2").default;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const list = symbols.split(",").map(s => s.trim()).filter(Boolean);

  try {
    const results = await Promise.allSettled(
      list.map(sym =>
        yahooFinance.quote(sym, {
          fields: [
            "symbol", "shortName",
            "regularMarketPrice", "regularMarketChangePercent",
            "regularMarketVolume", "averageVolume",
            "fiftyTwoWeekHigh", "fiftyTwoWeekLow",
            "fiftyDayAverage", "twoHundredDayAverage"
          ]
        }).catch(() => null)
      )
    );

    const quotes = results
      .map(r => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean);

    res.json({ quoteResponse: { result: quotes } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
