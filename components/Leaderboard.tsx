"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { DAILY_GM_ADDRESS, DAILY_GM_ABI } from "@/lib/contract";

interface LeaderboardEntry {
  address: string;
  streak: number;
  rank: number;
}

interface LeaderboardProps {
  currentUserAddress?: `0x${string}`;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Leaderboard({ currentUserAddress, isOpen: externalIsOpen, onOpenChange }: LeaderboardProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use external state if provided, otherwise use internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Mock data for demonstration - In production, you'd fetch this from an API/indexer
  const mockLeaderboard: LeaderboardEntry[] = [
    { address: "0x1234567890123456789012345678901234567890", streak: 145, rank: 1 },
    { address: "0x2345678901234567890123456789012345678901", streak: 98, rank: 2 },
    { address: "0x3456789012345678901234567890123456789012", streak: 87, rank: 3 },
    { address: "0x4567890123456789012345678901234567890123", streak: 76, rank: 4 },
    { address: "0x5678901234567890123456789012345678901234", streak: 65, rank: 5 },
    { address: "0x6789012345678901234567890123456789012345", streak: 54, rank: 6 },
    { address: "0x7890123456789012345678901234567890123456", streak: 43, rank: 7 },
    { address: "0x8901234567890123456789012345678901234567", streak: 32, rank: 8 },
    { address: "0x9012345678901234567890123456789012345678", streak: 21, rank: 9 },
    { address: "0x0123456789012345678901234567890123456789", streak: 15, rank: 10 },
  ];

  // Get current user's streak
  const { data: userStreak } = useReadContract({
    address: DAILY_GM_ADDRESS,
    abi: DAILY_GM_ABI,
    functionName: "streak",
    args: currentUserAddress ? [currentUserAddress] : undefined,
  });

  useEffect(() => {
    if (isOpen && leaderboard.length === 0) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLeaderboard(mockLeaderboard);
        setLoading(false);
      }, 500);
    }
  }, [isOpen, leaderboard.length, mockLeaderboard]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-300";
      case 3:
        return "text-orange-400";
      default:
        return "text-purple-300";
    }
  };

  const isCurrentUser = (address: string) => {
    return currentUserAddress?.toLowerCase() === address.toLowerCase();
  };

  return (
    <>
      {/* Leaderboard Button - Desktop only, hidden on mobile */}
      <button
        data-leaderboard-button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex fixed top-24 right-4 z-40 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform items-center gap-2"
      >
        <span className="text-xl">🏆</span>
        <span className="font-bold">Leaderboard</span>
      </button>

      {/* Leaderboard Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-900 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-white text-2xl md:text-3xl font-bold flex items-center gap-2">
                  🏆 Top Pumpers
                </h2>
                <p className="text-purple-300 text-xs md:text-sm mt-1">
                  The most dedicated bag pumpers
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-purple-300 transition-colors text-xl md:text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Your Rank - plus compact sur mobile */}
            {currentUserAddress && userStreak && Number(userStreak) > 0 && (
              <div className="bg-purple-800/50 border-2 border-purple-400/50 rounded-xl p-3 md:p-4 mb-3 md:mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-xs md:text-sm">Your Rank</p>
                    <p className="text-white text-sm md:text-xl font-bold font-mono">
                      <span className="hidden sm:inline">{formatAddress(currentUserAddress)}</span>
                      <span className="sm:hidden">{currentUserAddress.slice(0, 4)}...{currentUserAddress.slice(-3)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 text-xs md:text-sm">Streak</p>
                    <p className="text-white text-2xl md:text-3xl font-bold">{Number(userStreak)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  <p className="text-purple-300 mt-4">Loading leaderboard...</p>
                </div>
              ) : (
                leaderboard.map((entry) => (
                  <div
                    key={entry.address}
                    className={`bg-purple-800/30 backdrop-blur-sm rounded-xl p-3 md:p-4 transition-all hover:bg-purple-700/40 ${
                      isCurrentUser(entry.address)
                        ? "border-2 border-purple-400 shadow-lg shadow-purple-500/50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        {/* Rank - plus compact sur mobile */}
                        <div
                          className={`text-lg md:text-2xl font-bold min-w-[40px] md:min-w-[60px] flex-shrink-0 ${getRankColor(
                            entry.rank
                          )}`}
                        >
                          {getRankEmoji(entry.rank)}
                        </div>

                        {/* Address - tronquée encore plus sur mobile */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-mono text-xs md:text-sm font-semibold truncate ${
                              isCurrentUser(entry.address)
                                ? "text-purple-200"
                                : "text-white"
                            }`}
                          >
                            <span className="hidden sm:inline">{formatAddress(entry.address)}</span>
                            <span className="sm:hidden">{entry.address.slice(0, 4)}...{entry.address.slice(-3)}</span>
                            {isCurrentUser(entry.address) && (
                              <span className="ml-1 md:ml-2 text-xs bg-purple-500 px-1 md:px-2 py-0.5 md:py-1 rounded-full">
                                YOU
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Streak - plus compact sur mobile */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className="text-lg md:text-2xl">🔥</span>
                            <span className="text-white text-lg md:text-2xl font-bold">
                              {entry.streak}
                            </span>
                          </div>
                          <p className="text-purple-300 text-[10px] md:text-xs">days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-purple-700/50">
              <p className="text-purple-300 text-xs text-center">
                💡 Keep your streak alive to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </>
  );
}
