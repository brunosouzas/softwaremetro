/** build-command / Writes / "Font server on loopback", in process: while withLoopbackServers runs,
 * every form of Server#listen that names no host binds 127.0.0.1; a host, a pipe path or a handle is
 * left alone; the original listen is back afterwards, also when the build throws. The real build
 * is in test/integration/build.test.ts ("Font server on loopback"). */
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer as createHttpServer } from 'node:http';
import { createServer, Server, type AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { LOOPBACK, loopbackListenArgs, withLoopbackServers } from '../../src/site/loopback.js';

const close = (server: Server) => new Promise<void>(resolve => server.close(() => resolve()));

/** Listen inside the guard with `listen`, then return the bound address and close the server. */
async function bound(listen: (server: Server, done: () => void) => void, server: Server = createServer()): Promise<AddressInfo | string | null> {
  return withLoopbackServers(async () => {
    await new Promise<void>((resolve, reject) => { server.once('error', reject); listen(server, resolve); });
    const address = server.address();
    await close(server);
    return address;
  });
}

describe('No host binds 127.0.0.1', () => {
  const forms: [string, (server: Server, done: () => void) => void][] = [
    ['listen()', (server, done) => { server.once('listening', done); server.listen(); }],
    ['listen(cb)', (server, done) => server.listen(done)],
    ['listen(0)', (server, done) => { server.once('listening', done); server.listen(0); }],
    ['listen(0, cb)', (server, done) => server.listen(0, done)],
    ['listen("0", cb), a port string', (server, done) => (server.listen as (...a: unknown[]) => Server)('0', done)],
    ['listen("0x0", cb), a port string Node reads with Number()', (server, done) => (server.listen as (...a: unknown[]) => Server)('0x0', done)],
    ['listen(0, "", cb), an empty host', (server, done) => server.listen(0, '', done)],
    ['listen(0, 511, cb), with a backlog', (server, done) => server.listen(0, 511, done)],
    ['listen(null, cb)', (server, done) => (server.listen as (...a: unknown[]) => Server)(null, done)],
    ['listen({ port: 0 })', (server, done) => { server.once('listening', done); server.listen({ port: 0 }); }],
    ['listen({ port: 0 }, cb)', (server, done) => server.listen({ port: 0 }, done)],
  ];
  test.each(forms)('%s', async (_, listen) => {
    const address = await bound(listen) as AddressInfo;
    expect(address.address).toBe(LOOPBACK);
    expect(address.port).toBeGreaterThan(0);
  });

  test('an http server, as the Fonts API opens', async () => {
    const address = await bound((server, done) => server.listen(done), createHttpServer()) as AddressInfo;
    expect(address.address).toBe(LOOPBACK);
  });
});

describe('A named host, a pipe or a handle is left alone', () => {
  const handle = { _handle: {} };
  const untouched: [string, unknown[]][] = [
    ['port and host', [0, '0.0.0.0']],
    ['port, host and cb', [0, '::', () => {}]],
    ['options with a host', [{ port: 0, host: '::' }]],
    ['a pipe path', ['/tmp/stackledger.sock']],
    ['options with a path', [{ path: '/tmp/stackledger.sock' }]],
    ['options with a handle', [{ handle }]],
    ['a handle', [handle]],
    ['options with an fd', [{ fd: 3 }]],
  ];
  test.each(untouched)('%s', (_, args) => {
    expect(loopbackListenArgs(args)).toBe(args);
  });

  const folder = mkdtempSync(join(tmpdir(), 'stackledger-loopback-'));
  afterAll(() => rmSync(folder, { recursive: true, force: true }));
  test('a real pipe keeps its path', async () => {
    const path = join(folder, 's.sock');
    expect(await bound((server, done) => server.listen(path, done))).toBe(path);
  });
});

describe('Restored after the build', () => {
  const original = Server.prototype.listen;

  test('after it resolves', async () => {
    await withLoopbackServers(async () => { expect(Server.prototype.listen).not.toBe(original); });
    expect(Server.prototype.listen).toBe(original);
  });

  test('after it rejects', async () => {
    await expect(withLoopbackServers(async () => { throw new Error('astro failed'); })).rejects.toThrow('astro failed');
    expect(Server.prototype.listen).toBe(original);
  });

  test('after it throws before returning a promise', async () => {
    await expect(withLoopbackServers(() => { throw new Error('sync failure'); })).rejects.toThrow('sync failure');
    expect(Server.prototype.listen).toBe(original);
  });
});
