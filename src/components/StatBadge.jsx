const STAT_BADGE_COLORS = {
  hp: "bg-red-500", // 生命 - 经典生命红
  mp: "bg-blue-500", // 魔法 - 标准魔法蓝
  atk: "bg-amber-500", // 攻击 - 橙黄攻击色
  def: "bg-slate-500", // 防御 - 中性灰
  healHp: "bg-orange-500", // 回血 - 暖橙色
  healMp: "bg-purple-500", // 回蓝 - 回魔紫
  hitVal: "bg-cyan-500", // 命中 - 青蓝色
  dodge: "bg-gray-500", // 闪避 - 冷灰色
  crit: "bg-fuchsia-500", // 暴击 - 粉紫色
  tenacity: "bg-amber-700", // 韧性 - 暖深棕
  lucky: "bg-pink-500", // 幸运 - 亮粉色
  guardian: "bg-emerald-500", // 守护 - 翠绿
  break: "bg-red-600", // 穿透 - 深红
  protect: "bg-teal-500", // 减伤 - 水绿
  spd: "bg-sky-500", // 移速 - 天蓝
};

// ========== 四分格小图标组件 ==========
export function StatBadge({ level = 0, statKey = "spd" }) {
  // 填充顺序：左上 → 左下 → 右上 → 右下（竖排填充，还原原图视觉）
  // 如果想要横排填充，改成 [0, 1, 2, 3] 即可
  const fillOrder = [0, 1, 2, 3];
  const blocks = Array(4).fill(false);

  // 限制档位在 0-4 区间
  const safeLevel = Math.min(Math.max(Math.round(level), 0), 4);
  for (let i = 0; i < safeLevel; i++) {
    blocks[fillOrder[i]] = true;
  }

  return (
    <span className="inline-grid grid-cols-2 grid-rows-2 w-[15px] h-[15px] gap-px align-middle mr-1.5">
      {blocks.map((active, idx) => (
        <span
          key={idx}
          className={
            active ? STAT_BADGE_COLORS[statKey] || "bg-sky-500" : "bg-gray-400"
          }
        />
      ))}
    </span>
  );
}
