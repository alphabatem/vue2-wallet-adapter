<template>
	<wallet-modal-provider @close="dropdownOpened = !dropdownOpened" :featured="featured" :container="container" :logo="logo" :dark="dark" :open="dropdownOpened">
		<template>
			<slot>
				<button v-if="!wallet" class="swv-button swv-button-trigger btn btn-primary text-white" @click="(e) => openDropdown(e)">
					Select Wallet
				</button>
				<div v-else-if="!publicKeyBase58">
					<wallet-connect-button :wallet="wallet" @connect="doConnect"></wallet-connect-button>
					<span class="swv-change-wallet-text" @click="(e) => openDropdown(e)">Change Wallet</span>
				</div>
				<div v-else class="swv-dropdown">
					<slot name="dropdown-button">
						<button
								class="swv-button swv-button-trigger btn btn-primary text-white"
								:style="{ pointerEvents: dropdownOpened ? 'none' : 'auto' }"
								:aria-expanded="dropdownOpened"
								:title="publicKeyBase58"
								@click="(e) => openDropdown(e)"
						>
							<wallet-icon :wallet="wallet"></wallet-icon>
							<p v-text="publicKeyTrimmed"></p>
						</button>
					</slot>
					<slot name="dropdown">
						<ul
								aria-label="dropdown-list"
								class="swv-dropdown-list"
								:class="{ 'swv-dropdown-list-active': dropdownOpened }"
								ref="dropdownPanel"
								role="menu"
						>
							<slot name="dropdown-list">
								<li v-if="canCopy" @click="copyAddress" class="swv-dropdown-list-item" role="menuitem">
									{{ addressCopied ? "Copied" : "Copy address" }}
								</li>
								<li @click="(e) => {openDropdown(); closeDropdown();}" class="swv-dropdown-list-item" role="menuitem">
									Change wallet
								</li>
								<li @click="disconnect" class="swv-dropdown-list-item" role="menuitem">
									Disconnect
								</li>
							</slot>
						</ul>
					</slot>
				</div>
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
		autoConnect: {type: Boolean, default: false},
		openOnboardingUrls: {type: Boolean, default: false},
		wallets: {type: Array, required: true}
	},
	data() {
		return {
			canCopy: false,
			addressCopied: false,
			publicKey: null,
			wallet: null,
			disconnect: null,
			connect: null,
			dropdownPanel: null,
			dropdownOpened: false,
		}
	},
	computed: {

		publicKeyBase58: function() {
			return this.publicKey?.toBase58()
		},

		publicKeyTrimmed: function() {
			if (!this.wallet || !this.publicKeyBase58) return null;
			return this.publicKeyBase58.slice(0, 4) + ".." + this.publicKeyBase58.slice(-4);
		}
	},
	methods: {
		doConnect: function(e){
			if (!this.wallet)
				return

			console.log("doConnect", this.wallet)
			this.connect()
		},

		copyAddress: () => {
		},
		/**
		 * @type function
		 */
		openDropdown: function(e) {
			this.dropdownOpened = true
		},
		/**
		 * @type function
		 */
		closeDropdown: function(e) {
			this.dropdownOpened = false
		},
	},
	// mounted() {
	//
	// 	const {publicKey, wallet, disconnect, connect, select} = useWallet();
	// 	this.publicKey = publicKey
	// 	this.wallet = wallet
	// 	this.disconnect = disconnect
	// 	this.connect = connect
	//
	// 	console.log("WalletMultiButton Mounted", this.wallet)
	// 	// if (this.wallet) {
	// 	// 	console.log("Selecting wallet", this.wallet.name)
	// 	// 	select(this.wallet.name)
	// 	// }
	// 	// this.connect().then(r => {
	// 	// 	console.log("Wallet connected")
	// 	// 	this.$emit("connected")
	// 	// })
	// },
	beforeMount() {
		initWallet({
			wallets: this.wallets,
			autoConnect: this.autoConnect,
			openOnboardingUrls: this.openOnboardingUrls
		})

		const {publicKey, wallet, disconnect, connect, setWallet, readyState} = useWallet();
		this.publicKey = publicKey
		this.wallet = wallet
		this.disconnect = disconnect
		this.connect = connect

		if (this.wallet) {
			console.debug("selecting wallet:", this.wallet)
			setWallet(this.wallet)
		}
	}
}
</script>