'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'; 
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  GripVertical, Calendar, Clock, AlertTriangle, 
  Building2, Star, Users, User 
} from 'lucide-react';
import { Module, Task, users, areas } from '@/lib/data';
import { getDelayDays, formatDelay } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface KanbanCardProps {
  module: Module;
  tasks?: Task[];
  onClick?: () => void;
  currentUserId?: string;
}

export function KanbanCard({ module, tasks = [], onClick, currentUserId }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // ============================================
  // CÁLCULO DE HORAS DESDE TAREAS
  // ============================================
  const moduleTasks = tasks.filter(t => t.moduleId === module.id);
  
  const estimatedHours = moduleTasks.reduce((acc, t) => acc + t.estimatedHours, 0);
  const actualHours = moduleTasks.reduce((acc, t) => {
    if (t.timeEntries && t.timeEntries.length > 0) {
      return acc + t.timeEntries.reduce((sum, e) => sum + e.hours, 0);
    }
    return acc + (t.actualHours || 0);
  }, 0);

  // ============================================
  // CÁLCULO DE DESVIACIÓN (mover aquí antes de usarlo)
  // ============================================
  const hourDeviation = estimatedHours > 0
    ? Math.round((actualHours / estimatedHours) * 100)
    : 0;
  const isOverBudget = actualHours > estimatedHours;

  // ============================================
  // CÁLCULO DE ESTADO COMBINADO
  // ============================================
  const today = new Date();
  const startDate = new Date(module.startDate);
  const endDate = new Date(module.endDate);
  
  // Obtener datos del área y líder
  const area = module.areaId ? areas.find(a => a.id === module.areaId) : null;
  const leadUser = module.leadId ? users.find(u => u.id === module.leadId) : null;
  const assignedUsers = module.assignedUsers 
    ? users.filter(u => module.assignedUsers?.includes(u.id))
    : [];
  
  // Verificar si el usuario actual está asignado a este módulo
  const isAssignedToMe = currentUserId && module.assignedUsers?.includes(currentUserId);
  const isLeadForMe = currentUserId && module.leadId === currentUserId;

  // Determinar estado basado en columna + fechas + progreso
  const getModuleState = () => {
    // Caso 1: Completado
    if (module.status === 'completed' || module.column === 'done') {
      return {
        borderColor: 'border-l-green-500',
        badge: <Badge variant="default" className="bg-green-500 text-white text-xs">Completado</Badge>,
        textColor: 'text-green-500'
      };
    }

    // Caso 2: Bloqueado (independientemente de fechas)
    if (module.status === 'blocked' || module.column === 'blocked') {
      return {
        borderColor: 'border-l-red-700',
        badge: <Badge variant="destructive" className="text-xs">Bloqueado</Badge>,
        textColor: 'text-red-700'
      };
    }

    // Caso 3: En columna "Por hacer" (todo)
    if (module.column === 'todo') {
      // Si la fecha de inicio ya pasó y no ha empezado
      if (today > startDate && module.progress === 0) {
        return {
          borderColor: 'border-l-red-500',
          badge: <Badge variant="destructive" className="text-xs">Retrasado en inicio</Badge>,
          textColor: 'text-red-500'
        };
      }
      // Si la fecha es futura
      if (today < startDate) {
        return {
          borderColor: 'border-l-gray-400',
          badge: <Badge variant="outline" className="text-gray-500 text-xs border-gray-300">Planificado</Badge>,
          textColor: 'text-gray-500'
        };
      }
      // En fecha pero sin empezar
      return {
        borderColor: 'border-l-yellow-500',
        badge: <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 text-xs">Pendiente</Badge>,
        textColor: 'text-yellow-500'
      };
    }

    // Caso 4: En progreso (doing)
    if (module.column === 'doing') {
      // Si ya pasó la fecha de fin y no está completo
      if (today > endDate && module.progress < 100) {
        const delayDays = getDelayDays(module.endDate, module.progress);
        return {
          borderColor: 'border-l-red-500',
          badge: (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {formatDelay(delayDays)}
            </Badge>
          ),
          textColor: 'text-red-500'
        };
      }
      // En progreso normal
      return {
        borderColor: 'border-l-blue-500',
        badge: <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs">En progreso</Badge>,
        textColor: 'text-blue-500'
      };
    }

    // Caso por defecto
    return {
      borderColor: 'border-l-gray-300',
      badge: null,
      textColor: 'text-gray-500'
    };
  };

  const state = getModuleState();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="mb-3 relative group"
    >
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${state.borderColor} ${
          isAssignedToMe ? 'ring-1 ring-primary/30' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            {/* Zona de agarre para drag */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Cabecera con nombre y badges */}
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="text-sm font-semibold line-clamp-2">{module.name}</p>
                  {isLeadForMe && (
                    <Badge variant="default" className="bg-yellow-500 text-[8px] px-1 h-4">
                      Líder
                    </Badge>
                  )}
                  {isAssignedToMe && !isLeadForMe && (
                    <Badge variant="default" className="bg-primary text-[8px] px-1 h-4">
                      Miembro
                    </Badge>
                  )}
                </div>
                {state.badge}
              </div>

              {/* Descripción */}
              {module.description && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {module.description}
                </p>
              )}

              {/* Área y Líder */}
              <div className="flex items-center gap-3 text-xs mb-2">
                {area && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: area.color }}
                          />
                          <span className="text-muted-foreground text-[10px]">{area.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{area.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {leadUser && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-muted-foreground text-[10px]">{leadUser.name.split(' ')[0]}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Líder: {leadUser.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Equipo asignado (avatares compactos) */}
              {assignedUsers.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {assignedUsers.slice(0, 3).map(user => (
                      <TooltipProvider key={user.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-5 w-5 border-2 border-background">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-[8px]">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.name} - {user.role}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {assignedUsers.length > 3 && (
                      <Badge variant="outline" className="h-5 px-1 text-[8px]">
                        +{assignedUsers.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Fechas del módulo */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(module.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(module.endDate).toLocaleDateString()}
                </span>
              </div>

              {/* Horas */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">Horas:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Est:</span>
                  <span className="font-medium">{estimatedHours}h</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">Real:</span>
                  <span className={isOverBudget ? 'text-red-500 font-medium' : 'font-medium'}>
                    {actualHours}h
                  </span>
                </div>
              </div>

              {/* Progreso */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Avance:</span>
                  <span className={state.textColor === 'text-red-500' ? 'text-red-500 font-medium' : 'font-medium'}>
                    {module.progress}%
                  </span>
                </div>
                <Progress 
                  value={module.progress} 
                  className={`h-1.5 ${state.textColor === 'text-red-500' ? 'bg-red-100' : ''}`} 
                />
              </div>

              {/* Eficiencia - AHORA hourDeviation SÍ ESTÁ DEFINIDO */}
              {estimatedHours > 0 && (
                <div className="mt-2 text-[10px] text-muted-foreground flex justify-end">
                  {hourDeviation <= 100 ? (
                    <span className="text-green-500">✓ {actualHours}h de {estimatedHours}h</span>
                  ) : (
                    <span className="text-red-500">⚠️ {actualHours}h de {estimatedHours}h</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}