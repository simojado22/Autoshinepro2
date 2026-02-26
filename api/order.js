export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const APPS_SCRIPT_EXEC_URL = "https://script.google.com/macros/s/AKfycbwstoBuDLY6YxaipxBU89HEUP_ds3G82_60b-yDYU5nNcBqryUvOJZULDTaf-4y4lY0/exec";
    
    const data = req.body || {};

    const required = ["fullName", "phone", "city", "product", "quantity", "price", "total", "orderId"];
    const missing = required.filter((k) => data[k] === undefined || data[k] === null || String(data[k]).trim() === "");
    
    if (missing.length) {
      return res.status(400).json({ ok: false, error: "Missing fields", missing, received: data });
    }

    const url = new URL(APPS_SCRIPT_EXEC_URL);
    url.searchParams.set("payload", JSON.stringify(data));

    const response = await fetch(url.toString(), { method: "GET" });
    const text = await response.text();

    let out;
    try {
      out = JSON.parse(text);
    } catch {
      out = { ok: false, error: "Invalid JSON from Apps Script", raw: text };
    }

    res.status(200).json(out);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
