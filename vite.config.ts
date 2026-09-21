import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const galleryDirectory = resolve(process.cwd(), 'public/images/gallery');
const galleryManifestScript = resolve(process.cwd(), 'scripts/generate-gallery-manifest.mjs');

const galleryManifestPlugin = () => ({
	name: 'gallery-manifest-watcher',
	configureServer(server: { watcher: { on: (event: string, callback: (file: string) => void) => void }; ws: { send: (message: { type: string }) => void } }) {
		const refreshGallery = (file: string) => {
			if (!file.startsWith(galleryDirectory)) return;
			execFileSync(globalThis.process.execPath, [galleryManifestScript], { cwd: globalThis.process.cwd(), stdio: 'ignore' });
			server.ws.send({ type: 'full-reload' });
		};
		server.watcher.on('add', refreshGallery);
		server.watcher.on('unlink', refreshGallery);
	},
});

export default defineConfig({
	plugins: [react(), galleryManifestPlugin()],
	test: { exclude: ['e2e/**', 'node_modules/**'] },
});
