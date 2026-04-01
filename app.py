import socket
import sqlite3
import time
import threading
from datetime import datetime
from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

DB_NAME = 'telemetry.db'
UDP_PORT = 4210
# Source of Truth for Dashboard & Inventory
active_data = {} 

def init_db():
    conn = sqlite3.connect(DB_NAME)
    conn.execute('CREATE TABLE IF NOT EXISTS history (device_id TEXT, timestamp DATETIME, value REAL)')
    conn.commit()
    conn.close()

def calculate_global_stats():
    # Only include nodes that talked to us in the last 30 seconds
    current_time = datetime.now()
    active_nodes = [
        node for node in active_data.values() 
        if (current_time - node["last_seen"]).total_seconds() < 30
    ]
    
    if not active_nodes:
        return {"avg": 0, "max": 0, "min": 0, "count": 0}

    current_values = [n["history"][-1] for n in active_nodes if n["history"]]
    
    return {
        "avg": round(sum(current_values) / len(current_values), 1) if current_values else 0,
        "max": max(current_values) if current_values else 0,
        "min": min(current_values) if current_values else 0,
        "count": len(active_nodes) # This fixes your '2' count issue
    }
    

# --- API ROUTES ---

@app.route('/api/clients', methods=['GET'])
def get_clients():
    # Inventory looks here to see what's live
    return jsonify(list(active_data.keys()))

@app.route('/api/clients/<id>', methods=['DELETE'])
def remove_client(id):
    if id in active_data:
        del active_data[id]
        socketio.emit('node_removed', id)
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "not found"}), 404

@app.route('/api/history/<id>', methods=['GET'])
def get_history(id):
    offset = int(request.args.get('offset', 0))
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # We use -offset to look back in time. Offset 0 = Last 1 hour.
    query = """
        SELECT strftime('%H:%M', timestamp) as t, value 
        FROM history 
        WHERE device_id = ? 
        AND timestamp > datetime('now', ?, '-1 hour')
        ORDER BY timestamp ASC
    """
    # Fix: Correcting the interval logic
    cursor.execute(query, (id, f'-{offset} hours'))
    rows = cursor.fetchall()
    conn.close()
    
    # Crucial: The keys 'time' and 'val' must match the AreaChart dataKey
    return jsonify([{"time": r[0], "val": r[1]} for r in rows])

# --- UDP & BACKGROUND LOGIC ---

def save_to_db():
    """Background task to persist data every 30 seconds"""
    while True:
        time.sleep(30)
        if not active_data: continue
        
        conn = sqlite3.connect(DB_NAME)
        for d_id, node in active_data.items():
            if node["history"]:
                # FIX: Use .isoformat() to pass a string instead of a datetime object
                timestamp_str = datetime.now().isoformat() 
                conn.execute(
                    'INSERT INTO history (device_id, timestamp, value) VALUES (?, ?, ?)',
                    (d_id, timestamp_str, node["history"][-1])
                )
        conn.commit()
        conn.close()
    

def udp_listener():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('0.0.0.0', UDP_PORT))
    print(f"📡 Fleet Engine listening on UDP:{UDP_PORT}")
    
    while True:
        data, addr = sock.recvfrom(1024)
        print(data)
        try:
            # Expected format: "DeviceID,Seq,Value"
            msg = data.decode('utf-8').split(',')
            d_id, seq, val = msg[0].strip(), int(msg[1]), float(msg[2])

            if d_id not in active_data:
                active_data[d_id] = {"history": [], "ip": addr[0]}

            node = active_data[d_id]
            node["history"].append(val)
            node["last_seen"] = datetime.now()
            if len(node["history"]) > 30: node["history"].pop(0)

            # CRITICAL: This payload fuels SummaryCard and GlobalInsights
            socketio.emit('telemetry_update', {
                "id": d_id,
                "current": val,
                "seq": seq,
                "ip": addr[0],
                "history": node["history"],
                "last_seen": datetime.now().isoformat(), # Fixed for SummaryCard
                "field_stats": calculate_global_stats() # Fixed for GlobalInsights
            })
        except Exception as e:
            print(f"UDP Error: {e}")

if __name__ == '__main__':
    init_db()
    # Thread 1: UDP Listener
    threading.Thread(target=udp_listener, daemon=True).start()
    # Thread 2: Database Saver
    threading.Thread(target=save_to_db, daemon=True).start()
    
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)