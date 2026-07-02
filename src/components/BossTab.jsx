import { useState, useMemo } from "react";

const STAT_FIELDS = [
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

export default function BossTab({ data }) {
  const { bosses } = data;
  const [bossGroup, setBossGroup] = useState(bosses[0]?.group);

  const boss = useMemo(
    () => bosses.find((b) => b.group === bossGroup),
    [bosses, bossGroup],
  );
  const stars = boss?.stars || [];
  const descHtml = useMemo(
    () => boss?.desc?.replace(/<br\s*\/?>/g, " "),
    [boss?.desc],
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-6 items-center">
        <div className="flex gap-2 mb-5 items-end flex-wrap justify-center">
          {bosses.map((b) => (
            <button
              key={b.group}
              onClick={() => {
                setBossGroup(b.group);
              }}
              className={`entity-btn px-4 py-2.5 rounded-lg text-sm text-left ${
                bossGroup === b.group ? "active" : ""
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-2xl font-bold text-amber-400">{boss?.name}</h2>
          {descHtml && (
            <p
              className="text-sm text-slate-400 mt-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          )}
        </div>

        {stars.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table>
              <thead>
                <tr>
                  <th>等阶</th>
                  {STAT_FIELDS.map(([key, label]) => (
                    <th key={key}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stars.map((s, i) => (
                  <tr key={s.id || i}>
                    <td className="text-amber-400 font-semibold whitespace-nowrap">
                      {["一", "二", "三", "四", "五", "六"][i] || i + 1}阶
                    </td>
                    {STAT_FIELDS.map(([key]) => (
                      <td key={key} className="text-sm tabular-nums">
                        {s[key] !== undefined ? (
                          typeof s[key] === "number" && s[key] !== 1 ? (
                            <span
                              className={
                                s[key] > 1 ? "text-emerald-400" : "text-red-400"
                              }
                            >
                              ×{s[key].toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-slate-400">×{s[key]}</span>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
