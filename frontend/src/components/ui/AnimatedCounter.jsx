import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { formatRupees, formatRupeesShort, formatPercent } from '../../lib/formatters';

export function AnimatedCounter({
  value,
  type = 'number', // 'currency' | 'currencyShort' | 'percent' | 'number'
  duration = 800,
  className = ''
}) {
  const prefersReducedMotion = useReducedMotion();
  const [currentVal, setCurrentVal] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number' || isNaN(value)) {
      return;
    }

    if (prefersReducedMotion) {
      setCurrentVal(value);
      return;
    }

    let startTimestamp = null;
    const startVal = currentVal;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const nextVal = startVal + (value - startVal) * ease;
      setCurrentVal(nextVal);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, prefersReducedMotion]);

  if (typeof value !== 'number' || isNaN(value)) {
    return <span className={className}>—</span>;
  }

  let formatted = '';
  switch (type) {
    case 'currency':
      formatted = formatRupees(Math.round(currentVal));
      break;
    case 'currencyShort':
      formatted = formatRupeesShort(Math.round(currentVal));
      break;
    case 'percent':
      formatted = formatPercent(currentVal);
      break;
    case 'number':
    default:
      formatted = Math.round(currentVal).toLocaleString('en-IN');
      break;
  }

  return <span className={className}>{formatted}</span>;
}

export default AnimatedCounter;
