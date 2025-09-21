// components/loading.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { LoadingProps } from '@/types/loading';
import styles from './loading.module.css';

const Loading: React.FC<LoadingProps> = ({ 
  isVisible, 
  onComplete, 
  duration = 500 
}) => {
  const [shouldRender, setShouldRender] = useState<boolean>(isVisible);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        
        // Wait for fade out animation to complete
        setTimeout(() => {
          setShouldRender(false);
          onComplete();
        }, 200);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, duration]);

  // Don't render component if not needed
  if (!shouldRender) return null;

  return (
    <div 
      className={`${styles.overlay} ${!isAnimating ? styles.fadeOut : ''}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className={styles.container}>
        <div className={styles.ring} aria-hidden="true"></div>
        <div className={styles.ring2} aria-hidden="true"></div>
        <div className={styles.logo}>
          <Image
            src="/sphire-premium-logo.png" 
            alt="Sphere Premium Logo" 
            width={100}
            height={100}
            priority
            className={styles.logoImage}
          />
        </div>
        <div className={styles.text} aria-live="polite">
          Loading...
        </div>
      </div>
    </div>
  );
};

export default Loading;