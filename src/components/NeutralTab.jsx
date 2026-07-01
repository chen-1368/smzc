import { useState } from "react";
import { STAT_ORDER } from "./statUtils";
import { BattlefieldSelect } from "./Selectors";

export default function NeutralTab({ data }) {
  const { neutralMonsters, battlefields, monsterAttrTable } = data;
  const [bfLevel, setBfLevel] = useState(220);

  const availableLevels = battlefields.filter((b) => b.level >= 70);
  const baseRow = monsterAttrTable[bfLevel] || {};

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <BattlefieldSelect
          battlefields={availableLevels}
          value={bfLevel}
          onChange={setBfLevel}
        />
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-900 z-10">中立怪</th>
              {STAT_ORDER.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {neutralMonsters.map((m, i) => {
              const s = m.stats?.[bfLevel];
              return (
                <tr key={i}>
                  <td className="sticky left-0 bg-slate-900 z-10 text-amber-400 font-semibold whitespace-nowrap">
                    {m.name}
                  </td>
                  {STAT_ORDER.map(([key]) => {
                    const coeff = s?.[key];
                    const val =
                      key === "spd"
                        ? coeff
                        : Math.round(coeff * (baseRow[key] || 0));
                    return (
                      <td key={key} className="text-sm">
                        {val != null ? val : "-"}
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
