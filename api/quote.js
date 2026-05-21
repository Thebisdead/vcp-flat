// Yahoo Finance 现在需要 crumb 认证，这里自动获取 cookie → crumb → 数据
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  try {
    // ── Step 1: 获取 Yahoo Finance 首页 cookie ──────────────────────────────
    const homeRes = await fetch("https://finance.yahoo.com/", {
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    // 提取所有 Set-Cookie 值并合并成一条
    const rawCookies = homeRes.headers.getSetCookie?.() || [];
    const cookieStr = rawCookies.map(c => c.split(";")[0]).join("; ");

    // ── Step 2: 用 cookie 换取 crumb ────────────────────────────────────────
    const crumbRes = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: {
        "User-Agent": UA,
        "Cookie": cookieStr,
        "Referer": "https://finance.yahoo.com/",
      },
    });

    if (!crumbRes.ok) {
      return res.status(502).json({ error: `getcrumb failed: ${crumbRes.status}` });
    }
    const crumb = await crumbRes.text();
    if (!crumb || crumb.length < 3) {
      return res.status(502).json({ error: "crumb empty", raw: crumb });
    }

    // ── Step 3: 用 cookie + crumb 请求股票数据 ──────────────────────────────
    const fields = [
      "symbol","shortName",
      "regularMarketPrice","regularMarketChangePercent",
      "regularMarketVolume","averageVolume",
      "fiftyTwoWeekHigh","fiftyTwoWeekLow",
      "fiftyDayAverage","twoHundredDayAverage"
    ].join(",");

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&crumb=${encodeURIComponent(crumb)}&fields=${fields}&formatted=false&lang=en-US&region=US`;

    const quoteRes = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Cookie": cookieStr,
        "Referer": "https://finance.yahoo.com/",
        "Accept": "application/json",
      },
    });

    if (!quoteRes.ok) {
      const txt = await quoteRes.text();
      return res.status(quoteRes.status).json({ error: `quote failed: ${quoteRes.status}`, detail: txt.slice(0, 300) });
    }

    const data = await quoteRes.json();
    res.json(data);

  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack?.slice(0, 400) });
  }
};
