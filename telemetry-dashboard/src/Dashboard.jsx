import React, { useState, useEffect } from 'react';

function ClientManager() {
  const [clients, setClients] = useState([]);

  // Fetch the list of allowed IDs from Python
  const fetchClients = () => {
    fetch('http://localhost:5000/api/clients')
      .then(res => res.json())
      .then(data => setClients(data));
  };

  useEffect(() => { fetchClients(); }, []);

  const deleteClient = (id) => {
    fetch(`http://localhost:5000/api/clients/${id}`, { method: 'DELETE' })
      .then(() => fetchClients()); // Refresh the list
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
      <h2 className="text-2xl font-bold mb-4">Device Inventory</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-500 border-b border-slate-800">
            <th className="pb-2">Device ID</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(id => (
            <tr key={id} className="border-b border-slate-800/50">
              <td className="py-4 font-mono">{id}</td>
              <td><span className="text-green-500 text-xs">AUTHORIZED</span></td>
              <td>
                <button 
                  onClick={() => deleteClient(id)}
                  className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  Revoke Access
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}