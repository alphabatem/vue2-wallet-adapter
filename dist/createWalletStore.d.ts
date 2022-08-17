import { Adapter, MessageSignerWalletAdapter, SendTransactionOptions, SignerWalletAdapter, WalletError, WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import type { Connection, PublicKey, Transaction, TransactionSignature } from "@solana/web3.js";
import { Ref } from "vue";
export declare type Wallet = Adapter;
export interface WalletStore {
    wallets: Ref<Wallet[]>;
    autoConnect: Ref<boolean>;
    wallet: Ref<Wallet | null>;
    publicKey: Ref<PublicKey | null>;
    readyState: Ref<WalletReadyState>;
    ready: Ref<boolean>;
    connected: Ref<boolean>;
    connecting: Ref<boolean>;
    disconnecting: Ref<boolean>;
    select(walletName: WalletName): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(transaction: Transaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature>;
    signTransaction: Ref<SignerWalletAdapter["signTransaction"] | undefined>;
    signAllTransactions: Ref<SignerWalletAdapter["signAllTransactions"] | undefined>;
    signMessage: Ref<MessageSignerWalletAdapter["signMessage"] | undefined>;
}
export interface WalletStoreProps {
    wallets?: Wallet[] | Ref<Wallet[]>;
    autoConnect?: boolean | Ref<boolean>;
    onError?: (error: WalletError) => void;
    localStorageKey?: string;
}
export declare const createWalletStore: ({ wallets: initialWallets, autoConnect: initialAutoConnect, onError, localStorageKey, }: WalletStoreProps) => WalletStore;
