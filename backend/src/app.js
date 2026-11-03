/**
 * FitMaster AI – Primary Express Application Configuration
 * Integrates CORS, JSON parsers, static client assets, REST API routers, and error middleware.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security and Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets (HTML, CSS, JS, Images, Icons)
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// API Route Gateway
app.use('/api', apiRoutes);

// Fallback route for API 404s
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Serve frontend index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
