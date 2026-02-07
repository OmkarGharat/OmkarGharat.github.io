import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4">
      <h1 className="text-4xl font-bold mb-4">Omkar's Digital Garden</h1>
      <p className="text-lg text-muted-foreground">
        A wiki-style blog documenting my learning journey, technical notes, and projects.
      </p>
      <div className="flex justify-center gap-4 mt-4">
        <Link href="/docs" className="font-semibold underline">
          Documentation
        </Link>
        <Link href="/blog" className="font-semibold underline">
          Blog
        </Link>
      </div>
    </div>
  );
}
