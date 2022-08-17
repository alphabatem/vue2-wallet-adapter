import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
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
			external: ['vue', '@solana/web3.js', '@solana/wallet-adapter-base'],
			output: {
				exports: 'named',
				globals: {
					vue: 'Vue',
					'@solana/web3.js': 'SolanaWeb3',
					'@solana/wallet-adapter-base': 'SolanaWalletAdapterBase',
				},
			},
		},
		sourcemap: true,
		minify: false,
	},
})