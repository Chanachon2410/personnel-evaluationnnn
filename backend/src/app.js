const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Personnel Evaluation System API',
      version: '1.0.0',
      description: 'API for Personnel Evaluation System',
    },
    servers: [
      {
        url: 'http://localhost:5000',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
const app = express();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const evaluateeRoutes = require('./routes/evaluateeRoutes');
const evaluatorRoutes = require('./routes/evaluatorRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for evidence
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/api/debug-check', (req, res) => res.json({ status: 'OK', message: 'Server is using latest code!' }));
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', evaluateeRoutes);
app.use('/api/evaluator', evaluatorRoutes);
app.use('/api/reports', reportRoutes);

// Personnel Evaluation System API
app.get('/', (req, res) => {
  res.json({ message: 'Personnel Evaluation System API' });
});

module.exports = app;
