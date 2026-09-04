import React from 'react';
import { motion } from 'framer-motion';

export function LiquidGlass({
  children,
  className = '',
  onClick,
  rounded = 'rounded-3xl',
  hover = true,
  ...props
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -2, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } } : undefined}
      className={`
        relative overflow-hidden
        bg-white/85 backdrop-blur-2xl
        border border-slate-900/8
        shadow-[0_20px_50px_-15px_rgba(15,23,42,0.05)]
        ${rounded}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default LiquidGlass;
