<template>
	<div>
		<button
				class="swv-button swv-button-trigger btn btn-primary text-white"
				:disabled="disabled || !wallet || connecting || connected"
				@click="(e) => onClick(e)"
		>
			<wallet-icon v-if="wallet" :wallet="wallet"></wallet-icon>
			<p v-text="content"></p>
		</button>
	</div>
</template>

<script>
import {useWallet} from "@/useWallet";
import WalletIcon from "./WalletIcon.vue";

export default {
	name: "WalletConnectButton",
	components: {
		WalletIcon,
	},
	props: {
		disabled: {
			type: Boolean
		}
	},
	data() {
		return {
			wallet: null,
			connect: null,
			connecting: false,
			connected: false,
		}
	},
	computed: {
		content: function () {
			if (this.connecting) return "Connecting ...";
			if (this.connected) return "Connected";
			if (this.wallet) return "Connect";
			return "Connect Wallet";
		}
	},
	methods: {
		onClick: (event) => {
			if (event.defaultPrevented || !this.connect) return;
			this.connect().catch(() => {
			});
		}
	},
	mounted() {
		const {wallet, connect, connecting, connected} = useWallet();
		this.wallet = wallet
		this.connect = connect
		this.connecting = connecting
		this.connected = connected
	}
}
</script>