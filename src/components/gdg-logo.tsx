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

  const logoSrc = resolvedTheme === 'dark' 
    ? '/images/logo-dark-transparent.svg' 
    : '/images/logo-light-transparent.svg';

  // On initial server render, or if not mounted yet, we can render a placeholder
  // or a default logo to avoid hydration issues. A simple div that takes up the space is fine.
  if (!mounted) {
    return <div className={props.className} />;
  }

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
