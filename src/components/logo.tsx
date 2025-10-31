'use client';

import { useTheme } from 'next-themes';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

export function DevFestLogo(props: Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration mismatch, we can't rely on the theme on the server.
  // We'll render a placeholder or the light theme logo by default.
  // The correct logo will show up on the client after mounting.
  const logoSrc = mounted && resolvedTheme === 'dark' 
    ? '/images/logo-dark.svg' 
    : '/images/logo-light.svg';

  if (!mounted) {
    // Render a simple placeholder that occupies space, but could also be the light logo.
    return (
       <Image 
        src="/images/logo-light.svg" 
        alt="DevFest Vizag Logo" 
        width={2000}
        height={300}
        {...props} 
      />
    );
  }

  return (
    <Image 
      src={logoSrc} 
      alt="DevFest Vizag Logo" 
      width={2000}
      height={300}
      {...props} 
    />
  );
}