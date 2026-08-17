'use client';

import React, { useRef, useEffect, useState } from 'react';

interface MarqueeTextProps {
  text: React.ReactNode;
  className?: string;
}

export function MarqueeText({ text, className = '' }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    // Also check after a short delay to account for font loading or layout shifts
    const timeoutId = setTimeout(checkOverflow, 100);
    
    return () => {
      window.removeEventListener('resize', checkOverflow);
      clearTimeout(timeoutId);
    };
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div className={`${isOverflowing ? 'animate-marquee flex min-w-full' : 'inline-block w-full'}`}>
        <span ref={textRef} className="shrink-0 inline-flex items-center gap-1">
          {text}
        </span>
        {isOverflowing && (
          <span className="shrink-0 pl-8 inline-flex items-center gap-1">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}
