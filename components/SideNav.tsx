'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Book, GraduationCap, Home, Users, Youtube } from 'lucide-react';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Subjects', href: '/subjects', icon: Book },
  { name: 'Playlists', href: '/playlists', icon: Youtube },
  { name: 'About', href: '/about', icon: Users },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full flex-col gap-4">
        <div className="flex h-[60px] items-center border-b border-border/40 px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-6 w-6" />
            <span className="gradient-text text-lg">BtechNode</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = item.href === '/' 
              ? pathname === '/'
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="indicator"
                    className="absolute inset-0 rounded-lg bg-accent/50 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="gradient-border mx-3 mb-6 p-4">
          <div className="rounded-lg p-3">
            <h4 className="font-medium">Need Help?</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Check our documentation or contact support
            </p>
            <Link
              href="/docs"
              className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              View Documentation
              <svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
