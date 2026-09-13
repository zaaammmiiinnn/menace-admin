'use client';

import React, { useState, useRef } from 'react';
import { PackageCheck, Truck } from 'lucide-react';

interface SwipeableOrderRowProps {
  orderId: string;
  onSwipeRight: (orderId: string) => Promise<void> | void; // Mark packed
  onSwipeLeft: (orderId: string) => Promise<void> | void; // Mark shipped
  children: React.ReactNode;
}

export function SwipeableOrderRow({
  orderId,
  onSwipeRight,
  onSwipeLeft,
  children,
}: SwipeableOrderRowProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  const THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;
    // Limit max swipe drag
    const clampedDiff = Math.max(-130, Math.min(130, diff));
    setOffsetX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (offsetX > THRESHOLD) {
      // Swiped Right -> Pack
      if ('vibrate' in navigator) navigator.vibrate(50);
      onSwipeRight(orderId);
    } else if (offsetX < -THRESHOLD) {
      // Swiped Left -> Ship
      if ('vibrate' in navigator) navigator.vibrate(50);
      onSwipeLeft(orderId);
    }

    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#141414] border border-[#222222] select-none touch-pan-y">
      {/* Background action hints */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        {/* Right swipe indicator (Pack) */}
        <div
          className={`flex items-center gap-2 text-xs font-mono font-bold transition-opacity duration-150 ${
            offsetX > 30 ? 'opacity-100 text-[#C6FF00]' : 'opacity-0'
          }`}
        >
          <PackageCheck className="w-5 h-5" />
          <span>MARK PACKED</span>
        </div>

        {/* Left swipe indicator (Ship) */}
        <div
          className={`flex items-center gap-2 text-xs font-mono font-bold transition-opacity duration-150 ml-auto ${
            offsetX < -30 ? 'opacity-100 text-sky-400' : 'opacity-0'
          }`}
        >
          <span>MARK SHIPPED</span>
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* Foreground Swipeable Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isSwiping ? 'none' : 'transform 150ms ease-out',
        }}
        className="relative bg-[#121212] z-10 w-full"
      >
        {children}
      </div>
    </div>
  );
}
