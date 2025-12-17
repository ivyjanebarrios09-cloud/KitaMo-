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
      <path d="M19.14 23.94h-4.48l7.2-19.94h4.48l7.2 19.94h-4.48l-1.8-5.2h-6.6l-1.8 5.2zm5.1-8.2l-2.4-6.8-2.4 6.8h4.8zM40.24 23.94h-4.48V4h4.48v19.94zM50.94 14v9.94h-4.48V4.02h4.24l7.92 11.2V4h4.48v19.94h-4.2l-8-11.3v7.3zM79.86 24.3c-4.94 0-8.2-3.42-8.2-8.12s3.26-8.14 8.2-8.14 8.2 3.42 8.2 8.14-3.26 8.12-8.2 8.12zm0-3.7c2.5 0 3.72-2.12 3.72-4.42s-1.22-4.42-3.72-4.42-3.72 2.12-3.72 4.42 1.22 4.42 3.72 4.42zM103.94 23.94l-5.64-9.98v9.98h-4.48V4h4.48l5.64 9.98V4h4.48v19.94h-4.48z" />
      <path d="M16.9 0a2.24 2.24 0 100 4.48 2.24 2.24 0 000-4.48z" />
    </svg>
  );
}
