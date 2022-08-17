import { PublicKey, Transaction } from '@solana/web3.js';
import { Ref } from 'vue';
export interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
export declare function useAnchorWallet(): Ref<AnchorWallet | undefined>;
