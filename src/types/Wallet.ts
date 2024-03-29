import type { Adapter, WalletReadyState } from "@solana/wallet-adapter-base";

export type Wallet = {
  adapter: Adapter;
  readyState: WalletReadyState;
  name?: string;
  url?: string,
  icon?: string,
};
