import { source, blogSource } from '@/lib/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

export const dynamic = 'force-static';
export const revalidate = false;

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: [
    ...source.getPages().map((page) => ({
      title: page.data.title || page.url,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
    ...blogSource.getPages().map((page) => ({
      title: page.data.title || page.url,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
  ],
});
