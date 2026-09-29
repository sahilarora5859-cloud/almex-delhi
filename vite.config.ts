import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

function showroomSyncPlugin(): Plugin {
  return {
    name: 'showroom-sync-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-showroom-data', (req, res, next) => {
        if (req.method !== 'POST') return next();

        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });

        req.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            const { items, config } = parsed;

            const publicImgDir = path.resolve(process.cwd(), 'public/images');
            if (!fs.existsSync(publicImgDir)) {
              fs.mkdirSync(publicImgDir, { recursive: true });
            }

            // Save any base64 images into public/images so they are permanent real files
            const processedItems = (items || []).map((item: any, idx: number) => {
              if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:image/')) {
                const match = item.imageUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                if (match) {
                  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
                  const fileName = `chair-${item.id || idx}-${Date.now()}.${ext}`;
                  const filePath = path.join(publicImgDir, fileName);
                  fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
                  return { ...item, imageUrl: `./images/${fileName}` };
                }
              }
              return item;
            });

            // Process config images
            const processedConfig = { ...(config || {}) };
            for (const key of Object.keys(processedConfig)) {
              const val = processedConfig[key];
              if (val && typeof val === 'string' && val.startsWith('data:image/')) {
                const match = val.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
                if (match) {
                  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
                  const fileName = `bg-${key}-${Date.now()}.${ext}`;
                  const filePath = path.join(publicImgDir, fileName);
                  fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
                  processedConfig[key] = `./images/${fileName}`;
                }
              }
            }

            // Write permanently into src/data/userShowroomData.json
            const targetJsonPath = path.resolve(process.cwd(), 'src/data/userShowroomData.json');
            fs.writeFileSync(
              targetJsonPath,
              JSON.stringify(
                {
                  items: processedItems,
                  config: processedConfig,
                  updatedAt: new Date().toISOString(),
                },
                null,
                2
              ),
              'utf8'
            );

            console.log(`[Showroom Sync] Successfully saved ${processedItems.length} items & config to codebase!`);

            // Copy public/images to docs/images immediately
            const docsImgDir = path.resolve(process.cwd(), 'docs/images');
            if (!fs.existsSync(docsImgDir)) {
              fs.mkdirSync(docsImgDir, { recursive: true });
            }
            if (fs.existsSync(publicImgDir)) {
              fs.cpSync(publicImgDir, docsImgDir, { recursive: true });
            }

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Connection': 'close',
            });
            res.end(JSON.stringify({ success: true, count: processedItems.length }));
          } catch (err: any) {
            console.error('[Showroom Sync] Error processing sync:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    showroomSyncPlugin(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
