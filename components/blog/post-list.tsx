'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils'; // Assuming this util exists, or I will use standard date formatting

interface Post {
    url: string;
    data: {
        title: string;
        description?: string;
        date?: string | Date; // Adjust based on actual data type
    };
}

export function PostList({ posts }: { posts: Post[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                {currentPosts.map((post) => (
                    <Link
                        key={post.url}
                        href={post.url}
                        className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h3 className="text-xl font-semibold">{post.data.title}</h3>
                        {post.data.description && (
                            <p className="text-muted-foreground">{post.data.description}</p>
                        )}
                        {post.data.date && (
                             <p className="text-sm text-muted-foreground">
                                {new Date(post.data.date).toLocaleDateString()}
                            </p>
                        )}
                    </Link>
                ))}
            </div>

            {posts.length > postsPerPage && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {Math.ceil(posts.length / postsPerPage)}
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(posts.length / postsPerPage)}
                        className="px-4 py-2 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
