#include <WiFi.h>
#include <WiFiUdp.h>

// --- Configuration ---
const char* ssid = "PK";
const char* password = "1234567866";
const char* laptopIP = "10.131.15.175"; // Double check via ipconfig tomorrow!
const int port = 4210;

// --- System Variables ---
WiFiUDP udp;
int sequenceNumber = 0; // Increments every packet
String deviceID = "ESP_NODE_01"; // Unique ID for this client

void setup() {
  Serial.begin(115200);
  
  // 1. Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[NODE ACTIVE]");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // 2. Read Sensor Data (GPIO 2)
  int sensorValue = analogRead(2);
  
  // 3. Increment Sequence for Tracking
  sequenceNumber++;

  // 4. Construct Structured Payload: "ID,Sequence,Value"
  // This satisfies the "Distributed Clients" and "Sequence Tracking" requirement.
  String payload = deviceID + "," + String(sequenceNumber) + "," + String(sensorValue);

  // 5. Send via UDP
  udp.beginPacket(laptopIP, port);
  udp.print(payload);
  udp.endPacket();

  // 6. Local Debugging
  Serial.print("Sent: ");
  Serial.println(payload);

  // 7. High-Rate Frequency (Adjust as needed)
  delay(1000); // Sends data every 1 second
}