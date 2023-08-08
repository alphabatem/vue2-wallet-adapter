import {defineConfig} from 'vite'
import {createVuePlugin} from 'vite-plugin-vue2'

const path = require('path')

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [createVuePlugin()],
	resolve: {
		dedupe: ['vue'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	define: {
		'process.env': {}
	},
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'vue2-wallet-adapter',
		},
		rollupOptions: {
			external: [
				"@solana/wallet-adapter-base",
				"@solana/web3.js",
				"vue",
			],
			output: {
				exports: 'named',
				globals: {
					"@solana/wallet-adapter-base": "SolanaWalletAdapterBase",
					"@solana/web3.js": "SolanaWeb3",
					vue: "Vue",
				},
			},
		},
		sourcemap: true,
		minify: false,
	},
})