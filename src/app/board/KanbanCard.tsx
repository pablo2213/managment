'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities'; 
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GripVertical, Clock, AlertTriangle } from 'lucide-react';
import { Module } from '@/lib/data';
import { getDelayDays, formatDelay } from '@/lib/utils';

interface KanbanCardProps {
  module: Module;
  actualHours?: number;  // Nueva prop opcional
  onClick?: () => void;
}

export function KanbanCard({ module, actualHours = module.actualHours, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const delayDays = getDelayDays(module.endDate, module.progress);
  const isDelayed = delayDays > 0 && module.status !== 'completed';
  
  const hourDeviation = module.estimatedHours > 0 
    ? Math.round((actualHours / module.estimatedHours) * 100) 
    : 0;
  const isOverBudget = actualHours > module.estimatedHours;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="mb-3"
    >
      <Card 
        className={`cursor-pointer hover:shadow-md transition-all ${
          isDelayed ? 'border-l-4 border-l-red-500' : 
          module.status === 'completed' ? 'border-l-4 border-l-green-500' : 
          'border-l-4 border-l-blue-500'
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
              {/* NOMBRE del módulo */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold line-clamp-2">{module.name}</p>
                {isDelayed && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1 ml-2">
                    <AlertTriangle className="h-3 w-3" />
                    {formatDelay(delayDays)}
                  </Badge>
                )}
              </div>

              {/* DESCRIPCIÓN del módulo */}
              {module.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {module.description}
                </p>
              )}

              {/* HORAS: Estimadas vs Reales */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">Horas:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Est:</span>
                  <span className="font-medium">{module.estimatedHours}h</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">Real:</span>
                  <span className={isOverBudget ? 'text-red-500 font-medium' : 'font-medium'}>
                    {actualHours}h
                  </span>
                </div>
              </div>

              {/* PORCENTAJE DE AVANCE */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Avance:</span>
                  <span className={isDelayed ? 'text-red-500 font-medium' : 'font-medium'}>
                    {module.progress}%
                  </span>
                </div>
                <Progress 
                  value={module.progress} 
                  className={`h-1.5 ${isDelayed ? 'bg-red-100' : ''}`} 
                />
              </div>

              {/* Eficiencia */}
              {module.estimatedHours > 0 && (
                <div className="mt-2 text-[10px] text-muted-foreground flex justify-end">
                  {hourDeviation <= 100 ? (
                    <span className="text-green-500">✓ {actualHours}h de {module.estimatedHours}h</span>
                  ) : (
                    <span className="text-red-500">⚠️ {actualHours}h de {module.estimatedHours}h</span>
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