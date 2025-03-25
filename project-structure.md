nanobots-io/
├── client/                  # Frontend
│   ├── public/              # Static assets
│   │   ├── assets/          # Game assets (sprites, sounds)
│   │   └── index.html       # Main HTML file
│   └── src/                 # Frontend source code
│       ├── game/            # Phaser game components
│       ├── components/      # UI components
│       └── services/        # API services
├── server/                  # Backend
│   ├── controllers/         # Request handlers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── socket/              # WebSocket handling
│   ├── utils/               # Utility functions
│   └── index.js             # Server entry point
└── shared/                  # Shared code between client and server
    └── constants.js         # Shared constants 