import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 110 28"
      className={cn('fill-foreground', className)}
      {...props}
    >
      <path d="M22.5,24h-4.2l2.6-7.2h-7.3V4h4.2v8.8h3.1L22.5,24z M30.7,24h-4.2V4h4.2V24z M42.2,24h-4.2L35.1,4h4.2l2.9,20z M45.8,24V4h10c5.5,0,9,3.5,9,9.5S51.3,24,45.8,24z M50,8h-4.2v12H50c2.8,0,4.5-1.8,4.5-4S52.8,8,50,8z M71.8,24h-4.2l-7-20h4.2l5,14.5l5-14.5h4.2L71.8,24z M89,24c-5.5,0-9-3.5-9-9.5s3.5-9.5,9-9.5s9,3.5,9,9.5S94.5,24,89,24z M89,8c-2.8,0-4.5,1.8-4.5,4s1.7,4,4.5,4s4.5-1.8,4.5-4S91.8,8,89,8z" />
      <path d="M10.38.38H.9v27.4h3.9v-12h5.58c5.44 0 9.28-3.78 9.28-9.02 0-5.34-3.84-9.2-9.38-9.2zM10.1 12H4.8V4.2h5.3c2.72 0 4.6 1.76 4.6 4 0 2.18-1.88 3.8-4.6 3.8z"/>
    </svg>
  );
}
