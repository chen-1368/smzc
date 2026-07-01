const STAT_ORDER = [
  ["hp", "生命"],
  ["mp", "魔法"],
  ["atk", "攻击"],
  ["def", "防御"],
  ["healHp", "回血"],
  ["healMp", "回蓝"],
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

const STAR_RATE = {
  0: 0.95,
  1: 1.0,
  2: 1.05,
  3: 1.1,
  4: 1.15,
  5: 1.2,
  6: 1.25,
  7: 1.3,
  8: 1.35,
};
export function getStarMult(star) {
  return STAR_RATE[star];
}

export function calcStat(coeff, key, star, baseVal) {
  if (coeff === undefined || coeff === null) return null;
  if (key === "spd") return coeff;
  return Math.round(coeff * (baseVal || 0) * getStarMult(star));
}

export { STAT_ORDER };
