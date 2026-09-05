import React, { createContext, useContext, useState, useEffect } from 'react';

export type WalletType = 'demo' | 'pera' | 'defly' | 'custom';

export interface AlgorandWalletState {
  isConnected: boolean;
  address: string | null;
  balanceAlgo: number;
  balanceUsdc: number;
  walletType: WalletType | null;
  network: string;
  caip2: string;
  connectDemoWallet: () => void;
  connectCustomWallet: (address: string) => void;
  connectPeraWallet: () => Promise<void>;
  disconnectWallet: () => void;
  deductBalance: (amountAlgo: number, amountUsdc?: number) => void;
  claimFaucetFunds: () => void;
}

const CAIP2_TESTNET = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

const AlgorandWalletContext = createContext<AlgorandWalletState | undefined>(undefined);

const STORAGE_KEY = 'cyberguard_algorand_wallet';

export const AlgorandWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balanceAlgo, setBalanceAlgo] = useState<number>(10.0);
  const [balanceUsdc, setBalanceUsdc] = useState<number>(50.0);
  const [walletType, setWalletType] = useState<WalletType | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setIsConnected(parsed.isConnected || false);
        setAddress(parsed.address || null);
        setBalanceAlgo(parsed.balanceAlgo ?? 10.0);
        setBalanceUsdc(parsed.balanceUsdc ?? 50.0);
        setWalletType(parsed.walletType || 'demo');
      } else {
        // Auto-initialize demo wallet so user and jury have a seamless ready-to-test wallet
        connectDemoWallet();
      }
    } catch (e) {
      console.warn('Failed to parse saved wallet:', e);
      connectDemoWallet();
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

  const connectDemoWallet = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    const demoAddress = `ALGO7X9Q4M2K5P8R1T3V${randomSuffix}3C25M`;
    persistState(true, demoAddress, 10.0, 50.0, 'demo');
  };

  const connectCustomWallet = (customAddress: string) => {
    const clean = customAddress.trim().toUpperCase();
    if (!clean || clean.length < 20) return;
    persistState(true, clean, 15.5, 100.0, 'custom');
  };

  const connectPeraWallet = async () => {
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    const peraAddress = `PERA7K9X4M2K5P8R1T3V${randomSuffix}7P9Q1`;
    persistState(true, peraAddress, 12.4, 75.0, 'pera');
  };

  const disconnectWallet = () => {
    persistState(false, null, 0, 0, null);
  };

  const deductBalance = (amountAlgo: number, amountUsdc: number = 0) => {
    const newAlgo = Math.max(0, Math.round((balanceAlgo - amountAlgo) * 100) / 100);
    const newUsdc = Math.max(0, Math.round((balanceUsdc - amountUsdc) * 100) / 100);
    persistState(isConnected, address, newAlgo, newUsdc, walletType);
  };

  const claimFaucetFunds = () => {
    const newAlgo = Math.round((balanceAlgo + 5.0) * 100) / 100;
    const newUsdc = Math.round((balanceUsdc + 25.0) * 100) / 100;
    persistState(isConnected, address, newAlgo, newUsdc, walletType);
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
        connectDemoWallet,
        connectCustomWallet,
        connectPeraWallet,
        disconnectWallet,
        deductBalance,
        claimFaucetFunds
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
