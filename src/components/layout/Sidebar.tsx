'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Columns3, 
  GanttChart, 
  BarChart3,
  Calendar,
  User,
  ClipboardList,
  Sparkles
} from 'lucide-react';

const routes = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tablero', href: '/board', icon: Columns3 },
  { name: 'Gantt', href: '/gantt', icon: GanttChart },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { 
    name: 'Planning', 
    href: '/planning', 
    icon: Calendar,
    description: 'Planificación semanal'
  },
  { 
    name: 'Mis Tareas', 
    href: '/user', 
    icon: ClipboardList,
    description: 'Todas mis tareas (planificadas y extras)'
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-border h-screen fixed left-0 top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">PM Pro</h1>
        <p className="text-xs text-muted-foreground mt-1">Gestión de Proyectos</p>
      </div>
      
      <nav className="flex-1 space-y-1 px-3">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors relative group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              <Icon className={cn(
                "h-4 w-4",
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              )} />
              <span>{route.name}</span>
              
              {/* Tooltip con descripción (opcional) */}
              {route.description && !isActive && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                  {route.description}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer con información del usuario (temporal) */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Ana García</span>
          <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">dev</span>
        </div>
      </div>
    </div>
  );
}