import { cookies } from 'next/headers';
import Link from 'next/link';

export async function NavLinks() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

  if (!isLoggedIn) {
      return (
          <Link href="/login" className="text-sm font-medium hover:text-foreground transition-colors">
            Login
          </Link>
      );
  }

  return (
    <div className="flex gap-4 items-center">
        <Link href="/create" className="text-sm font-medium hover:text-foreground transition-colors">
            Create
        </Link>
        <Link href="/dashboard" className="text-sm font-medium hover:text-foreground transition-colors">
            Dashboard
        </Link>
        {/* We can add a Logout button here too if needed, but for now just showing admin links */}
    </div>
  );
}
