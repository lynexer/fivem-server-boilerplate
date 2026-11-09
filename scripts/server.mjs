#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STATE_FILE = join(ROOT, '.server-platform');
const OUTPUT_DIR = join(ROOT, 'FXServer');
const PLATFORMS = ['legacy', 'enhanced'];
const ARTIFACTS_PACKAGE = '@tsfx/artifacts@2.0.1';

const USAGE = `FiveM server boilerplate helper

Usage:
  pnpm build                  Download server artifacts (interactive platform choice)
  pnpm build:legacy           Download legacy FXServer artifacts
  pnpm build:enhanced         Download FiveM Enhanced artifacts
  pnpm start                  Start the server using the remembered platform
`;

function parseArgs(argv) {
    const args = { command: null, platform: null };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === 'build' || arg === 'start') {
            args.command = arg;
        } else if (arg === '--platform' || arg === '-p') {
            args.platform = argv[++i];
        } else if (arg.startsWith('--platform=')) {
            args.platform = arg.slice('--platform='.length);
        }
    }

    return args;
}

function readPlatform() {
    try {
        const value = readFileSync(STATE_FILE, 'utf8').trim().toLowerCase();

        return PLATFORMS.includes(value) ? value : null;
    } catch {
        return null;
    }
}

function writePlatform(platform) {
    writeFileSync(STATE_FILE, `${platform}\n`, 'utf8');
}

function exePathFor(platform) {
    if (process.platform !== 'win32') {
        throw new Error(
            'This boilerplate currently targets Windows binaries. ' +
            'Linux support is not wired up yet.',
        );
    }

    return join(OUTPUT_DIR, platform === 'enhanced' ? 'cfx-server.exe' : 'FXServer.exe');
}

function exitWithError(message) {
    console.error(message);
    process.exit(1);
}

async function promptPlatform() {
    if (!process.stdin.isTTY) {
        console.warn(
            'No interactive terminal detected; defaulting to "legacy". ' +
            'Run "pnpm build:enhanced" to use the Enhanced build instead.',
        );

        return 'legacy';
    }

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    try {
        while (true) {
            const answer = await rl.question(
                'FiveM server platform? [legacy/enhanced] (default: legacy): ',
            );

            const value = answer.trim().toLowerCase() || 'legacy';

            if (PLATFORMS.includes(value)) {
                return value;
            }

            console.error(`Invalid platform "${value}". Choose "legacy" or "enhanced".`);
        }
    } finally {
        rl.close();
    }
}

function runPnpm(args) {
    const result =
        process.platform === 'win32'
            ? spawnSync(
                ['pnpm', ...args].map((a, i) => (i === 0 ? a : `"${String(a)}"`)).join(' '),
                {
                    cwd: ROOT,
                    shell: true,
                    stdio: 'inherit',
                },
            )
            : spawnSync('pnpm', args, { cwd: ROOT, stdio: 'inherit' });

    if (result.error) {
        exitWithError(`Failed to run pnpm: ${result.error.message}`);
    }

    process.exit(result.status ?? 1);
}

async function build(platformArg) {
    let platform = platformArg;

    if (platform && !PLATFORMS.includes(platform)) {
        exitWithError(`Invalid platform "${platform}". Expected "legacy" or "enhanced".`);
    }

    if (!platform) {
        platform = readPlatform();
    }

    if (!platform) {
        platform = await promptPlatform();
    }

    writePlatform(platform);

    console.log(`\nPlatform: ${platform}`);
    console.log('Downloading FiveM server artifacts...\n');

    runPnpm(['dlx', ARTIFACTS_PACKAGE, '--platform', platform, '-o', OUTPUT_DIR]);
}

function start() {
    const platform = readPlatform() ?? 'legacy';
    const exe = exePathFor(platform);

    if (!existsSync(exe)) {
        exitWithError(
            `Server binary not found: ${exe}\n` +
            'Run "pnpm build" first to download the artifacts.',
        );
    }

    console.log(`Starting ${platform} server (${exe})...`);

    const result = spawnSync(exe, ['+exec', 'server.cfg'], {
        cwd: ROOT,
        stdio: 'inherit',
    });

    if (result.error) {
        exitWithError(`Failed to start server: ${result.error.message}`);
    }

    process.exit(result.status ?? 1);
}

const { command, platform } = parseArgs(process.argv.slice(2));

switch (command) {
    case 'build':
        await build(platform);
        break;
    case 'start':
        start();
        break;
    default:
        console.log(USAGE);
}
