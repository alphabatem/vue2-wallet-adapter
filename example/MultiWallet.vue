<template>
	<WalletMultiButton :wallets="wallets" dark></WalletMultiButton>
</template>

<script>
import WalletMultiButton from "../src/WalletMultiButton";
import {PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export default {
	name: "MultiWallet",
	components: {
		WalletMultiButton
	},
	props: {
		button_text: {
			type: String,
			default: function () {
				return "Connect Wallet"
			}
		}
	},
	data() {
		return {
			wallets: [
				// new AlphaWalletAdapter()
				new PhantomWalletAdapter(),
				new SolflareWalletAdapter(),
			]
		}
	},
}
</script>

<style scoped>
</style>
