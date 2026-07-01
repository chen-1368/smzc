import { useState, useMemo } from "react";
import { calcStat } from "./statUtils";
import { BattlefieldSelect, StarSelect } from "./Selectors";

const RIDE_STAT_FIELDS = [
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

function SearchInput({ onSearch }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="坐骑名..."
        className="px-3 py-1.5 rounded-lg text-sm bg-slate-800 border border-slate-600 text-slate-200 focus:outline-none focus:border-amber-500"
      />
    </form>
  );
}

export default function RideTab({ data }) {
  const { rides, battlefields, monsterAttrTable } = data;
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

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    let list = search ? rides.filter((r) => r.name.includes(search)) : rides;
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      const va = a.stats?.[bfLevel]?.[sortKey] ?? -1;
      const vb = b.stats?.[bfLevel]?.[sortKey] ?? -1;
      return sortAsc ? va - vb : vb - va;
    });
  }, [rides, bfLevel, sortKey, sortAsc, search]);

  const baseRow = monsterAttrTable[bfLevel] || {};

  return (
    <div>
      <div className="flex mb-4 items-end justify-between">
        <div className="flex gap-4 items-end">
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
        <SearchInput onSearch={setSearch} />
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-900 z-10">坐骑</th>
              {RIDE_STAT_FIELDS.map(([key, label]) => (
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
            {filtered.map((ride) => (
              <tr key={ride.id}>
                <td className="sticky left-0 bg-slate-900 z-10 text-amber-400 font-semibold whitespace-nowrap">
                  {ride.name}
                </td>
                {RIDE_STAT_FIELDS.map(([key]) => {
                  const coeff = ride.stats?.[bfLevel]?.[key];
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
