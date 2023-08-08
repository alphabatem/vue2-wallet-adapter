<template>
	<i class="swv-button-icon">
		<img v-if="wallet" :src="wallet.icon || wallet.adapter.icon" :alt="`${wallet.name || wallet.adapter.name} icon`"/>
	</i>
</template>

<script>
export default {
	name: "WalletIcon",
	props: {
		wallet: Object
	}
}
</script>
