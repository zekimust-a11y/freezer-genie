import { build } from 'esbuild';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function buildFunctions() {
  const functionsDir = 'netlify/functions';
  const files = await readdir(functionsDir);
  const tsFiles = files.filter(f => f.endsWith('.ts') && f !== 'schema.ts');

  console.log('Building Netlify Functions...');
  
  for (const file of tsFiles) {
    const name = file.replace('.ts', '');
    console.log(`Building ${name}...`);
    
    await build({
      entryPoints: [join(functionsDir, file)],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: join(functionsDir, `${name}.mjs`),
      external: ['pg-native'],
      minify: false,
      sourcemap: true,
    });
  }
  
  console.log('✅ All functions built successfully!');
}

buildFunctions().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
