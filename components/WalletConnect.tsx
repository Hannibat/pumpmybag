"use client";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Prevent hydration mismatch by showing consistent UI until mounted
  if (!mounted) {
    return (
      <button
        className="bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-700 hover:to-emerald-600 text-white px-4 py-2.5 rounded-full font-semibold transition-all shadow-lg h-11 flex items-center justify-center"
      >
        Connect Wallet
      </button>
    );
  }
  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-full font-semibold transition-colors h-11 flex items-center justify-center"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }
  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-700 hover:to-emerald-600 text-white px-4 py-2.5 rounded-full font-semibold transition-all shadow-lg h-11 flex items-center justify-center"
    >
      Connect Wallet
    </button>
  );
}
