import { useState, useMemo } from "react";
import { STAT_ORDER, calcStat } from "./statUtils";
import { BattlefieldSelect, StarSelect } from "./Selectors";

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
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <BattlefieldSelect
          battlefields={battlefields}
          value={bfLevel}
          onChange={setBfLevel}
        />
        <StarSelect value={star} onChange={setStar} />
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
              <th className="sticky left-0 bg-slate-900 z-10">角色</th>
              {STAT_ORDER.map(([key, label]) => (
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
            {sortedRoles.map((role) => (
              <tr key={role.id}>
                <td className="sticky left-0 bg-slate-900 z-10 text-amber-400 font-semibold whitespace-nowrap">
                  {role.name}
                </td>
                {STAT_ORDER.map(([key]) => {
                  const coeff = role.stats?.[bfLevel]?.[key];
                  const val = calcStat(coeff, key, star, baseRow[key] || 0);
                  return (
                    <td key={key} className="text-sm">
                      {val !== null ? val.toLocaleString() : "-"}
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
