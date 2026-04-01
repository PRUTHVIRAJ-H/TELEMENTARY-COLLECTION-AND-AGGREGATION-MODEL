import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Component Imports
import SummaryCard from './components/SummaryCard';
import AdvancedStats from './components/AdvancedStats';
import GlobalInsights from './components/GlobalInsights';

const socket = io('http://localhost:5000');

// --- Inventory Management (Sync Fixed) ---
const Manage = () => {
  const [list, setList] = useState([]);
  
  const refresh = useCallback(() => {
    fetch('http://localhost:5000/api/clients')
      .then(r => r.json())
      .then(setList)
      .catch(() => setList([]));
  }, []);

  useEffect(() => { 
    refresh(); 
    const interval = setInterval(refresh, 3000); 
    return () => clearInterval(interval);
  }, [refresh]);

  const remove = (id) => {
    fetch(`http://localhost:5000/api/clients/${id}`, { method: 'DELETE' }).then(() => refresh());
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h2 className="text-5xl font-black text-black mb-10 tracking-tighter text-center">Inventory</h2>
      <div className="space-y-4">
        {list.length > 0 ? list.map(id => (
          <div key={id} className="flex justify-between items-center p-8 bg-white rounded-[30px] border border-slate-100 shadow-sm">
            <span className="text-xl font-bold text-slate-900 tracking-tight">{id}</span>
            <button onClick={() => remove(id)} className="text-[#0071e3] hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all">Revoke Access</button>
          </div>
        )) : <p className="text-center p-20 text-slate-400 bg-white rounded-[40px] border-2 border-dashed border-slate-100 font-bold uppercase text-[10px]">No active nodes found.</p>}
      </div>
    </div>
  );
};

// --- History Persistence Engine (Fixed Graph Sync) ---
const HourlyAnalysis = ({ id, livePulse }) => {
  const [history, setHistory] = useState([]);
  const [offset, setOffset] = useState(0);

  const fetchHistory = useCallback(() => {
    fetch(`http://localhost:5000/api/history/${id}?offset=${offset}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
      })
      .catch(err => console.error("Persistence Error:", err));
  }, [id, offset]);

  // TRIGGER: Refresh history when livePulse (current reading) changes 
  // and we are on the "Live" (offset 0) view.
  useEffect(() => { 
    fetchHistory(); 
  }, [fetchHistory, livePulse, offset]); 

  return (
    <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-black text-[10px] font-black uppercase tracking-widest">Persistence Engine</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
            {offset === 0 ? "Last 60m" : `${offset}h ago`}
          </p>
        </div>
        <div className="flex gap-2 bg-[#f5f5f7] p-1 rounded-xl text-[10px] font-black">
          <button onClick={() => setOffset(o => o + 1)} className="px-4 py-2 hover:bg-white rounded-lg uppercase">← Prev</button>
          <button disabled={offset === 0} onClick={() => setOffset(0)} className="px-4 py-2 rounded-lg disabled:opacity-20 hover:bg-white uppercase">Live</button>
        </div>
      </div>
      <div className="h-48 w-full">
        {history.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke="#0071e3" 
                fillOpacity={1} 
                fill="url(#colorVal)" 
                strokeWidth={2} 
                isAnimationActive={false} 
              />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 4095]} />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ display: 'none' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Collecting Data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Node Detail View ---
const ClientDetail = ({ nodes }) => {
  const { id } = useParams();
  const node = nodes[id];

  if (!node) return <div className="p-20 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest">Awaiting Handshake...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="flex justify-between items-end mb-10 pb-6 border-b border-slate-200">
        <div><h1 className="text-5xl font-extrabold tracking-tighter">{id}</h1><p className="text-slate-500 text-sm font-medium">{node.ip}</p></div>
        <Link to="/" className="bg-black text-white px-8 py-2.5 rounded-full font-bold text-[10px] uppercase">Close</Link>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Real-Time Signal</h3>
            <div className="h-80 w-full bg-[#fbfbfd] p-4 rounded-3xl border border-slate-100">
              <ResponsiveContainer>
                <LineChart data={node.history.map((v, i) => ({ i, v }))}>
                  <Line type="monotone" dataKey="v" stroke="#0071e3" strokeWidth={6} dot={false} isAnimationActive={false} />
                  <YAxis domain={[0, 4095]} hide />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <AdvancedStats node={node} />
          </div>
          {/* Historical Graph Integration */}
          <HourlyAnalysis id={id} livePulse={node.current} />
        </div>
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Level</p>
            <p className="text-8xl font-black tracking-tighter">{node.current}</p>
          </div>
          {/* Metadata Sidebar */}
          <SummaryCard node={node} />
        </div>
      </div>
    </div>
  );
};

// --- App Entry Point ---
export default function App() {
  const [nodes, setNodes] = useState({});
  const [fieldStats, setFieldStats] = useState({ avg: 0, max: 0, min: 0, count: 0 });

  useEffect(() => {
  // 1. Listen for updates
  socket.on('telemetry_update', data => {
    if (data.field_stats) setFieldStats(data.field_stats);
    setNodes(prev => ({ ...prev, [data.id]: data }));
  });

  // 2. Add a Heartbeat Check (Every 5 seconds)
  const cleanup = setInterval(() => {
    setNodes(prev => {
      const now = new Date();
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach(id => {
        const lastSeen = new Date(next[id].last_seen);
        // If no data for 45 seconds, remove from dashboard
        if (now - lastSeen > 45000) { 
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, 5000);

  return () => {
    socket.off('telemetry_update');
    clearInterval(cleanup);
  };
}, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#f5f5f7] text-slate-900 font-sans selection:bg-[#0071e3]/10">
        <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 p-4 border-b border-slate-100">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4 font-black tracking-tighter text-xl">
            <Link to="/">FLEETMANAGER</Link>
            <div className="flex gap-8 text-[10px] uppercase tracking-widest text-slate-400">
              <Link to="/" className="hover:text-black transition-colors">Dashboard</Link>
              <Link to="/manage" className="hover:text-black transition-colors">Inventory</Link>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={
            <div className="max-w-6xl mx-auto px-6 py-12">
              {/* Top Global Stats Bar */}
              <GlobalInsights stats={fieldStats} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {Object.values(nodes).map(n => (
                  <Link to={`/client/${n.id}`} key={n.id} className="bg-white p-10 rounded-[45px] border border-slate-100 hover:shadow-2xl transition-all group relative">
                    <div className="absolute top-8 right-8">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse"></div>
                    </div>
                    <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{n.id}</h3>
                    <p className="text-7xl font-black tracking-tighter group-hover:text-[#0071e3] transition-colors">{n.current}</p>
                    <p className="mt-8 text-[10px] font-black text-[#0071e3] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Analytics →</p>
                    <p className="mt-3.75 text-[10px] font-black text-slate-200 uppercase tracking-widest group-hover:hidden">System Nominal</p>
                  </Link>
                ))}
              </div>
            </div>
          } />
          <Route path="/manage" element={<Manage />} />
          <Route path="/client/:id" element={<ClientDetail nodes={nodes} />} />
        </Routes>
      </div>
    </Router>
  );
}