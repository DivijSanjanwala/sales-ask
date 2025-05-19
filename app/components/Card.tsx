import React from 'react';
import { cn } from '@/app/lib/cn'; // optional utility to join class names

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={cn('bg-white shadow rounded-2xl border', className)}>
      {children}
    </div>
  );
};
