import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

import { build } from "esbuild";
import { globby } from 'globby';
import { gzipSizeFromFileSync } from 'gzip-size';
import bytes from 'pretty-bytes';
import colors from 'chalk';
import { generateDtsBundle } from 'dts-bundle-generator'

async function run() {
    const files = await globby(['src/**/*.ts', '!src/env.d.ts']);
    const output = {};
    const promises = [];
    for (const file of files) {
        promises.push(
            build({
                metafile: true,
                entryPoints: [file],
                outfile: file.replace('src', 'dist').replace('.ts', '.js'),
                external: ["../selector.js", "../index.js", "./index.js"],
                bundle: true,
                format: 'esm',
                minify: true,
                sourcemap: 'external',
                target: 'node16',
                platform: 'node',
            }).then((metadata) => {
                const file = Object.keys(metadata.metafile.outputs)[1]
                const size = gzipSizeFromFileSync(file);
                const b = bytes(size);
                output[file] = b;
            })
        )
    }
    await Promise.all(promises);
    const bundles = generateDtsBundle(files.map(filePath => {
        /** @type {import('dts-bundle-generator').EntryPointConfig} */
        const config = {
            filePath,
            libraries: {
                inlinedLibraries: ['media-query-fns']
            },
            output: {
                exportReferencedTypes: false,
            }
        }
        return config;
    }), { preferredConfigPath: 'tsconfig.json' });
    for (let i = 0; i < files.length; i++) {
        const dts = bundles[i];
        const file = files[i].replace('src', 'dist').replace('.ts', '.d.ts')
        mkdirSync(path.join(file, '..'), { recursive: true })
        writeFileSync(file, dts, { encoding: 'utf8' })
    }

    for (const [file, size] of Object.entries(output).sort(([a], [b]) => a.localeCompare(b))) {
        console.log(`${file} ${colors.green(size)}`);
    }
}

run();
