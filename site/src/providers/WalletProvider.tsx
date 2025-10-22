"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

type WalletContextType = {
  provider: ethers.Eip1193Provider | undefined;
  address: string | undefined;
  chainId: number | undefined;
  connect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();

  useEffect(() => {
    const eth = (globalThis as any).ethereum as ethers.Eip1193Provider | undefined;
    if (!eth) return;
    setProvider(eth);

    // 初始化已有连接
    eth.request?.({ method: "eth_accounts" }).then((accounts: any) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
      }
    });
    eth.request?.({ method: "eth_chainId" }).then((cid: any) => {
      if (cid) setChainId(parseInt(String(cid), 16));
    });

    // 事件监听
    const onAccountsChanged = (accs: string[]) => {
      setAddress(accs && accs.length > 0 ? accs[0] : undefined);
    };
    const onChainChanged = (cid: string) => {
      setChainId(parseInt(cid, 16));
    };

    (eth as any).on?.("accountsChanged", onAccountsChanged);
    (eth as any).on?.("chainChanged", onChainChanged);
    return () => {
      (eth as any).removeListener?.("accountsChanged", onAccountsChanged);
      (eth as any).removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const connect = async () => {
    if (!provider) throw new Error("No EIP-1193 provider found");
    const accounts = await provider.request?.({ method: "eth_requestAccounts" });
    if (accounts && (accounts as string[]).length > 0) {
      setAddress((accounts as string[])[0]);
    }
    const cid = await provider.request?.({ method: "eth_chainId" });
    if (cid) setChainId(parseInt(String(cid), 16));
  };

  const value = useMemo(
    () => ({ provider, address, chainId, connect }),
    [provider, address, chainId]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}






