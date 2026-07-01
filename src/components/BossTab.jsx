import { useState } from 'react'

const STAT_FIELDS = [
  ['hp', '生命'], ['atk', '攻击'], ['def', '防御'], ['healHp', '回血'],
  ['hitVal', '命中'], ['dodge', '闪避'], ['crit', '暴击'], ['tenacity', '韧性'],
  ['lucky', '幸运'], ['guardian', '守护'], ['break', '穿透'], ['protect', '减伤'], ['spd', '移速'],
]

export default function BossTab({ data }) {
  const { bosses } = data
  const [bossGroup, setBossGroup] = useState(bosses[0]?.group)
  const [tier, setTier] = useState(6)

  const boss = bosses.find(b => b.group === bossGroup)
  const tierInfo = boss?.tiers?.find(t => t.tier === tier)
  const stars = boss?.stars || []

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-48 shrink-0">
        <h3 className="text-sm text-slate-400 mb-2 uppercase tracking-wider">选择魔王</h3>
        <div className="flex flex-col gap-1">
          {bosses.map(b => (
            <button
              key={b.group}
              onClick={() => { setBossGroup(b.group); setTier(1) }}
              className={`entity-btn px-3 py-2 rounded-lg text-sm text-left ${bossGroup === b.group ? 'active' : ''}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">等阶</label>
            <select value={tier} onChange={e => setTier(Number(e.target.value))}>
              {[...(boss?.tiers || [])].reverse().map(t => {
                const cn = ['一', '二', '三', '四', '五', '六']
                return <option key={t.tier} value={t.tier}>{cn[t.tier - 1]}阶</option>
              })}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-amber-400">{boss?.name}</h2>
          {tierInfo?.desc && (
            <p className="text-sm text-slate-400 mt-2" dangerouslySetInnerHTML={{ __html: tierInfo.desc.replace(/<br\s*\/?>/g, ' ') }} />
          )}
        </div>

        {stars.length > 0 && (
          <div className="overflow-x-auto">
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
                      {`${['一','二','三','四','五','六'][i] || i+1}阶`}
                    </td>
                    {STAT_FIELDS.map(([key]) => (
                      <td key={key} className="text-sm">
                        {s[key] !== undefined ? (
                          typeof s[key] === 'number' && s[key] !== 1 ? (
                            <span className={s[key] > 1 ? 'text-green-400' : 'text-red-400'}>
                              ×{s[key].toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-slate-400">×{s[key]}</span>
                          )
                        ) : '-'}
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
  )
}
