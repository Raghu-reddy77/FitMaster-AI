/**
 * FitMaster AI – HTTP Server Initialization
 * Boots Express REST API, verifies database connection, and configures graceful shutdown.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { testConnection, pool } = require('./config/database');

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  console.log('====================================================');
  console.log('   FitMaster AI – Intelligent Nutrition Tracker   ');
  console.log('   Academic Full-Stack Node.js & Express Gateway   ');
  console.log('====================================================');

  // Verify database connectivity
  console.log('[System]: Verifying MySQL database connectivity...');
  const isDbConnected = await testConnection();

  if (!isDbConnected) {
    console.warn('[System Warning]: MySQL database is not connected or requires password configuration.');
    console.warn('[System Warning]: API will start, but database-dependent operations will wait for live DB.');
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server]: Node.js Express server is running on http://localhost:${PORT}`);
    console.log(`[Health]: Endpoint available at http://localhost:${PORT}/api/health`);
    console.log(`[Frontend]: UI hosted at http://localhost:${PORT}/`);
    console.log('====================================================');
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[Server]: Received ${signal}. Gracefully closing HTTP server and MySQL pools...`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('[Server]: MySQL connection pools closed. Clean exit.');
      } catch (err) {
        console.error('[Server Error]: Error closing MySQL pool:', err.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
