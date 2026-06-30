const STAT_ORDER = [
  ['hp', '生命'], ['mp', '魔法'], ['atk', '攻击'], ['def', '防御'],
  ['healHp', '回血'], ['healMp', '回蓝'], ['hitVal', '命中'], ['dodge', '闪避'],
  ['crit', '暴击'], ['tenacity', '韧性'], ['lucky', '幸运'],
  ['guardian', '守护'], ['break', '穿透'], ['protect', '减伤'], ['spd', '移速'],
]

export function getStarMult(star) {
  return 0.95 + star * 0.05
}

export function calcStat(base, key, star) {
  if (base === undefined || base === null) return null
  if (key === 'spd') return base
  return Math.round(base * getStarMult(star))
}

export function fmtStat(v) {
  if (v === undefined || v === null || v === 0) return '-'
  if (typeof v === 'number') {
    if (v > 0 && v < 10 && !Number.isInteger(v)) return v.toFixed(1)
    return v.toLocaleString()
  }
  return v
}

export { STAT_ORDER }
