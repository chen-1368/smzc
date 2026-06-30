/**
 * 爬取脚本：从CDN自动发现并下载神魔战场相关配置文件
 *
 * 用法：node scripts/01-crawl.js
 *
 * 流程：
 *   1. 从 CDN 下载 index.html，提取 settings.js URL
 *   2. 下载 settings.js，解析 jsList 获取全量配置清单
 *   3. 匹配提取脚本需要的 11 个文件
 *   4. 下载并去除哈希后缀保存到 godWar-configs/
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CLIENT_ROOT = 'https://client-zmxyol.3304399.net/client/';
const CONFIG_DIR = path.resolve(__dirname, '..', 'godWar-configs');

const NEEDED = [
  'godWarFight', 'godWarBoss', 'godWarBossShow', 'godWarCrystal',
  'godWarAttribute', 'godWarSubstitute', 'godWarRole',
  'monsterAttribute', 'monster', 'ride', 'role',
];

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`${url}: HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`${url}: HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getSettingsUrl() {
  console.log('获取 index.html ...');
  const html = await fetchText(CLIENT_ROOT + 'index.html');
  const m = html.match(/src\/settings\.[a-f0-9]+\.js/);
  if (!m) throw new Error('无法在 index.html 中找到 settings.js');
  const url = CLIENT_ROOT + m[0];
  console.log(`  settings.js: ${url}`);
  return url;
}

async function getFileList(settingsUrl) {
  console.log('获取 settings.js ...');
  const text = await fetchText(settingsUrl);
  const re = /assets\/script\/config\/([a-zA-Z]+\.[a-f0-9]+\.js)/g;
  const files = [];
  let m;
  while ((m = re.exec(text)) !== null) files.push(m[1]);
  console.log(`  jsList 共 ${files.length} 个配置文件`);
  return files;
}

function matchNeeded(allFiles) {
  const result = {};
  for (const f of allFiles) {
    const base = f.replace(/\.[a-f0-9]+\.js$/, '');
    if (NEEDED.includes(base)) result[base] = f;
  }
  return result;
}

function stripHash(filename) {
  return filename.replace(/\.[a-f0-9]+\.js$/, '.js');
}

async function main() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const settingsUrl = await getSettingsUrl();
  const allFiles = await getFileList(settingsUrl);
  const needed = matchNeeded(allFiles);

  const found = Object.keys(needed);
  const missing = NEEDED.filter(n => !needed[n]);
  if (missing.length > 0) {
    console.error(`[错误] 以下文件在 jsList 中未找到: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`匹配到 ${found.length} 个需要的文件`);

  let success = 0, failed = 0;

  for (const [base, hashedName] of Object.entries(needed)) {
    const saveName = stripHash(hashedName);
    const dest = path.join(CONFIG_DIR, saveName);

    const url = CLIENT_ROOT + 'src/assets/script/config/' + hashedName;
    try {
      console.log(`[下载] ${saveName} (${hashedName}) ...`);
      const data = await download(url);
      if (data.length < 200) {
        throw new Error(`文件过小 (${data.length} bytes)，可能是404页面`);
      }
      fs.writeFileSync(dest, data);
      console.log(`[完成] ${saveName} (${(data.length / 1024).toFixed(1)} KB)`);
      success++;
    } catch (err) {
      console.error(`[失败] ${saveName}: ${err.message}`);
      try {
        await new Promise(r => setTimeout(r, 1000));
        const data = await download(url);
        if (data.length < 200) throw new Error('重试仍失败');
        fs.writeFileSync(dest, data);
        console.log(`[重试成功] ${saveName}`);
        success++;
      } catch (err2) {
        console.error(`[重试失败] ${saveName}: ${err2.message}`);
        failed++;
      }
    }
  }

  console.log(`\n--- 完成 ---`);
  console.log(`下载: ${success}, 失败: ${failed}`);
}

main().catch(console.error);
