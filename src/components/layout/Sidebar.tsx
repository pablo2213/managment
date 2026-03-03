'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Columns3, GanttChart, BarChart3 } from 'lucide-react';

const routes = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tablero', href: '/board', icon: Columns3 },
  { name: 'Gantt', href: '/gantt', icon: GanttChart },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-border h-screen fixed left-0 top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-6">
        <h1 className="text-xl font-bold">PM Pro</h1>
      </div>
      <nav className="space-y-1 px-3">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname === route.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {route.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}