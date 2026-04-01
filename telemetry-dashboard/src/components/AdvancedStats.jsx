import React from 'react';

const AdvancedStats = ({ node }) => {
  // Logic: Extract stats from the history buffer (last 30 points)
  const data = node?.history || [];
  
  const avg = data.length 
    ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(1) 
    : 0;
  
  const max = data.length ? Math.max(...data) : 0;
  const min = data.length ? Math.min(...data) : 0;

  return (
    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-50">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rolling Avg</p>
        <p className="text-xl font-bold text-black">{avg}</p>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Signal</p>
        <p className="text-xl font-bold text-black">{max}</p>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Signal Floor</p>
        <p className="text-xl font-bold text-black">{min}</p>
      </div>
    </div>
  );
};

export default AdvancedStats;