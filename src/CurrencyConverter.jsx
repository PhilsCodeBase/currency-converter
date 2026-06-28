import { useState, useEffect, useCallback } from "react";

const CURRENCIES = [
  { code: "USD", name: "US-Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "Brit. Pfund", flag: "🇬🇧" },
  { code: "CHF", name: "Schweizer Franken", flag: "🇨🇭" },
  { code: "JPY", name: "Japanischer Yen", flag: "🇯🇵" },
  { code: "CAD", name: "Kanadischer Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australischer Dollar", flag: "🇦🇺" },
  { code: "CNY", name: "Chinesischer Yuan", flag: "🇨🇳" },
  { code: "INR", name: "Indische Rupie", flag: "🇮🇳" },
  { code: "MXN", name: "Mexikanischer Peso", flag: "🇲🇽" },
  { code: "BRL", name: "Brasilianischer Real", flag: "🇧🇷" },
  { code: "KRW", name: "Südkoreanischer Won", flag: "🇰🇷" },
  { code: "SEK", name: "Schwedische Krone", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegische Krone", flag: "🇳🇴" },
  { code: "DKK", name: "Dänische Krone", flag: "🇩🇰" },
  { code: "TRY", name: "Türkische Lira", flag: "🇹🇷" },
  { code: "SGD", name: "Singapur-Dollar", flag: "🇸🇬" },
  { code: "HKD", name: "Hongkong-Dollar", flag: "🇭🇰" },
  { code: "NZD", name: "Neuseeland-Dollar", flag: "🇳🇿" },
  { code: "PLN", name: "Polnischer Złoty", flag: "🇵🇱" },
];

// Fallback: ECB rates relative to EUR, stand 27. Juni 2026
const FALLBACK_RATES = {
  EUR: 1,
  USD: 1.1372,
  GBP: 0.8648,
  CHF: 0.9344,
  JPY: 162.81,
  CAD: 1.5631,
  AUD: 1.7408,
  CNY: 8.2345,
  INR: 96.42,
  MXN: 22.15,
  BRL: 6.412,
  KRW: 1554.2,
  SEK: 10.892,
  NOK: 11.734,
  DKK: 7.4612,
  TRY: 43.87,
  SGD: 1.4821,
  HKD: 8.863,
  NZD: 1.8934,
  PLN: 4.2531,
};
const FALLBACK_DATE = "2026-06-27";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [rateDate, setRateDate] = useState(FALLBACK_DATE);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swapping, setSwapping] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://api.frankfurter.dev/v1/latest?from=EUR", { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRates({ EUR: 1, ...data.rates });
      setRateDate(data.date);
      setIsLive(true);
    } catch (err) {
      // Silently use fallback — already pre-loaded
      setIsLive(false);
      setError("Live-Kurse nicht verfügbar – Schätzwerte vom " + new Date(FALLBACK_DATE).toLocaleDateString("de-DE"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const convert = (val, from, to) => {
    if (!rates || !val || isNaN(parseFloat(val))) return null;
    const inEUR = parseFloat(val) / rates[from];
    return inEUR * rates[to];
  };

  const formatNum = (val, currency) => {
    if (val === null || val === undefined || isNaN(val)) return "—";
    if (["JPY", "KRW"].includes(currency)) {
      return val.toLocaleString("de-DE", { maximumFractionDigits: 0 });
    }
    return val.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const result = convert(amount, fromCurrency, toCurrency);
  const rate1 = convert(1, fromCurrency, toCurrency);
  const fromInfo = CURRENCIES.find((c) => c.code === fromCurrency);
  const toInfo = CURRENCIES.find((c) => c.code === toCurrency);

  const formattedDate = rateDate
    ? new Date(rateDate + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const handleSwap = () => {
    setSwapping(true);
    setTimeout(() => { setFromCurrency(toCurrency); setToCurrency(fromCurrency); setSwapping(false); }, 150);
  };

  return (
    <div style={S.root}>
      <div style={S.container}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.ticker}>FX · EZB</div>
          <h1 style={S.title}>Währungsrechner</h1>
          <div style={S.dateLine}>
            {loading ? (
              <span style={S.dateLoading}>⟳ Lade Live-Kurse…</span>
            ) : (
              <>
                <span style={{ ...S.dateDot, background: isLive ? "#4caf7d" : "#e0a030" }} />
                <span style={S.dateText}>
                  {isLive ? "Live · " : "Schätzwerte · "}
                  Kurse vom {formattedDate} · EZB
                </span>
              </>
            )}
          </div>
          {error && <div style={S.warningBanner}>{error}</div>}
        </div>

        {/* Main card */}
        <div style={S.card}>
          {/* Amount */}
          <div style={S.inputGroup}>
            <label style={S.label}>Betrag</label>
            <div style={S.inputRow}>
              <span style={S.flagBadge}>{fromInfo?.flag}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={S.input}
                placeholder="0"
                min="0"
              />
              <span style={S.codeTag}>{fromCurrency}</span>
            </div>
          </div>

          {/* Selectors */}
          <div style={S.selectRow}>
            <div style={S.selectGroup}>
              <label style={S.label}>Von</label>
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} style={S.select}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>)}
              </select>
            </div>
            <button onClick={handleSwap} style={{ ...S.swapBtn, transform: swapping ? "rotate(180deg)" : "rotate(0deg)" }}>⇄</button>
            <div style={S.selectGroup}>
              <label style={S.label}>Nach</label>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} style={S.select}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Result box */}
          <div style={S.resultBox}>
            <div style={S.resultTop}>
              <span style={S.resultFlag}>{toInfo?.flag}</span>
              <span style={S.resultNum}>{formatNum(result, toCurrency)}</span>
              <span style={S.resultCode}>{toCurrency}</span>
            </div>
            <div style={S.rateRow}>
              <span style={S.rateText}>1 {fromCurrency} = {formatNum(rate1, toCurrency)} {toCurrency}</span>
              <span style={S.rateText}>·</span>
              <span style={S.rateText}>1 {toCurrency} = {formatNum(convert(1, toCurrency, fromCurrency), fromCurrency)} {fromCurrency}</span>
            </div>
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <span style={S.footerNote}>Quelle: frankfurter.app</span>
            <button onClick={fetchRates} style={S.refreshBtn} disabled={loading}>
              {loading ? "⟳ Lädt…" : "↻ Aktualisieren"}
            </button>
          </div>
        </div>

        {/* Quick grid */}
        <div style={S.gridCard}>
          <h2 style={S.gridTitle}>1 {fromCurrency} im Vergleich</h2>
          <div style={S.grid}>
            {CURRENCIES.filter((c) => c.code !== fromCurrency).slice(0, 10).map((c) => {
              const val = convert(1, fromCurrency, c.code);
              return (
                <div
                  key={c.code}
                  style={{ ...S.gridItem, ...(c.code === toCurrency ? S.gridActive : {}) }}
                  onClick={() => setToCurrency(c.code)}
                >
                  <span style={S.gridFlag}>{c.flag}</span>
                  <span style={S.gridCode}>{c.code}</span>
                  <span style={S.gridVal}>{formatNum(val, c.code)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p style={S.disclaimer}>Europäische Zentralbank · Kein Finanzberatungsersatz</p>
      </div>
    </div>
  );
}

const S = {
  root: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0f14 0%, #1a1a24 50%, #0f1420 100%)", display: "flex", justifyContent: "center", padding: "24px 16px 48px", fontFamily: "'Inter','Segoe UI',sans-serif" },
  container: { width: "100%", maxWidth: "520px" },
  header: { textAlign: "center", marginBottom: "24px", paddingTop: "8px" },
  ticker: { display: "inline-block", background: "linear-gradient(90deg,#c9a227,#e8c84a)", color: "#0f0f14", fontFamily: "monospace", fontWeight: 900, fontSize: "11px", letterSpacing: "3px", padding: "4px 12px", borderRadius: "3px", marginBottom: "10px" },
  title: { color: "#f0ede6", fontSize: "26px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.5px" },
  dateLine: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "4px" },
  dateDot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  dateText: { color: "#6b6880", fontSize: "12px" },
  dateLoading: { color: "#6b6880", fontSize: "12px", fontStyle: "italic" },
  warningBanner: { marginTop: "8px", background: "#2a1f0a", border: "1px solid #5a4010", borderRadius: "8px", color: "#c9a227", fontSize: "11px", padding: "6px 12px", display: "inline-block" },
  card: { background: "#16161f", border: "1px solid #2a2a38", borderRadius: "16px", padding: "24px", marginBottom: "14px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" },
  inputGroup: { marginBottom: "18px" },
  label: { display: "block", color: "#6b6880", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "7px" },
  inputRow: { display: "flex", alignItems: "center", background: "#1e1e2a", border: "1px solid #2f2f42", borderRadius: "10px", padding: "4px 14px 4px 4px", gap: "10px" },
  flagBadge: { fontSize: "22px", padding: "8px", background: "#252535", borderRadius: "8px", lineHeight: 1 },
  input: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#f0ede6", fontSize: "26px", fontFamily: "monospace", fontWeight: 700 },
  codeTag: { color: "#6b6880", fontSize: "12px", fontFamily: "monospace", fontWeight: 700 },
  selectRow: { display: "flex", alignItems: "flex-end", gap: "10px", marginBottom: "20px" },
  selectGroup: { flex: 1 },
  select: { width: "100%", background: "#1e1e2a", border: "1px solid #2f2f42", borderRadius: "10px", color: "#d4d0c8", padding: "10px 12px", fontSize: "12px", appearance: "none", cursor: "pointer", outline: "none" },
  swapBtn: { background: "linear-gradient(135deg,#c9a227,#e8c84a)", border: "none", borderRadius: "10px", width: "40px", height: "40px", fontSize: "18px", cursor: "pointer", color: "#0f0f14", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform 0.2s ease", boxShadow: "0 4px 14px rgba(201,162,39,0.3)" },
  resultBox: { background: "linear-gradient(135deg,#1a1a2e,#1e1e2f)", border: "1px solid #c9a227", borderRadius: "12px", padding: "18px 22px", marginBottom: "18px" },
  resultTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  resultFlag: { fontSize: "26px", lineHeight: 1 },
  resultNum: { color: "#e8c84a", fontSize: "32px", fontFamily: "monospace", fontWeight: 700, flex: 1 },
  resultCode: { color: "#6b6880", fontSize: "13px", fontFamily: "monospace", fontWeight: 700 },
  rateRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  rateText: { color: "#4a4860", fontSize: "11px", fontFamily: "monospace" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerNote: { color: "#3a3850", fontSize: "11px" },
  refreshBtn: { background: "transparent", border: "1px solid #2f2f42", borderRadius: "7px", color: "#6b6880", padding: "5px 12px", fontSize: "11px", cursor: "pointer" },
  gridCard: { background: "#16161f", border: "1px solid #2a2a38", borderRadius: "16px", padding: "20px", marginBottom: "14px" },
  gridTitle: { color: "#6b6880", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 14px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" },
  gridItem: { background: "#1e1e2a", border: "1px solid #2a2a38", borderRadius: "9px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "7px", cursor: "pointer", transition: "border-color 0.15s" },
  gridActive: { borderColor: "#c9a227", background: "#1e1e2e" },
  gridFlag: { fontSize: "16px", lineHeight: 1, flexShrink: 0 },
  gridCode: { color: "#8a8698", fontSize: "10px", fontWeight: 700, fontFamily: "monospace", flex: 1 },
  gridVal: { color: "#c8c4bc", fontSize: "12px", fontFamily: "monospace", fontWeight: 600 },
  disclaimer: { textAlign: "center", color: "#2e2c3a", fontSize: "10px", margin: 0 },
};
