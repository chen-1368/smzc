import { useState, useMemo } from "react";
import { BattlefieldSelect } from "./Selectors";
import { StatBadge } from "./StatBadge";

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

const TIER_CN = ["一", "二", "三", "四", "五", "六"];
const TIER_OPTIONS = TIER_CN.map((cn, i) => ({
  value: i,
  label: `${cn}阶`,
})).reverse();

export default function BossOverviewTab({ data }) {
  const { bosses, battlefields, godWarAttrTable } = data;
  const [bfLevel, setBfLevel] = useState(220);
  const [starIdx, setStarIdx] = useState(5);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  // ========== 计算当前等级下，每个属性 coeff 的最大/最小值 ==========
  const statExtremes = useMemo(() => {
    const extremes = {};
    if (!bosses?.length) return extremes;

    BOSS_STAT_FIELDS.forEach(([key]) => {
      let min = Infinity;
      let max = -Infinity;
      let hasValue = false;

      bosses.forEach((boss) => {
        const val = boss.stars[starIdx]?.[key];
        if (val != null && !isNaN(val)) {
          hasValue = true;
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });

      extremes[key] = hasValue ? { min, max } : null;
    });

    return extremes;
  }, [bosses, starIdx]);
  // 根据 coeff 计算方块点亮档位（1~4格）
  const calcBadgeLevel = (coeff, key) => {
    const extreme = statExtremes[key];
    if (!extreme || coeff == null || isNaN(coeff)) return 0;
    const { min, max } = extreme;

    // 所有角色系数相同时，默认亮4格
    if (min === max) return 4;

    // 线性映射：最低值=1格，最高值=4格
    const ratio = (coeff - min) / (max - min);
    return Math.ceil(ratio * 4);
  };

  const base = godWarAttrTable?.[bfLevel];

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const computeStat = (star, key) => {
    if (!base || !star) return null;
    if (key === "spd") return star.spd || 400;
    if (key === "mp" || key === "healMp") return null;
    const starMult = star[key] ?? 1;
    return Math.round((base[key] || 0) * starMult);
  };

  const sorted = useMemo(() => {
    if (!sortKey) return bosses;
    return [...bosses].sort((a, b) => {
      const va = a.stars[starIdx]?.[sortKey] ?? -1;
      const vb = b.stars[starIdx]?.[sortKey] ?? -1;
      return sortAsc ? va - vb : vb - va;
    });
  }, [bosses, starIdx, sortKey, sortAsc]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 mb-5 items-end justify-center">
        <BattlefieldSelect
          battlefields={battlefields}
          value={bfLevel}
          onChange={setBfLevel}
        />
        <div>
          <label className="block text-xs text-slate-400 mb-1 text-center">
            等阶
          </label>
          <select
            className="custom-select"
            value={starIdx}
            onChange={(e) => setStarIdx(Number(e.target.value))}
          >
            {TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="sticky-left">魔王</th>
              {BOSS_STAT_FIELDS.map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`cursor-pointer select-none hover:text-amber-400 transition-colors ${
                    sortKey === key ? "text-amber-400" : ""
                  }`}
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
                  <td className="sticky-left text-amber-400 font-semibold whitespace-nowrap">
                    {boss.name}
                  </td>
                  {BOSS_STAT_FIELDS.map(([key]) => {
                    const val = computeStat(star, key);
                    const badgeLevel = calcBadgeLevel(star?.[key], key);
                    return (
                      <td key={key} className="text-sm tabular-nums">
                        {val !== null ? (
                          <div className="flex items-center whitespace-nowrap">
                            <StatBadge level={badgeLevel} statKey={key} />
                            {val.toLocaleString()}
                          </div>
                        ) : (
                          "-"
                        )}
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
