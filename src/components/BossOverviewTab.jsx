import { useState, useMemo, useCallback } from "react";
import { BattlefieldSelect } from "./Selectors";

const BOSS_STAT_FIELDS = [
  ["hp", "生命"],
  ["atk", "攻击"],
  ["def", "防御"],
  ["healHp", "回血"],
  ["hitVal", "命中"],
  ["dodge", "闪避"],
  ["crit", "暴击"],
  ["tenacity", "韧性"],
  ["lucky", "幸运"],
  ["guardian", "守护"],
  ["break", "穿透"],
  ["protect", "减伤"],
  ["spd", "移速"],
];

export default function BossOverviewTab({ data }) {
  const { bosses, battlefields, godWarAttrTable } = data;
  const [bfLevel, setBfLevel] = useState(220);
  const [starIdx, setStarIdx] = useState(5);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const base = godWarAttrTable?.[bfLevel];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const computeStat = useCallback(
    (star, key) => {
      if (!base || !star) return null;
      if (key === "spd") return star.spd || 400;
      if (key === "mp" || key === "healMp") return null;
      const starMult = star[key] ?? 1;
      return Math.round((base[key] || 0) * starMult);
    },
    [base],
  );

  const sorted = useMemo(() => {
    if (!sortKey) return bosses;
    return [...bosses].sort((a, b) => {
      const va = a.stars[starIdx]?.[sortKey] ?? -1;
      const vb = b.stars[starIdx]?.[sortKey] ?? -1;
      return sortAsc ? va - vb : vb - va;
    });
  }, [bosses, starIdx, sortKey, sortAsc]);

  const starLabel = (idx) => {
    const cn = ["一", "二", "三", "四", "五", "六"];
    return `${cn[idx]}阶`;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <BattlefieldSelect battlefields={battlefields} value={bfLevel} onChange={setBfLevel} />
        <div>
          <label className="block text-xs text-slate-400 mb-1">等阶</label>
          <select
            value={starIdx}
            onChange={(e) => setStarIdx(Number(e.target.value))}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <option key={i} value={i}>
                {starLabel(i)}
              </option>
            )).reverse()}
          </select>
        </div>
        {sortKey && (
          <button
            onClick={() => {
              setSortKey(null);
              setSortAsc(false);
            }}
            className="text-xs text-slate-400 hover:text-amber-400 px-2 py-1 rounded border border-slate-600"
          >
            清除排序
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-900 z-10">魔王</th>
              {BOSS_STAT_FIELDS.map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`cursor-pointer select-none hover:text-amber-400 transition-colors ${sortKey === key ? "text-amber-400" : ""}`}
                >
                  {label}
                  {sortKey === key && (
                    <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((boss) => {
              const star = boss.stars[starIdx];
              return (
                <tr key={boss.group}>
                  <td className="sticky left-0 bg-slate-900 z-10 text-amber-400 font-semibold whitespace-nowrap">
                    {boss.name}
                  </td>
                  {BOSS_STAT_FIELDS.map(([key]) => {
                    const val = computeStat(star, key);
                    return (
                      <td key={key} className="text-sm">
                        {val !== null ? val : "-"}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
