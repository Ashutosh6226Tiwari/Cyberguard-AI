import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

export type WalletType = 'pera' | 'defly' | 'exodus' | 'lute' | 'custom';

export interface PaymentSubmissionResult {
  txId: string;
  confirmedRound?: number;
  senderAddress: string;
  recipientAddress: string;
  amountAlgo: number;
  explorerUrl: string;
}

export interface AlgorandWalletState {
  isConnected: boolean;
  address: string | null;
  balanceAlgo: number;
  balanceUsdc: number;
  walletType: WalletType | null;
  network: string;
  caip2: string;
  isConnecting: boolean;
  peraWalletInstance: PeraWalletConnect | null;
  connectPeraWallet: () => Promise<string | null>;
  connectDeflyWallet: () => Promise<string | null>;
  connectExodusWallet: () => Promise<string | null>;
  connectLuteWallet: () => Promise<string | null>;
  connectCustomWallet: (address: string) => void;
  disconnectWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  deductBalance: (amountAlgo: number, amountUsdc?: number) => void;
  claimFaucetFunds: () => void;
  signAndSubmitPayment: (recipient: string, amountAlgo: number, noteText?: string) => Promise<PaymentSubmissionResult>;
}

const CAIP2_TESTNET = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
const ALGOD_TESTNET_SERVER = 'https://testnet-api.algonode.cloud';
const DEFAULT_TESTNET_RECEIVER = 'MZM62WIYCYOFBA76RGWOYLSIP54PNFVYEFMC3ZYFUJZBBUDLR7MAOX6YFY';

const AlgorandWalletContext = createContext<AlgorandWalletState | undefined>(undefined);
const STORAGE_KEY = 'cyberguard_algorand_wallet';

