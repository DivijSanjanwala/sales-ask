import React from 'react';
import { cn } from '@/app/lib/cn';
import { ArrowPathIcon } from '@heroicons/react/24/outline'; // Ensure you have this package installed

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:cusor-pointer',
        className
      )}
    >
      {loading ? (
        <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
