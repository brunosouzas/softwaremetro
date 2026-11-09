/** .github/workflows/release.yml, release-please.yml and title.yml (package-release spec: Checks without
 * publishing rights, Publication of the checked tarball, Release workflow hardening, Release pull request,
 * Release-please configuration, Conventional Commit pull request titles, Release app token, Release app's
 * own tag). Run npm test.
 * The workflow is read as YAML; actionlint runs on it when it is on PATH (see test/tools.ts).
 */
import { describe, expect, test } from 'vitest';
import { chmodSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { folder } from '../helpers.js';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { actionlint, toolOrSkip } from '../tools.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const workflowFile = '.github/workflows/release.yml';

interface Step { name?: string; uses?: string; run?: string; with?: Record<string, unknown>; env?: Record<string, string> }
interface Job { needs?: string | string[]; if?: string; environment?: string | { name: string }; permissions?: Record<string, string>;
  outputs?: Record<string, string>; concurrency?: { group: string; 'cancel-in-progress': boolean }; steps: Step[] }
const workflowText = readFileSync(new URL(`../../${workflowFile}`, import.meta.url), 'utf8');
const workflow = parse(workflowText) as { on: unknown; permissions?: unknown; concurrency?: unknown; jobs: Record<string, Job> };
const publishScript = readFileSync(new URL('../../scripts/release-publish.sh', import.meta.url), 'utf8');
const [detectName, checkName, publishName] = Object.keys(workflow.jobs);
const detect = workflow.jobs[detectName!]!, checks = workflow.jobs[checkName!]!, publish = workflow.jobs[publishName!]!;
const needs = (job: Job) => (job.needs === undefined ? [] : Array.isArray(job.needs) ? job.needs : [job.needs]);
const allSteps = Object.values(workflow.jobs).flatMap(job => job.steps);

/** Index of the first run step matching `pattern`, or -1. */
const runIndex = (job: Job, pattern: RegExp) => job.steps.findIndex(step => step.run !== undefined && pattern.test(step.run));

test('Release on the version merge: pushes to main and v* tags; a read-only detect job first', () => {
  expect(workflow.on).toEqual({ push: { branches: ['main'], tags: ['v*'] } });
  expect(workflow.permissions).toEqual({});
  expect(detectName).toBe('detect');
  expect(detect.needs).toBeUndefined();
  expect(detect.permissions).toEqual({ contents: 'read' });
  expect(detect.outputs).toEqual({ release: '${{ steps.detect.outputs.release }}', tag: '${{ steps.detect.outputs.tag }}' });
  const step = detect.steps.find(candidate => candidate.run?.includes('scripts/release-detect.mjs'))!;
  expect(step.run).toBe('node scripts/release-detect.mjs "$REF_TYPE" "$REF_NAME" "$BEFORE" "$GITHUB_SHA" "$FORCED" "$ACTOR" >> "$GITHUB_OUTPUT"');
  // Workflow wiring (Release app's own tag): the actor as the sixth argument, the app's bot login in env.
  expect(step.env).toEqual({ REF_TYPE: '${{ github.ref_type }}', REF_NAME: '${{ github.ref_name }}', BEFORE: '${{ github.event.before }}',
    FORCED: '${{ github.event.forced }}', ACTOR: '${{ github.actor }}', RELEASE_APP_BOT: 'brunosouzas-stackledger-release[bot]' });
  expect(detect.steps.find(candidate => candidate.uses?.startsWith('actions/checkout@'))?.with?.['fetch-depth']).toBe(0);
});

test('A later merge with the same version: no check or publish unless detect answers release=true', () => {
  expect(needs(checks)).toEqual(['detect']);
  expect(checks.if).toBe("needs.detect.outputs.release == 'true'");
  expect(needs(publish).sort()).toEqual(['check', 'detect']);
});

test('No event value is interpolated into a run block', () => {
  for (const step of allSteps) expect(step.run ?? '', step.name).not.toMatch(/\$\{\{/);
});

test('Concurrency groups: one per version tag, never cancelling', () => {
  expect(workflow.concurrency).toBeUndefined();
  expect(checks.concurrency).toEqual({ group: 'release-${{ needs.detect.outputs.tag }}', 'cancel-in-progress': false });
  expect(publish.concurrency).toEqual({ group: 'release-${{ needs.detect.outputs.tag }}-publish', 'cancel-in-progress': false });
  expect(detect.concurrency).toBeUndefined();
});

test('The SBOM and publish steps take the version from detect, never from GITHUB_REF_NAME', () => {
  expect(workflowText).not.toContain('GITHUB_REF_NAME');
  const sbom = checks.steps.find(step => step.run?.includes('npm sbom'))!;
  expect(sbom.env?.RELEASE_TAG).toBe('${{ needs.detect.outputs.tag }}');
  const script = publish.steps.find(step => step.run?.includes('scripts/release-publish.sh'))!;
  expect(script.env?.RELEASE_TAG).toBe('${{ needs.detect.outputs.tag }}');
  expect(script.env?.RELEASE_COMMIT).toBe("${{ github.ref_type == 'branch' && github.sha || '' }}");
  expect(script.run).toContain('version="${RELEASE_TAG#v}"');
  // Exact scoped file names, from the version detect gives (Scoped tarball in the workflow).
  expect(sbom.run).toContain('tar -xzf "$RUNNER_TEMP/release/brunosouzas-stackledger-${RELEASE_TAG#v}.tgz"');
  expect(sbom.run).toContain('> "$RUNNER_TEMP/release/stackledger-${RELEASE_TAG#v}.cdx.json"');
  expect(script.run!.replace(/\\\n\s*/g, '')).toContain(
    'scripts/release-publish.sh "$RUNNER_TEMP/release/brunosouzas-stackledger-$version.tgz" "$RUNNER_TEMP/release/integrity" "$RUNNER_TEMP/release/stackledger-$version.cdx.json"');
});

test('The publish step hands the script the scoped files for the detected version, on both paths', () => {
  const script = publish.steps.find(step => step.run?.includes('scripts/release-publish.sh'))!;
  const dir = folder({ 'scripts/release-publish.sh': '#!/bin/sh\nprintf "%s\\n" "$RELEASE_TAG|$RELEASE_COMMIT" "$@" > "$OUT"\n', 'step.sh': script.run! });
  chmodSync(join(dir, 'scripts/release-publish.sh'), 0o755);
  for (const [refType, commit] of [['branch', 'abc123'], ['tag', '']] as const) {
    const out = join(dir, `${refType}.txt`);
    const result = spawnSync('bash', ['-e', join(dir, 'step.sh')], { cwd: dir, encoding: 'utf8',
      env: { ...process.env, RELEASE_TAG: 'v0.5.0', RELEASE_COMMIT: commit, RUNNER_TEMP: '/tmp/runner', OUT: out, GITHUB_REF_TYPE: refType } });
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(out, 'utf8').trim().split('\n')).toEqual([`v0.5.0|${commit}`,
      '/tmp/runner/release/brunosouzas-stackledger-0.5.0.tgz', '/tmp/runner/release/integrity', '/tmp/runner/release/stackledger-0.5.0.cdx.json']);
  }
});

test('Checks job: contents: read only; tag check, npm ci, build, tests, audit, pack and SBOM in order', () => {
  expect(checks.permissions).toEqual({ contents: 'read' });
  const order = [
    /node scripts\/check-release-tag\.mjs "\$RELEASE_TAG" "\$GITHUB_SHA"/, /^npm ci\b/m, /^npm run build\b/m, /^npm test\b/m,
    /^npm audit --audit-level=low\b/m, /^node scripts\/pack-production\.mjs\b/m, /^\s*npm sbom --package-lock-only --sbom-format cyclonedx\b/m,
  ].map(pattern => runIndex(checks, pattern));
  expect(order.every(index => index >= 0), String(order)).toBe(true);
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  const sbomStep = checks.steps[order.at(-1)!]!.run!;
  expect(sbomStep).toMatch(/tar -xzf "\$RUNNER_TEMP\/release\/brunosouzas-stackledger-.*\.tgz"/);
  expect(sbomStep).toContain('package/package.json package/npm-shrinkwrap.json');
  expect(sbomStep).toContain('--strip-components=1 -C "$RUNNER_TEMP/sbom/@brunosouzas/stackledger"');
  expect(sbomStep).toMatch(/cd "\$RUNNER_TEMP\/sbom\/@brunosouzas\/stackledger"/);
  // The tag check is the first command the job runs: nothing of the repository runs before it.
  expect(checks.steps.findIndex(step => step.run !== undefined)).toBe(order[0]);
  expect(checks.steps.some(step => step.uses?.startsWith('actions/upload-artifact@'))).toBe(true);
});

test('Publishing job: after the checks, in environment npm, publishing the checked tarball only', () => {
  expect(needs(publish)).toContain(checkName);
  const environment = typeof publish.environment === 'string' ? publish.environment : publish.environment?.name;
  expect(environment).toBe('npm');
  expect(publish.permissions).toEqual({ contents: 'read', 'id-token': 'write' });
  const checkout = publish.steps.find(step => step.uses?.startsWith('actions/checkout@'));
  expect(checkout?.with?.['persist-credentials']).toBe(false);
  const runs = publish.steps.filter(step => step.run !== undefined).map(step => step.run!);
  expect(runs.some(run => /^scripts\/release-publish\.sh /m.test(run))).toBe(true);
  expect(runs.filter(run => /\bnpm (ci|install|i|run|test|pack|exec)\b|\bnpx\b/.test(run))).toEqual([]);
  expect(publish.steps.some(step => step.uses?.startsWith('actions/download-artifact@'))).toBe(true);
  expect(publishScript).toMatch(/npm publish "\$tarball" --provenance --access public --ignore-scripts/);
  // The bootstrap token is read from the environment's secret only; empty after the first version.
  const script = publish.steps.find(step => step.run?.includes('scripts/release-publish.sh'));
  expect(script?.env?.NODE_AUTH_TOKEN).toBe('${{ secrets.NPM_TOKEN }}');
});

describe('Release app token', () => {
  const tokenIndex = publish.steps.findIndex(step => step.uses?.startsWith('actions/create-github-app-token@'));
  const token = publish.steps[tokenIndex]!;

  test('Contents only: this repository, permission-contents: write and nothing else, revoked by default', () => {
    expect(tokenIndex).toBeGreaterThan(-1);
    expect(token.id).toBe('app');
    expect(token.with).toEqual({ 'client-id': '${{ vars.RELEASE_APP_CLIENT_ID }}', 'private-key': '${{ secrets.RELEASE_APP_PRIVATE_KEY }}',
      repositories: '${{ github.event.repository.name }}', 'permission-contents': 'write' });
  });

  test('Token before publishing: after the checkout and the download, the only GH_TOKEN, never github.token', () => {
    const checkout = publish.steps.findIndex(step => step.uses?.startsWith('actions/checkout@'));
    const download = publish.steps.findIndex(step => step.uses?.startsWith('actions/download-artifact@'));
    const script = publish.steps.findIndex(step => step.run?.includes('scripts/release-publish.sh'));
    expect(checkout).toBeLessThan(tokenIndex);
    expect(download).toBeLessThan(tokenIndex);
    expect(tokenIndex).toBeLessThan(script);
    expect(publish.steps[script]!.env?.GH_TOKEN).toBe('${{ steps.app.outputs.token }}');
    expect(workflowText).not.toContain('github.token');
  });
});

describe('Release pull request and titles', () => {
  const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
  interface CallerJob { uses?: string; with?: Record<string, unknown>; secrets?: unknown; steps?: unknown }
  const releasePr = parse(read('.github/workflows/release-please.yml')) as { on: unknown; permissions?: unknown; jobs: Record<string, CallerJob> };
  const title = parse(read('.github/workflows/title.yml')) as { on: unknown; permissions?: unknown; jobs: Record<string, CallerJob> };

  test('Caller: pushes to main, no permissions, the reusable workflow at v0.1.0, the key passed by name', () => {
    expect(releasePr.on).toEqual({ push: { branches: ['main'] } });
    expect(releasePr.permissions).toEqual({});
    expect(Object.keys(releasePr.jobs)).toEqual(['release-please']);
    const job = releasePr.jobs['release-please']!;
    expect(job.uses).toBe('brunosouzas/github-reusable-workflows/.github/workflows/release-please.yml@v0.1.0');
    expect(job.with).toEqual({ 'skip-github-release': true });
    expect(job.secrets).toEqual({ RELEASE_APP_PRIVATE_KEY: '${{ secrets.RELEASE_APP_PRIVATE_KEY }}' });
  });

  test('Configuration: one node package, no component in the tag, minor bumps before 1.0, CHANGELOG.md', () => {
    expect(JSON.parse(read('release-please-config.json')).packages).toEqual({
      '.': { 'release-type': 'node', 'bump-minor-pre-major': true, 'include-component-in-tag': false, 'changelog-path': 'CHANGELOG.md',
        'extra-files': [{ type: 'generic', path: 'README.md' }] },
    });
  });

  test('Manifest out of step: the manifest holds the version in package.json', () => {
    const manifest = JSON.parse(read('.release-please-manifest.json')) as Record<string, string>;
    const { version } = JSON.parse(read('package.json')) as { version: string };
    expect(Object.keys(manifest)).toEqual(['.']);
    expect(manifest['.'], `manifest ${manifest['.']} vs package.json ${version}`).toBe(version);
  });

  test('Title workflow: pull request events only, no permissions, job pr-title at v0.1.0', () => {
    expect(title.on).toEqual({ pull_request: { types: ['opened', 'edited', 'synchronize', 'reopened'] } });
    expect(title.permissions).toEqual({});
    expect(Object.keys(title.jobs)).toEqual(['pr-title']);
    expect(title.jobs['pr-title']!.uses).toBe('brunosouzas/github-reusable-workflows/.github/workflows/pr-title.yml@v0.1.0');
  });

  test('Title workflow on another event: no push or pull_request_target trigger', () => {
    const events = Object.keys(title.on as Record<string, unknown>);
    expect(events).not.toContain('push');
    expect(events).not.toContain('pull_request_target');
  });
});

describe('Pinned', () => {
  test('every action names a 40-character commit SHA and no step enables a package cache', () => {
    const uses = allSteps.filter(step => step.uses !== undefined).map(step => step.uses!);
    expect(uses.length).toBeGreaterThan(0);
    expect(uses.filter(use => !/^[\w.-]+\/[\w.-]+(\/[\w./-]+)?@[0-9a-f]{40}$/.test(use))).toEqual([]);
    for (const step of allSteps) {
      expect(step.with?.cache, step.uses).toBeUndefined();
      if (step.uses?.startsWith('actions/setup-node@')) expect(step.with?.['package-manager-cache'], step.uses).toBe(false);
      if (step.uses?.startsWith('actions/checkout@')) expect(step.with?.['persist-credentials'], step.uses).toBe(false);
    }
  });

  const binary = toolOrSkip('actionlint', 'release-workflow.test.ts');
  test.runIf(binary)('actionlint reports nothing', () => {
    const result = actionlint(binary!, workflowFile, root);
    expect(result.output).toBe('');
    expect(result.status).toBe(0);
  });
});
