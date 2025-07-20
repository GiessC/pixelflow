import { useState, useEffect } from 'react';

export type Breakpoint = 'default' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues: Record<Breakpoint, number> = {
  default: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    getBreakpointName(window.innerWidth)
  );

  function getBreakpointName(width: number): Breakpoint {
    if (width >= breakpointValues['2xl']) return '2xl';
    if (width >= breakpointValues.xl) return 'xl';
    if (width >= breakpointValues.lg) return 'lg';
    if (width >= breakpointValues.md) return 'md';
    if (width >= breakpointValues.sm) return 'sm';
    return 'default';
  }

  useEffect(() => {
    const updateBreakpoint = () =>
      setBreakpoint(getBreakpointName(window.innerWidth));
    window.addEventListener('resize', updateBreakpoint);
    return () => void window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
  };
}
