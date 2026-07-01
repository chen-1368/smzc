import { getStarMult } from "./statUtils";

export function BattlefieldSelect({ battlefields, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">战场等阶</label>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {[...battlefields].map((b) => (
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
        {Array.from({ length: 9 }, (_, i) => (
          <option key={i} value={i}>
            {i}星 (×{getStarMult(i).toFixed(2)})
          </option>
        )).reverse()}
      </select>
    </div>
  );
}
