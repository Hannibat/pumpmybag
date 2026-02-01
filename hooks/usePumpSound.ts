"use client";

import { useEffect, useRef } from 'react';

interface UsePumpSoundOptions {
  volume?: number; // 0 to 1
  enableVibration?: boolean;
}

export function usePumpSound(options: UsePumpSoundOptions = {}) {
  const { volume = 0.5, enableVibration = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for the pump sound
    // Using a positive "ding" sound encoded as base64
    // This is a short, satisfying sound effect
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    // Simple success sound (base64 encoded)
    // You can replace this with your own sound file later
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZTRQJT6Lf8K1gHAU7k9n0y38pBSh+zO/bkz0JGWm78OOVSxELTKXh8LJiHgU3jtHz';
    
  }, [volume]);

  const playPumpSound = () => {
    if (audioRef.current) {
      // Reset audio to start
      audioRef.current.currentTime = 0;
      
      // Play sound
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
        // This is normal if user hasn't interacted with page yet
      });
    }

    // Trigger vibration on mobile
    if (enableVibration && 'vibrate' in navigator) {
      // Pattern: vibrate for 50ms, pause 20ms, vibrate 50ms
      // Creates a satisfying "bump bump" feeling
      navigator.vibrate([50, 20, 50]);
    }
  };

  const playSuccessSound = () => {
    playPumpSound();
    
    // Additional longer vibration for success
    if (enableVibration && 'vibrate' in navigator) {
      // Success pattern: longer vibration
      setTimeout(() => {
        navigator.vibrate(200);
      }, 100);
    }
  };

  return { playPumpSound, playSuccessSound };
}
