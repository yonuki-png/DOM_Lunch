import { useState } from "react";

const MENU = [
  { id: 1, category: "パスタ", name: "ドミンゴスパ", price: 800 },
  { id: 2, category: "パスタ", name: "ナポリタン", price: 750 },
  { id: 3, category: "パスタ", name: "明太子スパ", price: 780 },
  { id: 4, category: "パスタ", name: "ボンゴレパスタ", price: 780 },
  { id: 5, category: "パスタ", name: "カレースパ", price: 800 },
  { id: 6, category: "ご飯", name: "カレー", price: 800 },
  { id: 7, category: "ご飯", name: "ハヤシライス", price: 800 },
  { id: 8, category: "ご飯", name: "ピラフ", price: 750 },
  { id: 9, category: "ご飯", name: "ドライカレー", price: 780 },
  { id: 10, category: "ご飯", name: "ジンジャーライス", price: 900 },
  { id: 11, category: "ご飯", name: "煮込みハンバーグライス", price: 900 },
  { id: 12, category: "オプション", name: "中盛", price: 100 },
  { id: 13, category: "オプション", name: "大盛", price: 150 },
  { id: 14, category: "オプション", name: "サラダ", price: 100 },
  { id: 15, category: "オプション", name: "セットコーヒー", price: 200 },
];

const CATEGORIES = ["パスタ", "ご飯", "オプション"];

const BILLS = [10000, 5000, 1000, 500, 100, 50, 10];

function calcChange(total, paid) {
  let remaining = paid - total;
  const result = [];
  for (const bill of BILLS) {
    if (remaining <= 0) break;
    const count = Math.floor(remaining / bill);
    if (count > 0) {
      result.push({ bill, count });
      remaining -= bill * count;
    }
  }
  return result;
}

function suggestPayments(total) {
  const suggestions = [];
  // Exact if possible
  if (total % 10 === 0) suggestions.push(total);
  // Round up to next 500
  const to500 = Math.ceil(total / 500) * 500;
  if (!suggestions.includes(to500)) suggestions.push(to500);
  // Round up to next 1000
  const to1000 = Math.ceil(total / 1000) * 1000;
  if (!suggestions.includes(to1000)) suggestions.push(to1000);
  // Common extra
  if (to1000 + 1000 <= 20000 && !suggestions.includes(to1000 + 1000))
    suggestions.push(to1000 + 1000);
  return suggestions.slice(0, 4);
}

