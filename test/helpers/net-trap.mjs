/** Test-only network trap, preloaded with `--import` by the sandboxed build tests and the font server
 * test (build-command / Writes / "Sandboxed build", "Font server on loopback";
 * test/integration/helpers.ts, netFlags and trapProblems).
 *
 * Why: from Node 25 (not 22 or 24) the permission model restricts the network unless `--allow-net`
 * is given, and Astro's Fonts API opens a server during the build (vite-plugin-fonts.js, the
 * prerender environment's font server), which stackledger binds to loopback (src/site/loopback.ts).
 * `--allow-net` lets that server listen, but it also allows every outgoing connection, so the test
 * would no longer prove that the build connects to no host. This trap puts the check back.
 *
 * Ways out are refused: a connection (net, tls, http(s), fetch, dgram) to a host other than loopback
 * throws before DNS; a custom `lookup` option is wrapped, so an address it returns outside loopback
 * fails the connection; DNS queries (dns.Resolver, dns.resolve*, dns.lookupService, and lookups of
 * names other than loopback) are refused. Each refusal writes `stackledger-net-trap: refused …` to stderr.
 *
 * Servers are observed, not changed: every server that starts listening writes
 * `stackledger-net-trap: bound <address>`; one bound to an address other than loopback also writes
 * `stackledger-net-trap: listen <address>`, and one still listening when the process exits writes
 * `stackledger-net-trap: open <address>`. Unix sockets and inherited handles are local and left
 * alone. Loaded in workers too (they inherit the `--import` flag through execArgv); child processes
 * are outside it, as the spec says.
 *
 * Never imported by the shipped code or by a test file: importing it patches the process.
 */
