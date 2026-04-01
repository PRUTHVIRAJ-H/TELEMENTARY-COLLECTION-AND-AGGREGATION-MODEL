#include <stdio.h>
#include <winsock2.h> // Windows specific networking
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib") // Link the Winsock Library

#define SERVER_IP "192.168.235.22"
#define PORT 4210
#define DEVICE_ID "VIRTUAL_NODE_02"

int main() {
    WSADATA wsa;
    SOCKET sock;
    struct sockaddr_in server_addr;
    int sequence_number = 0;
    char payload[1024];

    // 1. Initialize Winsock (Required on Windows)
    if (WSAStartup(MAKEWORD(2,2), &wsa) != 0) {
        printf("Failed. Error Code : %d", WSAGetLastError());
        return 1;
    }

    // 2. Create Socket
    if ((sock = socket(AF_INET, SOCK_DGRAM, 0)) == INVALID_SOCKET) {
        printf("Could not create socket : %d", WSAGetLastError());
    }

    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr(SERVER_IP);
    server_addr.sin_port = htons(PORT);

    printf("🚀 [WINDOWS SIMULATOR ACTIVE] ID: %s\n", DEVICE_ID);

    while (1) {
        int simulated_val = (rand() % 1500) + 1500;
        sequence_number++;

        sprintf(payload, "%s,%d,%d", DEVICE_ID, sequence_number, simulated_val);

        sendto(sock, payload, strlen(payload), 0, (struct sockaddr *)&server_addr, sizeof(server_addr));

        printf("Sent: %s\n", payload);
        Sleep(1000); // Windows uses Sleep(ms) with capital S
    }

    closesocket(sock);
    WSACleanup();
    return 0;
}