# 📄 Collab Doc Editor

A real-time collaborative text editor built using **Angular**, **Spring Boot**, **WebSockets**, and **Quill.js**. It features **Operational Transformation (OT)** for conflict resolution, **live cursor presence**, and **active users tracking** using **Supabase**, enabling smooth and consistent multi-user editing experiences.

---

<img width="1200" height="800" alt="Screenshot 2025-10-28 at 9 25 10 AM" src="https://github.com/user-attachments/assets/c689fae3-2be9-4ad2-9bc6-ee9866e1d18d" />

##


<img width="1200" height="800" alt="Screenshot 2025-10-28 at 9 20 24 AM" src="https://github.com/user-attachments/assets/c69c33f2-d9c5-4101-a2a2-f7f812422968" />

##

<img width="718" height="761" alt="Screenshot 2025-10-28 at 9 33 19 AM" src="https://github.com/user-attachments/assets/c33bb6b5-6849-4ed8-bb47-d3238bbf66e2" />


## 🚀 Features

- Real-time collaborative editing
- Conflict resolution using Operational Transformation
- Live cursor presence across users
- Active user tracking with Supabase Realtime
- Clean and responsive UI using Quill.js

---

## 🧩 Tech Stack

### **Frontend**
- **Framework:** Angular (SSR)
- **Realtime Transport:** Ably Realtime (WebSockets)
- **State Management:** RxJS + Custom OT Handler
- **UI:** TailwindCSS + Angular Material
- **Auth:** Firebase Authentication
- **Presence Tracking:** Supabase Realtime

### **Backend**
- **Framework:** Spring Boot (Java)
- **Collaboration Engine:** Operational Transformation (OTProcessor)
- **Messaging:** Ably Realtime (for broadcasting edits)
- **Inter-Service Communication:** Apache Kafka
- **Database:** MongoDB Atlas (for documents, metadata, and versions)
- **Auth Integration:** Firebase Auth
- **Presence & Collaboration Data:** Supabase Realtime

### **Microservices**
- **Thumbnail Service:** Node.js + Puppeteer  
  - Consumes Kafka events to generate document thumbnails  
  - Stores rendered thumbnails in Google Cloud Storage (GCS)



## 🏗️ Architecture Overview

```mermaid
graph TD
  subgraph Client
    FE[Angular Editor UI]
    WS[ WebSocket Client]
  end

  subgraph Backend
    BE[Spring Boot Backend]
    OT[OT Processor]
    DB[Database]
  end

  subgraph Cloud
    AB[Ably Realtime Service]
  end

  FE -->|User edits| WS
  WS -->|Publish operation| AB
  AB -->|Forward operation| BE
  BE -->|Transform & persist| OT
  OT -->|Save updated doc| DB
  OT -->|Send transformed op| BE
  BE -->|Broadcast to clients| AB
  AB -->|Send update| WS
  WS -->|Apply update| FE
```
 
```
---

## 📦 Setup Instructions

### Prerequisites
- Node.js v18 or higher
- Git

### Steps to Run Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd collab-doc-editor

# Install dependencies
npm install

# Start the frontend server
npm start
```
---
