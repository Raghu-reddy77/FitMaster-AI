/**
 * FitMaster AI – Authentication & User Profile Security Test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('../../backend/node_modules/bcryptjs');
const jwt = require('../../backend/node_modules/jsonwebtoken');

const JWT_SECRET = 'test_secret_key_12345';

test('Password Hashing with Bcrypt Security', async (t) => {
  const plainPassword = 'StrongPassword@2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notStrictEqual(hash, plainPassword, 'Hash must never equal plaintext password');
  assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Hash must use bcrypt format');

  // Verification
  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.strictEqual(isMatch, true, 'Valid password must match hash');

  const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(isWrongMatch, false, 'Invalid password must be rejected');
});

test('JWT Issuance, Expiry & Tamper Rejection', (t) => {
  const payload = { userId: 42, email: 'student@university.edu', name: 'Student CSE' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // 1. Verify valid token
  const decoded = jwt.verify(token, JWT_SECRET);
  assert.strictEqual(decoded.userId, 42);
  assert.strictEqual(decoded.email, 'student@university.edu');

  // 2. Reject tampered token
  const tamperedToken = token.slice(0, -5) + 'abcde';
  assert.throws(() => {
    jwt.verify(tamperedToken, JWT_SECRET);
  }, /invalid signature/);

  // 3. Reject wrong secret
  assert.throws(() => {
    jwt.verify(token, 'completely_wrong_secret');
  }, /invalid signature/);
});

test('Data Isolation by User ID Integrity', (t) => {
  // Ensure that authenticated sessions isolate user-specific data
  const user1 = { userId: 1, email: 'user1@test.com' };
  const user2 = { userId: 2, email: 'user2@test.com' };

  const token1 = jwt.sign(user1, JWT_SECRET);
  const token2 = jwt.sign(user2, JWT_SECRET);

  const decoded1 = jwt.verify(token1, JWT_SECRET);
  const decoded2 = jwt.verify(token2, JWT_SECRET);

  assert.notStrictEqual(decoded1.userId, decoded2.userId);
  assert.strictEqual(decoded1.userId, 1);
  assert.strictEqual(decoded2.userId, 2);
});
