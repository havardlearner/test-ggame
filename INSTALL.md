# NanoBots.io Installation Guide

## Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or Atlas)

## Setting Up Environment Variables

### Server (.env in root directory) 

## Installation Steps

1. Clone the repository

git clone https://github.com/yourusername/nanobots-io.git
cd nanobots-io

2. Install dependencies for both server and client

npm run install-all

3. Generate placeholder game assets

npm run generate-assets

4. Start the development server

npm run dev

The game will be accessible at http://localhost:5176
The server API will be available at http://localhost:8080

## Building for Production

npm run build

This will create a production build in the client/dist directory that can be served with the Express server.

## Game Features

1. Real-time multiplayer gameplay
2. Energy collection mechanics
3. Player growth and progression
4. In-game chat system
5. User authentication and profiles
6. Leaderboards and statistics tracking

The game uses:
- React for the UI
- Phaser for the game engine
- Socket.io for real-time communication
- MongoDB for data storage
- Express for the backend API 