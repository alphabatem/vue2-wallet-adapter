import type {Adapter} from "@solana/wallet-adapter-base";
import {WalletNotReadyError, WalletReadyState} from "@solana/wallet-adapter-base";
import type {Cluster} from "@solana/web3.js";
import type {Ref} from "vue";
import {ref, shallowRef} from "vue";
import {
	useAdapterListeners,
	useAutoConnect,
	useEnvironment,
	useErrorHandler,
	useMobileWalletAdapters,
	useReadyStateListeners,
	useSelectWalletName,
	useStandardWalletAdapters,
	useTransactionMethods,
	useUnloadingWindow,
	useWalletState,
	useWrapAdaptersInWallets,
} from "./composables";
import {WalletNotSelectedError} from "./errors";
import type {WalletStore, WalletStoreProps} from "./types";

export const createWalletStore = ({
									  wallets: initialAdapters = [],
									  autoConnect: initialAutoConnect = false,
									  cluster: initialCluster = "mainnet-beta",
									  onError,
									  localStorageKey = "walletName",
								  }: WalletStoreProps): WalletStore => {
	// Initial variables and loading states.
	const cluster: Ref<Cluster> = ref(initialCluster);
	const connecting = ref<boolean>(false);
	const disconnecting = ref<boolean>(false);

	// From raw adapters to computed list of wallets.
	const rawAdapters: Ref<Adapter[]> = shallowRef(initialAdapters);
	const rawAdaptersWithSwa = useStandardWalletAdapters(rawAdapters);
	const {isMobile, uriForAppIdentity} = useEnvironment(rawAdaptersWithSwa);
	const adapters = useMobileWalletAdapters(
		rawAdaptersWithSwa,
		isMobile,
		uriForAppIdentity,
		cluster
	);
	const wallets = useWrapAdaptersInWallets(adapters);

	// Wallet selection and state.
	const {name, isUsingMwaAdapterOnMobile, select, deselect} = useSelectWalletName(localStorageKey, isMobile);
	const {
		wallet,
		publicKey,
		connected,
		readyState,
		ready,
		refreshWalletState,
	} = useWalletState(wallets, name);

	// Window listeners and error handling.
	const unloadingWindow = useUnloadingWindow(isUsingMwaAdapterOnMobile);
	const handleError = useErrorHandler(unloadingWindow, onError);

	// Wallet listeners.
	useReadyStateListeners(wallets);
	useAdapterListeners(
		wallet,
		unloadingWindow,
		isUsingMwaAdapterOnMobile,
		deselect,
		refreshWalletState,
		handleError
	);

	// Auto-connect feature.
	const autoConnect = useAutoConnect(
		initialAutoConnect,
		wallet,
		isUsingMwaAdapterOnMobile,
		connecting,
		connected,
		ready,
		deselect
	);

	// Transaction methods.
	const {sendTransaction, signTransaction, signAllTransactions, signMessage} =
		useTransactionMethods(wallet, handleError);

	// Connect the wallet.
	const connect = async (): Promise<void> => {
		console.log("Connect:Wallet", wallet.value)

		if (connected.value || connecting.value || disconnecting.value) return;
		if (!wallet.value) throw handleError(new WalletNotSelectedError());
		const adapter = wallet.value.adapter;
		if (!ready.value) throw handleError(new WalletNotReadyError(), adapter);

		console.log("Connecting to adapter", adapter)
		try {
			connecting.value = true;
			await adapter.connect();
		} catch (error: any) {
			deselect();
			// handleError will also be called.
			throw error;
		} finally {
			connecting.value = false;
		}
	};

	// Disconnect the wallet adapter.
	const disconnect = async (): Promise<void> => {
		console.log("Disconnecting to adapter", wallet.value, disconnecting.value)
		if (disconnecting.value || !wallet.value) return;
		try {
			disconnecting.value = true;
			await wallet.value.adapter.disconnect();
			wallet.value = null;

		} finally {
			disconnecting.value = false;
		}
	};

	const setSolflare = (sf: any): void => {
		// @ts-ignore
		console.log("setSolflare", sf, window.solflare?.publicKey?.toString())
		connecting.value = false
		connected.value = true

		// @ts-ignore
		publicKey.value = window.solflare?.publicKey
		wallet.value = {
			icon: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIHdpZHRoPSI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGxpbmVhckdyYWRpZW50IGlkPSJhIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZmMxMGIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmYjNmMmUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iYiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI2LjQ3ODM1IiB4Mj0iMzQuOTEwNyIgeGxpbms6aHJlZj0iI2EiIHkxPSI3LjkyIiB5Mj0iMzMuNjU5MyIvPjxyYWRpYWxHcmFkaWVudCBpZD0iYyIgY3g9IjAiIGN5PSIwIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDQuOTkyMTg4MzIgMTIuMDYzODc5NjMgLTEyLjE4MTEzNjU1IDUuMDQwNzEwNzQgMjIuNTIwMiAyMC42MTgzKSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHI9IjEiIHhsaW5rOmhyZWY9IiNhIi8+PHBhdGggZD0ibTI1LjE3MDggNDcuOTEwNGMuNTI1IDAgLjk1MDcuNDIxLjk1MDcuOTQwM3MtLjQyNTcuOTQwMi0uOTUwNy45NDAyLS45NTA3LS40MjA5LS45NTA3LS45NDAyLjQyNTctLjk0MDMuOTUwNy0uOTQwM3ptLTEuMDMyOC00NC45MTU2NWMuNDY0Ni4wMzgzNi44Mzk4LjM5MDQuOTAyNy44NDY4MWwxLjEzMDcgOC4yMTU3NGMuMzc5OCAyLjcxNDMgMy42NTM1IDMuODkwNCA1LjY3NDMgMi4wNDU5bDExLjMyOTEtMTAuMzExNThjLjI3MzMtLjI0ODczLjY5ODktLjIzMTQ5Ljk1MDcuMDM4NTEuMjMwOS4yNDc3Mi4yMzc5LjYyNjk3LjAxNjEuODgyNzdsLTkuODc5MSAxMS4zOTU4Yy0xLjgxODcgMi4wOTQyLS40NzY4IDUuMzY0MyAyLjI5NTYgNS41OTc4bDguNzE2OC44NDAzYy40MzQxLjA0MTguNzUxNy40MjM0LjcwOTMuODUyNC0uMDM0OS4zNTM3LS4zMDc0LjYzOTUtLjY2MjguNjk0OWwtOS4xNTk0IDEuNDMwMmMtMi42NTkzLjM2MjUtMy44NjM2IDMuNTExNy0yLjEzMzkgNS41NTc2bDMuMjIgMy43OTYxYy4yNTk0LjMwNTguMjE4OC43NjE1LS4wOTA4IDEuMDE3OC0uMjYyMi4yMTcyLS42NDE5LjIyNTYtLjkxMzguMDIwM2wtMy45Njk0LTIuOTk3OGMtMi4xNDIxLTEuNjEwOS01LjIyOTctLjI0MTctNS40NTYxIDIuNDI0M2wtLjg3NDcgMTAuMzk3NmMtLjAzNjIuNDI5NS0uNDE3OC43NDg3LS44NTI1LjcxMy0uMzY5LS4wMzAzLS42NjcxLS4zMDk3LS43MTcxLS42NzIxbC0xLjM4NzEtMTAuMDQzN2MtLjM3MTctMi43MTQ0LTMuNjQ1NC0zLjg5MDQtNS42NzQzLTIuMDQ1OWwtMTIuMDUxOTUgMTAuOTc0Yy0uMjQ5NDcuMjI3MS0uNjM4MDkuMjExNC0uODY4LS4wMzUtLjIxMDk0LS4yMjYyLS4yMTczNS0uNTcyNC0uMDE0OTMtLjgwNmwxMC41MTgxOC0xMi4xMzg1YzEuODE4Ny0yLjA5NDIuNDg0OS01LjM2NDQtMi4yODc2LTUuNTk3OGwtOC43MTg3Mi0uODQwNWMtLjQzNDEzLS4wNDE4LS43NTE3Mi0uNDIzNS0uNzA5MzYtLjg1MjQuMDM0OTMtLjM1MzcuMzA3MzktLjYzOTQuNjYyNy0uNjk1bDkuMTUzMzgtMS40Mjk5YzIuNjU5NC0uMzYyNSAzLjg3MTgtMy41MTE3IDIuMTQyMS01LjU1NzZsLTIuMTkyLTIuNTg0MWMtLjMyMTctLjM3OTItLjI3MTMtLjk0NDMuMTEyNi0xLjI2MjEuMzI1My0uMjY5NC43OTYzLS4yNzk3IDEuMTMzNC0uMDI0OWwyLjY5MTggMi4wMzQ3YzIuMTQyMSAxLjYxMDkgNS4yMjk3LjI0MTcgNS40NTYxLTIuNDI0M2wuNzI0MS04LjU1OTk4Yy4wNDU3LS41NDA4LjUyNjUtLjk0MjU3IDEuMDczOS0uODk3Mzd6bS0yMy4xODczMyAyMC40Mzk2NWMuNTI1MDQgMCAuOTUwNjcuNDIxLjk1MDY3Ljk0MDNzLS40MjU2My45NDAzLS45NTA2Ny45NDAzYy0uNTI1MDQxIDAtLjk1MDY3LS40MjEtLjk1MDY3LS45NDAzcy40MjU2MjktLjk0MDMuOTUwNjctLjk0MDN6bTQ3LjY3OTczLS45NTQ3Yy41MjUgMCAuOTUwNy40MjEuOTUwNy45NDAzcy0uNDI1Ny45NDAyLS45NTA3Ljk0MDItLjk1MDctLjQyMDktLjk1MDctLjk0MDIuNDI1Ny0uOTQwMy45NTA3LS45NDAzem0tMjQuNjI5Ni0yMi40Nzk3Yy41MjUgMCAuOTUwNi40MjA5NzMuOTUwNi45NDAyNyAwIC41MTkzLS40MjU2Ljk0MDI3LS45NTA2Ljk0MDI3LS41MjUxIDAtLjk1MDctLjQyMDk3LS45NTA3LS45NDAyNyAwLS41MTkyOTcuNDI1Ni0uOTQwMjcuOTUwNy0uOTQwMjd6IiBmaWxsPSJ1cmwoI2IpIi8+PHBhdGggZD0ibTI0LjU3MSAzMi43NzkyYzQuOTU5NiAwIDguOTgwMi0zLjk3NjUgOC45ODAyLTguODgxOSAwLTQuOTA1My00LjAyMDYtOC44ODE5LTguOTgwMi04Ljg4MTlzLTguOTgwMiAzLjk3NjYtOC45ODAyIDguODgxOWMwIDQuOTA1NCA0LjAyMDYgOC44ODE5IDguOTgwMiA4Ljg4MTl6IiBmaWxsPSJ1cmwoI2MpIi8+PC9zdmc+',
			url: "https://solflare.com",
			adapter: sf,
			readyState: WalletReadyState.Installed
		}
	}

	// Return the created store.
	return {
		// Props.
		wallets,
		autoConnect,
		cluster,

		// Data.
		wallet,
		publicKey,
		readyState,
		ready,
		connected,
		connecting,
		disconnecting,

		// Methods.
		setSolflare,
		select,
		connect,
		disconnect,
		sendTransaction,
		signTransaction,
		signAllTransactions,
		signMessage,
	};
};
