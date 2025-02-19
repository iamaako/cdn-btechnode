'use client';

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function TypewriterText({ text, className = '', delay = 50 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <div className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </div>
  );
}
