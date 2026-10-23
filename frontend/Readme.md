# Recio - Record Studio-Quality Podcasts and Videos from Anywhere

## How to Run

1. Clone the repository
2. Navigate to the frontend
   ```cd frontend ```

3. Add your LiveKit credentials to the .env file, then install dependencies
 ```npm install ```
4. Make sure the backend is running:
https://github.com/batchu5/recio-backend

5. Start the development server
``` npm run dev ```
## Features added (with love❤️)
1. Built a Google Meet–like video platform with real-time calls, screen sharing, recording, and dynamic layouts
using LiveKit (WebRTC).
2. Engineered a fault-tolerant, chunk-based recording pipeline using IndexedDB buffering to prevent data loss
during network interruptions and ensure reliable uploads.
3. Designed an asynchronous BullMQ-driven processing system to merge multi-participant streams, generate final
recordings, and notify users via email.

## Tech Stack 
React, TypeScript, TailwindCSS, FramerMotion, Node.js, LiveKit SFU, Bullmq

## Architecture 
![Architecture](architecture.png)
