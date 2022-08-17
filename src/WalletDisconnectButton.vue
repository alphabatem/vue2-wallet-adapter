<template>
	<div>
		<button
				class="swv-button swv-button-trigger"
				:disabled="disabled || disconnecting || !wallet"
				@click="handleClick"
		>
			<wallet-icon v-if="wallet" :wallet="wallet"></wallet-icon>
			<p v-text="content"></p>
		</button>
	</div>
</template>
<script>
import { useWallet } from "./useWallet.ts";
import WalletIcon from "./WalletIcon.vue";

export default {
	name: "WalletDisconnectButton",
	components: {
		WalletIcon,
	},
	props: {
		disabled: Boolean,
	},
	data() {
		return {
			wallet: null,
			disconnect: null,
			disconnecting: false
		}
	},
	computed: {
		content: () => {
			if (this.disconnecting) return "Disconnecting ...";
			if (this.wallet) return "Disconnect";
			return "Disconnect Wallet";
		}
	},
	methods: {
		handleClick: (event) => {
			this.emit("click", event);
			if (event.defaultPrevented) return;
			this.disconnect().catch(() => {
			});
		},
	},
	mounted() {

		const {wallet, disconnect, disconnecting} = useWallet();
		this.wallet = wallet
		this.disconnect = disconnect
		this.disconnecting = disconnecting
	}

};
</script>
