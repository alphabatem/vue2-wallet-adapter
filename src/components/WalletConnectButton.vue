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
import WalletIcon from "./WalletIcon.vue";

export default {
	name: "WalletConnectButton",
	components: {
		WalletIcon,
	},
	props: {
		disabled: {
			type: Boolean
		},
		wallet: null,
		connect: null,
	},
	data() {
		return {
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
		onClick: function (event) {
			this.$emit('connect')
			return;

			if (event.defaultPrevented || !this.connect) return;
			this.connect().catch((e) => {
				console.error("Unable to connect", e)
			});
		}
	},
}
</script>