'use client';

import { useSpring, animated, config } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import React from 'react';

interface SplitTextOnScrollProps {
  text: string;
  className?: string;
}

const SplitTextOnScroll = ({ text, className = '' }: SplitTextOnScrollProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  const characters = text.split('');

  return (
    <div ref={ref} className={className}>
      {characters.map((char, i) => {
        const spring = useSpring({
          from: { 
            opacity: 0,
            transform: 'translateY(20px) rotateX(90deg)',
          },
          to: {
            opacity: inView ? 1 : 0,
            transform: inView 
              ? 'translateY(0px) rotateX(0deg)'
              : 'translateY(20px) rotateX(90deg)',
          },
          delay: i * 20,
          config: { ...config.gentle }
        });

        return (
          <animated.span
            key={i}
            style={{
              ...spring,
              display: 'inline-block',
              whiteSpace: 'pre'
            }}
          >
            {char}
          </animated.span>
        );
      })}
    </div>
  );
};

export default SplitTextOnScroll;
