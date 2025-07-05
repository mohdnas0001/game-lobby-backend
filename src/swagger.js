const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Lobby API',
      version: '1.0.0',
      description: 'API for managing game lobby with JWT authentication and MongoDB Atlas',
    },
    servers: [
      {
        url: 'https://game-lobby-backend-9d4k.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/domain/auth/routes/authRoutes.js',
    './src/domain/game/routes/gameRoutes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;