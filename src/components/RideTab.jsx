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

// 坐骑属性通用表格组件
function RideStatTable({ list, scrollRef, bfLevel, star, baseRow }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key) => {
    setSortKey(key);
    setSortAsc(sortKey === key ? !sortAsc : false);
    scrollRef?.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 当前表格独立排序
  const sortedList = useMemo(() => {
    if (!sortKey) return list;
    return [...list].sort((a, b) => {
      const va = a.stats?.[bfLevel]?.[sortKey] ?? -1;
      const vb = b.stats?.[bfLevel]?.[sortKey] ?? -1;
      return sortAsc ? va - vb : vb - va;
    });
  }, [list, bfLevel, sortKey, sortAsc]);

  // 当前表格独立计算属性极值（只参照自身数据）
  const statExtremes = useMemo(() => {
    const extremes = {};
    if (!list?.length) return extremes;
    RIDE_STAT_FIELDS.forEach(([key]) => {
      let min = Infinity,
        max = -Infinity,
        hasValue = false;
      list.forEach((item) => {
        const val = item.stats?.[bfLevel]?.[key];
        if (val != null && !isNaN(val)) {
          hasValue = true;
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      });
      extremes[key] = hasValue ? { min, max } : null;
    });
    return extremes;
  }, [list, bfLevel]);

  const calcBadgeLevel = (coeff, key) => {
    const extreme = statExtremes[key];
    if (!extreme || coeff == null || isNaN(coeff)) return 0;
    const { min, max } = extreme;
    if (min === max) return 9;
    return Math.ceil(((coeff - min) / (max - min)) * 9);
  };

  if (!list?.length) return null;

  return (
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
        {sortedList.map((ride) => (
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
  );
}

export default function RideTab({ data }) {
  const { rides, battlefields, monsterAttrTable } = data;
  const [bfLevel, setBfLevel] = useState(220);
  const [star, setStar] = useState(8);
  const [search, setSearch] = useState("");
  const scrollRef = useRef(null);

  const baseRow = monsterAttrTable[bfLevel] || {};

  // 仅做搜索过滤，排序下放给子组件
  const filtered = useMemo(() => {
    return search ? rides.filter((r) => r.name.includes(search)) : rides;
  }, [rides, search]);

  // 按ID拆分普通坐骑和珍琦坐骑
  const normalRides = useMemo(() => {
    return filtered.filter((r) => !(r.id >= 231000 && r.id < 241000));
  }, [filtered]);

  const rareRides = useMemo(() => {
    return filtered.filter((r) => r.id >= 231000 && r.id < 241000);
  }, [filtered]);

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

      {filtered.length > 0 ? (
        <>
          <div
            ref={scrollRef}
            className="overflow-auto max-h-[calc(100vh-22rem)]"
          >
            {/* 普通坐骑表 */}
            <RideStatTable
              list={normalRides}
              scrollRef={scrollRef}
              bfLevel={bfLevel}
              star={star}
              baseRow={baseRow}
            />
          </div>
          {/* 珍琦坐骑表 */}
          {rareRides.length > 0 && (
            <div className="overflow-x-auto">
              <div className="text-lg font-bold text-amber-400 mt-4 mb-3">
                珍琦
              </div>
              <RideStatTable
                list={rareRides}
                bfLevel={bfLevel}
                star={star}
                baseRow={baseRow}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-400 mt-10">没有数据</div>
      )}
    </div>
  );
}
