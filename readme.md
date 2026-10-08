# MESH 🕸️

MESH is an offline-first peer-to-peer communication app for Android.
It is designed to allow nearby devices to discover each other,
establish direct connections, and exchange messages without relying
on the internet or a central server.

## ✨ Features

- 🆔 Unique MESH device identity
- 📡 Nearby device discovery
- 🔗 Peer-to-peer connections
- 💬 One-to-one messaging
- 👥 Group communication
- 💾 Local message history
- 🔄 Offline/pending messages with retry
- 🕸️ Network/node visualization
- 🌐 Multi-hop communication *(planned)*
- 🔐 Device authentication & encryption *(planned)*

## 🛠️ Tech Stack

### Android Application

- Kotlin
- Jetpack Compose
- Room
- Kotlin Coroutines & Flow
- Android Nearby Device APIs
- MVVM + Repository Architecture

### Prototype

The initial UI/UX prototype was built using:

- TypeScript
- React / TSX
- CSS

The web prototype is used as the visual and interaction reference for the Android implementation.

> The final application is being developed in **Kotlin**.

## 🎨 Design

MESH follows a minimal, dark, radar-inspired interface.

| Element | Color |
|---|---|
| Background | `#120E0A` |
| Surface | `#201A14` |
| Primary | `#F59E0B` |
| Secondary | `#FB923C` |
| Success | `#4ADE80` |
| Warning | `#FBBF24` |
| Error | `#F87171` |
| Text | `#FEF3C7` |
| Muted | `#78716C` |

The interface focuses on network visibility, connection states,
device identity, and activity.

## 📱 Main Screens

### Home
- MESH network status
- Device identity
- Connected peer count
- Network visualization
- Recent activity
- Quick actions

### Nearby
- Discover nearby devices
- View connection status
- Connect/disconnect from peers

### Chats
- One-to-one conversations
- Group chats
- Message delivery states
- Pending/failed messages

### Profile
- MESH ID
- Device name
- Connection statistics
- Messages sent/received

### Settings
- Discovery preferences
- Privacy
- Messaging
- Appearance
- About


│
└── MainActivity.kt
