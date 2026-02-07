import { DocsLayout as NotebookLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { blogSource } from '@/lib/source';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <NotebookLayout tree={blogSource.pageTree} {...baseOptions()}>
        {children}
    </NotebookLayout>
  );
}
