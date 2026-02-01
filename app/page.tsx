"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { DAILY_GM_ADDRESS, DAILY_GM_ABI } from "@/lib/contract";
import GMModal from "@/components/GMModal";
import Stats from "@/components/Stats";
import WalletConnect from "@/components/WalletConnect";
import NetworkIndicator from "@/components/NetworkIndicator";
import ParticlesBackground from "@/components/ParticlesBackground";
import Confetti from "@/components/Confetti";
import Leaderboard from "@/components/Leaderboard";
import Image from "next/image";

// Determine target chain based on environment
const targetChain = process.env.NEXT_PUBLIC_CHAIN_ID === '8453' ? base : baseSepolia;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [showModal, setShowModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [gmsReceived, setGmsReceived] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const publicClient = usePublicClient({ chainId: targetChain.id });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate countdown in real-time
  useEffect(() => {
    if (!lastGMTimestamp || canGMToday()) {
      setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastGMDate = new Date(Number(lastGMTimestamp) * 1000);
      const nextMidnight = new Date(lastGMDate);
      nextMidnight.setUTCHours(24, 0, 0, 0);
      const nextMidnightTimestamp = Math.floor(nextMidnight.getTime() / 1000);
      const secondsLeft = nextMidnightTimestamp - now;

      if (secondsLeft <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      setCountdown({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [lastGMTimestamp, canGMToday]);

  // Helper function to fetch GMs via Alchemy API route
  async function fetchGMsViaAPI(address: string): Promise<number> {
    const response = await fetch(`/api/fetch-gms?address=${address}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data.count;
  }

  // Fetch GMs received - Alchemy first, then fallback to chunking
  useEffect(() => {
    async function fetchGMsReceived() {
      if (!address) return;

      // Try API route first (Alchemy via server)
      try {
        console.log('🚀 Fetching GMs via Alchemy API route...');
        const startTime = Date.now();
        const count = await fetchGMsViaAPI(address);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        setGmsReceived(count);
        console.log(`✅ Fetched ${count} GMs via Alchemy in ${duration} seconds`);
        return; // Success, exit early - NO CACHING (always fresh)
      } catch (error) {
        console.warn('⚠️ API route failed, falling back to chunking:', error);
        // Fall through to chunking approach
      }

      // Fallback: Chunking with caching (only used if API fails)
      if (!publicClient) return;

      try {
        // Get the current block number
        const currentBlock = await publicClient.getBlockNumber();

        // Contract deployment block on Base Sepolia
        const contractDeploymentBlock = 18000000n;

        // Check cache in localStorage
        const cacheKey = `gms-received-${address.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        const cachedData = cached ? JSON.parse(cached) : null;

        let fromBlock = contractDeploymentBlock;
        let currentCount = 0;

        // If we have cached data, start from the last queried block
        if (cachedData && cachedData.lastBlock) {
          fromBlock = BigInt(cachedData.lastBlock) + 1n;
          currentCount = cachedData.count || 0;
          console.log(`Using cache: ${currentCount} GMs, resuming from block ${fromBlock}`);
        }

        // Only query if there are new blocks to check
        if (fromBlock <= currentBlock) {
          const maxBlockRange = 100000n;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let newLogs: any[] = [];

          // Query in chunks from last checked block to current
          while (fromBlock <= currentBlock) {
            const toBlock = fromBlock + maxBlockRange > currentBlock
              ? currentBlock
              : fromBlock + maxBlockRange;

            console.log(`Querying blocks ${fromBlock} to ${toBlock}...`);

            const logs = await publicClient.getLogs({
              address: DAILY_GM_ADDRESS,
              event: {
                type: 'event',
                name: 'GMSent',
                inputs: [
                  { type: 'address', indexed: true, name: 'sender' },
                  { type: 'address', indexed: true, name: 'recipient' },
                  { type: 'uint256', indexed: false, name: 'timestamp' }
                ]
              },
              args: {
                recipient: address,
              },
              fromBlock,
              toBlock
            });

            newLogs = [...newLogs, ...logs];
            fromBlock = toBlock + 1n;

            // Add a small delay between requests to avoid rate limiting
            if (fromBlock <= currentBlock) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          const totalCount = currentCount + newLogs.length;
          setGmsReceived(totalCount);

          // Update cache
          localStorage.setItem(cacheKey, JSON.stringify({
            count: totalCount,
            lastBlock: currentBlock.toString(),
            timestamp: Date.now()
          }));

          console.log(`Fetched ${newLogs.length} new GMs, total: ${totalCount}`);
        } else {
          // No new blocks, use cached count
          setGmsReceived(currentCount);
          console.log(`No new blocks, using cached count: ${currentCount}`);
        }
      } catch (error) {
        console.error("Error fetching GMs received:", error);
      }
    }

    fetchGMsReceived();
  }, [address, publicClient]);

  // Read user's streak (Your GMs)
  const { data: userStreak, isLoading: isLoadingStreak, error: streakError } = useReadContract({
    address: DAILY_GM_ADDRESS,
    abi: DAILY_GM_ABI,
    functionName: "streak",
    args: address ? [address] : undefined,
  });

  // Read last GM timestamp
  const { data: lastGMTimestamp } = useReadContract({
    address: DAILY_GM_ADDRESS,
    abi: DAILY_GM_ABI,
    functionName: "lastGM",
    args: address ? [address] : undefined,
  });

  // Log contract read errors for debugging
  if (streakError) {
    console.error("Error reading streak from contract:", streakError);
  }

  // Check if user can GM today
  const canGMToday = () => {
    if (!lastGMTimestamp) return true;
    const lastGMDate = new Date(Number(lastGMTimestamp) * 1000);
    const now = new Date();
    const lastGMDayUTC = Math.floor(lastGMDate.getTime() / 86400000);
    const currentDayUTC = Math.floor(now.getTime() / 86400000);
    return currentDayUTC > lastGMDayUTC;
  };

  const handleTapToGM = () => {
    if (!isConnected) {
      alert("Please connect your wallet to pump!");
      return;
    }

    // Don't open modal if already pumped today
    if (!canGMToday()) {
      return;
    }

    setShowModal(true);
  };

  const handlePumpSuccess = () => {
    // Trigger confetti only when pump is successful
    setShowConfetti(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-fuchsia-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesBackground />

      {/* Confetti */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-purple-950/95 via-purple-950/70 to-transparent backdrop-blur-md p-3 pb-4">
        <div className="flex justify-between items-center gap-2 h-12">
          {/* Left side - Leaderboard */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white px-4 py-2.5 rounded-full shadow-lg flex items-center justify-center gap-1.5 text-sm font-bold h-11"
          >
            <span className="text-lg">🏆</span>
            <span>Top</span>
          </button>
          
          {/* Right side - Wallet - force same height */}
          <div className="flex items-center h-11">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Desktop Wallet - Only visible on desktop */}
      <div className="hidden md:block fixed top-4 right-4 z-50">
        <WalletConnect />
      </div>

      {/* Network Indicator */}
      <NetworkIndicator />

      {/* Leaderboard */}
      <Leaderboard 
        currentUserAddress={address} 
        isOpen={showLeaderboard}
        onOpenChange={setShowLeaderboard}
      />

      {/* Background gradient circles */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

      <div className="z-10 w-full max-w-md pt-16 md:pt-0">
        {/* Logo at top */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/iconbutton.jpg" 
            alt="PumpMyBag Logo" 
            width={180} 
            height={180}
            className="drop-shadow-2xl"
            priority
          />
        </div>

        {/* Stats Section */}
        <Stats
          yourGMs={Number(userStreak || 0)}
          gmsReceived={gmsReceived}
          address={address}
          isLoading={isLoadingStreak}
        />

        {/* Main Pump Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleTapToGM}
            className="relative group"
          >
            {/* Enhanced Ripple circles with animation */}
            {canGMToday() && (
              <>
                <div className="absolute inset-0 rounded-full bg-purple-400/30 blur-2xl group-hover:bg-purple-400/40 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-purple-400/20 scale-125 blur-3xl group-hover:scale-150 animate-ping opacity-75" 
                     style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 rounded-full bg-fuchsia-400/20 scale-110 blur-2xl animate-pulse" 
                     style={{ animationDuration: '3s' }} />
              </>
            )}

            {/* Main button with enhanced glow and animations */}
            <div className={`relative w-64 h-64 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl transition-all duration-300 ${
              canGMToday() 
                ? 'animate-bounce-slow shadow-purple-500/50 group-hover:scale-110 group-active:scale-95 cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
            }`}>
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2 transition-opacity group-hover:opacity-100">
                  {mounted && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
                </div>
                
                {canGMToday() ? (
                  <>
                    <div className="text-3xl font-extrabold transition-transform group-hover:scale-110">
                      Tap to Pump
                    </div>
                    <div className="text-xs mt-2 opacity-70 animate-bounce">
                      ✨ Ready to pump!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold mb-2">
                      Already Pumped! 🚀
                    </div>
                    <div className="text-sm opacity-90">
                      Next pump in:
                    </div>
                    <div className="flex justify-center gap-1 mt-2 text-lg font-mono">
                      <span className="bg-purple-800/50 px-2 py-1 rounded">
                        {String(countdown.hours).padStart(2, '0')}h
                      </span>
                      <span className="bg-purple-800/50 px-2 py-1 rounded">
                        {String(countdown.minutes).padStart(2, '0')}m
                      </span>
                      <span className="bg-purple-800/50 px-2 py-1 rounded">
                        {String(countdown.seconds).padStart(2, '0')}s
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* GM Type Modal */}
      {showModal && (
        <GMModal
          onClose={() => setShowModal(false)}
          onSuccess={handlePumpSuccess}
          address={address}
        />
      )}
    </main>
  );
}
