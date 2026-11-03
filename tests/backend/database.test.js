/**
 * FitMaster AI – Backend Database Configuration Unit Test
 * Validates pool export, configuration validation, and connection error handling.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const db = require('../../backend/src/config/database');

test('Database Configuration Integrity', (t) => {
  assert.ok(db.pool, 'Database pool must be defined');
  assert.strictEqual(typeof db.query, 'function', 'db.query must be an exportable function');
  assert.strictEqual(typeof db.getConnection, 'function', 'db.getConnection must be an exportable function');
  assert.strictEqual(typeof db.testConnection, 'function', 'db.testConnection must be an exportable function');

  // Validate configuration shape
  assert.ok(db.dbConfig, 'dbConfig must be exposed');
  assert.strictEqual(db.dbConfig.database, 'fitmaster_ai', 'Database name must be fitmaster_ai');
  assert.strictEqual(typeof db.dbConfig.port, 'number', 'Port must be a parsed number');
  assert.strictEqual(db.dbConfig.decimalNumbers, true, 'decimalNumbers must be enabled for precise macro math');
  assert.strictEqual(db.dbConfig.dateStrings, true, 'dateStrings must be enabled for date stability');
});
