/**
 * 数据提取脚本：解析 godWar-configs/ 中的原始 JS 文件，生成结构化 JSON
 *
 * 用法：node scripts/02-extract.js
 *
 * 输出：data/godwar.json
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.resolve(__dirname, '..', 'godWar-configs');
const OUTPUT_FILE = path.resolve(__dirname, '..', 'data', 'godwar.json');

function loadConfig(filename) {
  const content = fs.readFileSync(path.join(CONFIG_DIR, filename), 'utf8');
  // Extract the array using eval since JS objects may have unquoted keys
  const match = content.match(/var tmp=(\[.*\]);/s);
  if (!match) throw new Error(`无法解析 ${filename}`);
  // eslint-disable-next-line no-eval
  return eval('(' + match[1] + ')');
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

const MULTIPLIER_FIELDS = ['hp', 'atk', 'def', 'healHp', 'mp', 'healMp', 'hitVal', 'dodge', 'crit', 'tenacity', 'lucky', 'guardian', 'break', 'protect'];
const ABSOLUTE_FIELDS = ['spd'];
const STAT_FIELDS = [...MULTIPLIER_FIELDS, ...ABSOLUTE_FIELDS];

const STAT_LABELS = {
  hp: '生命', atk: '攻击', def: '防御', healHp: '回血',
  mp: '魔法', healMp: '回蓝', hitVal: '命中', dodge: '闪避',
  crit: '暴击', tenacity: '韧性', lucky: '幸运',
  guardian: '守护', break: '穿透', protect: '减伤', spd: '移速'
};

function extractStats(monsterRow, level, attrByLevel) {
  const base = attrByLevel[level];
  const stats = {};
  for (const f of MULTIPLIER_FIELDS) {
    if (monsterRow[f] !== undefined && monsterRow[f] !== null && base) {
      const baseKey = f === 'hp' ? 'hp' : f;
      const baseVal = base[baseKey] || 0;
      stats[f] = Math.round(baseVal * monsterRow[f]);
    }
  }
  for (const f of ABSOLUTE_FIELDS) {
    if (monsterRow[f] !== undefined && monsterRow[f] !== null) {
      stats[f] = Math.round(monsterRow[f]);
    }
  }
  return stats;
}

function main() {
  console.log('加载配置文件...');

  const godWarFight = arrayToObjects(loadConfig('godWarFight.js'));
  const godWarBoss = arrayToObjects(loadConfig('godWarBoss.js'));
  const godWarBossShow = arrayToObjects(loadConfig('godWarBossShow.js'));
  const godWarCrystal = arrayToObjects(loadConfig('godWarCrystal.js'));
  const godWarAttribute = arrayToObjects(loadConfig('godWarAttribute.js'));
  const godWarSubstitute = arrayToObjects(loadConfig('godWarSubstitute.js'));
  const godWarRoleData = arrayToObjects(loadConfig('godWarRole.js'));
  const monsterAttribute = arrayToObjects(loadConfig('monsterAttribute.js'));
  const monster = arrayToObjects(loadConfig('monster.js'));
  const ride = arrayToObjects(loadConfig('ride.js'));
  const role = arrayToObjects(loadConfig('role.js'));

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

  // Build monsterAttribute lookup by level
  const attrByLevel = {};
  for (const a of monsterAttribute) {
    attrByLevel[a.lv] = a;
  }

  // 1. 战场列表
  let tierCounter = 0;
  const battlefields = godWarFight
    .filter(f => !f.close)
    .map(f => {
      tierCounter++;
      let name = f.name;
      // Fix mislabeled 16阶 (config says 15阶 but battlefieldLv=220)
      if (f.battlefieldLv === 220 && name.includes('15阶')) {
        name = '神魔战场16阶';
      }
      return {
        id: f.id,
        name,
        battlefield: f.battlefield,
        level: f.battlefieldLv,
      };
    })
    .sort((a, b) => a.level - b.level);

  console.log(`  战场: ${battlefields.length} 个`);

  // 2. 角色数据
  const roleNames = {
    1: '孙悟空', 2: '唐三藏', 3: '猪八戒', 4: '沙悟净',
    5: '敖雪', 6: '敖烈', 7: '萧嫣', 9: '玄女',
  };

  const roles = [];
  for (const [roleIdStr, roleName] of Object.entries(roleNames)) {
    const roleId = parseInt(roleIdStr);
    const statsByLevel = {};

    for (const fight of godWarFight) {
      if (fight.close) continue;
      const monsterId = fight.roleMonster?.[roleId];
      if (!monsterId) continue;
      const m = monsterById[monsterId];
      if (!m) continue;
      const level = fight.battlefieldLv;
      statsByLevel[level] = extractStats(m, level, attrByLevel);
    }

    roles.push({ id: roleId, name: roleName, stats: statsByLevel });
  }

  // 杨戬（替补角色）
  const yangJianStats = {};
  for (const fight of godWarFight) {
    if (fight.close) continue;
    const monsterId = fight.substituteMonster?.[8];
    if (!monsterId) continue;
    const m = monsterById[monsterId];
    if (!m) continue;
    yangJianStats[fight.battlefieldLv] = extractStats(m, fight.battlefieldLv, attrByLevel);
  }
  roles.push({ id: 8, name: '杨戬', stats: yangJianStats });

  console.log(`  角色: ${roles.length} 个`);

  // 3. 坐骑数据
  const rides = [];
  const firstFight = godWarFight.find(f => !f.close);
  if (firstFight?.rideMonster) {
    for (const [rideIdStr, _] of Object.entries(firstFight.rideMonster)) {
      const rideId = parseInt(rideIdStr);
      const rideInfo = rideById[rideId];
      if (!rideInfo) continue;

      const statsByLevel = {};
      for (const fight of godWarFight) {
        if (fight.close) continue;
        const monsterId = fight.rideMonster?.[rideId];
        if (!monsterId) continue;
        const m = monsterById[monsterId];
        if (!m) continue;
        statsByLevel[fight.battlefieldLv] = extractStats(m, fight.battlefieldLv, attrByLevel);
      }

      rides.push({
        id: rideId,
        name: rideInfo.name,
        starLimit: rideInfo.starLimit || null,
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

  // Extract boss rate from godWarRole (format: [atkRate, hpRate])
  const BOSS_NAMES = ['刑天','夸父','后羿','牛魔王','季禺','山鬼','太子长琴','逄蒙','鲧','骄虫','精卫','蚩尤'];
  const bossRateByName = {};
  for (const r of godWarRoleData) {
    if (!r.rate) continue;
    for (const bn of BOSS_NAMES) {
      if (r.name && r.name.includes(bn) && !r.name.includes('召唤') && !r.name.includes('魔首') && !r.name.includes('魔王技')) {
        if (!bossRateByName[bn]) {
          bossRateByName[bn] = { atkRate: r.rate[0], hpRate: r.rate[1] };
        }
        break;
      }
    }
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

    const tiers = group.entries.map(b => ({
      tier: b.level,
      hard: b.hard,
      desc: b.desc,
    }));

    // 获取所有星级乘数
    const stars = [];
    const seenStarIds = new Set();
    for (const b of group.entries) {
      if (!b.monsterId) continue;
      for (const [mapId, showId] of Object.entries(b.monsterId)) {
        if (seenStarIds.has(showId)) continue;
        seenStarIds.add(showId);
        const show = bossShowById[showId];
        if (!show) continue;
        // Get real spd from monster.js (godWarBossShow spd is always 400, which is wrong)
        const monsterEntry = monsterById[showId];
        const realSpd = monsterEntry?.spd || show.spd;
        stars.push({
          id: showId,
          remark: show.remark || '',
          hp: show.hp,
          atk: show.atk,
          def: show.def,
          healHp: show.healHp,
          hitVal: show.hitVal,
          dodge: show.dodge,
          crit: show.crit,
          tenacity: show.tenacity,
          lucky: show.lucky,
          guardian: show.guardian,
          break: show.break,
          protect: show.protect,
          spd: realSpd,
        });
      }
    }

    const rate = bossRateByName[group.name] || null;

    bosses.push({
      group: parseInt(groupId),
      name: group.name,
      rate,
      tiers,
      stars,
    });
  }

  console.log(`  魔王: ${bosses.length} 个`);

  // 5. 中立怪数据
  const neutralNames = { nvba: '女魃', shujing: '侵蚀树精', houqing: '后卿' };
  const neutralMonsters = [];

  for (const [key, name] of Object.entries(neutralNames)) {
    const statsByLevel = {};
    for (const fight of godWarFight) {
      if (fight.close) continue;
      const monsterId = fight.neutralityMonster?.[key];
      if (!monsterId) continue;
      const m = monsterById[monsterId];
      if (!m) continue;
      statsByLevel[fight.battlefieldLv] = extractStats(m, fight.battlefieldLv, attrByLevel);
    }
    neutralMonsters.push({ name, stats: statsByLevel });
  }

  console.log(`  中立怪: ${neutralMonsters.length} 个`);

  // 6. 水晶数据
  const crystals = godWarCrystal
    .filter(c => c.hp > 0 || c.def > 0 || c.guardian > 0)
    .map(c => ({
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

  // 7. 属性基础表
  const godWarAttrTable = {};
  for (const a of godWarAttribute) {
    godWarAttrTable[a.level] = {
      hp: a.hpGod, atk: a.atkGod, def: a.defGod, healHp: a.healHpGod,
      hitVal: a.hitValGod, dodge: a.dodgeGod, crit: a.critGod,
      tenacity: a.tenacityGod, lucky: a.luckyGod, guardian: a.guardianGod,
      break: a.breakGod, protect: a.protectGod,
    };
  }

  const monsterAttrTable = {};
  for (const a of monsterAttribute) {
    monsterAttrTable[a.lv] = {
      hp: a.hp, atk: a.atk, def: a.def, healHp: a.healHp,
      mp: a.mp, healMp: a.healMp, hitVal: a.hitVal,
      dodge: a.dodge, crit: a.crit, tenacity: a.tenacity,
      lucky: a.lucky, guardian: a.guardian, break: a.break,
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
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\n输出: ${OUTPUT_FILE} (${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB)`);
}

main();
