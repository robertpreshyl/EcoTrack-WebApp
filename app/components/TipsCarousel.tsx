'use client';

import React, { useState, useEffect } from 'react';

interface TipsCarouselProps {
  tips: string[];
}

const TipsCarousel: React.FC<TipsCarouselProps> = ({ tips }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set up the interval to change tips every 8 seconds
    const intervalId = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
        setIsAnimating(false);
      }, 500); // Wait for fade out animation before changing tip
    }, 8000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [tips.length]);

  return (
    <div className="relative h-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-full">
        <div 
          className={`transition-opacity duration-500 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-start mb-3">
            <div className="flex-shrink-0 mr-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-gray-700">{tips[currentTipIndex]}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tip counter indicator */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center">
        <div className="flex space-x-1">
          {tips.map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                index === currentTipIndex ? 'bg-green-500 w-8' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TipsCarousel; 