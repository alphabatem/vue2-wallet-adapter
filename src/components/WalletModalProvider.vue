<template>
	<div>
		<div :class="dark ? 'swv-dark' : ''">
			<slot></slot>
		</div>
		<portal :to="container" v-if="open">
			<div
					aria-labelledby="swv-modal-title"
					aria-modal="true"
					class="swv-modal"
					:class="dark ? 'swv-dark' : ''"
					role="dialog"
			>
				<slot name="overlay">
					<div @click="closeModal" class="swv-modal-overlay"/>
				</slot>
				<div class="swv-modal-container" ref="modalPanel">
					<slot name="modal">
						<div
								class="swv-modal-wrapper"
								:class="{ 'swv-modal-wrapper-no-logo': !hasLogo }"
						>
							<div class="swv-modal-logo-wrapper" v-if="hasLogo">
								<slot name="logo">
									<img alt="logo" class="swv-modal-logo" :src="logo"/>
								</slot>
							</div>
							<h1 class="swv-modal-title" id="swv-modal-title">
								Connect Wallet
							</h1>
							<button @click.prevent="closeModal" class="swv-modal-button-close">
								<svg width="14" height="14">
									<path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z"/>
								</svg>
							</button>
							<ul class="swv-modal-list">
								<li
										v-for="wallet in walletsToDisplay"
										:key="wallet.name || wallet.adapter.name"
										@click="() => onSelect(wallet.name || wallet.adapter.name)"
								>
									<button class="swv-button">
										<p v-text="wallet.name || wallet.adapter.name"></p>
										<wallet-icon :wallet="wallet"></wallet-icon>
									</button>
								</li>
							</ul>
							<button
									v-if="hiddenWallets.length > 0"
									aria-controls="swv-modal-collapse"
									:aria-expanded="expandedWallets"
									class="swv-button swv-modal-collapse-button"
									:class="{ 'swv-modal-collapse-button-active': expandedWallets }"
									@click="() => expandedWallets = !expandedWallets"
							>
								{{ expandedWallets ? "Less" : "More" }} options
								<i class="swv-button-icon">
									<svg width="11" height="6" xmlns="http://www.w3.org/2000/svg">
										<path
												d="m5.938 5.73 4.28-4.126a.915.915 0 0 0 0-1.322 1 1 0 0 0-1.371 0L5.253 3.736 1.659.272a1 1 0 0 0-1.371 0A.93.93 0 0 0 0 .932c0 .246.1.48.288.662l4.28 4.125a.99.99 0 0 0 1.37.01z"/>
									</svg>
								</i>
							</button>
						</div>
					</slot>
				</div>
			</div>
		</portal>
	</div>
</template>

<script>
import WalletIcon from './WalletIcon.vue';


export default {
	name: "WalletModalProvider",
	components: {
		WalletIcon,
	},
	props: {
		open: {type: Boolean},
		featured: {type: Number, default: 3},
		container: {type: String, default: 'body'},
		logo: {type: String},
		dark: {type: Boolean},
		wallets: {type: Array},
	},
	data() {
		return {
			modalPanel: null,
			expandedWallets: false,
			selectWallet: null,
		}
	},
	computed: {

		hasLogo: function () {
			return !!this.logo
		},

		featuredWallets: function () {
			return this.wallets.slice(0, this.featured)
		},
		hiddenWallets: function () {
			return this.wallets.slice(this.featured)
		},
		walletsToDisplay: function () {
			return this.expandedWallets ? this.wallets : this.featuredWallets
		}
	},
	methods: {
		closeModal: function () {
			this.$emit("close")
		},

		onSelect: function (walletName) {
			console.debug("Wallet selected", walletName)

			this.$emit("select", walletName)
			this.closeModal();
		}
	}
}
</script>
