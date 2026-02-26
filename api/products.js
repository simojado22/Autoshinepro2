export default async function handler(req, res) {
  try {
    const SPREADSHEET_ID = "1clKeyUKNXfmEO3ZW5Jr9Ld1lGfTfYS0ug_TlbmV44Tk";
    const SHEET_NAME = "Produits";

    const gvizUrl =
      `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?` +
      `tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

    const response = await fetch(gvizUrl);
    const text = await response.text();

    const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const gviz = JSON.parse(jsonStr);

    const cols = gviz.table.cols.map(c => (c.label || "").trim());
    const rows = gviz.table.rows.map(r => r.c.map(cell => (cell ? cell.v : "")));

    const products = rows
      .filter(r => r.some(v => v !== "" && v !== null && v !== undefined))
      .map(r => {
        const obj = {};
        cols.forEach((k, i) => (obj[k] = r[i]));
        return obj;
      });

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
