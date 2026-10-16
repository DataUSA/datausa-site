/** 12-month price changes by CPI category as horizontal bars around zero (server-rendered). */
import type {CategoryChange} from "@/lib/latest/indicators";

export function CategoryBars({categories}: {categories: CategoryChange[]}) {
  if (!categories.length) return null;
  const min = Math.min(0, ...categories.map(c => c.change));
  const max = Math.max(0, ...categories.map(c => c.change));
  const span = max - min || 1;
  const zero = (-min / span) * 100;
  return (
    <ul className="category-bars">
      {categories.map(c => {
        const width = (Math.abs(c.change) / span) * 100;
        const start = c.change < 0 ? zero - width : zero;
        return (
          <li key={c.label}>
            <span className="category-label">{c.label}</span>
            <span className="category-track">
              <span className="category-zero" style={{left: `${zero}%`}} />
              <span className={`category-bar ${c.change < 0 ? "negative" : "positive"}`} style={{left: `${start}%`, width: `${Math.max(width, 0.4)}%`}} />
            </span>
            <span className="category-value">{c.change > 0 ? "+" : c.change < 0 ? "−" : ""}{Math.abs(c.change).toFixed(1)}%</span>
          </li>
        );
      })}
    </ul>
  );
}
