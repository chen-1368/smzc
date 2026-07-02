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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-700/50 px-10 py-5 bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-amber-400 whitespace-nowrap">
            神魔战场数值查询
          </h1>

          <nav className="hidden md:flex items-center">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`nav-tab relative px-3 py-2 text-sm whitespace-nowrap ${
                  tab === t.key ? "nav-tab-active" : "nav-tab-inactive"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-400 rounded-t" />
                )}
              </button>
            ))}
          </nav>

          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-slate-300 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </header>

      {/* 右侧抽屉菜单 */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* 左侧遮罩 */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMenuOpen(false)}
        />

        {/* 右侧菜单面板 */}
        <nav
          className={`absolute top-0 right-0 h-full w-52 bg-slate-900 shadow-2xl border-l border-slate-700/50 flex flex-col pt-6 px-6 transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setMenuOpen(false);
              }}
              className={`text-left py-3 text-sm border-b border-slate-700/30 ${
                tab === t.key
                  ? "text-amber-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 p-6 main-content">
        {tab === "role" && <RoleTab data={data} />}
        {tab === "ride" && <RideTab data={data} />}
        {tab === "bossOverview" && <BossOverviewTab data={data} />}
        {tab === "boss" && <BossTab data={data} />}
        {tab === "neutral" && <NeutralTab data={data} />}
        {tab === "crystal" && <CrystalTab data={data} />}
      </main>
    </div>
  );
}
