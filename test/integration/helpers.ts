/** Spawn the built executable, not an in-process mock. Build first with npm run build. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export const cli = fileURLToPath(new URL('../../dist/cli.js', import.meta.url));
export const demo = fileURLToPath(new URL('../fixtures/demo/', import.meta.url));
/** The line test/helpers/net-trap.mjs writes to stderr when it refuses a connection (keep in step). */
export const NET_TRAP_MARKER = 'stackledger-net-trap: refused';
/** The network flags of a sandboxed run (build-command / Writes / "Sandboxed build"): `--allow-net`
 * where the running Node has it (there the permission model restricts the network, and Astro's Fonts
 * API listens on a local port during the build; Node 22 and 24 have neither the flag nor the restriction), and always the loopback-only network trap,
 * which keeps the run from connecting to any other host. Add them after `--permission`. */
export const netFlags = (): string[] => [
  ...(process.allowedNodeEnvironmentFlags.has('--allow-net') ? ['--allow-net'] : []),
  '--import', new URL('../helpers/net-trap.mjs', import.meta.url).href,
];
export function run(args: string[] = [], cwd = root, flags: string[] = []) {
 const result = spawnSync(process.execPath, [...flags, cli, ...args], { cwd, encoding: 'utf8', timeout: 20000, env: { ...process.env, NODE_OPTIONS: '' } });
 if (result.error) throw result.error;
 return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}
