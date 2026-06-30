import { useState, useMemo } from 'react'
import { STAT_ORDER, calcStat, fmtStat, getStarMult } from './statUtils'

export default function RoleTab({ data }) {
  const { roles, battlefields } = data
  const [bfLevel, setBfLevel] = useState(220)
  const [star, setStar] = useState(8)
  const [sortKey, setSortKey] = useState(null)
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const sortedRoles = useMemo(() => {
    if (!sortKey) return roles
    return [...roles].sort((a, b) => {
      const va = calcStat(a.stats?.[bfLevel]?.[sortKey], sortKey, 0) ?? -1
      const vb = calcStat(b.stats?.[bfLevel]?.[sortKey], sortKey, 0) ?? -1
      return sortAsc ? va - vb : vb - va
    })
  }, [roles, bfLevel, sortKey, sortAsc])

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs text-slate-400 mb-1">战场等阶</label>
          <select value={bfLevel} onChange={e => { setBfLevel(Number(e.target.value)) }}>
            {[...battlefields].reverse().map(b => (
              <option key={b.level} value={b.level}>{b.name} (Lv.{b.level})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">星级</label>
          <select value={star} onChange={e => setStar(Number(e.target.value))}>
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i} value={i}>{i}星 (×{getStarMult(i).toFixed(2)})</option>
            )).reverse()}
          </select>
        </div>
        {sortKey && (
          <button
            onClick={() => { setSortKey(null); setSortAsc(false) }}
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
                  className={`cursor-pointer select-none hover:text-amber-400 transition-colors ${sortKey === key ? 'text-amber-400' : ''}`}
                >
                  {label}
                  {sortKey === key && <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRoles.map(role => (
              <tr key={role.id}>
                <td className="sticky left-0 bg-slate-900 z-10 text-amber-400 font-semibold whitespace-nowrap">
                  {role.name}
                </td>
                {STAT_ORDER.map(([key]) => {
                  const base = role.stats?.[bfLevel]?.[key]
                  const val = calcStat(base, key, star)
                  const isBad = base !== undefined && base < 10 && key !== 'spd'
                  return (
                    <td key={key} className={`text-sm ${isBad ? 'text-red-400' : ''}`}>
                      {val !== null ? fmtStat(val) : '-'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
