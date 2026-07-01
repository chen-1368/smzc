import { useState, useMemo } from "react";
import { BattlefieldSelect } from "./Selectors";

const CRYSTAL_FIELDS = [
  ["hp", "生命"],
  ["def", "防御"],
  ["guardian", "守护"],
  ["protect", "减伤"],
];

export default function CrystalTab({ data }) {
  const { crystals, battlefields } = data;
  const [bfLevel, setBfLevel] = useState(220);

  const sortedCrystals = useMemo(
    () => [...crystals].sort((a, b) => b.level - a.level),
    [crystals],
  );
  const crystal = sortedCrystals.find((c) => c.level === bfLevel);

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <BattlefieldSelect battlefields={battlefields} value={bfLevel} onChange={setBfLevel} />
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-amber-400">水晶属性</h2>
        <p className="text-sm text-slate-400">Lv.{bfLevel}</p>
      </div>

      {crystal && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {CRYSTAL_FIELDS.map(([key, label]) => (
            <div key={key} className="card p-3">
              <div className="stat-label">{label}</div>
              <div className="stat-value text-lg">
                {crystal[key]?.toLocaleString() || "-"}
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="text-sm text-slate-400 mb-3 uppercase tracking-wider">
        各等阶水晶数值一览
      </h3>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>等级</th>
              {CRYSTAL_FIELDS.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCrystals.map((c) => (
              <tr
                key={c.level}
                className={c.level === bfLevel ? "bg-slate-800" : ""}
              >
                <td className="text-amber-400 font-semibold">Lv.{c.level}</td>
                {CRYSTAL_FIELDS.map(([key]) => (
                  <td key={key} className="text-sm">
                    {c[key]?.toLocaleString() || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
