
'use client';

import { useTheme } from 'next-themes';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

export function GDGVizagLogo(props: Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // To prevent a hydration mismatch and the wrong logo flashing,
    // we render a placeholder that respects the passed className,
    // which should define its size.
    return <div className={props.className} />;
  }

  const isDark = resolvedTheme === 'dark';
  const logoSrc = isDark ? '/images/logo-dark-transparent.svg' : '/images/logo-light-transparent.svg';

  return (
    <Image 
      src={logoSrc} 
      alt="GDG Vizag Logo" 
      width={2000}
      height={300}
      {...props} 
    />
  );
}
