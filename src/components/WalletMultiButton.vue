<template>
	<wallet-modal-provider @close="selectWalletOpened = !selectWalletOpened" :featured="featured" :container="container" :logo="logo" :dark="dark" :open="selectWalletOpened"
			:wallets="adapter.wallets" @select="onSelect">
		<template>
			<slot>
				<button v-if="!adapter.wallet" class="swv-button swv-button-trigger btn btn-primary text-white" @click="(e) => openSelectWallet(e)">
					Select Wallet
				</button>
				<div v-else-if="!publicKeyBase58" @mouseover="openDropdown">
					<wallet-connect-button :connecting="connecting" :wallet="adapter.wallet" @click="doConnect"></wallet-connect-button>
				</div>
				<div v-else class="swv-dropdown">
					<slot name="dropdown-button">
						<button
								@click="openDropdown"
								class="swv-button swv-button-trigger btn btn-primary text-white"
								:style="{ pointerEvents: dropdownOpened ? 'none' : 'auto' }"
								:aria-expanded="dropdownOpened"
								:title="publicKeyBase58"
						>
							<wallet-icon :wallet="adapter.wallet"></wallet-icon>
							<span v-text="publicKeyTrimmed"></span>
						</button>
					</slot>
				</div>
				<slot v-if="dropdownOpened" name="dropdown">
					<ul
							aria-label="dropdown-list"
							class="swv-dropdown-list"
							:class="{ 'swv-dropdown-list-active': dropdownOpened }"
							ref="dropdownPanel"
							role="menu"
					>
						<slot name="dropdown-list">
							<li v-if="canCopy" @click="(e) => {copyAddress(e); closeDropdown(e);}" class="swv-dropdown-list-item" role="menuitem">
								{{ addressCopied ? "Copied" : "Copy address" }}
							</li>
							<li @click="(e) => {openSelectWallet(e); closeDropdown(e);}" class="swv-dropdown-list-item" role="menuitem">
								Change wallet
							</li>
							<li @click="(e) => {onDisconnect(e); closeDropdown(e);}" class="swv-dropdown-list-item" role="menuitem">
								Disconnect
							</li>
						</slot>
					</ul>
				</slot>
			</slot>
		</template>

		<!-- Enable modal overrides. -->
		<template>
			<slot name="modal-overlay"></slot>
		</template>
		<template>
			<slot name="modal"></slot>
		</template>
	</wallet-modal-provider>
</template>


<script>
import {initWallet, useWallet} from "@/useWallet";
import WalletConnectButton from "./WalletConnectButton.vue";
import WalletIcon from "./WalletIcon.vue";
import WalletModalProvider from "./WalletModalProvider.vue";

export default {
	name: "WalletMultiButton",
	components: {
		WalletConnectButton,
		WalletIcon,
		WalletModalProvider,
	},
	props: {
		featured: {type: Number, default: 3},
		container: {type: String, default: 'body'},
		logo: {type: String},
		dark: {type: Boolean},
		connecting: {type: Boolean},
		autoConnect: {type: Boolean, default: false},
		openOnboardingUrls: {type: Boolean, default: false},
		wallets: {type: Array, required: true}
	},
	data() {
		return {
			adapter: null,
			canCopy: true,
			addressCopied: false,
			dropdownPanel: null,
			dropdownOpened: false,
			selectWalletOpened: false,
			isLegacy: false,
		}
	},
	watch: {
		"adapter.connected": function () {
			console.log("Connection change", this.adapter.connected)

			if (this.adapter.connected)
				this.$emit("connect", this.adapter.wallet)
			else if (this.adapter.wallet && this.adapter.connected)
				this.$emit("disconnect")
		}
	},
	computed: {
		publicKeyBase58: function () {
			if (this.isLegacy)
				return window.solflare?.publicKey?.toString()

			return this.adapter?.publicKey?.toBase58()
		},

		publicKeyTrimmed: function () {
			if (!this.adapter.wallet || !this.publicKeyBase58) return null;
			return this.publicKeyBase58.slice(0, 4) + ".." + this.publicKeyBase58.slice(-4);
		}
	},
	methods: {

		/**
		 * @type function
		 */
		onSolflare: function (e) {
			console.log("onSolflare", e)


			window.solflare.connect().then(() => {
				console.log("Solflare connected", window.solflare?.publicKey)

				localStorage.setItem("walletName", "Solflare")
				this.isLegacy = true
				this.adapter.setSolflare(window.solflare)
				this.$emit("connect", {adapter: window.solflare})
			})
		},


		/**
		 * @type function
		 */
		onSelect: function (e) {
			console.log("onSelect", e)
			// if (e === "Solflare") {
			// 	return this.onSolflare(e)
			// }

			this.adapter.select(e)

			this.$nextTick(() => {
				console.log("Connecting to wallet")
				this.doConnect()
			})
		},


		/**
		 * @type function
		 */
		onDisconnect: function (e) {
			console.log("WMB: onDisconnect", e)
			this.isLegacy = false
			this.adapter.disconnect()
			this.$emit("disconnect")
		},

		/**
		 * @type function
		 */
		doConnect: async function () {		//
			this.adapter.connect().then(() => {
				console.log("Adapter connected")
				this.$emit("connect", this.adapter.wallet)
			}).catch(e => {
				console.error("Failed to connect to adapter", e)
			})
		},

		onWalletError: function (e, a) {
			console.error("onWalletError", e)
			this.$emit("error", e)
		},

		copyAddress: function (e) {
			navigator.clipboard.writeText(this.publicKeyBase58);
			this.$emit("copy", this.publicKeyBase58)
		},
		/**
		 * @type function
		 */
		openSelectWallet: function (e) {
			this.selectWalletOpened = true
		},
		/**
		 * @type function
		 */
		openDropdown: function (e) {
			if (!this.adapter.wallet)
				return

			this.dropdownOpened = true
		},
		/**
		 * @type function
		 */
		closeDropdown: function (e) {
			this.dropdownOpened = false
		},
	},
	beforeMount() {
		initWallet({
			wallets: this.wallets,
			autoConnect: this.autoConnect,
			openOnboardingUrls: this.openOnboardingUrls,
		})
		this.adapter = useWallet()
	}
}
</script>