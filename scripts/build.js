import { build } from "esbuild";
import { globby } from 'globby';
import { gzipSizeFromFileSync } from 'gzip-size';
import bytes from 'pretty-bytes';
import colors from 'chalk';

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
    for (const [file, size] of Object.entries(output).sort(([a], [b]) => a.localeCompare(b))) {
        console.log(`${file} ${colors.green(size)}`);
    }
}

run();
