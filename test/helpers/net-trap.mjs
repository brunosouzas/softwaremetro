/** Test-only network trap, preloaded with `--import` by the sandboxed build tests (build-command /
 * Writes / "Sandboxed build"; test/integration/helpers.ts, netFlags).
 *
 * Why: on Node versions with `--allow-net` (26, not 22 or 24) the permission model restricts the
 * network unless that flag is given, and Astro's Fonts API listens on a local port during the build
 * (vite-plugin-fonts.js, the prerender environment's font server). `--allow-net` lets the build listen, but it also allows every outgoing
 * connection, so the test would no longer prove that the build connects to nothing. This trap puts
 * the check back: any connection to a host other than loopback throws, before DNS, and writes
 * the marker to stderr; a server may listen only on loopback, and one that names no host (as
 * Astro's does) is bound to 127.0.0.1, so the address Astro builds its font URLs from is loopback too.
 * Unix sockets and inherited handles are local and left alone. Loaded in workers too (they inherit
 * the `--import` flag through execArgv); child processes are outside it, as the spec says.
 *
 * Never imported by the shipped code or by a test file: importing it patches the process.
 */
import dns from 'node:dns';
import { writeSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import net from 'node:net';
import tls from 'node:tls';

/** Keep in step with NET_TRAP_MARKER in test/integration/helpers.ts. */
const MARKER = 'stackledger-net-trap: refused';
const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);
const LISTEN_HOST = '127.0.0.1';

const isLoopback = host => LOOPBACK.has(String(host).replace(/^\[(.*)\]$/, '$1').toLowerCase());

function refuse(what, host) {
  const message = `${MARKER} ${what} to ${JSON.stringify(String(host))}`;
  writeSync(2, `${message}\n`);
  const error = new Error(message);
  error.code = 'ERR_NET_TRAP';
  throw error;
}

function check(what, host) {
  if (!isLoopback(host)) refuse(what, host);
}

/** The host a Socket#connect, net.connect or tls.connect call would reach, or undefined for a Unix
 * socket path. Mirrors Node's argument forms: (options[, cb]), (port[, host][, cb]), (path[, cb]). */
function connectHost(args) {
  let [first, second] = args;
  if (Array.isArray(first)) [first, second] = first; // the normalized form Node passes internally
  if (first !== null && typeof first === 'object') {
    if (first.path !== undefined && first.port === undefined) return undefined;
    return first.host ?? first.hostname ?? 'localhost';
  }
  if (typeof first === 'string' && !/^\d+$/.test(first)) return undefined;
  return typeof second === 'string' ? second : 'localhost';
}

const wrapConnect = (what, original) => function trapped(...args) {
  const host = connectHost(args);
  if (host !== undefined) check(what, host);
  return original.apply(this, args);
};

net.Socket.prototype.connect = wrapConnect('net.Socket#connect', net.Socket.prototype.connect);
net.connect = wrapConnect('net.connect', net.connect);
net.createConnection = wrapConnect('net.createConnection', net.createConnection);
tls.connect = wrapConnect('tls.connect', tls.connect);

const lookup = dns.lookup;
dns.lookup = function trapped(host, ...rest) { check('dns.lookup', host); return lookup.call(this, host, ...rest); };
const promisesLookup = dns.promises.lookup;
dns.promises.lookup = function trapped(host, ...rest) { check('dns.promises.lookup', host); return promisesLookup.call(this, host, ...rest); };

/** The host of an http(s).request or get call: (url[, options][, cb]) or (options[, cb]). */
function requestHost(args) {
  const [first, second] = args;
  const options = typeof second === 'object' && second !== null && typeof second !== 'function' ? second : {};
  if (options.host ?? options.hostname) return options.hostname ?? options.host;
  if (typeof first === 'string' || first instanceof URL) return new URL(first).hostname;
  if (first !== null && typeof first === 'object') return first.hostname ?? first.host ?? 'localhost';
  return 'localhost';
}

for (const [name, module] of [['http', http], ['https', https]]) {
  for (const method of ['request', 'get']) {
    const original = module[method];
    module[method] = function trapped(...args) { check(`${name}.${method}`, requestHost(args)); return original.apply(this, args); };
  }
}

if (typeof globalThis.fetch === 'function') {
  const fetch = globalThis.fetch;
  globalThis.fetch = function trapped(input, init) {
    const url = typeof input === 'string' || input instanceof URL ? input : input?.url;
    check('fetch', new URL(String(url)).hostname);
    return fetch.call(this, input, init);
  };
}

/** Server#listen forms: (), (cb), (port[, host][, backlog][, cb]), (options[, cb]), (path[, cb]), (handle[, cb]). */
const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function trapped(...args) {
  const [first, second] = args;
  if (first === undefined || typeof first === 'function') return listen.call(this, { port: 0, host: LISTEN_HOST }, ...args.filter(arg => typeof arg === 'function'));
  if (typeof first === 'number' || (typeof first === 'string' && /^\d+$/.test(first))) {
    if (typeof second === 'string') { check('net.Server#listen', second); return listen.apply(this, args); }
    return listen.call(this, first, LISTEN_HOST, ...args.slice(1));
  }
  if (first !== null && typeof first === 'object' && first.path === undefined && first.fd === undefined && first.handle === undefined && !('_handle' in first)) {
    if (first.host !== undefined) { check('net.Server#listen', first.host); return listen.apply(this, args); }
    return listen.call(this, { ...first, host: LISTEN_HOST }, ...args.slice(1));
  }
  return listen.apply(this, args);
};

// Named imports of the built-in modules (`import { connect } from 'node:net'`) see the traps too.
syncBuiltinESMExports();
