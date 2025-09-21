// components/navigation-link.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLoading } from '@/contexts/loading-context';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  showLoading?: boolean;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ 
  href, 
  children, 
  className = '', 
  prefetch = true,
  showLoading = true
}) => {
  const { startLoading } = useLoading();

  const handleClick = () => {
    if (showLoading) {
      startLoading();
    }
  };

  return (
    <Link 
      href={href} 
      prefetch={prefetch}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

export default NavigationLink;