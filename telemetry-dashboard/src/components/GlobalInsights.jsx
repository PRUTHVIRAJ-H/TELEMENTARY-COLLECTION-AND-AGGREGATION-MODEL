import React from 'react';

const StatCard = ({ label, value, color, subtext }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <p className={`text-5xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
    <p className="text-[10px] font-bold text-slate-200 uppercase mt-4">{subtext}</p>
  </div>
);

export default function GlobalInsights({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <StatCard label="Field Average" value={`${stats.avg}`} color="text-[#0071e3]" subtext="Aggregate Mean" />
      <StatCard label="Wettest Spot" value={`${stats.min}`} color="text-red-500" subtext="Minimum Peak" />
      <StatCard label="Dryest Spot" value={`${stats.max}`} color="text-green-500" subtext="Maximum Peak" />
      <StatCard label="Active Fleet" value={stats.count} color="text-black" subtext="Device Count" />
    </div>
  );
}