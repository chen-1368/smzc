import { useState } from "react";
import data from "./data/godwar.json";
import RoleTab from "./components/RoleTab";
import RideTab from "./components/RideTab";
import BossOverviewTab from "./components/BossOverviewTab";
import BossTab from "./components/BossTab";
import NeutralTab from "./components/NeutralTab";
import CrystalTab from "./components/CrystalTab";

const TABS = [
  { key: "role", label: "角色" },
  { key: "ride", label: "坐骑" },
  { key: "bossOverview", label: "魔王总览" },
  { key: "boss", label: "魔王等阶" },
  { key: "neutral", label: "中立怪" },
  { key: "crystal", label: "水晶" },
];

export default function App() {
  const [tab, setTab] = useState("role");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-700/50 px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-amber-400 tracking-wide">
              神魔战场数值查询
            </h1>
          </div>
        </div>
      </header>

      <nav className="flex gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`w-32 px-4 py-2 rounded-lg text-sm transition-all duration-200 whitespace-nowrap ${
              tab === t.key ? "tab-active" : "tab-inactive"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6">
        {tab === "role" && <RoleTab data={data} />}
        {tab === "ride" && <RideTab data={data} />}
        {tab === "bossOverview" && <BossOverviewTab data={data} />}
        {tab === "boss" && <BossTab data={data} />}
        {tab === "neutral" && <NeutralTab data={data} />}
        {tab === "crystal" && <CrystalTab data={data} />}
      </main>

      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        数据来源于游戏客户端配置 · 仅供参考
      </footer>
    </div>
  );
}
