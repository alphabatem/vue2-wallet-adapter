<template>
	<wallet-modal-provider @close="selectWalletOpened = !selectWalletOpened" :featured="featured" :container="container" :logo="logo" :dark="dark" :open="selectWalletOpened">
		<template>
			<slot>
				<button v-if="!wallet" class="swv-button swv-button-trigger btn btn-primary text-white" @click="(e) => openSelectWallet(e)">
					Select Wallet
				</button>
				<div v-else-if="!publicKeyBase58" @mouseover="openDropdown">
					<wallet-connect-button :connecting="connecting" :wallet="wallet" @connect="doConnect"></wallet-connect-button>
					<!--					<span class="swv-change-wallet-text" @click="(e) => openDropdown(e)">Change Wallet</span>-->
				</div>
				<div v-else class="swv-dropdown">
					<slot name="dropdown-button">
						<button
								@mouseover="openDropdown"
								class="swv-button swv-button-trigger btn btn-primary text-white"
								:style="{ pointerEvents: dropdownOpened ? 'none' : 'auto' }"
								:aria-expanded="dropdownOpened"
								:title="publicKeyBase58"
						>
							<wallet-icon :wallet="wallet"></wallet-icon>
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
							<li @click="disconnect" class="swv-dropdown-list-item" role="menuitem">
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
			canCopy: true,
			addressCopied: false,
			wallet: null,
			disconnect: null,
			connect: null,
			dropdownPanel: null,
			dropdownOpened: false,
			selectWalletOpened: false,
		}
	},
	computed: {
		publicKeyBase58: function () {
			return this.wallet?.publicKey?.toBase58()
		},

		publicKeyTrimmed: function () {
			if (!this.wallet || !this.publicKeyBase58) return null;
			return this.publicKeyBase58.slice(0, 4) + ".." + this.publicKeyBase58.slice(-4);
		}
	},
	methods: {
		doConnect: function (e) {
			console.log("Connecting", this.wallet)
			if (!this.wallet) {
				this.onWalletError(new Error("Wallet not found"))
				return
			}

			console.log(`doConnect "${this.publicKeyBase58}"`, this.wallet)
			this.connect()
			this.updateWallet()
		},

		onWalletError: function (e) {
			console.log("Button: Wallet disconnected", e)
			this.closeDropdown(e)
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
		closeSelectWallet: function (e) {
			this.selectWalletOpened = false
		},
		/**
		 * @type function
		 */
		openDropdown: function (e) {
			console.log("Opening dropdown")
			this.dropdownOpened = true
		},
		/**
		 * @type function
		 */
		closeDropdown: function (e) {
			this.dropdownOpened = false
		},

		updateWallet: function () {
			this.$forceUpdate()
		}
	},
	beforeMount() {
		initWallet({
			wallets: this.wallets,
			autoConnect: this.autoConnect,
			openOnboardingUrls: this.openOnboardingUrls,
			onError: this.onWalletError
		})
	},
	mounted() {
		try {
			const {publicKey, wallet, disconnect, connect, setWallet, readyState} = useWallet();
			this.wallet = wallet
			this.disconnect = disconnect
			this.connect = connect

			if (this.wallet) {
				console.debug("selecting wallet:", this.wallet)
				setWallet(this.wallet)
			}
		} catch (e) {
			console.error("Unable to init wallet", e)
		}
	}
}
</script>