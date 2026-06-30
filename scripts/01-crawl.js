/**
 * 爬取脚本：从CDN下载神魔战场相关配置文件
 *
 * 用法：node scripts/01-crawl.js
 *
 * 从 .firecrawl/settings.js 读取 jsList 获取文件名和哈希，
 * 逐个从 CDN 下载到 godWar-configs/ 目录。
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CDN_BASE = 'https://client-zmxyol.3304399.net/client/src/assets/script/config/';
const CONFIG_DIR = path.resolve(__dirname, '..', 'godWar-configs');
const SETTINGS_FILE = path.resolve(__dirname, '..', '.firecrawl', 'settings.js');

const REQUIRED_FILES = [
  'godWar.6acdd.js',
  'godWarStage.ee4c6.js',
  'godWarFight.742d0.js',
  'godWarAttribute.49f70.js',
  'godWarCrystal.2d3d3.js',
  'godWarRole.d0802.js',
  'godWarBoss.f1add.js',
  'godWarBossShow.fe1c4.js',
  'godWarBossFashion.b0693.js',
  'godWarBossTalent.d760f.js',
  'godWarBossTalentGroup.0740d.js',
  'godWarSubstitute.5fa11.js',
  'godWarRank.66ab2.js',
  'godWarReward.2893e.js',
  'godWarRewardLimit.50bbf.js',
  'monster.ba521.js',
  'monsterAttribute.6d813.js',
  'ride.7ef48.js',
  'role.f25f2.js',
  'roleInitial.1c7ab.js',
];

function parseSettings() {
  const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const files = [];
  const regex = /assets\/script\/config\/([a-zA-Z]+\.[a-f0-9]+\.js)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    files.push(m[1]);
  }
  return files;
}

function download(filename) {
  return new Promise((resolve, reject) => {
    const url = CDN_BASE + filename;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`${filename}: HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const available = parseSettings();
  console.log(`settings.js 中共 ${available.length} 个配置文件`);

  let success = 0, skipped = 0, failed = 0;

  for (const filename of REQUIRED_FILES) {
    const dest = path.join(CONFIG_DIR, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
      console.log(`[跳过] ${filename} (已存在)`);
      skipped++;
      continue;
    }

    if (!available.includes(filename)) {
      console.log(`[警告] ${filename} 不在 settings.js 中，尝试直接下载`);
    }

    try {
      console.log(`[下载] ${filename} ...`);
      const data = await download(filename);
      if (data.length < 200) {
        throw new Error(`文件过小 (${data.length} bytes)，可能是404页面`);
      }
      fs.writeFileSync(dest, data);
      console.log(`[完成] ${filename} (${(data.length / 1024).toFixed(1)} KB)`);
      success++;
    } catch (err) {
      console.error(`[失败] ${filename}: ${err.message}`);
      // 重试一次
      try {
        await new Promise(r => setTimeout(r, 1000));
        const data = await download(filename);
        if (data.length < 200) throw new Error('重试仍失败');
        fs.writeFileSync(dest, data);
        console.log(`[重试成功] ${filename}`);
        success++;
      } catch (err2) {
        console.error(`[重试失败] ${filename}: ${err2.message}`);
        failed++;
      }
    }
  }

  console.log(`\n--- 完成 ---`);
  console.log(`下载: ${success}, 跳过: ${skipped}, 失败: ${failed}`);
}

main().catch(console.error);
