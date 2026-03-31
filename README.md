# FLEETMANAGER: Real-Time IoT Telemetry Dashboard

A high-performance observability platform for ESP32-C3 edge nodes. This system uses a custom UDP-based transport layer to stream telemetry data (such as soil humidity) to a MERN-style dashboard with sub-millisecond local latency.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph "Edge Layer (ESP32-C3)"
        A[Soil Sensor] -->|Analog Read| B(ADC 12-bit)
        B -->|CSV Packet| C[UDP Client]
    end

    subgraph "Transport Layer (WiFi/UDP)"
        C -->|Port 4210| D{Windows Firewall}
    end

    subgraph "Backend Engine (Python/Flask)"
        D -->|Allow| E[UDP Listener Thread]
        E -->|Sequence Analysis| F[Socket.io Server]
        E -->|Throttled 60s| G[(SQLite DB)]
    end

    subgraph "Frontend Dashboard (React)"
        F -->|Real-time Push| H[Dashboard Card]
        H -->|Gap Detection| I[Packets Dropped Counter]
        G -->|REST API| J[Hourly History Graph]
    end
```
