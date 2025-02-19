'use client';

import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

interface BlurOnScrollProps {
  children: ReactNode;
  delay?: number;
}

const BlurOnScroll = ({ children, delay = 0 }: BlurOnScrollProps) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });

  const spring = useSpring({
    from: { 
      filter: 'blur(10px)',
      opacity: 0 
    },
    to: {
      filter: inView ? 'blur(0px)' : 'blur(10px)',
      opacity: inView ? 1 : 0
    },
    delay,
    config: { 
      tension: 200,
      friction: 20
    }
  });

  return (
    <animated.div ref={ref} style={spring}>
      {children}
    </animated.div>
  );
};

export default BlurOnScroll;
