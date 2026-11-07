/** build-command / Writes / "Network trap fires": the trap the sandboxed build tests preload
 * (test/helpers/net-trap.mjs) refuses every way out to a host other than loopback, before DNS, and
 * still lets a server listen on loopback, as Astro's Fonts API does during the build. Each script
 * runs under the same flags as "Sandboxed build"; none needs the network, since the trap throws
 * before any lookup. */
import { execFile } from 'node:child_process';
import { describe, expect, test } from 'vitest';
import { NET_TRAP_MARKER, netFlags, root } from './helpers.js';

const flags = () => ['--permission', `--allow-fs-read=${root}`, ...netFlags()];

function script(code: string): Promise<{ status: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    execFile(process.execPath, [...flags(), '--input-type=module', '-e', code], { env: { ...process.env, NODE_OPTIONS: '' }, timeout: 20_000 },
      (error, stdout, stderr) => resolve({ status: error ? (typeof error.code === 'number' ? error.code : -1) : 0, stdout, stderr }));
  });
}

test('Network trap fires', async () => {
  const result = await script("await fetch('http://example.com');");
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain(`${NET_TRAP_MARKER} fetch to "example.com"`);
});

describe('Every way out is trapped', () => {
  const ways: [string, string, string][] = [
    ['net.connect', "import net from 'node:net'; net.connect(80, 'example.com');", 'net.connect to "example.com"'],
    ['named net import', "import { createConnection } from 'node:net'; createConnection({ host: 'example.com', port: 80 });", 'net.createConnection to "example.com"'],
    ['net.Socket#connect', "import net from 'node:net'; new net.Socket().connect({ host: '93.184.215.14', port: 80 });", 'net.Socket#connect to "93.184.215.14"'],
    ['tls.connect', "import tls from 'node:tls'; tls.connect(443, 'example.com');", 'tls.connect to "example.com"'],
    ['dns.lookup', "import dns from 'node:dns'; dns.lookup('example.com', () => {});", 'dns.lookup to "example.com"'],
    ['dns.promises.lookup', "import { lookup } from 'node:dns/promises'; await lookup('example.com');", 'dns.promises.lookup to "example.com"'],
    ['http.get', "import http from 'node:http'; http.get('http://example.com/');", 'http.get to "example.com"'],
    ['https.request', "import https from 'node:https'; https.request({ hostname: 'example.com', path: '/' }).end();", 'https.request to "example.com"'],
    ['listen on every interface', "import http from 'node:http'; http.createServer().listen(0, '0.0.0.0');", 'net.Server#listen to "0.0.0.0"'],
  ];
  test.concurrent.each(ways)('%s', async (_, code, refused) => {
    const result = await script(code);
    expect(result.status, result.stderr).not.toBe(0);
    expect(result.stderr).toContain(`${NET_TRAP_MARKER} ${refused}`);
  });
});

test('Loopback still works', async () => {
  // A server that names no host, as Astro's font server, is bound to 127.0.0.1 and can be fetched.
  const result = await script(`import http from 'node:http';
    const server = http.createServer((_, response) => response.end('ok'));
    await new Promise(resolve => server.listen(resolve));
    const { address, port } = server.address();
    const text = await (await fetch('http://' + address + ':' + port + '/')).text();
    server.close();
    console.log(address, text);`);
  expect(result.stderr).not.toContain(NET_TRAP_MARKER);
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout.trim()).toBe('127.0.0.1 ok');
});
