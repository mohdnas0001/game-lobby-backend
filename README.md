# Game Lobby Backend

Backend for a game lobby system, built with Express and MongoDB. Handles JWT authentication, game session management, and leaderboard functionality.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm

### Installation
### Backend Setup
1. **Clone the Backend Repository**:
   ```bash
   git clone https://github.com/your-username/game-lobby-backend.git
   cd game-lobby-backend

2. **Install Dependencies**:
   ```bash
   yarn install

3. **Configure Environment Variabless**:
Create a .env file in the backend root:
```bash
    PORT=5000
    MONGODB_URI=mongodb://
    JWT_SECRET=your_jwt_secret_here
```
Replace MONGODB_URI with your MongoDB connection string.

Generate a secure JWT_SECRET.

4. **Run the Backend Locally**:
Create a .env file in the backend root:
```bash
yarn start
```
The backend will run on http://localhost:5000.
