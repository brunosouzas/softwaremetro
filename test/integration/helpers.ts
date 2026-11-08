/** Spawn the built executable, not an in-process mock. Build first with npm run build. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../../', import.meta.url));
export const cli = fileURLToPath(new URL('../../dist/cli.js', import.meta.url));
export const demo = fileURLToPath(new URL('../fixtures/demo/', import.meta.url));
/** The prefix of every line test/helpers/net-trap.mjs writes to stderr (keep in step). */
export const NET_TRAP = 'stackledger-net-trap:';
/** The trap's lines that say something went wrong: a refused way out (`refused`), a server bound to
 * an address other than loopback (`listen`), a server still listening at exit (`open`). */
export const trapProblems = (stderr: string): string[] =>
  stderr.split('\n').filter(line => /^stackledger-net-trap: (refused|listen|open) /.test(line));
/** The addresses of the servers that started listening, as the trap's `bound` lines give them. */
export const trapBound = (stderr: string): string[] =>
  stderr.split('\n').flatMap(line => /^stackledger-net-trap: bound (.+)$/.exec(line)?.[1] ?? []);
/** The network flags of a sandboxed run (build-command / Writes / "Sandboxed build"): `--allow-net`
 * where the running Node has it (from Node 25, not 22 or 24, the permission model restricts the
 * network without it, and Astro's Fonts API opens a server during the build, which stackledger binds
 * to 127.0.0.1), and always the network trap, which refuses any other host and reports every server
 * the run opens. Add them after `--permission`. */
export const netFlags = (): string[] => [
  ...(process.allowedNodeEnvironmentFlags.has('--allow-net') ? ['--allow-net'] : []),
  ...netTrap(),
];
/** Preload the network trap alone (no permission model). */
export const netTrap = (): string[] => ['--import', new URL('../helpers/net-trap.mjs', import.meta.url).href];
export function run(args: string[] = [], cwd = root, flags: string[] = []) {
 const result = spawnSync(process.execPath, [...flags, cli, ...args], { cwd, encoding: 'utf8', timeout: 20000, env: { ...process.env, NODE_OPTIONS: '' } });
 if (result.error) throw result.error;
 return { stdout: result.stdout, stderr: result.stderr, status: result.status };
}
