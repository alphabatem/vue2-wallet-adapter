import { WalletNotInitializedError } from './errors';
import { createWalletStore } from './createWalletStore';
let walletStore = null;
export const useWallet = () => {
    if (walletStore)
        return walletStore;
    throw new WalletNotInitializedError('Wallet not initialized. Please use the `initWallet` method to initialize the wallet.');
};
export const initWallet = (walletStoreProps) => {
    walletStore = createWalletStore(walletStoreProps);
};
//# sourceMappingURL=useWallet.js.map