import dgram from 'node:dgram';
import dns from 'node:dns';
import { writeSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import net from 'node:net';
import tls from 'node:tls';

/** Keep in step with NET_TRAP in test/integration/helpers.ts. */
const PREFIX = 'stackledger-net-trap:';
const LOOPBACK = new Set(['127.0.0.1', '::1', 'localhost']);

const say = line => writeSync(2, `${PREFIX} ${line}\n`);
const unbracket = host => String(host).replace(/^\[(.*)\]$/, '$1').toLowerCase();
/** A host a connection may name. */
const isLoopback = host => LOOPBACK.has(unbracket(host));
/** An address a server or a lookup actually gave: 127.0.0.0/8, ::1, or IPv4-mapped 127.x. */
const isLoopbackAddress = address => {
  const plain = unbracket(address);
  return plain === '::1' || /^(::ffff:)?127\.\d+\.\d+\.\d+$/.test(plain);
};

function refusal(what, host) {
  const message = `${PREFIX} refused ${what} to ${JSON.stringify(String(host))}`;
  writeSync(2, `${message}\n`);
  const error = new Error(message);
  error.code = 'ERR_NET_TRAP';
  return error;
}
function refuse(what, host) { throw refusal(what, host); }
function check(what, host) { if (!isLoopback(host)) refuse(what, host); }

/** Node's own rule (lib/net.js, toNumber and isPipeName): a string is a port when Number() reads it
 * as 0 or more ('0x9', '' and ' ' are ports), otherwise a pipe path. */
const isPort = value => typeof value === 'number' || (typeof value === 'string' && Number(value) >= 0);

const CHECKED = Symbol('stackledger-net-trap checked lookup');
/** A custom `lookup` whose answers must all be loopback: one outside fails the call, with the marker. */
function checkedLookup(what, lookup) {
  if (lookup[CHECKED]) return lookup;
  const wrapped = function trapped(host, options, callback) {
    if (typeof options === 'function') [options, callback] = [{}, options];
    return lookup.call(this, host, options, (error, address, family) => {
      if (error) return callback(error);
      const answers = Array.isArray(address) ? address.map(entry => entry.address) : [address];
      const outside = answers.find(answer => !isLoopbackAddress(answer));
      if (outside !== undefined) return callback(refusal(`${what} lookup`, outside));
      return callback(null, address, family);
    });
  };
  wrapped[CHECKED] = true;
  return wrapped;
}

/** Check the target of a Socket#connect, net.connect or tls.connect call and wrap its `lookup`.
 * Forms: (options[, cb]), (port[, host][, cb]), (path[, cb]), and the array Node passes internally. */
function checkConnect(what, args) {
  let [first, second] = args;
  if (Array.isArray(first)) [first, second] = first;
  if (first !== null && typeof first === 'object') {
    if (first.path !== undefined && first.port === undefined) return; // a Unix socket
    check(what, first.host ?? first.hostname ?? 'localhost');
    if (typeof first.lookup === 'function') first.lookup = checkedLookup(what, first.lookup);
    return;
  }
  if (!isPort(first)) return; // a Unix socket path
  check(what, typeof second === 'string' ? second : 'localhost');
}

const wrapConnect = (what, original) => function trapped(...args) {
  checkConnect(what, args);
  return original.apply(this, args);
};

net.Socket.prototype.connect = wrapConnect('net.Socket#connect', net.Socket.prototype.connect);
net.connect = wrapConnect('net.connect', net.connect);
net.createConnection = wrapConnect('net.createConnection', net.createConnection);
tls.connect = wrapConnect('tls.connect', tls.connect);

// DNS: a lookup of a name other than loopback, and every query to a DNS server, are refused. A lookup
// of an address (Server#listen looks up the host it names, '0.0.0.0' too) asks no server.
const wrapFirst = (what, original, allowed = isLoopback) => function trapped(host, ...rest) {
  if (!allowed(host)) refuse(what, host);
  return original.call(this, host, ...rest);
};
const nameOrAddress = host => isLoopback(host) || net.isIP(String(host)) !== 0;
dns.lookup = wrapFirst('dns.lookup', dns.lookup, nameOrAddress);
dns.promises.lookup = wrapFirst('dns.promises.lookup', dns.promises.lookup, nameOrAddress);
dns.lookupService = wrapFirst('dns.lookupService', dns.lookupService);
dns.promises.lookupService = wrapFirst('dns.promises.lookupService', dns.promises.lookupService);
const isQuery = name => name.startsWith('resolve') || name === 'reverse';
for (const [label, module] of [['dns', dns], ['dns.promises', dns.promises]]) {
  // Resolver instances, and the module's own functions, which Node binds to a default resolver at load.
  const prototype = module.Resolver.prototype;
  for (const name of Object.getOwnPropertyNames(prototype).filter(isQuery)) {
    prototype[name] = function trapped(host) { refuse(`${label}.Resolver#${name}`, host); };
    if (typeof module[name] === 'function') module[name] = function trapped(host) { refuse(`${label}.${name}`, host); };
  }
}

// UDP: a datagram or a connect to a host other than loopback; a custom lookup is checked.
const createSocket = dgram.createSocket;
dgram.createSocket = function trapped(type, ...rest) {
  if (type !== null && typeof type === 'object' && typeof type.lookup === 'function') type = { ...type, lookup: checkedLookup('dgram', type.lookup) };
  return createSocket.call(this, type, ...rest);
};
/** Socket#send(msg[, offset, length][, port][, address][, cb]), the address found as Node finds it. */
const send = dgram.Socket.prototype.send;
dgram.Socket.prototype.send = function trapped(...args) {
  const [, , length, port, address] = args;
  const target = address || (port && typeof port !== 'function') ? address : length;
  if (typeof target === 'string' && target !== '') check('dgram.Socket#send', target);
  return send.apply(this, args);
};
const dgramConnect = dgram.Socket.prototype.connect;
dgram.Socket.prototype.connect = function trapped(port, address, ...rest) {
  if (typeof address === 'string' && address !== '') check('dgram.Socket#connect', address);
  return dgramConnect.call(this, port, address, ...rest);
};

/** The host of an http(s).request or get call: (url[, options][, cb]) or (options[, cb]). */
function requestHost(args) {
  const [first, second] = args;
  const options = typeof second === 'object' && second !== null && typeof second !== 'function' ? second : {};
  if (options.host ?? options.hostname) return options.hostname ?? options.host;
  if (typeof first === 'string' || first instanceof URL) return new URL(first).hostname;
  if (first !== null && typeof first === 'object') return first.hostname ?? first.host ?? 'localhost';
  return 'localhost';
}

// http(s): the host is checked here; a `lookup` option reaches Socket#connect, which wraps it.
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

// Servers: observed after 'listening', never rewritten.
const open = new Set();
const formatted = ({ address, port }) => `${address.includes(':') ? `[${address}]` : address}:${port}`;
const listen = net.Server.prototype.listen;
const OBSERVED = Symbol('stackledger-net-trap observed');
net.Server.prototype.listen = function observed(...args) {
  if (!this[OBSERVED]) {
    this[OBSERVED] = true;
    this.on('listening', () => {
      const address = this.address();
      if (address === null || typeof address === 'string') return; // a Unix socket or a pipe
      open.add(this);
      say(`bound ${formatted(address)}`);
      if (!isLoopbackAddress(address.address)) say(`listen ${formatted(address)}`);
    });
    this.on('close', () => open.delete(this));
  }
  return listen.apply(this, args);
};
process.on('exit', () => {
  for (const server of open) if (server.listening) say(`open ${formatted(server.address())}`);
});

// Named imports of the built-in modules (`import { connect } from 'node:net'`) see the traps too.
syncBuiltinESMExports();
