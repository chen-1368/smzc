import { useState } from 'react'
import data from './data/godwar.json'
import RoleTab from './components/RoleTab'
import RideTab from './components/RideTab'
import BossOverviewTab from './components/BossOverviewTab'
import BossTab from './components/BossTab'
import NeutralTab from './components/NeutralTab'
import CrystalTab from './components/CrystalTab'

const TABS = [
  { key: 'role', label: '角色' },
  { key: 'ride', label: '坐骑' },
  { key: 'bossOverview', label: '魔王总览' },
  { key: 'boss', label: '魔王等阶' },
  { key: 'neutral', label: '中立怪' },
  { key: 'crystal', label: '水晶' },
]

export default function App() {
  const [tab, setTab] = useState('role')

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-amber-400">⚔ 神魔战场数值查询</h1>
        <p className="text-sm text-slate-400 mt-1">造梦无双 · 战场配置数据可视化</p>
      </header>

      <nav className="flex gap-2 px-6 py-3 border-b border-slate-800">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${tab === t.key ? 'tab-active' : 'tab-inactive'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="p-6">
        {tab === 'role' && <RoleTab data={data} />}
        {tab === 'ride' && <RideTab data={data} />}
        {tab === 'bossOverview' && <BossOverviewTab data={data} />}
        {tab === 'boss' && <BossTab data={data} />}
        {tab === 'neutral' && <NeutralTab data={data} />}
        {tab === 'crystal' && <CrystalTab data={data} />}
      </main>
    </div>
  )
}
