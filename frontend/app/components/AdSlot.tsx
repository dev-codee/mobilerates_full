"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdSlotProps {
  placement: 'TOP_HEADER' | 'SIDEBAR' | 'BOTTOM_PAGE' | 'PRODUCT_AREA';
  className?: string;
  layout?: 'row' | 'col';
  showSkeleton?: boolean;
}

export default function AdSlot({ placement, className = '', layout = 'row', showSkeleton = true }: AdSlotProps) {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/placements/${placement}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setAds(data.data);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ad for ${placement}`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAd();
  }, [placement]);

  useEffect(() => {
    if (ads.length <= 3) return; // Only rotate if there are more than 3 ads
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  if (isLoading) {
    // Callers can opt out of the skeleton (e.g. the home page) to avoid showing
    // placeholder boxes when no ad may ultimately render.
    if (!showSkeleton) {
      return null;
    }
    // Return a skeleton loader to reserve space and prevent Cumulative Layout Shift (CLS)
    return (
      <div className={`flex ${layout === 'row' ? 'flex-row' : 'flex-col'} gap-4 ${className} animate-pulse`}>
        <div className="flex-1 aspect-[4/3] bg-gray-200 rounded shadow-sm"></div>
        <div className="flex-1 aspect-[4/3] bg-gray-200 rounded shadow-sm hidden sm:block"></div>
        <div className="flex-1 aspect-[4/3] bg-gray-200 rounded shadow-sm hidden md:block"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  // Get up to 3 ads starting from currentIndex
  const visibleAds = [];
  const maxAdsToShow = Math.min(3, ads.length);
  for (let i = 0; i < maxAdsToShow; i++) {
    visibleAds.push(ads[(currentIndex + i) % ads.length]);
  }

  return (
    <div className={`flex ${layout === 'row' ? 'flex-row' : 'flex-col'} gap-4 ${className}`}>
      {visibleAds.map((ad, idx) => (
        <div 
          key={`${ad._id}-${currentIndex}`} // Force re-render on rotation for simple animation
          className={`ad-slot relative transition-all duration-500 ease-in-out ${layout === 'row' ? 'flex-1' : 'w-full'}`}
          style={{ animation: 'fadeIn 0.5s ease-out' }}
        >
          <Link href={ad.link} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full">
            <img 
              src={ad.image} 
              alt={ad.title || "Advertisement"} 
              className="w-full h-auto object-cover rounded shadow-sm hover:shadow-md transition-shadow"
              loading="lazy"
            />
            {/* Optional "Ad" badge */}
            <span className="absolute top-1 right-1 bg-gray-900/50 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
              Ad
            </span>
          </Link>
        </div>
      ))}
      
      {/* Indicators for multiple ad groups */}
      {ads.length > 3 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {ads.map((_, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
