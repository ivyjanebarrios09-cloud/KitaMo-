import Image from 'next/image';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <Image
      src="/image/logoooo.png"
      alt="KitaMo! Logo"
      width={1100}
      height={280}
      className={cn(className)}
      priority
      {...props}
    />
  );
}