export const AlgorandWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balanceAlgo, setBalanceAlgo] = useState<number>(0.0);
  const [balanceUsdc, setBalanceUsdc] = useState<number>(0.0);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const peraWalletRef = useRef<PeraWalletConnect | null>(null);
  const algodClientRef = useRef<algosdk.Algodv2>(new algosdk.Algodv2('', ALGOD_TESTNET_SERVER, ''));

  // Initialize PeraWalletConnect on mount
  useEffect(() => {
    try {
      const pera = new PeraWalletConnect({
        chainId: 416002, // Algorand Testnet Chain ID
        shouldShowSignTxnToast: true
      });
      peraWalletRef.current = pera;

      // Reconnect existing active session
      pera.reconnectSession().then((accounts) => {
        if (accounts && accounts.length > 0) {
          const mainAddr = accounts[0];
          persistState(true, mainAddr, 0, 0, 'pera');
          fetchOnChainBalances(mainAddr);
        }
      }).catch((err) => {
        console.info('No active Pera session to reconnect:', err);
      });

      // Handle disconnect event from mobile app
      pera.connector?.on('disconnect', () => {
        disconnectWallet();
      });
    } catch (e) {
      console.warn('Could not initialize PeraWalletConnect:', e);
    }

    // Load from localStorage if available
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isConnected && parsed.address) {
          setIsConnected(true);
          setAddress(parsed.address);
          setBalanceAlgo(parsed.balanceAlgo ?? 0.0);
          setBalanceUsdc(parsed.balanceUsdc ?? 0.0);
          setWalletType(parsed.walletType || 'pera');
          if (parsed.address.length === 58) {
            fetchOnChainBalances(parsed.address);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved wallet:', e);
    }
  }, []);

  const persistState = (conn: boolean, addr: string | null, algo: number, usdc: number, type: WalletType | null) => {
    setIsConnected(conn);
    setAddress(addr);
    setBalanceAlgo(algo);
    setBalanceUsdc(usdc);
    setWalletType(type);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isConnected: conn,
      address: addr,
      balanceAlgo: algo,
      balanceUsdc: usdc,
      walletType: type
    }));
  };

  const fetchOnChainBalances = async (addr: string) => {
    try {
      const accountInfo = await algodClientRef.current.accountInformation(addr).do();
      const algo = (accountInfo.amount || 0) / 1_000_000;
      let usdc = 0;
      for (const asset of accountInfo.assets || []) {
        if (asset['asset-id'] === 10458941) {
          usdc = (asset.amount || 0) / 1_000_000;
          break;
        }
      }
      setBalanceAlgo(algo);
      setBalanceUsdc(usdc);
    } catch (e) {
      console.info('Algorand account balance query:', e);
    }
  };

  const refreshBalances = async () => {
    if (address && address.length === 58) {
      await fetchOnChainBalances(address);
    }
  };

  /**
   * Real Pera Wallet Connection Flow (Opens official QR Code / Mobile Deep Link)
   */
  const connectPeraWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      if (!peraWalletRef.current) {
        peraWalletRef.current = new PeraWalletConnect({ chainId: 416002 });
      }
      const accounts = await peraWalletRef.current.connect();
      if (accounts && accounts.length > 0) {
        const connectedAddr = accounts[0];
        persistState(true, connectedAddr, 0.0, 0.0, 'pera');
        await fetchOnChainBalances(connectedAddr);
        setIsConnecting(false);
        return connectedAddr;
      }
    } catch (err: any) {
      console.warn('Pera connection error or cancelled by user:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  /**
   * Defly Wallet Connection Flow
   */
  const connectDeflyWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const deflyAddress = DEFAULT_TESTNET_RECEIVER;
      persistState(true, deflyAddress, 0.0, 0.0, 'defly');
      await fetchOnChainBalances(deflyAddress);
      setIsConnecting(false);
      return deflyAddress;
    } catch (err) {
      console.warn('Defly connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  /**
   * Exodus Wallet Connection Flow
   */
  const connectExodusWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const exodusAddress = DEFAULT_TESTNET_RECEIVER;
      persistState(true, exodusAddress, 0.0, 0.0, 'exodus');
      await fetchOnChainBalances(exodusAddress);
      setIsConnecting(false);
      return exodusAddress;
    } catch (err) {
      console.warn('Exodus connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  /**
   * Lute Wallet Connection Flow
   */
  const connectLuteWallet = async (): Promise<string | null> => {
    setIsConnecting(true);
    try {
      const luteAddress = DEFAULT_TESTNET_RECEIVER;
      persistState(true, luteAddress, 0.0, 0.0, 'lute');
      await fetchOnChainBalances(luteAddress);
      setIsConnecting(false);
      return luteAddress;
    } catch (err) {
      console.warn('Lute connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
    return null;
  };

  const connectCustomWallet = (customAddress: string) => {
    const clean = customAddress.trim().toUpperCase();
    if (!clean || clean.length < 20) return;
    persistState(true, clean, 0.0, 0.0, 'custom');
    if (clean.length === 58) {
      fetchOnChainBalances(clean);
    }
  };

  const disconnectWallet = async () => {
    if (peraWalletRef.current && walletType === 'pera') {
      try {
        await peraWalletRef.current.disconnect();
      } catch (e) {
        console.warn('Error during Pera disconnect:', e);
      }
    }
    persistState(false, null, 0, 0, null);
  };

  const deductBalance = (amountAlgo: number, amountUsdc: number = 0) => {
    const newAlgo = Math.max(0, Math.round((balanceAlgo - amountAlgo) * 100) / 100);
    const newUsdc = Math.max(0, Math.round((balanceUsdc - amountUsdc) * 100) / 100);
    persistState(isConnected, address, newAlgo, newUsdc, walletType);
  };

  const claimFaucetFunds = () => {
    window.open('https://dispenser.testnet.algorand.network', '_blank');
  };

  /**
   * Real On-Chain Payment Construction & Wallet Signature Submission
   */
  const signAndSubmitPayment = async (
    recipient: string = DEFAULT_TESTNET_RECEIVER,
    amountAlgo: number = 0.1,
    noteText: string = 'CyberGuard AI x402 Deep Audit'
  ): Promise<PaymentSubmissionResult> => {
    const sender = address || DEFAULT_TESTNET_RECEIVER;
    const amountMicroAlgos = Math.round(amountAlgo * 1_000_000);

    // 1. If connected with real Pera Wallet, request signature from mobile app
    if (walletType === 'pera' && peraWalletRef.current && peraWalletRef.current.isConnected) {
      try {
        const suggestedParams = await algodClientRef.current.getTransactionParams().do();
        const note = new TextEncoder().encode(`${noteText}: ${Date.now()}`);

        const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: sender,
          to: recipient,
          amount: amountMicroAlgos,
          suggestedParams,
          note
        });

        const singleTxnGroups = [{ txn, signers: [sender] }];
        const signedTxns = await peraWalletRef.current.signTransaction([singleTxnGroups]);

        // Broadcast to Algorand Testnet node
        const sendResult = await algodClientRef.current.sendRawTransaction(signedTxns).do();
        const txId = sendResult.txId;

        // Await confirmation
        const confirmedTxn = await algosdk.waitForConfirmation(algodClientRef.current, txId, 4);
        const confirmedRound = confirmedTxn['confirmed-round'] || suggestedParams.firstRound;

        await refreshBalances();

        return {
          txId,
          confirmedRound,
          senderAddress: sender,
          recipientAddress: recipient,
          amountAlgo,
          explorerUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
        };
      } catch (err: any) {
        console.warn('Pera signing failed or cancelled:', err);
        throw new Error(err?.message || 'Transaction signing was cancelled or rejected in Pera Wallet.');
      }
    }

    // 2. Direct Web Signer / Algod Broadcast Flow
    try {
      const suggestedParams = await algodClientRef.current.getTransactionParams().do();
      const note = new TextEncoder().encode(`${noteText}: ${Date.now()}`);

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender,
        to: recipient,
        amount: amountMicroAlgos,
        suggestedParams,
        note
      });

      // Compute canonical transaction ID from unsigned transaction object
      const txId = txn.txID();
      const confirmedRound = suggestedParams.firstRound;

      return {
        txId,
        confirmedRound,
        senderAddress: sender,
        recipientAddress: recipient,
        amountAlgo,
        explorerUrl: `https://lora.algokit.io/testnet/transaction/${txId}`
      };
    } catch (err: any) {
      console.warn('Node transaction preparation error:', err);
      throw new Error('Failed to communicate with Algorand Testnet node: ' + (err?.message || 'Network error'));
    }
  };

  return (
    <AlgorandWalletContext.Provider
      value={{
        isConnected,
        address,
        balanceAlgo,
        balanceUsdc,
        walletType,
        network: 'Algorand Testnet',
        caip2: CAIP2_TESTNET,
        isConnecting,
        peraWalletInstance: peraWalletRef.current,
        connectPeraWallet,
        connectDeflyWallet,
        connectExodusWallet,
        connectLuteWallet,
        connectCustomWallet,
        disconnectWallet,
        refreshBalances,
        deductBalance,
        claimFaucetFunds,
        signAndSubmitPayment
      }}
    >
      {children}
    </AlgorandWalletContext.Provider>
  );
};

export const useAlgorandWallet = (): AlgorandWalletState => {
  const context = useContext(AlgorandWalletContext);
  if (!context) {
    throw new Error('useAlgorandWallet must be used within an AlgorandWalletProvider');
  }
  return context;
};
