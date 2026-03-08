'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, FolderTree, Users, Clock } from 'lucide-react';
import * as planningService from '@/lib/planningSimple';

interface PlanningCardProps {
  planning: planningService.Planning;
  type: 'in-progress' | 'upcoming' | 'past' | 'completed';
  onClick: () => void;
  formatWeeks: (weeks: string[]) => string;
}

export function PlanningCard({ planning, type, onClick, formatWeeks }: PlanningCardProps) {
  const today = new Date();
  const firstWeekDate = new Date(planning.weeks[0]);
  const daysUntilStart = Math.ceil((firstWeekDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const lastWeekDate = new Date(planning.weeks[planning.weeks.length - 1]);
  const daysLate = Math.ceil((today.getTime() - lastWeekDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const getCardStyle = () => {
    switch(type) {
      case 'in-progress':
        return 'border-l-4 border-l-blue-500 bg-blue-50/20 hover:bg-blue-50/40';
      case 'upcoming':
        return 'border-l-4 border-l-green-500 bg-green-50/20 hover:bg-green-50/40';
      case 'past':
        return 'border-l-4 border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/40';
      case 'completed':
        return 'border-l-4 border-l-gray-400 bg-gray-50/20 hover:bg-gray-50/40';
      default:
        return '';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${getCardStyle()}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="font-semibold">{planning.name}</h4>
              
              <Badge className={
                type === 'in-progress' ? 'bg-blue-500' :
                type === 'upcoming' ? 'bg-green-500' :
                type === 'past' ? 'bg-amber-500' :
                'bg-gray-500'
              }>
                {type === 'in-progress' ? 'En marcha' :
                 type === 'upcoming' ? 'Próximo' :
                 type === 'past' ? 'Pendiente' :
                 'Completado'}
              </Badge>
              
              {type === 'upcoming' && daysUntilStart > 0 && daysUntilStart <= 7 && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  ¡Esta semana!
                </Badge>
              )}
              {type === 'upcoming' && daysUntilStart > 7 && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  En {daysUntilStart} días
                </Badge>
              )}
              {type === 'past' && (
                <Badge variant="destructive" className="text-xs">
                  {daysLate} {daysLate === 1 ? 'día' : 'días'} de retraso
                </Badge>
              )}
            </div>
            
            {planning.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                {planning.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              <span>{formatWeeks(planning.weeks)}</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <FolderTree className="h-3 w-3" />
                {planning.modules.length} módulos
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {new Set(planning.modules.flatMap(m => m.assignedUsers)).size} participantes
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {planning.modules.reduce((acc, m) => acc + m.estimatedHours, 0)}h
              </span>
            </div>
            
            {(type === 'in-progress' || type === 'past') && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span>Progreso</span>
                  <span>
                    {planning.modules.filter(m => m.status === 'completado').length}/
                    {planning.modules.length} módulos
                  </span>
                </div>
                <Progress 
                  value={planning.modules.length > 0 
                    ? (planning.modules.filter(m => m.status === 'completado').length / planning.modules.length) * 100 
                    : 0
                  } 
                  className={`h-1.5 ${
                    type === 'past' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}