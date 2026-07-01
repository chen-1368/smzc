/**
 * 数据提取脚本：解析 godWar-configs/ 中的原始 JS 文件，生成结构化 JSON
 *
 * 用法：node scripts/02-extract.cjs
 */

const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const CONFIG_DIR = path.resolve(__dirname, "..", "godWar-configs");
const OUTPUT_FILE = path.resolve(__dirname, "..", "src", "data", "godwar.json");

function evalNode(node) {
  switch (node.type) {
    case "Literal":
      return node.value;
    case "ArrayExpression":
      return node.elements.map((el) =>
        el === null ? undefined : evalNode(el),
      );
    case "ObjectExpression": {
      const obj = {};
      for (const prop of node.properties) {
        const key =
          prop.key.type === "Identifier" ? prop.key.name : evalNode(prop.key);
        obj[key] = evalNode(prop.value);
      }
      return obj;
    }
    case "UnaryExpression":
      if (node.operator === "-") return -evalNode(node.argument);
      if (node.operator === "+") return +evalNode(node.argument);
      if (node.operator === "!") return !evalNode(node.argument);
      throw new Error(`不支持的运算符: ${node.operator}`);
    case "Identifier":
      if (node.name === "undefined") return undefined;
      throw new Error(`不支持的标识符: ${node.name}`);
    default:
      throw new Error(`不支持的节点类型: ${node.type}`);
  }
}

function loadConfig(filename) {
  const content = fs.readFileSync(path.join(CONFIG_DIR, filename), "utf8");
  const ast = acorn.parse(content, { ecmaVersion: 2020 });
  const decl = ast.body[0];
  if (!decl || decl.type !== "VariableDeclaration")
    throw new Error(`无法解析 ${filename}`);
  return evalNode(decl.declarations[0].init);
}

function arrayToObjects(arr) {
  const header = arr[0];
  const result = [];
  for (let i = 1; i < arr.length; i++) {
    const obj = {};
    header.forEach((key, j) => {
      obj[key] = arr[i][j];
    });
    result.push(obj);
  }
  return result;
}

const STAT_FIELDS = [
  "hp",
  "atk",
  "def",
  "healHp",
  "mp",
  "healMp",
  "hitVal",
  "dodge",
  "crit",
  "tenacity",
  "lucky",
  "guardian",
  "break",
  "protect",
  "spd",
];

const STAT_LABELS = {
  hp: "生命",
  atk: "攻击",
  def: "防御",
  healHp: "回血",
  mp: "魔法",
  healMp: "回蓝",
  hitVal: "命中",
  dodge: "闪避",
  crit: "暴击",
  tenacity: "韧性",
  lucky: "幸运",
  guardian: "守护",
  break: "穿透",
  protect: "减伤",
  spd: "移速",
};

function extractStats(monsterRow) {
  const stats = {};
  for (const field of STAT_FIELDS) {
    stats[field] = monsterRow[field] || 0;
  }
  return stats;
}

