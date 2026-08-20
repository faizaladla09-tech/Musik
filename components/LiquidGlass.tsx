'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'accent' | 'green' | 'icon' | 'pill' | 'button';
  interactive?: boolean;
  className?: string;
}

export function LiquidGlass({
  children,
  variant = 'default',
  interactive = false,
  className,
  ...props
}: LiquidGlassProps) {
  const variantClass = {
    default: 'liquid-glass',
    subtle: 'liquid-glass-subtle',
    accent: 'liquid-glass-accent text-white',
    green: 'liquid-glass-green text-black',
    icon: 'liquid-glass-icon',
    pill: 'liquid-glass-pill',
    button: 'liquid-glass-button',
  }[variant];

  return (
    <div
      className={cn(
        variantClass,
        interactive && 'cursor-pointer transition-transform active:scale-95',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LiquidGlassIcon({
  children,
  size = 'md',
  variant = 'default',
  className,
  onClick,
  title,
  disabled = false,
}: {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'accent' | 'green' | 'subtle';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  disabled?: boolean;
}) {
  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  }[size];

  const variantClasses = {
    default: 'liquid-glass-icon text-white',
    accent: 'liquid-glass-accent text-white',
    green: 'liquid-glass-green text-black',
    subtle: 'liquid-glass-subtle text-white/80 hover:text-white',
  }[variant];

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full transition-all disabled:opacity-50 disabled:pointer-events-none',
        sizeClasses,
        variantClasses,
        className
      )}
    >
      {children}
    </button>
  );
}
