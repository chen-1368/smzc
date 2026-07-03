import { useState, useMemo } from "react";
import { STAT_ORDER, calcStat } from "./statUtils";
import { BattlefieldSelect, StarSelect } from "./Selectors";
import { StatBadge4 } from "./StatBadge";

export default function RoleTab({ data }) {
  const { roles, battlefields, monsterAttrTable } = data;
  const [bfLevel, setBfLevel] = useState(220);
  const [star, setStar] = useState(8);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  // ========== 计算当前等级下，每个属性 coeff 的最大/最小值 ==========
  const statExtremes = useMemo(() => {
    const extremes = {};
    if (!roles?.length) return extremes;

    STAT_ORDER.forEach(([key]) => {
      let min = Infinity;
      let max = -Infinity;
      let hasValue = false;

      roles.forEach((role) => {
        const val = role.stats?.[bfLevel]?.[key];
        if (val != null && !isNaN(val)) {
          hasValue = true;
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });

      extremes[key] = hasValue ? { min, max } : null;
    });

    return extremes;
  }, [roles, bfLevel]);
  // 根据 coeff 计算方块点亮档位（1~4格）
  const calcBadgeLevel = (coeff, key) => {
    const extreme = statExtremes[key];
    if (!extreme || coeff == null || isNaN(coeff)) return 0;
    const { min, max } = extreme;

    // 所有角色系数相同时，默认亮4格
    if (min === max) return 4;

    // 线性映射：最低值=1格，最高值=4格
    const ratio = (coeff - min) / (max - min);
    return Math.round(ratio * 4);
  };

  const sortedRoles = useMemo(() => {
    if (!sortKey) return roles;
    return [...roles].sort((a, b) => {
      const va = a.stats?.[bfLevel]?.[sortKey] ?? -1;
      const vb = b.stats?.[bfLevel]?.[sortKey] ?? -1;
      return sortAsc ? va - vb : vb - va;
    });
  }, [roles, bfLevel, sortKey, sortAsc]);

  const baseRow = monsterAttrTable[bfLevel] || {};

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 mb-5 items-end justify-center">
        <BattlefieldSelect
          battlefields={battlefields}
          value={bfLevel}
          onChange={setBfLevel}
        />
        <StarSelect value={star} onChange={setStar} />
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="sticky-left">角色</th>
              {STAT_ORDER.map(([key, label]) => (
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
            {sortedRoles.map((role) => (
              <tr key={role.id}>
                <td className="sticky-left text-amber-400 font-semibold whitespace-nowrap">
                  {role.name}
                </td>
                {STAT_ORDER.map(([key]) => {
                  const coeff = role.stats?.[bfLevel]?.[key];
                  const val = calcStat(coeff, key, star, baseRow[key] || 0);
                  const badgeLevel = calcBadgeLevel(coeff, key);
                  return (
                    <td key={key} className="text-sm tabular-nums">
                      {val !== null ? (
                        <div className="flex items-center whitespace-nowrap">
                          <StatBadge4 level={badgeLevel} statKey={key} />
                          {val.toLocaleString()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
