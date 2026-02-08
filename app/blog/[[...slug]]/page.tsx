import { getPageImage, blogSource } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = blogSource.getPage(params.slug) as any;
  
  if (!page) notFound();

  const MDX = page.data.body;

  if (params.slug === undefined || params.slug.length === 0) {
      const posts = [...blogSource.getPages()].sort((a, b) => {
          if (!a.data.date || !b.data.date) return 0;
          return new Date(b.data.date as string).getTime() - new Date(a.data.date as string).getTime();
      });

      const { PostList } = await import('@/components/blog/post-list'); // Dynamic import to avoid server/client issues if needed, or simple import if compatible

      return (
          <DocsPage toc={page.data.toc} full={page.data.full}>
              <DocsTitle>{page.data.title}</DocsTitle>
              <DocsDescription>{page.data.description}</DocsDescription>
              <DocsBody>
                <MDX />
                <div className="mt-8">
                    <PostList posts={posts.map(post => ({
                        url: post.url,
                        data: {
                            title: post.data.title || 'Untitled',
                            description: post.data.description,
                            date: post.data.date ? new Date(post.data.date).toISOString() : undefined // Ensure date is string
                        }
                    }))} /> 
                </div>
              </DocsBody>
          </DocsPage>
      );
  }


  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(blogSource, page),
          })}
        />
        {page.file && (
            <div className="mt-8 pt-8 border-t">
                <a 
                    href={`https://github.com/OmkarGharat/OmkarGharat.github.io/blob/main/content/blog/${page.file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit this page on GitHub
                </a>
            </div>
        )}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params = blogSource.generateParams();
  if (!params.some((param) => param.slug.length === 0)) {
    params.push({
      slug: [],
      lang: ''
    });
  }
  return params;
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const params = await props.params;
  const page = blogSource.getPage(params.slug);
  
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
