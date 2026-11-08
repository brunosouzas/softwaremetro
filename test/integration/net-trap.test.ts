/** Evidence for build-command / Writes / "Sandboxed build" and "Font server on loopback": the trap
 * those tests preload (test/helpers/net-trap.mjs) refuses every way out to a host other than
 * loopback, before DNS, and reports every server instead of changing it, so a server bound to
 * another address or left open fails them. Each script runs under the same flags as "Sandboxed
 * build"; none needs the network, since the trap refuses before any packet leaves (192.0.2.1 is
 * TEST-NET-1, reached by no route). */
import { execFile } from 'node:child_process';
import { describe, expect, test } from 'vitest';
import { NET_TRAP, netFlags, root, trapBound, trapProblems } from './helpers.js';

const flags = () => ['--permission', `--allow-fs-read=${root}`, ...netFlags()];

function script(code: string): Promise<{ status: number; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    execFile(process.execPath, [...flags(), '--input-type=module', '-e', code], { env: { ...process.env, NODE_OPTIONS: '' }, timeout: 20_000 },
      (error, stdout, stderr) => resolve({ status: error ? (typeof error.code === 'number' ? error.code : -1) : 0, stdout, stderr }));
  });
}

/** A custom lookup that maps any name, the allowed "localhost" too, to an address outside loopback. */
const LOOKUP = "const lookup = (host, options, callback) => options && options.all ? callback(null, [{ address: '192.0.2.1', family: 4 }]) : callback(null, '192.0.2.1', 4);";

describe('Every way out is refused', () => {
  const ways: [string, string, string][] = [
    ['fetch', "await fetch('http://example.com');", 'fetch to "example.com"'],
    ['net.connect', "import net from 'node:net'; net.connect(80, 'example.com');", 'net.connect to "example.com"'],
    ['named net import', "import { createConnection } from 'node:net'; createConnection({ host: 'example.com', port: 80 });", 'net.createConnection to "example.com"'],
    ['net.Socket#connect', "import net from 'node:net'; new net.Socket().connect({ host: '93.184.215.14', port: 80 });", 'net.Socket#connect to "93.184.215.14"'],
    ['net.Socket#connect with a port string', "import net from 'node:net'; new net.Socket().connect('0x9', '192.0.2.1');", 'net.Socket#connect to "192.0.2.1"'],
    ['tls.connect', "import tls from 'node:tls'; tls.connect(443, 'example.com');", 'tls.connect to "example.com"'],
    ['dns.lookup', "import dns from 'node:dns'; dns.lookup('example.com', () => {});", 'dns.lookup to "example.com"'],
    ['dns.lookup of a name that holds an address', "import dns from 'node:dns'; dns.lookup('192.0.2.1.nip.io', () => {});", 'dns.lookup to "192.0.2.1.nip.io"'],
    ['dns.promises.lookup', "import { lookup } from 'node:dns/promises'; await lookup('example.com');", 'dns.promises.lookup to "example.com"'],
    ['dns.lookupService', "import dns from 'node:dns'; dns.lookupService('192.0.2.1', 80, () => {});", 'dns.lookupService to "192.0.2.1"'],
    ['dns.Resolver', "import dns from 'node:dns'; new dns.Resolver().resolve4('example.com', () => {});", 'dns.Resolver#resolve4 to "example.com"'],
    ['dns.resolveTxt', "import { resolveTxt } from 'node:dns'; resolveTxt('example.com', () => {});", 'dns.resolveTxt to "example.com"'],
    ['dns.promises.Resolver', "import { Resolver } from 'node:dns/promises'; await new Resolver().resolve('example.com');", 'dns.promises.Resolver#resolve to "example.com"'],
    ['dns.promises.reverse', "import dns from 'node:dns/promises'; await dns.reverse('192.0.2.1');", 'dns.promises.reverse to "192.0.2.1"'],
    ['dgram send', "import dgram from 'node:dgram'; dgram.createSocket('udp4').send('x', 9, '192.0.2.1');", 'dgram.Socket#send to "192.0.2.1"'],
    ['dgram send with offset and length', "import dgram from 'node:dgram'; dgram.createSocket('udp4').send(Buffer.from('x'), 0, 1, 9, '192.0.2.1');", 'dgram.Socket#send to "192.0.2.1"'],
    ['dgram connect', "import dgram from 'node:dgram'; dgram.createSocket('udp4').connect(9, '192.0.2.1');", 'dgram.Socket#connect to "192.0.2.1"'],
    ['dgram with a custom lookup', `import dgram from 'node:dgram'; ${LOOKUP} dgram.createSocket({ type: 'udp4', lookup }).send('x', 9, 'localhost');`, 'dgram lookup to "192.0.2.1"'],
    ['net.connect with a custom lookup', `import net from 'node:net'; ${LOOKUP} net.connect({ host: 'localhost', port: 9, lookup });`, 'net.connect lookup to "192.0.2.1"'],
    ['tls.connect with a custom lookup', `import tls from 'node:tls'; ${LOOKUP} tls.connect({ host: 'localhost', port: 9, lookup });`, 'tls.connect lookup to "192.0.2.1"'],
    ['http.get with a custom lookup', `import http from 'node:http'; ${LOOKUP} http.get({ host: 'localhost', port: 9, lookup });`, 'net.createConnection lookup to "192.0.2.1"'],
    ['http.get', "import http from 'node:http'; http.get('http://example.com/');", 'http.get to "example.com"'],
    ['https.request', "import https from 'node:https'; https.request({ hostname: 'example.com', path: '/' }).end();", 'https.request to "example.com"'],
  ];
  test.concurrent.each(ways)('%s', async (_, code, refused) => {
    const result = await script(code);
    expect(result.status, result.stderr).not.toBe(0);
    expect(result.stderr).toContain(`${NET_TRAP} refused ${refused}`);
  });
});

