import * as core from '@actions/core';
import { parseVersion, stripPrefix } from './semver.js';

function run(): void {
    try {
        // --- Read inputs ---
        const tag = core.getInput('tag');
        const fallbackRef = core.getInput('fallback-ref');
        const prefix = core.getInput('prefix');
        const strict = core.getBooleanInput('strict');

        // --- Determine raw version source ---
        const raw = tag || fallbackRef;
        if (!raw) {
            throw new Error('No version source: both "tag" and "fallback-ref" are empty');
        }

        core.info(`Raw version input: ${raw}`);

        // --- Strip prefix ---
        const stripped = stripPrefix(raw, prefix);
        core.info(`After stripping prefix "${prefix}": ${stripped}`);

        // --- Parse semver ---
        const parsed = parseVersion(stripped, strict);
        if (!parsed) {
            throw new Error(`Failed to parse "${stripped}" as a semver version${strict ? ' (strict mode)' : ''}`);
        }

        // --- Set outputs ---
        core.setOutput('version', parsed.version);
        core.setOutput('major', parsed.major.toString());
        core.setOutput('minor', parsed.minor.toString());
        core.setOutput('patch', parsed.patch.toString());
        core.setOutput('prerelease', parsed.prerelease);
        core.setOutput('is-prerelease', parsed.isPrerelease.toString());

        core.info(`Parsed version: ${parsed.version}`);
        core.info(`Components: major=${parsed.major} minor=${parsed.minor} patch=${parsed.patch}`);
        if (parsed.isPrerelease) {
            core.info(`Prerelease: ${parsed.prerelease}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('An unexpected error occurred');
        }
    }
}

run();
