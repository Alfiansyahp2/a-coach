const assert = require('assert');
const path = require('path');
const { pathToFileURL } = require('url');
require('dotenv').config({ path: '.env.local' });

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 RUNNING BOLA AUTHORIZATION & SESSION SECURITY VERIFICATION SUITE');
  console.log('======================================================================');

  const modulePath = path.resolve(__dirname, '../../src/lib/auth/authGuard.ts');
  const imported = await import(pathToFileURL(modulePath).href);
  const authGuard = imported.default || imported;
  const { signSessionToken, verifySessionToken, verifyUserAuthorization } = authGuard;

  const defaultUser = '00000000-0000-0000-0000-000000000001';
  const attackerTargetUser = '00000000-0000-0000-0000-000000000099';

  console.log('\n--- 1. Cryptographic Session Token Integrity ---');
  const token = signSessionToken(defaultUser);
  assert(token.includes('.'), 'Session token should contain signature delimiter');
  console.log('  ✅ PASS: Token signed successfully:', token);

  const verified = verifySessionToken(token);
  assert.strictEqual(verified, defaultUser, 'Token should verify to defaultUser');
  console.log('  ✅ PASS: Valid token verified accurately');

  const tamperedToken = `${defaultUser}.tampered_signature_12345`;
  const tamperedVerified = verifySessionToken(tamperedToken);
  assert.strictEqual(tamperedVerified, null, 'Tampered token must be rejected');
  console.log('  ✅ PASS: Tampered token safely rejected (null)');

  console.log('\n--- 2. BOLA Defense: Broken Object Level Authorization Safeguard ---');
  // Scenario A: Legitimate request matching session
  const mockReq = {
    headers: new Headers(),
    cookies: { get: () => undefined },
  };
  const legitResult = verifyUserAuthorization(mockReq, defaultUser);
  assert(legitResult.authorized === true, 'Legitimate request matching authenticated user must be authorized');
  assert.strictEqual(legitResult.userId, defaultUser, 'Authorized userId must be defaultUser');
  console.log('  ✅ PASS: Authorized user access granted');

  // Scenario B: Legitimate request without explicit targetUserId (auto-bind)
  const autoBindResult = verifyUserAuthorization(mockReq, null);
  assert(autoBindResult.authorized === true, 'Request without explicit target must auto-bind to authenticated user');
  assert.strictEqual(autoBindResult.userId, defaultUser, 'Auto-bound userId must be defaultUser');
  console.log('  ✅ PASS: Unspecified target auto-binds to authenticated user');

  // Scenario C: Malicious BOLA attack attempting to manipulate another user
  const bolaResult = verifyUserAuthorization(mockReq, attackerTargetUser);
  assert(bolaResult.authorized === false, 'BOLA violation must be BLOCKED');
  assert(bolaResult.response !== undefined, 'BOLA violation must return an explicit HTTP response');
  assert.strictEqual(bolaResult.response.status, 403, 'BOLA violation must return HTTP 403 Forbidden');
  console.log('  ✅ PASS: BOLA attack explicitly blocked with HTTP 403 Forbidden');

  console.log('\n======================================================================');
  console.log('🏁 BOLA AUTHORIZATION SUITE: ALL TESTS PASSED');
  console.log('======================================================================');
}

runTests().catch((err) => {
  console.error('❌ BOLA test failure:', err);
  process.exit(1);
});
