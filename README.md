# TELEMENTARY-COLLECTION-AND-AGGREGATION-MODEL

graph TD
    %% Layer 1: The Edge
    subgraph "1. TELEMETRY (Physical Layer)"
        A[Soil Moisture Sensor] -- Analog Signal --> B[ESP32 Microcontroller]
    end

    %% Layer 2: The Transport
    subgraph "2. COLLECTION (Network Layer)"
        B -- WiFi / MQTT Publish --> C{MQTT Broker}
        C -- Data Stream --> D[Python/Node-RED Script]
    end

    %% Layer 3: The Brain
    subgraph "3. AGGREGATION (Processing Layer)"
        D -- "Windowing (Average)" --> E[Noise Filter]
        E -- "Threshold Check" --> F[Decision Logic]
    end

    %% Layer 4: The System
    subgraph "4. SYSTEM OUTPUT (Application Layer)"
        F -- Store --> G[(Time-Series DB)]
        G -- Visualize --> H[Grafana Dashboard]
        F -- Alert --> I[Water Pump / Notification]
    end

    %% Styling
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style D fill:#dfd,stroke:#333,stroke-width:2px
    style G fill:#ffd,stroke:#333,stroke-width:2px