function main() {
  console.log("加载配置文件...");

  const godWarFight = arrayToObjects(loadConfig("godWarFight.js"));
  const godWarBoss = arrayToObjects(loadConfig("godWarBoss.js"));
  const godWarBossShow = arrayToObjects(loadConfig("godWarBossShow.js"));
  const godWarCrystal = arrayToObjects(loadConfig("godWarCrystal.js"));
  const godWarAttribute = arrayToObjects(loadConfig("godWarAttribute.js"));
  const monsterAttribute = arrayToObjects(loadConfig("monsterAttribute.js"));
  const monster = arrayToObjects(loadConfig("monster.js"));
  const ride = arrayToObjects(loadConfig("ride.js"));

  // Build monster lookup by id
  const monsterById = {};
  for (const m of monster) {
    monsterById[m.id] = m;
  }

  // Build ride lookup by id
  const rideById = {};
  for (const r of ride) {
    rideById[r.id] = r;
  }

  // 1. 战场列表
  const battlefields = godWarFight
    .map((f) => {
      let name = f.name;
      // Fix mislabeled 16阶 (config says 15阶 but battlefieldLv=220)
      if (f.battlefieldLv === 220 && name.includes("15阶")) {
        name = "神魔战场16阶";
      }
      return {
        id: f.id,
        name,
        level: f.battlefieldLv,
      };
    })
    .sort((a, b) => a.level - b.level);

  console.log(`  战场: ${battlefields.length} 个`);

  // 2. 角色数据
  const roleNames = {
    1: "孙悟空",
    2: "唐三藏",
    3: "猪八戒",
    4: "沙悟净",
    5: "敖雪",
    6: "敖烈",
    7: "萧嫣",
    9: "玄女",
  };

  const roles = [];
  for (const [roleIdStr, roleName] of Object.entries(roleNames)) {
    const roleId = parseInt(roleIdStr);
    const statsByLevel = {};

    for (const fight of godWarFight) {
      const monsterId = fight.roleMonster?.[roleId];
      if (!monsterId) continue;
      const m = monsterById[monsterId];
      if (!m) continue;
      const level = fight.battlefieldLv;
      statsByLevel[level] = extractStats(m);
    }

    roles.push({ id: roleId, name: roleName, stats: statsByLevel });
  }

  // 杨戬（替补角色）
  const yangJianStats = {};
  for (const fight of godWarFight) {
    const monsterId = fight.substituteMonster?.[8];
    if (!monsterId) continue;
    const m = monsterById[monsterId];
    if (!m) continue;
    yangJianStats[fight.battlefieldLv] = extractStats(m);
  }
  roles.push({ id: 8, name: "杨戬", stats: yangJianStats });

  console.log(`  角色: ${roles.length} 个`);

  // 3. 坐骑数据
  const rides = [];
  const firstFight = godWarFight.find((f) => !f.close);
  if (firstFight?.rideMonster) {
    for (const rideIdStr of Object.keys(firstFight.rideMonster)) {
      const rideId = parseInt(rideIdStr);
      const rideInfo = rideById[rideId];
      if (!rideInfo) continue;
      // 去除重复的坐骑
      if (rides.some((r) => r.name === rideInfo.name)) continue;

      const statsByLevel = {};
      for (const fight of godWarFight) {
        const monsterId = fight.rideMonster?.[rideId];
        if (!monsterId) continue;
        const m = monsterById[monsterId];
        if (!m) continue;
        statsByLevel[fight.battlefieldLv] = extractStats(m);
      }

      rides.push({
        id: rideId,
        name: rideInfo.name,
        stats: statsByLevel,
      });
    }
  }
  rides.sort((a, b) => a.id - b.id);
  console.log(`  坐骑: ${rides.length} 个`);

  // 4. 魔王数据
  const bossShowById = {};
  for (const s of godWarBossShow) {
    bossShowById[s.id] = s;
  }

  const bossGroups = {};
  for (const boss of godWarBoss) {
    if (boss.id >= 200000) continue; // 跳过比赛专用
    const g = boss.group;
    if (!bossGroups[g]) bossGroups[g] = { name: boss.name, entries: [] };
    bossGroups[g].entries.push(boss);
  }

  const bosses = [];
  for (const [groupId, group] of Object.entries(bossGroups)) {
    group.entries.sort((a, b) => a.level - b.level);

    const tiers = group.entries.map((b) => ({
      tier: b.level,
      hard: b.hard,
      desc: b.desc,
    }));

    // 获取所有星级乘数
    const stars = [];
    const seenStarIds = new Set();
    for (const b of group.entries) {
      if (!b.monsterId) continue;
      for (const showId of Object.values(b.monsterId)) {
        if (seenStarIds.has(showId)) continue;
        seenStarIds.add(showId);
        const show = bossShowById[showId];
        if (!show) continue;
        // 从 monster.js 获取真正的倍率 (godWarBossShow is only for display)
        const monsterEntry = monsterById[showId];
        stars.push({
          id: showId,
          remark: monsterEntry?.remark || show.remark,
          hp: monsterEntry?.hp || show.hp,
          atk: monsterEntry?.atk || show.atk,
          def: monsterEntry?.def || show.def,
          healHp: monsterEntry?.healHp || show.healHp,
          hitVal: monsterEntry?.hitVal || show.hitVal,
          dodge: monsterEntry?.dodge || show.dodge,
          crit: monsterEntry?.crit || show.crit,
          tenacity: monsterEntry?.tenacity || show.tenacity,
          lucky: monsterEntry?.lucky || show.lucky,
          guardian: monsterEntry?.guardian || show.guardian,
          break: monsterEntry?.break || show.break,
          protect: monsterEntry?.protect || show.protect,
          spd: monsterEntry?.spd || show.spd,
        });
      }
    }

    bosses.push({
      group: parseInt(groupId),
      name: group.name,
      tiers,
      stars,
    });
  }

  console.log(`  魔王: ${bosses.length} 个`);

  // 5. 中立怪数据
  const neutralNames = { nvba: "女魃", shujing: "侵蚀树精", houqing: "后卿" };
  const neutralMonsters = [];

  for (const [key, name] of Object.entries(neutralNames)) {
    const statsByLevel = {};
    for (const fight of godWarFight) {
      const monsterId = fight.neutralityMonster?.[key];
      if (!monsterId) continue;
      const m = monsterById[monsterId];
      if (!m) continue;
      statsByLevel[fight.battlefieldLv] = extractStats(m);
    }
    neutralMonsters.push({ name, stats: statsByLevel });
  }

  console.log(`  中立怪: ${neutralMonsters.length} 个`);

  // 6. 水晶数据
  const crystals = godWarCrystal
    .filter((c) => c.level > 59 && c.level % 10 === 0)
    .map((c) => ({
      level: c.level,
      hp: c.hp,
      atk: c.atk,
      def: c.def,
      healHp: c.healHp,
      mp: c.mp,
      healMp: c.healMp,
      hitVal: c.hitVal,
      dodge: c.dodge,
      crit: c.crit,
      tenacity: c.tenacity,
      lucky: c.lucky,
      guardian: c.guardian,
      break: c.break,
      protect: c.protect,
    }));

  console.log(`  水晶: ${crystals.length} 条`);

  // 7. 魔王属性基础表
  const godWarAttrTable = {};
  for (const a of godWarAttribute) {
    if (a.level < 60) continue; // 只保留 60 级以上
    if (a.level % 10 !== 0) continue; // 只保留 10 级倍率
    godWarAttrTable[a.level] = {
      hp: a.hpGod,
      atk: a.atkGod,
      def: a.defGod,
      healHp: a.healHpGod,
      hitVal: a.hitValGod,
      dodge: a.dodgeGod,
      crit: a.critGod,
      tenacity: a.tenacityGod,
      lucky: a.luckyGod,
      guardian: a.guardianGod,
      break: a.breakGod,
      protect: a.protectGod,
    };
  }

  const monsterAttrTable = {};
  for (const a of monsterAttribute) {
    if (a.lv < 60) continue; // 只保留 60 级以上
    if (a.lv % 10 !== 0) continue; // 只保留 10 级倍率
    monsterAttrTable[a.lv] = {
      hp: a.hp,
      atk: a.atk,
      def: a.def,
      healHp: a.healHp,
      mp: a.mp,
      healMp: a.healMp,
      hitVal: a.hitVal,
      dodge: a.dodge,
      crit: a.crit,
      tenacity: a.tenacity,
      lucky: a.lucky,
      guardian: a.guardian,
      break: a.break,
      protect: a.protect,
    };
  }

  // 输出
  const output = {
    meta: {
      statFields: STAT_FIELDS,
      statLabels: STAT_LABELS,
    },
    battlefields,
    roles,
    rides,
    bosses,
    neutralMonsters,
    crystals,
    godWarAttrTable,
    monsterAttrTable,
  };

  if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `\n输出: ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB)`,
  );
}

main();
