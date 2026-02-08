import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { NavLinks } from '@/components/admin/nav-links';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Omkar Gharat',
      children: (
         <div className="flex gap-4 items-center ml-6">
             <NavLinks />
         </div>
      )
    },
    links: [
        {
            text: 'Blog',
            url: '/blog',
            active: 'nested-url',
        }
    ]
  };
}
