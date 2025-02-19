'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VariableTextProps {
  text: string;
  className?: string;
}

export default function VariableText({ text, className = "" }: VariableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chars = Array.from(text);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return;

      const chars = container.getElementsByClassName('char');
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      Array.from(chars).forEach((char: Element) => {
        const charRect = char.getBoundingClientRect();
        const charX = charRect.left - rect.left + charRect.width / 2;
        const charY = charRect.top - rect.top + charRect.height / 2;

        const distance = Math.sqrt(
          Math.pow(mouseX - charX, 2) + Math.pow(mouseY - charY, 2)
        );

        const maxDistance = 100;
        const scale = Math.max(1, 2 - distance / maxDistance);
        
        const char_element = char as HTMLElement;
        
        if (distance < maxDistance) {
          const glowIntensity = Math.max(0, 30 - (distance / maxDistance) * 30);
          char_element.style.transform = `scale(${scale})`;
          char_element.style.textShadow = `
            0 0 ${glowIntensity}px rgba(255, 255, 255, 0.8),
            0 0 ${glowIntensity * 2}px rgba(255, 255, 255, 0.5),
            0 0 ${glowIntensity * 3}px rgba(255, 255, 255, 0.3)
          `;
          char_element.style.color = 'white';
          char_element.style.zIndex = '1';
        } else {
          char_element.style.transform = 'scale(1)';
          char_element.style.textShadow = 'none';
          char_element.style.color = '';
          char_element.style.zIndex = '0';
        }
        
        char_element.style.transition = 'all 0.05s ease-out';
      });
    };

    if (!isMobile) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-default ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="char inline-block relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: isMobile ? 0.3 : 0.5,
            delay: isMobile ? 0 : i * 0.03,
            type: isMobile ? "tween" : "spring",
            damping: 12
          }}
          style={isMobile ? {
            textShadow: `
              0 0 20px rgba(255, 255, 255, 0.9),
              0 0 40px rgba(255, 255, 255, 0.7),
              0 0 60px rgba(255, 255, 255, 0.5),
              0 0 80px rgba(255, 255, 255, 0.3)
            `,
            color: 'white',
            fontWeight: 'bold'
          } : undefined}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
