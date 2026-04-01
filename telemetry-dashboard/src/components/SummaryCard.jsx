import React from 'react';

const SummaryCard = ({ node }) => {
  const formatTime = (isoString) => {
    // FIX: Python sends a string or datetime object. 
    // If it's empty, we show a pulse/pending state.
    if (!isoString) return "WAITING..."; 
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) { return "SYNC ERR"; }
  };

  return (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Metadata</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-50">
          <span className="text-xs font-bold text-slate-400">Latest Data Received on:</span>
          {/* FIX: Changed node.last_updated to node.last_seen */}
          <span className="text-xs font-black">{formatTime(node?.last_seen)}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-slate-50">
          <span className="text-xs font-bold text-slate-400">Node IP</span>
          <span className="text-xs font-black">{node?.ip || "Allocating..."}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">Stream</span>
          <span className="bg-[#e8f3ff] text-[#0071e3] px-2 py-0.5 rounded text-[9px] font-black italic">UDP / ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;