export default function App() {
  const [order, setOrder] = useState({}); // {id: qty}
  const [activeCategory, setActiveCategory] = useState("コーヒー");
  const [view, setView] = useState("menu"); // menu | bill
  const [customInput, setCustomInput] = useState("");

  const addItem = (id) => setOrder((o) => ({ ...o, [id]: (o[id] || 0) + 1 }));
  const removeItem = (id) =>
    setOrder((o) => {
      const next = { ...o };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id]--;
      return next;
    });
  const clearOrder = () => setOrder({});

  const orderedItems = MENU.filter((m) => order[m.id]);
  const total = orderedItems.reduce((s, m) => s + m.price * order[m.id], 0);
  const totalCount = Object.values(order).reduce((a, b) => a + b, 0);

  const suggestions = total > 0 ? suggestPayments(total) : [];
  const customPaid = parseInt(customInput.replace(/,/g, ""), 10);
  const customChange =
    !isNaN(customPaid) && customPaid >= total
      ? calcChange(total, customPaid)
      : null;

  const filtered = MENU.filter((m) => m.category === activeCategory);

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>☕DOM</div>
          {view === "menu" && totalCount > 0 && (
            <button style={styles.billBtn} onClick={() => setView("bill")}>
              会計を見る ({totalCount}品)
            </button>
          )}
          {view === "bill" && (
            <button style={styles.backBtn} onClick={() => setView("menu")}>
              ← メニューに戻る
            </button>
          )}
        </div>
      </div>

      {view === "menu" && (
        <div style={styles.body}>
          {/* Category tabs */}
          <div style={styles.tabs}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                style={{
                  ...styles.tab,
                  ...(activeCategory === cat ? styles.tabActive : {}),
                }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div style={styles.menuGrid}>
            {filtered.map((item) => {
              const qty = order[item.id] || 0;
              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.menuCard,
                    ...(qty > 0 ? styles.menuCardActive : {}),
                  }}
                >
                  <div style={styles.menuName}>{item.name}</div>
                  <div style={styles.menuPrice}>
                    ¥{item.price.toLocaleString()}
                  </div>
                  <div style={styles.qtyRow}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => removeItem(item.id)}
                      disabled={qty === 0}
                    >
                      −
                    </button>
                    <span style={styles.qty}>{qty}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => addItem(item.id)}
                    >
                      ＋
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom bar */}
          {totalCount > 0 && (
            <div style={styles.bottomBar}>
              <div style={styles.bottomTotal}>
                合計{" "}
                <span style={styles.bottomTotalNum}>
                  ¥{total.toLocaleString()}
                </span>
              </div>
              <button style={styles.billBtn2} onClick={() => setView("bill")}>
                会計へ →
              </button>
            </div>
          )}
        </div>
      )}

      {view === "bill" && (
        <div style={styles.body}>
          <div style={styles.receipt}>
            <div style={styles.receiptTitle}>── ご注文内容 ──</div>
            {orderedItems.length === 0 && (
              <div style={styles.emptyMsg}>注文がありません</div>
            )}
            {orderedItems.map((item) => (
              <div key={item.id} style={styles.receiptRow}>
                <span style={styles.receiptName}>
                  {item.name} × {order[item.id]}
                </span>
                <span style={styles.receiptPrice}>
                  ¥{(item.price * order[item.id]).toLocaleString()}
                </span>
              </div>
            ))}
            <div style={styles.receiptDivider} />
            <div style={styles.receiptTotal}>
              <span>合 計</span>
              <span style={styles.receiptTotalNum}>
                ¥{total.toLocaleString()}
              </span>
            </div>
          </div>

          {total > 0 && (
            <>
              <div style={styles.sectionLabel}>💡 お釣りが少ない支払い方法</div>
              <div style={styles.suggestGrid}>
                {suggestions.map((paid) => {
                  const change = paid - total;
                  const breakdown = calcChange(total, paid);
                  return (
                    <div key={paid} style={styles.suggestCard}>
                      <div style={styles.suggestPaid}>
                        ¥{paid.toLocaleString()} を渡す
                      </div>
                      <div style={styles.suggestChange}>
                        お釣り：<b>¥{change.toLocaleString()}</b>
                      </div>
                      {breakdown.length > 0 && (
                        <div style={styles.breakdown}>
                          {breakdown.map(({ bill, count }) => (
                            <span key={bill} style={styles.coin}>
                              ¥{bill.toLocaleString()}×{count}
                            </span>
                          ))}
                        </div>
                      )}
                      {change === 0 && (
                        <div style={styles.exactBadge}>ぴったり！</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={styles.sectionLabel}>🔢 金額を直接入力</div>
              <div style={styles.customRow}>
                <span style={styles.yenSign}>¥</span>
                <input
                  style={styles.customInput}
                  type="number"
                  placeholder="支払い金額"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                />
              </div>
              {customChange !== null && (
                <div style={styles.customResult}>
                  お釣り：<b>¥{(customPaid - total).toLocaleString()}</b>
                  {customChange.length > 0 && (
                    <div style={styles.breakdown}>
                      {customChange.map(({ bill, count }) => (
                        <span key={bill} style={styles.coin}>
                          ¥{bill.toLocaleString()}×{count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!isNaN(customPaid) &&
                customPaid < total &&
                customInput !== "" && (
                  <div style={styles.errorMsg}>金額が足りません</div>
                )}
            </>
          )}

          <button
            style={styles.clearBtn}
            onClick={() => {
              clearOrder();
              setView("menu");
            }}
          >
            🗑 注文をリセット
          </button>
        </div>
      )}
    </div>
  );
}

const BROWN = "#5c3d1e";
const CREAM = "#fdf6e3";
const TAN = "#c8a87a";
const DARK = "#3b2408";
const ACCENT = "#a0522d";

const styles = {
  root: {
    minHeight: "100vh",
    background: CREAM,
    fontFamily: "'Hiragino Mincho ProN', 'Yu Mincho', Georgia, serif",
    color: DARK,
    paddingBottom: 80,
  },
  header: {
    background: BROWN,
    padding: "0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  },
  headerInner: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: CREAM,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  billBtn: {
    background: TAN,
    color: DARK,
    border: "none",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  backBtn: {
    background: "transparent",
    color: CREAM,
    border: `1px solid ${TAN}`,
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  body: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "16px 12px",
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
    borderBottom: `2px solid ${TAN}`,
    paddingBottom: 8,
  },
  tab: {
    background: "none",
    border: "none",
    borderRadius: 4,
    padding: "6px 14px",
    fontSize: 14,
    color: BROWN,
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  tabActive: {
    background: BROWN,
    color: CREAM,
    borderRadius: 20,
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  menuCard: {
    background: "#fff",
    border: `1px solid #e8d9c0`,
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "all 0.15s",
    boxShadow: "0 1px 4px rgba(92,61,30,0.06)",
  },
  menuCardActive: {
    border: `2px solid ${ACCENT}`,
    background: "#fffaf3",
    boxShadow: "0 2px 10px rgba(160,82,45,0.15)",
  },
  menuName: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 1.4,
  },
  menuPrice: {
    fontSize: 15,
    color: ACCENT,
    fontWeight: "bold",
  },
  qtyRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: `1px solid ${TAN}`,
    background: CREAM,
    color: DARK,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    lineHeight: 1,
  },
  qty: {
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 24,
    textAlign: "center",
    color: BROWN,
  },
  bottomBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: BROWN,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    boxShadow: "0 -2px 12px rgba(0,0,0,0.2)",
    zIndex: 99,
  },
  bottomTotal: {
    color: CREAM,
    fontSize: 15,
  },
  bottomTotalNum: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 8,
    color: TAN,
  },
  billBtn2: {
    background: TAN,
    color: DARK,
    border: "none",
    borderRadius: 20,
    padding: "10px 22px",
    fontSize: 15,
    fontWeight: "bold",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  receipt: {
    background: "#fff",
    border: `1px solid #e8d9c0`,
    borderRadius: 12,
    padding: "20px 18px",
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(92,61,30,0.08)",
  },
  receiptTitle: {
    textAlign: "center",
    fontSize: 13,
    color: BROWN,
    letterSpacing: 4,
    marginBottom: 14,
  },
  emptyMsg: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px dashed #e8d9c0",
    fontSize: 14,
  },
  receiptName: { color: DARK },
  receiptPrice: { fontWeight: "bold", color: ACCENT },
  receiptDivider: {
    height: 2,
    background: BROWN,
    margin: "12px 0",
    borderRadius: 1,
  },
  receiptTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 18,
    fontWeight: "bold",
    color: BROWN,
  },
  receiptTotalNum: {
    fontSize: 26,
    color: ACCENT,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: BROWN,
    marginBottom: 10,
    letterSpacing: 1,
  },
  suggestGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 20,
  },
  suggestCard: {
    background: "#fff",
    border: `1px solid #e8d9c0`,
    borderRadius: 12,
    padding: 12,
    position: "relative",
    boxShadow: "0 1px 4px rgba(92,61,30,0.06)",
  },
  suggestPaid: {
    fontSize: 14,
    fontWeight: "bold",
    color: DARK,
    marginBottom: 4,
  },
  suggestChange: {
    fontSize: 13,
    color: BROWN,
    marginBottom: 6,
  },
  breakdown: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  coin: {
    background: "#f5ead6",
    borderRadius: 10,
    padding: "2px 8px",
    fontSize: 11,
    color: BROWN,
    border: `1px solid ${TAN}`,
  },
  exactBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "#d4704a",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    borderRadius: 10,
    padding: "2px 8px",
    letterSpacing: 1,
  },
  customRow: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: `1px solid ${TAN}`,
    borderRadius: 10,
    padding: "8px 14px",
    marginBottom: 10,
    gap: 8,
  },
  yenSign: {
    fontSize: 20,
    color: BROWN,
    fontWeight: "bold",
  },
  customInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 20,
    fontFamily: "inherit",
    color: DARK,
    background: "transparent",
  },
  customResult: {
    background: "#fffaf3",
    border: `1px solid ${TAN}`,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 15,
    color: BROWN,
    marginBottom: 12,
  },
  errorMsg: {
    color: "#c0392b",
    fontSize: 13,
    marginBottom: 12,
    paddingLeft: 4,
  },
  clearBtn: {
    width: "100%",
    marginTop: 16,
    background: "transparent",
    border: `1px solid #ccc`,
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    color: "#999",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
