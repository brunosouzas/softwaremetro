/** Bind the servers a build opens without a host to loopback (build-command, Writes; card 303).
 *
 * Why: Astro's Fonts API starts an HTTP server for its prerender step and calls `listen(cb)` with no
 * host (astro/dist/assets/fonts/vite-plugin-fonts.js), so Node would bind `::`, every interface, for
 * the build's duration. The build connects to no host and nothing outside this process needs that
 * server, so while `run` runs, net.Server#listen called without a host binds 127.0.0.1. A call that
 * names a host, a pipe path or a handle is left alone. The original listen is put back when `run`
 * settles, also on error.
 *
 * It patches the process-wide prototype (http.Server inherits it): one build at a time per process,
 * which process.chdir in build.ts already requires.
 */
import { Server } from 'node:net';

export const LOOPBACK = '127.0.0.1';

/** Node's own rule (lib/net.js, toNumber and isPipeName): a string is a port when Number() reads it
 * as 0 or more, otherwise a pipe path. */
const isPort = (value: unknown): boolean => typeof value === 'number' || (typeof value === 'string' && Number(value) >= 0);

/** The arguments of a Server#listen call with 127.0.0.1 added when they name no host, or the same
 * array. Forms: (), (cb), (null[, …]), (port[, host][, backlog][, cb]), (options[, cb]), (path[, cb]),
 * (handle[, cb]). An empty host is no host, as for Node. */
export function loopbackListenArgs(args: unknown[]): unknown[] {
  const [first, second] = args;
  if (first === undefined || first === null) return [{ port: 0, host: LOOPBACK }, ...args.slice(1)];
  if (typeof first === 'function') return [{ port: 0, host: LOOPBACK }, ...args];
  if (isPort(first)) return typeof second === 'string' && second !== '' ? args : [first, LOOPBACK, ...args.slice(typeof second === 'string' ? 2 : 1)];
  if (typeof first === 'object') {
    const options = first as Record<string, unknown>;
    const named = options.host || options.path || options.handle || options._handle || options.fd !== undefined;
    return named ? args : [{ ...options, host: LOOPBACK }, ...args.slice(1)];
  }
  return args;
}

/** Run `run` with no-host listens bound to 127.0.0.1, then restore Server#listen. */
export async function withLoopbackServers<T>(run: () => Promise<T>): Promise<T> {
  const listen = Server.prototype.listen;
  Server.prototype.listen = function loopbackListen(this: Server, ...args: unknown[]) {
    return (listen as (...a: unknown[]) => Server).apply(this, loopbackListenArgs(args));
  } as typeof listen;
  try {
    return await run();
  } finally {
    Server.prototype.listen = listen;
  }
}
