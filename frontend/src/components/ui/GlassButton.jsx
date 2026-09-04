import React from 'react';
import { motion } from 'framer-motion';

export function GlassButton({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5 font-mono',
    md: 'px-6 py-2.5 text-sm gap-2 font-mono',
    lg: 'px-7 py-3.5 text-sm gap-2.5 font-bold font-mono'
  };

  const variantStyles = {
    // Primary CTA: Vintage Rosewood (#7D4047)
    primary: `
      bg-[#7D4047] text-[#F8F6F2]
      hover:bg-[#8F4A52]
      shadow-[0_4px_20px_rgba(125,64,71,0.35)]
      border border-[#7D4047]
    `,
    // Secondary CTA: Warm Glass Surface
    secondary: `
      bg-white/[0.04] backdrop-blur-xl text-[#F8F6F2] 
      hover:bg-white/[0.08] hover:text-white
      border border-white/12
      shadow-md
    `,
    danger: `
      bg-[#63343A] text-white
      hover:bg-[#7D4047]
      border border-[#7D4047]
      shadow-md
    `,
    ghost: `
      bg-transparent text-[#DDD5CD]
      hover:text-white hover:bg-white/5
    `
  };

  return (
    <motion.button
      whileHover={{ y: disabled ? 0 : -3, scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        rounded-xl tracking-tight
        transition-all cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
        {Icon && <Icon className="w-4 h-4" />}
      </span>
    </motion.button>
  );
}

export default GlassButton;
