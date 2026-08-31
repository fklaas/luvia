const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function main() {
  const root = path.resolve(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'auth', 'session.js'), 'utf8');
  let resolveFreshUser;
  let getUserCalls = 0;
  const initialUser = { id: 'user-1', email: 'cached@example.test', identities: [{ provider: 'email' }] };
  const freshUser = { ...initialUser, email: 'fresh@example.test', email_confirmed_at: '2026-08-31T08:00:00.000Z' };
  const initialSession = { access_token: 'signed-local-token', user: initialUser };
  const context = vm.createContext({
    window: {},
    document: { dispatchEvent() {} },
    CustomEvent: class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    console,
    Promise,
    Map,
    Set,
    Object,
    Array,
    String,
    Boolean
  });
  vm.runInContext(source, context);
  const client = { auth: {
    async getSession() { return { data: { session: initialSession }, error: null }; },
    getUser() {
      getUserCalls += 1;
      return new Promise(resolve => { resolveFreshUser = resolve; });
    },
    onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; }
  } };

  const initResult = await Promise.race([
    context.window.LuviaAuth.init(client),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Auth init waited for remote getUser()')), 100))
  ]);
  assert.equal(initResult.loading, false, 'cached signed session must finish initial Auth state immediately');
  assert.equal(initResult.authenticated, true);
  assert.equal(initResult.email, 'cached@example.test');
  assert.equal(getUserCalls, 1, 'fresh user check must still be launched once in the background');

  resolveFreshUser({ data: { user: freshUser }, error: null });
  await new Promise(resolve => setTimeout(resolve, 0));
  const refreshed = context.window.LuviaAuth.getState();
  assert.equal(refreshed.email, 'fresh@example.test', 'background refresh must merge the server user into the active session');
  assert.equal(refreshed.lastEvent, 'USER_REFRESHED');
  assert.equal(refreshed.authenticated, true);

  console.log('M16.5AB cached-session first paint with background user refresh: PASS');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
