import React from 'react';
import { cn } from '@/app/lib/cn'; // optional utility to join class names

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
};