describe('Servers are reported, not changed', () => {
  test.concurrent('a server on every interface', async () => {
    const result = await script("import http from 'node:http'; const server = http.createServer().listen(0, '0.0.0.0', () => server.close());");
    expect(result.status, result.stderr).toBe(0);
    expect(trapProblems(result.stderr)).toEqual([expect.stringMatching(/^stackledger-net-trap: listen 0\.0\.0\.0:\d+$/)]);
  });

  test.concurrent('a server that names no host, as Astro\'s font server does', async () => {
    // Without stackledger's guard (src/site/loopback.ts), Node binds every interface.
    const result = await script("import http from 'node:http'; const server = http.createServer().listen(() => server.close());");
    expect(result.status, result.stderr).toBe(0);
    expect(trapProblems(result.stderr)).toEqual([expect.stringMatching(/^stackledger-net-trap: listen (\[::\]|0\.0\.0\.0):\d+$/)]);
  });

  test.concurrent('a server left open at exit', async () => {
    const result = await script("import http from 'node:http'; http.createServer().listen(0, '127.0.0.1', () => process.exit(0));");
    expect(trapProblems(result.stderr)).toEqual([expect.stringMatching(/^stackledger-net-trap: open 127\.0\.0\.1:\d+$/)]);
  });

  test.concurrent('loopback still works', async () => {
    const result = await script(`import http from 'node:http';
      const server = http.createServer((_, response) => response.end('ok'));
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      const { address, port } = server.address();
      const text = await (await fetch('http://' + address + ':' + port + '/')).text();
      server.close();
      console.log(port, text);`);
    expect(trapProblems(result.stderr)).toEqual([]);
    expect(result.status, result.stderr).toBe(0);
    const [port, text] = result.stdout.trim().split(' ');
    expect(text).toBe('ok');
    expect(trapBound(result.stderr)).toEqual([`127.0.0.1:${port}`]);
  });
});
