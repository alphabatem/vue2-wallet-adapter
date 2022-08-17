# vue2-wallet-adapter
Solana Wallet Adapter for Vue 2


Fork of Vue3 Wallet adapter by @lorisleiva:
```json
https://github.com/lorisleiva/solana-wallets-vue
```


# Solana Wallets Vue
Integrates Solana wallets in your Vue 3 applications.

⚡️ [View demo](https://solana-wallets-vue-demo.netlify.app/) / [Browse demo code](./example)

<img width="1230" alt="solana-wallets-vue" src="https://user-images.githubusercontent.com/3642397/152684955-079b4505-a7bb-4be7-976b-a0a5a59acf92.png">

## Installation

To get started, you'll need to install the `@alphabatem/vue2-wallet-adapter` npm package as well as the wallets adapters provided by Solana.

```shell
yarn add @alphabatem/vue2-wallet-adapter @solana/wallet-adapter-wallets
```

## Setup

You can initialise the wallet store manually using the `initWallet` method like so.

```js
import { initWallet } from 'solana-wallets-vue';
initWallet(walletOptions);
```

Finally, import and render the `WalletMultiButton` component to allow users to select a wallet et connect to it.

```vue
<script setup>
import { WalletMultiButton } from 'solana-wallets-vue'
</script>

<template>
  <wallet-multi-button></wallet-multi-button>
</template>
```

If you prefer the dark mode, simply provide the `dark` boolean props to the component above.

```html
<wallet-multi-button dark></wallet-multi-button>
```

## Usage

You can then call `useWallet()` at any time to access the wallet store — or access the `$wallet` global propery instead.

Here's an example of a function that sends one lamport to a random address.

```js
import { useWallet } from 'solana-wallets-vue';
import { Connection, clusterApiUrl, Keypair, SystemProgram, Transaction } from '@solana/web3.js';

export const sendOneLamportToRandomAddress = () => {
  const connection = new Connection(clusterApiUrl('devnet'))
  const { publicKey, sendTransaction } = useWallet();
  if (!publicKey.value) return;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey.value,
      toPubkey: Keypair.generate().publicKey,
      lamports: 1,
    })
  );

  const signature = await sendTransaction(transaction, connection);
  await connection.confirmTransaction(signature, 'processed');
};
```
