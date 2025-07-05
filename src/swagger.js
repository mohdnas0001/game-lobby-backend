const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

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
    './domain/auth/routes/authRoutes.js',
    './domain/game/routes/gameRoutes.js',
  ],
};

// Debug file paths
options.apis.forEach(file => {
  const absolutePath = path.resolve(__dirname, file);
  console.log(`Checking Swagger file: ${absolutePath}`);
  if (fs.existsSync(absolutePath)) {
    console.log(`File exists: ${absolutePath}`);
  } else {
    console.error(`File not found: ${absolutePath}`);
  }
});

const swaggerSpec = swaggerJsdoc(options);
console.log('Swagger spec operations:', swaggerSpec.paths || 'No paths defined');

module.exports = swaggerSpec;