'use client';

import Image, { type ImageProps } from 'next/image';

export function GDGVizagLogo(props: Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'>) {
  return (
    <Image 
      src="/images/logo-light-transparent.svg" 
      alt="GDG Vizag Logo" 
      width={2000}
      height={300}
      {...props} 
    />
  );
}
