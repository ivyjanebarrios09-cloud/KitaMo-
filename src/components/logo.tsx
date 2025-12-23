import Image from 'next/image';
import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Logo({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <Image
      src="/image/logo.png"
      alt="KitaMo! Logo"
      width={550}
      height={140}
      className={cn(className)}
      priority
      {...props}
    />
  );
}
