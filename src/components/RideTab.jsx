import { useState, useMemo, useRef } from "react";
import { calcStat } from "./statUtils";
import { BattlefieldSelect, StarSelect } from "./Selectors";
import { StatBadge9 } from "./StatBadge";

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
    <div>
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
        />
      </form>
    </div>
  );
}

export default function RideTab({ data }) {
  const { rides, battlefields, monsterAttrTable } = data;
  const [bfLevel, setBfLevel] = useState(220);
  const [star, setStar] = useState(8);
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const scrollRef = useRef(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
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

  // ========== 计算当前等级下，每个属性 coeff 的最大/最小值 ==========
  const statExtremes = useMemo(() => {
    const extremes = {};
    if (!rides?.length) return extremes;

    RIDE_STAT_FIELDS.forEach(([key]) => {
      let min = Infinity;
      let max = -Infinity;
      let hasValue = false;

      rides.forEach((ride) => {
        const val = ride.stats?.[bfLevel]?.[key];
        if (val != null && !isNaN(val)) {
          hasValue = true;
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });

      extremes[key] = hasValue ? { min, max } : null;
    });

    return extremes;
  }, [rides, bfLevel]);
  const calcBadgeLevel = (coeff, key) => {
    const extreme = statExtremes[key];
    if (!extreme || coeff == null || isNaN(coeff)) return 0;
    const { min, max } = extreme;
    if (min === max) return 4; // 数值全部相同时的默认档位
    const ratio = (coeff - min) / (max - min);
    return Math.ceil(ratio * 9);
  };
  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 mb-5 items-end justify-center">
        <div className="flex flex-wrap gap-4 items-end">
          <BattlefieldSelect
            battlefields={battlefields}
            value={bfLevel}
            onChange={setBfLevel}
          />
          <StarSelect value={star} onChange={setStar} />
        </div>
        <SearchInput onSearch={setSearch} />
      </div>

      <div ref={scrollRef} className="overflow-auto h-[calc(100vh-15rem)]">
        <table>
          <thead>
            <tr>
              <th className="sticky-left-top">坐骑</th>
              {RIDE_STAT_FIELDS.map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`sticky-top cursor-pointer select-none hover:text-amber-400 transition-colors ${
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
            {filtered.map((ride) => (
              <tr key={ride.id}>
                <td className="sticky-left text-amber-400 font-semibold whitespace-nowrap">
                  {ride.name}
                </td>
                {RIDE_STAT_FIELDS.map(([key]) => {
                  const coeff = ride.stats?.[bfLevel]?.[key];
                  const val = calcStat(coeff, key, star, baseRow[key] || 0);
                  const badgeLevel = calcBadgeLevel(coeff, key);
                  return (
                    <td key={key} className="text-sm tabular-nums">
                      {val !== null ? (
                        <div className="flex items-center whitespace-nowrap">
                          <StatBadge9 level={badgeLevel} statKey={key} />
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
