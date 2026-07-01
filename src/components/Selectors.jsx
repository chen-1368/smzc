import { getStarMult } from "./statUtils";

const STAR_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: i,
  label: `${i}星 (×${getStarMult(i).toFixed(2)})`,
})).reverse();

export function BattlefieldSelect({ battlefields, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">战场等阶</label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {battlefields.map((b) => (
          <option key={b.level} value={b.level}>
            {b.name} (Lv.{b.level})
          </option>
        ))}
      </select>
    </div>
  );
}

export function StarSelect({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">星级</label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {STAR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
