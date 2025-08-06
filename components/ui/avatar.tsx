import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Avatar({ className = '', children, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export function AvatarFallback({ className = '', children, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={`flex items-center justify-center w-full h-full bg-gray-300 text-gray-700 font-bold ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}