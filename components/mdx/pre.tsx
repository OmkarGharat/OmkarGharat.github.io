'use client';

import { type ComponentProps, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pre({
  children,
  className,
  ...props
}: ComponentProps<'pre'>) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!ref.current) return;
    
    // Get text content from the code block (usually inside a code tag)
    const text = ref.current.textContent || '';
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy keys: ', err);
    }
  };

  return (
    <div className="relative group">
      <pre
        ref={ref}
        className={cn('overflow-x-auto p-4 rounded-lg border bg-muted/50 my-4', className)}
        {...props}
      >
        {children}
      </pre>
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background border opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
